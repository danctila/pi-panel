import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { DeploymentResponse, FrontendSite, BackendService, DockerContainer } from '../types';
import { extractZip, cleanDirectory } from '../utils/archive';
import { DEPLOY_PATHS, ensureDirectory, copyFiles, fileExists, generatePort } from '../utils/deployment';
import { PM2Service } from '../services/pm2';
import { DockerService } from '../services/docker';
import { NginxService } from '../services/nginx';
import { CloudflareTunnelService } from '../services/tunnel';
import { getSystemInfo } from '../utils/command';

const execAsync = promisify(exec);

// Services
const pm2Service = new PM2Service();
const dockerService = new DockerService();
const nginxService = new NginxService();
const tunnelService = new CloudflareTunnelService();

/**
 * Map PM2 status to our status format
 */
const mapStatus = (pm2Status: string): 'running' | 'stopped' | 'error' => {
  if (pm2Status === 'online') return 'running';
  if (pm2Status === 'stopping' || pm2Status === 'stopped') return 'stopped';
  return 'error';
};

/**
 * Deploy a static site from an uploaded zip file
 */
export const deployStaticSite = async (req: Request, res: Response): Promise<void> => {
  const { siteName, domain, extractPath, zipFilePath } = req.body;

  if (!siteName || !domain || !extractPath) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: siteName, domain, extractPath'
    } as DeploymentResponse);
    return;
  }

  try {
    console.log(`🚀 Starting deployment of static site: ${siteName} at ${domain}`);
    
    // Get system info for debugging
    console.log(`🔍 System check for deployment:`);
    await getSystemInfo();
    
    // Verify the extracted files exist
    if (!fs.existsSync(extractPath)) {
      throw new Error(`Extracted files not found at: ${extractPath}`);
    }
    
    console.log(`📂 Extract path contents:`);
    try {
      const extractedItems = fs.readdirSync(extractPath);
      console.log(`   Items (${extractedItems.length}):`, extractedItems);
    } catch (listError) {
      console.warn(`   ⚠️ Could not list extract path:`, listError);
    }
    
    // Target path on the Pi where this site will be deployed
    const targetPath = path.join(DEPLOY_PATHS.STATIC, domain);
    
    console.log(`📁 Deploying files to: ${targetPath}`);
    
    // Create target directory and copy files
    await ensureDirectory(targetPath, 'www-data:www-data');
    await copyFiles(extractPath, targetPath, 'www-data:www-data');
    
    // Ensure index.html exists
    const indexPath = path.join(targetPath, 'index.html');
    const indexExists = await fileExists(indexPath);
    
    if (!indexExists) {
      console.warn('⚠️ No index.html found, creating a basic one');
      const basicHtml = `<!DOCTYPE html>
<html>
<head><title>${siteName}</title></head>
<body><h1>Welcome to ${siteName}</h1><p>Site deployed successfully!</p></body>
</html>`;
      await execAsync(`sudo bash -c 'echo "${basicHtml}" > "${indexPath}"'`);
      await execAsync(`sudo chown www-data:www-data "${indexPath}"`);
    }
    
    console.log(`⚙️ Creating nginx configuration...`);
    
    // Create nginx config
    const configPath = await nginxService.createStaticSiteConfig(domain, targetPath);
    
    // Deploy nginx config to the server
    await nginxService.deployConfigToServer(configPath, domain);
    
    console.log(`🌐 Adding Cloudflare tunnel route...`);
    
    // Configure Cloudflare Tunnel
    console.log('🌐 Adding Cloudflare tunnel route...');
    let tunnelConfigured = false;
    let tunnelError: string | undefined;
    try {
      await tunnelService.addRoute(domain, 'http://localhost:80');
      await tunnelService.deployConfigToPi();
      console.log(`✅ Cloudflare tunnel configured for ${domain}`);
      
      // Restart tunnel to apply configuration
      console.log('🔄 Restarting Cloudflare tunnel to apply new config...');
      await tunnelService.restartTunnel();
      console.log('✅ Cloudflare tunnel restarted successfully');
      
      tunnelConfigured = true;
    } catch (error: any) {
      tunnelError = error.message;
      console.error(`⚠️ Cloudflare tunnel configuration failed:`, error.message);
      console.log('⚠️ Continuing deployment - tunnel can be configured manually later');
      tunnelConfigured = false;
    }
    
    // Return the deployment details
    const frontendSite: FrontendSite = {
      id: uuidv4(),
      name: siteName,
      domain,
      path: targetPath,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`✅ Static site ${siteName} deployed successfully at ${domain}`);
    
    res.status(200).json({
      success: true,
      message: `Static site ${siteName} deployed successfully at ${domain}`,
      service: frontendSite,
      details: {
        targetPath,
        configPath,
        nginxDeployed: true,
        tunnelConfigured,
        tunnelError
      }
    } as DeploymentResponse);
  } catch (error: any) {
    console.error(`❌ Failed to deploy static site ${siteName}:`, error.message);
    
    res.status(500).json({
      success: false,
      message: `Failed to deploy static site ${siteName}`,
      error: error.message
    } as DeploymentResponse);
  }
};

/**
 * Deploy a backend service from an uploaded zip file
 */
export const deployBackendService = async (req: Request, res: Response): Promise<void> => {
  const { serviceName, domain, extractPath, port, type = 'nodejs' } = req.body;

  if (!serviceName || !domain || !extractPath) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: serviceName, domain, extractPath'
    } as DeploymentResponse);
    return;
  }

  try {
    console.log(`🚀 Starting deployment of backend service: ${serviceName} at ${domain}`);
    
    // Verify the extracted files exist
    if (!fs.existsSync(extractPath)) {
      throw new Error(`Extracted files not found at: ${extractPath}`);
    }
    
    // Target path on the Pi where this service will be deployed
    const targetPath = path.join(DEPLOY_PATHS.BACKEND, serviceName);
    
    // Port to use for the service
    const servicePort = port || generatePort();
    
    console.log(`📁 Deploying backend to: ${targetPath} on port ${servicePort}`);
    
    // Create target directory and copy files
    await ensureDirectory(targetPath);
    await copyFiles(extractPath, targetPath);
    
    // For Node.js services, install dependencies and start with PM2
    let pid = 0;
    let status: 'stopped' | 'running' | 'error' = 'stopped';
    
    if (type === 'nodejs') {
      console.log(`📦 Installing Node.js dependencies...`);
      
      // Check if package.json exists
      const packageJsonPath = path.join(targetPath, 'package.json');
      const packageExists = await fileExists(packageJsonPath);
      
      if (packageExists) {
        // Install dependencies
        await execAsync(`cd "${targetPath}" && sudo -u pi npm install`);
      }
      
      console.log(`🚀 Starting service with PM2...`);
      
      // Start with PM2
      const result = await pm2Service.startApplication(targetPath, serviceName, servicePort);
      pid = result.pid;
      status = mapStatus(result.status);
    }
    
    console.log(`⚙️ Creating nginx reverse proxy configuration...`);
    
    // Create nginx config for reverse proxy
    const configPath = await nginxService.createBackendConfig(domain, servicePort);
    
    // Deploy nginx config to the server
    await nginxService.deployConfigToServer(configPath, domain);
    
    console.log(`🌐 Adding Cloudflare tunnel route...`);
    
    // Configure Cloudflare Tunnel
    console.log('🌐 Adding Cloudflare tunnel route...');
    let tunnelConfigured = false;
    let tunnelError: string | undefined;
    try {
      await tunnelService.addRoute(domain, `http://localhost:${servicePort}`);
      await tunnelService.deployConfigToPi();
      console.log(`✅ Cloudflare tunnel configured for ${domain}`);
      
      // Restart tunnel to apply configuration
      console.log('🔄 Restarting Cloudflare tunnel to apply new config...');
      await tunnelService.restartTunnel();
      console.log('✅ Cloudflare tunnel restarted successfully');
      
      tunnelConfigured = true;
    } catch (error: any) {
      tunnelError = error.message;
      console.error(`⚠️ Cloudflare tunnel configuration failed:`, error.message);
      console.log('⚠️ Continuing deployment - tunnel can be configured manually later');
      tunnelConfigured = false;
    }
    
    // Return the deployment details
    const backendService: BackendService = {
      id: uuidv4(),
      name: serviceName,
      domain,
      path: targetPath,
      port: servicePort,
      type,
      status,
      pid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`✅ Backend service ${serviceName} deployed successfully at ${domain}:${servicePort}`);
    
    res.status(200).json({
      success: true,
      message: `Backend service ${serviceName} deployed successfully at ${domain}`,
      service: backendService,
      details: {
        targetPath,
        configPath,
        port: servicePort,
        nginxDeployed: true,
        tunnelConfigured,
        pm2Started: type === 'nodejs'
      }
    } as DeploymentResponse);
  } catch (error: any) {
    console.error(`❌ Failed to deploy backend service ${serviceName}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy backend service',
      error: error.message
    } as DeploymentResponse);
  }
};

/**
 * Deploy a Docker container from an uploaded zip file
 */
export const deployDockerContainer = async (req: Request, res: Response): Promise<void> => {
  const { containerName, domain, extractPath, port } = req.body;

  if (!containerName || !domain || !extractPath) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: containerName, domain, extractPath'
    } as DeploymentResponse);
    return;
  }

  try {
    console.log(`🚀 Starting deployment of Docker container: ${containerName} at ${domain}`);
    
    // Verify the extracted files exist
    if (!fs.existsSync(extractPath)) {
      throw new Error(`Extracted files not found at: ${extractPath}`);
    }
    
    // Target path on the Pi where this container will be deployed
    const targetPath = path.join(DEPLOY_PATHS.DOCKER, containerName);
    
    // Port to use for the container
    const containerPort = port || 8000 + Math.floor(Math.random() * 1000);
    
    console.log(`📁 Deploying Docker files to: ${targetPath} on port ${containerPort}`);
    
    // Create target directory
    await execAsync(`sudo mkdir -p "${targetPath}"`);
    
    // Copy files from extract path to target path
    await execAsync(`sudo cp -r "${extractPath}"/* "${targetPath}"/`);
    
    // Set proper ownership and permissions
    await execAsync(`sudo chown -R pi:docker "${targetPath}"`);
    await execAsync(`sudo chmod -R 755 "${targetPath}"`);
    
    console.log(`🐳 Building and running Docker container...`);
    
    // Build and run the container
    const containerInfo = await dockerService.buildAndRunContainer(
      targetPath, // Use the target path instead of extract path
      containerName, 
      containerPort
    );
    
    console.log(`⚙️ Creating nginx reverse proxy configuration...`);
    
    // Create nginx config for reverse proxy
    const configPath = await nginxService.createBackendConfig(domain, containerPort);
    
    // Deploy nginx config to the server
    await nginxService.deployConfigToServer(configPath, domain);
    
    console.log(`🌐 Adding Cloudflare tunnel route...`);
    
    // Configure Cloudflare Tunnel
    console.log('🌐 Adding Cloudflare tunnel route...');
    let tunnelConfigured = false;
    let tunnelError: string | undefined;
    try {
      await tunnelService.addRoute(domain, `http://localhost:${containerPort}`);
      await tunnelService.deployConfigToPi();
      console.log(`✅ Cloudflare tunnel configured for ${domain}`);
      
      // Restart tunnel to apply configuration
      console.log('🔄 Restarting Cloudflare tunnel to apply new config...');
      await tunnelService.restartTunnel();
      console.log('✅ Cloudflare tunnel restarted successfully');
      
      tunnelConfigured = true;
    } catch (error: any) {
      tunnelError = error.message;
      console.error(`⚠️ Cloudflare tunnel configuration failed:`, error.message);
      console.log('⚠️ Continuing deployment - tunnel can be configured manually later');
      tunnelConfigured = false;
    }
    
    // Update container with domain info
    containerInfo.domain = domain;
    containerInfo.path = targetPath;
    
    console.log(`✅ Docker container ${containerName} deployed successfully at ${domain}`);
    
    res.status(200).json({
      success: true,
      message: `Docker container ${containerName} deployed successfully at ${domain}`,
      service: containerInfo,
      details: {
        targetPath,
        containerPort,
        configPath,
        nginxDeployed: true,
        tunnelConfigured,
        dockerStarted: true
      }
    } as DeploymentResponse);
  } catch (error: any) {
    console.error(`❌ Failed to deploy Docker container ${containerName}:`, error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to deploy Docker container',
      error: error.message
    } as DeploymentResponse);
  }
}; 
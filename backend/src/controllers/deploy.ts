import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { DeploymentResponse, FrontendSite, BackendService, DockerContainer } from '../types';
import { extractZip, cleanDirectory } from '../utils/archive';
import { PM2Service } from '../services/pm2';
import { DockerService } from '../services/docker';
import { NginxService } from '../services/nginx';
import { CloudflareTunnelService } from '../services/tunnel';

// Services
const pm2Service = new PM2Service();
const dockerService = new DockerService();
const nginxService = new NginxService();
const tunnelService = new CloudflareTunnelService();

// Base paths where services will be deployed on the Raspberry Pi
const DEPLOY_PATHS = {
  STATIC: '/var/www', // For frontend static sites
  BACKEND: '/opt/backends', // For backend services 
  DOCKER: '/opt/containers' // For docker containers
};

/**
 * Deploy a static site from an uploaded zip file
 */
export const deployStaticSite = async (req: Request, res: Response): Promise<void> => {
  const { siteName, domain, extractPath } = req.body;

  if (!siteName || !domain || !extractPath) {
    res.status(400).json({
      success: false,
      message: 'Missing required fields: siteName, domain, extractPath'
    } as DeploymentResponse);
    return;
  }

  try {
    // Target path on the Pi where this site will be deployed
    const targetPath = path.join(DEPLOY_PATHS.STATIC, domain);
    
    // Create nginx config
    const configPath = await nginxService.createStaticSiteConfig(domain, targetPath);
    
    // Add route to Cloudflare Tunnel
    // In production, this would point to the nginx server
    await tunnelService.addRoute(domain, `http://localhost:80`);
    
    // Return the deployment details
    // Note: In production, these files would be moved to the Pi
    // and the nginx config would be deployed and reloaded
    const frontendSite: FrontendSite = {
      id: uuidv4(),
      name: siteName,
      domain,
      path: targetPath,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(200).json({
      success: true,
      message: `Static site ${siteName} deployed successfully at ${domain}`,
      service: frontendSite
    } as DeploymentResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to deploy static site',
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
    // Target path on the Pi where this service will be deployed
    const targetPath = path.join(DEPLOY_PATHS.BACKEND, serviceName);
    
    // Port to use for the service
    const servicePort = port || 3000 + Math.floor(Math.random() * 1000);
    
    // For Node.js services, start with PM2
    let pid = 0;
    let status = 'stopped';
    
    if (type === 'nodejs') {
      // In production, this would start the service on the Pi
      const result = await pm2Service.startApplication(targetPath, serviceName, servicePort);
      pid = result.pid;
      status = result.status;
    }
    
    // Create nginx config for reverse proxy
    const configPath = await nginxService.createBackendConfig(domain, servicePort);
    
    // Add route to Cloudflare Tunnel
    await tunnelService.addRoute(domain, `http://localhost:${servicePort}`);
    
    // Return the deployment details
    const backendService: BackendService = {
      id: uuidv4(),
      name: serviceName,
      type: type as any,
      domain,
      port: servicePort,
      path: targetPath,
      status: status as any,
      pid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(200).json({
      success: true,
      message: `Backend service ${serviceName} deployed successfully at ${domain}`,
      service: backendService
    } as DeploymentResponse);
  } catch (error: any) {
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
    // Target path on the Pi where this container will be deployed
    const targetPath = path.join(DEPLOY_PATHS.DOCKER, containerName);
    
    // Port to use for the container
    const containerPort = port || 8000 + Math.floor(Math.random() * 1000);
    
    // In production, this would build and run the container on the Pi
    const containerInfo = await dockerService.buildAndRunContainer(
      extractPath, 
      containerName, 
      containerPort
    );
    
    // Create nginx config for reverse proxy
    const configPath = await nginxService.createBackendConfig(domain, containerPort);
    
    // Add route to Cloudflare Tunnel
    await tunnelService.addRoute(domain, `http://localhost:${containerPort}`);
    
    // Update container with domain info
    containerInfo.domain = domain;
    
    res.status(200).json({
      success: true,
      message: `Docker container ${containerName} deployed successfully at ${domain}`,
      service: containerInfo
    } as DeploymentResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to deploy Docker container',
      error: error.message
    } as DeploymentResponse);
  }
}; 
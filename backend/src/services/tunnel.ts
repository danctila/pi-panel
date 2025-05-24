import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { TunnelConfig } from '../types';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Service to manage Cloudflare Tunnel configurations
 */
export class CloudflareTunnelService {
  // Path for tunnel configurations - use the actual cloudflare directory
  private projectConfigPath = '/home/danctil/.cloudflared';
  private projectTunnelConfigFile = path.join(this.projectConfigPath, 'config.yml');
  
  /**
   * Initialize the service and ensure config directory exists
   */
  constructor() {
    this.ensureProjectConfigDir();
  }
  
  /**
   * Get the current tunnel configuration
   */
  async getTunnelConfig(): Promise<any> {
    try {
      // Read from project config file
      let configFileContent = '';
      
      if (fs.existsSync(this.projectTunnelConfigFile)) {
        configFileContent = await readFileAsync(this.projectTunnelConfigFile, 'utf8');
        console.log(`📖 Loaded tunnel config from: ${this.projectTunnelConfigFile}`);
      } else {
        console.log(`📝 No config file found, using default configuration`);
        // Return default structure if no config exists
        return this.getDefaultTunnelConfig();
      }
      
      const config = yaml.load(configFileContent);
      console.log('Loaded tunnel config:', JSON.stringify(config, null, 2));
      return config;
    } catch (error: any) {
      console.error('Failed to load tunnel config:', error.message);
      return this.getDefaultTunnelConfig();
    }
  }
  
  /**
   * Get default tunnel configuration structure
   */
  private getDefaultTunnelConfig(): any {
    return {
      tunnel: 'home-server',
      'credentials-file': '/home/danctil/.cloudflared/home-server.json',
      ingress: [
        {
          hostname: 'admin.totaltechtools.com',
          service: 'http://localhost:80'
        },
        {
          service: 'http_status:404'
        }
      ]
    };
  }
  
  /**
   * Add a new route to the tunnel configuration
   */
  async addRoute(hostname: string, service: string): Promise<boolean> {
    try {
      console.log(`Adding tunnel route: ${hostname} -> ${service}`);
      
      const config = await this.getTunnelConfig();
      
      // Find the ingress array
      const ingress = config.ingress || [];
      
      // Remove any existing entry for this hostname
      const filteredIngress = ingress.filter((entry: any) => entry.hostname !== hostname);
      
      // Add the new entry (before the catchall)
      const catchAll = filteredIngress.pop() || { service: 'http_status:404' };
      filteredIngress.push({
        hostname,
        service
      });
      filteredIngress.push(catchAll);
      
      // Update the config
      config.ingress = filteredIngress;
      
      // Save the updated config
      await this.saveTunnelConfig(config);
      
      console.log(`✅ Successfully added tunnel route for ${hostname}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to add route for ${hostname}:`, error.message);
      throw new Error(`Failed to add route: ${error.message}`);
    }
  }
  
  /**
   * Remove a route from the tunnel configuration
   */
  async removeRoute(hostname: string): Promise<boolean> {
    try {
      console.log(`Removing tunnel route for ${hostname}...`);
      
      const config = await this.getTunnelConfig();
      
      // Find the ingress array
      const ingress = config.ingress || [];
      
      // Remove any existing entry for this hostname
      const filteredIngress = ingress.filter((entry: any) => entry.hostname !== hostname);
      
      // Update the config
      config.ingress = filteredIngress;
      
      // Save the updated config
      await this.saveTunnelConfig(config);
      
      console.log(`✅ Successfully removed tunnel route for ${hostname}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to remove route for ${hostname}:`, error.message);
      throw new Error(`Failed to remove route: ${error.message}`);
    }
  }
  
  /**
   * Save the tunnel configuration to the real cloudflare directory
   */
  private async saveTunnelConfig(config: any): Promise<void> {
    try {
      const yamlString = yaml.dump(config, {
        indent: 2,
        lineWidth: -1
      });
      
      // Save to real cloudflare config location
      await writeFileAsync(this.projectTunnelConfigFile, yamlString);
      console.log(`💾 Saved tunnel config to: ${this.projectTunnelConfigFile}`);
      
      console.log(`ℹ️ Updated real cloudflare tunnel configuration`);
    } catch (error: any) {
      throw new Error(`Failed to save tunnel config: ${error.message}`);
    }
  }
  
  /**
   * Deploy tunnel configuration (manages the real cloudflare config)
   */
  async deployConfigToPi(): Promise<boolean> {
    try {
      console.log('📋 Verifying tunnel config deployment...');
      
      if (!fs.existsSync(this.projectTunnelConfigFile)) {
        throw new Error('No tunnel config file found');
      }
      
      console.log(`✅ Tunnel config updated at: ${this.projectTunnelConfigFile}`);
      console.log(`ℹ️ Managing real cloudflare tunnel configuration`);
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to verify tunnel config:', error.message);
      throw new Error(`Failed to verify tunnel config: ${error.message}`);
    }
  }
  
  /**
   * Get all configured tunnel routes
   */
  async listRoutes(): Promise<TunnelConfig[]> {
    try {
      const config = await this.getTunnelConfig();
      
      // Find the ingress array
      const ingress = config.ingress || [];
      
      // Convert to our model format
      const routes = ingress
        .filter((entry: any) => entry.hostname && entry.service)
        .map((entry: any, index: number) => ({
          id: index.toString(),
          name: entry.hostname,
          domain: entry.hostname,
          service: this.determineServiceType(entry.service),
          serviceId: '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      
      return routes;
    } catch (error: any) {
      console.error('Failed to list tunnel routes:', error.message);
      throw new Error(`Failed to list routes: ${error.message}`);
    }
  }
  
  /**
   * Determine the service type from the service URL
   */
  private determineServiceType(serviceUrl: string): 'frontend' | 'backend' | 'docker' {
    if (serviceUrl.includes(':80')) return 'frontend';
    if (serviceUrl.includes('localhost:')) return 'backend';
    if (serviceUrl.includes('http_status:')) return 'backend'; // Default for catchall
    return 'docker';
  }
  
  /**
   * Get tunnel status
   */
  async getTunnelStatus(): Promise<{ running: boolean; connectorId?: string }> {
    try {
      const { stdout } = await execAsync('cloudflared tunnel info home-server');
      const running = stdout.includes('HEALTHY') || stdout.includes('Connected');
      
      // Extract connector ID if available
      const connectorMatch = stdout.match(/Connector ID:\s*([a-f0-9-]+)/);
      const connectorId = connectorMatch ? connectorMatch[1] : undefined;
      
      return { running, connectorId };
    } catch (error: any) {
      // If command fails, tunnel is likely not running or not configured
      console.log('ℹ️ Tunnel status check failed (likely not running):', error.message);
      return { running: false };
    }
  }
  
  /**
   * Start the Cloudflare Tunnel
   */
  async startTunnel(): Promise<boolean> {
    try {
      console.log('Starting Cloudflare Tunnel...');
      
      // Check if tunnel is already running
      const status = await this.getTunnelStatus();
      if (status.running) {
        console.log('ℹ️ Cloudflare Tunnel is already running');
        return true;
      }
      
      // Start the tunnel in the background
      console.log('🚀 Starting cloudflared tunnel run home-server...');
      await execAsync('nohup cloudflared tunnel run home-server > /tmp/cloudflared.log 2>&1 &');
      
      // Wait a moment for startup
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if it started successfully
      const newStatus = await this.getTunnelStatus();
      if (newStatus.running) {
        console.log('✅ Cloudflare Tunnel started successfully');
        return true;
      } else {
        console.log('⚠️ Tunnel started but not showing as healthy yet (may take a moment)');
        return true; // Still return true as the command executed
      }
    } catch (error: any) {
      console.error('❌ Failed to start tunnel:', error.message);
      throw new Error(`Failed to start tunnel: ${error.message}`);
    }
  }
  
  /**
   * Stop the Cloudflare Tunnel
   */
  async stopTunnel(): Promise<boolean> {
    try {
      console.log('Stopping Cloudflare Tunnel...');
      
      // Check if any cloudflared processes are running first
      try {
        const { stdout } = await execAsync('pgrep -f cloudflared');
        if (stdout.trim()) {
          console.log(`Found running cloudflared processes: ${stdout.trim()}`);
          // Kill any existing cloudflared processes
          await execAsync('sudo pkill -f cloudflared');
          console.log('✅ Stopped running cloudflared processes');
        } else {
          console.log('ℹ️ No cloudflared processes found running');
        }
      } catch (pgrep_error) {
        // pgrep returns exit code 1 if no processes found, which is normal
        console.log('ℹ️ No cloudflared processes found running');
      }
      
      console.log('✅ Cloudflare Tunnel stopped');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to stop tunnel:', error.message);
      throw new Error(`Failed to stop tunnel: ${error.message}`);
    }
  }
  
  /**
   * Restart the Cloudflare Tunnel service
   */
  async restartTunnel(): Promise<boolean> {
    try {
      console.log('Restarting Cloudflare Tunnel...');
      
      // Stop the tunnel first
      await this.stopTunnel();
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Start it again
      await this.startTunnel();
      
      console.log('✅ Cloudflare Tunnel restarted successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to restart tunnel:', error.message);
      throw new Error(`Failed to restart tunnel: ${error.message}`);
    }
  }
  
  /**
   * Ensure the cloudflare config directory exists
   */
  private async ensureProjectConfigDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.projectConfigPath)) {
        await mkdirAsync(this.projectConfigPath, { recursive: true });
        console.log(`Created cloudflare config directory: ${this.projectConfigPath}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to create cloudflare config directory: ${error.message}`);
    }
  }
} 
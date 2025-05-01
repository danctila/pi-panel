import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { TunnelConfig } from '../types';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Service to manage Cloudflare Tunnel configurations
 */
export class CloudflareTunnelService {
  // Path to Cloudflare Tunnel configuration file on the Raspberry Pi
  private tunnelConfigPath = '/etc/cloudflared/config.yml';
  
  // Path for temporary configurations before they're moved to the Pi
  private tempConfigPath = path.join(__dirname, '../../../data/tunnel-config.yml');
  
  /**
   * Get the current tunnel configuration
   */
  async getTunnelConfig(): Promise<any> {
    try {
      // Note: In production, this would read from the actual Pi tunnel config
      // For development, we'll mock with a local file
      const configFileContent = await readFileAsync(this.tempConfigPath, 'utf8');
      return yaml.load(configFileContent);
    } catch (error) {
      // If file doesn't exist, return default structure
      return {
        tunnel: '',
        'credentials-file': '',
        ingress: [
          {
            hostname: '',
            service: ''
          },
          {
            service: 'http_status:404'
          }
        ]
      };
    }
  }
  
  /**
   * Add a new route to the tunnel configuration
   */
  async addRoute(hostname: string, service: string): Promise<boolean> {
    try {
      const config = await this.getTunnelConfig();
      
      // Find the ingress array
      const ingress = config.ingress || [];
      
      // Remove any existing entry for this hostname
      const filteredIngress = ingress.filter((entry: any) => entry.hostname !== hostname);
      
      // Add the new entry (before the catchall)
      const catchAll = filteredIngress.pop(); // Remove the catch-all entry
      filteredIngress.push({
        hostname,
        service
      });
      filteredIngress.push(catchAll); // Add back the catch-all
      
      // Update the config
      config.ingress = filteredIngress;
      
      // Save the updated config
      await this.saveTunnelConfig(config);
      
      // In production, this would reload the tunnel service
      return true;
    } catch (error: any) {
      throw new Error(`Failed to add route: ${error.message}`);
    }
  }
  
  /**
   * Remove a route from the tunnel configuration
   */
  async removeRoute(hostname: string): Promise<boolean> {
    try {
      const config = await this.getTunnelConfig();
      
      // Find the ingress array
      const ingress = config.ingress || [];
      
      // Remove any existing entry for this hostname
      const filteredIngress = ingress.filter((entry: any) => entry.hostname !== hostname);
      
      // Update the config
      config.ingress = filteredIngress;
      
      // Save the updated config
      await this.saveTunnelConfig(config);
      
      // In production, this would reload the tunnel service
      return true;
    } catch (error: any) {
      throw new Error(`Failed to remove route: ${error.message}`);
    }
  }
  
  /**
   * Save the tunnel configuration
   */
  private async saveTunnelConfig(config: any): Promise<void> {
    try {
      const yamlString = yaml.dump(config);
      
      // Save to temporary location for development
      await writeFileAsync(this.tempConfigPath, yamlString);
      
      // In production, this would update the actual Pi config and reload the service
    } catch (error: any) {
      throw new Error(`Failed to save tunnel config: ${error.message}`);
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
      throw new Error(`Failed to list routes: ${error.message}`);
    }
  }
  
  /**
   * Determine the service type from the service URL
   */
  private determineServiceType(serviceUrl: string): 'frontend' | 'backend' | 'docker' {
    if (serviceUrl.includes(':80')) return 'frontend';
    if (serviceUrl.includes('localhost:')) return 'backend';
    return 'docker';
  }
  
  /**
   * Restart the Cloudflare Tunnel service
   */
  async restartTunnel(): Promise<boolean> {
    try {
      // In production, this would restart the cloudflared service on the Pi
      await execAsync('sudo systemctl restart cloudflared');
      return true;
    } catch (error: any) {
      throw new Error(`Failed to restart tunnel: ${error.message}`);
    }
  }
} 
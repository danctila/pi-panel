import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * Service to manage nginx configurations
 */
export class NginxService {
  // Path where nginx configurations are stored on the Raspberry Pi
  private sitesAvailablePath = '/etc/nginx/sites-available';
  private sitesEnabledPath = '/etc/nginx/sites-enabled';
  
  // Path for temporary configurations before they're moved to the Pi
  private tempConfigPath = path.join(__dirname, '../../../nginx-configs');
  
  /**
   * Create a configuration for a static site
   */
  async createStaticSiteConfig(domain: string, rootPath: string): Promise<string> {
    const configContent = `server {
    listen 80;
    server_name ${domain};
    
    root ${rootPath};
    index index.html index.htm;
    
    location / {
        try_files $uri $uri/ =404;
    }
}`;

    // Ensure temp config directory exists
    await this.ensureTempConfigDir();
    
    // Write config to temp location
    const configFileName = `${domain}.conf`;
    const tempConfigFilePath = path.join(this.tempConfigPath, configFileName);
    
    await writeFileAsync(tempConfigFilePath, configContent);
    
    return tempConfigFilePath;
  }
  
  /**
   * Create a configuration for a backend service
   */
  async createBackendConfig(domain: string, port: number): Promise<string> {
    const configContent = `server {
    listen 80;
    server_name ${domain};
    
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}`;

    // Ensure temp config directory exists
    await this.ensureTempConfigDir();
    
    // Write config to temp location
    const configFileName = `${domain}.conf`;
    const tempConfigFilePath = path.join(this.tempConfigPath, configFileName);
    
    await writeFileAsync(tempConfigFilePath, configContent);
    
    return tempConfigFilePath;
  }
  
  /**
   * Deploy a configuration to the Raspberry Pi
   * Note: This will be invoked by the Pi's own scripts
   */
  async deployConfigToServer(configPath: string, domain: string): Promise<boolean> {
    const targetPath = path.join(this.sitesAvailablePath, `${domain}.conf`);
    const symlinkPath = path.join(this.sitesEnabledPath, `${domain}.conf`);
    
    try {
      // Copy config file to sites-available
      await execAsync(`sudo cp "${configPath}" "${targetPath}"`);
      
      // Create symlink in sites-enabled
      await execAsync(`sudo ln -sf "${targetPath}" "${symlinkPath}"`);
      
      // Test and reload nginx
      await this.reloadNginx();
      
      return true;
    } catch (error: any) {
      throw new Error(`Failed to deploy config: ${error.message}`);
    }
  }
  
  /**
   * Remove a configuration for a domain
   */
  async removeConfig(domain: string): Promise<boolean> {
    const availablePath = path.join(this.sitesAvailablePath, `${domain}.conf`);
    const enabledPath = path.join(this.sitesEnabledPath, `${domain}.conf`);
    
    try {
      // Remove from sites-enabled
      await execAsync(`sudo rm -f "${enabledPath}"`);
      
      // Remove from sites-available
      await execAsync(`sudo rm -f "${availablePath}"`);
      
      // Reload nginx
      await this.reloadNginx();
      
      return true;
    } catch (error: any) {
      throw new Error(`Failed to remove config: ${error.message}`);
    }
  }
  
  /**
   * Test nginx configuration
   */
  async testConfig(): Promise<boolean> {
    try {
      await execAsync('sudo nginx -t');
      return true;
    } catch (error: any) {
      throw new Error(`Nginx configuration test failed: ${error.message}`);
    }
  }
  
  /**
   * Reload nginx to apply changes
   */
  async reloadNginx(): Promise<boolean> {
    try {
      // First test the config
      await this.testConfig();
      
      // Then reload
      await execAsync('sudo nginx -s reload');
      return true;
    } catch (error: any) {
      throw new Error(`Failed to reload nginx: ${error.message}`);
    }
  }
  
  /**
   * Ensure the temporary config directory exists
   */
  private async ensureTempConfigDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.tempConfigPath)) {
        await mkdirAsync(this.tempConfigPath, { recursive: true });
      }
    } catch (error: any) {
      throw new Error(`Failed to create temp config directory: ${error.message}`);
    }
  }
} 
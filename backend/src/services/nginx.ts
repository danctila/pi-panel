import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { executeCommandStrict } from '../utils/command';

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
  
  // Path for nginx configurations within the pi-panel project
  private projectConfigPath = path.join(__dirname, '../../../nginx-configs');
  
  /**
   * Create a configuration for a static site
   */
  async createStaticSiteConfig(domain: string, rootPath: string): Promise<string> {
    const configContent = `# Pi-Panel Static Site Configuration for ${domain}
# Generated: ${new Date().toISOString()}

server {
    listen 80;
    server_name ${domain};
    
    root ${rootPath};
    index index.html index.htm;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Main location block
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Cache static assets
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Deny access to hidden files
    location ~ /\\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}`;

    // Ensure project config directory exists
    await this.ensureProjectConfigDir();
    
    // Write config to project location
    const configFileName = `static-${domain}.conf`;
    const projectConfigFilePath = path.join(this.projectConfigPath, configFileName);
    
    await writeFileAsync(projectConfigFilePath, configContent);
    
    return projectConfigFilePath;
  }
  
  /**
   * Create a configuration for a backend service
   */
  async createBackendConfig(domain: string, port: number): Promise<string> {
    const configContent = `# Pi-Panel Backend Service Configuration for ${domain}
# Generated: ${new Date().toISOString()}
# Service Port: ${port}

server {
    listen 80;
    server_name ${domain};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:${port}/health;
        access_log off;
    }
}`;

    // Ensure project config directory exists
    await this.ensureProjectConfigDir();
    
    // Write config to project location
    const configFileName = `backend-${domain}.conf`;
    const projectConfigFilePath = path.join(this.projectConfigPath, configFileName);
    
    await writeFileAsync(projectConfigFilePath, configContent);
    
    return projectConfigFilePath;
  }
  
  /**
   * Deploy a configuration to the Raspberry Pi nginx
   * This copies from pi-panel nginx-configs to actual nginx directories
   */
  async deployConfigToServer(configPath: string, domain: string): Promise<boolean> {
    const configFileName = path.basename(configPath);
    const targetPath = path.join(this.sitesAvailablePath, configFileName);
    const symlinkPath = path.join(this.sitesEnabledPath, configFileName);
    
    try {
      console.log(`Deploying nginx config for ${domain}...`);
      
      // Ensure the config file exists in pi-panel
      if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
      }
      
      // Copy config file to sites-available with proper permissions
      await executeCommandStrict(`sudo cp "${configPath}" "${targetPath}"`, 'Copying nginx config to sites-available');
      await executeCommandStrict(`sudo chown root:root "${targetPath}"`, 'Setting config file ownership');
      await executeCommandStrict(`sudo chmod 644 "${targetPath}"`, 'Setting config file permissions');
      
      // Create symlink in sites-enabled
      await executeCommandStrict(`sudo ln -sf "${targetPath}" "${symlinkPath}"`, 'Creating symlink in sites-enabled');
      
      // Test and reload nginx
      await this.reloadNginx();
      
      console.log(`✅ Successfully deployed nginx config for ${domain}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to deploy config for ${domain}:`, error.message);
      throw new Error(`Failed to deploy config: ${error.message}`);
    }
  }
  
  /**
   * Remove a configuration for a domain
   */
  async removeConfig(domain: string): Promise<boolean> {
    try {
      console.log(`Removing nginx config for ${domain}...`);
      
      // Find all config files for this domain
      const availableConfigs = await execAsync(`sudo find ${this.sitesAvailablePath} -name "*${domain}*"`);
      const enabledConfigs = await execAsync(`sudo find ${this.sitesEnabledPath} -name "*${domain}*"`);
      
      // Remove from sites-enabled
      if (enabledConfigs.stdout.trim()) {
        await execAsync(`sudo rm -f ${enabledConfigs.stdout.trim()}`);
      }
      
      // Remove from sites-available
      if (availableConfigs.stdout.trim()) {
        await execAsync(`sudo rm -f ${availableConfigs.stdout.trim()}`);
      }
      
      // Remove from pi-panel configs
      const projectConfigFiles = fs.readdirSync(this.projectConfigPath)
        .filter(file => file.includes(domain));
      
      for (const file of projectConfigFiles) {
        const filePath = path.join(this.projectConfigPath, file);
        fs.unlinkSync(filePath);
      }
      
      // Reload nginx
      await this.reloadNginx();
      
      console.log(`✅ Successfully removed nginx config for ${domain}`);
      return true;
    } catch (error: any) {
      console.error(`❌ Failed to remove config for ${domain}:`, error.message);
      throw new Error(`Failed to remove config: ${error.message}`);
    }
  }
  
  /**
   * Test nginx configuration
   */
  async testConfig(): Promise<boolean> {
    try {
      console.log('Testing nginx configuration...');
      await executeCommandStrict('sudo nginx -t', 'Testing nginx configuration syntax');
      console.log('✅ Nginx configuration test passed');
      return true;
    } catch (error: any) {
      console.error('❌ Nginx configuration test failed:', error.message);
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
      console.log('Reloading nginx...');
      await executeCommandStrict('sudo systemctl reload nginx', 'Reloading nginx service');
      console.log('✅ Nginx reloaded successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Failed to reload nginx:', error.message);
      throw new Error(`Failed to reload nginx: ${error.message}`);
    }
  }
  
  /**
   * Get nginx status
   */
  async getNginxStatus(): Promise<{ active: boolean; enabled: boolean }> {
    try {
      const { stdout } = await execAsync('sudo systemctl is-active nginx');
      const active = stdout.trim() === 'active';
      
      const { stdout: enabledOutput } = await execAsync('sudo systemctl is-enabled nginx');
      const enabled = enabledOutput.trim() === 'enabled';
      
      return { active, enabled };
    } catch (error) {
      return { active: false, enabled: false };
    }
  }
  
  /**
   * List all pi-panel managed nginx configs
   */
  async listManagedConfigs(): Promise<string[]> {
    try {
      if (!fs.existsSync(this.projectConfigPath)) {
        return [];
      }
      
      const files = fs.readdirSync(this.projectConfigPath);
      return files.filter(file => file.endsWith('.conf'));
    } catch (error) {
      return [];
    }
  }
  
  /**
   * Ensure the project config directory exists
   */
  private async ensureProjectConfigDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.projectConfigPath)) {
        await mkdirAsync(this.projectConfigPath, { recursive: true });
        console.log(`Created nginx configs directory: ${this.projectConfigPath}`);
      }
    } catch (error: any) {
      throw new Error(`Failed to create project config directory: ${error.message}`);
    }
  }
} 
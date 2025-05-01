import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { BackendService } from '../types';

const execAsync = promisify(exec);

interface PM2ProcessInfo {
  name: string;
  pm_id: number;
  pid: number;
  status: string;
  cpu: number;
  memory: number;
  uptime: number;
}

/**
 * Service to interact with PM2 process manager for Node.js applications
 */
export class PM2Service {
  /**
   * Start a Node.js application with PM2
   */
  async startApplication(servicePath: string, name: string, port?: number): Promise<{ pid: number, status: string }> {
    try {
      // Check if ecosystem.config.js exists, use it if available
      const configPath = path.join(servicePath, 'ecosystem.config.js');
      const hasConfig = await this.fileExists(configPath);

      let command: string;
      
      if (hasConfig) {
        // Start with ecosystem config
        command = `cd ${servicePath} && pm2 start ecosystem.config.js`;
      } else {
        // Find package.json and use its start script if available
        const packageJsonPath = path.join(servicePath, 'package.json');
        const hasPackageJson = await this.fileExists(packageJsonPath);
        
        if (hasPackageJson) {
          // Start using package.json script
          // Also set environment variable for PORT if provided
          const envVars = port ? `PORT=${port} ` : '';
          command = `cd ${servicePath} && ${envVars}pm2 start npm --name "${name}" -- start`;
        } else {
          // Look for index.js, server.js, or app.js
          const indexPath = path.join(servicePath, 'index.js');
          const serverPath = path.join(servicePath, 'server.js');
          const appPath = path.join(servicePath, 'app.js');

          const hasIndex = await this.fileExists(indexPath);
          const hasServer = await this.fileExists(serverPath);
          const hasApp = await this.fileExists(appPath);

          let scriptPath = '';
          if (hasIndex) scriptPath = indexPath;
          else if (hasServer) scriptPath = serverPath;
          else if (hasApp) scriptPath = appPath;
          else throw new Error('No main JavaScript file found');

          // Start with the found JavaScript file
          // Also set environment variable for PORT if provided
          const envVars = port ? `PORT=${port} ` : '';
          command = `cd ${servicePath} && ${envVars}pm2 start ${scriptPath} --name "${name}"`;
        }
      }

      const { stdout } = await execAsync(command);
      
      // Get info about the started process
      const info = await this.getProcessInfo(name);
      return {
        pid: info.pid,
        status: info.status
      };
    } catch (error: any) {
      throw new Error(`Failed to start application: ${error.message}`);
    }
  }

  /**
   * Stop a running PM2 application
   */
  async stopApplication(name: string): Promise<boolean> {
    try {
      await execAsync(`pm2 stop ${name}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to stop application: ${error.message}`);
    }
  }

  /**
   * Restart a PM2 application
   */
  async restartApplication(name: string): Promise<{ pid: number, status: string }> {
    try {
      await execAsync(`pm2 restart ${name}`);
      const info = await this.getProcessInfo(name);
      return {
        pid: info.pid,
        status: info.status
      };
    } catch (error: any) {
      throw new Error(`Failed to restart application: ${error.message}`);
    }
  }

  /**
   * Delete a PM2 application
   */
  async deleteApplication(name: string): Promise<boolean> {
    try {
      await execAsync(`pm2 delete ${name}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to delete application: ${error.message}`);
    }
  }

  /**
   * Get logs for a PM2 application
   */
  async getLogs(name: string, lines: number = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`pm2 logs ${name} --lines ${lines} --nostream`);
      return stdout;
    } catch (error: any) {
      throw new Error(`Failed to get logs: ${error.message}`);
    }
  }

  /**
   * List all PM2 applications
   */
  async listApplications(): Promise<BackendService[]> {
    try {
      const { stdout } = await execAsync('pm2 jlist');
      const processes = JSON.parse(stdout);
      
      return processes.map((proc: any) => ({
        id: proc.pm_id.toString(),
        name: proc.name,
        type: 'nodejs',
        status: this.mapStatus(proc.pm2_env.status),
        pid: proc.pid,
        port: proc.env?.PORT || 0,
        path: proc.pm2_env.pm_cwd,
        createdAt: new Date(proc.pm2_env.created_at),
        updatedAt: new Date()
      }));
    } catch (error: any) {
      throw new Error(`Failed to list applications: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific PM2 process
   */
  private async getProcessInfo(name: string): Promise<PM2ProcessInfo> {
    try {
      const { stdout } = await execAsync(`pm2 show ${name} --format json`);
      const info = JSON.parse(stdout);
      
      return {
        name: info.name,
        pm_id: info.pm_id,
        pid: info.pid,
        status: info.status,
        cpu: info.monit?.cpu || 0,
        memory: info.monit?.memory || 0,
        uptime: info.pm2_env?.pm_uptime || 0
      };
    } catch (error: any) {
      throw new Error(`Failed to get process info: ${error.message}`);
    }
  }

  /**
   * Check if a file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`test -f "${filePath}" && echo "true" || echo "false"`);
      return stdout.trim() === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Map PM2 status to our status format
   */
  private mapStatus(pm2Status: string): 'running' | 'stopped' | 'error' {
    if (pm2Status === 'online') return 'running';
    if (pm2Status === 'stopping' || pm2Status === 'stopped') return 'stopped';
    return 'error';
  }
} 
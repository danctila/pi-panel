import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { DockerContainer } from '../types';

const execAsync = promisify(exec);

/**
 * Service to interact with Docker CLI for container management
 */
export class DockerService {
  /**
   * Build and run a Docker container from a Dockerfile
   */
  async buildAndRunContainer(
    containerDir: string,
    containerName: string,
    port: number,
    targetPort: number = 80
  ): Promise<DockerContainer> {
    try {
      // Check if docker-compose.yml exists
      const dockerComposePath = path.join(containerDir, 'docker-compose.yml');
      const dockerComposeYamlPath = path.join(containerDir, 'docker-compose.yaml');
      
      const hasDockerCompose = fs.existsSync(dockerComposePath) || fs.existsSync(dockerComposeYamlPath);
      
      if (hasDockerCompose) {
        // Use docker-compose if it exists
        const composeFile = fs.existsSync(dockerComposePath) ? dockerComposePath : dockerComposeYamlPath;
        
        // Modify the compose file to add our chosen port
        const tempComposeFile = path.join(containerDir, '.compose-temp.yml');
        
        // Update any environment variables for port configuration
        await execAsync(`cd ${containerDir} && PORT=${port} TARGET_PORT=${targetPort} docker-compose -f "${composeFile}" -p ${containerName} up -d`);
      } else {
        // Use Dockerfile
        // First build the image
        await execAsync(`cd ${containerDir} && docker build -t ${containerName} .`);
        
        // Then run the container with port mapping
        await execAsync(`docker run -d --name ${containerName} -p ${port}:${targetPort} ${containerName}`);
      }
      
      // Get container info
      const info = await this.getContainerInfo(containerName);
      
      return {
        id: info.id,
        name: containerName,
        image: info.image,
        status: this.mapStatus(info.status),
        path: containerDir,
        port: port,
        domain: '',
        createdAt: new Date(info.created),
        updatedAt: new Date()
      };
    } catch (error: any) {
      throw new Error(`Failed to build and run container: ${error.message}`);
    }
  }

  /**
   * Start a stopped Docker container
   */
  async startContainer(containerName: string): Promise<boolean> {
    try {
      await execAsync(`docker start ${containerName}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to start container: ${error.message}`);
    }
  }

  /**
   * Stop a running Docker container
   */
  async stopContainer(containerName: string): Promise<boolean> {
    try {
      await execAsync(`docker stop ${containerName}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to stop container: ${error.message}`);
    }
  }

  /**
   * Restart a Docker container
   */
  async restartContainer(containerName: string): Promise<boolean> {
    try {
      await execAsync(`docker restart ${containerName}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to restart container: ${error.message}`);
    }
  }

  /**
   * Remove a Docker container
   */
  async removeContainer(containerName: string): Promise<boolean> {
    try {
      // First stop the container if it's running
      try {
        await this.stopContainer(containerName);
      } catch (error) {
        // Ignore if already stopped
      }
      
      // Remove the container
      await execAsync(`docker rm ${containerName}`);
      return true;
    } catch (error: any) {
      throw new Error(`Failed to remove container: ${error.message}`);
    }
  }

  /**
   * Get logs from a Docker container
   */
  async getContainerLogs(containerName: string, lines: number = 100): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs --tail ${lines} ${containerName}`);
      return stdout;
    } catch (error: any) {
      throw new Error(`Failed to get container logs: ${error.message}`);
    }
  }

  /**
   * List all Docker containers
   */
  async listContainers(): Promise<DockerContainer[]> {
    try {
      const { stdout } = await execAsync('docker ps -a --format "{{.ID}}|{{.Names}}|{{.Image}}|{{.Status}}|{{.Ports}}|{{.CreatedAt}}"');
      
      if (!stdout.trim()) {
        return [];
      }
      
      const containers = stdout.trim().split('\n').map(line => {
        const [id, name, image, status, ports, created] = line.split('|');
        
        // Extract port from the ports string (e.g., "0.0.0.0:3000->80/tcp")
        const portMatch = ports.match(/\d+\.\d+\.\d+\.\d+:(\d+)/);
        const port = portMatch ? parseInt(portMatch[1], 10) : 0;
        
        return {
          id,
          name,
          image,
          status: this.mapStatus(status),
          path: `/opt/containers/${name}`,
          port,
          domain: '',
          createdAt: new Date(created),
          updatedAt: new Date()
        };
      });
      
      return containers;
    } catch (error: any) {
      throw new Error(`Failed to list containers: ${error.message}`);
    }
  }

  /**
   * Get detailed information about a specific Docker container
   */
  private async getContainerInfo(containerName: string): Promise<any> {
    try {
      const { stdout } = await execAsync(`docker inspect ${containerName} --format '{{json .}}'`);
      const info = JSON.parse(stdout);
      
      return {
        id: info.Id,
        name: info.Name.replace(/^\//, ''),
        image: info.Config.Image,
        status: info.State.Status,
        created: info.Created
      };
    } catch (error: any) {
      throw new Error(`Failed to get container info: ${error.message}`);
    }
  }

  /**
   * Map Docker status string to our status format
   */
  private mapStatus(dockerStatus: string): 'running' | 'stopped' | 'error' {
    dockerStatus = dockerStatus.toLowerCase();
    if (dockerStatus.includes('up') || dockerStatus.includes('running')) return 'running';
    if (dockerStatus.includes('exited') || dockerStatus.includes('stopped')) return 'stopped';
    return 'error';
  }
} 
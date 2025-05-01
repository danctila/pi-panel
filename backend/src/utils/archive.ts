import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Extract a zip file to a target directory
 * Uses the unzip command which should be available on Raspberry Pi OS
 */
export const extractZip = async (zipPath: string, targetDir: string): Promise<void> => {
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Use unzip command to extract files
  try {
    await execAsync(`unzip -o "${zipPath}" -d "${targetDir}"`);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(new Error(`Failed to extract zip file: ${error}`));
  }
};

/**
 * Clean a directory by removing all files and subdirectories
 */
export const cleanDirectory = async (dirPath: string): Promise<void> => {
  if (!fs.existsSync(dirPath)) {
    return Promise.resolve();
  }

  try {
    await execAsync(`rm -rf "${dirPath}"`);
    fs.mkdirSync(dirPath, { recursive: true });
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(new Error(`Failed to clean directory: ${error}`));
  }
};

/**
 * Get information about the extracted files
 */
export const getExtractedInfo = async (dirPath: string): Promise<{ fileCount: number, directories: string[] }> => {
  try {
    const { stdout } = await execAsync(`find "${dirPath}" -type f | wc -l`);
    const fileCount = parseInt(stdout.trim(), 10);
    
    const { stdout: dirOutput } = await execAsync(`find "${dirPath}" -type d -not -path "${dirPath}" | sort`);
    const directories = dirOutput.trim().split('\n').filter(Boolean);
    
    return { fileCount, directories };
  } catch (error) {
    return { fileCount: 0, directories: [] };
  }
}; 
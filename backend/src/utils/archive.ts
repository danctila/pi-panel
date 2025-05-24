import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { executeCommandStrict } from './command';

const execAsync = promisify(exec);

/**
 * Extract a zip file to a target directory
 * Uses the unzip command which should be available on Raspberry Pi OS
 * Handles Mac-created zips by cleaning up metadata and flattening structure
 */
export const extractZip = async (zipPath: string, targetDir: string): Promise<void> => {
  console.log(`🔧 Starting zip extraction:`);
  console.log(`   📦 Zip file: ${zipPath}`);
  console.log(`   📁 Target dir: ${targetDir}`);
  
  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    console.log(`📁 Creating target directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  } else {
    console.log(`📁 Target directory already exists: ${targetDir}`);
  }
  
  // Check if zip file exists
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Zip file not found: ${zipPath}`);
  }
  
  console.log(`📦 Zip file size: ${fs.statSync(zipPath).size} bytes`);
  
  // Use unzip command to extract files with detailed logging
  try {
    await executeCommandStrict(`unzip -o "${zipPath}" -d "${targetDir}"`, 'Extracting zip file');
    
    // Clean up Mac-specific files
    console.log(`🧹 Cleaning up Mac metadata files...`);
    await cleanupMacFiles(targetDir);
    
    // Handle nested folder structure - flatten if needed
    console.log(`📁 Checking for nested folder structure...`);
    await flattenSingleDirectory(targetDir);
    
    // List what was extracted after cleanup
    try {
      const extractedItems = fs.readdirSync(targetDir);
      console.log(`📂 Final items after cleanup (${extractedItems.length}):`, extractedItems);
    } catch (listError) {
      console.warn(`⚠️ Could not list final items:`, listError);
    }
    
    // Clean up the original zip file
    console.log(`🗑️ Removing original zip file: ${zipPath}`);
    try {
      fs.unlinkSync(zipPath);
      console.log(`✅ Zip file deleted successfully`);
    } catch (cleanupError) {
      console.warn(`⚠️ Failed to delete zip file:`, cleanupError);
    }
    
    return Promise.resolve();
  } catch (error: any) {
    return Promise.reject(new Error(`Failed to extract zip file: ${error.message}`));
  }
};

/**
 * Clean up Mac-specific files and directories
 */
const cleanupMacFiles = async (dirPath: string): Promise<void> => {
  try {
    // Remove __MACOSX directories
    await executeCommandStrict(`find "${dirPath}" -name "__MACOSX" -type d -exec rm -rf {} + 2>/dev/null || true`, 'Removing __MACOSX directories');
    
    // Remove .DS_Store files
    await executeCommandStrict(`find "${dirPath}" -name ".DS_Store" -type f -delete 2>/dev/null || true`, 'Removing .DS_Store files');
    
    // Remove files starting with ._
    await executeCommandStrict(`find "${dirPath}" -name "._*" -type f -delete 2>/dev/null || true`, 'Removing ._ metadata files');
    
    console.log(`✅ Mac file cleanup completed`);
  } catch (error) {
    // Ignore errors during cleanup
    console.warn('Warning: Failed to clean up Mac files:', error);
  }
};

/**
 * If the extraction created only one top-level directory, flatten it
 * This handles cases where users zip a folder instead of the contents
 */
const flattenSingleDirectory = async (dirPath: string): Promise<void> => {
  try {
    const items = fs.readdirSync(dirPath);
    console.log(`📂 Top-level items after Mac cleanup: ${items}`);
    
    // If there's only one item and it's a directory, move its contents up one level
    if (items.length === 1) {
      const singleItem = path.join(dirPath, items[0]);
      const stat = fs.statSync(singleItem);
      
      if (stat.isDirectory()) {
        console.log(`📁 Found single directory: ${items[0]}, flattening structure...`);
        
        // Move all contents from the subdirectory to the parent
        await executeCommandStrict(`find "${singleItem}" -mindepth 1 -maxdepth 1 -exec mv {} "${dirPath}/" \\;`, 'Moving files up one level');
        
        // Remove the now-empty directory
        fs.rmSync(singleItem, { recursive: true, force: true });
        console.log(`✅ Directory structure flattened`);
      }
    } else {
      console.log(`📂 Multiple items found, no flattening needed`);
    }
  } catch (error) {
    // Ignore errors during flattening
    console.warn('Warning: Failed to flatten directory structure:', error);
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
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from '../types';
import { extractZip, cleanDirectory, getExtractedInfo } from '../utils/archive';
import { sanitizeDeploymentName, getDeploymentType } from '../utils/deployment';

/**
 * Handle static site uploads
 * This uploads and extracts a zip file to a temporary location
 * Later it will be moved to the actual deployment location on the Pi
 */
export const uploadStaticSite = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    } as UploadResponse);
    return;
  }

  try {
    const originalName = req.body.name || path.parse(req.file.originalname).name;
    
    console.log(`📦 Processing upload for: ${originalName}`);
    console.log(`📂 Original file: ${req.file.originalname}, Size: ${req.file.size} bytes`);
    console.log(`📁 Temp file saved at: ${req.file.path}`);
    
    // Sanitize site name to make it filesystem-safe
    const siteName = sanitizeDeploymentName(originalName);
    
    if (!siteName) {
      res.status(400).json({
        success: false,
        message: 'Invalid site name. Please provide a valid name with alphanumeric characters.'
      } as UploadResponse);
      return;
    }
    
    const extractPath = path.join(__dirname, '../../../deploys/static', siteName);
    console.log(`📁 Extract path: ${extractPath}`);
    
    // Clean the directory first
    console.log(`🧹 Cleaning directory: ${extractPath}`);
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    console.log(`📦 Extracting zip from ${req.file.path} to ${extractPath}`);
    await extractZip(req.file.path, extractPath);
    console.log(`✅ Zip extraction completed`);
    
    // Validate that this looks like a static site
    const deploymentType = getDeploymentType(extractPath);
    console.log(`🔍 Detected deployment type: ${deploymentType}`);
    
    if (deploymentType !== 'static' && deploymentType !== 'unknown') {
      res.status(400).json({
        success: false,
        message: `This appears to be a ${deploymentType} project, not a static site. Please use the appropriate upload endpoint.`
      } as UploadResponse);
      return;
    }
    
    // Get info about extracted files
    const info = await getExtractedInfo(extractPath);
    console.log(`📊 Extracted ${info.fileCount} files`);
    console.log(`📂 Directories: ${info.directories.join(', ')}`);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: `Successfully uploaded and extracted ${info.fileCount} files to ${siteName}`,
      file: {
        path: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size
      },
      extractPath,
      zipFilePath: req.file.path,
      sanitizedName: siteName // Include the sanitized name so frontend knows what was used
    } as UploadResponse);
  } catch (error: any) {
    console.error(`❌ Upload processing failed:`, error);
    res.status(500).json({
      success: false,
      message: 'Failed to process uploaded file',
      error: error.message
    } as UploadResponse);
  }
};

/**
 * Handle backend service uploads
 * This uploads and extracts a zip file to a temporary location
 * Later it will be moved to the actual deployment location on the Pi
 */
export const uploadBackendService = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    } as UploadResponse);
    return;
  }

  try {
    const originalName = req.body.name || path.parse(req.file.originalname).name;
    
    // Sanitize service name to make it filesystem-safe
    const serviceName = sanitizeDeploymentName(originalName);
    
    if (!serviceName) {
      res.status(400).json({
        success: false,
        message: 'Invalid service name. Please provide a valid name with alphanumeric characters.'
      } as UploadResponse);
      return;
    }
    
    const extractPath = path.join(__dirname, '../../../deploys/backend', serviceName);
    
    // Clean the directory first
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    await extractZip(req.file.path, extractPath);
    
    // Validate that this looks like a backend service
    const deploymentType = getDeploymentType(extractPath);
    if (deploymentType !== 'nodejs') {
      res.status(400).json({
        success: false,
        message: 'No package.json found. This does not appear to be a Node.js backend service.'
      } as UploadResponse);
      return;
    }
    
    // Get info about extracted files
    const info = await getExtractedInfo(extractPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: `Successfully uploaded and extracted ${info.fileCount} files to ${serviceName}`,
      file: {
        path: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size
      },
      extractPath,
      sanitizedName: serviceName // Include the sanitized name so frontend knows what was used
    } as UploadResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process uploaded file',
      error: error.message
    } as UploadResponse);
  }
};

/**
 * Handle Docker container uploads
 * This uploads and extracts a zip file to a temporary location
 * Later it will be moved to the actual deployment location on the Pi
 */
export const uploadDockerContainer = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({
      success: false,
      message: 'No file uploaded'
    } as UploadResponse);
    return;
  }

  try {
    const originalName = req.body.name || path.parse(req.file.originalname).name;
    
    // Sanitize container name to make it filesystem-safe
    const containerName = sanitizeDeploymentName(originalName);
    
    if (!containerName) {
      res.status(400).json({
        success: false,
        message: 'Invalid container name. Please provide a valid name with alphanumeric characters.'
      } as UploadResponse);
      return;
    }
    
    const extractPath = path.join(__dirname, '../../../deploys/docker', containerName);
    
    // Clean the directory first
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    await extractZip(req.file.path, extractPath);
    
    // Validate that this looks like a Docker project
    const deploymentType = getDeploymentType(extractPath);
    if (deploymentType !== 'docker') {
      res.status(400).json({
        success: false,
        message: 'No Dockerfile or docker-compose.yml found in the uploaded files'
      } as UploadResponse);
      return;
    }
    
    // Get info about extracted files
    const info = await getExtractedInfo(extractPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: `Successfully uploaded and extracted ${info.fileCount} files to ${containerName}`,
      file: {
        path: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size
      },
      extractPath,
      sanitizedName: containerName // Include the sanitized name so frontend knows what was used
    } as UploadResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process uploaded file',
      error: error.message
    } as UploadResponse);
  }
}; 
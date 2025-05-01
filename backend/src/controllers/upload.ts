import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { UploadResponse } from '../types';
import { extractZip, cleanDirectory, getExtractedInfo } from '../utils/archive';

// Base paths where services will be deployed on the Raspberry Pi
const DEPLOY_PATHS = {
  STATIC: '/var/www', // For frontend static sites
  BACKEND: '/opt/backends', // For backend services 
  DOCKER: '/opt/containers' // For docker containers
};

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
    const siteName = req.body.name || path.parse(req.file.originalname).name;
    const extractPath = path.join(__dirname, '../../../deploys/static', siteName);
    
    // Clean the directory first
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    await extractZip(req.file.path, extractPath);
    
    // Get info about extracted files
    const info = await getExtractedInfo(extractPath);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: `Successfully uploaded and extracted ${info.fileCount} files to ${siteName}`,
      file: {
        path: req.file.path,
        originalName: req.file.originalname,
        size: req.file.size
      },
      extractPath
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
    const serviceName = req.body.name || path.parse(req.file.originalname).name;
    const extractPath = path.join(__dirname, '../../../deploys/backend', serviceName);
    
    // Clean the directory first
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    await extractZip(req.file.path, extractPath);
    
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
      extractPath
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
    const containerName = req.body.name || path.parse(req.file.originalname).name;
    const extractPath = path.join(__dirname, '../../../deploys/docker', containerName);
    
    // Clean the directory first
    await cleanDirectory(extractPath);
    
    // Extract the zip file
    await extractZip(req.file.path, extractPath);
    
    // Check for required Docker files
    const hasDockerfile = fs.existsSync(path.join(extractPath, 'Dockerfile'));
    const hasDockerCompose = fs.existsSync(path.join(extractPath, 'docker-compose.yml')) || 
                              fs.existsSync(path.join(extractPath, 'docker-compose.yaml'));
    
    if (!hasDockerfile && !hasDockerCompose) {
      res.status(400).json({
        success: false,
        message: 'No Dockerfile or docker-compose.yml found in the uploaded files',
        file: {
          path: req.file.path,
          originalName: req.file.originalname,
          size: req.file.size
        }
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
      extractPath
    } as UploadResponse);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to process uploaded file',
      error: error.message
    } as UploadResponse);
  }
}; 
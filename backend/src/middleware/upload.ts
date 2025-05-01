import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Define storage locations for different types of uploads
const uploadDirs = {
  static: path.join(__dirname, '../../../deploys/static'),
  backend: path.join(__dirname, '../../../deploys/backend'),
  docker: path.join(__dirname, '../../../deploys/docker')
};

// Ensure upload directories exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine upload type from route or query parameter
    const uploadType = req.params.type || 'static';
    const destDir = uploadDirs[uploadType as keyof typeof uploadDirs] || uploadDirs.static;
    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter function to accept only zip files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.zip') {
    return cb(new Error('Only .zip files are allowed'));
  }
  cb(null, true);
};

// Export the configured multer middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  }
}); 
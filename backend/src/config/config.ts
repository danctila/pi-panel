import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export default {
  port: process.env.PORT || 3001,
  jwtSecret: process.env.JWT_SECRET || 'pipanel_jwt_secret_key_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'pipanel_refresh_secret_key_change_in_production',
  nodeEnv: process.env.NODE_ENV || 'development',
}; 
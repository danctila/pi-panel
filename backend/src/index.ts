import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import frontendsRoutes from './routes/frontends';
import backendsRoutes from './routes/backends';
import dockerRoutes from './routes/docker';
import tunnelRoutes from './routes/tunnel';
import uploadRoutes from './routes/upload';
import deployRoutes from './routes/deploy';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser()); // Add cookie parser middleware

// Enable trust proxy to correctly read client IPs
app.set('trust proxy', true);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/frontends', frontendsRoutes);
app.use('/api/backends', backendsRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api/tunnel', tunnelRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/deploy', deployRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'PiPanel API is running',
    ip: req.ip || req.socket.remoteAddress
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Note: This server is only accessible via Tailscale network');
});

export default app; 
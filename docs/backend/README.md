# Backend Documentation

## Overview

The backend of PiPanel is built with Express.js and TypeScript, providing a robust API for managing the various services on the Raspberry Pi. It handles file uploads, service deployments, and integration with system services like nginx, PM2, Docker, and Cloudflare Tunnels.

## Directory Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers for API endpoints
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic for system integrations
│   ├── middleware/      # Express middleware (auth, upload)
│   ├── utils/           # Utility functions (archive, deployment)
│   ├── types/           # TypeScript type definitions
│   └── config/          # Configuration management
├── dist/                # Compiled JavaScript output
├── deploys/             # Temporary storage for uploaded files
├── ecosystem.config.js  # PM2 configuration for production
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Key Components

### Controllers

Controllers handle incoming HTTP requests and coordinate with services:

- **upload.ts**: Handles file uploads and validation
- **deploy.ts**: Manages deployment of static sites, backend services, and Docker containers
- **frontends.ts**: Static site management operations
- **backends.ts**: Backend service management operations
- **docker.ts**: Docker container management operations
- **tunnel.ts**: Cloudflare Tunnel configuration
- **dashboard.ts**: System status and overview

### Routes

API routes define the HTTP endpoints with authentication:

- `/api/upload/*`: File upload endpoints (static, backend, docker)
- `/api/deploy/*`: Deployment endpoints (static, backend, docker)
- `/api/frontends`: Static site management
- `/api/backends`: Backend service management
- `/api/docker`: Docker container management
- `/api/tunnel`: Cloudflare Tunnel configuration
- `/api/dashboard`: System status and overview
- `/api/auth`: Authentication endpoints

### Services

Services implement the core business logic:

- **PM2Service**: Manages Node.js processes via PM2
- **DockerService**: Controls Docker containers and images
- **NginxService**: Generates and manages nginx configurations
- **CloudflareTunnelService**: Updates Cloudflare Tunnel configuration

### Middleware

Middleware functions handle cross-cutting concerns:

- **auth.ts**: Validates JWT tokens from Supabase
- **upload.ts**: Configures multer for file uploads with security checks

### Utilities

Shared utility functions for common operations:

- **archive.ts**: Handles zip file extraction and validation
- **deployment.ts**: Common deployment operations (directory creation, file copying, validation)

### Configuration

- **supabase.ts**: Supabase client configuration for authentication
- **env variables**: Environment-based configuration via `.env` file

## API Endpoints

### File Upload

- `POST /api/upload/static`: Upload a static site zip file
- `POST /api/upload/backend`: Upload a backend service zip file
- `POST /api/upload/docker`: Upload a Docker project zip file

### Deployment

- `POST /api/deploy/static`: Deploy an uploaded static site
- `POST /api/deploy/backend`: Deploy an uploaded backend service
- `POST /api/deploy/docker`: Deploy an uploaded Docker container

### Static Sites Management

- `GET /api/frontends`: List all deployed static sites
- `GET /api/frontends/:id`: Get information about a specific site
- `DELETE /api/frontends/:id`: Delete a static site

### Backend Services Management

- `GET /api/backends`: List all deployed backend services
- `GET /api/backends/:id`: Get information about a specific service
- `POST /api/backends/:id/start`: Start a backend service
- `POST /api/backends/:id/stop`: Stop a backend service
- `POST /api/backends/:id/restart`: Restart a backend service
- `GET /api/backends/:id/logs`: Get logs for a backend service
- `DELETE /api/backends/:id`: Delete a backend service

### Docker Containers Management

- `GET /api/docker`: List all Docker containers
- `GET /api/docker/:id`: Get information about a specific container
- `POST /api/docker/:id/start`: Start a Docker container
- `POST /api/docker/:id/stop`: Stop a Docker container
- `POST /api/docker/:id/restart`: Restart a Docker container
- `GET /api/docker/:id/logs`: Get logs for a Docker container
- `DELETE /api/docker/:id`: Delete a Docker container

### System Management

- `GET /api/dashboard/status`: Get system status (CPU, memory, disk)
- `GET /api/tunnel/status`: Get Cloudflare Tunnel status
- `GET /api/health`: Health check endpoint

## Authentication

The backend uses Supabase for authentication:

- JWT tokens are validated on protected endpoints
- Authentication middleware checks tokens on all routes except health check
- Environment variables:
  - `SUPABASE_URL`: URL of the Supabase project
  - `SUPABASE_ANON_KEY`: Public key for client-side operations
  - `SUPABASE_SERVICE_ROLE_KEY`: Service key for server-side operations
  - `SKIP_AUTH`: Set to `true` to bypass authentication in development

## File Handling & Security

The backend implements secure file handling:

- **multer**: Handles multipart/form-data uploads
- **Archive validation**: Checks file types and content before extraction
- **Name validation**: Ensures deployment names use safe characters only
- **Type detection**: Automatically detects project types (static, nodejs, docker)
- **Temporary storage**: Files stored in `deploys/` directory before deployment
- **Permission management**: Proper file ownership and permissions on Pi

## Deployment Workflow

1. **Upload**: Files are uploaded and validated
2. **Extract**: Zip files are extracted to temporary directories
3. **Validate**: Project type and structure are validated
4. **Deploy**: Files are copied to production locations
5. **Configure**: nginx and Cloudflare Tunnel configurations are updated
6. **Start**: Services are started via PM2 or Docker

## Environment Configuration

Key environment variables:

```bash
# Server
PORT=3001
NODE_ENV=development

# Authentication
SKIP_AUTH=false
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
FRONTEND_URL=https://admin.yourdomain.com
```

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment

The backend is deployed using PM2 with the `ecosystem.config.js` configuration:

```bash
# Deploy to Pi
pm2 start ecosystem.config.js --env production

# Monitor
pm2 status
pm2 logs pipanel-backend
```

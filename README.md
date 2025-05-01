# PiPanel

A web-based admin panel for Raspberry Pi users to manage self-hosted services.

## Overview

PiPanel enables Raspberry Pi users, especially self-hosters, to manage their hosted services through a user-friendly dashboard. It integrates with Cloudflare Tunnels and nginx to serve services publicly without port forwarding.

## Current Implementation Status (Phase 1)

### Frontend

- React-based UI with TypeScript
- Tailwind CSS for styling
- Basic project structure with components, pages, and views
- Modern development setup with PostCSS and TypeScript configuration

### Backend

- Express.js server with TypeScript
- Organized project structure with:
  - Controllers for business logic
  - Routes for API endpoints
  - Services for external integrations
  - Middleware for request processing
  - Configuration management

### Infrastructure

- Docker support for containerization
- Nginx configuration templates
- Data storage structure
- Deployment directory for service files

## Features (Planned)

- **Frontend Static Site Management**: Upload and deploy static sites with custom domains via nginx.
- **Backend Process Management**: Deploy, monitor, and control Node.js, Python, and other backend services.
- **Docker Container Management**: Deploy and manage Docker containers with a simple UI.
- **Reverse Proxy Integration**: Auto-configure nginx to serve your services.
- **Cloudflare Tunnel Integration**: Securely expose services without port forwarding.
- **Authentication**: Secure admin access with login system.

## Project Structure

```
pi-panel/
├── frontend/            # React UI
│   ├── src/            # Source code
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── views/     # View components
│   │   └── context/   # React context providers
│   ├── public/        # Static assets
│   └── config/        # Frontend configuration
├── backend/            # Express server
│   ├── src/           # Source code
│   │   ├── routes/    # API routes
│   │   ├── controllers/ # Business logic
│   │   ├── services/  # External service integration
│   │   ├── middleware/ # Request middleware
│   │   └── config/    # Configuration
├── deploys/           # Upload folder for frontends/backends
├── data/              # Storage for config and data
├── nginx-configs/     # Custom nginx templates
└── docker/            # Docker configuration
```

## Development Setup

### Prerequisites

- Node.js (v16 or higher) and npm
- Raspberry Pi with Raspberry Pi OS (for production)
- Tailscale (for remote access)
- Cloudflare account with Tunnel capability
- Nginx
- Docker (optional, for containerized deployment)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend server runs on port 3001 by default.

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend development server runs on port 3000 by default.

### Development Workflow

1. Start both frontend and backend servers in development mode
2. Frontend will proxy API requests to the backend
3. Changes to either frontend or backend will trigger hot reloading
4. Use the development tools in your browser for debugging

## Deployment

For deployment on a Raspberry Pi:

1. Clone this repository on your Raspberry Pi
2. Set up the required dependencies:

   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install nginx
   sudo apt-get install nginx

   # Install Docker (optional)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. Build the frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. Start the backend server:

   ```bash
   cd backend
   npm install
   npm run build
   npm start
   ```

5. Configure nginx to serve the frontend and proxy API requests to the backend

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Credits

Created as an open-source project for Raspberry Pi enthusiasts and self-hosters.

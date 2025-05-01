# PiPanel

A web-based admin panel for Raspberry Pi users to manage self-hosted services.

## Overview

PiPanel enables Raspberry Pi users, especially self-hosters, to manage their hosted services through a user-friendly dashboard. It integrates with Cloudflare Tunnels and nginx to serve services publicly without port forwarding.

## Features

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
├── backend/             # Express server
│   ├── routes/          # API routes
│   ├── controllers/     # Business logic
│   ├── services/        # External service integration
│   └── config/          # Configuration
├── deploys/             # Upload folder for frontends/backends
├── data/                # Storage for config and data
├── nginx-configs/       # Custom nginx templates
└── docker/              # Docker configuration
```

## Development Setup

### Prerequisites

- Node.js and npm
- Raspberry Pi with Raspberry Pi OS
- Tailscale (for remote access)
- Cloudflare account with Tunnel capability
- Nginx

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## Deployment

For deployment on a Raspberry Pi:

1. Clone this repository on your Raspberry Pi
2. Set up the required dependencies (Node.js, nginx, Docker)
3. Build the frontend: `cd frontend && npm run build`
4. Start the backend server: `cd backend && npm start`

## License

MIT

## Credits

Created as an open-source project for Raspberry Pi enthusiasts and self-hosters.

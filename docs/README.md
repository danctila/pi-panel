# PiPanel Documentation

This documentation provides detailed information about the PiPanel project, its architecture, components, and how they interact with each other.

## Documentation Structure

The documentation is organized to mirror the codebase structure, providing detailed information about each component:

```
docs/
├── architecture/        # System architecture documentation
│   └── README.md        # Architecture overview
├── backend/             # Backend service documentation
│   ├── controllers/     # API controllers documentation
│   ├── routes/          # API routes documentation
│   ├── services/        # Service integration documentation
│   └── README.md        # Backend overview
├── frontend/            # Frontend documentation
│   ├── components/      # UI components documentation
│   ├── pages/           # Pages documentation
│   └── README.md        # Frontend overview
├── deployment/          # Deployment documentation
│   └── README.md        # Deployment guide
├── integration/         # Third-party integrations
│   ├── cloudflare/      # Cloudflare integration documentation
│   ├── nginx/           # Nginx configuration documentation
│   ├── pm2/             # PM2 process management documentation
│   └── README.md        # Integrations overview
└── README.md            # Documentation overview
```

## Core Components

### 1. Backend Service (backend/)

- Express-based REST API
- File upload and deployment
- Service management (PM2, Docker)
- Nginx configuration generation
- Authentication and authorization

### 2. Frontend (frontend/)

- React-based dashboard
- Service management UI
- Upload and deployment forms
- Status monitoring

### 3. Integration Services

- Cloudflare Tunnel integration
- Nginx configuration management
- PM2 process management
- Docker container management

### 4. Deployment System

- Static site deployment
- Backend API deployment
- Docker container deployment
- Service status monitoring

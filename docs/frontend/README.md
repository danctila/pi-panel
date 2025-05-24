# Frontend Documentation

## Overview

The frontend of PiPanel is built with React and TypeScript, using Tailwind CSS for styling. It provides a user-friendly interface for managing services on the Raspberry Pi, including static sites, backend applications, and Docker containers.

## Directory Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── views/           # View components for sections
│   ├── context/         # React context providers
│   ├── services/        # API service functions
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration
│   ├── types/           # TypeScript type definitions
│   └── assets/          # Images, icons, etc.
├── build/               # Production build output
└── node_modules/        # Dependencies
```

## Key Components

### Pages

The main pages of the application:

- **Dashboard**: Overview of all services and system status
- **Sites**: Management of static websites
- **Backends**: Management of backend services
- **Docker**: Management of Docker containers
- **Cloudflare**: Cloudflare Tunnel configuration
- **Settings**: Application settings

### Components

Reusable UI components:

- **Layout**: Page layout components (Sidebar, Header, Footer)
- **Cards**: Service cards, status cards, etc.
- **Forms**: Upload forms, deployment forms, etc.
- **Modals**: Confirmation modals, detail modals, etc.
- **Buttons**: Action buttons, toggle buttons, etc.
- **Tables**: Data tables for service listing
- **Status**: Status indicators, badges, etc.

### Context

React context providers:

- **AuthContext**: Authentication state and functions
- **NotificationContext**: Toast notifications
- **ThemeContext**: Theme settings

### Services

API service functions:

- **api.ts**: Base API configuration
- **sitesService.ts**: Static site API functions
- **backendsService.ts**: Backend service API functions
- **dockerService.ts**: Docker container API functions
- **systemService.ts**: System information API functions
- **cloudflareService.ts**: Cloudflare Tunnel API functions

## Main Features

### Authentication

- Uses Supabase for authentication
- Login form
- JWT token management
- Protected routes

### Service Management

The frontend provides interfaces for:

1. **Static Sites**:

   - Upload site archives
   - Deploy to nginx
   - Configure domains
   - View status and details

2. **Backend Services**:

   - Upload backend archives
   - Deploy with PM2
   - Start, stop, restart services
   - View logs and status

3. **Docker Containers**:
   - Upload Dockerfiles or compose files
   - Deploy containers
   - Manage container lifecycle
   - View logs and status

### System Monitoring

- CPU, memory, and disk usage
- Service status overview
- Uptime information
- Log viewing

## UI/UX Design

- **Theme**: Dark and light mode support
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Skeleton loaders for asynchronous operations
- **Error Handling**: User-friendly error messages
- **Notifications**: Toast notifications for operations

## State Management

- React hooks for local component state
- Context API for global state
- Local storage for persistent preferences

## API Integration

- Axios for HTTP requests
- JWT token handling
- File upload with multipart/form-data
- Polling for real-time updates where needed

## Build and Deployment

- React Scripts for development and building
- Environment variables for configuration
- Production build served by nginx on the Raspberry Pi

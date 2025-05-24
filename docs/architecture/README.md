# PiPanel Architecture

## Overview

PiPanel is a web-based admin panel designed for Raspberry Pi users to manage their hosted services, including static websites, backend services, and Docker containers. The system is built with a clear separation of concerns, following a client-server architecture:

1. **Frontend**: React-based dashboard with a modern UI
2. **Backend**: Express.js server handling API requests and service integrations
3. **Integration Layer**: Connectors to system services (PM2, Docker, nginx, Cloudflare)

## System Architecture Diagram

```
┌────────────────┐      ┌─────────────────┐      ┌─────────────────────┐
│                │      │                 │      │                     │
│    Frontend    │◄────►│     Backend     │◄────►│  Integration Layer  │
│    (React)     │      │   (Express.js)  │      │                     │
│                │      │                 │      │                     │
└────────────────┘      └─────────────────┘      └─────────────────────┘
                                                          │
                                                          ▼
                              ┌─────────────────────────────────────────────┐
                              │                                             │
                              │ ┌───────────┐ ┌────────┐ ┌───────────────┐ │
                              │ │           │ │        │ │               │ │
                              │ │    PM2    │ │ Docker │ │     nginx     │ │
                              │ │           │ │        │ │               │ │
                              │ └───────────┘ └────────┘ └───────────────┘ │
                              │                                             │
                              │ ┌─────────────────────┐ ┌───────────────┐  │
                              │ │                     │ │               │  │
                              │ │  Cloudflare Tunnel  │ │  File System  │  │
                              │ │                     │ │               │  │
                              │ └─────────────────────┘ └───────────────┘  │
                              │                                             │
                              │             System Services                 │
                              └─────────────────────────────────────────────┘
```

## Directory Structure

```
pi-panel/
├── frontend/            # React UI with Tailwind CSS
├── backend/             # Express server
│   ├── src/
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic for system integrations
│   │   ├── middleware/  # Express middleware
│   │   ├── utils/       # Utility functions
│   │   └── types/       # TypeScript type definitions
├── deploys/             # Temporary folder for uploads
├── data/                # Configuration storage
├── nginx-configs/       # Generated nginx configs
└── docker/              # Docker-related files
```

## Component Interactions

### Frontend to Backend

The frontend communicates with the backend through RESTful API calls, handling:

1. User authentication (Supabase integration)
2. File uploads (static sites, backend services, Docker files)
3. Service management operations (deploy, start, stop, restart)
4. Status monitoring and information retrieval

### Backend to System Services

The backend integrates with various system services through:

1. **PM2 Integration**: Managing Node.js and other backend services

   - Starting, stopping, restarting processes
   - Retrieving logs and status

2. **Docker Integration**: Managing containerized applications

   - Building and running containers
   - Container lifecycle management
   - Volume and network configuration

3. **nginx Integration**: Configuring the web server

   - Generating server blocks
   - Managing virtual hosts
   - Proxying requests to services

4. **Cloudflare Tunnel Integration**: Exposing services to the public internet
   - Configuring tunnel routes
   - Managing DNS entries
   - Securing public access

## Authentication Flow

PiPanel uses Supabase for authentication:

1. Users authenticate through the Supabase authentication UI
2. JWT tokens are issued and validated
3. Backend validates tokens with middleware
4. Role-based access control for administrative operations

## Deployment Flow

The system follows a standardized flow for deploying services:

1. User uploads files through the frontend
2. Backend receives and processes the files
3. Backend deploys the service based on its type:
   - Static sites: Extracted to nginx serving directory
   - Backend services: Deployed with PM2
   - Docker services: Built and run as containers
4. nginx configuration is generated
5. Cloudflare Tunnel is updated to expose the service
6. Service status is returned to the user

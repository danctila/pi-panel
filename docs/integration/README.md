# Integration Documentation

## Overview

PiPanel integrates with several external services and system components to provide a comprehensive hosting solution for the Raspberry Pi. This document outlines the integration points and how they interact with the PiPanel system.

## Key Integrations

### 1. nginx

**Purpose**: Web server for static content and reverse proxy for dynamic services

**Integration Points**:

- **Configuration Generation**: PiPanel generates nginx server blocks for each service
- **Reload Management**: PiPanel safely reloads nginx when configurations change
- **Virtual Host Management**: PiPanel manages virtual hosts for different domains

**Directory Structure**:

```
/etc/nginx/sites-available/     # Generated server blocks
/etc/nginx/sites-enabled/       # Symbolic links to enabled sites
/var/www/                       # Static site content
```

**Implementation**:

- NginxService handles configuration generation and management
- Templates are used for different service types
- Configuration validation before reload

### 2. PM2

**Purpose**: Process manager for Node.js applications

**Integration Points**:

- **Process Management**: Start, stop, restart Node.js services
- **Log Access**: Retrieve logs from PM2
- **Status Monitoring**: Monitor service status
- **Auto-restart**: Configure auto-restart on failure

**Configuration**:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "service-name",
      script: "index.js",
      cwd: "/opt/backends/service-name",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
      watch: false,
      instances: 1,
      autorestart: true,
      max_memory_restart: "200M",
    },
  ],
};
```

**Implementation**:

- PM2 is accessed via the pm2 npm package
- BackendService handles PM2 integration
- Process information is stored in the data directory

### 3. Docker

**Purpose**: Container management for applications

**Integration Points**:

- **Container Management**: Build, start, stop, restart containers
- **Image Management**: Build and manage Docker images
- **Volume Management**: Configure persistent storage
- **Network Configuration**: Port mapping and networking
- **Log Access**: Retrieve container logs

**Implementation**:

- Docker is accessed via the dockerode npm package
- DockerService handles Docker integration
- Container information is stored in the data directory

### 4. Cloudflare Tunnel

**Purpose**: Secure public access to services without port forwarding

**Integration Points**:

- **Tunnel Configuration**: Update tunnel configuration
- **Route Management**: Add/remove routes to services
- **DNS Integration**: Auto-configure Cloudflare DNS
- **Security**: TLS encryption and Cloudflare security features

**Configuration**:

```yaml
# tunnel.yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json
ingress:
  - hostname: service1.example.com
    service: http://localhost:80
  - hostname: service2.example.com
    service: http://localhost:80
  - service: http_status:404
```

**Implementation**:

- CloudflareService handles Tunnel configuration
- Configuration is updated when services are added/removed
- Tunnel is reloaded to apply changes

### 5. Supabase Authentication

**Purpose**: User authentication and authorization

**Integration Points**:

- **User Authentication**: Login/signup functionality
- **JWT Validation**: Validate user tokens
- **Role-based Access**: Control access to resources

**Implementation**:

- Frontend uses Supabase JavaScript client
- Backend validates JWT tokens
- Environment variables configure authentication behavior

## Integration Flow Examples

### Static Site Deployment

```
Frontend                 Backend                      System
   |                        |                           |
   |---(Upload ZIP)-------->|                           |
   |                        |---(Extract Files)-------->|
   |                        |---(Generate nginx config)->|
   |                        |---(Reload nginx)---------->|
   |                        |---(Update CF Tunnel)------>|
   |<---(Deployment Status)--|                           |
   |                        |                           |
```

### Backend Service Deployment

```
Frontend                 Backend                      System
   |                        |                           |
   |---(Upload ZIP)-------->|                           |
   |                        |---(Extract Files)-------->|
   |                        |---(Install Dependencies)->|
   |                        |---(Create PM2 Config)---->|
   |                        |---(Start with PM2)------->|
   |                        |---(Generate nginx config)->|
   |                        |---(Reload nginx)---------->|
   |                        |---(Update CF Tunnel)------>|
   |<---(Deployment Status)--|                           |
   |                        |                           |
```

### Docker Container Deployment

```
Frontend                 Backend                      System
   |                        |                           |
   |---(Upload Files)------>|                           |
   |                        |---(Save Files)----------->|
   |                        |---(Build Image)---------->|
   |                        |---(Run Container)-------->|
   |                        |---(Generate nginx config)->|
   |                        |---(Reload nginx)---------->|
   |                        |---(Update CF Tunnel)------>|
   |<---(Deployment Status)--|                           |
   |                        |                           |
```

## Error Handling

Each integration includes error handling mechanisms:

1. **Pre-operation Validation**: Validate input before operations
2. **Error Catching**: Catch and handle exceptions
3. **Rollback Procedures**: Revert changes on failure
4. **Retry Logic**: Retry operations with exponential backoff
5. **Logging**: Log errors for debugging

## Security Considerations

- **Least Privilege**: Services run with minimal permissions
- **Isolated Networks**: Docker containers use isolated networks
- **Secure Configurations**: Security-focused default configurations
- **Token Validation**: Strict validation of authentication tokens
- **Input Sanitization**: Sanitize all user input

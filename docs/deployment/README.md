# Deployment Documentation

## Overview

PiPanel manages the deployment of three main types of services:

1. **Static Sites**: Frontend web applications served directly by nginx
2. **Backend Services**: Node.js applications managed by PM2
3. **Docker Containers**: Containerized applications managed by Docker

This document explains the deployment processes for each type of service.

## Directory Structure

```
pi-panel/
├── deploys/             # Temporary upload directory
│   ├── static/          # Uploaded static site archives
│   ├── backend/         # Uploaded backend service archives
│   └── docker/          # Uploaded Docker files
├── data/                # Configuration data
│   ├── sites/           # Static site configurations
│   ├── backends/        # Backend service configurations
│   └── docker/          # Docker container configurations
├── nginx-configs/       # Generated nginx configuration files
└── docker/              # Docker-related files and templates
```

## System Requirements

- **Raspberry Pi OS** (Debian-based)
- **Node.js** v14+ and npm
- **Docker** and docker-compose
- **PM2** installed globally
- **nginx** web server
- **Cloudflare** account with Tunnel configured

## Static Site Deployment

### Process Flow

1. User uploads a ZIP archive containing the static site files
2. Backend extracts the archive to a temporary directory
3. Backend validates the content (checks for index.html, etc.)
4. Files are copied to the target directory (e.g., `/var/www/site-name`)
5. nginx configuration is generated
6. nginx is reloaded to apply the configuration
7. Cloudflare Tunnel configuration is updated if needed

### Directory Structure

```
/var/www/
├── site1/               # First static site
│   ├── index.html
│   ├── assets/
│   │   ├── css/
│   │   ├── js/
│   │   └── images/
│   └── ...
├── site2/               # Second static site
└── ...
```

### Configuration Files

**nginx Server Block (example):**

```nginx
server {
    listen 80;
    server_name site1.example.com;

    root /var/www/site1;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Backend Service Deployment

### Process Flow

1. User uploads a ZIP archive containing the backend service files
2. Backend extracts the archive to a temporary directory
3. Backend validates the content (checks for package.json, etc.)
4. Files are copied to the target directory (e.g., `/opt/backends/api-name`)
5. Dependencies are installed with `npm install`
6. PM2 configuration is generated
7. Service is started with PM2
8. nginx configuration is generated to proxy requests
9. nginx is reloaded to apply the configuration
10. Cloudflare Tunnel configuration is updated if needed

### Directory Structure

```
/opt/backends/
├── api1/                # First backend service
│   ├── package.json
│   ├── node_modules/
│   ├── src/
│   └── ...
├── api2/                # Second backend service
└── ...
```

### Configuration Files

**PM2 Configuration (example):**

```javascript
module.exports = {
  apps: [
    {
      name: "api1",
      script: "index.js",
      cwd: "/opt/backends/api1",
      env: {
        PORT: 3001,
        NODE_ENV: "production",
      },
    },
  ],
};
```

**nginx Server Block (example):**

```nginx
server {
    listen 80;
    server_name api1.example.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Docker Container Deployment

### Process Flow

1. User uploads Dockerfile or docker-compose.yml
2. Backend validates the file content
3. Files are copied to the target directory (e.g., `/opt/containers/app-name`)
4. Docker image is built
5. Container is started with the appropriate port mapping
6. nginx configuration is generated to proxy requests
7. nginx is reloaded to apply the configuration
8. Cloudflare Tunnel configuration is updated if needed

### Directory Structure

```
/opt/containers/
├── app1/                # First Docker application
│   ├── Dockerfile
│   ├── docker-compose.yml (optional)
│   └── ...
├── app2/                # Second Docker application
└── ...
```

### Configuration Files

**docker-compose.yml (example):**

```yaml
version: "3"
services:
  app:
    build: .
    ports:
      - "4001:80"
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

**nginx Server Block (example):**

```nginx
server {
    listen 80;
    server_name docker1.example.com;

    location / {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Cloudflare Tunnel Configuration

### Process Flow

1. Backend service updates the Cloudflare Tunnel configuration file
2. The tunnel is reloaded to apply the changes
3. DNS entries are automatically managed by Cloudflare

### Configuration Files

**tunnel.yaml (example):**

```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json
ingress:
  - hostname: site1.example.com
    service: http://localhost:80
  - hostname: api1.example.com
    service: http://localhost:80
  - hostname: docker1.example.com
    service: http://localhost:80
  - service: http_status:404
```

## Error Handling and Rollback

The deployment system includes error handling and rollback capabilities:

1. **Pre-deployment Validation**: Validates files before deployment
2. **Deployment Transaction**: Tracks deployment steps to enable rollback
3. **Health Checks**: Verifies service is running after deployment
4. **Automatic Rollback**: Reverts to previous state on failure
5. **Logging**: Detailed logs for debugging deployment issues

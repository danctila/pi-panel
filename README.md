# PiPanel

PiPanel is a self-hosted dashboard for managing and deploying web services and applications on a Raspberry Pi. It integrates with Cloudflare Tunnels and nginx to serve your applications securely over the internet without port forwarding.

## Features

- Deploy and manage static websites
- Deploy and manage Node.js backend services using PM2
- Deploy and manage Docker containers
- Automatic nginx configuration generation
- Cloudflare Tunnel integration for secure public access
- Easy-to-use dashboard interface

## Project Structure

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

## Implementation Progress

### ✅ Backend API

- **Upload API**: Endpoints for uploading static sites, backend services, and Docker containers
- **Deployment API**: Endpoints for deploying uploaded content
- **Middleware**: Authentication, file upload handling
- **Services**: PM2, Docker, nginx, and Cloudflare Tunnel integration

### ✅ Frontend UI

- **Dashboard**: Overview of system status and services
- **Forms**: UI for uploading and deploying different types of services
- **Modals**: Modal windows for deployment workflow

## Setup on Raspberry Pi

To set up PiPanel on your Raspberry Pi, follow these steps:

### Prerequisites

1. Raspberry Pi with Raspberry Pi OS installed
2. Node.js and npm (v14+ recommended)
3. Docker installed (for container management)
4. PM2 installed globally (`npm install -g pm2`)
5. nginx installed and configured
6. Cloudflare account with a Tunnel configured

### Required Directory Structure

Create the following directories on your Raspberry Pi:

```bash
# For static sites
sudo mkdir -p /var/www

# For backend services
sudo mkdir -p /opt/backends

# For Docker containers
sudo mkdir -p /opt/containers

# For temporary uploads
mkdir -p ~/pi-panel/deploys/static
mkdir -p ~/pi-panel/deploys/backend
mkdir -p ~/pi-panel/deploys/docker

# For nginx configs
mkdir -p ~/pi-panel/nginx-configs
```

### Setup Steps

1. Clone this repository on your Raspberry Pi

   ```bash
   git clone https://github.com/yourusername/pi-panel.git
   cd pi-panel
   ```

2. Install dependencies for backend and frontend

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with necessary configuration:

   ```
   PORT=3001
   JWT_SECRET=your_jwt_secret
   CLOUDFLARE_CONFIG_PATH=/etc/cloudflared/config.yml
   ```

4. Build the frontend

   ```bash
   cd frontend
   npm run build
   ```

5. Start the backend server with PM2

   ```bash
   cd backend
   pm2 start npm --name "pipanel-backend" -- start
   ```

6. Configure nginx to serve the frontend and proxy API requests
   Create a file `/etc/nginx/sites-available/pipanel.conf`:

   ```nginx
   server {
       listen 80;
       server_name localhost;

       # Serve frontend
       location / {
           root /path/to/pi-panel/frontend/build;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests
       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Enable the nginx site and reload

   ```bash
   sudo ln -s /etc/nginx/sites-available/pipanel.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo nginx -s reload
   ```

8. Expose PiPanel through Cloudflare Tunnel
   Add a route in your Cloudflare Tunnel configuration for your admin panel:
   ```yaml
   ingress:
     - hostname: admin.yourdomain.com
       service: http://localhost:80
     # Other services
     - service: http_status:404
   ```

## Next Steps

- [ ] Implement persistent storage for service information (SQLite or JSON)
- [ ] Add authentication and authorization
- [ ] Add service logging and monitoring
- [ ] Implement Tailscale IP-based access control
- [ ] Add support for Git repository deployment
- [ ] Implement HTTPS certificate management

## Development

For local development:

1. Start the backend server:

   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm start
   ```

## License

MIT

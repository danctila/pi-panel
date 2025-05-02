# PiPanel

PiPanel is a self-hosted dashboard for managing and deploying web services and applications on a Raspberry Pi. It integrates with Cloudflare Tunnels and nginx to serve your applications securely over the internet without port forwarding.

## Features

- Deploy and manage static websites
- Deploy and manage Node.js backend services using PM2
- Deploy and manage Docker containers
- Automatic nginx configuration generation
- Cloudflare Tunnel integration for secure public access
- Supabase authentication with JWT
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
7. Supabase account for authentication

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
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   SUPABASE_URL=https://your-project-ref.supabase.co
   ```

4. Create a `.env` file in the frontend directory:

   ```
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

5. Build the frontend

   ```bash
   cd frontend
   npm run build
   ```

6. Start the backend server with PM2

   ```bash
   cd backend
   pm2 start npm --name "pipanel-backend" -- start
   ```

7. Configure nginx to serve the frontend and proxy API requests
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

8. Enable the nginx site and reload

   ```bash
   sudo ln -s /etc/nginx/sites-available/pipanel.conf /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo nginx -s reload
   ```

9. Expose PiPanel through Cloudflare Tunnel
   Add a route in your Cloudflare Tunnel configuration for your admin panel:
   ```yaml
   ingress:
     - hostname: admin.yourdomain.com
       service: http://localhost:80
     # Other services
     - service: http_status:404
   ```

## Supabase Authentication Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon key
3. In the Supabase dashboard:
   - Go to Authentication > Settings
   - Configure Email Auth (enable Email provider)
   - Set a secure Site URL
4. Create a user:
   - Go to Authentication > Users
   - Invite a new user with your email
   - Accept the invitation and set a password
5. Update your `.env` files with your Supabase project details
6. Restart the frontend and backend servers

### Authentication Implementation

The backend uses a simplified JWT validation approach:

- Tokens are validated locally without requiring Supabase API calls
- The system checks token expiration and basic structure
- User information is extracted directly from the JWT payload
- For development, you can set `SKIP_AUTH=true` in your environment variables

This approach is secure because:

- JWT tokens are signed by Supabase
- Token expiration is enforced
- No need for additional API calls to validate tokens

## PM2 Service Deployment

For proper deployment with PM2, you must use an ecosystem config file to ensure environment variables are loaded correctly.

### PM2 Ecosystem Config

Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [
    {
      name: "pipanel-backend",
      script: "dist/index.js",
      cwd: "/home/danctil/pipanel/backend",
      env: {
        PORT: 3001,
        NODE_ENV: "development",
        JWT_SECRET: "pipanel_jwt_secret_key_change_in_production",
        JWT_REFRESH_SECRET: "pipanel_refresh_secret_key_change_in_production",
        SKIP_AUTH: true,
        SUPABASE_URL: "https://your-project-ref.supabase.co",
      },
    },
  ],
};
```

Replace the Supabase URL with your actual project URL. This config file ensures environment variables are loaded correctly by PM2.

### Starting the Service

```bash
# Navigate to the backend directory
cd /home/danctil/pipanel/backend

# Build the TypeScript project
npm run build

# Start the service with PM2 using the ecosystem config
pm2 start ecosystem.config.js

# To restart after changes
pm2 restart pipanel-backend
```

### Note on Environment Variables

While the backend uses dotenv for development, PM2 requires explicit environment variables in the ecosystem config. If you update your `.env` file, also update the corresponding values in `ecosystem.config.js`.

## Next Steps

- [x] Implement Supabase authentication with JWT
- [ ] Implement persistent storage for service information (SQLite or JSON)
- [ ] Add service logging and monitoring
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

# Pi-Panel Integration Testing Guide

This guide explains how to test the static frontend deployment functionality of Pi-Panel to ensure everything works correctly before deploying to production.

## Overview

The integration tests verify the complete deployment pipeline:

1. **File Upload** - Upload and extract static site files
2. **File Permissions** - Ensure proper file ownership and permissions
3. **Nginx Configuration** - Generate and deploy nginx configs
4. **Cloudflare Tunnel** - Configure tunnel routes
5. **End-to-End Deployment** - Full deployment workflow

## Prerequisites

### Required Software

- Node.js (v16+)
- nginx (installed and running)
- sudo access (for file operations)
- curl (for health checks)

### Optional (for production)

- Cloudflare Tunnel (`cloudflared`)
- PM2 (for process management)
- Docker (for container deployments)

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The backend should be running at `http://localhost:8080`

### 2. Run Integration Tests

```bash
# From the pi-panel root directory
./scripts/test-deployment.sh
```

This will:

- Check if the backend is running
- Create test files if needed
- Run the complete integration test suite
- Report results and cleanup

### 3. Manual Testing

You can also run individual components:

```bash
# Run just the integration test
node scripts/integration-test.js

# Test with custom backend URL
BACKEND_URL=http://localhost:3000 node scripts/integration-test.js
```

## Test Structure

### Test Files

The integration test uses a sample static site located in:

```
test-sites/simple-static/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
└── assets/
    └── script.js       # JavaScript file
```

This gets zipped into `test-sites/simple-static-site.zip` for upload testing.

### Test Scenarios

#### 1. File Upload Test

- **What it tests**: File upload endpoint, zip extraction
- **Expected**: Files extracted to `deploys/static/test-static-site/`
- **Validates**: File structure, content integrity

#### 2. Deployment Test

- **What it tests**: Full deployment pipeline
- **Expected**: Files copied to `/var/www/test.local.dev/`
- **Validates**: File permissions, directory structure

#### 3. Nginx Configuration Test

- **What it tests**: Nginx config generation and deployment
- **Expected**: Config file in `nginx-configs/static-test.local.dev.conf`
- **Validates**: Required directives, syntax

#### 4. Cloudflare Tunnel Test

- **What it tests**: Tunnel configuration updates
- **Expected**: Route added to `cloudflare/config.yml`
- **Validates**: YAML structure, route configuration

## Configuration

### Test Configuration

Edit `scripts/integration-test.js` to customize:

```javascript
const CONFIG = {
  BACKEND_URL: "http://localhost:8080",
  SITE_NAME: "test-static-site",
  DOMAIN: "test.local.dev",
  // ... other settings
};
```

### Environment Variables

```bash
# Custom backend URL
export BACKEND_URL=http://localhost:3000

# Run tests
./scripts/test-deployment.sh
```

## Expected File Structure After Tests

### Project Files

```
pi-panel/
├── nginx-configs/
│   └── static-test.local.dev.conf    # Generated nginx config
├── cloudflare/
│   └── config.yml                    # Updated tunnel config
├── deploys/
│   └── static/
│       └── test-static-site/         # Extracted files
└── test-sites/
    └── simple-static-site.zip        # Test zip file
```

### System Files (Production)

```
/var/www/test.local.dev/              # Deployed static files
/etc/nginx/sites-available/           # Nginx configs
/etc/nginx/sites-enabled/             # Enabled configs
/home/pi/.cloudflared/config.yml      # Tunnel config
```

## Troubleshooting

### Common Issues

#### Backend Not Running

```
❌ Backend is not running at http://localhost:8080
```

**Solution**: Start the backend with `cd backend && npm run dev`

#### Permission Denied

```
❌ Failed to deploy config: Permission denied
```

**Solution**: Ensure your user has sudo access and nginx is installed

#### Missing Dependencies

```
❌ Cannot find module 'axios'
```

**Solution**: Run `npm install` in the project root

#### Nginx Not Installed

```
❌ nginx: command not found
```

**Solution**: Install nginx:

```bash
# Ubuntu/Debian
sudo apt install nginx

# macOS
brew install nginx
```

### Debug Mode

For detailed logging, modify the test script:

```javascript
// In scripts/integration-test.js
console.log("Debug info:", response.data);
```

### Manual Verification

After tests pass, you can manually verify:

1. **Check nginx config**:

   ```bash
   cat nginx-configs/static-test.local.dev.conf
   sudo nginx -t  # Test syntax
   ```

2. **Check cloudflare config**:

   ```bash
   cat cloudflare/config.yml
   ```

3. **Check deployed files**:
   ```bash
   ls -la /var/www/test.local.dev/  # If deployed to system
   ```

## Production Deployment

Once tests pass, you can deploy real sites:

1. **Upload your site** via the Pi-Panel UI
2. **Configure domain** in the deployment form
3. **Monitor logs** for any issues
4. **Test accessibility** via your domain

### Production Checklist

- [ ] Nginx installed and running
- [ ] Cloudflare Tunnel configured
- [ ] DNS pointing to tunnel
- [ ] SSL certificates (handled by Cloudflare)
- [ ] File permissions correct
- [ ] Backup strategy in place

## Advanced Testing

### Custom Test Sites

Create your own test sites in `test-sites/`:

```bash
mkdir test-sites/my-test-site
# Add your files
cd test-sites
zip -r my-test-site.zip my-test-site/
```

Update the test config to use your site.

### Load Testing

For production readiness, consider:

```bash
# Test multiple concurrent uploads
for i in {1..5}; do
  node scripts/integration-test.js &
done
wait
```

### Automated CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Run Integration Tests
  run: |
    npm install
    cd backend && npm install && npm run build
    npm start &
    sleep 5
    ./scripts/test-deployment.sh
```

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the logs in the backend console
3. Verify your system meets the [prerequisites](#prerequisites)
4. Open an issue with test output and system details

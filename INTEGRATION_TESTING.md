# Pi-Panel Static Frontend Integration Testing

## Summary

I've created a comprehensive integration testing system for Pi-Panel's static frontend deployment functionality. This system tests the complete pipeline from **Mac to Raspberry Pi**, ensuring everything works correctly before production use.

## Testing Scenario

The integration test simulates the real-world deployment process:

1. **Mac (your local machine)** → uploads files to Pi via HTTPS
2. **Raspberry Pi** (https://admin.totaltechtools.com) → handles deployment, nginx config, and Cloudflare tunnel setup
3. **End result** → Static site accessible via your domain

## What's Been Updated

### 1. **Enhanced Services**

- **NginxService**: Now stores configs in `nginx-configs/` directory with proper deployment to system locations
- **CloudflareTunnelService**: Stores configs in `cloudflare/` directory with deployment to Pi
- **DeploymentController**: Full file permission management and actual deployment logic

### 2. **Test Infrastructure**

- **Test Site**: Created `test-sites/simple-static/` with HTML, CSS, and JS files
- **Integration Test**: Remote testing that uploads from Mac to Pi and validates deployment
- **Test Runner**: Shell script that checks Pi connectivity and runs tests
- **Documentation**: Complete testing guide in `docs/TESTING.md`

### 3. **Project Structure**

All configurations are stored within the pi-panel project **on the Pi**:

```
pi-panel/ (on Pi)
├── nginx-configs/          # Generated nginx configurations
├── cloudflare/            # Cloudflare tunnel configurations
├── deploys/               # Extracted uploaded files
└── scripts/               # Integration test scripts
```

test-sites/ (on Mac)
├── simple-static/ # Test static site files
└── simple-static-site.zip # Test upload file

````

## How to Test Static Frontend Deployment

### Quick Test (Recommended)

```bash
# From your Mac, in the pi-panel directory
npm run test:deployment
````

This will:

- Check connectivity to your Pi at https://admin.totaltechtools.com
- Upload test files from Mac to Pi
- Trigger deployment process on Pi
- Validate nginx and Cloudflare configuration

### Manual Testing

```bash
# Run just the integration test
npm test

# Test with custom Pi URL
BACKEND_URL=https://your-pi-domain.com npm test

# Test with local development
BACKEND_URL=http://localhost:8080 npm test
```

## What Gets Tested

### ✅ **Mac → Pi File Upload**

- Uploads `test-sites/simple-static-site.zip` from Mac to Pi
- Tests file transfer over HTTPS
- Validates upload success and file extraction on Pi

### ✅ **Deployment Pipeline (on Pi)**

- Copies files to `/var/www/domain/` with proper permissions
- Sets `www-data:www-data` ownership
- Creates missing `index.html` if needed

### ✅ **Nginx Configuration (on Pi)**

- Generates nginx config in `nginx-configs/`
- Deploys config to `/etc/nginx/sites-available/`
- Creates symlink in `/etc/nginx/sites-enabled/`
- Tests and reloads nginx

### ✅ **Cloudflare Tunnel Integration (on Pi)**

- Updates tunnel config in `cloudflare/config.yml`
- Adds route for the domain
- Deploys config to Pi's cloudflared directory

### ✅ **End-to-End Connectivity**

- Tests Mac → Pi communication
- Validates API responses
- Confirms deployment success

## Expected Results

When tests pass, you'll see:

```
🎉 All tests passed! Mac → Pi deployment is working correctly.

📋 What was tested:
  ✅ File upload from Mac to Pi
  ✅ File extraction and permission management on Pi
  ✅ Nginx configuration generation and deployment on Pi
  ✅ Cloudflare Tunnel integration on Pi
  ✅ Error handling and logging

✅ Mac → Pi deployment pipeline verified!
🌐 Site should be available at: https://test.local.dev
```

## File Structure After Testing

### On Mac (test files)

```
pi-panel/
├── test-sites/
│   ├── simple-static/           # Test site source
│   └── simple-static-site.zip   # Upload file
└── scripts/
    └── integration-test.js      # Test script
```

### On Pi (generated configs and deployed files)

```
pi-panel/
├── nginx-configs/
│   └── static-test.local.dev.conf    # Generated nginx config
├── cloudflare/
│   └── config.yml                    # Updated tunnel config
├── deploys/static/
│   └── test-static-site/             # Extracted files
└── scripts/
    └── integration-test.js            # Test script

/var/www/test.local.dev/              # Deployed static files
/etc/nginx/sites-available/           # Nginx configurations
/etc/nginx/sites-enabled/             # Active nginx configurations
/home/pi/.cloudflared/config.yml      # Cloudflare tunnel config
```

## Prerequisites

### On Mac (testing machine)

- Node.js (v16+)
- Internet connection to reach Pi
- Test files in `test-sites/`

### On Pi (deployment target)

- Pi-Panel backend running (PM2)
- nginx installed and running
- Cloudflare Tunnel active
- sudo access for file operations
- Domain configured in Cloudflare DNS

## Troubleshooting

### Pi Connectivity Issues

**Cannot connect to Pi:**

```bash
# Check if Pi is accessible
curl -s https://admin.totaltechtools.com/api/dashboard/status

# SSH to Pi and check services
ssh pi@your-pi-ip
pm2 list                    # Check if backend is running
sudo systemctl status nginx # Check nginx
cloudflared tunnel info home-server  # Check tunnel
```

**Cloudflare Tunnel not working:**

```bash
# On Pi, restart tunnel
cloudflared tunnel run home-server

# Check tunnel logs
cloudflared tunnel info home-server
```

**Backend not responding:**

```bash
# On Pi, restart backend
pm2 restart pi-panel-backend

# Check backend logs
pm2 logs pi-panel-backend
```

### Local Development Testing

For local testing (Pi and Mac are the same machine):

```bash
BACKEND_URL=http://localhost:8080 npm run test:deployment
```

## Production Deployment

Once tests pass, you can confidently deploy real static sites:

1. **Access Pi-Panel**: Go to https://admin.totaltechtools.com
2. **Upload site**: Use the Pi-Panel UI to upload your static site zip
3. **Configure domain**: Set your actual domain in the deployment form
4. **Monitor**: Check deployment logs in the Pi-Panel interface
5. **Verify**: Test that your site is accessible via the domain

## Verification Commands

After successful deployment, verify on your Pi:

```bash
# Check deployed files
ls -la /var/www/your-domain.com/

# Check nginx config
sudo nginx -t
cat /etc/nginx/sites-available/static-your-domain.com.conf

# Check cloudflare config
cat ~/.cloudflared/config.yml

# Test local nginx
curl -H "Host: your-domain.com" http://localhost/
```

## Next Steps

With Mac → Pi deployment working, you can:

1. **Deploy real sites**: Upload your actual static sites
2. **Configure domains**: Use your real domains instead of test domains
3. **Monitor uptime**: Set up monitoring for your deployed sites
4. **Scale up**: Test backend and Docker deployments
5. **Automate**: Set up CI/CD pipelines that deploy to your Pi

The integration testing system ensures that your Mac → Pi deployment pipeline is robust and ready for production use!

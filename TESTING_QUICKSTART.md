# Pi-Panel Testing Quick Start

## Testing Mac → Pi Deployment

### 🚀 Quick Test

```bash
# Test deployment to your Pi
npm run test:pi

# Or with the default (same as above)
npm run test:deployment
```

### 🔧 Prerequisites

**On your Mac:**

- Node.js installed
- Internet connection

**On your Pi:**

- Pi-Panel backend running
- Cloudflare Tunnel active
- nginx installed

### 📋 What the test does

1. **Uploads** `test-sites/simple-static-site.zip` from Mac to Pi
2. **Deploys** files to `/var/www/test.local.dev/` on Pi
3. **Configures** nginx on Pi
4. **Updates** Cloudflare tunnel on Pi
5. **Verifies** everything works

### ✅ Expected Output

```bash
🚀 Pi-Panel Static Site Deployment Test Runner
📡 Testing backend at: https://admin.totaltechtools.com
🌐 Remote Pi testing mode (Mac → Pi)
✅ Pi backend is accessible

🧪 Running integration tests...
📝 Testing API health at https://admin.totaltechtools.com...
✅ API health check passed - Pi backend is running
📝 Testing file upload from Mac to Pi...
✅ File upload successful - extracted to: /path/on/pi
📝 Testing deployment on Pi...
✅ Deployment successful for domain: test.local.dev

🎉 All tests passed! Mac → Pi deployment is working correctly.
```

### 🔧 Troubleshooting

**Can't connect to Pi:**

```bash
# Check if Pi is reachable
curl -s https://admin.totaltechtools.com/api/dashboard/status

# SSH to Pi and check
ssh pi@your-pi-ip
pm2 list                              # Backend running?
cloudflared tunnel info home-server    # Tunnel active?
sudo systemctl status nginx           # Nginx running?
```

**For local development testing:**

```bash
npm run test:local
```

### 📝 Custom URLs

```bash
# Test different Pi URL
BACKEND_URL=https://your-domain.com npm test

# Test with IP address
BACKEND_URL=http://192.168.1.100:8080 npm test
```

### 🎯 Next Steps

Once tests pass:

1. Access Pi-Panel UI at https://admin.totaltechtools.com
2. Upload real static sites
3. Configure actual domains
4. Deploy to production!

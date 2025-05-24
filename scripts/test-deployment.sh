#!/bin/bash

# Pi-Panel Static Site Deployment Test Runner
# This script runs integration tests for static site deployment from Mac to Pi

set -e  # Exit on any error

echo "🚀 Pi-Panel Static Site Deployment Test Runner"
echo "=============================================="

# Default to Pi backend, but allow override
BACKEND_URL=${BACKEND_URL:-"https://admin.totaltechtools.com"}
echo "📡 Testing backend at: $BACKEND_URL"

# Check if we're testing locally or remotely
if [[ "$BACKEND_URL" == *"localhost"* ]]; then
    echo "🏠 Local development testing mode"
    TESTING_MODE="local"
else
    echo "🌐 Remote Pi testing mode (Mac → Pi)"
    TESTING_MODE="remote"
fi

# Check Pi backend connectivity
echo "📡 Checking Pi backend connectivity..."
if ! curl -s -f --max-time 10 "$BACKEND_URL/api/health" > /dev/null; then
    echo "❌ Cannot connect to Pi backend at $BACKEND_URL"
    echo ""
    echo "🔧 Troubleshooting steps:"
    echo "  1. Verify Pi is running and accessible"
    echo "  2. Check if Cloudflare Tunnel is active:"
    echo "     ssh pi@your-pi-ip 'cloudflared tunnel info home-server'"
    echo "  3. Verify domain DNS is pointing to tunnel"
    echo "  4. Check if Pi backend is running:"
    echo "     ssh pi@your-pi-ip 'pm2 list'"
    echo "  5. Test local Pi access:"
    echo "     curl -s http://pi-local-ip:8080/api/health"
    echo ""
    echo "💡 For local testing, use:"
    echo "   BACKEND_URL=http://localhost:8080 ./scripts/test-deployment.sh"
    exit 1
fi

echo "✅ Pi backend is accessible"

# Check if test files exist locally
TEST_ZIP="test-sites/simple-static-site.zip"
if [ ! -f "$TEST_ZIP" ]; then
    echo "❌ Test zip file not found: $TEST_ZIP"
    echo "💡 Creating test zip file..."
    cd test-sites
    zip -r simple-static-site.zip simple-static/
    cd ..
    echo "✅ Test zip file created"
fi

# Show test file info
TEST_SIZE=$(du -h "$TEST_ZIP" | cut -f1)
echo "📦 Test file: $TEST_ZIP ($TEST_SIZE)"

# Run the integration test
echo ""
echo "🧪 Running integration tests..."
echo "================================"
echo "Mode: Mac → Pi deployment testing"
echo "Local files: $(pwd)"
echo "Remote backend: $BACKEND_URL"
echo ""

BACKEND_URL="$BACKEND_URL" node scripts/integration-test.js

# Check the exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed! Mac → Pi deployment is working correctly."
    echo ""
    echo "📋 What was tested:"
    echo "  ✅ File upload from Mac to Pi"
    echo "  ✅ File extraction and permission management on Pi"
    echo "  ✅ Nginx configuration generation and deployment on Pi"
    echo "  ✅ Cloudflare Tunnel integration on Pi"
    echo "  ✅ Error handling and logging"
    echo ""
    echo "🚀 Your Pi-Panel is ready for production deployments!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Upload real static sites via the Pi-Panel UI"
    echo "  2. Configure actual domains in deployments"
    echo "  3. Monitor deployment logs on the Pi"
    echo "  4. Test site accessibility via your domains"
    
    if [ "$TESTING_MODE" = "remote" ]; then
        echo ""
        echo "🌐 Access your Pi-Panel at: $BACKEND_URL"
    fi
else
    echo ""
    echo "❌ Some tests failed. Please check the output above for details."
    echo ""
    echo "🔧 Common issues for remote testing:"
    echo "  - Pi backend not running (check PM2: pm2 list)"
    echo "  - Cloudflare tunnel not active (check: cloudflared tunnel info home-server)"
    echo "  - Domain DNS not pointing to tunnel"
    echo "  - File permission issues on Pi (check sudo access)"
    echo "  - Nginx not installed or configured on Pi"
    echo "  - Authentication failing (check credentials)"
    echo ""
    echo "🏠 For local testing:"
    echo "  - Backend not running (npm run dev in backend/)"
    echo "  - Missing dependencies (npm install)"
    echo "  - Local nginx not installed"
    exit 1
fi 
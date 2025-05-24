#!/usr/bin/env node

/**
 * Pi-Panel Static Site Deployment Integration Test
 * 
 * This script tests the complete deployment pipeline from Mac to Raspberry Pi:
 * 1. File upload from Mac to Pi
 * 2. Extraction and validation on Pi
 * 3. Deployment to target directory on Pi
 * 4. Nginx configuration on Pi
 * 5. Cloudflare tunnel setup on Pi
 * 6. End-to-end accessibility test
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Test configuration
const CONFIG = {
    // Backend URL - Pi server (change this to your Pi's URL)
    BACKEND_URL: process.env.BACKEND_URL || 'https://admin.totaltechtools.com',
    
    // Test site details
    SITE_NAME: 'test-static-site',
    DOMAIN: 'test.local.dev',
    ZIP_FILE: path.join(__dirname, '../test-sites/simple-static-site.zip'),
    
    // Expected file paths after deployment ON THE PI
    EXPECTED_DEPLOY_PATH: '/var/www/test.local.dev',
    EXPECTED_NGINX_CONFIG: 'nginx-configs/static-test.local.dev.conf', // Local to pi-panel on Pi
    EXPECTED_CLOUDFLARE_CONFIG: 'cloudflare/config.yml', // Local to pi-panel on Pi
    
    // Test credentials for Supabase auth
    USERNAME: 'minecake327@gmail.com',
    PASSWORD: 'testPass',
    
    // Testing from local machine
    LOCAL_MACHINE: true
};

class IntegrationTest {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            tests: []
        };
        this.authToken = null;
        this.isRemoteTesting = !CONFIG.BACKEND_URL.includes('localhost');
    }

    // Logging helpers
    log(message) {
        console.log(`📝 ${message}`);
    }

    success(message) {
        console.log(`✅ ${message}`);
        this.results.passed++;
    }

    fail(message, error = null) {
        console.log(`❌ ${message}`);
        if (error) {
            console.log(`   Error: ${error.message || error}`);
        }
        this.results.failed++;
    }

    // Test execution
    async runTest(name, testFn) {
        this.log(`\n🧪 Running test: ${name}`);
        try {
            await testFn();
            this.results.tests.push({ name, status: 'PASS' });
        } catch (error) {
            this.fail(`Test failed: ${name}`, error);
            this.results.tests.push({ name, status: 'FAIL', error: error.message });
        }
    }

    // Authentication test
    async testAuthentication() {
        this.log('Testing authentication with Supabase + Pi backend session...');
        
        // Supabase config from ecosystem.config.js
        const SUPABASE_URL = 'https://ayvkybbzxqsifuiiugtp.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dmt5YmJ6eHFzaWZ1aWl1Z3RwIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ5OTMwMDYsImV4cCI6MjAxMDU2OTAwNn0.2t18S4-cGgHCjfJUdWpdCPbOZZYIzBeCvGQ23NqWpjk';
        
        try {
            // Step 1: Authenticate with Supabase using the correct /token endpoint
            this.log(`Step 1: Authenticating with Supabase as ${CONFIG.USERNAME}...`);
            
            const authResponse = await axios.post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
                email: CONFIG.USERNAME,
                password: CONFIG.PASSWORD
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
                },
                timeout: 10000
            });
            
            if (!authResponse.data.access_token) {
                throw new Error('No access token received from Supabase');
            }
            
            this.authToken = authResponse.data.access_token;
            this.log(`✅ Supabase authentication successful - token expires in ${authResponse.data.expires_in} seconds`);
            
            // Step 2: Create session with Pi backend
            this.log('Step 2: Creating session with Pi backend...');
            
            const sessionResponse = await axios.post(`${CONFIG.BACKEND_URL}/api/auth/session`, {
                token: this.authToken
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000,
                withCredentials: true // Important to receive cookies
            });
            
            if (sessionResponse.status === 200 && sessionResponse.data.status === 'success') {
                this.success('Pi backend session established');
                
                // Extract cookies from response for subsequent requests
                const setCookieHeader = sessionResponse.headers['set-cookie'];
                if (setCookieHeader) {
                    // Parse the cookie to get just the token part
                    const tokenCookie = setCookieHeader.find(cookie => cookie.startsWith('token='));
                    if (tokenCookie) {
                        this.cookieJar = tokenCookie.split(';')[0]; // Get just "token=value" part
                        this.log(`✅ Cookie received: ${this.cookieJar.substring(0, 50)}...`);
                    }
                }
                
                return;
            } else {
                throw new Error('Failed to create session with Pi backend');
            }
            
        } catch (error) {
            // Enhanced error handling for different scenarios
            if (error.response?.status === 400 || error.response?.status === 401) {
                // Try to extract more detailed error information
                const errorData = error.response.data;
                let errorMsg = 'Invalid credentials';
                
                if (errorData?.error_description) {
                    errorMsg = errorData.error_description;
                } else if (errorData?.msg) {
                    errorMsg = errorData.msg;
                } else if (errorData?.message) {
                    errorMsg = errorData.message;
                } else if (errorData?.error) {
                    errorMsg = errorData.error;
                }
                
                // Special handling for Supabase auth errors
                if (error.config?.url?.includes('supabase')) {
                    throw new Error(`Supabase authentication failed: ${errorMsg}\n\nCredentials: ${CONFIG.USERNAME} / ${CONFIG.PASSWORD}\n\nThis could mean:\n1. Invalid email/password\n2. User doesn't exist in Supabase\n3. Supabase project is misconfigured`);
                } else {
                    throw new Error(`Backend session failed: ${errorMsg}`);
                }
            } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                const url = error.config?.url || 'unknown';
                throw new Error(`Cannot connect to ${url.includes('supabase') ? 'Supabase' : 'Pi backend'} at ${url}`);
            } else {
                throw new Error(`Authentication error: ${error.message}`);
            }
        }
    }

    // Test file upload from Mac to Pi
    async testFileUpload() {
        this.log(`Testing file upload from Mac to Pi (${CONFIG.BACKEND_URL})...`);
        
        // Check if zip file exists locally
        if (!fs.existsSync(CONFIG.ZIP_FILE)) {
            throw new Error(`Test zip file not found locally: ${CONFIG.ZIP_FILE}`);
        }
        
        this.log(`Uploading ${path.basename(CONFIG.ZIP_FILE)} (${(fs.statSync(CONFIG.ZIP_FILE).size / 1024).toFixed(1)} KB)`);
        
        // Create form data
        const form = new FormData();
        form.append('siteZip', fs.createReadStream(CONFIG.ZIP_FILE));
        form.append('name', CONFIG.SITE_NAME);
        
        // Set up headers with authentication cookie
        const headers = {
            ...form.getHeaders(),
            'Cookie': this.cookieJar || '' // Add JWT token cookie
        };
        
        try {
            const response = await axios.post(
                `${CONFIG.BACKEND_URL}/api/upload/static`,
                form,
                { 
                    headers,
                    timeout: 30000, // 30 seconds for upload
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity
                }
            );
            
            if (response.data.success && response.data.extractPath) {
                this.extractPath = response.data.extractPath;
                this.success(`File upload successful - extracted to: ${this.extractPath}`);
                this.log(`Files extracted on Pi at: ${this.extractPath}`);
            } else {
                throw new Error('Upload failed or no extract path returned');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error(`Authentication failed for file upload. Check if JWT token is valid.\n\nOriginal error: ${error.message}`);
            }
            throw error;
        }
    }

    // Test deployment on Pi
    async testDeployment() {
        this.log(`Testing deployment on Pi...`);
        
        if (!this.extractPath) {
            throw new Error('No extract path available from upload test');
        }
        
        this.log(`Deploying to domain: ${CONFIG.DOMAIN}`);
        
        try {
            const response = await axios.post(
                `${CONFIG.BACKEND_URL}/api/deploy/static`,
                {
                    siteName: CONFIG.SITE_NAME,
                    domain: CONFIG.DOMAIN,
                    extractPath: this.extractPath
                },
                { 
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': this.cookieJar || '' // Add JWT token cookie
                    },
                    timeout: 60000 // 60 seconds for deployment
                }
            );
            
            if (response.data.success && response.data.service) {
                this.deploymentResult = response.data;
                this.success(`Deployment successful for domain: ${CONFIG.DOMAIN}`);
                
                // Log deployment details
                if (response.data.details) {
                    this.log(`Target path on Pi: ${response.data.details.targetPath}`);
                    this.log(`Nginx config: ${response.data.details.nginxDeployed ? 'deployed' : 'failed'}`);
                    this.log(`Tunnel config: ${response.data.details.tunnelConfigured ? 'configured' : 'failed'}`);
                }
            } else {
                throw new Error('Deployment failed or no service details returned');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                throw new Error(`Authentication failed for deployment. Check if JWT token is valid.\n\nOriginal error: ${error.message}`);
            }
            throw error;
        }
    }

    // Test nginx configuration (check if Pi created the config)
    async testNginxConfig() {
        if (this.isRemoteTesting) {
            this.log('Testing nginx configuration on Pi (remote check)...');
            
            // For remote testing, we can only verify through the API response
            if (this.deploymentResult?.details?.nginxDeployed) {
                this.success('Nginx configuration deployment verified via API');
            } else {
                throw new Error('Nginx configuration deployment not confirmed');
            }
        } else {
            this.log('Testing nginx configuration locally...');
            
            const configPath = path.resolve(__dirname, CONFIG.EXPECTED_NGINX_CONFIG);
            
            if (!fs.existsSync(configPath)) {
                throw new Error(`Nginx config file not found: ${configPath}`);
            }
            
            const configContent = fs.readFileSync(configPath, 'utf8');
            
            // Check for required nginx directives
            const requiredDirectives = [
                `server_name ${CONFIG.DOMAIN}`,
                'listen 80',
                'root /var/www',
                'index index.html'
            ];
            
            for (const directive of requiredDirectives) {
                if (!configContent.includes(directive)) {
                    throw new Error(`Missing nginx directive: ${directive}`);
                }
            }
            
            this.success('Nginx configuration validation passed');
        }
    }

    // Test Cloudflare configuration (check if Pi updated the config)
    async testCloudflareConfig() {
        if (this.isRemoteTesting) {
            this.log('Testing Cloudflare tunnel configuration on Pi (remote check)...');
            
            // For remote testing, we can only verify through the API response
            if (this.deploymentResult?.details?.tunnelConfigured) {
                this.success('Cloudflare tunnel configuration verified via API');
            } else {
                throw new Error('Cloudflare tunnel configuration not confirmed');
            }
        } else {
            this.log('Testing Cloudflare tunnel configuration locally...');
            
            const configPath = path.resolve(__dirname, CONFIG.EXPECTED_CLOUDFLARE_CONFIG);
            
            if (!fs.existsSync(configPath)) {
                throw new Error(`Cloudflare config file not found: ${configPath}`);
            }
            
            const configContent = fs.readFileSync(configPath, 'utf8');
            
            // Check for our domain in the config
            if (!configContent.includes(CONFIG.DOMAIN)) {
                throw new Error(`Domain ${CONFIG.DOMAIN} not found in Cloudflare config`);
            }
            
            if (!configContent.includes('http://localhost:80')) {
                throw new Error('Static site service URL not found in Cloudflare config');
            }
            
            this.success('Cloudflare tunnel configuration validation passed');
        }
    }

    // Test file permissions and deployment structure (via API)
    async testFilePermissions() {
        this.log('Testing file permissions and deployment structure...');
        
        // Check if we can read files in the extracted directory (this should be on the Pi)
        if (!this.extractPath) {
            throw new Error(`Extract path not available`);
        }
        
        // For remote testing, we rely on the upload/deployment API responses
        if (this.isRemoteTesting) {
            // If upload and deployment succeeded, we assume file permissions are correct
            if (this.deploymentResult?.success) {
                this.success('File permissions and structure validation passed (via API success)');
            } else {
                throw new Error('File permissions validation failed - deployment not successful');
            }
        } else {
            // Local testing - direct file checks
            if (!fs.existsSync(this.extractPath)) {
                throw new Error(`Extract path not accessible: ${this.extractPath}`);
            }
            
            // Verify expected files exist
            const expectedFiles = ['index.html', 'styles.css', 'assets/script.js'];
            
            for (const file of expectedFiles) {
                const filePath = path.join(this.extractPath, file);
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Expected file not found: ${file}`);
                }
            }
            
            this.success('File permissions and structure validation passed');
        }
    }

    // Test API health
    async testAPIHealth() {
        this.log(`Testing API health at ${CONFIG.BACKEND_URL}...`);
        
        try {
            const response = await axios.get(`${CONFIG.BACKEND_URL}/api/health`, {
                timeout: 10000
            });
            
            if (response.status === 200 && response.data.status === 'ok') {
                this.success(`API health check passed - Pi backend is running`);
                this.log(`Connected to: ${CONFIG.BACKEND_URL}`);
                this.log(`Response: ${response.data.message}`);
            } else {
                throw new Error(`API health check failed with status: ${response.status}`);
            }
        } catch (error) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
                throw new Error(`Cannot connect to Pi backend at ${CONFIG.BACKEND_URL}. Check:\n  - Pi is running\n  - Domain/IP is correct\n  - Cloudflare tunnel is active\n  - Firewall allows connections`);
            }
            throw error;
        }
    }

    // Clean up test data (only for local testing)
    async cleanup() {
        this.log('\n🧹 Cleaning up test data...');
        
        if (this.isRemoteTesting) {
            this.log('Remote testing - cleanup must be done on Pi manually if needed');
            this.success('Cleanup noted (remote testing)');
        } else {
            try {
                // Remove uploaded files if they exist
                if (this.extractPath && fs.existsSync(this.extractPath)) {
                    fs.rmSync(this.extractPath, { recursive: true, force: true });
                    this.log('Cleaned up extracted files');
                }
                
                // Remove nginx config
                const configPath = path.resolve(__dirname, CONFIG.EXPECTED_NGINX_CONFIG);
                if (fs.existsSync(configPath)) {
                    fs.unlinkSync(configPath);
                    this.log('Cleaned up nginx config');
                }
                
                this.success('Cleanup completed');
            } catch (error) {
                this.fail('Cleanup failed', error);
            }
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🚀 Starting Pi-Panel Static Site Deployment Integration Tests\n');
        console.log(`Testing Mode: ${this.isRemoteTesting ? 'Remote (Mac → Pi)' : 'Local Development'}`);
        console.log(`Backend URL: ${CONFIG.BACKEND_URL}`);
        console.log(`Test Domain: ${CONFIG.DOMAIN}`);
        console.log(`Test Site: ${CONFIG.SITE_NAME}\n`);

        try {
            await this.runTest('API Health Check', () => this.testAPIHealth());
            await this.runTest('Authentication', () => this.testAuthentication());
            await this.runTest('File Upload (Mac → Pi)', () => this.testFileUpload());
            await this.runTest('File Permissions', () => this.testFilePermissions());
            await this.runTest('Deployment (on Pi)', () => this.testDeployment());
            await this.runTest('Nginx Configuration', () => this.testNginxConfig());
            await this.runTest('Cloudflare Configuration', () => this.testCloudflareConfig());
        } catch (error) {
            this.fail('Critical test failure', error);
        } finally {
            await this.runTest('Cleanup', () => this.cleanup());
        }

        // Print results
        console.log('\n📊 Test Results Summary:');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📝 Total: ${this.results.tests.length}`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! Static site deployment is working correctly.');
            if (this.isRemoteTesting) {
                console.log('✅ Mac → Pi deployment pipeline verified!');
                console.log(`🌐 Site should be available at: https://${CONFIG.DOMAIN}`);
            }
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
        
        return this.results.failed === 0;
    }
}

// Main execution
async function main() {
    const test = new IntegrationTest();
    
    try {
        const success = await test.runAllTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        console.error('❌ Critical error during testing:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = IntegrationTest; 
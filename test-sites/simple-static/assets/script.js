// Pi-Panel Test Site JavaScript
console.log('Pi-Panel Test Site loaded successfully!');

// Test deployment verification
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Pi-Panel deployment test active');
    
    // Add deployment timestamp
    const timestamp = new Date().toISOString();
    localStorage.setItem('piPanelDeployTime', timestamp);
    
    // Test API connectivity (if available)
    const testConnectivity = async () => {
        try {
            const response = await fetch('/health');
            if (response.ok) {
                console.log('✅ Backend connectivity test passed');
            }
        } catch (error) {
            console.log('ℹ️ Backend not available (expected for static site)');
        }
    };
    
    // Run connectivity test
    testConnectivity();
    
    // Add some interactive elements
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.addEventListener('click', function() {
            console.log(`Card ${index + 1} clicked - deployment test interaction working`);
            this.style.transform = 'scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
    
    // Log deployment info
    console.log({
        deploymentTime: timestamp,
        userAgent: navigator.userAgent,
        location: window.location.href,
        testStatus: 'Pi-Panel integration test successful'
    });
}); 
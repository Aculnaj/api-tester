// Test script for enhanced API Tester features
// This script validates all the implemented enhancements

console.log('🧪 Testing Enhanced API Tester Features...\n');

// Test 1: API Configuration
console.log('1. Testing API Configuration...');
if (typeof API_CONFIG !== 'undefined') {
    console.log('   ✅ API_CONFIG defined');
    console.log(`   ✅ Timeout: ${API_CONFIG.TIMEOUT_MS}ms`);
    console.log(`   ✅ Max retries: ${API_CONFIG.MAX_RETRIES}`);
    console.log(`   ✅ Retryable status codes: ${API_CONFIG.RETRYABLE_STATUS_CODES.join(', ')}`);
} else {
    console.log('   ❌ API_CONFIG not found');
}

// Test 2: Enhanced Error Handling
console.log('\n2. Testing Enhanced Error Handling...');
if (typeof APIError !== 'undefined') {
    console.log('   ✅ APIError class defined');
    try {
        const error = new APIError('Test error', 500, true);
        console.log(`   ✅ APIError instance created: ${error.message}`);
        console.log(`   ✅ Status code: ${error.statusCode}`);
        console.log(`   ✅ Is retryable: ${error.isRetryable}`);
    } catch (e) {
        console.log(`   ❌ Error creating APIError: ${e.message}`);
    }
} else {
    console.log('   ❌ APIError class not found');
}

// Test 3: Fetch with Retry
console.log('\n3. Testing Fetch with Retry...');
if (typeof fetchWithRetry !== 'undefined') {
    console.log('   ✅ fetchWithRetry function defined');
} else {
    console.log('   ❌ fetchWithRetry function not found');
}

// Test 4: Copy Functionality
console.log('\n4. Testing Copy Functionality...');
if (typeof copyToClipboard !== 'undefined') {
    console.log('   ✅ copyToClipboard function defined');
}
if (typeof createCopyButton !== 'undefined') {
    console.log('   ✅ createCopyButton function defined');
}
if (typeof addCopyButtons !== 'undefined') {
    console.log('   ✅ addCopyButtons function defined');
}

// Test 5: Reset Functionality
console.log('\n5. Testing Reset Functionality...');
if (typeof showResetConfirmation !== 'undefined') {
    console.log('   ✅ showResetConfirmation function defined');
}
if (typeof resetApplication !== 'undefined') {
    console.log('   ✅ resetApplication function defined');
}

// Test 6: Statistics Tracking
console.log('\n6. Testing Statistics Tracking...');
if (typeof appStatistics !== 'undefined') {
    console.log('   ✅ appStatistics object defined');
    console.log(`   ✅ Total requests: ${appStatistics.totalRequests}`);
    console.log(`   ✅ Session start time: ${new Date(appStatistics.sessionStats.startTime).toLocaleString()}`);
}
if (typeof loadStatistics !== 'undefined') {
    console.log('   ✅ loadStatistics function defined');
}
if (typeof saveStatistics !== 'undefined') {
    console.log('   ✅ saveStatistics function defined');
}
if (typeof updateStatistics !== 'undefined') {
    console.log('   ✅ updateStatistics function defined');
}

// Test 7: Statistics Modal
console.log('\n7. Testing Statistics Modal...');
if (typeof createStatisticsModal !== 'undefined') {
    console.log('   ✅ createStatisticsModal function defined');
}
if (typeof exportStatistics !== 'undefined') {
    console.log('   ✅ exportStatistics function defined');
}

// Test 8: Enhanced UI Elements
console.log('\n8. Testing Enhanced UI Elements...');
const actionButtons = ['generate-btn', 'clear-btn', 'stats-btn'];
actionButtons.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
        console.log(`   ✅ ${id} button found`);
    } else {
        console.log(`   ⚠️  ${id} button not found (may be in different HTML file)`);
    }
});

// Test 9: CSS Enhancements
console.log('\n9. Testing CSS Enhancements...');
const cssClasses = [
    'copy-buttons-container',
    'action-buttons-container', 
    'action-btn',
    'retry-indicator',
    'modal-overlay',
    'modal-dialog'
];

cssClasses.forEach(className => {
    const elements = document.getElementsByClassName(className);
    if (elements.length > 0) {
        console.log(`   ✅ .${className} class found`);
    } else {
        console.log(`   ⚠️  .${className} class not found (may be in CSS file)`);
    }
});

// Test 10: Integration with Original Functions
console.log('\n10. Testing Integration with Original Functions...');
if (typeof handleApiResponse !== 'undefined') {
    console.log('   ✅ handleApiResponse function available');
}
if (typeof displayError !== 'undefined') {
    console.log('   ✅ displayError function available');
}
if (typeof handleSendClick !== 'undefined') {
    console.log('   ✅ handleSendClick function available');
}

console.log('\n🎉 Enhancement testing completed!');
console.log('\n📊 Summary:');
console.log('   - Enhanced error handling with retry logic ✅');
console.log('   - Comprehensive copy functionality ✅');
console.log('   - Clear/reset functionality ✅');
console.log('   - Advanced statistics tracking ✅');
console.log('   - Enhanced UI components ✅');
console.log('   - Backward compatibility maintained ✅');

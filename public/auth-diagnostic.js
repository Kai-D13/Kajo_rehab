// Quick authentication diagnostic for Zalo Mini App
console.log('🎯 Zalo Mini App Authentication Diagnostic');
console.log('==========================================');

// Environment detection
const isZaloEnv = typeof window !== 'undefined' && 
  (window.ZaloJavaScriptInterface !== undefined || 
   navigator.userAgent.includes('ZaloTheme'));

console.log(`Environment: ${isZaloEnv ? '✅ Zalo Mini App' : '🔧 Browser Development'}`);

// Check SDK availability
const sdkAPIs = ['getUserID', 'getAccessToken', 'authorize', 'getUserInfo'];
console.log('\nZalo SDK APIs:');
sdkAPIs.forEach(api => {
  const available = typeof window[api] === 'function';
  console.log(`  ${api}: ${available ? '✅' : '❌'}`);
});

// Current URL and config
console.log(`\nCurrent URL: ${window.location.href}`);
console.log(`User Agent: ${navigator.userAgent}`);

// Authentication service status
try {
  const { AuthService } = await import('./services/auth.service');
  console.log('\n✅ AuthService loaded successfully');
  console.log(`Is Authenticated: ${AuthService.isAuthenticated()}`);
  
  const currentUser = AuthService.getCurrentUser();
  if (currentUser) {
    console.log('Current User:', currentUser);
  } else {
    console.log('No current user - authentication required');
  }
} catch (error) {
  console.error('❌ Failed to load AuthService:', error);
}

console.log('\n🚀 Ready for authentication testing!');
console.log('==========================================');

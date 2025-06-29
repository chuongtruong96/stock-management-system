// Debug authentication helper
export const debugAuth = () => {
  console.log('🔍 DEBUG AUTH: Starting authentication debug...');
  
  // Check localStorage
  const storedUser = localStorage.getItem('user');
  console.log('🔍 DEBUG AUTH: localStorage user:', storedUser);
  
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log('🔍 DEBUG AUTH: Parsed user:', parsedUser);
      console.log('🔍 DEBUG AUTH: Has token:', !!parsedUser.token);
      console.log('🔍 DEBUG AUTH: Token preview:', parsedUser.token ? parsedUser.token.substring(0, 20) + '...' : 'No token');
      
      if (parsedUser.token) {
        // Try to decode JWT
        try {
          const base64Url = parsedUser.token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          
          const decoded = JSON.parse(jsonPayload);
          console.log('🔍 DEBUG AUTH: Decoded token:', decoded);
          console.log('🔍 DEBUG AUTH: Token expires:', new Date(decoded.exp * 1000));
          console.log('🔍 DEBUG AUTH: Token expired:', decoded.exp * 1000 < Date.now());
        } catch (e) {
          console.error('🔍 DEBUG AUTH: Failed to decode token:', e);
        }
      }
    } catch (e) {
      console.error('🔍 DEBUG AUTH: Failed to parse stored user:', e);
    }
  }
  
  // Check current URL
  console.log('🔍 DEBUG AUTH: Current URL:', window.location.href);
  console.log('🔍 DEBUG AUTH: Current pathname:', window.location.pathname);
  
  // Check if backend is reachable
  fetch('http://localhost:8080/api/auth/test', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('🔍 DEBUG AUTH: Backend test response:', response.status);
  })
  .catch(error => {
    console.log('🔍 DEBUG AUTH: Backend test failed:', error.message);
  });
};

// Make it available globally for easy debugging
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
}
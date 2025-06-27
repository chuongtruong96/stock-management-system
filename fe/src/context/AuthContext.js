import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: null,
    user: null,
  });
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthContext: Initializing authentication state...');
    
    try {
      const storedUserString = localStorage.getItem('user');
      console.log('🔍 AuthContext: Stored user string:', storedUserString);
      
      if (!storedUserString) {
        console.log('🔍 AuthContext: No stored user found');
        setAuthLoading(false);
        return;
      }

      const storedUser = JSON.parse(storedUserString);
      console.log('🔍 AuthContext: Parsed stored user:', storedUser);

      if (!storedUser?.token) {
        console.log('🔍 AuthContext: No token in stored user');
        localStorage.removeItem('user');
        setAuthLoading(false);
        return;
      }

      console.log('🔍 AuthContext: Attempting to decode token...');
      const decoded = jwtDecode(storedUser.token);
      console.log('🔍 AuthContext: Decoded token:', decoded);
      
      // Check token expiration with 5-minute buffer
      const now = Date.now();
      const expiration = decoded.exp * 1000;
      const buffer = 5 * 60 * 1000; // 5 minutes
      
      console.log('🔍 AuthContext: Token expiration check:', {
        now: new Date(now).toISOString(),
        expiration: new Date(expiration).toISOString(),
        isExpired: expiration <= now + buffer
      });

      if (expiration <= now + buffer) {
        console.warn('⚠️ AuthContext: Token expired or expiring soon. Removing from localStorage.');
        localStorage.removeItem('user');
        setAuthLoading(false);
        return;
      }

      // Extract roles with better handling
      let roles = [];
      if (decoded.roles && Array.isArray(decoded.roles)) {
        roles = decoded.roles;
      } else if (decoded.role) {
        roles = [decoded.role];
      } else if (storedUser.roles && Array.isArray(storedUser.roles)) {
        roles = storedUser.roles;
      } else if (decoded.authorities && Array.isArray(decoded.authorities)) {
        roles = decoded.authorities.map(auth => auth.authority || auth);
      }

      // Normalize roles - remove ROLE_ prefix if present
      const normalizedRoles = roles.map(role => {
        if (typeof role === 'string') {
          return role.startsWith('ROLE_') ? role.substring(5) : role;
        }
        return role;
      });

      console.log('🔍 AuthContext: Normalized roles:', normalizedRoles);

      // Validate that user has valid roles
      const validRoles = ['ADMIN', 'USER'];
      const hasValidRole = normalizedRoles.some(role => 
        validRoles.includes(role.toUpperCase())
      );

      if (!hasValidRole) {
        console.error('❌ AuthContext: User does not have valid roles:', normalizedRoles);
        localStorage.removeItem('user');
        setAuthLoading(false);
        return;
      }

      const userData = {
        ...decoded,
        username: decoded.sub || storedUser.username || decoded.username || '',
        roles: normalizedRoles,
        email: decoded.email || storedUser.email || '',
        id: decoded.userId || decoded.id || storedUser.id,
      };

      console.log('✅ AuthContext: Successfully restored user session:', userData);

      setAuth({
        token: storedUser.token,
        user: userData,
      });

    } catch (error) {
      console.error('❌ AuthContext: Error during authentication initialization:', error);
      localStorage.removeItem('user');
    } finally {
      setAuthLoading(false);
      console.log('🔍 AuthContext: Authentication initialization complete');
    }
  }, []);

  const login = (user) => {
    console.log('🔍 AuthContext: Login attempt with user:', user);
    
    try {
        if (!user?.token) {
            throw new Error('No token provided');
        }

        const decoded = jwtDecode(user.token);
        console.log('🔍 AuthContext: Login - decoded token:', decoded);
        
        // Extract roles with comprehensive handling
        let roles = [];
        if (decoded.roles && Array.isArray(decoded.roles)) {
            roles = decoded.roles;
        } else if (decoded.role) {
            roles = [decoded.role];
        } else if (user.roles && Array.isArray(user.roles)) {
            roles = user.roles;
        } else if (decoded.authorities && Array.isArray(decoded.authorities)) {
            roles = decoded.authorities.map(auth => auth.authority || auth);
        }

        // Normalize roles - remove ROLE_ prefix if present
        const normalizedRoles = roles.map(role => {
            if (typeof role === 'string') {
                return role.startsWith('ROLE_') ? role.substring(5) : role;
            }
            return role;
        });
        
        console.log('🔍 AuthContext: Login - normalized roles:', normalizedRoles);
        
        const validRoles = ['ADMIN', 'USER'];
        const hasValidRole = normalizedRoles.some(role => validRoles.includes(role.toUpperCase()));
        
        if (!hasValidRole) {
            console.error('❌ AuthContext: Login - User does not have valid privileges:', normalizedRoles);
            throw new Error('User does not have valid privileges');
        }

        const userData = {
            ...decoded,
            username: decoded.sub || user.username || decoded.username || '',
            roles: normalizedRoles,
            email: decoded.email || user.email || '',
            id: decoded.userId || decoded.id || user.id,
        };

        const userObject = {
            token: user.token,
            username: userData.username,
            roles: normalizedRoles,
            email: userData.email,
            id: userData.id,
        };

        console.log('🔍 AuthContext: Login - storing user object:', userObject);
        localStorage.setItem('user', JSON.stringify(userObject));
        
        setAuth({
            token: user.token,
            user: userData,
        });

        console.log('✅ AuthContext: Login successful for user:', userData.username);
        
    } catch (error) {
        console.error('❌ AuthContext: Error during login:', error);
        localStorage.removeItem('user');
        throw error;
    }
};

  const logout = () => {
    console.log('🔍 AuthContext: Logging out user');
    localStorage.removeItem('user');
    setAuth({
      token: null,
      user: null,
    });
    console.log('✅ AuthContext: User logged out successfully');
  };

  const hasRole = (role) => {
    if (!auth.user?.roles?.length) {
      console.log('🔍 AuthContext: hasRole - No roles found for user');
      return false;
    }
    
    const hasRoleResult = auth.user.roles.some(userRole => 
      userRole.toUpperCase() === role.toUpperCase()
    );
    
    console.log('🔍 AuthContext: hasRole check:', {
      requestedRole: role,
      userRoles: auth.user.roles,
      hasRole: hasRoleResult
    });
    
    return hasRoleResult;
  };

  if (authLoading) {
    console.log('🔍 AuthContext: Still loading authentication state...');
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        gap: '1rem'
      }}>
        <div>Loading user information...</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>
          Checking authentication state...
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
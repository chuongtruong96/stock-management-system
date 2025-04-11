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
    const storedUser = localStorage.getItem('user')
      ? JSON.parse(localStorage.getItem('user'))
      : null;

    if (storedUser?.token) {
      try {
        const decoded = jwtDecode(storedUser.token);
        if (decoded.exp * 1000 > Date.now()) {
          const userData = {
            ...decoded,
            username: decoded.sub || storedUser.username || '',
            roles: decoded.roles || (decoded.role ? [decoded.role] : storedUser.roles || []),
          };
          setAuth({
            token: storedUser.token,
            user: userData,
          });
        } else {
          console.warn('Token expired. Removing from localStorage.');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  const login = (user) => {
    try {
      const decoded = jwtDecode(user.token);
      const roles = decoded.roles || (decoded.role ? [decoded.role] : user.roles || []);
      
      // Case-insensitive role check
      const validRoles = ['ROLE_ADMIN', 'ROLE_USER'].map(role => role.toUpperCase());
      const hasValidRole = roles.some(role => validRoles.includes(role.toUpperCase()));
      if (!hasValidRole) {
        throw new Error('User does not have valid privileges');
      }

      const userObject = {
        token: user.token,
        username: user.username,
        roles,
      };
      localStorage.setItem('user', JSON.stringify(userObject));
      setAuth({
        token: user.token,
        user: {
          ...decoded,
          username: user.username,
          roles,
        },
      });
    } catch (error) {
      console.error('Error during login:', error);
      localStorage.removeItem('user');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setAuth({
      token: null,
      user: null,
    });
  };

  const hasRole = (role) => {
    return auth.user?.roles?.some(r => r.toUpperCase() === role.toUpperCase()) || false;
  };

  if (authLoading) {
    return <p>Loading user information...</p>;
  }

  return (
    <AuthContext.Provider value={{ auth, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

import { useState, useEffect } from 'react';

interface User {
  username: string;
  userType: 'faculty' | 'hod';
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userName = localStorage.getItem('userName');
      const userType = localStorage.getItem('userType') as 'faculty' | 'hod';

      if (authStatus === 'true' && userName && userType) {
        setIsAuthenticated(true);
        setUser({
          username: userName,
          userType: userType
        });
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return {
    isAuthenticated,
    user,
    isLoading,
    logout
  };
};

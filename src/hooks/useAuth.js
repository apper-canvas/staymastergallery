import { useState, useEffect } from 'react';

// A simple hook to manage user authentication state
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // For this demo, we'll use a simplified login mechanism
  const login = (userData) => {
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
    return true;
  };

  // For convenience in demo, pre-populate the guest login
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      login({ id: 'guest-001', name: 'John Doe', email: 'john.doe@example.com' });
    }
  }, [isAuthenticated, isLoading]);

  return { isAuthenticated, currentUser, login, isLoading };
};

export default useAuth;
import { useContext } from 'react';
import { useSelector } from 'react-redux';
import { AuthContext } from '../App';

const useAuth = () => {
  const authContext = useContext(AuthContext);
  const userState = useSelector((state) => state.user);
  
  return {
    isAuthenticated: userState.isAuthenticated,
    currentUser: userState.user,
    isLoading: !authContext.isInitialized,
    logout: authContext.logout
  };
};

export default useAuth;
import { useState, useEffect, createContext, Component } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; 
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Bookings from './pages/Bookings';
import GuestPortal from './pages/GuestPortal';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';
import { setUser, clearUser } from './store/userSlice';

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// Create auth context
export const AuthContext = createContext(null);

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get authentication status
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    // Check if ApperSDK is available
    if (!window.ApperSDK) {
      console.error("ApperSDK is not loaded");
      setIsInitialized(true); // Still set initialized to prevent loading screen
      toast.error("Authentication service unavailable");
      return;
    }
    
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID || '',
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(currentPath.includes('/signup') ? `/signup?redirect=${currentPath}` : (currentPath.includes('/login') ? `/login?redirect=${currentPath}` : '/login'));
          } else if (redirectPath) {
            if (!['error', 'signup', 'login', 'callback'].some((path) => currentPath.includes(path))) navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
        toast.error("Authentication failed");
      }
    });
  }, [dispatch, navigate, toast]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        
        if (!ApperUI) {
          dispatch(clearUser());
          navigate('/login');
          return;
        }
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed");
      }
    }
  };

  // Handle dark mode toggle
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedMode === 'true' || (savedMode === null && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Navigation links for header
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Bookings', path: '/bookings' },
    { name: 'Rooms', path: '/rooms' },
    { name: 'Guests', path: '/guests' },
    { name: 'Guest Portal', path: '/guest-portal' },
  ];

  const MoonIcon = getIcon('moon');
  const SunIcon = getIcon('sun');
  const HotelIcon = getIcon('building');
  const MenuIcon = getIcon('menu');
  const XIcon = getIcon('x');

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="p-4 text-center">
          <p className="text-lg">Initializing application...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 sticky top-0 z-10">
        <div className="container-custom py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <HotelIcon className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-surface-900 dark:text-white">StayMaster</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <a 
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-primary dark:text-primary-light' 
                      : 'text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  {link.name}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
              
              {/* Mobile menu button */}
              <button 
                className="md:hidden p-2 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden overflow-hidden"
              >
                <nav className="py-4 flex flex-col space-y-4">
                  {navLinks.map((link) => (
                    <a 
                      key={link.path}
                      onClick={() => { navigate(link.path); setIsMenuOpen(false); }}
                      className={`text-sm font-medium px-2 py-2 rounded-lg ${
                        location.pathname === link.path 
                          ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light' 
                          : 'text-surface-700 hover:bg-surface-100 dark:text-surface-300 dark:hover:bg-surface-700'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <ErrorBoundary
          fallback={
            <div className="container mx-auto p-4 text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
              <p className="mb-4">We encountered an error while rendering this page.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Reload Page
              </button>
            </div>
          }
        >
          <AuthContext.Provider value={authMethods}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/callback" element={<Callback />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
              <Route path="/bookings" element={isAuthenticated ? <Bookings /> : <Navigate to={`/login?redirect=${location.pathname}`} />} />
              <Route path="/guest-portal/*" element={isAuthenticated ? <GuestPortal /> : <Navigate to={`/login?redirect=${location.pathname}`} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthContext.Provider>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <ErrorBoundary
        fallback={null}
      >
        <footer className="bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 py-6">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center justify-center md:justify-start">
                  <HotelIcon className="h-5 w-5 text-primary mr-2" />
                  <span className="text-surface-800 dark:text-surface-200 font-medium">StayMaster</span>
                </div>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1 text-center md:text-left">
                  Efficiently manage hotel operations
                </p>
              </div>
              <div className="text-sm text-surface-500 dark:text-surface-400">
                &copy; {new Date().getFullYear()} StayMaster. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </ErrorBoundary>

      <ErrorBoundary fallback={null}>
        <ToastContainer position="bottom-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme={isDarkMode ? "dark" : "light"} toastClassName="rounded-lg shadow-lg" />
      </ErrorBoundary>
    </div>
  );
}

export default App;
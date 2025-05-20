import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from './utils/iconUtils';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Bookings from './pages/Bookings';
import GuestPortal from './pages/GuestPortal';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

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
                  href={link.path} 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-primary dark:text-primary-light' 
                      : 'text-surface-600 hover:text-surface-900 dark:text-surface-300 dark:hover:text-white'
                  }`}
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
                      href={link.path} 
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/guest-portal/*" element={<GuestPortal />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Footer */}
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

      {/* Toast Container */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDarkMode ? "dark" : "light"}
        toastClassName="rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;
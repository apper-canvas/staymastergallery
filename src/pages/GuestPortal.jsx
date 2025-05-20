import { useState } from 'react';
import { motion } from 'framer-motion';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { getIcon } from '../utils/iconUtils';
import ReservationCard from '../components/ReservationCard';
import CheckInOutModal from '../components/CheckInOutModal';
import useAuth from '../hooks/useAuth';
import useReservations from '../hooks/useReservations';

const GuestPortal = () => {
  const location = useLocation();
  const { isAuthenticated, currentUser, isLoading: authLoading } = useAuth();
  const { 
    reservations, 
    isLoading: reservationsLoading, 
    checkIn, 
    checkOut 
  } = useReservations(currentUser?.id);

  // State for modals
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null, // 'check-in' or 'check-out'
    reservation: null
  });

  // Icons
  const CalendarIcon = getIcon('calendar');
  const MessageSquareIcon = getIcon('message-square');
  const UserIcon = getIcon('user');
  const HomeIcon = getIcon('home');
  const StarIcon = getIcon('star');
  const LoaderIcon = getIcon('loader');

  // Open modal for check-in
  const handleCheckIn = (reservation) => {
    setModalState({
      isOpen: true,
      mode: 'check-in',
      reservation
    });
  };

  // Open modal for check-out
  const handleCheckOut = (reservation) => {
    setModalState({
      isOpen: true,
      mode: 'check-out',
      reservation
    });
  };

  // Close modal
  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      mode: null,
      reservation: null
    });
  };

  // Handle modal submission
  const handleModalSubmit = async (reservationId, data) => {
    if (modalState.mode === 'check-in') {
      return await checkIn(reservationId, data);
    } else {
      return await checkOut(reservationId, data);
    }
  };

  // If still loading auth, show loading spinner
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderIcon className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  // If not authenticated, we would normally redirect to login
  // For this example, we'll use the demo user

  // Navigation tabs
  const tabs = [
    { name: 'My Reservations', path: '/guest-portal', icon: CalendarIcon },
    { name: 'Service Requests', path: '/guest-portal/requests', icon: MessageSquareIcon },
    { name: 'Feedback', path: '/guest-portal/feedback', icon: StarIcon },
    { name: 'My Profile', path: '/guest-portal/profile', icon: UserIcon },
  ];

  return (
    <div className="py-6">
      <div className="container-custom">
        <div className="mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-surface-900 dark:text-white"
          >
            Guest Portal
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-surface-600 dark:text-surface-400 mt-2"
          >
            Welcome, {currentUser?.name}. Manage your reservations and hotel experience.
          </motion.p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex overflow-x-auto scrollbar-hide space-x-6">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 flex items-center ${
                  (location.pathname === tab.path || 
                   (location.pathname === '/guest-portal/' && tab.path === '/guest-portal'))
                    ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                    : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <Routes>
          <Route path="/" element={
            <div>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-surface-800 dark:text-white">My Reservations</h2>
              </div>
              
              {reservationsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <LoaderIcon className="h-10 w-10 text-primary animate-spin" />
                </div>
              ) : reservations.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-4">Current & Upcoming</h3>
                  {reservations
                    .filter(res => ['confirmed', 'ready-for-checkin', 'checked-in'].includes(res.status))
                    .map(reservation => (
                      <ReservationCard 
                        key={reservation.id} 
                        reservation={reservation}
                        onCheckIn={handleCheckIn}
                        onCheckOut={handleCheckOut}
                      />
                    ))}
                  
                  <h3 className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-4 mt-8">History</h3>
                  {reservations
                    .filter(res => res.status === 'completed')
                    .map(reservation => (
                      <ReservationCard 
                        key={reservation.id} 
                        reservation={reservation}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <HomeIcon className="h-16 w-16 mx-auto text-surface-400 dark:text-surface-600" />
                  <h3 className="mt-4 text-lg font-medium text-surface-700 dark:text-surface-300">No Reservations</h3>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">You don't have any reservations yet.</p>
                  <Link to="/" className="btn-primary mt-4 inline-flex">Make a Reservation</Link>
                </div>
              )}
            </div>
          } />
          
          <Route path="/requests" element={
            <div className="text-center py-10">
              <MessageSquareIcon className="h-16 w-16 mx-auto text-surface-400 dark:text-surface-600" />
              <h3 className="mt-4 text-lg font-medium text-surface-700 dark:text-surface-300">Service Requests</h3>
              <p className="text-surface-500 dark:text-surface-400 mt-2">This feature will be coming soon.</p>
            </div>
          } />
          
          <Route path="/feedback" element={
            <div className="text-center py-10">
              <StarIcon className="h-16 w-16 mx-auto text-surface-400 dark:text-surface-600" />
              <h3 className="mt-4 text-lg font-medium text-surface-700 dark:text-surface-300">Feedback</h3>
              <p className="text-surface-500 dark:text-surface-400 mt-2">This feature will be coming soon.</p>
            </div>
          } />
          
          <Route path="/profile" element={
            <div className="text-center py-10">
              <UserIcon className="h-16 w-16 mx-auto text-surface-400 dark:text-surface-600" />
              <h3 className="mt-4 text-lg font-medium text-surface-700 dark:text-surface-300">My Profile</h3>
              <p className="text-surface-500 dark:text-surface-400 mt-2">This feature will be coming soon.</p>
            </div>
          } />
          
          {/* Redirect any other paths to the main guest portal page */}
          <Route path="*" element={<Navigate to="/guest-portal" replace />} />
        </Routes>
      </div>

      {/* Check-in/Check-out Modal */}
      <CheckInOutModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        reservation={modalState.reservation}
        mode={modalState.mode}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default GuestPortal;
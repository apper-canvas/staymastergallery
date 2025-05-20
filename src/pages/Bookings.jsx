import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import ReservationCard from '../components/ReservationCard';
import BookingDetailsModal from '../components/BookingDetailsModal';
import useReservations from '../hooks/useReservations';
import useAuth from '../hooks/useAuth';

const Bookings = () => {
  const { currentUser } = useAuth();
  const guestId = currentUser?.id || 'guest-001'; // Fallback to demo user
  const { reservations, isLoading, refreshReservations } = useReservations(guestId);
  
  // State for active tab
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for booking details modal
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Icons
  const CalendarIcon = getIcon('calendar');
  const PlusIcon = getIcon('plus');
  const LoaderIcon = getIcon('loader');
  const SearchIcon = getIcon('search');
  const FilterIcon = getIcon('filter');
  const ClipboardIcon = getIcon('clipboard');

  // Filter tabs
  const filterTabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'active', label: 'Active' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' }
  ];

  // Filter reservations based on active tab
  const filteredReservations = reservations.filter(reservation => {
    switch (activeFilter) {
      case 'active':
        return reservation.status === 'checked-in';
      case 'upcoming':
        return ['confirmed', 'ready-for-checkin'].includes(reservation.status);
      case 'completed':
        return reservation.status === 'completed';
      default:
        return true; // 'all' filter
    }
  });

  // Handle view details click
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  // Close booking details modal
  const handleCloseModal = () => {
    setSelectedBooking(null);
  };

  return (
    <div className="py-6">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Bookings</h1>
              <p className="text-surface-600 dark:text-surface-400 mt-2">
                View and manage all your reservations.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link 
                to="/"
                className="btn-primary"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                New Booking
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-surface-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search bookings..."
              aria-label="Search bookings"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-outline">
              <FilterIcon className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex overflow-x-auto scrollbar-hide space-x-6">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                  activeFilter === tab.id
                    ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                    : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Content */}
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoaderIcon className="h-10 w-10 text-primary animate-spin" />
            </div>
          ) : filteredReservations.length > 0 ? (
            <div className="space-y-4">
              {filteredReservations.map(booking => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ReservationCard
                    reservation={booking}
                    onViewDetails={() => handleViewDetails(booking)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ClipboardIcon className="h-16 w-16 mx-auto text-surface-400 dark:text-surface-600" />
                <h3 className="mt-4 text-lg font-medium text-surface-700 dark:text-surface-300">
                  No bookings found
                </h3>
                <p className="text-surface-500 dark:text-surface-400 mt-2">
                  {activeFilter === 'all'
                    ? "You don't have any bookings yet."
                    : `You don't have any ${activeFilter} bookings.`}
                </p>
                {activeFilter === 'all' && (
                  <Link to="/" className="btn-primary mt-4 inline-flex">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Make a Reservation
                  </Link>
                )}
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={handleCloseModal}
          booking={selectedBooking}
        />
      )}
    </div>
  );
};

export default Bookings;
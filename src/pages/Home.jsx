import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';
import { format } from 'date-fns';
import BookingDetailsModal from '../components/BookingDetailsModal';
import { fetchRooms, updateRoom } from '../services/roomService';
import { fetchReservations } from '../services/reservationService';
import { fetchLatestStats, createHotelStats } from '../services/hotelStatsService';


// Mock data
const mockRoomStatus = [
  { id: 1, number: '101', type: 'Standard', status: 'occupied', guest: 'James Wilson', checkOut: '2023-06-15' },
  { id: 2, number: '102', type: 'Deluxe', status: 'available', lastCleaned: '2023-06-12' },
  { id: 3, number: '103', type: 'Suite', status: 'cleaning', cleaningStaff: 'Maria Garcia' },
  { id: 4, number: '104', type: 'Standard', status: 'maintenance', issue: 'Plumbing repair' },
  { id: 5, number: '105', type: 'Deluxe', status: 'reserved', guest: 'Sarah Johnson', checkIn: '2023-06-13' },
  { id: 6, number: '106', type: 'Standard', status: 'occupied', guest: 'Robert Smith', checkOut: '2023-06-14' },
  { id: 7, number: '107', type: 'Suite', status: 'available', lastCleaned: '2023-06-12' },
  { id: 8, number: '108', type: 'Standard', status: 'reserved', guest: 'Emily Davis', checkIn: '2023-06-14' },
  { id: 9, number: '201', type: 'Deluxe', status: 'occupied', guest: 'Michael Brown', checkOut: '2023-06-16' },
  { id: 10, number: '202', type: 'Standard', status: 'available', lastCleaned: '2023-06-11' },
  { id: 11, number: '203', type: 'Suite', status: 'cleaning', cleaningStaff: 'Jose Rodriguez' },
  { id: 12, number: '204', type: 'Standard', status: 'maintenance', issue: 'AC repair' },
];

const mockStats = {
  occupancyRate: 75,
  availableRooms: 14,
  reservedRooms: 8,
  todayArrivals: 5,
  todayDepartures: 3,
  pendingMaintenance: 2
};

const mockRecentBookings = [
  { id: 1, guest: 'John Doe', checkIn: '2023-06-13', checkOut: '2023-06-15', roomType: 'Deluxe', status: 'confirmed' },
  { id: 2, guest: 'Jane Smith', checkIn: '2023-06-14', checkOut: '2023-06-18', roomType: 'Suite', status: 'confirmed' },
  { id: 3, guest: 'Robert Johnson', checkIn: '2023-06-13', checkOut: '2023-06-16', roomType: 'Standard', status: 'checked-in' },
  { id: 4, guest: 'Mary Williams', checkIn: '2023-06-12', checkOut: '2023-06-14', roomType: 'Deluxe', status: 'checked-in' },
];

const Home = () => {
  const [stats, setStats] = useState(mockStats);
  const [roomsData, setRoomsData] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [isLoading, setIsLoading] = useState({
    rooms: true,
    bookings: true,
    stats: true
  });
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Load rooms, bookings and stats when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load rooms
        setIsLoading(prev => ({ ...prev, rooms: true }));
        const roomsResponse = await fetchRooms({}) || [];
        
        // Transform data to match the format expected by the UI
        const transformedRooms = roomsResponse.map(room => ({
          id: room.Id,
          number: room.number,
          type: room.roomType?.Name || 'Standard',
          status: room.status || 'available',
          guest: room.guest?.Name,
          checkOut: room.checkOut ? room.checkOut.split('T')[0] : null,
          lastCleaned: room.lastCleaned ? room.lastCleaned.split('T')[0] : null,
          cleaningStaff: room.cleaningStaff,
          issue: room.maintenanceIssue
        }));
        
        setRoomsData(transformedRooms);
      } catch (error) {
        // Avoid direct console.error which can trigger Apper SDK issues
        toast.error(`Failed to load rooms: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(prev => ({ ...prev, rooms: false }));
      }
      
      try {
        // Load bookings
        setIsLoading(prev => ({ ...prev, bookings: true }));
        const bookingsResponse = await fetchReservations({}) || [];
        
        // Transform data to match the format expected by the UI
        const transformedBookings = bookingsResponse.map(booking => ({
          id: booking.Id,
          guest: booking.guest?.Name || 'Guest',
          checkIn: booking.checkInDate ? booking.checkInDate.split('T')[0] : '',
          checkOut: booking.checkOutDate ? booking.checkOutDate.split('T')[0] : '',
          roomType: booking.roomType?.Name || 'Standard',
          status: booking.status || 'confirmed'
        }));
        
        setRecentBookings(transformedBookings.slice(0, 10)); // Limit to 10 bookings
      } catch (error) {
        // Avoid direct console.error which can trigger Apper SDK issues
        toast.error(`Failed to load bookings: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(prev => ({ ...prev, bookings: false }));
      }
      
      try {
        // Load stats
        setIsLoading(prev => ({ ...prev, stats: true }));
        const statsResponse = await fetchLatestStats();

        // If no stats exist yet, create default stats
        if (!statsResponse) {
          toast.info('Creating initial hotel statistics');
          await createHotelStats(mockStats);
        }

        if (statsResponse) {
          setStats({
            occupancyRate: statsResponse.occupancyRate,
            availableRooms: statsResponse.availableRooms,
            reservedRooms: statsResponse.reservedRooms,
            todayArrivals: statsResponse.todayArrivals,
            todayDepartures: statsResponse.todayDepartures,
            pendingMaintenance: statsResponse.pendingMaintenance
          });
        }
      } catch (error) {
        // Avoid direct console.error which can trigger Apper SDK issues
        toast.error(`Failed to load hotel statistics: ${error.message || 'Unknown error'}`);
      } finally {
        setIsLoading(prev => ({ ...prev, stats: false }));
      }
    };
    
    loadData();
  }, []);

  // Add a new booking
  const addNewBooking = (booking) => {
    // This would need to be implemented with the actual service
    toast.info('Booking creation would be implemented with the actual reservation service');
  };

  const [activeTab, setActiveTab] = useState('overview');
  
  // Icons
  const BedIcon = getIcon('bed');
  const CalendarIcon = getIcon('calendar');
  const UsersIcon = getIcon('users');
  const HomeIcon = getIcon('home');
  const ToolIcon = getIcon('tool');
  const PieChartIcon = getIcon('pie-chart');
  const CheckCircleIcon = getIcon('check-circle');
  const AlertCircleIcon = getIcon('alert-circle');
  const RefreshCwIcon = getIcon('refresh-cw');
  const ClockIcon = getIcon('clock');
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'available':
        return 'badge-green';
      case 'occupied':
        return 'badge-blue';
      case 'reserved':
        return 'badge-purple';
      case 'cleaning':
        return 'badge-yellow';
      case 'maintenance':
        return 'badge-red';
      default:
        return 'badge-blue';
    }
  };
  
  const handleRoomStatusChange = async (roomId, newStatus) => {
    const updatedRooms = roomsData.map(room => 
      room.id === roomId ? { ...room, status: newStatus } : room
    );
    
    setRoomsData(updatedRooms);

    try {
      // Find the room before updating for the success message
      const room = roomsData.find(r => r.id === roomId);
      
      if (!room) {
        throw new Error(`Room with ID ${roomId} not found`);
      }
      
      // Update in database
      await updateRoom(roomId, { status: newStatus });
      
      // Show success message only after successful update
      toast.success(`Room ${room.number} status changed to ${newStatus}`);
    } catch (error) {
      // Use toast for error display instead of console.error
      toast.error('Failed to update room status');
    }
  }; 

  const handleViewBookingDetails = (booking) => {
    // Set the selected booking and open the modal
    setSelectedBooking(booking);
    setIsBookingModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="py-6">
      <div className="container-custom">
        <div className="mb-6">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-surface-900 dark:text-white"
          >
            Hotel Dashboard
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-surface-600 dark:text-surface-400 mt-2"
          >
            Welcome to StayMaster. Manage your hotel operations efficiently.
          </motion.p>
        </div>

        {/* Main Feature Component */}
        <MainFeature addNewBooking={addNewBooking} />

        {/* Tabs navigation */}
        <div className="mb-4 mt-8 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-xl font-semibold mb-4">Hotel Status</h2>
          <div className="flex overflow-x-auto scrollbar-hide space-x-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
                    >
              className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'rooms'
                  ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
              }`}
            >
              Room Status
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-primary text-primary dark:border-primary-light dark:text-primary-light'
                  : 'border-transparent text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
              }`}
            >
              Recent Bookings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* Overview tab */}
          {activeTab === 'overview' && isLoading.stats ? (
            <div className="flex justify-center items-center min-h-40">
              <p className="text-surface-600 dark:text-surface-400">Loading hotel statistics...</p>
            </div>
          ) : activeTab === 'overview' && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <PieChartIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Occupancy Rate</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.occupancyRate}%</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    <BedIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Available Rooms</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.availableRooms}</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Reserved Rooms</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.reservedRooms}</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    <UsersIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Today's Arrivals</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.todayArrivals}</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <HomeIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Today's Departures</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.todayDepartures}</h4>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="card">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                    <ToolIcon className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Pending Maintenance</p>
                    <h4 className="text-2xl font-semibold text-surface-900 dark:text-white">{stats.pendingMaintenance}</h4>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
          
          {/* Rooms tab */}
          {activeTab === 'rooms' && isLoading.rooms ? (
            <div className="flex justify-center items-center min-h-40">
              <p className="text-surface-600 dark:text-surface-400">Loading room data...</p>
            </div>
          ) : activeTab === 'rooms' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="overflow-x-auto"
            >
              <div className="card overflow-hidden mb-4">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">Room Status</h3>
                  <div className="flex space-x-2">
                    <span className="badge-green">Available</span>
                    <span className="badge-blue">Occupied</span>
                    <span className="badge-purple">Reserved</span>
                    <span className="badge-yellow">Cleaning</span>
                    <span className="badge-red">Maintenance</span>
                  </div><div className="mt-4"></div>
                
                <div className="min-w-full">
                  <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                    <thead className="bg-surface-50 dark:bg-surface-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Room</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Details</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                      {roomsData.map((room) => (
                        <tr key={room.id || Math.random()}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900 dark:text-white">{room.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-300">{room.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${getStatusBadgeClass(room.status)}`}>
                              {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-300">
                            {room.status === 'occupied' && `${room.guest} (Until ${room.checkOut})`}
                            {room.status === 'available' && (room.lastCleaned ? `Last cleaned: ${room.lastCleaned}` : 'Available')}
                            {room.status === 'reserved' && (room.guest ? `${room.guest} (From ${room.checkIn})` : 'Reserved')}
                            {room.status === 'cleaning' && `Staff: ${room.cleaningStaff}`}
                            {room.status === 'maintenance' && room.issue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              {room.status !== 'available' && (
                                <button 
                                  onClick={() => handleRoomStatusChange(room.id, 'available')}
                                  className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-md"
                                >
                                  Set Available
                                </button>
                              )}
                              {room.status !== 'cleaning' && (
                                <button 
                                  onClick={() => handleRoomStatusChange(room.id, 'cleaning')}
                                  className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-md"
                                >
                                  Set Cleaning
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
           </motion.div>
          )}
          {/* Bookings tab */}
          {activeTab === 'bookings' && isLoading.bookings ? (
            <div className="flex justify-center items-center min-h-40">
              <p className="text-surface-600 dark:text-surface-400">Loading booking data...</p>
            </div>
          ) : activeTab === 'bookings' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}>
              <div className="card">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Recent Bookings</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                    <thead className="bg-surface-50 dark:bg-surface-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Guest</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Check In</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Check Out</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Room Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id || Math.random()}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-surface-900 dark:text-white">{booking.guest}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-300">{booking.checkIn}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-300">{booking.checkOut}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-300">{booking.roomType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`${booking.status === 'confirmed' ? 'badge-purple' : 'badge-green'}`}>
                              {booking.status === 'confirmed' ? 'Confirmed' : 'Checked In'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button 
                              onClick={() => handleViewBookingDetails(booking)}
                              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Booking Details Modal */}
      <BookingDetailsModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default Home;
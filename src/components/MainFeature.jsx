import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';

const MainFeature = () => {
  // Form state
  const [reservationData, setReservationData] = useState({
    guestName: '',
    email: '',
    phone: '',
    roomType: 'standard',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: ''
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Room Types with details and pricing
  const roomTypes = [
    { id: 'standard', name: 'Standard Room', rate: 99, available: 8, capacity: 2, bedType: 'Queen' },
    { id: 'deluxe', name: 'Deluxe Room', rate: 149, available: 5, capacity: 2, bedType: 'King' },
    { id: 'suite', name: 'Executive Suite', rate: 249, available: 3, capacity: 4, bedType: 'King + Sofa' },
    { id: 'family', name: 'Family Room', rate: 199, available: 2, capacity: 4, bedType: '2 Queen' },
  ];

  // Define the active tab state (Reservation Form, Room Availability)
  const [activeFeatureTab, setActiveFeatureTab] = useState('reservationForm');

  // Calculate minimum dates for check-in and check-out
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  // Calculate stay duration and total cost
  const [stayDetails, setStayDetails] = useState({
    nights: 0,
    totalCost: 0
  });

  useEffect(() => {
    if (reservationData.checkInDate && reservationData.checkOutDate) {
      const checkIn = new Date(reservationData.checkInDate);
      const checkOut = new Date(reservationData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      
      if (nights > 0) {
        const selectedRoom = roomTypes.find(room => room.id === reservationData.roomType);
        const totalCost = selectedRoom ? selectedRoom.rate * nights : 0;
        
        setStayDetails({
          nights,
          totalCost
        });
      }
    }
  }, [reservationData.checkInDate, reservationData.checkOutDate, reservationData.roomType]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!reservationData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }
    
    if (!reservationData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(reservationData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    
    if (!reservationData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    
    if (!reservationData.checkInDate) {
      newErrors.checkInDate = 'Check-in date is required';
    }
    
    if (!reservationData.checkOutDate) {
      newErrors.checkOutDate = 'Check-out date is required';
    } else if (reservationData.checkInDate && new Date(reservationData.checkOutDate) <= new Date(reservationData.checkInDate)) {
      newErrors.checkOutDate = 'Check-out must be after check-in';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle reservation submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate API request
      setTimeout(() => {
        setIsSubmitting(false);
        toast.success('Reservation created successfully!');
        
        // Reset form
        setReservationData({
          guestName: '',
          email: '',
          phone: '',
          roomType: 'standard',
          checkInDate: '',
          checkOutDate: '',
          adults: 1,
          children: 0,
          specialRequests: ''
        });
      }, 1500);
    } else {
      toast.error('Please correct the errors in the form');
    }
  };

  // Icons
  const CalendarIcon = getIcon('calendar');
  const UserIcon = getIcon('user');
  const HomeIcon = getIcon('home');
  const PhoneIcon = getIcon('phone');
  const MailIcon = getIcon('mail');
  const UsersIcon = getIcon('users');
  const BedIcon = getIcon('bed');
  const SearchIcon = getIcon('search');
  const PlusIcon = getIcon('plus');
  const MinusIcon = getIcon('minus');
  const ClipboardIcon = getIcon('clipboard');
  const CheckIcon = getIcon('check-circle');
  const LoaderIcon = getIcon('loader');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="card shadow-soft dark:shadow-none border border-surface-200 dark:border-surface-700 overflow-hidden">
        {/* Feature Tabs */}
        <div className="flex border-b border-surface-200 dark:border-surface-700 mb-6">
          <button
            onClick={() => setActiveFeatureTab('reservationForm')}
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeFeatureTab === 'reservationForm'
                ? 'text-primary border-b-2 border-primary dark:text-primary-light dark:border-primary-light'
                : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
            }`}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            New Reservation
          </button>
          <button
            onClick={() => setActiveFeatureTab('roomAvailability')}
            className={`flex items-center px-4 py-3 text-sm font-medium ${
              activeFeatureTab === 'roomAvailability'
                ? 'text-primary border-b-2 border-primary dark:text-primary-light dark:border-primary-light'
                : 'text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-white'
            }`}
          >
            <BedIcon className="h-4 w-4 mr-2" />
            Room Availability
          </button>
        </div>

        {/* Feature Content */}
        <AnimatePresence mode="wait">
          {activeFeatureTab === 'reservationForm' && (
            <motion.div
              key="reservation-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-1">
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Create New Reservation</h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Guest Information */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-surface-800 dark:text-surface-200 flex items-center">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Guest Information
                      </h4>
                      
                      <div>
                        <label htmlFor="guestName" className="label">Guest Name</label>
                        <div className="relative">
                          <input
                            type="text"
                            id="guestName"
                            name="guestName"
                            value={reservationData.guestName}
                            onChange={handleInputChange}
                            className={`input pl-9 ${errors.guestName ? 'border-red-500 dark:border-red-400' : ''}`}
                            placeholder="John Smith"
                          />
                          <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                        </div>
                        {errors.guestName && <p className="mt-1 text-sm text-red-500">{errors.guestName}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="label">Email Address</label>
                        <div className="relative">
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={reservationData.email}
                            onChange={handleInputChange}
                            className={`input pl-9 ${errors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                            placeholder="john@example.com"
                          />
                          <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="label">Phone Number</label>
                        <div className="relative">
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={reservationData.phone}
                            onChange={handleInputChange}
                            className={`input pl-9 ${errors.phone ? 'border-red-500 dark:border-red-400' : ''}`}
                            placeholder="(123) 456-7890"
                          />
                          <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                        </div>
                        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                      </div>
                    </div>
                    
                    {/* Reservation Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-surface-800 dark:text-surface-200 flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Reservation Details
                      </h4>
                      
                      <div>
                        <label htmlFor="roomType" className="label">Room Type</label>
                        <div className="relative">
                          <select
                            id="roomType"
                            name="roomType"
                            value={reservationData.roomType}
                            onChange={handleInputChange}
                            className="input pl-9"
                          >
                            {roomTypes.map(room => (
                              <option key={room.id} value={room.id}>
                                {room.name} - ${room.rate}/night
                              </option>
                            ))}
                          </select>
                          <BedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="checkInDate" className="label">Check-in Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              id="checkInDate"
                              name="checkInDate"
                              value={reservationData.checkInDate}
                              onChange={handleInputChange}
                              min={today}
                              className={`input pl-9 ${errors.checkInDate ? 'border-red-500 dark:border-red-400' : ''}`}
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                          </div>
                          {errors.checkInDate && <p className="mt-1 text-sm text-red-500">{errors.checkInDate}</p>}
                        </div>
                        
                        <div>
                          <label htmlFor="checkOutDate" className="label">Check-out Date</label>
                          <div className="relative">
                            <input
                              type="date"
                              id="checkOutDate"
                              name="checkOutDate"
                              value={reservationData.checkOutDate}
                              onChange={handleInputChange}
                              min={reservationData.checkInDate || tomorrow}
                              className={`input pl-9 ${errors.checkOutDate ? 'border-red-500 dark:border-red-400' : ''}`}
                            />
                            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                          </div>
                          {errors.checkOutDate && <p className="mt-1 text-sm text-red-500">{errors.checkOutDate}</p>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Adults</label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setReservationData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                              className="p-2 rounded-l-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <div className="px-4 py-2 bg-white dark:bg-surface-800 border-t border-b border-surface-300 dark:border-surface-600 text-center">
                              {reservationData.adults}
                            </div>
                            <button
                              type="button"
                              onClick={() => setReservationData(prev => ({ ...prev, adults: Math.min(6, prev.adults + 1) }))}
                              className="p-2 rounded-r-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="label">Children</label>
                          <div className="flex items-center">
                            <button
                              type="button"
                              onClick={() => setReservationData(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                              className="p-2 rounded-l-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                            >
                              <MinusIcon className="h-4 w-4" />
                            </button>
                            <div className="px-4 py-2 bg-white dark:bg-surface-800 border-t border-b border-surface-300 dark:border-surface-600 text-center">
                              {reservationData.children}
                            </div>
                            <button
                              type="button"
                              onClick={() => setReservationData(prev => ({ ...prev, children: Math.min(4, prev.children + 1) }))}
                              className="p-2 rounded-r-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                            >
                              <PlusIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="specialRequests" className="label">Special Requests</label>
                        <textarea
                          id="specialRequests"
                          name="specialRequests"
                          value={reservationData.specialRequests}
                          onChange={handleInputChange}
                          className="input h-24 resize-none"
                          placeholder="Any special requirements or preferences..."
                        ></textarea>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reservation Summary */}
                  {stayDetails.nights > 0 && (
                    <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
                        <ClipboardIcon className="h-4 w-4 mr-2" />
                        Reservation Summary
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="block text-blue-600 dark:text-blue-400 font-medium">Selected Room:</span>
                          <span className="text-surface-700 dark:text-surface-300">
                            {roomTypes.find(r => r.id === reservationData.roomType)?.name}
                          </span>
                        </div>
                        <div>
                          <span className="block text-blue-600 dark:text-blue-400 font-medium">Stay Duration:</span>
                          <span className="text-surface-700 dark:text-surface-300">{stayDetails.nights} night(s)</span>
                        </div>
                        <div>
                          <span className="block text-blue-600 dark:text-blue-400 font-medium">Total Cost:</span>
                          <span className="text-surface-900 dark:text-white font-semibold">${stayDetails.totalCost}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary py-2.5 px-6 disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderIcon className="animate-spin h-5 w-5 mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-5 w-5 mr-2" />
                          Create Reservation
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeFeatureTab === 'roomAvailability' && (
            <motion.div
              key="room-availability"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-4">Room Availability</h3>
                
                {/* Search Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="sm:flex-1">
                    <label htmlFor="searchDate" className="label">Check-in Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        id="searchDate"
                        className="input pl-9"
                        defaultValue={today}
                      />
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                    </div>
                  </div>
                  
                  <div className="sm:flex-1">
                    <label htmlFor="nights" className="label">Nights</label>
                    <select id="nights" className="input">
                      {[1, 2, 3, 4, 5, 6, 7, 14, 30].map(n => (
                        <option key={n} value={n}>{n} night{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:flex-1">
                    <label htmlFor="roomTypeFilter" className="label">Room Type</label>
                    <select id="roomTypeFilter" className="input">
                      <option value="all">All Types</option>
                      {roomTypes.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button className="btn-primary h-[42px] w-full sm:w-auto">
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search
                    </button>
                  </div>
                </div>
                
                {/* Room Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roomTypes.map(room => (
                    <div 
                      key={room.id}
                      className="bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div className="h-40 bg-surface-100 dark:bg-surface-700 relative">
                        {/* Room Type Image */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BedIcon className="h-16 w-16 text-surface-400 dark:text-surface-500" />
                        </div>
                        
                        {/* Available Badge */}
                        <div className="absolute top-2 right-2">
                          <span className="badge-green">
                            {room.available} Available
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h5 className="font-semibold text-surface-900 dark:text-white">{room.name}</h5>
                        
                        <div className="mt-2 space-y-1 text-sm text-surface-600 dark:text-surface-400">
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-2" />
                            <span>Capacity: {room.capacity} guests</span>
                          </div>
                          <div className="flex items-center">
                            <BedIcon className="h-4 w-4 mr-2" />
                            <span>Bed: {room.bedType}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex items-baseline justify-between">
                          <div>
                            <span className="text-xl font-bold text-surface-900 dark:text-white">${room.rate}</span>
                            <span className="text-surface-500 dark:text-surface-400 text-sm"> / night</span>
                          </div>
                          
                          <button
                            onClick={() => {
                              setActiveFeatureTab('reservationForm');
                              setReservationData(prev => ({ ...prev, roomType: room.id }));
                            }}
                            className="btn-outline text-sm py-1.5"
                          >
                            Select
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MainFeature;
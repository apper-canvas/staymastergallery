import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';
import DatePicker from 'react-datepicker';
import { 
         FaBed, 
         FaUsers, 
         FaRegCalendarCheck, 
         FaConciergeBell, 
         FaWifi, 
         FaSwimmingPool, FaParking, FaUtensils, FaSnowflake, 
         FaTv, FaLeaf, FaCheckCircle } from 'react-icons/fa';
import { CgArrowLongRight } from 'react-icons/cg';
import { format, addDays } from 'date-fns';

const MainFeature = ({ addNewBooking }) => {
  // Form state
  const [reservationData, setReservationData] = useState({
    guestName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    roomType: 'standard',
    numRooms: 1,
    bedType: 'king',
    smokingPreference: 'non-smoking',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0,
    specialRequests: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    promoCode: '',
    termsAccepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Form validation
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [endDate, setEndDate] = useState(null);
  const [formProgress, setFormProgress] = useState(25);
  const totalSteps = 5;

  // Animated form refs for scroll into view
  const formStepRefs = {
    step1: useRef(null),
    step2: useRef(null),
    step3: useRef(null),
    step4: useRef(null),
    step5: useRef(null)
  };

  // Room selection state
  const [selectedRoomType, setSelectedRoomType] = useState('standard');
  const [startDate, setStartDate] = useState(null);

  const roomTypes = [
    { id: 'standard', name: 'Standard Room', rate: 99, available: 8, capacity: 2, bedType: 'Queen', image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=640&q=80', amenities: ['Free WiFi', 'TV', 'Air Conditioning'], color: 'blue' },
    { id: 'deluxe', name: 'Deluxe Room', rate: 149, available: 5, capacity: 2, bedType: 'King', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=640&q=80', amenities: ['Free WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'], color: 'green' },
    { id: 'suite', name: 'Executive Suite', rate: 249, available: 3, capacity: 4, bedType: 'King + Sofa', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=640&q=80', amenities: ['Free WiFi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Lounge Area', 'Premium Toiletries'], color: 'purple' },
    { id: 'family', name: 'Family Room', rate: 199, available: 2, capacity: 4, bedType: '2 Queen' }
  ];


  // Bed type options
  const bedTypes = [
    { id: 'king', name: 'King Bed' },
    { id: 'queen', name: 'Queen Bed' },
    { id: 'double', name: 'Double Bed' },
    { id: 'twin', name: 'Twin Beds' },
    { id: 'single', name: 'Single Bed' }
  ];

  // Smoking preference options
  const smokingOptions = [
    { id: 'non-smoking', name: 'Non-Smoking' },
    { id: 'smoking', name: 'Smoking' }
  ];

  // Payment method options
  const paymentMethods = [
    { id: 'credit', name: 'Credit/Debit Card' },
    { id: 'upi', name: 'UPI' },
    { id: 'netbanking', name: 'Net Banking' },
    { id: 'cash', name: 'Cash at Hotel' }
  ];


  // Define the active tab state (Reservation Form, Room Availability)

  // Calculate minimum dates for check-in and check-out
  const today = new Date();
  const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

  // Calculate stay duration and total cost
  const [stayDetails, setStayDetails] = useState({
    nights: 0,
    totalCost: 0
  });

  const [activeFeatureTab, setActiveFeatureTab] = useState('reservationForm');
  // Handle step navigation
  const goToStep = (step) => {
    setCurrentStep(step);
    setFormProgress(step * (100 / totalSteps));
  };

  // Update reservation costs when dates or room type changes
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
  
  // Update form data when date range changes
  useEffect(() => {
    if (startDate && endDate) {
      setReservationData(prev => ({
        ...prev,
        checkInDate: startDate.toISOString().split('T')[0],
        checkOutDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [startDate, endDate]);
  
  // Update form data when room selection changes
  useEffect(() => {
    setReservationData(prev => ({
      ...prev,
      roomType: selectedRoomType
    }));
  }, [selectedRoomType]);
  

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!reservationData.guestName || !reservationData.guestName.trim()) {
      newErrors.guestName = 'Guest name is required';
    }

    if (!reservationData.email || !reservationData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(reservationData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!reservationData.phone || !reservationData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (currentStep === 4) {
      if (reservationData.paymentMethod === 'credit') {
        if (!reservationData.cardNumber || !reservationData.cardNumber.trim()) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!/^\d{16}$/.test(reservationData.cardNumber.replace(/\s/g, ''))) {
          newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        if (!reservationData.cardExpiry || !reservationData.cardExpiry.trim()) {
          newErrors.cardExpiry = 'Expiry date is required';
        }

        if (!reservationData.cardCVV || !reservationData.cardCVV.trim()) {
          newErrors.cardCVV = 'CVV is required';
        }
      }
    }

    if (!reservationData.checkInDate) {
      newErrors.checkInDate = 'Please select check-in date';
    }
    
    if (!reservationData.checkOutDate) {
      newErrors.checkOutDate = 'Please select check-out date';
    } else if (reservationData.checkInDate && reservationData.checkOutDate <= reservationData.checkInDate) {
      newErrors.checkOutDate = 'Check-out date must be after check-in date';
    }
    
    setErrors(newErrors);
    
    if (currentStep === 5 && !reservationData.termsAccepted) {
      newErrors.termsAccepted = 'You must agree to the terms and conditions';
    }
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle input changes
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
        
        // Create the booking object in the format expected by the Recent Bookings section
        const newBooking = {
          guest: reservationData.guestName,
          checkIn: reservationData.checkInDate,
          checkOut: reservationData.checkOutDate,
          roomType: roomTypes.find(room => room.id === reservationData.roomType)?.name || 'Standard',
        };
        
        // Add the new booking to the Recent Bookings section if the addNewBooking prop exists
        if (typeof addNewBooking === 'function') {
          addNewBooking(newBooking);
        }
        
        // Show success toast
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
          specialRequests: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          numRooms: 1,
          bedType: 'king',
          smokingPreference: 'non-smoking',
          paymentMethod: 'credit',
          cardNumber: '',
          cardExpiry: '',
          cardCVV: ''
        });

      }, 1500);
    } else {
      toast.error('Please correct the errors in the form');
    }
  };

  // Handle submission for multi-step form
  const handleStepSubmit = (e) => {
    e.preventDefault();
    // Validate current step
    let isValid = true;
    const newErrors = {};
    
    if (currentStep === 1 && !selectedRoomType) {
      newErrors.roomType = 'Please select a room type';
      isValid = false;
    } else if (currentStep === 2 && (!startDate || !endDate)) {
      newErrors.dates = 'Please select both check-in and check-out dates';
      isValid = false;
    } else if (currentStep === 3 && !reservationData.guestName) {
      validateForm(); // Use existing validation for guest info
      return;
    } else if (currentStep === 4) {
      if (reservationData.paymentMethod === 'credit' && (!reservationData.cardNumber || !reservationData.cardExpiry || !reservationData.cardCVV)) {
        validateForm();
        return;
      }
    } else if (currentStep === 5 && !reservationData.termsAccepted) {
      newErrors.termsAccepted = 'You must agree to the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    if (isValid && currentStep < totalSteps) goToStep(currentStep + 1);
  };

  // Handle date changes
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end || (start ? addDays(start, 1) : null));
    setReservationData(prev => ({
      ...prev,
      checkInDate: start ? start.toISOString().split('T')[0] : '',
      checkOutDate: end ? end.toISOString().split('T')[0] : (start ? addDays(start, 1).toISOString().split('T')[0] : '')
    }));
  };
  // Format credit card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
    return parts.length > 0 ? parts.join(' ') : value;
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
  const CreditCardIcon = getIcon('credit-card');
  const MapPinIcon = getIcon('map-pin');
  const MinusIcon = getIcon('minus');
  const ClipboardIcon = getIcon('clipboard');
  const ShieldIcon = getIcon('shield');
  const TagIcon = getIcon('tag');
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
              <div className="px-1 relative">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-surface-900 dark:text-white mb-2">Create New Reservation</h3>
                  <p className="text-surface-600 dark:text-surface-300">Book your perfect stay in just a few steps</p>
                
                  {/* Progress Bar */}
                  <div className="mt-8 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 flex">
                        {Array.from({ length: totalSteps }).map((_, index) => (
                          <div key={index} className="flex items-center flex-1">
                            <button 
                              onClick={() => index + 1 <= Math.max(currentStep, 2) && goToStep(index + 1)}
                              className={`step-indicator ${
                                currentStep > index + 1 
                                  ? 'step-indicator-completed' 
                                  : currentStep === index + 1 
                                    ? 'step-indicator-active' 
                                    : 'step-indicator-inactive'
                              }`}
                              disabled={index + 1 > Math.max(currentStep, 2)}
                            >
                              {currentStep > index + 1 ? <CheckIcon className="h-5 w-5" /> : index + 1}
                            </button>
                            
                            {index < totalSteps - 1 && (
                              <div className={`step-connector ${currentStep > index + 1 ? 'step-connector-active' : ''}`}></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        initial={{ width: '25%' }}
                        animate={{ width: `${formProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
                
                <form onSubmit={handleStepSubmit}>
                  {/* Step 1: Room Selection */}
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        ref={formStepRefs.step1}
                        key="step1"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">
                            Choose Your Room
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400">
                            Select the perfect room for your stay
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {roomTypes.slice(0, 3).map((room) => (
                            <motion.div
                              key={room.id}
                              whileHover={{ y: -5 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedRoomType(room.id)}
                              className={`room-card ${selectedRoomType === room.id ? 'room-card-selected' : 'border-surface-200 dark:border-surface-700'}`}
                            >
                              <div className="relative h-48 overflow-hidden rounded-t-lg">
                                {room.image ? (
                                  <img 
                                    src={room.image} 
                                    alt={room.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                                    <FaBed className="h-16 w-16 text-surface-300" />
                                  </div>
                                )}
                                
                                <div className={`room-card-badge bg-${room.color || 'blue'}-100 text-${room.color || 'blue'}-800 dark:bg-${room.color || 'blue'}-900 dark:text-${room.color || 'blue'}-200`}>
                                  ${room.rate}/night
                                </div>
                              </div>
                              
                              <div className="p-4 bg-white dark:bg-surface-800">
                                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">{room.name}</h4>
                                
                                <div className="flex items-center mb-3 text-sm text-surface-500 dark:text-surface-400">
                                  <FaUsers className="mr-1" />
                                  <span>Up to {room.capacity} guests</span>
                                  <span className="mx-2">•</span>
                                  <FaBed className="mr-1" />
                                  <span>{room.bedType}</span>
                                </div>
                                
                                <div className="space-y-1">
                                  {room.amenities?.map((amenity, index) => (
                                    <div key={index} className="flex items-center text-xs text-surface-600 dark:text-surface-300">
                                      <CheckIcon className="h-3 w-3 mr-1 text-green-500" />
                                      {amenity}
                                    </div>
                                  ))}
                                </div>
                                
                                {selectedRoomType === room.id && (
                                  <div className="mt-3 flex items-center justify-center bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light rounded-lg py-1.5 text-sm">
                                    <CheckIcon className="h-4 w-4 mr-1" />
                                    Selected
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end mt-8">
                          <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 group"
                          >
                            Continue to Dates
                            <CgArrowLongRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 2: Date Selection */}
                    {currentStep === 2 && (
                      <motion.div
                        ref={formStepRefs.step2}
                        key="step2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">
                            Choose Your Dates
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400">
                            Select check-in and check-out dates
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <div className="flex items-center mb-4">
                                <FaRegCalendarCheck className="text-primary mr-2 h-5 w-5" />
                                <h4 className="text-lg font-medium text-surface-800 dark:text-surface-200">Date Selection</h4>
                              </div>
                              
                              <div className="mb-4">
                                <label className="label" htmlFor="dateRange">Check-in & Check-out</label>
                                <div className="relative">
                                  <div className="relative">
                                    <div className="relative focus-within:ring-2 focus-within:ring-primary focus-within:border-primary rounded-lg overflow-hidden">
                                      <div 
                                        className="input pl-10 flex items-center cursor-pointer hover:border-primary"
                                        onClick={() => {
                                          // Find the date picker input and focus it to open the calendar
                                          const datePickerEl = document.querySelector('.react-datepicker__input-container input');
                                          if (datePickerEl) {
                                            datePickerEl.focus();
                                          }
                                        }}
                                      >
                                        {startDate && endDate ? (
                                          <span className="text-surface-900 dark:text-white font-medium">
                                            {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
                                          </span>
                                        ) : (
                                          <span className="text-surface-500">Select date range</span>
                                        )}
                                      </div>
                                      <DatePicker
                                        selectsRange={true}
                                        startDate={startDate}
                                        endDate={endDate}
                                        id="dateRange"
                                        onChange={(update) => {
                                          // Directly update the reservation data when dates change
                                          handleDateChange(update);
                                          // Find and close the date picker if both dates are selected
                                          if (update[0] && update[1]) {
                                            document.activeElement.blur();
                                          }
                                        }}
                                        minDate={today}
                                        monthsShown={window.innerWidth > 768 ? 2 : 1}
                                        className="input py-3 pl-9 w-full font-medium text-surface-900 dark:text-white border-2 focus:border-primary"
                                        placeholderText="Select check-in and check-out dates"
                                        wrapperClassName="w-full"
                                      />
                                    </div>
                                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                                  </div>
                                  {errors.dates && <p className="mt-1 text-sm text-red-500">{errors.dates}</p>}
                                </div>
                              </div>                              
                              <div className="flex flex-col space-y-2 mb-4">
                                <div className="flex justify-between items-center">
                                  <span className="text-surface-600 dark:text-surface-400">Check-in:</span>
                                  <span className="font-medium text-surface-900 dark:text-white">
                                    {startDate ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-surface-600 dark:text-surface-400">Check-out:</span>
                                  <span className="font-medium text-surface-900 dark:text-white">
                                    {endDate ? endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                                  </span>
                                </div>
                                {startDate && endDate && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-surface-600 dark:text-surface-400">Duration:</span>
                                    <span className="font-medium text-surface-900 dark:text-white">
                                      {Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))} night(s)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center">
                              <div className="text-center p-5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 max-w-xs animate-pulse-slow">
                                <div className="mb-3 font-semibold text-lg text-blue-800 dark:text-blue-300">
                                  {selectedRoomType && roomTypes.find(r => r.id === selectedRoomType)?.name}
                                </div>
                                
                                <div className="flex justify-center mb-4">
                                  <FaBed className="text-blue-600 dark:text-blue-400 h-8 w-8" />
                                </div>
                                
                                <div className="mb-1 text-blue-600 dark:text-blue-400">
                                  <span className="text-2xl font-bold">${selectedRoomType && roomTypes.find(r => r.id === selectedRoomType)?.rate}</span>
                                  <span className="text-sm"> / night</span>
                                </div>
                                
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                  {startDate && endDate && (
                                    <>
                                      Total: ${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) * (selectedRoomType && roomTypes.find(r => r.id === selectedRoomType)?.rate || 0)}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={() => goToStep(1)}
                            className="btn-outline py-2.5 px-6"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 group"
                          >
                            Continue to Guest Details
                            <CgArrowLongRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 3: Guest Information */}
                    {currentStep === 3 && (
                      <motion.div
                        ref={formStepRefs.step3}
                        key="step3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">
                            Guest Information
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400">
                            Tell us who will be staying
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="flex items-center mb-4">
                                <UserIcon className="text-primary mr-2 h-5 w-5" />
                                <h4 className="text-lg font-medium text-surface-800 dark:text-surface-200">Your Details</h4>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="guestName" className="label">Full Name</label>
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
                            </div>
                            
                            <div>
                              <div className="flex items-center mb-4">
                                <FaUsers className="text-primary mr-2 h-5 w-5" />
                                <h4 className="text-lg font-medium text-surface-800 dark:text-surface-200">Guest Count</h4>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="label">Adults</label>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => setReservationData(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                                      className="p-3 rounded-l-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <div className="px-6 py-3 bg-white dark:bg-surface-800 border-t border-b border-surface-300 dark:border-surface-600 text-center font-medium text-lg w-20">
                                      {reservationData.adults}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setReservationData(prev => ({ ...prev, adults: Math.min(6, prev.adults + 1) }))}
                                      className="p-3 rounded-r-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
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
                                      className="p-3 rounded-l-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <div className="px-6 py-3 bg-white dark:bg-surface-800 border-t border-b border-surface-300 dark:border-surface-600 text-center font-medium text-lg w-20">
                                      {reservationData.children}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setReservationData(prev => ({ ...prev, children: Math.min(4, prev.children + 1) }))}
                                      className="p-3 rounded-r-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={() => goToStep(2)}
                            className="btn-outline py-2.5 px-6"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 group"
                          >
                            Continue to Preferences & Payment
                            <CgArrowLongRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {/* Step 4: Preferences & Payment */}
                    {currentStep === 4 && (
                      <motion.div
                        ref={formStepRefs.step4}
                        key="step4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">
                            Room Preferences & Payment
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400">
                            Choose your preferences and provide payment details
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-surface-800 rounded-xl p-6 border border-surface-200 dark:border-surface-700 shadow-md">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <div className="flex items-center mb-4">
                                <BedIcon className="text-primary mr-2 h-5 w-5" />
                                <h4 className="text-lg font-medium text-surface-800 dark:text-surface-200">Room Preferences</h4>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label htmlFor="numRooms" className="label">Number of Rooms</label>
                                  <div className="flex items-center">
                                    <button
                                      type="button"
                                      onClick={() => setReservationData(prev => ({ ...prev, numRooms: Math.max(1, prev.numRooms - 1) }))}
                                      className="p-3 rounded-l-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <div className="px-6 py-3 bg-white dark:bg-surface-800 border-t border-b border-surface-300 dark:border-surface-600 text-center font-medium text-lg w-20">
                                      {reservationData.numRooms}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setReservationData(prev => ({ ...prev, numRooms: Math.min(5, prev.numRooms + 1) }))}
                                      className="p-3 rounded-r-lg bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="label">Bed Type</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {bedTypes.map((type) => (
                                      <div 
                                        key={type.id}
                                        onClick={() => setReservationData(prev => ({ ...prev, bedType: type.id }))}
                                        className={`cursor-pointer flex items-center p-3 rounded-lg border ${
                                          reservationData.bedType === type.id
                                            ? 'border-primary bg-primary/10 text-primary dark:border-primary-light dark:bg-primary/20 dark:text-primary-light'
                                            : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                                        }`}
                                      >
                                        <FaBed className="mr-2" />
                                        <span>{type.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="label">Smoking Preference</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {smokingOptions.map((option) => (
                                      <div 
                                        key={option.id}
                                        onClick={() => setReservationData(prev => ({ ...prev, smokingPreference: option.id }))}
                                        className={`cursor-pointer flex items-center p-3 rounded-lg border ${
                                          reservationData.smokingPreference === option.id
                                            ? 'border-primary bg-primary/10 text-primary dark:border-primary-light dark:bg-primary/20 dark:text-primary-light'
                                            : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                                        }`}
                                      >
                                        {option.id === 'non-smoking' ? <FaLeaf className="mr-2" /> : <FaCheckCircle className="mr-2" />}
                                        <span>{option.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center mb-4">
                                <CreditCardIcon className="text-primary mr-2 h-5 w-5" />
                                <h4 className="text-lg font-medium text-surface-800 dark:text-surface-200">Payment Details</h4>
                              </div>
                              
                              <div className="space-y-4">
                                <div>
                                  <label className="label">Payment Method</label>
                                  <div className="grid grid-cols-2 gap-2">
                                    {paymentMethods.map((method) => (
                                      <div 
                                        key={method.id}
                                        onClick={() => setReservationData(prev => ({ ...prev, paymentMethod: method.id }))}
                                        className={`cursor-pointer flex items-center p-3 rounded-lg border ${
                                          reservationData.paymentMethod === method.id
                                            ? 'border-primary bg-primary/10 text-primary dark:border-primary-light dark:bg-primary/20 dark:text-primary-light'
                                            : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                                        }`}
                                      >
                                        {method.id === 'credit' && <CreditCardIcon className="mr-2 h-4 w-4" />}
                                        {method.id === 'upi' && <ShieldIcon className="mr-2 h-4 w-4" />}
                                        {method.id === 'netbanking' && <HomeIcon className="mr-2 h-4 w-4" />}
                                        {method.id === 'cash' && <UserIcon className="mr-2 h-4 w-4" />}
                                        <span>{method.name}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                {reservationData.paymentMethod === 'credit' && (
                                  <>
                                    <div>
                                      <label htmlFor="cardNumber" className="label">Card Number</label>
                                      <div className="relative">
                                        <input
                                          type="text"
                                          id="cardNumber"
                                          name="cardNumber"
                                          value={reservationData.cardNumber}
                                          onChange={(e) => {
                                            const formattedValue = formatCardNumber(e.target.value);
                                            setReservationData(prev => ({ ...prev, cardNumber: formattedValue }));
                                          }}
                                          maxLength={19}
                                          className={`input pl-9 ${errors.cardNumber ? 'border-red-500 dark:border-red-400' : ''}`}
                                          placeholder="1234 5678 9012 3456"
                                        />
                                        <CreditCardIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-surface-500" />
                                      </div>
                                      {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label htmlFor="cardExpiry" className="label">Expiry Date</label>
                                        <input
                                          type="text"
                                          id="cardExpiry"
                                          name="cardExpiry"
                                          value={reservationData.cardExpiry}
                                          onChange={handleInputChange}
                                          className={`input ${errors.cardExpiry ? 'border-red-500 dark:border-red-400' : ''}`}
                                          placeholder="MM/YY"
                                          maxLength={5}
                                        />
                                        {errors.cardExpiry && <p className="mt-1 text-sm text-red-500">{errors.cardExpiry}</p>}
                                      </div>
                                      
                                      <div>
                                        <label htmlFor="cardCVV" className="label">CVV</label>
                                        <input
                                          type="text"
                                          id="cardCVV"
                                          name="cardCVV"
                                          value={reservationData.cardCVV}
                                          onChange={handleInputChange}
                                          className={`input ${errors.cardCVV ? 'border-red-500 dark:border-red-400' : ''}`}
                                          placeholder="123"
                                          maxLength={3}
                                        />
                                        {errors.cardCVV && <p className="mt-1 text-sm text-red-500">{errors.cardCVV}</p>}
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={() => goToStep(3)}
                            className="btn-outline py-2.5 px-6"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 group"
                          >
                            Continue to Summary
                            <CgArrowLongRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Billing Address & Promo Code */}
                    {currentStep === 4 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6"
                      >
                        <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-5 border border-surface-200 dark:border-surface-700">
                          <h4 className="font-medium text-surface-800 dark:text-surface-200 flex items-center mb-3">
                            <MapPinIcon className="mr-2 text-primary h-4 w-4" />
                            Billing Address
                          </h4>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                              type="text"
                              name="address"
                              value={reservationData.address}
                              onChange={handleInputChange}
                              className="input"
                              placeholder="Street Address"
                            />
                            <input
                              type="text"
                              name="city"
                              value={reservationData.city}
                              onChange={handleInputChange}
                              className="input"
                              placeholder="City"
                            />
                            <input
                              type="text"
                              name="state"
                              value={reservationData.state}
                              onChange={handleInputChange}
                              className="input"
                              placeholder="State/Province"
                            />
                            <input
                              type="text"
                              name="zipCode"
                              value={reservationData.zipCode}
                              onChange={handleInputChange}
                              className="input"
                              placeholder="ZIP/Postal Code"
                            />
                            <input
                              type="text"
                              name="country"
                              value={reservationData.country}
                              onChange={handleInputChange}
                              className="input"
                              placeholder="Country"
                            />
                          </div>
                          
                          <div className="mt-4">
                            <h4 className="font-medium text-surface-800 dark:text-surface-200 flex items-center mb-3">
                              <TagIcon className="mr-2 text-primary h-4 w-4" />
                              Promo Code
                            </h4>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="promoCode"
                                value={reservationData.promoCode}
                                onChange={handleInputChange}
                                className="input flex-1"
                                placeholder="Enter promo code if available"
                              />
                              <button
                                type="button"
                                className="btn-secondary px-4"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 4: Summary and Confirmation */}
                    {currentStep === 5 && (
                      <motion.div
                        ref={formStepRefs.step5}
                        key="step5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-8">
                          <h3 className="text-xl font-semibold text-surface-800 dark:text-surface-100 mb-2">
                            Review & Confirm
                          </h3>
                          <p className="text-surface-600 dark:text-surface-400">
                            Review your reservation details before confirming
                          </p>
                        </div>
                        
                        <div className="bg-white dark:bg-surface-800 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-lg">
                          <div className="bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/40 dark:to-secondary/40 py-5 px-6">
                            <h4 className="text-lg font-semibold text-surface-900 dark:text-white">Reservation Summary</h4>
                          </div>
                          
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h5 className="font-medium text-surface-700 dark:text-surface-300 mb-3">Room Information</h5>
                                <div className="space-y-2 text-surface-900 dark:text-white">
                                  <div className="flex justify-between">
                                    <span>Room Type:</span>
                                    <span className="font-medium">{roomTypes.find(r => r.id === selectedRoomType)?.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Rate:</span>
                                    <span className="font-medium">${roomTypes.find(r => r.id === selectedRoomType)?.rate}/night</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Max Occupancy:</span>
                                    <span className="font-medium">{roomTypes.find(r => r.id === selectedRoomType)?.capacity} guests</span>
                                  </div>
                                </div>
                                
                                <div className="mt-6">
                                  <h5 className="font-medium text-surface-700 dark:text-surface-300 mb-3">Stay Details</h5>
                                  <div className="space-y-2 text-surface-900 dark:text-white">
                                    <div className="flex justify-between">
                                      <span>Check-in:</span>
                                      <span className="font-medium">
                                        {startDate ? startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Check-out:</span>
                                      <span className="font-medium">
                                        {endDate ? endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '-'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Length of Stay:</span>
                                      <span className="font-medium">
                                        {Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))} nights
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Guests:</span>
                                      <span className="font-medium">
                                        {reservationData.adults} adults, {reservationData.children} children
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Number of Rooms:</span>
                                      <span className="font-medium">
                                        {reservationData.numRooms}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Bed Type:</span>
                                      <span className="font-medium">
                                        {bedTypes.find(b => b.id === reservationData.bedType)?.name || 'King Bed'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Room Preference:</span>
                                      <span className="font-medium">
                                        {smokingOptions.find(o => o.id === reservationData.smokingPreference)?.name || 'Non-Smoking'}
                                      </span>
                                    </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-surface-700 dark:text-surface-300 mb-3">Guest Information</h5>
                                <div className="space-y-2 text-surface-900 dark:text-white">
                                  <div className="flex justify-between">
                                    <span>Name:</span>
                                    <span className="font-medium">{reservationData.guestName}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Email:</span>
                                    <span className="font-medium">{reservationData.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span className="font-medium">{reservationData.phone}</span>
                                  </div>
                                {reservationData.address && (
                                  <div className="flex justify-between">
                                    <span>Address:</span>
                                    <span className="font-medium">
                                      {reservationData.address}{reservationData.city ? `, ${reservationData.city}` : ''}
                                      {reservationData.state ? `, ${reservationData.state}` : ''}
                                      {reservationData.zipCode ? ` ${reservationData.zipCode}` : ''}
                                      {reservationData.country ? `, ${reservationData.country}` : ''}
                                    </span>
                                  </div>
                                )}
                                </div>
                                
                                <div className="mt-6">
                                  <h5 className="font-medium text-surface-700 dark:text-surface-300 mb-3">Payment Details</h5>
                                  <div className="space-y-2 text-surface-900 dark:text-white">
                                    <div className="flex justify-between">
                                      <span>Payment Method:</span>
                                      <span className="font-medium">
                                        {paymentMethods.find(m => m.id === reservationData.paymentMethod)?.name || 'Credit/Debit Card'}
                                      </span>
                                    </div>
                                    
                                    {reservationData.paymentMethod === 'credit' && (
                                      <>
                                        <div className="flex justify-between">
                                          <span>Card Number:</span>
                                          <span className="font-medium">
                                            **** **** **** {reservationData.cardNumber.slice(-4)}
                                          </span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                          <span>Expiry Date:</span>
                                          <span className="font-medium">{reservationData.cardExpiry}</span>
                                        </div>
                                      </>
                                    )}
                                    
                                    {reservationData.promoCode && (
                                      <div className="flex justify-between">
                                        <span>Promo Code:</span>
                                        <span className="font-medium">{reservationData.promoCode}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-6">
                                  <h5 className="font-medium text-surface-700 dark:text-surface-300 mb-3">Pricing Details</h5>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-surface-900 dark:text-white">
                                      <span>Room Rate:</span>
                                      <span className="font-medium">${roomTypes.find(r => r.id === selectedRoomType)?.rate || 0} × {Math.round((endDate - startDate) / (1000 * 60 * 60 * 24))} nights × {reservationData.numRooms} room(s)</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-surface-900 dark:text-white">
                                      <span>Subtotal:</span>
                                      <span className="font-medium">${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) * (roomTypes.find(r => r.id === selectedRoomType)?.rate || 0) * reservationData.numRooms}</span>
                                    </div>
                                    
                                      <div className="flex justify-between text-lg font-semibold text-surface-900 dark:text-white">
                                        <span>Total:</span>
                                        <span className="text-primary dark:text-primary-light">
                                          ${Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) * (roomTypes.find(r => r.id === selectedRoomType)?.rate || 0)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          <div className="mt-6">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id="termsAccepted"
                                checked={reservationData.termsAccepted}
                                onChange={(e) => setReservationData(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                                className={`h-5 w-5 rounded border-surface-300 dark:border-surface-600 text-primary focus:ring-primary ${
                                  errors.termsAccepted ? 'border-red-500 dark:border-red-400' : ''
                                }`}
                              />
                              <label htmlFor="termsAccepted" className="ml-2 text-surface-700 dark:text-surface-300">
                                I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Privacy Policy</a>
                              </label>
                            </div>
                            {errors.termsAccepted && (
                              <p className="mt-1 text-sm text-red-500">{errors.termsAccepted}</p>
                            )}
                          </div>

                            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                            <div className="flex items-center text-blue-800 dark:text-blue-300">
                                <FaConciergeBell className="h-5 w-5 mr-2" />
                                <span className="font-medium">Special Requests</span>
                              </div>
                              <p className="mt-2 text-blue-700 dark:text-blue-400">
                                {reservationData.specialRequests || "No special requests provided."}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between mt-8">
                          <button
                            type="button"
                            onClick={() => goToStep(4)}
                            className="btn-outline py-2.5 px-6"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn-primary py-2.5 px-6 min-w-[180px]"
                          >
                            {isSubmitting ? (
                              <>
                                <LoaderIcon className="animate-spin h-5 w-5 mr-2" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <CheckIcon className="h-5 w-5 mr-2" />
                                Confirm Reservation
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                </form>
                  
                  {/* Special Requests - Only displayed on Step 3 and can be toggled */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6"
                    >
                      <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-5 border border-surface-200 dark:border-surface-700">
                        <h4 className="font-medium text-surface-800 dark:text-surface-200 flex items-center mb-3">
                          <FaConciergeBell className="mr-2 text-primary" />
                          Special Requests
                        </h4>
                        
                        <div>
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
                  )}
                </AnimatePresence>
              </div>
            </div>
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
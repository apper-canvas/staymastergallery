import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

const BookingDetailsModal = ({ isOpen, onClose, booking }) => {
  if (!booking) return null;

  // Icons
  const XIcon = getIcon('x');
  const UserIcon = getIcon('user');
  const CalendarIcon = getIcon('calendar');
  const BedIcon = getIcon('bed');
  const CreditCardIcon = getIcon('credit-card');
  const MailIcon = getIcon('mail');
  const PhoneIcon = getIcon('phone');
  const ClockIcon = getIcon('clock');
  const CheckSquareIcon = getIcon('check-square');

  // Generate payment information based on booking
  const paymentInfo = {
    method: 'Credit Card',
    cardNumber: '**** **** **** 4242',
    totalAmount: booking.roomType === 'Suite' ? 249 * 4 : 
                 booking.roomType === 'Deluxe' ? 149 * 4 : 99 * 4,
    status: 'Paid',
    date: new Date().toISOString().split('T')[0]
  };

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div 
            className="bg-white dark:bg-surface-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Booking Details</h2>
                <button 
                  onClick={onClose}
                  className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-white"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Guest Information */}
                <div className="border-b border-surface-200 dark:border-surface-700 pb-4">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-light" />
                    Guest Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">{booking.guest}</span>
                    </div>
                    <div className="flex items-center">
                      <MailIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">{booking.guest.toLowerCase().replace(' ', '.')}@example.com</span>
                    </div>
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">(123) 456-7890</span>
                    </div>
                  </div>
                </div>

                {/* Reservation Details */}
                <div className="border-b border-surface-200 dark:border-surface-700 pb-4">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3 flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-light" />
                    Reservation Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <BedIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">{booking.roomType}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Check-in: {booking.checkIn}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">4 Nights</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Check-out: {booking.checkOut}</span>
                    </div>
                    <div className="flex items-center col-span-2">
                      <CheckSquareIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Status: <span className={`${booking.status === 'confirmed' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400'} font-medium`}>{booking.status === 'confirmed' ? 'Confirmed' : 'Checked In'}</span></span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3 flex items-center">
                    <CreditCardIcon className="h-5 w-5 mr-2 text-primary dark:text-primary-light" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">{paymentInfo.method} ({paymentInfo.cardNumber})</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Date: {paymentInfo.date}</span>
                    </div>
                    <div className="flex items-center">
                      <CheckSquareIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Status: <span className="text-green-600 dark:text-green-400 font-medium">{paymentInfo.status}</span></span>
                    </div>
                    <div className="flex items-center">
                      <CreditCardIcon className="h-4 w-4 mr-2 text-surface-500" />
                      <span className="text-surface-700 dark:text-surface-300">Total: <span className="text-surface-900 dark:text-white font-semibold">${paymentInfo.totalAmount}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={onClose}
                  className="btn-outline"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;
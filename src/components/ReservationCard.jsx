import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

const ReservationCard = ({ reservation, onCheckIn, onCheckOut }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Icons
  const CalendarIcon = getIcon('calendar');
  const UsersIcon = getIcon('users');
  const BedIcon = getIcon('bed');
  const DollarSignIcon = getIcon('dollar-sign');
  const ClockIcon = getIcon('clock');
  const ChevronDownIcon = getIcon('chevron-down');
  const ChevronUpIcon = getIcon('chevron-up');
  const CheckInIcon = getIcon('log-in');
  const CheckOutIcon = getIcon('log-out');

  // Helper to format dates
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  // Helper to format timestamps
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    return format(parseISO(timestamp), 'MMM dd, yyyy - HH:mm');
  };

  // Get status badge class based on reservation status
  const getStatusBadge = () => {
    switch(reservation.status) {
      case 'confirmed': return 'badge-purple';
      case 'ready-for-checkin': return 'badge-yellow';
      case 'checked-in': return 'badge-blue';
      case 'completed': return 'badge-green';
      default: return 'badge-gray';
    }
  };

  // Get status text
  const getStatusText = () => {
    switch(reservation.status) {
      case 'confirmed': return 'Confirmed';
      case 'ready-for-checkin': return 'Ready for Check-in';
      case 'checked-in': return 'Checked In';
      case 'completed': return 'Completed';
      default: return reservation.status;
    }
  };

  return (
    <div className="card mb-4 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-3 md:mb-0">
          <span className={`${getStatusBadge()} mb-2`}>
            {getStatusText()}
          </span>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mt-1">
            {reservation.roomType} - Room {reservation.roomNumber}
          </h3>
          <div className="flex items-center text-sm mt-2">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <div className="flex items-center">
              <span className="bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded text-surface-900 dark:text-white font-medium text-sm">
                {formatDate(reservation.checkInDate)}
              </span> <span className="mx-1 text-surface-600 dark:text-surface-400">-</span> <span className="bg-surface-200 dark:bg-surface-600 px-2 py-1 rounded text-surface-900 dark:text-white font-medium text-sm">{formatDate(reservation.checkOutDate)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {reservation.status === 'ready-for-checkin' && (
            <button 
              className="btn-primary text-sm flex items-center" 
              onClick={() => onCheckIn(reservation)}
            >
              <CheckInIcon className="h-4 w-4 mr-1" />
              Check In
            </button>
          )}
          {reservation.status === 'checked-in' && (
            <button 
              className="btn-secondary text-sm flex items-center" 
              onClick={() => onCheckOut(reservation)}
            >
              <CheckOutIcon className="h-4 w-4 mr-1" />
              Check Out
            </button>
          )}
          <button 
            className="btn-outline text-sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <><ChevronUpIcon className="h-4 w-4 mr-1" /> Less</>
            ) : (
              <><ChevronDownIcon className="h-4 w-4 mr-1" /> More</>
            )}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300 flex items-center">
              <UsersIcon className="h-4 w-4 mr-2" /> Guests: <span className="font-medium ml-1">{reservation.guests}</span>
            </p>
            <p className="text-sm text-surface-700 dark:text-surface-300 mt-2 flex items-center">
              <BedIcon className="h-4 w-4 mr-2" /> Room Type: <span className="font-medium ml-1">{reservation.roomType}</span>
            </p>
            <p className="text-sm text-surface-700 dark:text-surface-300 mt-2 flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-2" /> Total: <span className="font-medium ml-1">${reservation.totalAmount}</span>
            </p>
          </div>
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300 flex items-center">
              <ClockIcon className="h-4 w-4 mr-2" /> Booked on: <span className="font-medium ml-1">{formatDate(reservation.createdAt)}</span>
            </p>
            {reservation.checkInTime && (
              <p className="text-sm text-surface-700 dark:text-surface-300 mt-2 flex items-center">
                <CheckInIcon className="h-4 w-4 mr-2" /> Checked in: <span className="font-medium ml-1">{formatTimestamp(reservation.checkInTime)}</span>
              </p>
            )}
            {reservation.checkOutTime && (
              <p className="text-sm text-surface-700 dark:text-surface-300 mt-2 flex items-center">
                <CheckOutIcon className="h-4 w-4 mr-2" /> Checked out: <span className="font-medium ml-1">{formatTimestamp(reservation.checkOutTime)}</span>
              </p>
            )}
          </div>
          {reservation.specialRequests && (
            <div className="col-span-1 md:col-span-2 mt-2">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Special Requests:</p>
              <p className="text-sm text-surface-600 dark:text-surface-400 mt-1 italic">
                "{reservation.specialRequests}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReservationCard;
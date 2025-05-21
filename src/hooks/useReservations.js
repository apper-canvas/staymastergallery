import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  fetchReservations, 
  checkIn as apiCheckIn, 
  checkOut as apiCheckOut 
} from '../services/reservationService';

/**
 * Custom hook to manage reservations for a guest
 */
const useReservations = (guestId) => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load reservations for the guest
   */
  const loadReservations = useCallback(async () => {
    if (!guestId) return;
    
    try {
      setIsLoading(true);
      const data = await fetchReservations({ guestId }, 100, 0);
      setReservations(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      setError('Failed to load reservations.');
      toast.error('Failed to load your reservations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [guestId]);

  // Load reservations when the component mounts or guestId changes
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  /**
   * Check-in a guest for a reservation
   */
  const checkIn = async (reservationId, checkInDetails) => {
    try {
      setIsLoading(true);
      const updatedReservation = await apiCheckIn(reservationId);
      
      // Update the local state with the new reservation
      await loadReservations(); // Reload all reservations to get the updated data
      
      toast.success('Check-in completed successfully!');
      return true;
    } catch (err) {
      console.error('Failed to complete check-in:', err);
      toast.error('Failed to complete check-in. Please try again or contact reception.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check-out a guest from a reservation
   */
  const checkOut = async (reservationId, checkOutDetails) => {
    try {
      setIsLoading(true);
      const updatedReservation = await apiCheckOut(reservationId);
      await loadReservations(); // Reload all reservations to get the updated data
      toast.success('Check-out completed successfully!');
      return true;
    } catch (err) {
      console.error('Failed to complete check-out:', err);
      toast.error('Failed to complete check-out. Please try again or contact reception.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    reservations,
    isLoading,
    error,
    refreshReservations: loadReservations,
    checkIn,
    checkOut
  };
};

export default useReservations;
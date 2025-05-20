import { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '../utils/mockApiService';
import { toast } from 'react-toastify';

// Custom hook to manage reservations for a guest
const useReservations = (guestId) => {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reservations for the guest
  const loadReservations = useCallback(async () => {
    if (!guestId) return;
    
    try {
      setIsLoading(true);
      const data = await reservationApi.getGuestReservations(guestId);
      setReservations(data);
      setError(null);
    } catch (err) {
      setError('Failed to load reservations.');
      toast.error('Failed to load your reservations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [guestId]);

  // Initial load
  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  // Check-in functionality
  const checkIn = async (reservationId, checkInDetails) => {
    try {
      setIsLoading(true);
      const updatedReservation = await reservationApi.checkIn(reservationId, checkInDetails);
      
      // Update the local state with the new reservation
      setReservations(prev => 
        prev.map(res => res.id === reservationId ? updatedReservation : res)
      );
      
      toast.success('Check-in completed successfully!');
      return true;
    } catch (err) {
      toast.error('Failed to complete check-in. Please try again or contact reception.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check-out functionality
  const checkOut = async (reservationId, checkOutDetails) => {
    try {
      setIsLoading(true);
      const updatedReservation = await reservationApi.checkOut(reservationId, checkOutDetails);
      setReservations(prev => 
        prev.map(res => res.id === reservationId ? updatedReservation : res)
      );
      toast.success('Check-out completed successfully!');
      return true;
    } catch (err) {
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
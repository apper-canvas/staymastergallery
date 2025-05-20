// Mock API service to simulate backend calls for guest portal
import { format } from 'date-fns';

// Helper to get data from localStorage with fallback to initial data
const getStoredData = (key, initialData) => {
  const storedData = localStorage.getItem(key);
  if (storedData) {
    return JSON.parse(storedData);
  }
  // Store initial data
  localStorage.setItem(key, JSON.stringify(initialData));
  return initialData;
};

// Initial reservations data
const initialReservations = [
  {
    id: 'res-001',
    guestId: 'guest-001',
    roomNumber: '101',
    roomType: 'Deluxe',
    checkInDate: '2023-06-15',
    checkOutDate: '2023-06-18',
    status: 'confirmed',
    guests: 2,
    totalAmount: 450,
    createdAt: '2023-05-20',
    specialRequests: 'Early check-in if possible',
    checkInTime: null,
    checkOutTime: null
  },
  {
    id: 'res-002',
    guestId: 'guest-001',
    roomNumber: '205',
    roomType: 'Suite',
    checkInDate: '2023-05-10',
    checkOutDate: '2023-05-15',
    status: 'completed',
    guests: 3,
    totalAmount: 1200,
    createdAt: '2023-04-15',
    specialRequests: 'Ocean view preferred',
    checkInTime: '2023-05-10T14:30:00',
    checkOutTime: '2023-05-15T11:15:00'
  },
  {
    id: 'res-003',
    guestId: 'guest-001',
    roomNumber: '304',
    roomType: 'Standard',
    checkInDate: format(new Date(), 'yyyy-MM-dd'),
    checkOutDate: '2023-06-25',
    status: 'ready-for-checkin',
    guests: 1,
    totalAmount: 320,
    createdAt: '2023-05-30',
    specialRequests: '',
    checkInTime: null,
    checkOutTime: null
  }
];

// Initial guest data
const initialGuests = [
  {
    id: 'guest-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '555-123-4567',
    address: '123 Main St, Anytown, USA',
    loyaltyPoints: 250,
    registeredDate: '2023-01-15'
  }
];

// Mock API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Reservation API
export const reservationApi = {
  async getGuestReservations(guestId) {
    await delay(500); // Simulate network delay
    const reservations = getStoredData('reservations', initialReservations);
    return reservations.filter(res => res.guestId === guestId);
  },
  
  async checkIn(reservationId, checkInDetails) {
    await delay(800); // Simulate network delay
    const reservations = getStoredData('reservations', initialReservations);
    const updatedReservations = reservations.map(res => {
      if (res.id === reservationId) {
        return {
          ...res,
          status: 'checked-in',
          checkInTime: new Date().toISOString(),
          ...checkInDetails
        };
      }
      return res;
    });
    
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    return updatedReservations.find(res => res.id === reservationId);
  },
  
  async checkOut(reservationId, checkOutDetails) {
    await delay(800); // Simulate network delay
    const reservations = getStoredData('reservations', initialReservations);
    const updatedReservations = reservations.map(res => {
      if (res.id === reservationId) {
        return {
          ...res,
          status: 'completed',
          checkOutTime: new Date().toISOString(),
          ...checkOutDetails
        };
      }
      return res;
    });
    
    localStorage.setItem('reservations', JSON.stringify(updatedReservations));
    return updatedReservations.find(res => res.id === reservationId);
  }
};

// Guest API
export const guestApi = {
  async getGuestProfile(guestId) {
    await delay(500); // Simulate network delay
    const guests = getStoredData('guests', initialGuests);
    return guests.find(guest => guest.id === guestId);
  }
};
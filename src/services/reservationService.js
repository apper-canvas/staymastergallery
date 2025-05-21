/**
 * Service for managing reservation data
 */

// Get fields from the table definition filtered by visibility
const getUpdateableFields = () => {
  return ['Name', 'Tags', 'Owner', 'checkInDate', 'checkOutDate', 'status', 'guestCount', 'totalAmount', 'specialRequests', 'checkInTime', 'checkOutTime', 'guest', 'room', 'roomType'];
};

const TABLE_NAME = 'reservation';

/**
 * Fetch reservations with optional filtering
 * @param {Object} filters Optional filters to apply to the query
 * @param {number} limit Number of records to fetch (default: 20)
 * @param {number} offset Pagination offset (default: 0)
 * @returns {Promise<Array>} List of reservations
 */
export const fetchReservations = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Prepare filter conditions if provided
    const whereConditions = [];
    
    if (filters.status) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'ExactMatch',
        values: [filters.status]
      });
    }
    
    if (filters.guestId) {
      whereConditions.push({
        fieldName: 'guest',
        operator: 'ExactMatch',
        values: [filters.guestId]
      });
    }

    if (filters.roomId) {
      whereConditions.push({
        fieldName: 'room',
        operator: 'ExactMatch',
        values: [filters.roomId]
      });
    }

    // Setup query parameters
    const params = {
      pagingInfo: { limit, offset },
      where: whereConditions.length > 0 ? whereConditions : undefined,
      expands: [
        {
          name: "guest"
        },
        {
          name: "room"
        },
        {
          name: "roomType"
        }
      ],
      orderBy: [
        {
          field: "checkInDate",
          direction: "DESC"
        }
      ]
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

/**
 * Fetch a reservation by its ID
 * @param {string} id Reservation ID
 * @returns {Promise<Object>} Reservation data
 */
export const fetchReservationById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      expands: [
        {
          name: "guest"
        },
        {
          name: "room"
        },
        {
          name: "roomType"
        }
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, id, params);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching reservation with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new reservation
 * @param {Object} reservationData Reservation data to create
 * @returns {Promise<Object>} Created reservation data
 */
export const createReservation = async (reservationData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const updateableFields = getUpdateableFields();
    const filteredData = {};
    
    updateableFields.forEach(field => {
      if (reservationData[field] !== undefined) {
        filteredData[field] = reservationData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create reservation');
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
};

/**
 * Update an existing reservation
 * @param {string} id Reservation ID
 * @param {Object} reservationData Updated reservation data
 * @returns {Promise<Object>} Updated reservation data
 */
export const updateReservation = async (id, reservationData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const updateableFields = getUpdateableFields();
    const filteredData = { Id: id };
    
    updateableFields.forEach(field => {
      if (reservationData[field] !== undefined) {
        filteredData[field] = reservationData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to update reservation');
  } catch (error) {
    console.error(`Error updating reservation with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a reservation
 * @param {string} id Reservation ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteReservation = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [id]
    };

    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    return response && response.success;
  } catch (error) {
    console.error(`Error deleting reservation with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Check in a guest for a reservation
 * @param {string} id Reservation ID
 * @returns {Promise<Object>} Updated reservation data
 */
export const checkIn = async (id) => {
  return updateReservation(id, {
    status: 'checked-in',
    checkInTime: new Date().toISOString()
  });
};

/**
 * Check out a guest for a reservation
 * @param {string} id Reservation ID
 * @returns {Promise<Object>} Updated reservation data
 */
export const checkOut = async (id) => {
  return updateReservation(id, {
    status: 'completed',
    checkOutTime: new Date().toISOString()
  });
};

export default {
  fetchReservations,
  fetchReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  checkIn,
  checkOut
};
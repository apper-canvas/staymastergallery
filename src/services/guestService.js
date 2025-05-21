/**
 * Service for managing guest data
 */

// Get fields from the table definition filtered by visibility
const getUpdateableFields = () => {
  return ['Name', 'Tags', 'Owner', 'email', 'phone', 'address', 'loyaltyPoints', 'registeredDate'];
};

const TABLE_NAME = 'guest';

/**
 * Fetch guests with optional filtering
 * @param {Object} filters Optional filters to apply to the query
 * @param {number} limit Number of records to fetch (default: 20)
 * @param {number} offset Pagination offset (default: 0)
 * @returns {Promise<Array>} List of guests
 */
export const fetchGuests = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Prepare filter conditions if provided
    const whereConditions = [];
    
    if (filters.name) {
      whereConditions.push({
        fieldName: 'Name',
        operator: 'Contains',
        values: [filters.name]
      });
    }
    
    if (filters.email) {
      whereConditions.push({
        fieldName: 'email',
        operator: 'Contains',
        values: [filters.email]
      });
    }

    // Setup query parameters
    const params = {
      pagingInfo: { limit, offset },
      where: whereConditions.length > 0 ? whereConditions : undefined
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching guests:', error);
    throw error;
  }
};

/**
 * Fetch a guest by their ID
 * @param {string} id Guest ID
 * @returns {Promise<Object>} Guest data
 */
export const fetchGuestById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById(TABLE_NAME, id);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching guest with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new guest
 * @param {Object} guestData Guest data to create
 * @returns {Promise<Object>} Created guest data
 */
export const createGuest = async (guestData) => {
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
      if (guestData[field] !== undefined) {
        filteredData[field] = guestData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create guest');
  } catch (error) {
    console.error('Error creating guest:', error);
    throw error;
  }
};

/**
 * Update an existing guest
 * @param {string} id Guest ID
 * @param {Object} guestData Updated guest data
 * @returns {Promise<Object>} Updated guest data
 */
export const updateGuest = async (id, guestData) => {
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
      if (guestData[field] !== undefined) {
        filteredData[field] = guestData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to update guest');
  } catch (error) {
    console.error(`Error updating guest with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a guest
 * @param {string} id Guest ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteGuest = async (id) => {
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
    console.error(`Error deleting guest with ID ${id}:`, error);
    throw error;
  }
};

export default {
  fetchGuests,
  fetchGuestById,
  createGuest,
  updateGuest,
  deleteGuest
};
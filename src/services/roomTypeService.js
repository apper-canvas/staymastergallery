/**
 * Service for managing room type data
 */

// Get fields from the table definition filtered by visibility
const getUpdateableFields = () => {
  return ['Name', 'Tags', 'Owner', 'description', 'basePrice', 'capacity'];
};

const TABLE_NAME = 'room_type';

/**
 * Fetch room types with optional filtering
 * @param {Object} filters Optional filters to apply to the query
 * @param {number} limit Number of records to fetch (default: 20)
 * @param {number} offset Pagination offset (default: 0)
 * @returns {Promise<Array>} List of room types
 */
export const fetchRoomTypes = async (filters = {}, limit = 20, offset = 0) => {
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

    // Setup query parameters
    const params = {
      pagingInfo: { limit, offset },
      where: whereConditions.length > 0 ? whereConditions : undefined
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

/**
 * Fetch a room type by its ID
 * @param {string} id Room type ID
 * @returns {Promise<Object>} Room type data
 */
export const fetchRoomTypeById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById(TABLE_NAME, id);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching room type with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new room type
 * @param {Object} roomTypeData Room type data to create
 * @returns {Promise<Object>} Created room type data
 */
export const createRoomType = async (roomTypeData) => {
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
      if (roomTypeData[field] !== undefined) {
        filteredData[field] = roomTypeData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create room type');
  } catch (error) {
    console.error('Error creating room type:', error);
    throw error;
  }
};

/**
 * Update an existing room type
 * @param {string} id Room type ID
 * @param {Object} roomTypeData Updated room type data
 * @returns {Promise<Object>} Updated room type data
 */
export const updateRoomType = async (id, roomTypeData) => {
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
      if (roomTypeData[field] !== undefined) {
        filteredData[field] = roomTypeData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to update room type');
  } catch (error) {
    console.error(`Error updating room type with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a room type
 * @param {string} id Room type ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteRoomType = async (id) => {
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
    console.error(`Error deleting room type with ID ${id}:`, error);
    throw error;
  }
};

export default {
  fetchRoomTypes,
  fetchRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType
};
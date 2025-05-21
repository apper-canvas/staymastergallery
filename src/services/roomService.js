/**
 * Service for managing room data
 */

// Get fields from the table definition filtered by visibility
const getUpdateableFields = () => {
  return ['Name', 'Tags', 'Owner', 'number', 'floor', 'status', 'lastCleaned', 'cleaningStaff', 'maintenanceIssue', 'roomType'];
};

const TABLE_NAME = 'room';

/**
 * Fetch rooms with optional filtering
 * @param {Object} filters Optional filters to apply to the query
 * @param {number} limit Number of records to fetch (default: 20)
 * @param {number} offset Pagination offset (default: 0)
 * @returns {Promise<Array>} List of rooms
 */
export const fetchRooms = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Prepare filter conditions if provided
    const whereConditions = [];
    
    if (filters.number) {
      whereConditions.push({
        fieldName: 'number',
        operator: 'Contains',
        values: [filters.number]
      });
    }
    
    if (filters.status) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'ExactMatch',
        values: [filters.status]
      });
    }

    if (filters.roomType) {
      whereConditions.push({
        fieldName: 'roomType',
        operator: 'ExactMatch',
        values: [filters.roomType]
      });
    }

    // Setup query parameters
    const params = {
      pagingInfo: { limit, offset },
      where: whereConditions.length > 0 ? whereConditions : undefined,
      expands: [
        {
          name: "roomType"
        }
      ]
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

/**
 * Fetch a room by its ID
 * @param {string} id Room ID
 * @returns {Promise<Object>} Room data
 */
export const fetchRoomById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      expands: [
        {
          name: "roomType"
        }
      ]
    };

    const response = await apperClient.getRecordById(TABLE_NAME, id, params);
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching room with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new room
 * @param {Object} roomData Room data to create
 * @returns {Promise<Object>} Created room data
 */
export const createRoom = async (roomData) => {
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
      if (roomData[field] !== undefined) {
        filteredData[field] = roomData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create room');
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
};

/**
 * Update an existing room
 * @param {string} id Room ID
 * @param {Object} roomData Updated room data
 * @returns {Promise<Object>} Updated room data
 */
export const updateRoom = async (id, roomData) => {
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
      if (roomData[field] !== undefined) {
        filteredData[field] = roomData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to update room');
  } catch (error) {
    console.error(`Error updating room with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a room
 * @param {string} id Room ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteRoom = async (id) => {
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
    console.error(`Error deleting room with ID ${id}:`, error);
    throw error;
  }
};

export default {
  fetchRooms,
  fetchRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
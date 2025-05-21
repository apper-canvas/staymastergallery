/**
 * Service for managing hotel stats data
 */

// Get fields from the table definition filtered by visibility
const getUpdateableFields = () => {
  return ['Name', 'Tags', 'Owner', 'date', 'occupancyRate', 'availableRooms', 'reservedRooms', 'todayArrivals', 'todayDepartures', 'pendingMaintenance'];
};

const TABLE_NAME = 'hotel_stats';

/**
 * Fetch hotel stats with optional filtering
 * @param {Object} filters Optional filters to apply to the query
 * @param {number} limit Number of records to fetch (default: 20)
 * @param {number} offset Pagination offset (default: 0)
 * @returns {Promise<Array>} List of hotel stats
 */
export const fetchHotelStats = async (filters = {}, limit = 20, offset = 0) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Prepare filter conditions if provided
    const whereConditions = [];
    
    if (filters.date) {
      whereConditions.push({
        fieldName: 'date',
        operator: 'ExactMatch',
        values: [filters.date]
      });
    }

    // Setup query parameters
    const params = {
      pagingInfo: { limit, offset },
      where: whereConditions.length > 0 ? whereConditions : undefined,
      orderBy: [
        {
          field: 'date',
          direction: 'DESC'
        }
      ]
    };

    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching hotel stats:', error);
    throw error;
  }
};

/**
 * Fetch latest hotel stats
 * @returns {Promise<Object>} Latest hotel stats
 */
export const fetchLatestStats = async () => {
  try {
    const stats = await fetchHotelStats({}, 1, 0);
    return stats.length > 0 ? stats[0] : null;
  } catch (error) {
    console.error('Error fetching latest hotel stats:', error);
    throw error;
  }
};

/**
 * Create new hotel stats
 * @param {Object} statsData Hotel stats data to create
 * @returns {Promise<Object>} Created hotel stats data
 */
export const createHotelStats = async (statsData) => {
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
      if (statsData[field] !== undefined) {
        filteredData[field] = statsData[field];
      }
    });

    // Make sure date is set if not provided
    if (!filteredData.date) {
      filteredData.date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Set name if not provided
    if (!filteredData.Name) {
      filteredData.Name = `Stats ${filteredData.date}`;
    }

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.createRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to create hotel stats');
  } catch (error) {
    console.error('Error creating hotel stats:', error);
    throw error;
  }
};

/**
 * Update existing hotel stats
 * @param {string} id Hotel stats ID
 * @param {Object} statsData Updated hotel stats data
 * @returns {Promise<Object>} Updated hotel stats data
 */
export const updateHotelStats = async (id, statsData) => {
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
      if (statsData[field] !== undefined) {
        filteredData[field] = statsData[field];
      }
    });

    const params = {
      records: [filteredData]
    };

    const response = await apperClient.updateRecord(TABLE_NAME, params);
    if (response && response.success && response.results && response.results.length > 0) {
      return response.results[0].data;
    }
    throw new Error('Failed to update hotel stats');
  } catch (error) {
    console.error(`Error updating hotel stats with ID ${id}:`, error);
    throw error;
  }
};

export default {
  fetchHotelStats,
  fetchLatestStats,
  createHotelStats,
  updateHotelStats
};
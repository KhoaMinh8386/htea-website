const { sequelize } = require('../config/db');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Reset sequence cho bảng products
      await sequelize.query(`
        SELECT setval(pg_get_serial_sequence('products', 'id'), 
        COALESCE((SELECT MAX(id) FROM products), 0) + 1, false);
      `);
      
      console.log('Reset product sequence successfully');
    } catch (error) {
      console.error('Error resetting product sequence:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Không cần rollback vì đây là thao tác reset sequence
    return Promise.resolve();
  }
}; 
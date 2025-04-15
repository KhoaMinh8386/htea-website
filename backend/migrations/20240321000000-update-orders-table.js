'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Xóa các cột không cần thiết
    await queryInterface.removeColumn('orders', 'delivery_address');
    await queryInterface.removeColumn('orders', 'customer_phone');
    await queryInterface.removeColumn('orders', 'customer_name');
    await queryInterface.removeColumn('orders', 'customer_email');
    await queryInterface.removeColumn('orders', 'notes');

    // Thêm các cột mới
    await queryInterface.addColumn('orders', 'shipping_address', {
      type: Sequelize.TEXT,
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'customer_name', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'customer_email', {
      type: Sequelize.STRING(100),
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Xóa các cột mới
    await queryInterface.removeColumn('orders', 'shipping_address');
    await queryInterface.removeColumn('orders', 'phone');
    await queryInterface.removeColumn('orders', 'customer_name');
    await queryInterface.removeColumn('orders', 'customer_email');
    await queryInterface.removeColumn('orders', 'notes');

    // Thêm lại các cột cũ
    await queryInterface.addColumn('orders', 'delivery_address', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'customer_phone', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'customer_email', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('orders', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  }
}; 
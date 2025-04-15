'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'delivery_address', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'customer_phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'customer_email', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('orders', 'notes', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.sequelize.query(`
      UPDATE orders 
      SET 
        delivery_address = shipping_address,
        customer_phone = phone,
        customer_name = (SELECT full_name FROM users WHERE users.id = orders.user_id),
        customer_email = (SELECT email FROM users WHERE users.id = orders.user_id),
        notes = ''
      WHERE 
        delivery_address IS NULL 
        OR customer_phone IS NULL 
        OR customer_name IS NULL 
        OR customer_email IS NULL;
    `);

    await queryInterface.changeColumn('orders', 'delivery_address', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('orders', 'customer_phone', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('orders', 'customer_name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.changeColumn('orders', 'customer_email', {
      type: Sequelize.STRING,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'delivery_address');
    await queryInterface.removeColumn('orders', 'customer_phone');
    await queryInterface.removeColumn('orders', 'customer_name');
    await queryInterface.removeColumn('orders', 'customer_email');
    await queryInterface.removeColumn('orders', 'notes');
  }
}; 
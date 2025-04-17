'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Xóa ràng buộc mặc định trước
    await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      ALTER COLUMN id DROP DEFAULT;
    `);

    // Xóa sequence cũ
    await queryInterface.sequelize.query(`
      DROP SEQUENCE IF EXISTS orders_id_seq;
    `);

    // Tạo lại sequence mới
    await queryInterface.sequelize.query(`
      CREATE SEQUENCE orders_id_seq;
      ALTER TABLE orders 
      ALTER COLUMN id SET DEFAULT nextval('orders_id_seq');
      ALTER SEQUENCE orders_id_seq OWNED BY orders.id;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Khôi phục về trạng thái cũ
    await queryInterface.sequelize.query(`
      ALTER TABLE orders 
      ALTER COLUMN id DROP DEFAULT;
      DROP SEQUENCE IF EXISTS orders_id_seq;
    `);
  }
}; 
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    // In production, you should use migrations instead of sync
    if (process.env.NODE_ENV === 'development') {
      // First, update any NULL timestamps
      await sequelize.query(`
        UPDATE products 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE updated_at IS NULL;
        
        UPDATE product_categories 
        SET updated_at = CURRENT_TIMESTAMP 
        WHERE updated_at IS NULL;
      `);
      
      // Then sync with alter option
      await sequelize.sync({ alter: true, force: false });
      console.log('Database synchronized');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB }; 
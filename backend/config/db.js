const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

// --- Kết nối qua DATABASE_URL (Neon PostgreSQL) ---
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,            // Bắt buộc dùng SSL
      rejectUnauthorized: false // Không chặn chứng chỉ tự ký của Neon
    }
  },
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to Neon PostgreSQL successfully!');

    // Sync các models nếu cần
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true, force: false });
      console.log('🗂️  Database synchronized (development mode)');
    }
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

const { DataTypes } = require('sequelize');
const db = require('../config/db'); // Import kết nối database

const Admin = db.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Không cho trùng username
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'admin', // Mặc định khi tạo là admin
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'admin', // Tên bảng trong database
  timestamps: false,  // Không tự thêm createdAt & updatedAt
});

module.exports = Admin;

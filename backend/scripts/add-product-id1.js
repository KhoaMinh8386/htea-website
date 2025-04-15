const { sequelize } = require('../config/db');
const { Product, ProductCategory } = require('../models');

async function addProductId1() {
  try {
    // Kiểm tra xem sản phẩm ID 1 đã tồn tại chưa
    const existingProduct = await Product.findByPk(1);
    
    if (existingProduct) {
      console.log('Sản phẩm ID 1 đã tồn tại');
      return;
    }
    
    // Tìm category "Trà Xanh" hoặc tạo mới nếu chưa có
    let greenTeaCategory = await ProductCategory.findOne({
      where: { name: 'Trà Xanh' }
    });
    
    if (!greenTeaCategory) {
      greenTeaCategory = await ProductCategory.create({
        name: 'Trà Xanh',
        description: 'Các loại trà xanh truyền thống'
      });
    }
    
    // Tạo sản phẩm ID 1
    const product = await Product.create({
      id: 1,
      name: 'Trà Xanh Thái Nguyên',
      description: 'Trà xanh Thái Nguyên đặc sản',
      price: 150000,
      category_id: greenTeaCategory.id,
      image_url: 'https://bizweb.dktcdn.net/100/290/576/files/tra-xanh-thai-nguyen.jpg?v=1620121607830',
      is_available: true
    });
    
    console.log('Đã thêm sản phẩm ID 1 thành công:', product.toJSON());
  } catch (error) {
    console.error('Lỗi khi thêm sản phẩm ID 1:', error);
  } finally {
    // Đóng kết nối database
    await sequelize.close();
  }
}

// Chạy script
addProductId1(); 
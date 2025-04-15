const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../../frontend/public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer để lưu file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất với timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Kiểm tra file upload
const fileFilter = (req, file, cb) => {
  // Chấp nhận các file ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn 5MB
  }
});

// Routes công khai
router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Routes danh mục (yêu cầu đăng nhập ADMIN)
router.post('/categories', auth, adminAuth('admin'), createCategory);
router.put('/categories/:id', auth, adminAuth('admin'), updateCategory);
router.delete('/categories/:id', auth, adminAuth('admin'), deleteCategory);

// Routes sản phẩm (yêu cầu đăng nhập ADMIN)
router.post('/', auth, adminAuth('admin'), createProduct);
router.put('/:id', auth, adminAuth('admin'), updateProduct);
router.delete('/:id', auth, adminAuth('admin'), deleteProduct);

// Route upload ảnh (chỉ ADMIN)
router.post('/upload', auth, adminAuth('admin'), upload.single('image'), (req, res) => {
  try {
    console.log('Upload request received:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'Không có file được tải lên' 
      });
    }
    
    // Trả về đường dẫn tương đối
    const imageUrl = `/uploads/${req.file.filename}`;
    
    // Kiểm tra xem file có tồn tại không
    const filePath = path.join(uploadDir, req.file.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({ 
        success: false,
        message: 'File không tồn tại sau khi upload',
        error: 'File not found after upload'
      });
    }
    
    console.log('File uploaded successfully:', imageUrl);
    
    res.json({ 
      success: true,
      url: imageUrl,
      message: 'Tải ảnh lên thành công'
    });
  } catch (error) {
    console.error('Lỗi upload:', error);
    res.status(500).json({ 
      success: false,
      message: 'Có lỗi xảy ra khi tải ảnh lên',
      error: error.message 
    });
  }
});

// Xử lý lỗi multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        message: 'File quá lớn. Kích thước tối đa là 5MB' 
      });
    }
    return res.status(400).json({ 
      message: 'Lỗi upload file',
      error: error.message 
    });
  }
  next(error);
});

module.exports = router;

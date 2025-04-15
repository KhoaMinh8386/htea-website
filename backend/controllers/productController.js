const { sequelize } = require('../config/db');
const { Product, ProductCategory } = require('../models');

// Lấy danh sách sản phẩm
const getProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const where = {
            is_available: true
        };

        if (category) {
            const categoryObj = await ProductCategory.findOne({
                where: { name: category }
            });
            if (categoryObj) {
                where.category_id = categoryObj.id;
            }
        }

        if (search) {
            where[sequelize.Op.or] = [
                { name: { [sequelize.Op.iLike]: `%${search}%` } },
                { description: { [sequelize.Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [{
                model: ProductCategory,
                as: 'categoryInfo',
                attributes: ['name']
            }],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        res.json({
            products: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error in getProducts:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy chi tiết sản phẩm
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({
            where: { 
                id,
                is_available: true 
            },
            include: [{
                model: ProductCategory,
                as: 'categoryInfo',
                attributes: ['name']
            }]
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('Error in getProductById:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Thêm sản phẩm mới
const createProduct = async (req, res) => {
    try {
        console.log('Received product data:', req.body);
        const { name, description, price, category_id, image_url, is_available } = req.body;

        // Kiểm tra dữ liệu bắt buộc
        if (!name || !description || !price || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Thiếu thông tin sản phẩm',
                errors: {
                    name: !name ? 'Tên sản phẩm là bắt buộc' : null,
                    description: !description ? 'Mô tả sản phẩm là bắt buộc' : null,
                    price: !price ? 'Giá sản phẩm là bắt buộc' : null,
                    category_id: !category_id ? 'Danh mục sản phẩm là bắt buộc' : null
                }
            });
        }

        // Kiểm tra category tồn tại
        const categoryObj = await ProductCategory.findByPk(category_id);

        if (!categoryObj) {
            return res.status(400).json({ 
                success: false,
                message: 'Danh mục không tồn tại' 
            });
        }

        // Kiểm tra tên sản phẩm đã tồn tại chưa
        const existingProduct = await Product.findOne({
            where: { name }
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm đã tồn tại'
            });
        }

        // Tạo sản phẩm mới
        const product = await Product.create({
            name,
            description,
            price,
            category_id,
            image_url: image_url || null,
            is_available: is_available !== undefined ? is_available : true
        });

        console.log('Created product:', product);

        res.status(201).json({
            success: true,
            message: 'Thêm sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Error in createProduct:', error);
        
        // Xử lý lỗi validation
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.errors.map(err => err.message)
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Cập nhật sản phẩm
const updateProduct = async (req, res) => {
    try {
        console.log('Received update data:', req.body);
        const { id } = req.params;
        const { name, description, price, category_id, image_url, is_available } = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ 
                success: false,
                message: 'Không tìm thấy sản phẩm' 
            });
        }

        const updateData = {
            name: name || product.name,
            description: description || product.description,
            price: price || product.price,
            image_url: image_url || product.image_url,
            is_available: is_available !== undefined ? is_available : product.is_available
        };

        if (category_id) {
            const categoryObj = await ProductCategory.findByPk(category_id);

            if (!categoryObj) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Danh mục không tồn tại' 
                });
            }

            updateData.category_id = category_id;
        }

        console.log('Updating product with data:', updateData);
        await product.update(updateData);
        console.log('Updated product:', product);

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });
    } catch (error) {
        console.error('Error in updateProduct:', error);
        
        // Xử lý lỗi validation
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.errors.map(err => err.message)
            });
        }

        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }

        await product.destroy();

        res.json({ message: 'Xóa sản phẩm thành công' });
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

// Lấy danh sách danh mục
const getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await ProductCategory.findAndCountAll({
            order: [['name', 'ASC']],
            limit,
            offset
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Thêm danh mục mới
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được để trống'
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được vượt quá 100 ký tự'
            });
        }

        // Kiểm tra tên danh mục đã tồn tại chưa
        const categoryExists = await ProductCategory.findOne({
            where: { name: name.trim() }
        });

        if (categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục đã tồn tại'
            });
        }

        const category = await ProductCategory.create({
            name: name.trim(),
            description: description ? description.trim() : null
        });

        res.status(201).json({
            success: true,
            message: 'Thêm danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Error in createCategory:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Cập nhật danh mục
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Validation
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được để trống'
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Tên danh mục không được vượt quá 100 ký tự'
            });
        }

        const category = await ProductCategory.findByPk(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        // Kiểm tra tên danh mục mới có bị trùng không
        if (name.trim() !== category.name) {
            const categoryExists = await ProductCategory.findOne({
                where: { name: name.trim() }
            });

            if (categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên danh mục đã tồn tại'
                });
            }
        }

        await category.update({
            name: name.trim(),
            description: description ? description.trim() : null
        });

        res.json({
            success: true,
            message: 'Cập nhật danh mục thành công',
            data: category
        });
    } catch (error) {
        console.error('Error in updateCategory:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Xóa danh mục
const deleteCategory = async (req, res) => {
    const t = await sequelize.transaction();
    
    try {
        const { id } = req.params;

        const category = await ProductCategory.findByPk(id, { transaction: t });

        if (!category) {
            await t.rollback();
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy danh mục'
            });
        }

        // Kiểm tra xem có sản phẩm nào thuộc danh mục này không
        const productsCount = await Product.count({
            where: { category_id: id },
            transaction: t
        });

        if (productsCount > 0) {
            await t.rollback();
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa danh mục này vì có sản phẩm đang sử dụng'
            });
        }

        await category.destroy({ transaction: t });
        await t.commit();

        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        await t.rollback();
        console.error('Error in deleteCategory:', error);
        res.status(500).json({ 
            success: false,
            message: 'Lỗi server',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}; 
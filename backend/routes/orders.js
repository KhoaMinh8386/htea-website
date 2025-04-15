const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");
const { auth } = require('../middleware/auth');

// 🟢 API: Lấy danh sách đơn hàng (Có thể lọc theo user_id)
router.get("/", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.user.id; // Lấy user_id từ token
    const orders = await sequelize.query(`
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price', oi.price,
            'product_name', p.name
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = :user_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, {
      replacements: { user_id },
      type: sequelize.QueryTypes.SELECT,
      transaction
    });
    
    await transaction.commit();
    
    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi lấy đơn hàng:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Lỗi khi lấy danh sách đơn hàng'
    });
  }
});

// 🟢 API: Đặt hàng (Yêu cầu đăng nhập)
router.post("/", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { 
      items, 
      total_amount, 
      shipping_address, 
      phone,
      customer_name,
      customer_email,
      notes 
    } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn sản phẩm'
      });
    }

    if (!total_amount || !shipping_address || !phone || !customer_name || !customer_email) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Thêm đơn hàng vào bảng orders
    const [order] = await sequelize.query(`
      INSERT INTO orders (
        user_id, 
        total_amount,
        shipping_address,
        phone,
        customer_name,
        customer_email,
        notes,
        status
      ) VALUES (
        :user_id, 
        :total_amount, 
        :shipping_address, 
        :phone,
        :customer_name,
        :customer_email,
        :notes,
        'pending'
      ) 
      RETURNING *
    `, {
      replacements: { 
        user_id, 
        total_amount, 
        shipping_address, 
        phone,
        customer_name,
        customer_email,
        notes: notes || ''
      },
      type: sequelize.QueryTypes.INSERT,
      transaction
    });

    const orderId = order[0].id;

    // Thêm sản phẩm vào bảng order_items
    for (const item of items) {
      // Kiểm tra số lượng tồn kho
      const [product] = await sequelize.query(
        'SELECT stock_quantity FROM products WHERE id = :product_id',
        {
          replacements: { product_id: item.product_id },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!product) {
        throw new Error(`Sản phẩm không tồn tại: ${item.product_id}`);
      }

      if (product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ${item.product_id} không đủ số lượng`);
      }

      // Thêm vào order_items
      await sequelize.query(`
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          price
        ) VALUES (:order_id, :product_id, :quantity, :price)
      `, {
        replacements: {
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        },
        type: sequelize.QueryTypes.INSERT,
        transaction
      });

      // Cập nhật số lượng tồn kho
      await sequelize.query(`
        UPDATE products 
        SET stock_quantity = stock_quantity - :quantity
        WHERE id = :product_id
      `, {
        replacements: {
          quantity: item.quantity,
          product_id: item.product_id
        },
        type: sequelize.QueryTypes.UPDATE,
        transaction
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Đặt hàng thành công',
      data: { orderId }
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi đặt hàng:", err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Lỗi khi đặt hàng'
    });
  }
});

// 🟢 API: Cập nhật trạng thái đơn hàng (Admin)
router.put("/:id/status", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn trạng thái'
      });
    }

    const result = await sequelize.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      {
        replacements: { status, id },
        type: sequelize.QueryTypes.UPDATE,
        transaction
      }
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Đơn hàng không tồn tại'
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: result[0]
    });
  } catch (error) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Lỗi khi cập nhật trạng thái'
    });
  }
});

module.exports = router;

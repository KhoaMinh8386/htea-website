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
      customer_name,
      customer_email,
      phone,
      shipping_address,
      notes,
      total_amount
    } = req.body;
    const userId = req.user ? req.user.id : null;

    console.log("📦 Dữ liệu nhận được:", {
      items,
      customer_name,
      customer_email,
      phone,
      shipping_address,
      notes,
      total_amount,
      userId
    });

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Danh sách sản phẩm không hợp lệ');
    }

    if (!customer_name || !customer_email || !phone || !shipping_address) {
      throw new Error('Thiếu thông tin bắt buộc');
    }

    // Validate phone number format
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error('Số điện thoại không hợp lệ');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      throw new Error('Email không hợp lệ');
    }

    // Tính tổng tiền và kiểm tra sản phẩm
    let calculatedTotalAmount = 0;
    const sanitizedItems = [];

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        throw new Error('Thông tin sản phẩm không hợp lệ');
      }

      // Lấy thông tin sản phẩm từ database
      const [product] = await sequelize.query(
        'SELECT id, price FROM products WHERE id = :product_id AND is_available = true',
        {
          replacements: { product_id: parseInt(item.product_id) },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (!product) {
        throw new Error(`Sản phẩm ID ${item.product_id} không tồn tại hoặc đã ngừng kinh doanh`);
      }

      const itemPrice = parseFloat(product.price);
      const itemQuantity = parseInt(item.quantity);

      if (isNaN(itemPrice) || isNaN(itemQuantity)) {
        throw new Error('Giá hoặc số lượng sản phẩm không hợp lệ');
      }

      calculatedTotalAmount += itemPrice * itemQuantity;
      sanitizedItems.push({
        product_id: parseInt(item.product_id),
        quantity: itemQuantity,
        price: itemPrice
      });
    }

    // Kiểm tra tổng tiền
    const totalAmount = parseFloat(total_amount);
    if (isNaN(totalAmount)) {
      throw new Error('Tổng tiền không hợp lệ');
    }

    if (Math.abs(calculatedTotalAmount - totalAmount) > 0.01) {
      throw new Error('Tổng tiền đơn hàng không khớp');
    }

    // Tạo đơn hàng
    const [orderResult] = await sequelize.query(
      `INSERT INTO orders (
        user_id, 
        total_amount, 
        status, 
        shipping_address, 
        phone,
        customer_name,
        customer_email,
        notes,
        created_at,
        updated_at
      ) VALUES (
        :user_id, 
        :total_amount, 
        'pending', 
        :shipping_address, 
        :phone,
        :customer_name,
        :customer_email,
        :notes,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      ) RETURNING id`,
      {
        replacements: {
          user_id: parseInt(userId),
          total_amount: calculatedTotalAmount,
          shipping_address,
          phone,
          customer_name,
          customer_email,
          notes: notes || null
        },
        type: sequelize.QueryTypes.INSERT,
        transaction
      }
    );

    const orderId = orderResult[0].id;
    console.log("📝 Đã tạo đơn hàng:", orderId);

    // Thêm chi tiết đơn hàng
    for (const item of sanitizedItems) {
      await sequelize.query(
        `INSERT INTO order_items (
          order_id, 
          product_id, 
          quantity, 
          price,
          created_at
        ) VALUES (
          :order_id, 
          :product_id, 
          :quantity, 
          :price,
          CURRENT_TIMESTAMP
        )`,
        {
          replacements: {
            order_id: orderId,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
    }

    await transaction.commit();

    // Lấy thông tin đơn hàng vừa tạo
    const [orderDetails] = await sequelize.query(
      `SELECT o.*, 
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
      WHERE o.id = :order_id
      GROUP BY o.id`,
      {
        replacements: { order_id: orderId },
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      message: 'Đặt hàng thành công',
      data: orderDetails
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

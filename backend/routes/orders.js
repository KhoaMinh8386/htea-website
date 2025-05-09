const express = require("express");
const router = express.Router();
const { sequelize } = require("../config/db");
const { auth } = require('../middleware/auth');

// 🟢 API: Lấy danh sách đơn hàng
router.get("/", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    let query = `
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.phone,
        o.created_at,
        o.updated_at,
        o.customer_name,
        o.customer_email,
        o.notes,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product_name', p.name
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
    `;

    // Nếu là admin, lấy tất cả đơn hàng
    // Nếu là user, chỉ lấy đơn hàng của user đó
    if (req.user.role === 'admin') {
      query += ` GROUP BY o.id ORDER BY o.created_at DESC`;
    } else {
      query += ` WHERE o.user_id = :user_id GROUP BY o.id ORDER BY o.created_at DESC`;
    }

    const orders = await sequelize.query(query, {
      replacements: { user_id: req.user.id },
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

// 🟢 API: Cập nhật trạng thái đơn hàng
router.put("/:id/status", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền cập nhật trạng thái đơn hàng'
      });
    }

    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    // Cập nhật trạng thái đơn hàng
    const [result] = await sequelize.query(
      `UPDATE orders 
       SET status = :status, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = :id 
       RETURNING *`,
      {
        replacements: { id, status },
        type: sequelize.QueryTypes.UPDATE,
        transaction
      }
    );

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: result[0]
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi cập nhật trạng thái:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Lỗi khi cập nhật trạng thái đơn hàng'
    });
  }
});

// 🟢 API: Lấy danh sách đơn hàng cho admin
router.get("/admin", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const orders = await sequelize.query(`
      SELECT 
        o.id,
        o.user_id,
        o.total_amount,
        o.status,
        o.shipping_address,
        o.phone,
        o.created_at,
        o.updated_at,
        o.customer_name,
        o.customer_email,
        o.notes,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price,
              'product_name', p.name
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'::json
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `, {
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

// 🟢 API: Lấy báo cáo doanh thu
router.get("/revenue", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền xem báo cáo doanh thu'
      });
    }

    // Lấy tổng doanh thu từ các đơn hàng đã hoàn thành
    const [revenue] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE status = 'completed'`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    // Lấy doanh thu theo tháng
    const monthlyRevenue = await sequelize.query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders 
      WHERE status = 'completed'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    await transaction.commit();

    res.json({
      success: true,
      data: {
        total_orders: parseInt(revenue.total_orders) || 0,
        total_revenue: parseFloat(revenue.total_revenue) || 0,
        average_order_value: parseFloat(revenue.average_order_value) || 0,
        monthly_revenue: monthlyRevenue || []
      }
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi lấy báo cáo doanh thu:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Lỗi khi lấy báo cáo doanh thu'
    });
  }
});

// Debug endpoint to check all orders
router.get("/debug", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    const orders = await sequelize.query(
      `SELECT id, status, total_amount, created_at 
       FROM orders 
       ORDER BY created_at DESC`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );

    await transaction.commit();

    res.json({
      success: true,
      data: orders
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi lấy danh sách đơn hàng:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Lỗi khi lấy danh sách đơn hàng'
    });
  }
});

// Thống kê tổng quan cho admin
router.get("/stats", auth, async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    console.log('User requesting stats:', req.user);

    if (req.user.role !== 'admin') {
      console.log('User is not admin');
      return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
      });
    }

    // Lấy thống kê tổng quan
    const [overallStats] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_order_value
      FROM orders 
      WHERE status = 'completed'`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );
    console.log('Overall stats:', overallStats);

    // Lấy thống kê hôm nay
    const [todayStats] = await sequelize.query(
      `SELECT 
        COUNT(*) as today_orders,
        COALESCE(SUM(total_amount), 0) as today_revenue
      FROM orders 
      WHERE status = 'completed' 
      AND DATE(created_at) = CURRENT_DATE`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );
    console.log('Today stats:', todayStats);

    // Lấy tổng số sản phẩm
    const [productStats] = await sequelize.query(
      `SELECT COUNT(*) as total_products FROM products`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );
    console.log('Product stats:', productStats);

    // Lấy tổng số người dùng
    const [userStats] = await sequelize.query(
      `SELECT COUNT(*) as total_users FROM users`,
      {
        type: sequelize.QueryTypes.SELECT,
        transaction
      }
    );
    console.log('User stats:', userStats);

    await transaction.commit();

    const responseData = {
      total_orders: parseInt(overallStats.total_orders) || 0,
      total_revenue: parseFloat(overallStats.total_revenue) || 0,
      average_order_value: parseFloat(overallStats.average_order_value) || 0,
      today_orders: parseInt(todayStats.today_orders) || 0,
      today_revenue: parseFloat(todayStats.today_revenue) || 0,
      total_products: parseInt(productStats.total_products) || 0,
      total_users: parseInt(userStats.total_users) || 0
    };
    console.log('Final response data:', responseData);

    res.json({
      success: true,
      data: responseData
    });
  } catch (err) {
    await transaction.rollback();
    console.error("🚨 Lỗi khi lấy thống kê:", err.message);
    res.status(500).json({ 
      success: false,
      message: err.message || 'Lỗi khi lấy thống kê'
    });
  }
});

module.exports = router;

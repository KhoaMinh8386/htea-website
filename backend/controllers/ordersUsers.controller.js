const pool = require("../db");

// 📌 API đặt hàng
const placeOrder = async (req, res) => {
    try {
        const { user_id, product_id, quantity } = req.body;

        // Lấy thông tin user từ bảng Users
        const userResult = await pool.query("SELECT username FROM Users WHERE id = $1", [user_id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "Người dùng không tồn tại!" });
        }
        const username = userResult.rows[0].username;

        // Lấy thông tin sản phẩm từ bảng Product
        const productResult = await pool.query("SELECT name, price FROM Product WHERE id = $1", [product_id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
        }
        const { name: product_name, price } = productResult.rows[0];

        // Tính tổng giá
        const total_price = price * quantity;

        // Thêm đơn hàng vào bảng OrdersUsers
        const newOrder = await pool.query(
            "INSERT INTO OrdersUsers (user_id, username, product_id, product_name, quantity, total_price) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [user_id, username, product_id, product_name, quantity, total_price]
        );

        res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder.rows[0] });
    } catch (error) {
        console.error("Lỗi đặt hàng:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

// 📌 API lấy đơn hàng của user
const getOrdersByUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const orders = await pool.query(
            "SELECT * FROM OrdersUsers WHERE user_id = $1 ORDER BY created_at DESC",
            [user_id]
        );

        res.status(200).json(orders.rows);
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server!" });
    }
};

module.exports = { placeOrder, getOrdersByUser };

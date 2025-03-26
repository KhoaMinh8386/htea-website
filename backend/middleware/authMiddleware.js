const jwt = require("jsonwebtoken");

// Middleware xác thực người dùng
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token không hợp lệ" });
  }
};

// Middleware bảo vệ Admin
const protectAdmin = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ message: "Không có quyền truy cập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// ✅ Xuất cả hai middleware cùng lúc
module.exports = {
  authMiddleware,
  protectAdmin,
};

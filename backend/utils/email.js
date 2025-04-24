const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetPasswordEmail = async (email, resetUrl) => {
    try {
        const mailOptions = {
            from: `"HTEA Shop" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Đặt lại mật khẩu HTEA Shop',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2d3748;">Đặt lại mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình.</p>
                    <p>Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
                    <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #48bb78; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Đặt lại mật khẩu
                    </a>
                    <p>Liên kết này sẽ hết hạn sau 30 phút.</p>
                    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                    <p>Trân trọng,<br>HTEA Shop</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Error sending reset password email:', error);
        throw error;
    }
};

module.exports = { sendResetPasswordEmail }; 
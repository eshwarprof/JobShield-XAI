const nodemailer = require("nodemailer");
const logger = require("./logger");

async function sendResetOtpEmail(toEmail, otpCode) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPass = process.env.GMAIL_APP_PASS;

  if (gmailUser && gmailAppPass) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: `"JobShield-XAI Security" <${gmailUser}>`,
      to: toEmail,
      subject: "Password Reset OTP - JobShield-XAI",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested a password reset for your account on JobShield-XAI.</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.5;">Please use the following One-Time Password (OTP) to complete the verification. This OTP is valid for 10 minutes:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #0f172a; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
            ${otpCode}
          </div>
          <p style="color: #64748b; font-size: 13px; margin-top: 30px; line-height: 1.4;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email successfully sent to ${toEmail}`);
    } catch (err) {
      logger.error(`SMTP sending failed: ${err.message}`);
      logger.warn("Printing OTP code to server console as fallback.");
      console.log("\n========================================================");
      console.log(`[PASSWORD RESET OTP - SMTP FALLBACK] Email: ${toEmail}`);
      console.log(`OTP Code: ${otpCode} (Expires in 10 minutes)`);
      console.log("========================================================\n");
    }
  } else {
    // Console fallback
    logger.warn("Gmail credentials missing in environment variables. Falling back to console logging.");
    console.log("\n========================================================");
    console.log(`[PASSWORD RESET OTP] Email: ${toEmail}`);
    console.log(`OTP Code: ${otpCode} (Expires in 10 minutes)`);
    console.log("========================================================\n");
  }
}

module.exports = { sendResetOtpEmail };

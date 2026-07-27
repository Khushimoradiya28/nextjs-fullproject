const nodemailer = require('nodemailer');

/**
 * Singleton transporter - created once with strict timeouts, reused for all requests
 */
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      pool: true,
      maxConnections: 3,
      maxMessages: 50,
    });
  }
  return transporter;
};

/**
 * Send password reset email with RunR Properties branded HTML template
 * @param {Object} options
 * @param {string} options.email - Recipient email
 * @param {string} options.name - Recipient name
 * @param {string} options.resetUrl - Full reset password URL
 */
const sendResetPasswordEmail = async ({ email, name, resetUrl }) => {
  const t = getTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - Runr Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#f7f3ee;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f3ee;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(30,58,95,0.08);">
          
          <!-- Logo Header -->
          <tr>
            <td style="background:#ffffff;padding:32px 40px 24px;text-align:center;border-bottom:1px solid rgba(30,58,95,0.06);">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <div style="width:42px;height:42px;background:linear-gradient(135deg,#1e3a5f,#2b5278);border-radius:12px;display:inline-block;text-align:center;line-height:42px;">
                      <span style="color:#3fa66b;font-size:18px;font-weight:800;">&#9679;</span>
                    </div>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;color:#1e3a5f;font-size:20px;font-weight:800;letter-spacing:2px;line-height:1;">RUNR</p>
                    <p style="margin:2px 0 0;color:#1e3a5f;font-size:8px;font-weight:700;letter-spacing:4px;">PROPERTIES</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 36px 28px;">
              
              <!-- Greeting -->
              <h2 style="margin:0 0 8px;color:#10203b;font-size:20px;font-weight:700;">Hi ${name || 'there'},</h2>
              <p style="margin:0 0 24px;color:#5a6f85;font-size:15px;line-height:1.7;">
                We received a request to reset the password for your RunR Properties account. Click the button below to set a new password.
              </p>

              <!-- Reset Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 44px;background:linear-gradient(135deg,#1e3a5f,#16304b);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 6px 20px rgba(30,58,95,0.2);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Plain URL -->
              <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">
                If the button doesn't work, copy and paste this link:
              </p>
              <p style="margin:0 0 28px;word-break:break-all;font-size:12px;">
                <a href="${resetUrl}" style="color:#3fa66b;text-decoration:underline;">${resetUrl}</a>
              </p>

              <!-- Expiry Warning -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background-color:#f0fdf4;border:1px solid rgba(63,166,107,0.15);border-radius:10px;padding:14px 18px;">
                    <p style="margin:0;color:#166534;font-size:13px;line-height:1.5;">
                      <strong>&#9200; This link expires in 10 minutes.</strong><br />
                      After that, you'll need to request a new password reset.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Ignore Message -->
              <p style="margin:0;color:#94a3b8;font-size:13px;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your password will remain unchanged and your account is secure.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid rgba(30,58,95,0.06);">
              <p style="margin:0 0 4px;color:#1e3a5f;font-size:13px;font-weight:700;letter-spacing:1px;">RUNR PROPERTIES</p>
              <p style="margin:0 0 8px;color:#5a6f85;font-size:12px;">Gujarat's trusted real estate platform</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} RunR Properties. All rights reserved.</p>
            </td>
          </tr>

        </table>

        <!-- Sub-footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:20px 36px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
                This is an automated email from RunR Properties. Please do not reply.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"RunR Properties" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password - RunR Properties',
    html,
  };

  await t.sendMail(mailOptions);
};

/**
 * Verify SMTP connection once at server startup
 * Logs result but does not block server from starting
 */
const verifyEmailConnection = async () => {
  try {
    const t = getTransporter();
    await t.verify();
    console.log('[EMAIL] SMTP connection verified successfully');
  } catch (error) {
    console.error('[EMAIL] SMTP verification failed:', error.message);
    console.error('[EMAIL] Password reset emails will not work until SMTP is configured correctly');
  }
};

module.exports = { sendResetPasswordEmail, verifyEmailConnection };

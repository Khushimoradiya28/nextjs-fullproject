const nodemailer = require('nodemailer');
const path = require('path');

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

  // Local path to official logo asset
  const logoPath = path.resolve(__dirname, '../../runrproperties/public/logo/runr-logo.png');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password - Runr Properties</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(15,23,42,0.08);border:1px solid #e2e8f0;">
          
          <!-- Official Site Logo Header -->
          <tr>
            <td style="background:linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);padding:36px 40px 24px;text-align:center;border-bottom:1px solid #edf2f7;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="vertical-align:middle;">
                    <img
                      src="cid:runrLogo"
                      alt="Runr Properties"
                      style="display:block;max-width:210px;height:auto;border:0;outline:none;"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:36px 36px 28px;">
              
              <!-- Greeting & Header -->
              <h2 style="margin:0 0 10px;color:#0f172a;font-size:20px;font-weight:700;letter-spacing:-0.3px;">Hi ${name || 'there'},</h2>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.65;">
                We received a request to reset the password for your <strong>Runr Properties</strong> account. Click the secure button below to set a new password.
              </p>

              <!-- Reset Action Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:15px 44px;background:linear-gradient(135deg, #007bbd 0%, #00659c 100%);color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px;box-shadow:0 6px 20px rgba(0,123,189,0.28);letter-spacing:0.3px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Expiry Alert Card -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;">
                <tr>
                  <td style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:12px;padding:14px 18px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="vertical-align:top;width:24px;padding-right:10px;font-size:16px;">
                          &#9200;
                        </td>
                        <td style="vertical-align:middle;">
                          <p style="margin:0;color:#0369a1;font-size:13px;line-height:1.5;font-weight:600;">
                            This reset link will expire in 10 minutes.
                          </p>
                          <p style="margin:2px 0 0;color:#0284c7;font-size:12px;line-height:1.4;">
                            After that, you'll need to submit a new reset request.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link Info -->
              <p style="margin:0 0 6px;color:#64748b;font-size:12px;line-height:1.5;">
                If the button above does not work, copy and paste this link into your browser:
              </p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;margin-bottom:24px;word-break:break-all;">
                <a href="${resetUrl}" style="color:#007bbd;font-size:12px;text-decoration:underline;line-height:1.4;">${resetUrl}</a>
              </div>

              <!-- Security Notice -->
              <p style="margin:0;color:#94a3b8;font-size:12.5px;line-height:1.6;border-top:1px dashed #e2e8f0;padding-top:18px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account stays protected.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:24px 36px;text-align:center;border-top:1px solid #e2e8f0;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 8px;">
                <tr>
                  <td style="vertical-align:middle;padding-right:6px;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#007bbd;"></span>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;color:#0f172a;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">RUNR PROPERTIES</p>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;color:#64748b;font-size:12px;">Gujarat's trusted real estate & property platform</p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; ${new Date().getFullYear()} Runr Properties. All rights reserved.</p>
            </td>
          </tr>

        </table>

        <!-- Sub-footer Disclaimer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
          <tr>
            <td style="padding:18px 36px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.5;">
                This is an automated security email from Runr Properties. Please do not reply directly to this message.
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
    from: process.env.EMAIL_FROM || `"Runr Properties" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password - Runr Properties',
    html,
    attachments: [
      {
        filename: 'runr-logo.png',
        path: logoPath,
        cid: 'runrLogo', // referenced in img tag
      },
    ],
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

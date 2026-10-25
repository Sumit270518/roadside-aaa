const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Initializes and returns the active Nodemailer transporter.
 * Supports:
 * 1. Direct Gmail / custom SMTP via environment variables (SMTP_USER, SMTP_PASS, SMTP_HOST)
 * 2. Ethereal Email test account in development if no SMTP credentials are provided
 */
const getTransporter = async () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  // 1. Production or explicit SMTP configuration (e.g. Gmail App Password)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    const isGmail =
      !process.env.SMTP_HOST ||
      process.env.SMTP_HOST.includes('gmail.com') ||
      process.env.SMTP_SERVICE === 'gmail';

    const transportOptions = isGmail
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS, // 16-character Gmail App Password
          },
        }
      : {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        };

    cachedTransporter = nodemailer.createTransport(transportOptions);
    console.log(`[Email Service] Configured live SMTP transport for: ${process.env.SMTP_USER}`);
    return cachedTransporter;
  }

  // 2. Development / Test fallback: Ethereal test transporter
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email Service] Initialized Ethereal test account: ${testAccount.user}`);
    return cachedTransporter;
  } catch (err) {
    console.warn(`[Email Service] Fallback transporter creation warning: ${err.message}`);
    // Minimal fallback dummy transporter
    cachedTransporter = {
      sendMail: async (options) => {
        console.log(`[Email Mock] Email to ${options.to} — Subject: "${options.subject}"`);
        return { messageId: `mock-${Date.now()}` };
      },
    };
    return cachedTransporter;
  }
};

/**
 * Sends a generic HTML/text email without blocking the application.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  // Validate recipient email
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    console.warn(`[Email Service] Skipped sending: invalid recipient email "${to}"`);
    return { success: false, reason: 'invalid_recipient' };
  }

  try {
    const transporter = await getTransporter();
    const fromAddress =
      process.env.FROM_EMAIL || process.env.SMTP_USER || '"Roadside AAA" <alerts@roadside-aaa.com>';

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      text: text || html.replace(/<[^>]*>?/gm, ''), // fallback plain text
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email delivered to ${to} (MessageId: ${info.messageId})`);

    // If using Ethereal test account, print preview URL for developers
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Service] Preview Delivered Email Online: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    if (error.message && error.message.includes('535-5.7.8')) {
      console.error(`\n[Gmail Authentication Error] Google rejected the credentials for "${process.env.SMTP_USER}":`);
      console.error(`- Error: Invalid login / BadCredentials (535-5.7.8).`);
      console.error(`- Fix: Ensure the 16-character App Password was generated specifically under the account "${process.env.SMTP_USER}" at https://myaccount.google.com/apppasswords.\n`);
    } else {
      console.error(`[Email Service Error] Failed sending email to ${to}:`, error.message);
    }
    // Never throw - email delivery errors must not crash auth or booking workflows
    return { success: false, error: error.message };
  }
};

/**
 * Sends an Account Welcome email upon registration.
 */
const sendWelcomeEmail = async ({ to, name, role, isPartner = false }) => {
  const portalName = isPartner
    ? role === 'towing_partner'
      ? 'Towing Partner Fleet'
      : 'Mechanic Partner Fleet'
    : 'Roadside Motorist';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header h1 span { color: #f59e0b; }
    .header p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; font-weight: 500; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .badge { display: inline-block; padding: 4px 12px; background: #eff6ff; color: #2563eb; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .hotline-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0; }
    .hotline-title { color: #dc2626; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    .hotline-number { font-size: 20px; font-weight: 900; color: #0f172a; margin: 4px 0; }
    .steps { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; }
    .steps ol { margin: 0; padding-left: 20px; }
    .steps li { margin-bottom: 8px; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
    .footer a { color: #2563eb; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roadside <span>AAA</span></h1>
      <p>24/7 On-Demand Roadside Assistance & Emergency Fleet</p>
    </div>
    <div class="content">
      <div class="greeting">Welcome aboard, ${name || 'Valued Member'}!</div>
      <div class="badge">${portalName} Account Active</div>
      <p>Thank you for registering with <strong>Roadside AAA</strong>. Your account has been securely set up with your registered email address (<strong>${to}</strong>).</p>

      <div class="hotline-box">
        <div class="hotline-title">Nationwide 24/7 Emergency Dispatch Helpline</div>
        <div class="hotline-number">1800-AAA-HELP (1800-222-4357)</div>
        <p style="margin: 0; font-size: 12px; color: #64748b;">Save this number in your mobile phone contacts for highway breakdowns.</p>
      </div>

      <div class="steps">
        <strong>Quick Next Steps:</strong>
        <ol>
          ${
            isPartner
              ? `<li>Log in to your <strong>Partner Portal</strong> to manage your service categories and operating radius.</li>
                 <li>Keep your availability set to <strong>ONLINE</strong> to receive real-time dispatch alerts.</li>
                 <li>Our verification team will review your business credentials for immediate assignment approval.</li>`
              : `<li>Add your vehicle details (Make, Model, License Plate) in your <strong>Vehicle Garage</strong>.</li>
                 <li>In case of a flat tyre, battery drain, or breakdown, click <strong>Get Help</strong> for instant GPS matching.</li>
                 <li>Track your verified mechanic in real-time as they drive to your location.</li>`
          }
        </ol>
      </div>

      <p style="font-size: 13px; color: #64748b;">If you have any questions or require assistance, our customer care desk is always available 24 hours a day, 7 days a week.</p>
    </div>
    <div class="footer">
      <p>© 2026 Roadside AAA Technologies Inc. All rights reserved.</p>
      <p>This email was sent to ${to} because an account was registered on Roadside AAA.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Roadside AAA — 24/7 Roadside Assistance Account Activated',
    html,
  });
};

/**
 * Sends a Security Alert email upon successful sign-in.
 */
const sendSignInAlertEmail = async ({ to, name, ip, userAgent }) => {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .header h1 span { color: #f59e0b; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .alert-banner { background: #fef3c7; border: 1px solid #fde68a; color: #92400e; padding: 12px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; margin-bottom: 20px; }
    .table-info { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table-info td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .table-info td:first-child { font-weight: 700; color: #64748b; width: 35%; }
    .table-info td:last-child { color: #0f172a; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roadside <span>AAA</span></h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Security & Account Protection Notification</p>
    </div>
    <div class="content">
      <div class="alert-banner">
        🛡️ Security Notice: New Sign-In to your Account
      </div>

      <p>Hello <strong>${name || 'Valued Member'}</strong>,</p>
      <p>We detected a new sign-in to your <strong>Roadside AAA</strong> account (<strong>${to}</strong>).</p>

      <table class="table-info">
        <tr>
          <td>Date & Time:</td>
          <td>${timestamp} (IST)</td>
        </tr>
        <tr>
          <td>IP Address:</td>
          <td>${ip || '127.0.0.1'}</td>
        </tr>
        <tr>
          <td>Browser / Client:</td>
          <td>${userAgent || 'Web Browser'}</td>
        </tr>
      </table>

      <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 4px; font-size: 12px; color: #475569; margin: 20px 0;">
        <strong>Was this you?</strong> If you just logged in, you can safely disregard this security message.
        <br/><br/>
        <strong>Didn't sign in?</strong> Please immediately contact our 24/7 Security Helpline at <strong>1800-AAA-HELP</strong> (1800-222-4357) to safeguard your account and registered vehicles.
      </div>
    </div>
    <div class="footer">
      <p>© 2026 Roadside AAA Technologies Inc. All rights reserved.</p>
      <p>This is an automated security notification sent to ${to}.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: 'Security Alert: New Sign-In to your Roadside AAA Account',
    html,
  });
};

/**
 * Sends a booking confirmation email to customer upon requesting assistance.
 */
const sendRequestCreatedEmail = async ({
  to,
  name,
  bookingReference,
  serviceCategory,
  vehicle,
  address,
  landmark,
  estimatedTotal,
}) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .header h1 span { color: #f59e0b; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; background: #fef2f2; color: #dc2626; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .table-info { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table-info td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .table-info td:first-child { font-weight: 700; color: #64748b; width: 35%; }
    .table-info td:last-child { color: #0f172a; font-weight: 600; }
    .safety-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 14px; font-size: 12px; color: #92400e; margin: 20px 0; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roadside <span>AAA</span></h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Emergency Assistance Request Confirmed</p>
    </div>
    <div class="content">
      <div class="badge">🚨 Dispatch Radar Active • Searching Technicians</div>
      <p>Hello <strong>${name || 'Motorist'}</strong>,</p>
      <p>Your emergency roadside assistance ticket <strong>#${bookingReference}</strong> has been created and broadcast to verified mechanics in your area.</p>

      <table class="table-info">
        <tr><td>Ticket ID:</td><td>#${bookingReference}</td></tr>
        <tr><td>Service:</td><td>${serviceCategory}</td></tr>
        <tr><td>Vehicle:</td><td>${vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})` : 'Registered Vehicle'}</td></tr>
        <tr><td>Location:</td><td>${address}${landmark ? ` (Landmark: ${landmark})` : ''}</td></tr>
        ${estimatedTotal ? `<tr><td>Estimated Cost:</td><td>₹${estimatedTotal} (incl. 18% GST)</td></tr>` : ''}
      </table>

      <div class="safety-box">
        <strong>⚠️ Safety First:</strong> While waiting for your technician, turn on your vehicle's hazard warning flashers and stand safely behind the road barrier or guardrail.
      </div>

      <p style="font-size: 12px; color: #64748b;">You will receive an immediate notification as soon as a nearby verified technician accepts your dispatch ticket.</p>
    </div>
    <div class="footer">
      <p>Emergency Helpline: <strong>1800-AAA-HELP (1800-222-4357)</strong></p>
      <p>© 2026 Roadside AAA Technologies Inc.</p>
    </div>
  </div>
</body>
</html>
  `;

  return sendEmail({
    to,
    subject: `Assistance Dispatched: Roadside AAA Request #${bookingReference}`,
    html,
  });
};

/**
 * Sends notification emails to both customer and partner when job is accepted.
 */
const sendJobAcceptedEmail = async ({
  customerEmail,
  customerName,
  partnerEmail,
  partnerName,
  partnerPhone,
  partnerBusiness,
  bookingReference,
  serviceCategory,
  vehicle,
  address,
  landmark,
}) => {
  // 1. Email to Customer
  const customerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .header h1 span { color: #f59e0b; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
    .tech-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .table-info { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .table-info td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .table-info td:first-child { font-weight: 700; color: #64748b; width: 35%; }
    .table-info td:last-child { color: #0f172a; font-weight: 600; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roadside <span>AAA</span></h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Assistance Partner Assigned</p>
    </div>
    <div class="content">
      <div class="badge">🚗 Technician En Route • ETA: 15-25 Mins</div>
      <p>Hello <strong>${customerName || 'Motorist'}</strong>,</p>
      <p>Great news! A verified roadside specialist has accepted your assistance request <strong>#${bookingReference}</strong> and is preparing to arrive at your breakdown location.</p>

      <div class="tech-card">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 800; color: #059669;">Your Assigned Specialist</div>
        <div style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0;">${partnerBusiness || partnerName}</div>
        <div style="font-size: 13px; color: #475569;">Contact: <strong>${partnerPhone || 'Available in App'}</strong></div>
      </div>

      <table class="table-info">
        <tr><td>Ticket ID:</td><td>#${bookingReference}</td></tr>
        <tr><td>Service:</td><td>${serviceCategory}</td></tr>
        <tr><td>Vehicle:</td><td>${vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})` : 'Vehicle'}</td></tr>
        <tr><td>Your Location:</td><td>${address}${landmark ? ` (Near ${landmark})` : ''}</td></tr>
      </table>

      <p style="font-size: 13px;">You can track their real-time location and chat directly with them in your <a href="http://localhost:5173/dashboard" style="color: #2563eb; font-weight: bold;">Roadside AAA Dashboard</a>.</p>
    </div>
    <div class="footer">
      <p>24/7 Helpline: <strong>1800-AAA-HELP (1800-222-4357)</strong></p>
      <p>© 2026 Roadside AAA Technologies Inc.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Dispatch email to customer (non-blocking)
  const customerResult = await sendEmail({
    to: customerEmail,
    subject: `Technician Assigned: ${partnerBusiness || 'Specialist'} is En Route for #${bookingReference}!`,
    html: customerHtml,
  });

  // 2. Email to Partner (if partnerEmail is valid)
  let partnerResult = null;
  if (partnerEmail && partnerEmail.includes('@')) {
    const partnerHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 28px 24px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; }
    .header h1 span { color: #f59e0b; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .table-info { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .table-info td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .table-info td:first-child { font-weight: 700; color: #64748b; width: 35%; }
    .table-info td:last-child { color: #0f172a; font-weight: 600; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Roadside <span>AAA Partner</span></h1>
      <p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">New Job Accepted</p>
    </div>
    <div class="content">
      <div style="display: inline-block; padding: 4px 12px; background: #eff6ff; color: #1d4ed8; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 16px;">
        Job Assignment Confirmed
      </div>
      <p>Hello <strong>${partnerName}</strong>,</p>
      <p>You have successfully accepted job <strong>#${bookingReference}</strong>. Please proceed to your Partner Dashboard, update your status to <strong>En Route</strong>, and start navigation to the motorist.</p>

      <table class="table-info">
        <tr><td>Customer Name:</td><td>${customerName}</td></tr>
        <tr><td>Service Type:</td><td>${serviceCategory}</td></tr>
        <tr><td>Vehicle:</td><td>${vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registrationNumber})` : 'Vehicle'}</td></tr>
        <tr><td>Destination:</td><td>${address}${landmark ? ` (Landmark: ${landmark})` : ''}</td></tr>
      </table>
    </div>
    <div class="footer">
      <p>© 2026 Roadside AAA Partner Operations</p>
    </div>
  </div>
</body>
</html>
    `;

    partnerResult = await sendEmail({
      to: partnerEmail,
      subject: `Job Confirmed: #${bookingReference} — ${customerName}`,
      html: partnerHtml,
    });
  }

  return {
    success: customerResult.success,
    messageId: customerResult.messageId,
    customerResult,
    partnerResult,
  };
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendSignInAlertEmail,
  sendRequestCreatedEmail,
  sendJobAcceptedEmail,
};

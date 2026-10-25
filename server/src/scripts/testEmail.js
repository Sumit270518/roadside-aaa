const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const {
  sendEmail,
  sendWelcomeEmail,
  sendSignInAlertEmail,
  sendRequestCreatedEmail,
  sendJobAcceptedEmail,
} = require('../services/emailService');

const runTest = async () => {
  const targetEmail = process.argv[2] || process.env.SMTP_USER;

  console.log('\n==================================================');
  console.log('       ROADSIDE AAA — EMAIL DISPATCH TEST         ');
  console.log('==================================================\n');

  console.log(`[Configuration Check]`);
  console.log(`- SMTP_SERVICE:  ${process.env.SMTP_SERVICE || '(not set, defaults to gmail if SMTP_USER is set)'}`);
  console.log(`- SMTP_USER:     ${process.env.SMTP_USER ? process.env.SMTP_USER : '❌ NOT CONFIGURED in server/.env'}`);
  console.log(`- SMTP_PASS:     ${process.env.SMTP_PASS ? '******** (configured)' : '❌ NOT CONFIGURED in server/.env'}`);
  console.log(`- Target Recipient: ${targetEmail || '❌ (Please pass recipient email as argument)'}\n`);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  WARNING: SMTP_USER or SMTP_PASS is missing in server/.env!');
    console.warn('Because no sender credentials are provided, emails cannot reach actual Gmail inboxes.');
    console.warn('The system is currently using the Ethereal virtual test inbox.\n');
    console.log('👉 To send real emails to your Gmail inbox:');
    console.log('   1. Open: https://myaccount.google.com/apppasswords');
    console.log('   2. Create an App Password for "Roadside AAA".');
    console.log('   3. Add these lines to server/.env:');
    console.log('      SMTP_SERVICE=gmail');
    console.log('      SMTP_USER=your_email@gmail.com');
    console.log('      SMTP_PASS=your_16_char_app_password');
    console.log('      FROM_EMAIL="Roadside AAA Alerts" <your_email@gmail.com>\n');
  }

  if (!targetEmail || !targetEmail.includes('@')) {
    console.error('❌ Error: Please specify a recipient email address to test.');
    console.log('Usage: node src/scripts/testEmail.js your_email@gmail.com\n');
    process.exit(1);
  }

  console.log(`⏳ Attempting to send test Welcome Email to: ${targetEmail}...`);

  const welcomeResult = await sendWelcomeEmail({
    to: targetEmail,
    name: 'Roadside Driver',
    role: 'user',
  });

  if (welcomeResult.success) {
    console.log(`\n✅ Welcome Email sent successfully!`);
    console.log(`   Message ID: ${welcomeResult.messageId}`);
    if (welcomeResult.previewUrl) {
      console.log(`   Virtual Inbox Preview URL: ${welcomeResult.previewUrl}`);
      console.log('   (Note: To receive this in your real Gmail inbox, configure SMTP_USER & SMTP_PASS in server/.env)');
    } else {
      console.log(`   📬 Check your real Gmail inbox at: ${targetEmail} (also check Spam/Promotions folder)`);
    }
  } else {
    console.error(`\n❌ Failed to send Welcome Email:`, welcomeResult.error || welcomeResult.reason);
  }

  console.log(`\n⏳ Attempting to send Security Sign-In Alert to: ${targetEmail}...`);

  const alertResult = await sendSignInAlertEmail({
    to: targetEmail,
    name: 'Roadside Driver',
    ip: '127.0.0.1 (Localhost)',
    userAgent: 'Chrome on Windows 11',
  });

  if (alertResult.success) {
    console.log(`✅ Sign-In Alert Email sent successfully!`);
    console.log(`   Message ID: ${alertResult.messageId}`);
  } else {
    console.error(`❌ Failed to send Sign-In Alert Email:`, alertResult.error || alertResult.reason);
  }

  console.log(`\n⏳ Attempting to send Assistance Request Dispatch Email to: ${targetEmail}...`);

  const requestResult = await sendRequestCreatedEmail({
    to: targetEmail,
    name: 'Roadside Driver',
    bookingReference: 'AAA-DEMO-TEST',
    serviceCategory: 'Breakdown Repair',
    vehicle: { make: 'Honda', model: 'City', registrationNumber: 'KA-01-AB-1234' },
    address: 'Near Forum Mall, Koramangala',
    landmark: 'Opposite Shell Fuel Station',
    estimatedTotal: 850,
  });

  if (requestResult.success) {
    console.log(`✅ Assistance Dispatched Email sent successfully!`);
    console.log(`   Message ID: ${requestResult.messageId}`);
  } else {
    console.error(`❌ Failed to send Assistance Dispatched Email:`, requestResult.error || requestResult.reason);
  }

  console.log(`\n⏳ Attempting to send Mechanic Accepted & En-Route Email to: ${targetEmail}...`);

  const acceptedResult = await sendJobAcceptedEmail({
    customerEmail: targetEmail,
    customerName: 'Roadside Driver',
    partnerEmail: targetEmail,
    partnerName: 'Rajesh Sharma',
    partnerPhone: '+91 98765 43210',
    partnerBusiness: 'Apex QuickFix Mechanics',
    bookingReference: 'AAA-DEMO-TEST',
    serviceCategory: 'Breakdown Repair',
    vehicle: { make: 'Honda', model: 'City', registrationNumber: 'KA-01-AB-1234' },
    address: 'Near Forum Mall, Koramangala',
    landmark: 'Opposite Shell Fuel Station',
  });

  if (acceptedResult.success) {
    console.log(`✅ Mechanic Assigned & En-Route Email sent successfully!`);
    console.log(`   Message ID: ${acceptedResult.messageId}`);
  } else {
    console.error(`❌ Failed to send Mechanic Assigned Email:`, acceptedResult.error || acceptedResult.reason);
  }

  console.log('\n==================================================\n');
  process.exit(0);
};

runTest();

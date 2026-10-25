const { sendWelcomeEmail, sendSignInAlertEmail, sendEmail } = require('../src/services/emailService');

describe('Email Delivery Service', () => {
  it('should deliver a welcome email to a registered user', async () => {
    const result = await sendWelcomeEmail({
      to: 'motorist.test@example.com',
      name: 'Test Motorist',
      role: 'user',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should deliver a partner welcome email to an onboarding mechanic', async () => {
    const result = await sendWelcomeEmail({
      to: 'mechanic.test@example.com',
      name: 'Speedy Mechanic',
      role: 'mechanic',
      isPartner: true,
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should deliver a sign-in security alert email upon login', async () => {
    const result = await sendSignInAlertEmail({
      to: 'user.security@example.com',
      name: 'Security User',
      ip: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should gracefully handle invalid recipient without throwing', async () => {
    const result = await sendEmail({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });

    expect(result.success).toBe(false);
    expect(result.reason).toBe('invalid_recipient');
  });
});

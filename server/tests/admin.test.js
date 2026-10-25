const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const PartnerProfile = require('../src/models/PartnerProfile');
const AuditLog = require('../src/models/AuditLog');
const { ROLES, VERIFICATION_STATUS } = require('../src/constants/roles');

describe('Admin Management & Verification API', () => {
  let adminToken;
  let userToken;
  let partnerProfileId;

  beforeEach(async () => {
    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin.test@example.com',
      phone: '9876599999',
      password: 'AdminPassword123',
      role: ROLES.ADMIN,
    });

    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin.test@example.com',
        password: 'AdminPassword123',
      });
    adminToken = adminLoginRes.body.token;

    // 2. Create Regular User
    const userRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Regular Driver',
        email: 'regular.driver@example.com',
        phone: '9876588888',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });
    userToken = userRes.body.token;

    // 3. Create Pending Partner
    const partnerUser = await User.create({
      name: 'Applicant Mechanic',
      email: 'applicant@example.com',
      phone: '9876577777',
      password: 'Password@123',
      role: ROLES.MECHANIC,
    });

    const partnerProfile = await PartnerProfile.create({
      user: partnerUser._id,
      partnerType: 'mechanic',
      businessName: 'Applicant Garage',
      verificationStatus: VERIFICATION_STATUS.PENDING,
      isAvailable: false,
      address: 'Industrial Area',
      location: {
        type: 'Point',
        coordinates: [77.2000, 28.6000],
      },
    });
    partnerProfileId = partnerProfile._id;
  });

  it('should reject non-admin from accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to fetch real system statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(1);
    expect(res.body.data.pendingVerifications).toBeGreaterThanOrEqual(1);
    expect(res.body.data.grossServiceValue).toBeDefined();
  });

  it('should allow admin to verify a partner and record audit log', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/partners/${partnerProfileId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: VERIFICATION_STATUS.VERIFIED,
        reason: 'Documents verified and certified',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.verificationStatus).toBe(VERIFICATION_STATUS.VERIFIED);

    // Verify audit log entry
    const auditLogs = await AuditLog.find({ resourceId: String(partnerProfileId) });
    expect(auditLogs.length).toBeGreaterThanOrEqual(1);
    expect(auditLogs[0].action).toBe('PARTNER_VERIFIED');
  });
});

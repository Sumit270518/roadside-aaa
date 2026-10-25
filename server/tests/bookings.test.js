const request = require('supertest');
const app = require('../src/app');
const ServiceCategory = require('../src/models/ServiceCategory');
const PartnerProfile = require('../src/models/PartnerProfile');
const { VERIFICATION_STATUS } = require('../src/constants/roles');

describe('Service Booking Lifecycle & Partner API', () => {
  let customerToken;
  let vehicleId;
  let categoryId;
  let verifiedPartnerToken;
  let verifiedPartnerProfileId;
  let unverifiedPartnerToken;

  beforeEach(async () => {
    // 1. Service Category
    const category = await ServiceCategory.create({
      name: 'Breakdown Test',
      slug: 'breakdown-test',
      description: 'Quick repair test',
      basePrice: 500,
      perKmRate: 20,
    });
    categoryId = category._id;

    // 2. Customer & Vehicle
    const custRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Customer Test',
        email: 'customer.test@example.com',
        phone: '9876500101',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });
    customerToken = custRes.body.token;

    const vehRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        registrationNumber: 'DL10-TEST-01',
        vehicleType: 'car',
        make: 'Hyundai',
        model: 'i20',
        year: 2020,
        fuelType: 'petrol',
      });
    vehicleId = vehRes.body.data._id;

    // 3. Verified Partner
    const partnerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Verified Mechanic',
        email: 'verified.partner@example.com',
        phone: '9876500202',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'mechanic',
      });
    verifiedPartnerToken = partnerRes.body.token;

    const partnerProfile = await PartnerProfile.create({
      user: partnerRes.body.data.user._id,
      partnerType: 'mechanic',
      businessName: 'Verified Garage',
      verificationStatus: VERIFICATION_STATUS.VERIFIED,
      isAvailable: true,
      serviceRadiusKm: 30,
      address: 'Central Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
      },
      serviceCategories: [categoryId],
      pricing: { baseFee: 500, perKmRate: 25 },
    });
    verifiedPartnerProfileId = partnerProfile._id;

    // 4. Unverified Partner
    const unverifiedRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Unverified Mechanic',
        email: 'unverified.partner@example.com',
        phone: '9876500303',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'mechanic',
      });
    unverifiedPartnerToken = unverifiedRes.body.token;

    await PartnerProfile.create({
      user: unverifiedRes.body.data.user._id,
      partnerType: 'mechanic',
      businessName: 'Unverified Garage',
      verificationStatus: VERIFICATION_STATUS.PENDING,
      isAvailable: true,
      serviceRadiusKm: 20,
      address: 'North Delhi',
      location: {
        type: 'Point',
        coordinates: [77.2100, 28.6200],
      },
      serviceCategories: [categoryId],
    });
  });

  it('should discover nearby verified partners', async () => {
    const res = await request(app)
      .get('/api/v1/partners/nearby?longitude=77.2100&latitude=28.6150&serviceCategoryId=' + categoryId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].businessName).toBe('Verified Garage');
  });

  it('should successfully submit an emergency assistance request', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        serviceCategoryId: categoryId,
        breakdownDescription: 'Engine overheating on the highway',
        coordinates: [77.2100, 28.6150],
        address: 'National Highway 48, Mile 12',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('searching');
    expect(res.body.data.bookingReference).toBeDefined();
    expect(res.body.data.estimatedPrice.estimatedTotal).toBeGreaterThan(0);
  });

  it('should reject assistance request with malformed coordinates', async () => {
    const res = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        serviceCategoryId: categoryId,
        breakdownDescription: 'Battery dead',
        coordinates: [999, 999], // Invalid coordinates
        address: 'Somewhere',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent unverified partner from accepting request', async () => {
    // Create booking
    const bookingRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        serviceCategoryId: categoryId,
        breakdownDescription: 'Tire burst',
        coordinates: [77.2100, 28.6150],
        address: 'MG Road',
      });

    const bookingId = bookingRes.body.data._id;

    // Unverified partner attempts to accept
    const acceptRes = await request(app)
      .post(`/api/v1/requests/${bookingId}/accept`)
      .set('Authorization', `Bearer ${unverifiedPartnerToken}`);

    expect(acceptRes.status).toBe(403);
    expect(acceptRes.body.success).toBe(false);
  });

  it('should atomically accept request and prevent duplicate partner assignment', async () => {
    const bookingRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        serviceCategoryId: categoryId,
        breakdownDescription: 'Alternator light on',
        coordinates: [77.2100, 28.6150],
        address: 'Outer Ring Road',
      });

    const bookingId = bookingRes.body.data._id;

    // Verified partner accepts
    const acceptRes1 = await request(app)
      .post(`/api/v1/requests/${bookingId}/accept`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`);

    expect(acceptRes1.status).toBe(200);
    expect(acceptRes1.body.data.status).toBe('accepted');

    // Attempt second accept on already accepted request
    const acceptRes2 = await request(app)
      .post(`/api/v1/requests/${bookingId}/accept`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`);

    expect(acceptRes2.status).toBe(409); // Conflict
    expect(acceptRes2.body.success).toBe(false);
  });

  it('should complete job and prevent duplicate review', async () => {
    // Create booking
    const bookingRes = await request(app)
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        vehicleId,
        serviceCategoryId: categoryId,
        breakdownDescription: 'Flat tire',
        coordinates: [77.2100, 28.6150],
        address: 'Ring Road',
      });

    const bookingId = bookingRes.body.data._id;

    // Partner accepts
    await request(app)
      .post(`/api/v1/requests/${bookingId}/accept`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`);

    // Follow strict lifecycle transitions: accepted -> en_route -> arrived -> in_progress
    await request(app)
      .post(`/api/v1/requests/${bookingId}/status`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`)
      .send({ status: 'en_route' });

    await request(app)
      .post(`/api/v1/requests/${bookingId}/status`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`)
      .send({ status: 'arrived' });

    await request(app)
      .post(`/api/v1/requests/${bookingId}/status`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`)
      .send({ status: 'in_progress' });

    // Partner completes with itemized additional charge
    const completeRes = await request(app)
      .post(`/api/v1/requests/${bookingId}/complete`)
      .set('Authorization', `Bearer ${verifiedPartnerToken}`)
      .send({
        additionalCharges: [{ description: 'New tube patch', amount: 100 }],
        paymentMethod: 'cash',
      });

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('completed');
    expect(completeRes.body.data.finalPrice.total).toBeGreaterThan(0);

    // Customer reviews
    const reviewRes1 = await request(app)
      .post(`/api/v1/requests/${bookingId}/review`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rating: 5,
        comment: 'Super fast mechanic and friendly service!',
      });

    expect(reviewRes1.status).toBe(201);
    expect(reviewRes1.body.success).toBe(true);

    // Attempt duplicate review
    const reviewRes2 = await request(app)
      .post(`/api/v1/requests/${bookingId}/review`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        rating: 4,
        comment: 'Second review attempt',
      });

    expect(reviewRes2.status).toBe(400);
    expect(reviewRes2.body.success).toBe(false);
  });
});

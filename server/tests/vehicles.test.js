const request = require('supertest');
const app = require('../src/app');

describe('Vehicle Management API', () => {
  let user1Token;
  let user2Token;

  beforeEach(async () => {
    // Register User 1
    const res1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        phone: '9876500001',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });
    user1Token = res1.body.token;

    // Register User 2
    const res2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        phone: '9876500002',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });
    user2Token = res2.body.token;
  });

  it('should allow user to create and retrieve their vehicle', async () => {
    const createRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        registrationNumber: 'DL01-AB-9999',
        vehicleType: 'car',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        fuelType: 'petrol',
        color: 'Silver',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.registrationNumber).toBe('DL01-AB-9999');

    // Retrieve vehicles
    const listRes = await request(app)
      .get('/api/v1/vehicles')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].make).toBe('Toyota');
  });

  it('should reject access to another user vehicle', async () => {
    // User 1 creates vehicle
    const createRes = await request(app)
      .post('/api/v1/vehicles')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        registrationNumber: 'DL02-CD-1111',
        vehicleType: 'car',
        make: 'Honda',
        model: 'City',
        year: 2022,
        fuelType: 'petrol',
      });

    const vehicleId = createRes.body.data._id;

    // User 2 attempts to get User 1's vehicle
    const getRes = await request(app)
      .get(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(getRes.status).toBe(403);
    expect(getRes.body.success).toBe(false);

    // User 2 attempts to delete User 1's vehicle
    const delRes = await request(app)
      .delete(`/api/v1/vehicles/${vehicleId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(delRes.status).toBe(403);
    expect(delRes.body.success).toBe(false);
  });
});

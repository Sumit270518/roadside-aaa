const request = require('supertest');
const app = require('../src/app');

describe('Authentication & Authorization API', () => {
  it('should successfully register a vehicle owner', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Alex Rivera',
        email: 'alex.rivera@example.com',
        phone: '9876543210',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.data.user.email).toBe('alex.rivera@example.com');
    expect(res.body.data.user.role).toBe('user');
  });

  it('should reject duplicate email registration', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User One',
        email: 'duplicate@example.com',
        phone: '9876543210',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'User Two',
        email: 'duplicate@example.com',
        phone: '9876543211',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent user from self-assigning admin role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Hacker Admin',
        email: 'hacker@example.com',
        phone: '9876543210',
        password: 'Password@123',
        confirmPassword: 'Password@123',
        role: 'admin',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user with valid credentials', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        phone: '9876543210',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Wrong Pass User',
        email: 'wrongpass@example.com',
        phone: '9876543210',
        password: 'Password@123',
        confirmPassword: 'Password@123',
      });

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'wrongpass@example.com',
        password: 'IncorrectPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject access to protected /me endpoint without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

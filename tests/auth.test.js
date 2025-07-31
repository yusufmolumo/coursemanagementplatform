const request = require('supertest');
const app = require('../server');
const db = require('../models');
const bcrypt = require('bcryptjs');

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await db.Manager.destroy({ where: {} });
    await db.Facilitator.destroy({ where: {} });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new manager successfully', async () => {
      const managerData = {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'manager'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(managerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.name).toBe(managerData.name);
      expect(response.body.data.user.email).toBe(managerData.email);
      expect(response.body.data.user.role).toBe('manager');
      expect(response.body.data.token).toBeDefined();
    });

    it('should register a new facilitator successfully', async () => {
      // First create a manager
      const manager = await db.Manager.create({
        name: 'Manager',
        email: 'manager@test.com',
        password: await bcrypt.hash('password123', 10),
        role: 'manager'
      });

      const facilitatorData = {
        name: 'Test Facilitator',
        email: 'facilitator@test.com',
        password: 'password123',
        role: 'facilitator',
        qualification: 'Masters',
        location: 'Test City',
        managerId: manager.id
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(facilitatorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('facilitator');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'manager'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should return error for invalid role', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        role: 'invalid_role'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid role');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await db.Manager.create({
        name: 'Test Manager',
        email: 'manager@test.com',
        password: hashedPassword,
        role: 'manager'
      });
    });

    it('should login manager successfully', async () => {
      const loginData = {
        email: 'manager@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.role).toBe('manager');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'manager@test.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;
    let manager;

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      manager = await db.Manager.create({
        name: 'Test Manager',
        email: 'manager@test.com',
        password: hashedPassword,
        role: 'manager'
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'manager@test.com',
          password: 'password123'
        });

      token = loginResponse.body.data.token;
    });

    it('should get manager profile successfully', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(manager.name);
      expect(response.body.data.email).toBe(manager.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should return error for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid token');
    });

    it('should return error for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });
}); 
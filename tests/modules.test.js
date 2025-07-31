const request = require('supertest');
const app = require('../server');
const db = require('../models');
const bcrypt = require('bcryptjs');

describe('Module Endpoints', () => {
  let token;
  let manager;

  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  beforeEach(async () => {
    await db.Module.destroy({ where: {} });
    await db.Manager.destroy({ where: {} });

    // Create a manager and get token
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

  describe('GET /api/modules', () => {
    it('should get all modules', async () => {
      await db.Module.create({
        name: 'Test Module 1',
        half: 'H1',
        description: 'Test description 1',
        credits: 15
      });

      await db.Module.create({
        name: 'Test Module 2',
        half: 'H2',
        description: 'Test description 2',
        credits: 20
      });

      const response = await request(app)
        .get('/api/modules')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Test Module 1');
      expect(response.body.data[1].name).toBe('Test Module 2');
    });

    it('should return empty array when no modules exist', async () => {
      const response = await request(app)
        .get('/api/modules')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/modules/:id', () => {
    it('should get module by ID', async () => {
      const module = await db.Module.create({
        name: 'Test Module',
        half: 'H1',
        description: 'Test description',
        credits: 15
      });

      const response = await request(app)
        .get(`/api/modules/${module.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Module');
      expect(response.body.data.half).toBe('H1');
    });

    it('should return 404 for non-existent module', async () => {
      const response = await request(app)
        .get('/api/modules/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Module not found');
    });
  });

  describe('POST /api/modules', () => {
    it('should create a new module', async () => {
      const moduleData = {
        name: 'New Module',
        half: 'H1',
        description: 'New module description',
        credits: 18
      };

      const response = await request(app)
        .post('/api/modules')
        .set('Authorization', `Bearer ${token}`)
        .send(moduleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Module created successfully');
      expect(response.body.data.name).toBe(moduleData.name);
      expect(response.body.data.half).toBe(moduleData.half);
    });

    it('should return error for duplicate module name', async () => {
      await db.Module.create({
        name: 'Existing Module',
        half: 'H1',
        description: 'Existing description',
        credits: 15
      });

      const moduleData = {
        name: 'Existing Module',
        half: 'H2',
        description: 'New description',
        credits: 20
      };

      const response = await request(app)
        .post('/api/modules')
        .set('Authorization', `Bearer ${token}`)
        .send(moduleData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Module with this name already exists');
    });

    it('should return error for invalid half value', async () => {
      const moduleData = {
        name: 'Test Module',
        half: 'H3',
        description: 'Test description',
        credits: 15
      };

      const response = await request(app)
        .post('/api/modules')
        .set('Authorization', `Bearer ${token}`)
        .send(moduleData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/modules/:id', () => {
    it('should update module successfully', async () => {
      const module = await db.Module.create({
        name: 'Original Module',
        half: 'H1',
        description: 'Original description',
        credits: 15
      });

      const updateData = {
        name: 'Updated Module',
        description: 'Updated description',
        credits: 20
      };

      const response = await request(app)
        .put(`/api/modules/${module.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Module updated successfully');
      expect(response.body.data.name).toBe('Updated Module');
      expect(response.body.data.description).toBe('Updated description');
      expect(response.body.data.credits).toBe(20);
    });

    it('should return 404 for non-existent module', async () => {
      const updateData = {
        name: 'Updated Module',
        description: 'Updated description'
      };

      const response = await request(app)
        .put('/api/modules/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Module not found');
    });
  });

  describe('DELETE /api/modules/:id', () => {
    it('should delete module successfully', async () => {
      const module = await db.Module.create({
        name: 'Test Module',
        half: 'H1',
        description: 'Test description',
        credits: 15
      });

      const response = await request(app)
        .delete(`/api/modules/${module.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Module deleted successfully');

      // Verify module is deleted
      const deletedModule = await db.Module.findByPk(module.id);
      expect(deletedModule).toBeNull();
    });

    it('should return 404 for non-existent module', async () => {
      const response = await request(app)
        .delete('/api/modules/non-existent-id')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Module not found');
    });
  });

  describe('GET /api/modules/half/:half', () => {
    it('should get modules by half', async () => {
      await db.Module.create({
        name: 'H1 Module 1',
        half: 'H1',
        description: 'H1 description 1',
        credits: 15
      });

      await db.Module.create({
        name: 'H1 Module 2',
        half: 'H1',
        description: 'H1 description 2',
        credits: 18
      });

      await db.Module.create({
        name: 'H2 Module',
        half: 'H2',
        description: 'H2 description',
        credits: 20
      });

      const response = await request(app)
        .get('/api/modules/half/H1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].half).toBe('H1');
      expect(response.body.data[1].half).toBe('H1');
    });

    it('should return empty array for non-existent half', async () => {
      const response = await request(app)
        .get('/api/modules/half/H3')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });
}); 
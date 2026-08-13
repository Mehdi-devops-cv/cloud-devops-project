const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'password123'
  };

  it('POST /api/signup - should register a new user', async () => {
    const res = await request(app)
      .post('/api/signup')
      .send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/login - should login successfully', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/login - should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(400);
  });

  it('GET /api/health - should return health status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});

describe('Reference Endpoints', () => {
  it('GET /api/cities - should return cities', async () => {
    const res = await request(app).get('/api/cities');
    expect(res.statusCode).toBe(200);
  });

  it('GET /api/buildings - should return buildings', async () => {
    const res = await request(app).get('/api/buildings');
    expect(res.statusCode).toBe(200);
  });
});

const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');

let mongoServer;
let token;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // Create user and get token
  await request(app).post('/api/signup').send({
    name: 'Test User', email: 'test@test.com', password: 'password123'
  });
  const loginRes = await request(app).post('/api/login').send({
    email: 'test@test.com', password: 'password123'
  });
  token = loginRes.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Notes Endpoints', () => {
  it('POST /api/notes - should create a note', async () => {
    const res = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({
        city: 'Paris', building: 'Batiment A', task: 'Nettoyage',
        floor: '1er', apartment: '101', company: 'TestCo',
        selectedDate: new Date().toISOString()
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/notes - should list notes', async () => {
    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/notes - should fail without auth', async () => {
    const res = await request(app).get('/api/notes');
    expect(res.statusCode).toBe(401);
  });
});

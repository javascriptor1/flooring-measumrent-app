import request from 'supertest';
import { app } from '../index'; // Assuming your Express app is exported as 'app' from server/index.ts
import { storage } from '../storage';
import { InsertUser } from '@shared/schema';

// TODO: Configure and use a separate test database

describe('Quote API Endpoints', () => {
  let authToken: string;
  let testUser: InsertUser;
  let createdQuoteId: number;

  beforeAll(async () => {
    // TODO: Set up test database (e.g., run migrations)
    // For now, let's create a test user directly in the storage
    testUser = { username: 'testuser', password: 'testpassword' };
    await storage.createUser(testUser);
  });

  afterAll(async () => {
    // TODO: Clean up test database (e.g., drop tables or clear data)
    // For now, we might need to manually clean up the created user and quotes after tests
  });

  test('should allow user registration and login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: testUser.username, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    authToken = res.body.token;
  });

  test('should create a new quote for authenticated user', async () => {
    const newQuoteData = {
      customerName: 'Test Customer',
      customerMobile: '1234567890',
      rooms: [],
      wastagePercentage: 5,
      totalRoomArea: 0,
      totalSkirtingLength: 0,
      totalFlooringRequired: 0,
      totalSkirtingRequired: 0,
      createdAt: new Date().toISOString(),
    };
    const res = await request(app)
      .post('/api/quotes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newQuoteData);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.customerName).toBe('Test Customer');
    createdQuoteId = res.body.id;
  });

  test('should get the created quote by ID as the owner', async () => {
    const res = await request(app)
      .get(`/api/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdQuoteId);
    expect(res.body.customerName).toBe('Test Customer');
  });

  test('should update the created quote as the owner', async () => {
    const updatedQuoteData = {
      customerName: 'Updated Test Customer',
      customerAddress: '123 Test St',
    };
    const res = await request(app)
      .put(`/api/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatedQuoteData);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdQuoteId);
    expect(res.body.customerName).toBe('Updated Test Customer');
    expect(res.body.customerAddress).toBe('123 Test St');
  });

  test('should delete the created quote as the owner', async () => {
    const res = await request(app)
      .delete(`/api/quotes/${createdQuoteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', createdQuoteId);
  });

  test('should return 404 when getting a non-existent quote', async () => {
    const nonExistentId = createdQuoteId + 1; // Use an ID that doesn't exist
    const res = await request(app)
      .get(`/api/quotes/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Quote not found');
  });

  test('should return 401 when accessing protected quote routes without authentication', async () => {
    const res = await request(app)
      .get('/api/quotes'); // Accessing get all quotes without token

    expect(res.status).toBe(401);
  });

  // TODO: Add a test user and quote for another user to test 403
  // test('should return 403 when accessing a quote owned by another user', async () => { /* ... */ });
});
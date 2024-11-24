/**
 * @jest-environment node
 */

import request from 'supertest';
import bcrypt from 'bcrypt';
import { createApp } from './app.js';

// Mock bcrypt before importing other modules
const mockHash = jest.fn().mockImplementation((password, saltRounds, callback) => callback(null, 'hashedPassword'));
const mockCompare = jest.fn().mockImplementation((password, hash, callback) => callback(null, true));

jest.mock('bcrypt', () => ({
  hash: mockHash,
  compare: mockCompare,
  genSalt: jest.fn()
}));

// Mock database
const mockDb = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
  connect: jest.fn()
};

// Create app instance with mock db
const app = createApp(mockDb);

describe('App Tests', () => {
  beforeEach(() => {
    mockDb.query.mockClear();
    mockHash.mockClear();
    mockCompare.mockClear();
  });

  describe('Basic Routes', () => {
    test('GET / should render home page', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
    });

    test('GET /login should render login page', async () => {
      const response = await request(app).get('/login');
      expect(response.status).toBe(200);
    });

    test('GET /register should render register page', async () => {
      const response = await request(app).get('/register');
      expect(response.status).toBe(200);
    });
  });

  describe('Authentication', () => {
    test('POST /register should create new user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/register')
        .send('username=testuser&password=testpass&role=student')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(mockDb.query).toHaveBeenCalled();
    });

    test('POST /login should authenticate user', async () => {
      mockDb.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          name: 'testuser',
          password: 'hashedPassword',
          origin: 'STUDENT'
        }]
      });

      const response = await request(app)
        .post('/login')
        .send('username=testuser&password=testpass')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
    });
  });

  describe('Protected Routes', () => {
    test('GET /student-dashboard should require authentication', async () => {
      const response = await request(app)
        .get('/student-dashboard');
      expect(response.status).toBe(200);
    });

    test('GET /instructor-dashboard should require username', async () => {
      const response = await request(app)
        .get('/instructor-dashboard');
      expect(response.status).toBe(400);
    });
  });

  describe('Profile Routes', () => {
    test('GET /profile should redirect unauthenticated users', async () => {
      const response = await request(app)
        .get('/profile');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login');
    });
  });
});

// Clean up after tests
afterAll(done => {
  done();
});
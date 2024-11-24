import request from 'supertest';
import { createApp } from './app.js';

// Mock bcrypt module
jest.mock('bcrypt', () => {
  return {
    hash: (data, salt, cb) => cb(null, 'hashedPassword'),
    compare: (data, hash, cb) => cb(null, true),
    default: {
      hash: (data, salt, cb) => cb(null, 'hashedPassword'),
      compare: (data, hash, cb) => cb(null, true)
    }
  };
});

// Mock database
const mockDb = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
  connect: jest.fn()
};

// Create app instance with mock db
const app = createApp(mockDb);

describe('App Tests', () => {
  // Clear mocks before each test
  beforeEach(() => {
    mockDb.query.mockClear();
  });

  // Close server after all tests
  afterAll(done => {
    done();
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
    jest.setTimeout(10000); // Increase timeout for auth tests

    test('POST /register should create new user', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/register')
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: 'testpass',
          role: 'student'
        });

      expect(mockDb.query).toHaveBeenCalled();
      expect(response.status).toBe(200);
    }, 10000);

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
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      expect(response.status).toBe(200);
    }, 10000);
  });

  describe('Protected Routes', () => {
    test('GET /student-dashboard should require authentication', async () => {
      const response = await request(app)
        .get('/student-dashboard')
        .set('Cookie', ['connect.sid=test-session']);
      
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
      const response = await request(app).get('/profile');
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login');
    });
  });
});
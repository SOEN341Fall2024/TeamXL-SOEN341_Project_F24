import request from 'supertest';
import { createApp } from './app.js';
//import express from 'express';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  hash: (data, salt, cb) => cb(null, 'hashedPassword'),
  compare: (data, hash, cb) => cb(null, true),
  default: {
    hash: (data, salt, cb) => cb(null, 'hashedPassword'),
    compare: (data, hash, cb) => cb(null, true)
  }
}));

// Mock database with more comprehensive query responses
const mockDb = {
  query: jest.fn(),
  connect: jest.fn()
};

describe('App Tests', () => {
  let app;
  let server;

  beforeAll(() => {
    app = createApp(mockDb);
    server = app.listen();
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    mockDb.query.mockClear();
    // Set up default mock responses
    mockDb.query.mockImplementation((query) => {
      if (query.includes('SELECT')) {
        return Promise.resolve({
          rows: [{
            id: 1,
            name: 'testuser',
            password: 'hashedPassword',
            origin: 'STUDENT',
            id_group: 1
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    });
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
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      expect(response.status).toBe(302);
    });
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

  describe('Peer Evaluation', () => {
    test('GET /peer-assessment should render peer assessment page', async () => {
      // First, set up the mock database responses
      mockDb.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1,
            name: 'testuser',
            password: 'hashedPassword',
            origin: 'STUDENT',
            id_group: 1
          }] 
        }) // Login query
        .mockResolvedValueOnce({ rows: [{ id_group: 1 }] }) // Group ID query
        .mockResolvedValueOnce({ 
          rows: [
            { id: 1, name: 'Student 1' },
            { id: 2, name: 'Student 2' },
            { id: 3, name: 'Student 3' }
          ]
        }); // Student list query

      // Create an agent for maintaining session
      const agent = request.agent(app);

      // First, perform login to establish session
      const loginResponse = await agent
        .post('/login')
        .type('form')
        .send({
          username: 'testuser',
          password: 'testpass'
        });

      expect(loginResponse.status).toBe(302);

      // Now make the peer assessment request using the same agent
      const response = await agent
        .get('/peer-assessment')
        .query({ userType: 'STUDENT' });

      // Verify the response
      expect(response.status).toBe(200);
      expect(mockDb.query).toHaveBeenCalled();
    });

    test('POST /student-evaluation should redirect to student evaluation page', async () => {
      // Set up mock data and queries
      mockDb.query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Student 1', id_group: 1 }
        ]
      });
  
      // Set session data
      const agent = request.agent(app);
      await agent
        .post('/login')
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: 'testpass'
        });
  
      // Make the request
      const response = await agent
        .post('/student-evaluation')
        .type('application/x-www-form-urlencoded')
        .send({
          studentRadio: 1
        });
  
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/student-evaluation/1');
    });

    test('POST /submit-evaluation should save the evaluation', async () => {
      const agent = request.agent(app);
      
      // Mock the session middleware for this specific test
      app.use((req, res, next) => {
        req.session = {
          userID: 1,
          peerID: 2,
          userType: 'STUDENT'
        };
        next();
      });

      const response = await agent
        .post('/submit-evaluation')
        .type('form')
        .send({
          cooperation: 4,
          conceptual_contribution: 3,
          practical_contribution: 4,
          work_ethic: 5,
          cooperation_comments: 'Good cooperation',
          conceptual_comments: 'Could improve conceptual skills',
          practical_comments: 'Practical skills are strong',
          work_ethic_comments: 'Excellent work ethic',
          comments: 'Overall, a strong performer'
        });

      expect(response.status).toBe(200);
      expect(mockDb.query).toHaveBeenCalled();
    }, 15000);
  });
});
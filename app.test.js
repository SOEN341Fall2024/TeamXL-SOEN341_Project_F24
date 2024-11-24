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
  afterAll((done) => {
    app.close(() => {
      done();
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

      expect(response.status).toBe(200);
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
      // Set up mock data and queries
      mockDb.query.mockResolvedValueOnce({
        rows: [
          { id: 1, name: 'Student 1' },
          { id: 2, name: 'Student 2' },
          { id: 3, name: 'Student 3' }
        ]
      });
      mockDb.query.mockResolvedValueOnce({
        rows: [
          { id_group: 1, group_name: 'Group 1' }
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
      const response = await agent.get('/peer-assessment');
    
      // Check the response
      expect(response.status).toBe(200);
      expect(response.text).toContain('Peer Assessment');
      expect(response.text).toContain('Student 1');
      expect(response.text).toContain('Student 2');
      expect(response.text).toContain('Student 3');
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
      // Set session data
      const agent = request.agent(app);
      await agent
        .post('/login')
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: 'testpass'
        });
  
      // Set session variables
      agent.session.userID = 1;
      agent.session.peerID = 2;
  
      // Make the request
      const response = await agent
        .post('/submit-evaluation')
        .type('application/x-www-form-urlencoded')
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
      expect(response.text).toContain('Evaluation Submitted');
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO evaluation (id_evaluator, id_evaluatee, cooperation, conceptual_contribution, practical_contribution, work_ethic, comments) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [1, 2, 4, 3, 4, 5, expect.any(String)]
      );
    },100000);
  });

});
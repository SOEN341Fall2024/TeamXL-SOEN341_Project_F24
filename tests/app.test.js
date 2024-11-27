import app from "../app.js"; // Import your app (make sure app.js exports the app instance)
import request from 'supertest';
const request = require("supertest");
import dotenv from "dotenv";
dotenv.config();

jest.mock("pg", () => {
  return {
    Client: jest.fn().mockImplementation(() => {
      return {
        connect: jest.fn(),
        end: jest.fn(),
      };
    }),
  };
});

// App test for home page
describe("Tests for home page", () => {
  // Test the HOME route
  it("should respond with the home page on GET /", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("/"); // Adjust based on your actual content
  });
});

// Test the STUDENT DASHBOARD route
describe("Tests for STUDENT DASHBOARD", () => {
  it("should respond with the student dashboard on GET /student-dashboard", async () => {
    const response = await request(app).get("/student-dashboard");
    expect(response.statusCode).toBe(302);
  });
});

// Test the PROFILE page route
describe("Tests for PROFILE page", () => {
  // Test the PROFILE page (requires session)
  it("GET /profile should redirect if user is not logged in", async () => {
    const response = await request(app).get("/profile");
    expect(response.status).toBe(302); // Should redirect to login
    expect(response.headers.location).toBe("/login");
  });
});

// Test the LOGOUT route
describe("Tests for LOGOUT", () => {
  it("should redirect to home on GET /logout", async () => {
    const response = await request(app).get("/logout");
    expect(response.statusCode).toBe(302); // Redirect status
    expect(response.header.location).toBe("/"); // Ensure redirection is to home
  });
});

//Test for Login
describe("Test for Login", () => {
  it("should render the login page with ajax = false for regular request", async () => {
    // Send a regular GET request to /login
    const response = await request(app).get("/login");

    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);

    // Check if the rendered HTML contains the expected value (this assumes the login.ejs is rendered with the ajax variable)
    expect(response.text).toContain("ajax: false");
  });

  it("should render the login page with ajax = true for AJAX request", async () => {
    // Send an AJAX request (with the x-requested-with header)
    const response = await request(app)
      .get("/login")
      .set("X-Requested-With", "XMLHttpRequest");

    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);

    // Check if the rendered HTML contains the expected value for the ajax status
    expect(response.text).toContain("ajax: true");
  });
});

//Test for register
describe("Test for register", () => {
  it("should render the register page with ajax = true for AJAX request", async () => {
    // Send an AJAX request (with the x-requested-with header)
    const response = await request(app)
      .get("/register")
      .set("X-Requested-With", "XMLHttpRequest");

    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);

    // Check if the rendered HTML contains the expected value for the ajax status
    expect(response.text).toContain("ajax: true");
  });

  it("should render the register page with ajax = false for non-AJAX request", async () => {
    // Send a regular (non-AJAX) request
    const response = await request(app).get("/register");

    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);

    // Check if the rendered HTML contains the expected value for the ajax status
    expect(response.text).toContain("ajax: false");
  });
});

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
            password: process.env.PW1,
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
          password: process.env.PW2,
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
          password: process.env.PW1,
          origin: 'STUDENT'
        }]
      });

      const response = await request(app)
        .post('/login')
        .type('application/x-www-form-urlencoded')
        .send({
          username: 'testuser',
          password: process.env.PW2
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
            password: process.env.PW1,
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
          password: process.env.PW2
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
          password: process.env.PW2
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

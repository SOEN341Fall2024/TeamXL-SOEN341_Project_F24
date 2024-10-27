import request from 'supertest';
import app from '../app'; // Adjust the path if `app.js` is in a different directory

describe('Integration tests for Student Evaluation App', () => {

  // Test the GET route for the home page
  describe('GET /', () => {
    it('should render the home page', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Welcome to InsightSphere'); // Adjust based on home.ejs content
    });
  });

  // Test the GET route for the login page
  describe('GET /login', () => {
    it('should render the login page', async () => {
      const response = await request(app).get('/login');
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Welcome back, please log in'); // Adjust based on login.ejs content
    });
  });

  // Test the POST route for login
  describe('POST /login', () => {
    it('should log in successfully with valid credentials', async () => {
      const response = await request(app).post('/login').send({
        username: 'validUser', // Replace with a valid user from your DB
        password: 'validPassword', // Replace with the correct password
      });
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Student Dashboard'); // Adjust based on student-dashboard.ejs or instructor-dashboard.ejs content
    });

    it('should show an error on invalid login credentials', async () => {
      const response = await request(app).post('/login').send({
        username: 'nonExistentUser',
        password: 'wrongPassword',
      });
      expect(response.statusCode).toBe(200); // It renders an error page instead of redirecting
      expect(response.text).toContain('Incorrect password or username'); // Match content from incorrect-pw-un.ejs
    });
  });

  // Test the GET route for the register page
  describe('GET /register', () => {
    it('should render the register page', async () => {
      const response = await request(app).get('/register');
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('please register to get started'); // Adjust based on register.ejs content
    });
  });

  // Test the POST route for register
  describe('POST /register', () => {
    it('should register successfully with a unique username', async () => {
      const response = await request(app).post('/register').send({
        username: 'uniqueUser123', // Ensure this username is unique
        password: 'uniquePassword!',
        role: 'student',
      });
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Registered successfully'); // Adjust based on registered-now-login.ejs content
    });

    it('should show an error if username already exists', async () => {
      const response = await request(app).post('/register').send({
        username: 'existingUser', // Use an existing username in your DB
        password: 'password123',
        role: 'student',
      });
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Username already exists'); // Match content from username-exists-login.ejs
    });
  });

  // Test the GET route for /student-evaluation/:id
  describe('GET /student-evaluation/:id', () => {
    it('should render the student evaluation page for a valid student ID', async () => {
      const response = await request(app).get('/student-evaluation/1'); // Replace `1` with a valid student ID
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Student Peer Evaluation'); // Adjust based on student-evaluation.ejs content
    });

    it('should return a 500 error if student ID is invalid', async () => {
      const response = await request(app).get('/student-evaluation/9999'); // Replace `9999` with a non-existent ID
      expect(response.statusCode).toBe(500);
    });
  });

  // Test the POST route for submitting peer evaluations
  describe('POST /submit-evaluation', () => {
    it('should submit evaluation successfully with complete data', async () => {
      const response = await request(app).post('/submit-evaluation').send({
        cooperation: 4,
        conceptual_contribution: 5,
        practical_contribution: 3,
        work_ethic: 4,
        comments: 'Great teamwork!',
      });
      expect(response.statusCode).toBe(200);
      expect(response.text).toContain('Evaluation submitted successfully'); // Adjust based on your confirmation page content
    });

    it('should return an error if any required fields are missing', async () => {
      const response = await request(app).post('/submit-evaluation').send({
        cooperation: 5,
        conceptual_contribution: 4,
        // Missing practical_contribution and work_ethic
      });
      expect(response.statusCode).toBe(400); // Adjust based on your validation status code
      expect(response.text).toContain('All fields are required.'); // Adjust based on actual error message
    });
  });
});

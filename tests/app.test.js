import request from 'supertest';
import { expect } from 'chai';
import app from '../app';  // Adjust the path if needed

// Helper function to generate random email
const getRandomEmail = () => `user${Math.floor(Math.random() * 1000)}@test.com`;

// Test Suite for Registration and Login
describe('User Authentication', () => {
  // Test registration route
  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: getRandomEmail(),
          password: 'testpassword',
          role: 'student'
        });
      
      expect(response.statusCode).to.equal(200);
      expect(response.text).to.include('Registered successfully');  // Adjust based on expected page content
    });

    it('should fail if username already exists', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          username: 'existingUser',  // Replace with an actual user in your DB for testing
          password: 'password123',
          role: 'student'
        });
      
      expect(response.statusCode).to.equal(200);
      expect(response.text).to.include('Username already exists');
    });
  });

  // Test login route
  describe('POST /login', () => {
    it('should log in successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'validUser',  // Replace with valid user credentials
          password: 'validPassword'
        });
      
      expect(response.statusCode).to.equal(200);
      expect(response.text).to.include('Dashboard');  // Adjust based on dashboard view content
    });

    it('should show error with invalid credentials', async () => {
      const response = await request(app)
        .post('/login')
        .send({
          username: 'invalidUser',
          password: 'wrongPassword'
        });
      
      expect(response.statusCode).to.equal(200);
      expect(response.text).to.include('Incorrect password or username');
    });
  });
});

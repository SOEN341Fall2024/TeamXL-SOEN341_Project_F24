
import app from './app.js'; // Import your app (make sure app.js exports the app instance)

const request = require('supertest');


// App test for student
describe('Express App Tests for student', () => {

      // Test the HOME route
  it('should respond with the home page on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain(''); // Adjust based on your actual content
  });

   // Test the STUDENT DASHBOARD route
   it('should respond with the student dashboard on GET /student-dashboard', async () => {
    const response = await request(app).get('/student-dashboard');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain('Student Dashboard'); // Adjust based on your actual content
  });

  // Test the PROFILE page (requires session)
  it('GET /profile should redirect if user is not logged in', async () => {
    const response = await request(app).get('/profile');
    expect(response.status).toBe(302); // Should redirect to login
    expect(response.headers.location).toBe('/login');
  });


  // Test the LOGOUT route
  it('should redirect to home on GET /logout', async () => {
    const response = await request(app).get('/logout');
    expect(response.statusCode).toBe(302); // Redirect status
    expect(response.header.location).toBe('/'); // Ensure redirection is to home
  });  
  
});


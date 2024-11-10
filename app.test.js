
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

});


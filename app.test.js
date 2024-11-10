
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

describe('GET /login', () => {
  
    it('should render the login page with ajax = false for regular request', async () => {
      // Send a regular GET request to /login
      const response = await request(app).get('/login');
  
      // Check that the response status is 200 (OK)
      expect(response.status).toBe(200);
  
      // Check if the rendered HTML contains the expected value (this assumes the login.ejs is rendered with the ajax variable)
      expect(response.text).toContain('ajax: false');
    });
  
    it('should render the login page with ajax = true for AJAX request', async () => {
        // Send an AJAX request (with the x-requested-with header)
        const response = await request(app)
          .get('/login')
          .set('X-Requested-With', 'XMLHttpRequest');
      
        // Check that the response status is 200 (OK)
        expect(response.status).toBe(200);
      
        // Check if the rendered HTML contains the expected value for the ajax status
        expect(response.text).toContain('ajax: true');
      });
      
  
  });

  describe('GET /register', () => {
  it('should render the register page with ajax = true for AJAX request', async () => {
    // Send an AJAX request (with the x-requested-with header)
    const response = await request(app)
      .get('/register')
      .set('X-Requested-With', 'XMLHttpRequest');
  
    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);
  
    // Check if the rendered HTML contains the expected value for the ajax status
    expect(response.text).toContain('ajax: true');
  });
  
  
  it('should render the register page with ajax = false for non-AJAX request', async () => {
    // Send a regular (non-AJAX) request
    const response = await request(app).get('/register');
  
    // Check that the response status is 200 (OK)
    expect(response.status).toBe(200);
  
    // Check if the rendered HTML contains the expected value for the ajax status
    expect(response.text).toContain('ajax: false');
  });


});
/*
// App test for instructor
describe('GET /instructor-dashboard', () => {
    it('should return 400 if instructorUsername is not provided', async () => {
      const response = await request(app).get('/instructor-dashboard');
      expect(response.status).toBe(400);
      expect(response.text).toBe('Instructor username is required.');
    });


    it('should render the instructor dashboard with valid instructorUsername', async () => {
        const instructorUsername = 'testInstructor';
        const response = await request(app).get(`/instructor-dashboard?instructorUsername=${instructorUsername}`);
        expect(response.status).toBe(200);
        expect(response.text).toContain(instructorUsername); // Check if the username is rendered in the page
      });

    it('should return 500 if there is an internal error while rendering the instructor dashboard', async () => {
       // Simulate a server-side error, for example, by mocking the rendering function
        const mockRender = jest.spyOn(app, 'render').mockImplementationOnce(() => {
        throw new Error('Mock rendering error');
        });
    
        const response = await request(app).get('/instructor-dashboard?instructorUsername=testInstructor');
        expect(response.status).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    
        mockRender.mockRestore(); // Restore the original implementation
      });

});
*/

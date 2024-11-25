import app from "./app.js"; // Import your app (make sure app.js exports the app instance)

const request = require("supertest");

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

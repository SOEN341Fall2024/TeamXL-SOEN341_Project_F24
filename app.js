// Import necessary modules: Express for handling HTTP requests, body-parser for parsing request bodies, pg for PostgreSQL interaction, and bcrypt for password hashing
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

// Create an instance of an Express application, specify port for the server to listen on, define the number of rounds for bcrypt hashing
const app = express();
const port = 3000;
const saltRounds = 10;

// Middleware to parse URL-encoded bodies (from forms)
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Create a new PostgreSQL client for database connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "SOEN341test",
  password: "abcd1234",
  port: 5432,
});
db.connect();

// Route for the home page, render the home.ejs view
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Route for the login page, render the unified login.ejs view
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Route for the register page, render the register.ejs view
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Route to handle unified login (for both students and instructors)
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password; // We're not validating passwords at the moment
  const role = req.body.role; // Retrieve the selected role from the form

  // Redirect the user to their respective dashboard
  if (role === "student") {
    res.redirect(`/student-dashboard?username=${encodeURIComponent(username)}`);
  } else if (role === "instructor") {
    res.redirect(`/instructor-dashboard?username=${encodeURIComponent(username)}`);
  } else {
    res.render("login.ejs", { errorMessage: "Invalid role selected." });
  }
});

// Route to handle unified login (for both students and instructors)
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role; // Retrieve the selected role from the form

  // Directly check the role and redirect accordingly
  if (role === "student") {
    res.redirect(`/student-dashboard?username=${encodeURIComponent(username)}`);
  } else if (role === "instructor") {
    res.redirect(`/instructor-dashboard?username=${encodeURIComponent(username)}`);
  } else {
    res.render("login.ejs", { errorMessage: "Invalid role selected." });
  }
});


// Route for the student dashboard
app.get("/student-dashboard", (req, res) => {
  const username = req.query.username; // Get the username from the query parameter
  res.render("student-dashboard.ejs", { username });
});

// Route for the instructor dashboard
app.get("/instructor-dashboard", (req, res) => {
  const username = req.query.username; // Get the username from the query parameter
  res.render("instructor-dashboard.ejs", { username });
});

// Route for creating teams
app.get('/create-teams', (req, res) => {
  res.render("create-teams.ejs");
});

// Route to handle saving the team
app.post('/save-team', (req, res) => {
  const { teamName, teamSize, members } = req.body;

  // Here, you can save the team information to your database
  console.log(`Team Name: ${teamName}`);
  console.log(`Team Size: ${teamSize}`);
  console.log(`Members: ${members}`);

  // Redirect back to the instructor dashboard with a success message
  res.redirect('/instructor-dashboard');
});


// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

app.get('/login', (req, res) => {
  res.render('login');
});


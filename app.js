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
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

// Route for the home page, render the home.ejs view
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Route for the login page, render the login.ejs view
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

// Route for the register page, render the register.ejs view
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

// Route for the student dashboard page, render the student_dashboard view
app.get("/student_dashboard", (req, res) => {
  res.render("student_dashboard.ejs");
});

// Route for the instructor dashboard page, render the student_dashboard view
app.get("/instructor_dashboard", (req, res) => {
  res.render("instructor_dashboard.ejs");
});

// Route to handle user registration
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  try {
    const checkResult = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (checkResult.rows.length > 0) {
      res.render("username-exists-login.ejs");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          await db.query(
            "INSERT INTO users (username, password, userType) VALUES ($1, $2, $3)",
            [username, hash, role]
          );
          res.render("registered-now-login.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Route to handle user login
app.post("/login", async (req, res) => {
  const username = req.body.username.toLowerCase(); // Convert to lowercase to handle case-insensitivity
  const loginPassword = req.body.password;

  try {
    // Fetch the user from the database with a case-insensitive query
    const result = await db.query(
      "SELECT * FROM users WHERE LOWER(username) = $1",
      [username]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Debugging: Log the result
      console.log("User found:", user);

      // Compare the password with the hashed password stored in the database
      bcrypt.compare(loginPassword, user.password, (err, match) => {
        if (match) {
          // Check if the user is an instructor or student
          if (user.usertype === "instructor") {
            res.render("instructor-dashboard.ejs"); // Render instructor dashboard
          } else {
            res.render("student-dashboard.ejs"); // Render student dashboard
          }
        } else {
          res.render("incorrect-pw-un.ejs");
        }
      });
    } else {
      res.render("incorrect-pw-un.ejs");
    }
  } catch (err) {
    console.log("Error during login query:", err); // Log any query errors for debugging
    res.send("An error occurred during login.");
  }
});

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

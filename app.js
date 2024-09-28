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

// Route for the student dashboard page, render the student-dashboard view
app.get("/student-dashboard", (req, res) => {
  res.render("student-dashboard.ejs");
});

// Route for the instructor dashboard page
app.get("/instructor-dashboard", async (req, res) => {
  const instructorUsername = req.query.instructorUsername; // Get instructor username from query params

  // Make sure to handle the case where instructorUsername is undefined
  if (!instructorUsername) {
    return res.status(400).send("Instructor username is required.");
  }

  try {
    // Render the instructor-dashboard view, passing the instructor username
    res.render("instructor-dashboard.ejs", {
      instructorUsername: instructorUsername,
    });
  } catch (error) {
    console.error("Error rendering instructor dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to handle user registration
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  try {
    const checkResult = await db.query(
      `SELECT * FROM ${role} WHERE name = $1`,
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
            `INSERT INTO ${role} (name, password) VALUES ($1, $2)`,
            [username, hash]
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
    const result = await db.query(
      `SELECT NAME,password FROM INSTRUCTOR UNION SELECT NAME,password FROM STUDENT WHERE NAME = '${username}' ;`);
    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Debugging: Log the result
      console.log("User found:", user);

      // Compare the password with the hashed password stored in the database
      bcrypt.compare(loginPassword, user.password, (err, match) => {
        if (match) {
          // Check if the user is an instructor or student
          if (user.usertype === "instructor") {
            // Redirect to the instructor dashboard with the username
            res.redirect(
              `/instructor-dashboard?instructorUsername=${username}`
            );
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
    console.log("Error during login query:", err);
    res.send("An error occurred during login.");
  }
});

//TEAM MANAGEMENT ROUTES :

// Route to render the create teams page
app.get("/create-team", async (req, res) => {
  const instructorUsername = req.query.instructorUsername; // Get instructor username from query params
  try {
    // Get students from the users table where usertype is 'student'
    const result = await db.query(
      "SELECT username FROM users WHERE usertype = $1",
      ["student"]
    );
    const students = result.rows;

    // Render the create-teams view, passing the instructor username and students
    res.render("create-teams", {
      instructorUsername: instructorUsername, // Pass the instructor username (used to access the instructor who created teams for displaying)
      students: students,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

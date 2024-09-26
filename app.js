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
  user: "postgres",//process.env.DB_USER,
  host: "localhost",//process.env.DB_HOST,
  database: "SOEN341",//process.env.DB_NAME,
  password: "postgres",//process.env.DB_PASSWORD,
  port: 5432//process.env.DB_PORT,
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

app.get("/instructor-dashboard", (req, res) => {
  res.render("instuctor-dashboard.ejs");
});

app.get("/createTeams", (req, res) => {
  res.render("createTeams.ejs");
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
      res.send("Username already exists. Try logging in.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          await db.query(
            "INSERT INTO users (username, password, userType) VALUES ($1, $2, $3)",
            [username, hash, role]
          );
          res.send("Registration successful!");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// Route to handle user login
app.post("/login", async (req, res) => {
  const username = req.body.username;
  const loginPassword = req.body.password;

  try {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      bcrypt.compare(loginPassword, user.password, (err, match) => {
        if (match) {
          res.send("Login successful!");
        } else {
          res.send("Incorrect password.");
        }
      });
    } else {
      res.send("User not found.");
    }
  } catch (err) {
    console.log(err);
  }
});

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

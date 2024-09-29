// Import necessary modules: Express for handling HTTP requests, body-parser for parsing request bodies, pg for PostgreSQL interaction, and bcrypt for password hashing
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import session from express-session;

dotenv.config();

// Create an instance of an Express application, specify port for the server to listen on, define the number of rounds for bcrypt hashing
const app = express();
const port = 3000;
const saltRounds = 10;

// Middleware to parse URL-encoded bodies (from forms)
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({ secret: "key" }));

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

app.get("/instructor-dashboard", (req, res) => {
  res.render("instructor-dashboard.ejs");
});

app.get("/create-teams", async (req, res) => {
  try{
    const RESULT = await db.query("SELECT * FROM student WHERE id_teacher = $1", 
      [req.session.userID]
    );

    res.render("create-teams.ejs", {
      StudentArr : RESULT
    });
  } catch(err){
    console.log(err);
  }
});

app.get("/view-teams", async (req, res) => {

  if(req.session.userType == "instructor"){
    const RESULT = await db.query("SELECT * FROM groups");

  } else if (req.session.userType == "student") {
    try{
      const groupID = await db.query("SELECT id_group FROM student WHERE id = $1"
        [req.session.userID]
      );

      const studentArr = await db.query("SELECT name FROM student WHERE id = $1",
        [groupID]
      );

      const groupName = await db.query("SELECT group_name FROM groups WHERE id_group = $1",
        [groupID]
      );

   } catch(err){
    console.log(err);
   }

  } else {
    res.redirect("/");
  }
  
});

app.get("/logout", (req, res) => {
  delete req.session.userID;
  delete req.session.userType;
  res.redirect("/");
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

          req.session.userID =  user.id;
          req.session.userType = user.type;

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

app.post("/create-teams", async (req, res) => {
  
});

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

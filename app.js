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
    const DATA = await db.query("SELECT name, id, group_name FROM student, groups "
                              + "WHERE student.id_group = groups.id_group ORDER BY id_group ASC");

    res.render("view-teams-instructor.ejs", {
      Teams : DATA
    });

  } else if (req.session.userType == "student") {
    try{

      const groupID = await db.query("SELECT id_group FROM student WHERE id = $1",
        [req.session.userID]
      )

      const DATA = await db.query("SELECT group_name, name FROM student, groups "
                                + "WHERE student.id_group = $1 AND student.id_group = groups.id_group",
        [groupID]
      );

      res.render("view-team-student.ejs", {
        Team : DATA
      });

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
  const username = req.body.username.toLowerCase(); // Convert to lowercase to handle case-insensitivity
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

// Route to handle user login Jonathan
app.post("/login", async (req, res) => {
  const username = req.body.username.toLowerCase(); // Convert to lowercase to handle case-insensitivity
  const loginPassword = req.body.password;

  try {
    const result = await db.query(`SELECT NAME,password,'INSTRUCTOR' AS origin FROM INSTRUCTOR WHERE NAME = '${username}' UNION SELECT NAME,password,'STUDENT' AS origin FROM STUDENT WHERE NAME = '${username}' ;`);
    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Debugging: Log the result
      console.log("User found:", user);

      // Compare the password with the hashed password stored in the database
      bcrypt.compare(loginPassword, user.password, (err, match) => {
        if (match) {
          // Check if the user is an instructor or student
          if (user.origin === "instructor") {
            // Redirect to the instructor dashboard with the username
            res.redirect(
              `/instructor-dashboard?instructorUsername=${username}`
            );
          } else {
            res.render("student-dashboard.ejs"); // Render student dashboard
          }

          req.session.userID =  user.id;
          req.session.userType = user.usertype;
          
        } else {
          res.render("incorrect-pw-un.ejs");
        }
      });
    } else {
      res.render("incorrect-pw-un.ejs");
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/create-teams", async (req, res) => {
  const IDs = req.body.studentIDs;
  const TEAMNAME = req.body.teamname;
  
  try{
      await db.query("INSERT INTO groups (group_name) VALUES ($1)",
        [TEAMNAME]
      );
        // ?? could simplify this condition code
      if(Array.isArray(IDs)){
        for(var i = 0; i < IDs.length; i++){
          await db.query("UPDATE student SET id_group = $1 WHERE id = $2",
            [TEAMNAME, IDs[i]]
          );
        }
      } else {
        await db.query("UPDATE student SET id_group = $1 WHERE id = $2",
          [TEAMNAME, IDs]
        );
      }

    } catch(err){
      console.log(err);
  }
});

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

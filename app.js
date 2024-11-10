// Import necessary modules: Express for handling HTTP requests,body-parser for parsing request bodies,
//pg for PostgreSQL interaction, and bcrypt for password hashing
import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import session from "express-session";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai"; 
import { group } from "console";
import {
  getCooperation,
  getConceptual,
  getPractical,
  getWorkEthic,
  getPeers,
  getAverage,
  getTeammateInfo,
  getCommentMadeByStudent,
  getGradesGivenByStudent,
  getNumberOfReviews,
  getNumberOfTeammates,
  getComments,
  getCommentsObj,
  stringprint,
} from "./helper.js";

dotenv.config();

// Create an instance of an Express application, specify port for
//the server to listen on, define the number of rounds for bcrypt hashing
const app = express();
const port = 3000;
const saltRounds = 10;


app.use(express.json()); 

// Middleware to parse URL-encoded bodies (from forms)
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({ secret: "key", resave: false, saveUninitialized: true }));

// Setup for file uploads (Multer)
const upload = multer({ dest: "uploads/" }); // Files will be uploaded to the 'uploads' directory

// Create a new PostgreSQL client for database connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

//--------GET REQUESTS TO ROUTE TO ALL WEBPAGES OF THE WEBSITE--------//

// Route for the HOME PAGE, render the home.ejs view
app.get("/", (req, res) => {
  res.render("home.ejs");
});

// Route for the LOGIN PAGE, render the login.ejs view
app.get("/login", (req, res) => {
  // Check if the request is an AJAX request
  const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
  
  // Render the login view, passing in the `ajax` variable
  res.render("login", { ajax: isAjax });
});


// Route for the REGISTER PAGE, render the register.ejs view
app.get("/register", (req, res) => {
  // Check if the request is an AJAX request
  const isAjax = req.xhr || req.headers['x-requested-with'] === 'XMLHttpRequest';
  
  // Render the register view, passing in the `ajax` variable
  res.render("register", { ajax: isAjax });
});


// Route for the STUDENT DASHBOARD page, render the student-dashboard view
app.get("/student-dashboard", (req, res) => {
  res.render("student-dashboard.ejs");
});

// Route for the INSTRUCTOR DASHBOARD page
app.get("/instructor-dashboard", async (req, res) => {
  const instructorUsername = req.query.instructorUsername; // Get instructor username from query params

  if (!instructorUsername) {
    return res.status(400).send("Instructor username is required."); // Make sure to handle the case where instructorUsername is undefined
  }

  try {
    res.render("instructor-dashboard.ejs", {
      instructorUsername: instructorUsername, // Render the instructor-dashboard view, passing the instructor username
    });
  } catch (error) {
    console.error("Error rendering instructor dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for the CREATE TEAMS page
app.get("/create-teams", async (req, res) => {
  try {
    const RESULT = await db.query(
      "SELECT * FROM student WHERE id_group is NULL"
    );

    res.render("create-teams.ejs", {
      StudentArr: RESULT,
    });
  } catch (err) {
    console.log(err);
  }
});

// Route for the VIEW TEAMS page

app.get("/view-teams", async (req, res) => {
  console.log(req.session.userType);
  if (req.session.userType == "INSTRUCTOR") {
    try {
      const DATA = await db.query(
        "SELECT name, id, group_name FROM student, groups WHERE student.id_group = groups.id_group ORDER BY student.id_group ASC"
      );

      res.render("view-teams-instructor.ejs", {
        Teams: DATA,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/");
    }
  } else if (req.session.userType == "STUDENT") {
    try {
      const groupID_QUERY = await db.query(
        "SELECT id_group FROM student WHERE id = $1",
        [req.session.userID]
      );

      const groupID = groupID_QUERY.rows[0].id_group;

      const DATA = await db.query(
        "SELECT group_name, name, id FROM student, groups WHERE student.id_group = $1 AND student.id_group = groups.id_group",
        [groupID]
      );

      res.render("view-team-student.ejs", {
        groupName: DATA.rows[0].group_name,
        members: DATA.rows,
      });
    } catch (err) {
      console.log(err);
    }
  } else {
    res.redirect("/");
  }
});

//Route for EDIT TEAMS page
app.get("/edit-team", (req, res) => {
  res.render("edit-team.ejs");
});

// Route for the PROFILE page
app.get("/profile", (req, res) => {
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;

  if (userType) {
    res.render("profile.ejs", {
      userType,
      instructorUsername,
    });
  } else {
    res.redirect("/login");
  }
});

// Route for the PEER ASSESSMENT page
app.get("/peer-assessment", async (req, res) => {
  const query = req.query.query ? req.query.query.toLowerCase() : "";
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;

  try {
    if (userType) {
      const r_temp = await db.query(
        "SELECT id_group FROM student WHERE id = $1",
        [req.session.userID]
      );
      const groupID = r_temp.rows[0].id_group;
      const result = await db.query(
        "SELECT * FROM student WHERE LOWER(name) LIKE $1 AND id != $2 AND id_group = $3",
        [`%${query}%`, req.session.userID, groupID]
      );
      res.render("peer-assessment.ejs", {
        query,
        studentsList: result.rows, // Matching students
        userType,
        instructorUsername,
        peers: result.rows, // Same as studentsList for clarity
      });
    } else {
      res.redirect("/student-dashboard");
      console.log("error");
    }
  } catch (error) {
    console.error("Error during peer assessment search:", error);
    res.status(500).send("Server Error");
  }
});

//function to fetch student by ID
async function getStudentById(studentId) {
  try {
    const result = await db.query("SELECT * FROM STUDENT WHERE ID = $1", [
      studentId,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
}

// Route for the STUDENT EVALUATION page, render the student-evaluation.ejs view
app.get("/student-evaluation/:id", async (req, res) => {
  const studentId = (req.session.peerID = req.params.id);
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
  try {
    const student = await getStudentById(studentId);
    res.render("student-evaluation.ejs", {
      student,
      userType,
      instructorUsername,
    });
  } catch (error) {
    console.error("Error fetching student for evaluation:", error);
    res.status(500).send("Server Error");
  }
});

//Route for the VIEW-REVIEWS page
app.get("/view-reviews", async (req, res) => {
  const RESULT = await db.query(
    "SELECT * FROM evaluation WHERE id_evaluatee = $1",
    [req.session.userID]
  );

  res.render("view-reviews.ejs", {
    reviews: RESULT.rows,
    stringprint,
  });
});

app.get("/cancel-review", async (req, res) => {
  await db.query(
    "DELETE FROM evaluation WHERE id_evaluator = $1 AND id_evaluatee = $2",
    [req.session.userID, req.session.peerID]
  );

  delete req.session.peerID;

  res.redirect("/student-dashboard");
});

app.get("/edit-evaluation", async (req, res) => {
  const studentId = req.params.id;
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;

  try {
    const answers = await db.query(
      "SELECT cooperation, conceptual_contribution, practical_contribution, work_ethic, comments FROM EVALUATION WHERE" +
        " ID_EVALUATOR = $1 AND " +
        " ID_EVALUATEE = $2; ",
      [req.session.userID, req.session.peerID]
    );

    const student = await getStudentById(studentId);

    res.render("edit-evaluation.ejs", {
      student,
      userType,
      instructorUsername,
      cooperationValue: answers.rows[0].cooperation,
      conceptualContributionValue: answers.rows[0].conceptual_contribution,
      practical_contributionValue: answers.rows[0].practical_contribution,
      work_ethicValue: answers.rows[0].work_ethic,
      commentsValue: answers.rows[0].comments,
    });
  } catch (error) {
    console.error("Error fetching student for evaluation:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/view-reviews-summary", async (req, res) => {
  const result1 = await db.query(
    "SELECT * FROM evaluation RIGHT JOIN student ON id_evaluatee = id ORDER BY id_group, id ASC"
  );
  const result2 = await db.query(
    "SELECT group_name, id_group FROM groups ORDER BY id_group ASC"
  );
  const student_info = result1.rows;
  const groups = result2.rows;

  res.render("view-reviews-summary.ejs", {
    getCooperation,
    getConceptual,
    getPractical,
    getWorkEthic,
    getPeers,
    getAverage,
    student_info,
    groups,
  });
});

app.get("/view-reviews-detailed", async (req, res) => {
  const result1 = await db.query(
    "SELECT * FROM evaluation RIGHT JOIN student ON id_evaluatee = id ORDER BY id_group, id ASC"
  );
  const result2 = await db.query(
    "SELECT group_name, id_group FROM groups ORDER BY id_group ASC"
  );
  const result3 = await db.query(
    "SELECT id, id_group, name FROM student ORDER BY id_group, id ASC"
  );
  const student_info = result1.rows;
  const groups = result2.rows;
  const sorted_students = result3.rows;

  res.render("view-reviews-detailed.ejs", {
    getTeammateInfo,
    getCommentMadeByStudent,
    getGradesGivenByStudent,
    student_info,
    groups,
    sorted_students,
  });
});

app.get("/view-review-completion", async (req, res) => {
  const result1 = await db.query(
    "SELECT * FROM evaluation RIGHT JOIN student ON id_evaluatee = id ORDER BY id_group, id ASC"
  );
  const result2 = await db.query(
    "SELECT group_name, id_group FROM groups ORDER BY id_group ASC"
  );
  const result3 = await db.query(
    "SELECT id, id_group FROM student ORDER BY id_group, id ASC"
  );
  const student_info = result1.rows;
  const groups = result2.rows;
  const sorted_students = result3.rows;

  res.render("view-review-completion.ejs", {
    getNumberOfTeammates,
    getNumberOfReviews,
    student_info,
    groups,
    sorted_students,
  });
});

//Route to LOGOUT
app.get("/logout", (req, res) => {
  delete req.session.userID;
  delete req.session.userType;
  res.redirect("/");
});


app.post("/send-message", async (req, res) => {

  const genAI = new GoogleGenerativeAI(process.env.Gemini_API_key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(req.body.message);
   console.log(result.response.text());

});
//----POST REQUESTS FOR ALL THE WEBPAGES ----//

// Route to handle user REGISTRATION
app.post("/register", async (req, res) => {
  const username = req.body.username.toLowerCase(); // Convert to lowercase to handle case-insensitivity
  const password = req.body.password;
  const role = req.body.role;
  const course_name = req.body.course_name;

  try {
    const checkResult = await db.query(
      `SELECT * FROM ${role} WHERE name = $1`,
      [username]
    );

    if (checkResult.rows.length > 0) {
      // Check if request is AJAX and render accordingly
      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        res.render("username-exists-login.ejs", { ajax: true });
      } else {
        res.render("username-exists-login.ejs");
      }
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          await db.query(
            `INSERT INTO ${role} (name, password) VALUES ($1, $2)`,
            [username, hash]
          );

          // Check if request is AJAX and render accordingly
          if (req.headers["x-requested-with"] === "XMLHttpRequest") {
            res.render("registered-now-login.ejs", { ajax: true });
          } else {
            res.render("registered-now-login.ejs");
          }
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});


// Route to handle user LOGIN
app.post("/login", async (req, res) => {
  const username = req.body.username.toLowerCase(); // Convert to lowercase to handle case-insensitivity
  const loginPassword = req.body.password;

  try {
    const result = await db.query(
      `SELECT NAME,id,password,'INSTRUCTOR' AS origin FROM instructor WHERE NAME = '${username}' UNION SELECT NAME,id,password,'STUDENT' AS origin FROM student WHERE NAME = '${username}' ;`
    );

    req.session.userID = result.rows[0].id;

    if (result.rows.length > 0) {
      const user = result.rows[0];
      req.session.userType = user.origin;

      console.log("User found:", user); // Debugging: Log the result

      bcrypt.compare(loginPassword, user.password, (err, match) => {
        // Compare the password with the hashed password stored in the database
        if (match) {
          // Check if the user is an instructor or student
          if (user.origin === "INSTRUCTOR") {
            // Redirect to the instructor dashboard with the username
            res.render("instructor-dashboard.ejs", {
              instructorUsername: user.name,
              userType: user.origin,
            });
          } else {
            res.render("student-dashboard.ejs", { userType: user.origin }); // Render student dashboard
          }
        } else {
          res.render("incorrect-pw-un.ejs");
        }
      });
    } else {
      res.render("incorrect-pw-un.ejs");
      console.log("incorrect login");
    }
  } catch (err) {
    console.log(err);
    console.log(req.session.userType);
  }
});

// Route to handle CREATE TEAMS form data
app.post("/create-teams", upload.single("csvfile"), async (req, res) => {
  const IDs = req.body.studentIDs;
  const TEAMNAME = req.body.teamname;
  try {
    if (IDs != null && TEAMNAME) {
      await db.query("INSERT INTO groups (group_name) VALUES ($1)", [TEAMNAME]);

      const TEAM_ID_QUERY_RESULT = await db.query(
        "SELECT id_group FROM groups WHERE group_name = $1",
        [TEAMNAME]
      );
      const TEAM_ID = TEAM_ID_QUERY_RESULT.rows[0].id_group;

      if (Array.isArray(IDs)) {
        for (var i = 0; i < IDs.length; i++) {
          await db.query("UPDATE student SET id_group = $1 WHERE id = $2", [
            TEAM_ID,
            IDs[i],
          ]);
        }
      } else {
        await db.query("UPDATE student SET id_group = $1 WHERE id = $2", [
          TEAM_ID,
          IDs,
        ]);
      }
    }
    // If a CSV file is uploaded, process it
    if (req.file) {
      const filePath = req.file.path; // Path to the uploaded file
      const missingStudents = []; // Array to keep track of missing students

      // Parse the CSV file
      fs.createReadStream(filePath)
        .pipe(csv()) // Use csv-parser to read the CSV file
        .on("data", async (row) => {
          const teamNameArray = [row.team_name.trim()];
          const studentNameArray = [row.student_name.trim()]; // Extract and trim student name from the row
          const teamIDarray = [];
          const NameArray = [];
          try {
            // Query to insert group
            for (var i = 0; i < teamNameArray.length; i++) {
              await db.query(
                "INSERT INTO GROUPS(GROUP_NAME) VALUES ($1) ON CONFLICT (GROUP_NAME) DO NOTHING",
                [teamNameArray[i]]
              );
            }

            // Query to find all group ID from group name
            for (var i = 0; i < teamNameArray.length; i++) {
              const result = await db.query(
                "SELECT ID_GROUP FROM GROUPS WHERE GROUP_NAME = $1",
                [teamNameArray[i]]
              );

              // Assuming the result.rows is an array and you're interested in the first row
              if (result.rows.length > 0) {
                teamIDarray[i] = result.rows[0].id_group; // Make sure to access the correct field name
              } else {
                teamIDarray[i] = null; // or handle the case where no group is found
              }
            }

            const password = "!!098764321!!";
            //Query to insert new student or to upadate students
            for (var i = 0; i < studentNameArray.length; i++) {
              await db.query(
                "INSERT INTO student (NAME, PASSWORD, ID_GROUP ) VALUES ($1 , $2 , $3)",
                [studentNameArray[i], password, parseInt(teamIDarray[i])]
              );
            }
          } catch (error) {
            console.error("Error processing student", error);
          }
        })
        .on("end", () => {
          console.log("CSV file successfully processed");

          // Optionally, delete the uploaded file after processing
          fs.unlinkSync(filePath);
        });
    }

    // Redirect or send a success response
    res.redirect("/view-teams");
  } catch (err) {
    console.log(err);
    // Optionally handle the error response
    res.status(500).send("An error occurred while creating teams.");
  }
});

// Route to handle PEER_ASSESSMENTS (SELECTED PEER) data
app.post("/student-evaluation", async (req, res) => {
  const studentId = req.body.studentRadio;
  const student = await getStudentById(studentId);

  if (student) {
    res.redirect(`/student-evaluation/${studentId}`);
  } else {
    res.status(404).send("Student not found");
  }
});

//Route to handle the submission of the evaluation
app.post("/submit-evaluation", async (req, res) => {
  var commentsObj = {
    cooperation : "",
    conceptual: "",
    practical: "",
    work_ethic: "",
    comments: "",
  };
  commentsObj.cooperation = req.body.cooperation_comments != "" ? "Cooperation Contribution Comment: <br/>" + req.body.cooperation_comments + "<br/><br/>" : "";
  commentsObj.conceptual = req.body.conceptual_comments != "" ? "Conceptual Contribution Comment: <br/>" + req.body.conceptual_comments + "<br/><br/>" : "";
  commentsObj.practical = req.body.practical_comments != "" ? "Practical Contribution Comment: <br/>" + req.body.practical_comments + "<br/><br/>" : "";
  commentsObj.work_ethic = req.body.work_ethic_comments != "" ? "Work Ethic Comment: <br/>" + req.body.work_ethic_comments + "<br/><br/>" : "";
  commentsObj.comments = req.body.comments != "" ? "Additional Comment: <br/>" + req.body.comments + "<br/><br/>" : "";
  await db.query(
    "INSERT INTO evaluation (id_evaluator, id_evaluatee, cooperation, conceptual_contribution, practical_contribution, work_ethic, comments) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [
      req.session.userID,
      req.session.peerID,
      req.body.cooperation,
      req.body.conceptual_contribution,
      req.body.practical_contribution,
      req.body.work_ethic,
      getComments(commentsObj),
    ]
  );

  //The confirm-evaluation route
  res.render("evaluation-confirmation.ejs", {
    cooperation: req.body.cooperation,
    conceptual_contribution: req.body.conceptual_contribution,
    practical_contribution: req.body.practical_contribution,
    work_ethic: req.body.work_ethic,
    commentsObj,
    stringprint,
  });
});

// The edition of an evaluation route ----------------------------------
app.post("/edit-submition", async (req, res) => {
  var commentsObj;
  commentsObj.cooperation = req.body.cooperation_comments != "" ? "Cooperation Contribution Comment: <br/>" + req.body.cooperation_comments + "<br/><br/>" : "";
  commentsObj.conceptual = req.body.conceptual_comments != "" ? "Conceptual Contribution Comment: <br/>" + req.body.conceptual_comments + "<br/><br/>" : "";
  commentsObj.practical = req.body.practical_comments != "" ? "Practical Contribution Comment: <br/>" + req.body.practical_comments + "<br/><br/>" : "";
  commentsObj.work_ethic = req.body.work_ethic_comments != "" ? "Work Ethic Comment: <br/>" + req.body.work_ethic_comments + "<br/><br/>" : "";
  commentsObj.comments = req.body.comments != "" ? "Additional Comment: <br/>" + req.body.comments + "<br/><br/>" : "";

  await db.query(
    "UPDATE evaluation SET cooperation = $3, conceptual_contribution = $4, practical_contribution = $5, work_ethic = $6, comments = $7 WHERE id_evaluator = $1 AND id_evaluatee = $2",
    [
      req.session.userID,
      req.session.peerID,
      req.body.cooperation,
      req.body.conceptual_contribution,
      req.body.practical_contribution,
      req.body.work_ethic,
      getComments(commentsObj),
    ]
  );

  //The /confirm-evaluation route
  res.render("evaluation-confirmation.ejs", {
    cooperation: req.body.cooperation,
    conceptual_contribution: req.body.conceptual_contribution,
    practical_contribution: req.body.practical_contribution,
    work_ethic: req.body.work_ethic,
    commentsObj,
    stringprint,
  });
});

// Route for the STUDENT DASHBOARD page, render the student-dashboard view
app.post("/thank-you", (req, res) => {
  res.render("thank-you.ejs");
});

//--------START EXPRESS SERVER--------//

// Start the Express server. Server listening on port 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`); // Log that the server is running
});

app.use('/uploads', express.static('uploads'));

// Route for the STUDENT CHATROOMS page
app.get("/student-chatrooms", (req, res) => {
  res.render("student-chatrooms.ejs");
});

// Route for the View Review Completion page
app.get("/view-review-completion", (req, res) => {
  res.render("view-review-completion.ejs");
});
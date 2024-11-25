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
import { Parser } from "json2csv"; 
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
  getCooperationAvg,
  getConceptualAvg,
  getPracticalAvg,
  getWorkEthicAvg,
  appendGroupMembers,
} from "./helper.js";
import { Template } from "ejs";

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
  const isAjax =
    req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest";

  // Render the login view, passing in the `ajax` variable
  res.render("login", { ajax: isAjax });
});

// Route for the REGISTER PAGE, render the register.ejs view
app.get("/register", (req, res) => {
  // Check if the request is an AJAX request
  const isAjax =
    req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest";

  // Render the register view, passing in the `ajax` variable
  res.render("register", { ajax: isAjax });
});

// Route to handle the Student Dashboard view
app.get("/student-dashboard", async (req, res) => {
  const studentID = req.session.userID;
  res.render("student-dashboard");

  // try {
  //   // Query to get the number of teammates
  //   const totalTeammatesQuery = await db.query(
  //     `SELECT COUNT(*) AS total_teammates
  //      FROM student
  //      WHERE id_group = (SELECT id_group FROM student WHERE id = $1)
  //      AND id != $1`,
  //     [studentID]
  //   );
  //   const totalTeammates = totalTeammatesQuery.rows[0]?.total_teammates || 0;

  //   // Query to get the number of completed reviews
  //   const completedReviewsQuery = await db.query(
  //     `SELECT COUNT(*) AS completed_reviews
  //      FROM evaluation
  //      WHERE id_evaluator = $1`,
  //     [studentID]
  //   );
  //   const completedReviews =
  //     completedReviewsQuery.rows[0]?.completed_reviews || 0;

  //   // Check if there are pending evaluations
  //   const hasPendingReviews = completedReviews < totalTeammates;
  //   console.log("HasPendingReviews: " + hasPendingReviews);

  //   // Render the dashboard view with the computed data
  //   res.render("student-dashboard", {
  //     hasPendingReviews, // Pass the boolean indicating if there are pending reviews
  //   });
  // } catch (err) {
  //   console.error("Error fetching data for student dashboard:", err);
  //   res.redirect("/"); // Redirect to homepage or an error page in case of failure
  // }
});

// Route for the INSTRUCTOR DASHBOARD page
app.get("/instructor-dashboard", async (req, res) => {
  const instructorUsername = req.query.instructorUsername; // Get instructor username from query params
  const userType = req.session.userType;

  if (!instructorUsername) {
    return res.status(400).send("Instructor username is required."); // Make sure to handle the case where instructorUsername is undefined
  }

  try {
    res.render("instructor-dashboard.ejs", {
      instructorUsername: instructorUsername, // Render the instructor-dashboard view, passing the instructor username
      userType: userType,
    });
  } catch (error) {
    console.error("Error rendering instructor dashboard:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for the CREATE TEAMS page
app.get("/create-teams", async (req, res) => {
  const query = req.query.query ? req.query.query.toLowerCase() : "";
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
  try {
    const RESULT = await db.query(
      "SELECT * FROM student WHERE id_group is NULL"
    );

    res.render("create-teams.ejs", {
      StudentArr: RESULT,
      instructorUsername: instructorUsername,
      userType: userType,
    });
  } catch (err) {
    console.log(err);
  }
});

// Fetch student profile
app.get("/profile", async (req, res) => {
  try {
    const userId = req.session.userID; // Check if user is logged in
    console.log("User ID from session:", userId);

    if (!userId) {
      // If no user is logged in, redirect to login page
      return res.redirect("/login");
    }

    // Query to check if the user has a profile
    const selectQuery = "SELECT * FROM PROFILE WHERE ID_STUDENT = $1";
    console.log("Executing SELECT query:", selectQuery, [userId]);
    const result = await db.query(selectQuery, [userId]);

    if (result.rows.length > 0) {
      const profile = result.rows[0];
      console.log("Profile found:", profile);
      return res.render("profile", { profile });
    } else {
      console.log("Profile not found, redirecting to profile creation.");
      return res.render("create-profile", { userId });
    }
  } catch (err) {
    console.error("Error retrieving profile:", err);
    res
      .status(500)
      .send(
        "An error occurred while retrieving your profile. Please try again later."
      );
  }
});

// Fetch Edit Profile
app.get("/edit-profile", async (req, res) => {
  try {
    const userId = req.session.userID; // Get logged-in user ID
    if (!userId) {
      return res.redirect("/login"); // Redirect to login if user is not logged in
    }

    // Fetch profile data from the database
    const profileQuery = "SELECT * FROM PROFILE WHERE ID_STUDENT = $1";
    const result = await db.query(profileQuery, [userId]);

    const profile = result.rows[0] || {}; // Use an empty object if no profile is found
    res.render("edit-profile", { profile }); // Render the edit-profile.ejs view
  } catch (err) {
    console.error("Error fetching profile for edit:", err);
    res.status(500).send("An error occurred while loading the edit profile page.");
  }
});


// Route for the VIEW TEAMS page
app.get("/view-teams", async (req, res) => {
  const userType = req.session.userType;
  console.log(req.session.userType);
  if (req.session.userType == "INSTRUCTOR") {
    const instructorUsername = req.query.instructorUsername;
    try {
      console.log("this is the " + instructorUsername);

      const DATA = await db.query(
        "SELECT name, id, group_name FROM student, groups WHERE student.id_group = groups.id_group ORDER BY student.id_group ASC"
      );

      res.render("view-teams-instructor.ejs", {
        Teams: DATA,
        instructorUsername: instructorUsername,
        userType: userType,
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
app.get("/edit-team", async (req, res) => {
  const RESULT1 = await db.query(
    "SELECT * FROM groups ORDER BY id_group ASC"
  );

  const RESULT2 = await db.query(
    "SELECT * FROM student WHERE id_group is NULL"
  );

  const RESULT3 = await db.query(
    "SELECT * FROM student ORDER BY id_group, id ASC"
  );

  var teams = RESULT1.rows;
  var availableStudents = RESULT2.rows;
  var student_info = RESULT3.rows;

  for(var i = 0; i < teams.length; i++){
    appendGroupMembers(teams[i], student_info);
  }

  res.render("edit-team.ejs", {
    teams,
    availableStudents,
  });
});

async function getIncompleteAssessments() {
  const query = `
    SELECT s2.ID AS evaluatee_id, s2.NAME AS evaluatee_name
    FROM STUDENT s2
    LEFT JOIN EVALUATION e 
      ON e.ID_EVALUATOR = $1 
      AND e.ID_EVALUATEE = s2.ID
    WHERE s2.ID_GROUP = (
        SELECT ID_GROUP 
        FROM STUDENT 
        WHERE ID = $1
    ) 
      AND s2.ID <> $1 
      AND e.ID_EVALUATOR IS NULL;
  `;

  try {
    const result = await db.query(query, [userId]);
    return result.rows; // List of students not yet reviewed by the user
  } catch (error) {
    console.error("Database Query Error:", error);
    return [];
  }
}

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
        "SELECT DISTINCT id, name, id_group FROM student JOIN evaluation ON id != $2 AND id_group = $3 WHERE NOT EXISTS (SELECT * FROM evaluation WHERE id_evaluator = $2 AND id_evaluatee = id) AND LOWER(name) LIKE $1",
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

app.get("/assess-notification", async (req, res) => {
  try {
    const userId = req.session.userID;

    if (!userId) {
      console.error("No User ID in session.");
      return res.redirect("/login");
    }

    const incompleteAssessments = await getIncompleteAssessments(userId);

    // Log for debugging
    console.log(
      "Incomplete Assessments for user:",
      userId,
      incompleteAssessments
    );

    res.render("assess-notification", { incompleteAssessments });
  } catch (error) {
    console.error("Error fetching incomplete assessments:", error);
    res.status(500).send("Server error");
  }
});
//------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

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

    const commentString = answers.rows[0].comments;

    const sections = commentString.split('<br/>');
    const divComments = [sections[1], sections[4], sections[7], sections[10], sections[13]];
    
    console.log(sections);
    console.log(divComments );

    res.render("edit-evaluation.ejs", {
      student,
      userType,
      instructorUsername,
      cooperationValue: answers.rows[0].cooperation,
      conceptualContributionValue: answers.rows[0].conceptual_contribution,
      practical_contributionValue: answers.rows[0].practical_contribution,
      work_ethicValue: answers.rows[0].work_ethic,
      commentsValue: divComments,
    });
  } catch (error) {
    console.error("Error fetching student for evaluation:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/view-reviews-summary", async (req, res) => {
  const query = req.query.query ? req.query.query.toLowerCase() : "";
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
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
    getCooperationAvg,
    getConceptualAvg,
    getPracticalAvg,
    getWorkEthicAvg,
    student_info,
    groups,
    instructorUsername: instructorUsername,
    userType: userType,
  });
});

app.get("/view-reviews-detailed", async (req, res) => {
  const query = req.query.query ? req.query.query.toLowerCase() : "";
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
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
    getCooperationAvg,
    getConceptualAvg,
    getPracticalAvg,
    getWorkEthicAvg,
    student_info,
    groups,
    sorted_students,
    instructorUsername: instructorUsername,
    userType: userType,
  });
});

app.get("/view-review-completion", async (req, res) => {
  const query = req.query.query ? req.query.query.toLowerCase() : "";
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
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
    instructorUsername: instructorUsername,
    userType: userType,
  });
});

//Route to LOGOUT
app.get("/logout", (req, res) => {
  delete req.session.userID;
  delete req.session.userType;
  res.redirect("/");
});

app.use("/uploads", express.static("uploads"));


// Route for access assessment page
app.get("/access-assessment", (req, res) => {
  const instructorUsername = req.query.instructorUsername;
  const userType = req.session.userType;
  res.render("access-assessment.ejs", {
    instructorUsername: instructorUsername,
    userType: userType,
  });
});

// Server-side route
app.get("/student-chatrooms", async (req, res) => {
  try {
    const studentId = req.session.userID;

    const nameQuery = await db.query(
      "SELECT NAME FROM student WHERE id = $1 ",
      [studentId]
    );
   
    const student_name = nameQuery.rows[0].name.toString()

    // Get the student's group
    const groupQuery = await db.query(
      "SELECT s.id_group, g.group_name FROM student s JOIN groups g ON s.id_group = g.id_group WHERE s.id = $1",
      [studentId]
    );
   
    if (!groupQuery.rows[0]) {
      return res.status(400).send("You must be assigned to a group to use chat.");
    }
   
    const groupId = groupQuery.rows[0].id_group;
    const groupName = groupQuery.rows[0].group_name;
   
    // Get group members
    const membersQuery = await db.query(
      `SELECT s.id, s.name
       FROM student s
       WHERE s.id_group = $1`,
      [groupId]
    );
   
    let messagesQuery = null;
    try {
      messagesQuery = await db.query(
        `SELECT m.*, s.name as sender_name 
         FROM messages m 
         JOIN student s ON m.sender = s.id 
         WHERE m.id_group = $1 
         ORDER BY m.time DESC 
         LIMIT 50`,
        [groupId]
      );
    } catch (error) {
      // Silently ignore the error and proceed with `messagesQuery` as null or an empty array
      messagesQuery = [];
    }

    // Initialize messages as an empty array if null
    const messages = messagesQuery.rows ? messagesQuery.rows.reverse() : [];

  
   
    res.render("./student-chatrooms.ejs", {
      me: student_name,
      messages: messages,
      groupName: groupName,
      members: membersQuery.rows,
      title: 'Chatroom',
      studentId: studentId
  });
  } catch (err) {
    console.error("Error loading chat:", err);
    res.status(500).send("Error loading chat");
  }
});

//Route for export reviews as CSV
app.get("/export-reviews-csv", async (req, res) => {
  try {
    // Fetch the detailed review data from your database
    const result = await db.query(`
      SELECT 
        e.id_evaluatee AS evaluatee_id,
        s.name AS evaluatee_name,
        e.cooperation,
        e.conceptual_contribution AS conceptual,
        e.practical_contribution AS practical,
        e.work_ethic,
        e.comments
      FROM 
        evaluation e
      JOIN 
        student s
      ON 
        e.id_evaluatee = s.id
      ORDER BY 
        s.id_group, e.id_evaluatee
    `);

    const reviews = result.rows;

    if (!reviews || reviews.length === 0) {
      return res.status(404).send("No review data available to export.");
    }

    // Process comments to separate each type
    const processedReviews = reviews.map(review => {
      const commentParts = {
        cooperation_comment: "",
        conceptual_comment: "",
        practical_comment: "",
        work_ethic_comment: "",
        additional_comment: "",
      };

      // Split comments by type if they follow a structured format (e.g., labeled sections)
      const commentLines = review.comments.split("<br/><br/>").map(line => line.trim());
      commentLines.forEach(line => {
        if (line.startsWith("Cooperation Contribution Comment:")) {
          commentParts.cooperation_comment = line.replace("Cooperation Contribution Comment:", "").trim();
        } else if (line.startsWith("Conceptual Contribution Comment:")) {
          commentParts.conceptual_comment = line.replace("Conceptual Contribution Comment:", "").trim();
        } else if (line.startsWith("Practical Contribution Comment:")) {
          commentParts.practical_comment = line.replace("Practical Contribution Comment:", "").trim();
        } else if (line.startsWith("Work Ethic Comment:")) {
          commentParts.work_ethic_comment = line.replace("Work Ethic Comment:", "").trim();
        } else if (line.startsWith("Additional Comment:")) {
          commentParts.additional_comment = line.replace("Additional Comment:", "").trim();
        }
      });

      return {
        ...review,
        ...commentParts, // Add separated comments to the review object
      };
    });

    // Define the fields/columns for the CSV
    const fields = [
      { label: "Evaluatee ID", value: "evaluatee_id" },
      { label: "Evaluatee Name", value: "evaluatee_name" },
      { label: "Cooperation", value: "cooperation" },
      { label: "Conceptual Contribution", value: "conceptual" },
      { label: "Practical Contribution", value: "practical" },
      { label: "Work Ethic", value: "work_ethic" },
      { label: "Cooperation Comment", value: "cooperation_comment" },
      { label: "Conceptual Comment", value: "conceptual_comment" },
      { label: "Practical Comment", value: "practical_comment" },
      { label: "Work Ethic Comment", value: "work_ethic_comment" },
      { label: "Additional Comment", value: "additional_comment" },
    ];

    // Create the CSV using json2csv
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(processedReviews);

    // Set headers and send the CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("detailed_reviews.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error generating CSV export:", err);
    res.status(500).send("An error occurred while exporting reviews as CSV.");
  }
});

// Define the fields/columns for the summary CSV page
app.get("/export-summary-csv", async (req, res) => {
  try {
    // SQL Query to fetch required data
    const result = await db.query(`
      SELECT 
        s.id AS student_id,
        s.name AS student_name,
        g.group_name AS team_name,
        ROUND(MAX(e.cooperation), 2) AS cooperation,
        ROUND(MAX(e.conceptual_contribution), 2) AS conceptual_contribution,
        ROUND(MAX(e.practical_contribution), 2) AS practical_contribution,
        ROUND(MAX(e.work_ethic), 2) AS work_ethic,
        ROUND(AVG((e.cooperation + e.conceptual_contribution + e.practical_contribution + e.work_ethic) / 4.0), 2) AS average
      FROM 
        student s
      LEFT JOIN 
        evaluation e ON s.id = e.id_evaluatee
      LEFT JOIN 
        groups g ON s.id_group = g.id_group
      GROUP BY 
        s.id, g.group_name
      ORDER BY 
        g.group_name, s.id;
    `);

    const rows = result.rows;

    if (!rows || rows.length === 0) {
      return res.status(404).send("No data available to export.");
    }

    // Replace null or undefined values with 0
    const processedRows = rows.map(row => ({
      student_id: row.student_id,
      student_name: row.student_name || "N/A", // Default for missing names
      team_name: row.team_name || "N/A", // Default for missing teams
      cooperation: row.cooperation !== null ? row.cooperation : 0,
      conceptual_contribution: row.conceptual_contribution !== null ? row.conceptual_contribution : 0,
      practical_contribution: row.practical_contribution !== null ? row.practical_contribution : 0,
      work_ethic: row.work_ethic !== null ? row.work_ethic : 0,
      average: row.average !== null ? row.average : 0,
    }));

    // Define CSV fields
    const fields = [
      { label: "Student ID", value: "student_id" },
      { label: "Name", value: "student_name" },
      { label: "Team", value: "team_name" },
      { label: "Cooperation", value: "cooperation" },
      { label: "Conceptual Contribution", value: "conceptual_contribution" },
      { label: "Practical Contribution", value: "practical_contribution" },
      { label: "Work Ethic", value: "work_ethic" },
      { label: "Average", value: "average" },
    ];

    // Generate CSV
    const json2csv = new Parser({ fields });
    const csv = json2csv.parse(processedRows);

    // Send CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("reviews_summary.csv");
    res.send(csv);
  } catch (err) {
    console.error("Error generating CSV export:", err);
    res.status(500).send("An error occurred while exporting the summary as CSV.");
  }
});


//----POST REQUESTS FOR ALL THE WEBPAGES ----//


// Add this route to handle message sending
app.post("/send-message", async (req, res) => {
  try {

    const { message } = req.body;
    const senderId = req.session.userID;
    const messageOneObject = message.toString();
    


    const groupQuery = await db.query(
      "SELECT id_group FROM student WHERE id = $1",
      [senderId]
    );
    const groupId = groupQuery.rows[0].id_group;

    // Save message to database
    const result = await db.query(
      `INSERT INTO messages (id_group, sender, content) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [groupId, senderId, message]
    );

    if(messageOneObject.startsWith("@chat") ){

      const aiPrompt = message.substring(5).trim();

      console.log(aiPrompt);
      const genAI = new GoogleGenerativeAI(process.env.Gemini_API_key);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
      const result = await model.generateContent(aiPrompt);
      console.log(result.response.text());

      await db.query(
        `INSERT INTO messages (id_group, sender, content) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [groupId, senderId, "Chat: " + result.response.text()]
      );
    }


  } catch (err) {
    console.error("Error sending message:", err);
  }
});


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
  

    if (result.rows.length > 0) {

      const user = result.rows[0];
      req.session.userType = user.origin;
      req.session.userID = result.rows[0].id;

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
            res.render("student-dashboard.ejs", {
              userType: user.origin,
              studentId: user.id,
            }); // Render student dashboard
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

// Update student profile
app.post("/profile", async (req, res) => {
  const { firstName, lastName, email, address, address2, province, zip } =
    req.body;

  try {
    const userId = req.session.userID;
    if (!userId) throw new Error("User ID not found in session.");

    const selectQuery = "SELECT * FROM PROFILE WHERE ID_STUDENT = $1";
    const result = await db.query(selectQuery, [userId]);

    if (result.rows.length > 0) {
      const updateQuery = `
        UPDATE PROFILE
        SET FIRST_NAME = $1, LAST_NAME = $2, EMAIL = $3, ADDRESS = $4, ADDRESS2 = $5, PROVINCE = $6, ZIP = $7
        WHERE ID_STUDENT = $8
      `;
      console.log("Executing UPDATE query:", updateQuery);
      await db.query(updateQuery, [
        firstName,
        lastName,
        email,
        address,
        address2,
        province,
        zip,
        userId,
      ]);
    } else {
      const insertQuery = `
        INSERT INTO PROFILE (ID_STUDENT, FIRST_NAME, LAST_NAME, EMAIL, ADDRESS, ADDRESS2, PROVINCE, ZIP)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      console.log("Executing INSERT query:", insertQuery);
      await db.query(insertQuery, [
        userId,
        firstName,
        lastName,
        email,
        address,
        address2,
        province,
        zip,
      ]);
    }

    res.redirect("/profile");
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).send("An error occurred while saving your profile.");
  }
});

// Edit student profile
app.post("/edit-profile", async (req, res) => {
  try {
    const userId = req.session.userID; // Get logged-in user ID
    if (!userId) {
      return res.redirect("/login"); // Redirect to login if user is not logged in
    }

    const { firstName, lastName, email, address, address2, province, zip } = req.body;

    // Update profile in the database
    const updateQuery = `
      UPDATE PROFILE
      SET 
        FIRST_NAME = $1, 
        LAST_NAME = $2, 
        EMAIL = $3, 
        ADDRESS = $4, 
        ADDRESS2 = $5, 
        PROVINCE = $6, 
        ZIP = $7
      WHERE ID_STUDENT = $8
    `;

    await db.query(updateQuery, [firstName, lastName, email, address, address2, province, zip, userId]);

    res.redirect("/profile"); // Redirect to the profile page after saving changes
  } catch (err) {
    console.error("Error saving profile updates:", err);
    res.status(500).send("An error occurred while saving your profile.");
  }
});


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

app.post("/edit-teams", async (req, res) => {
  var newTeamName = req.body.teamName;
  var studentsToAdd = req.body.studentIDs;
  var IDsToRemove = req.body.IDsToRemove;
  var teamID = req.body.team;

  //console.log(newTeamName, studentsToAdd, IDsToRemove, teamID);

  const RESULT = await db.query("SELECT * FROM groups WHERE id_group = $1", [
    teamID,
  ]);

  var team = RESULT.rows[0];

  if(newTeamName != team.group_name){
    await db.query("UPDATE groups SET group_name = $1 WHERE id_group = $2", [
      newTeamName,
      teamID,
    ]);
  }

  if(studentsToAdd != null){
    if(!Array.isArray(studentsToAdd)){
      studentsToAdd = [studentsToAdd];
    }
    for(var i = 0; i < studentsToAdd.length; i++){
      await db.query("UPDATE student SET id_group = $1 WHERE id = $2", [
        teamID,
        studentsToAdd[i],
      ]);
    }
  }

  if(IDsToRemove != null){
    if(!Array.isArray(IDsToRemove)){
      IDsToRemove = [IDsToRemove];
    }
    for(var i = 0; i < IDsToRemove.length; i++){
      await db.query("DELETE FROM evaluation WHERE id_evaluator = $1 OR id_evaluatee = $1", [IDsToRemove[i]]);
      await db.query("UPDATE student SET id_group = $1 WHERE id = $2", [
        null,
        IDsToRemove[i],
      ]);
    }
  }

  res.redirect("/view-teams");
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
    cooperation: "",
    conceptual: "",
    practical: "",
    work_ethic: "",
    comments: "",
  };
  commentsObj.cooperation =
    req.body.cooperation_comments != ""
      ? "Cooperation Contribution Comment: <br/>" +
        req.body.cooperation_comments +
        "<br/><br/>"
      : "";
  commentsObj.conceptual =
    req.body.conceptual_comments != ""
      ? "Conceptual Contribution Comment: <br/>" +
        req.body.conceptual_comments +
        "<br/><br/>"
      : "";
  commentsObj.practical =
    req.body.practical_comments != ""
      ? "Practical Contribution Comment: <br/>" +
        req.body.practical_comments +
        "<br/><br/>"
      : "";
  commentsObj.work_ethic =
    req.body.work_ethic_comments != ""
      ? "Work Ethic Comment: <br/>" +
        req.body.work_ethic_comments +
        "<br/><br/>"
      : "";
  commentsObj.comments =
    req.body.comments != ""
      ? "Additional Comment: <br/>" + req.body.comments + "<br/><br/>"
      : "";
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
  var commentsObj = {
    cooperation: "",
    conceptual: "",
    practical: "",
    work_ethic: "",
    comments: "",
  };
  commentsObj.cooperation = 
  req.body.cooperation_comments != "" 
  ? "Cooperation Contribution Comment: <br/>" +
        req.body.cooperation_comments +
        "<br/><br/>"
      : "";
  commentsObj.conceptual =
    req.body.conceptual_comments != ""
      ? "Conceptual Contribution Comment: <br/>" +
        req.body.conceptual_comments +
        "<br/><br/>"
      : "";
  commentsObj.practical =
    req.body.practical_comments != ""
      ? "Practical Contribution Comment: <br/>" +
        req.body.practical_comments +
        "<br/><br/>"
      : "";
  commentsObj.work_ethic =
    req.body.work_ethic_comments != ""
      ? "Work Ethic Comment: <br/>" +
        req.body.work_ethic_comments +
        "<br/><br/>"
      : "";
  commentsObj.comments =
    req.body.comments != ""
      ? "Additional Comment: <br/>" + req.body.comments + "<br/><br/>"
      : "";

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

export default app;

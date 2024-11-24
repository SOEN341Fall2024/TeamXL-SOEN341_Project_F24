// app.js
import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import dotenv from "dotenv";
import pg from "pg";
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

const saltRounds = 10;

// Create database connection function that can be mocked in tests
export const createDbConnection = () => {
  return new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST, 
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
};

// Factory function to create the app with dependencies injected
export const createApp = (db) => {
  const app = express();

  // Middleware setup
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(session({ 
    secret: process.env.SESSION_SECRET || 'key', 
    resave: false, 
    saveUninitialized: true 
  }));

  // File upload configuration
  const upload = multer({ dest: "uploads/" });

  // Authentication middleware
  const requireAuth = (req, res, next) => {
    if (!req.session.userID) {
      return res.redirect('/login');
    }
    next();
  };

  // Basic routes
  app.get("/", (req, res) => {
    res.render("home.ejs");
  });

  app.get("/login", (req, res) => {
    const isAjax = req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest";
    res.render("login", { ajax: isAjax });
  });

  app.get("/register", (req, res) => {
    const isAjax = req.xhr || req.headers["x-requested-with"] === "XMLHttpRequest";
    res.render("register", { ajax: isAjax });
  });

  // Authentication routes
  app.post("/register", async (req, res) => {
    const username = req.body.username.toLowerCase();
    const password = req.body.password;
    const role = req.body.role;

    try {
      const checkResult = await db.query(
        `SELECT * FROM ${role} WHERE name = $1`,
        [username]
      );

      if (checkResult.rows.length > 0) {
        if (req.headers["x-requested-with"] === "XMLHttpRequest") {
          return res.render("username-exists-login.ejs", { ajax: true });
        }
        return res.render("username-exists-login.ejs");
      }

      const hash = await bcrypt.hash(password, saltRounds);
      await db.query(
        `INSERT INTO ${role} (name, password) VALUES ($1, $2)`,
        [username, hash]
      );

      if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        return res.render("registered-now-login.ejs", { ajax: true });
      }
      return res.render("registered-now-login.ejs");

    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).send('Registration failed');
    }
  });

  app.post("/login", async (req, res) => {
    const username = req.body.username.toLowerCase();
    const loginPassword = req.body.password;

    try {
      const result = await db.query(
        `SELECT NAME,id,password,'INSTRUCTOR' AS origin 
         FROM instructor WHERE NAME = $1 
         UNION SELECT NAME,id,password,'STUDENT' AS origin 
         FROM student WHERE NAME = $1`,
        [username]
      );

      if (result.rows.length === 0) {
        return res.render("incorrect-pw-un.ejs");
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(loginPassword, user.password);

      if (!match) {
        return res.render("incorrect-pw-un.ejs");
      }

      req.session.userID = user.id;
      req.session.userType = user.origin;

      if (user.origin === "INSTRUCTOR") {
        return res.render("instructor-dashboard.ejs", {
          instructorUsername: user.name,
          userType: user.origin,
        });
      }

      return res.render("student-dashboard.ejs", {
        userType: user.origin,
        studentId: user.id,
      });

    } catch (err) {
      console.error('Login error:', err);
      res.status(500).send('Login failed');
    }
  });

  // Protected routes
  app.get("/student-dashboard", requireAuth, (req, res) => {
    res.render("student-dashboard");
  });

  app.get("/instructor-dashboard", requireAuth, async (req, res) => {
    const { instructorUsername } = req.query;
    const userType = req.session.userType;

    if (!instructorUsername) {
      return res.status(400).send("Instructor username is required.");
    }

    try {
      res.render("instructor-dashboard.ejs", {
        instructorUsername,
        userType,
      });
    } catch (error) {
      console.error("Error rendering instructor dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  return app;
};

// Create and export the app instance
const db = createDbConnection();
db.connect();

export default createApp(db);
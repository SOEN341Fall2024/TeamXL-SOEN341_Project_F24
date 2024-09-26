--users table formed in the database (for registration and login)
CREATE TABLE users (
    username VARCHAR(50) UNIQUE,
    usertype VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);

--teams table created in the database (for storing teams)
CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  instructor_username VARCHAR(50) REFERENCES users(username)
);

--team_members table created in the database (for team members)
CREATE TABLE team_members (
  team_id INT REFERENCES teams(team_id),
  student_username VARCHAR(50) REFERENCES users(username),
  PRIMARY KEY (team_id, student_username)
);
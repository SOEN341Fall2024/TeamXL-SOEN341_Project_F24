-- Create table for the student with ID starting from 1000
CREATE SEQUENCE student_id_seq START 1000;  -- Start student IDs from 1000

-- Create table for the instructors
CREATE TABLE INSTRUCTOR (
    ID SERIAL PRIMARY KEY, --Autoincrement to put unique ID
    NAME VARCHAR(100), 
    PASSWORD VARCHAR(1000) NOT NULL,
    course_name varchar(50) UNIQUE
);

-- Create table for groups
CREATE TABLE GROUPS (
    ID_GROUP SERIAL PRIMARY KEY,
    GROUP_NAME VARCHAR(100) UNIQUE -- Optional: add a name for the group
);

-- Create table for the students
CREATE TABLE STUDENT (
    ID INTEGER PRIMARY KEY DEFAULT nextval('instructor_id_seq'), --Autoincrement to put unique ID
    NAME VARCHAR(100),
    ID_GROUP INTEGER,
    ID_teacher INTEGER,
    PASSWORD VARCHAR(1000) NOT NULL,
    FOREIGN KEY (ID_GROUP) REFERENCES GROUPS(ID_GROUP),
    FOREIGN KEY (ID_teacher) REFERENCES INSTRUCTOR(ID)  
);
-- Create table for the evaluation
CREATE TABLE EVALUATION (
    ID_EVALUATION SERIAL PRIMARY KEY,
    ID_EVALUATOR INTEGER,
    ID_EVALUATEE INTEGER,
    ID_GROUP INTEGER,
    FOREIGN KEY (ID_GROUP) REFERENCES GROUPS(ID_GROUP),  
    FOREIGN KEY (ID_EVALUATOR) REFERENCES STUDENT(ID),
    FOREIGN KEY (ID_EVALUATEE) REFERENCES STUDENT(ID),
    UNIQUE (ID_EVALUATOR, ID_EVALUATEE)
);

-- Create an index to order by STUDENT_NAME
CREATE INDEX IDX_STUDENT_NAME ON STUDENT(NAME);

-- Create an index to order by INSTRUCTOR_NAME
CREATE INDEX IDX_INSTRUCTOR_NAME ON INSTRUCTOR(NAME);

-- Create an index to order by ID_GROUP in STUDENT
CREATE INDEX IDX_ID_GROUP ON STUDENT(ID_GROUP);

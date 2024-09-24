CREATE TABLE users (
    username VARCHAR(50) UNIQUE,
    usertype VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (username)
);
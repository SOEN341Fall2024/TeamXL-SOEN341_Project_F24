# IterationX-SOEN341_Project_F24

## Team Name
> **IterationX**

## Team Members
+ Aditi Abhaysingh Ingle - 40266449 : Scrum Master, Backend Developer, Frontend Developer, UX Designer
+ Jonathan Mehmannavaz - 40210330 : Frontend Developer, Backend Developer
+ Joyal Biju Kulangara - 40237314 : Frontend Developer,  UX Designer
+ Kevin Mandiouba - 40243497 : Frontend Developer,  UX Designer
+ Oussama Bouhenchir - 40249465 : Backend Developer, UX Designer
+ Owen Jorgensen - 40227851 : Backend Developer, UX Designer, Test Engineer

## Project Description
+ This project aims to create a Peer Assessment System for university team projects, where students can evaluate their teammates based on four key dimensions: cooperation, conceptual contribution, practical contribution, and work ethic. This project follows an Agile development methodology, with incremental deliveries over four sprints. By the end of the project, we aim to deliver a middle-fidelity prototype that could serve as a foundation for a fully functional product.

## Frameworks Used 
Node.js, Express.js, EJS, PostgreSQL, Boostrap

## How To Run The Web Application Locally : 

### Prerequisites

- [Node.js](https://nodejs.org/) 
- [npm](https://www.npmjs.com/) 
- [PostgreSQL](https://www.postgresql.org/)

### Step 1: Clone the Repository

First, clone the repository to your local machine:

```bash
    git clone https://github.com/SOEN341Fall2024/IterationX-SOEN341_Project_F24.git
```

Navigate to the project directory:

```bash
    cd IterationX-SOEN341_Project_F24.git
```

### Step 2: Initialize npm (if not already done)

```bash
    npm init -y
```

### Step 3: Install Dependencies

```bash
    npm install express ejs axios pg dotenv body-parser method-override
    npm install --save-dev nodemon
```
or simply,

```bash
    npm install 
```

### Step 4: Set up environment variables

Create a .env file in the project root:

```bash
    touch .env
```

Edit the .env file to include your environment-specific settings (Make sure to use the same variable name):
DB_PASSWORD=your_postgres_password and other database related details.

### Step 5: In pgAdmin (PostgreSQL)

Create a new database, and run the queries from the two .sql files.

### Step 6: Start the server and Access the Website

```bash
  nodemon app.js
```
Open your web browser and navigate to localhost:3000. This will open the Peer Assessment Application.

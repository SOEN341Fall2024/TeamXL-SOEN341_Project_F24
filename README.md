# 🏆 **TeamXL-SOEN341_Project_F24**

## 🚀 **Team Name**
**TeamXL**  

---

## 👥 **Team Members**
| **Name**                  | **ID**     | **Roles**                                                                 | **GitHub**                         |
|---------------------------|------------|---------------------------------------------------------------------------|-------------------------------------|
| Aditi Abhaysingh Ingle    | 40266449   | Scrum Master, Backend Developer, Frontend Developer, UX Designer          | [aditiingle](https://github.com/aditiingle) |
| Jonathan Mehmannavaz      | 40210330   | Frontend Developer, Backend Developer, Test Engineer                      | [JonaBaron](https://github.com/JonaBaron) |
| Joyal Biju Kulangara      | 40237314   | Frontend Developer, UX Designer, Test and QA Engineer                     | [Joyal99](https://github.com/Joyal99) |
| Kevin Mandiouba           | 40243497   | Frontend Developer, UX Designer                                           | [KevinMandiouba](https://github.com/KevinMandiouba) |
| Oussama Bouhenchir        | 40249465   | Frontend Developer, UX Designer                                           | [ouss2231](https://github.com/ouss2231) |
| Owen Jorgensen            | 40227851   | Backend Developer, UX Designer                                            | [owjorgen](https://github.com/owjorgen) |


## 📜 **Project Description**
The **Peer Assessment System** is designed for university team projects, enabling students to evaluate their teammates across four critical dimensions:  
1. 🤝 **Cooperation**  
2. 🧠 **Conceptual Contribution**  
3. 🛠️ **Practical Contribution**  
4. 💼 **Work Ethic**  

Our development follows the **Agile methodology**, with incremental deliveries across four sprints. By project completion, we aim to present a **middle-fidelity prototype** that serves as the foundation for a fully functional product.  

---

## 🔑 **Key Project Features**
- 🌟 **Team Member Evaluation**: Allows students to rate their teammates on four performance dimensions.  
- 🔄 **Real-Time Data Handling**: Stores and retrieves evaluations in a secure PostgreSQL database.  
- 🎨 **User-Friendly Interface**: Designed with Bootstrap for clean, responsive layouts.  
- 🔒 **Secure Access**: Protects sensitive data using environment variables and robust backend security practices.  
- ⚡ **Efficient Workflow**: Agile-based incremental deliveries ensure continual improvements and adaptability.  
- 📊 **Scalable Database Schema**: Supports seamless expansion for future use cases.
- 📈 **View and Export Reviews**: Supports instructor users' visibility of detailed and summary reviews, enabling them to export the content to csv format, along with viewing student users' completion status.
- 💬 **Chatroom**: Implemented a chatroom enabling students in a group to communicate with each other.
- 🤖 **Chatbot**: Implemented a chatbot that is enabled by typing **_@chat_** which allows the user to chat with Google's gemini api bot. 


---

## 🛠️ **Technologies & Frameworks Used**
| **Category**  | **Tools/Technologies**          |
|---------------|---------------------------------|
| **Backend**   | Node.js, Express.js, PostgreSQL |
| **Frontend**  | EJS, Bootstrap                  |

---

## ⚙️ **How to Run the Application Locally**

### 📝 **Prerequisites**
Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/)  
- [npm](https://www.npmjs.com/)  
- [PostgreSQL](https://www.postgresql.org/)  

---

## 🔧 **Setup Instructions**

#### 1️⃣ **Clone the Repository**
Clone the repository to your local machine:  
```bash
git clone https://github.com/SOEN341Fall2024/IterationX-SOEN341_Project_F24.git
```

Navigate to the project directory:

```bash
    cd IterationX-SOEN341_Project_F24.git
```

#### 2️⃣ **Initialize npm**
Initialize npm (if not already done):

```bash
    npm init -y
```
#### 3️⃣ **Install Dependencies**
Install all necessary dependencies:

```bash
    npm install 
```

Alternatively, you can manually install the required packages:

```bash
    npm install express body-parser pg dotenv ejs express-session multer csv-parser json2csv bcrypt
    npm install --save-dev nodemon
    npm install @google/generative-ai
```
#### 4️⃣ **Set Up Environment Variables**

1. Create a .env file in the project root:

```bash
    touch .env
```
2. Edit the .env file to include your environment-specific settings (Make sure to use the same variable name):
   
```env  
DB_USER= "postgres"
DB_HOST= "localhost"
DB_NAME= your_postgres_databasename
DB_PASSWORD= your_postgres_password
DB_PORT= 5432
Gemini_API_key= your_gemini_api_key
```
#### 5️⃣ Configure the Database

1. Open pgAdmin (PostgreSQL).
2. Create a new database.
3. Run the SQL scripts (.sql files in the repository) to configure the schema and populate the database with initial data.

#### 6️⃣ Start the Server

Run the following command to start the server:
```bash
  nodemon server.js
```
#### 7️⃣ Access the Application
Open your web browser and navigate to 
```bash
  localhost:3000
```
You’re now ready to explore our **Peer Assessment System**!

## 📄 License

This project is licensed under the [MIT Licence](./LICENSE).

---

© 2024 **TeamXL**. All Rights Reserved.

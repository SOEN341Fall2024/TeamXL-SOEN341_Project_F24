🏆 TeamXL-SOEN341_Project_F24
🚀 Team Name
TeamXL

🌐 Project Name
InsightSphere

👥 Team Members
Name	ID	Roles
Aditi Abhaysingh Ingle	40266449	Scrum Master, Backend Developer, Frontend Developer, UX Designer
Jonathan Mehmannavaz	40210330	Frontend Developer, Backend Developer, Test Engineer
Joyal Biju Kulangara	40237314	Frontend Developer, UX Designer, Test and QA Engineer
Kevin Mandiouba	40243497	Frontend Developer, UX Designer
Oussama Bouhenchir	40249465	Frontend Developer, UX Designer
Owen Jorgensen	40227851	Backend Developer, UX Designer
📜 Project Description
The Peer Assessment System is designed for university team projects, enabling students to evaluate their teammates across four critical dimensions:

🤝 Cooperation
🧠 Conceptual Contribution
🛠️ Practical Contribution
💼 Work Ethic
Our development follows the Agile methodology, with incremental deliveries across four sprints. By project completion, we aim to present a middle-fidelity prototype that serves as the foundation for a fully functional product.

🔑 Key Project Features
🌟 Team Member Evaluation: Allows students to rate their teammates on four performance dimensions.
🔄 Real-Time Data Handling: Stores and retrieves evaluations in a secure PostgreSQL database.
🎨 User-Friendly Interface: Designed with Bootstrap for clean, responsive layouts.
🔒 Secure Access: Protects sensitive data using environment variables and robust backend security practices.
⚡ Efficient Workflow: Agile-based incremental deliveries ensure continual improvements and adaptability.
📊 Scalable Database Schema: Supports seamless expansion for future use cases.
📈 View and Export Reviews: Supports instructor users' visibility of detailed and summary reviews, enabling them to export the content to csv format, along with viewing student users' completion status.
💬 Chatroom: Implemented a chatroom enabling students in a group to communicate with each other.
🤖 Chatbot: Implemented a chatbot that is enabled by typing @chat which allows the user to chat with Google's gemini api bot.
Demo
📽️ Demo Video: Watch the Demo Video of InsightSphere

Note: This is a video demonstration hosted on Google Drive. Click the link to view.

🛠️ Technologies & Frameworks Used
Category	Tools/Technologies
Backend	Node.js, Express.js, PostgreSQL
Frontend	EJS, Bootstrap
⚙️ How to Run the Application Locally
📝 Prerequisites
Before running the application, ensure you have the following installed:

Node.js
npm
PostgreSQL
🔧 Setup Instructions
1️⃣ Clone the Repository
Clone the repository to your local machine:

git clone https://github.com/SOEN341Fall2024/IterationX-SOEN341_Project_F24.git
Navigate to the project directory:

    cd IterationX-SOEN341_Project_F24.git
2️⃣ Initialize npm
Initialize npm (if not already done):

    npm init -y
3️⃣ Install Dependencies
Install all necessary dependencies:

    npm install 
Alternatively, you can manually install the required packages:

    npm install express body-parser pg dotenv ejs express-session multer csv-parser json2csv bcrypt
    npm install --save-dev nodemon
    npm install @google/generative-ai
4️⃣ Set Up Environment Variables
Create a .env file in the project root:
    touch .env
Edit the .env file to include your environment-specific settings (Make sure to use the same variable name):
DB_USER= "postgres"
DB_HOST= "localhost"
DB_NAME= your_postgres_databasename
DB_PASSWORD= your_postgres_password
DB_PORT= 5432
Gemini_API_key= your_gemini_api_key
5️⃣ Configure the Database
Open pgAdmin (PostgreSQL).
Create a new database.
Run the SQL scripts (.sql files in the repository) to configure the schema and populate the database with initial data.
6️⃣ Start the Server
Run the following command to start the server:

  nodemon server.js
7️⃣ Access the Application
Open your web browser and navigate to

  localhost:3000
You’re now ready to explore our Peer Assessment System!

📄 License
This project is licensed under the MIT Licence.

© 2024 TeamXL. All Rights Reserved.
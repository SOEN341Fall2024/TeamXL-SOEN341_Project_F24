// server.js
import app from './app.js';
import { Server } from "socket.io";
import { createServer } from "http";

const port = 3000;


// Modify your existing server setup
const server = createServer(app);
const io = new Server(server);

// Add these new chat-related routes to your existing Express app
app.get("/chat/:groupId", async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const studentId = req.session.userID;
    
    // Get group members
    const membersQuery = await db.query(
      `SELECT s.id, s.name 
       FROM student s 
       WHERE s.id_group = $1`,
      [groupId]
    );
    
    // Get recent messages
    const messagesQuery = await db.query(
      `SELECT m.*, s.name as sender_name 
       FROM messages m 
       JOIN student s ON m.sender = s.id 
       WHERE m.id_group = $1 
       ORDER BY m.time DESC 
       LIMIT 50`,
      [groupId]
    );

    res.render("student-chatrooms.ejs", {
      groupId,
      studentId,
      members: membersQuery.rows,
      messages: messagesQuery.rows.reverse()
    });
  } catch (err) {
    console.error("Error loading chat:", err);
    res.status(500).send("Error loading chat");
  }
});

// WebSocket handling
io.on("connection", (socket) => {
  let currentRoom = null;
  
  socket.on("join-room", async (groupId) => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }
    currentRoom = `group-${groupId}`;
    socket.join(currentRoom);
  });

  socket.on("send-message", async (data) => {
    try {
      const { groupId, senderId, content } = data;
      
      // Save message to database
      const result = await db.query(
        `INSERT INTO messages (id_group, sender, content) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [groupId, senderId, content]
      );
      
      // Get sender name
      const senderQuery = await db.query(
        "SELECT name FROM student WHERE id = $1",
        [senderId]
      );
      
      const messageData = {
        ...result.rows[0],
        sender_name: senderQuery.rows[0].name
      };
      
      // Broadcast to all clients in the group
      io.to(`group-${groupId}`).emit("new-message", messageData);
    } catch (err) {
      console.error("Error sending message:", err);
      socket.emit("error", "Failed to send message");
    }
  });
});

// Update your server startup
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

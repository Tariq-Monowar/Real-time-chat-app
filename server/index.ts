// Backend - server.js or app.js
import app from "./app";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

const server = app.listen(PORT, async () => {
  try {
    console.log(`Server running on http://localhost:${PORT}`);
    await prisma.$connect();
    console.log("Database connected...");
  } catch (err) {
    console.error("Database connection error:", err);
  }
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: ['http://localhost:8081', 'http://10.0.2.2:8081'],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit('connected');
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send message", (newMessage) => {
    const room = newMessage.chatId;
    socket.to(room).emit("newMessage", newMessage); // Emit the message to everyone in the room except sender
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

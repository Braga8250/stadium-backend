const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");
const cors = require("cors");

const config = require("./config");

// Render gives the port in PORT; local uses 5000
const port = Number(process.env.PORT || 5000);
// Listen on all network interfaces (needed online)
const hostname = "0.0.0.0";

// Frontends allowed to call the API (Vercel online, Vite locally)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NODE_ENV !== "production" ? "http://localhost:5173" : null,
].filter(Boolean);

mongoose
  .connect(config.db)
  .then(() => console.log("Conection successful!"))
  .catch((err) => console.error(err));

let router = require("./router");
var app = express();

// Render sits behind a proxy (needed for secure cookies)
app.set("trust proxy", 1);

// Allow the frontend and its cookies
app.use(cors({ origin: allowedOrigins, credentials: true }));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket, new connection", socket.id);

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Health check: confirms the server is running
app.get("/health", (req, res) => res.json({ ok: true }));

app.use(router.init(io));
app.use("/images", express.static(path.join(__dirname, "images")));

server.listen(port, hostname, () => {
  console.log(`Server running on port ${port}`);
});

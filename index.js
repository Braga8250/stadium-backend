const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const socketIo = require("socket.io");

const config = require("./config");

// Render gives the port in PORT; local uses 5000
const port = Number(process.env.PORT || 5000);
// Listen on all network interfaces (needed online)
const hostname = "0.0.0.0";

mongoose
  .connect(config.db)
  .then(() => console.log("Conection successful!"))
  .catch((err) => console.error(err));

let router = require("./router");
var app = express();

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
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

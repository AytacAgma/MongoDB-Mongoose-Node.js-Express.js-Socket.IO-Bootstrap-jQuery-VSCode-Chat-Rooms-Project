const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3010;

server.listen(port, () => {
  console.log("Server is running on port " + port);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/nodejs", (req, res) => {
  res.sendFile(__dirname + "/public/nodejs.html");
});

app.get("/expressjs", (req, res) => {
  res.sendFile(__dirname + "/public/expressjs.html");
});

app.get("/socketio", (req, res) => {
  res.sendFile(__dirname + "/public/socketio.html");
});

const tech = io.of("/tech");

tech.on("connection", (socket) => {
  // console.log("user connected");
  /* socket.emit("message", { manny: "hey how r u?" });
  socket.on("another event", (data) => {
    console.log(data);
  }); */

  socket.on("join", (data) => {
    socket.join(data.room);
    tech
      .in(data.room)
      .emit("message", "New user joined " + data.room + " room!");
  });

  socket.on("message", (data) => {
    console.log("message: " + data.msg);
    tech.in(data.room).emit("message", data.msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");

    tech.emit("message", "user disconnected");
  });
});

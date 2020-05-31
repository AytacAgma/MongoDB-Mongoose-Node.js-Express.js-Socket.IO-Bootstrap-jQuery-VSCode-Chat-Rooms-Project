const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");

const dbUrl =
  "mongodb+srv://adminuser:pass@agma-tvrcr.mongodb.net/catapat?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
  name: String,
  msg: String,
  room: String,
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("mongo db connection", err);
  }
);

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
      .emit("message", "New user has joined " + data.room + " room!");
  });

  socket.on("message", (data) => {
    var message = new Message(data);
    message.save((err) => {
      if (err)
        //sendStatus(500);
        console.log("error", err);

      console.log("message: " + data.msg + " name: " + data.name);
      tech.in(data.room).emit("message", data.msg, data.name);
      //sendStatus(200);
    });
  });

  /* socket.on("disconnect", () => {
    console.log("user disconnected");

    tech.emit("message", "user disconnected");
  }); */
  socket.on("disjoin", (data) => {
    console.log(data.name + " disconnected");

    tech.emit("message", data.name + " disconnected");
  });
});

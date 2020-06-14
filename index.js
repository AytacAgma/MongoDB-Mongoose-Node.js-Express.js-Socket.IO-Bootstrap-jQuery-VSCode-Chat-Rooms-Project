const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3001;
const mongoose = require("mongoose");
//var moment = require("moment");
//const querystring = require("querystring");
const bodyParser = require("body-parser");

let name;

//let repeat = 0;

const dbUrl =
  "mongodb+srv://adminuser:aiue@agma-tvrcr.mongodb.net/catapat?retryWrites=true&w=majority";

var Message = mongoose.model("Message", {
  name: String,
  msg: String,
  room: String,
  date: String,
});

mongoose.connect(
  dbUrl,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    console.log("mongo db connection", err);
  }
);

//querystring.decode();

//app.use(express.urlencoded());

server.listen(port, () => {
  console.log("Server is running on port " + port);
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/nodejs", (req, res) => {
  res.sendFile(__dirname + "/public/nodejs.html");
  //Message.find({}, (err, messages) => {
  //tech.in(data.room).emit("message", messages.msg, messages.name);
  //res.send(messages);
  //});
  //oldMessages("nodejs");
});

app.get("/expressjs", (req, res) => {
  res.sendFile(__dirname + "/public/expressjs.html");
});

app.get("/socketio", (req, res) => {
  res.sendFile(__dirname + "/public/socketio.html");
});

// ** ikinci yöntem get (querystring) ya da post ile nick kaydetme yöntemi
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post("/rooms", urlencodedParser, (req, res) => {
  // console.log(req.param.n); //çalışmıyor
  // console.log(req.params.n); //çalışmıyor
  console.log(req.param("n")); //hem querystring (form method=get) hem form method post'ta çalışıyor.
  console.log(req.body.n); //sadece post'ta
  name = req.body.n;
  console.log(name);
  res.sendFile(__dirname + "/public/rooms.html");
});

//let result = 0;

async function oldMessagesAndWelcome(room) {
  let promise = Message.find({}, (err, res) => {
    if (err) console.log(err);

    //console.log("func entered");
    //if (result == 0) {
    res.forEach((element, i) => {
      tech.in(room).emit("oldmessages", {
        msg: element.msg,
        name: element.name,
        date: element.date,
        i,
      });
    });
    //result = 1;
    //}

    // ** birinci yöntem
    //tech.in(room).emit("message", "New user has joined " + room + " room!");
  });

  /* const collection = Message.find({});
    tech.in(data.room).emit("message", collection.msg, collection.name); */

  //await promise; //firstly showing old messages then showing "new user has joined" msg

  //await new Promise((resolve) => setTimeout(resolve, 1000)); //showing "new user has joined" msg after 1 second

  //tech.in(room).emit("message", "New user has joined " + room + " room!");

  //repeat++;

  // ** ikinci yöntem (async, await tekniği)
  await promise; //firstly showing old messages then showing "new user has joined" msg
  tech
    .in(room)
    .emit("message", { msg: "New user has joined " + room + " room!" });
}

const tech = io.of("/tech");

tech.on("connection", (socket) => {
  // console.log("user connected");
  /* socket.emit("message", { manny: "hey how r u?" });
  socket.on("another event", (data) => {
    console.log(data);
  }); */

  /* socket.on("oldmsgs", (data) => {
    //if (data.number == 0) {
    socket.join(data.room);
    oldMessages(data.room);
    //result = 1;
    //}
  }); */

  socket.on("join", (data) => {
    socket.join(data.room);

    //if (repeat < 2) {
    //oldMessagesAndJoinedMsg(data.room);

    oldMessagesAndWelcome(data.room);

    //new Promise((resolve) => setTimeout(resolve, 2000));

    /* tech
      .in(data.room)
      .emit("message", "New user has joined " + data.room + " room!"); */
    //}

    socket.on("disconnect", () => {
      if (data.name != undefined) {
        console.log("User disconnected");
        tech.in(data.room).emit("message", { msg: "User disconnected" });
      } else {
        console.log(data.name + " disconnected");
        tech
          .in(data.room)
          .emit("message", { msg: data.name + " disconnected" });
      }
    });
  });

  socket.on("message", (data) => {
    var message = new Message(data, name);
    message.save((err) => {
      if (err)
        //sendStatus(500);
        console.log("error", err);

      console.log("message: " + data.msg + " name: " + name);
      tech
        .in(data.room)
        .emit("message", { msg: data.msg, name: name, date: data.date });
      //sendStatus(200);
    });
  });

  /* socket.on("disconnect", () => {
    console.log("user disconnected");

    tech.emit("message", "user disconnected");
  }); */
  socket.on("disjoin", (data) => {
    //console.log(data.name + " disconnected");
    //tech.in(data.room).emit("message", { msg: data.name + " disconnected" });
  });

  // ** birinci yöntem event emit ve on ile nick kaydetme yöntemi
  /* socket.on("name", (data) => {
    console.log(data.name + " entered nick name");
    name = data.name;
  }); */
});

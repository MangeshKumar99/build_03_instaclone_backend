const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post")

const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
      origins: "*"
  }
});
io.on('connection',(socket) => {
  console.log("A user connected...")

  socket.on('create', function(room) {
    socket.join(room);
    socket.on("chat", (payload) => {
      io.in(room).emit("chat",payload);
    });
  });
  
  // socket.on("join", (data) => {
  //   socket.broadcast.to(data.room).emit("user joined");
  // });

  // socket.on("chat", (payload) => {
  //   io.in(payload.room).emit("chat",payload);
  // });

  // socket.on('chat', (payload) => {
  //   io.emit('chat', payload);
  // })
  socket.on('disconnect', function () {
    console.log('A user disconnected...');
 });

})
const port = process.env.PORT || 1313;

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("DB CONNECTED");
  });

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", postRoutes);

// app.listen(port, () => {
//     console.log(`app running on ${port}`);
//   });
server.listen(port, () => {
  console.log(`server running on ${port}`)
})
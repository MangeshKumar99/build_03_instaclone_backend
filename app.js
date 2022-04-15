const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth");

const app = express();
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

app.listen(port, () => {
    console.log(`app running on ${port}`);
  });
  
const express = require("express");
const cookieParser = require("cookie-parser");

// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "backend/config/config.env" });
}

const app = express();

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// importing routes
const userRoute = require("./routes/userRoutes");
const postRoute = require("./routes/postRoutes");

// using the routes
app.use("/api", userRoute);
app.use("/api", postRoute);

module.exports = app;

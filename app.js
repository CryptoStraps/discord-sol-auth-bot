var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
var submitRouter = require("./routes/submit");
var authRouter = require("./routes/auth");
var validateRouter = require("./routes/validate");
var statusRouter = require("./routes/get-list");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


var cors = require("cors");
app.use(cookieParser());
var allowedOrigins = [
  "https://whitelist.cryptostraps.io",
];

if (process.env.DEV === 'true') {
  allowedOrigins.push( "http://localhost:3000")
  allowedOrigins.push( "http://localhost:3001",)
}

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);
app.use("/auth", authRouter);
app.use("/validate", validateRouter);
app.use("/submit", submitRouter);
app.use("/status", statusRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(500).send("error");
});

module.exports = app;

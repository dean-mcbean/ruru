var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const { APP } = require("./constants");
//var { updateStoredUsers } = require('./slack_usecases/updateStoredUsers');

var indexRouter = require("./routes/index");

var app = express();

app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(
  cors({
    origin: APP.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/dashboard", (req, res, next) => {
  const filePath = path.join(__dirname, "../dashboard/dist", req.path);
  console.log(`[DEBUG] /dashboard requested: ${req.path} -> ${filePath}`);
  if (process.env.IS_DEVELOPMENT === "true") {
    console.log(
      `[DEBUG] In development mode, redirecting to Vue dev server at ${APP.DASHBOARD_DEV_ORIGIN}`,
    );
    return res.redirect(`${APP.DASHBOARD_DEV_ORIGIN}${req.path}`);
  } else {
    return express.static(path.join(__dirname, "./dashboard/dist"))(
      req,
      res,
      next,
    );
  }
});

// Optional: For SPA routing support
app.get("/dashboard/*", (req, res) => {
  res.sendFile(path.join(__dirname, "./dashboard/dist/index.html"));
});

app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

function initApp() {
  // Initialize the app
  // eslint-disable-next-line no-console
  console.log(">>> Initializing the app!");
  console.log("\t>>> Loading User Info...");
  //updateStoredUsers() //This exceeds the rate limit for the Slack API
  console.log("\t>>> Updating Home Pages...");
  console.log(">>> App Initialized!");
}
initApp();

module.exports = app;

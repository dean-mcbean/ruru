var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const updateHomeForDevs = require('./slack_usecases/updateHomeForDevs');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function initApp() {
  // Initialize the app
  // eslint-disable-next-line no-console
    console.log('>>> Initializing the app!');
    console.log('\t>>> Loading User Info...');
    //updateStoredUsers() This exceeds the rate limit for the Slack API
    console.log('\t>>> Updating Home Pages...');
    updateHomeForDevs()
    console.log('>>> App Initialized!');
}
initApp()

module.exports = app;

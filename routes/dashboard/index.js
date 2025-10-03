// routes/auth.ts
const express = require('express');
const codeCache = new Map(); // email → code
const signup = require('./auth/signup.js')(codeCache);
const verifyCode = require('./auth/verify.js')(codeCache);
const refreshCode = require('./auth/refresh.js');
const logout = require('./auth/logout.js');
const getRunnProjects = require('./runn/get_projects.js');
const requireDashboardAuth = require('../../middleware/requireDashboardAuth.js');

const router = express.Router();

// AUTH ROUTES
router.post('/signup', signup);
router.post('/verify', verifyCode);
router.post('/refresh', refreshCode);
router.post('/logout', logout);

// DATA ROUTES
router.get('/runn-projects', requireDashboardAuth, getRunnProjects);

module.exports = router;
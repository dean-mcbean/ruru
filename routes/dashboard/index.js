// routes/auth.ts
const express = require('express');
const codeCache = new Map(); // email → code
const signup = require('./auth/signup.js')(codeCache);
const verifyCode = require('./auth/verify.js')(codeCache);
const refreshCode = require('./auth/refresh.js');
const logout = require('./auth/logout.js');
const getRunnProjects = require('./runn/get_projects.js');
const getBasecampProjects = require('./basecamp/get_projects.js');
const requireDashboardAuth = require('../../middleware/requireDashboardAuth.js');
const { ensureBasecampToken } = require('../../middleware/basecamp');
const uploadMarkdown = require('./basecamp/upload-markdown.js');
const { createBasecampProject } = require('./basecamp/create_project.js');

const router = express.Router();

// AUTH ROUTES
router.post('/signup', signup);
router.post('/verify', verifyCode);
router.post('/refresh', refreshCode);
router.post('/logout', logout);

// DATA ROUTES
router.get('/runn-projects', requireDashboardAuth, getRunnProjects);
router.get('/basecamp/projects', requireDashboardAuth, ensureBasecampToken, getBasecampProjects);
router.post('/basecamp/project', requireDashboardAuth, ensureBasecampToken, createBasecampProject);
router.use(uploadMarkdown);

module.exports = router;
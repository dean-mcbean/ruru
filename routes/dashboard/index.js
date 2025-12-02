// routes/auth.ts
const express = require('express');
const codeCache = new Map(); // email → code
const signup = require('./auth/signup.js')(codeCache);
const verifyCode = require('./auth/verify.js')(codeCache);
const refreshCode = require('./auth/refresh.js');
const logout = require('./auth/logout.js');
const getRunnProjects = require('./runn/get_projects.js');
const createRunnProject = require('./runn/create_project.js');
const getBasecampProjects = require('./basecamp/get_projects.js');
const getHubspotDeals = require('./hubspot/get_deals.js');
const requireDashboardAuth = require('../../middleware/requireDashboardAuth.js');
const { ensureBasecampToken } = require('../../middleware/basecamp');
const uploadMarkdown = require('./basecamp/upload-markdown.js');
const { createBasecampProject } = require('./basecamp/create_project.js');
const { createBasecampTodolist } = require('./basecamp/create_todolist.js');
const notifyOnSlack = require('./slack/notifyOnSlack.js');
const getRunnClients = require('./runn/get_clients.js');

const router = express.Router();

// AUTH ROUTES
router.post('/signup', signup);
router.post('/verify', verifyCode);
router.post('/refresh', refreshCode);
router.post('/logout', logout);

// NOTIFICATIONS
router.post('/slack/notify', requireDashboardAuth, notifyOnSlack);

// DATA ROUTES
router.get('/runn/clients', requireDashboardAuth, getRunnClients);
router.get('/runn-projects', requireDashboardAuth, getRunnProjects);
router.post('/runn/projects', requireDashboardAuth, createRunnProject);
router.get('/hubspot/deals', requireDashboardAuth, getHubspotDeals);
router.get('/basecamp/projects', requireDashboardAuth, ensureBasecampToken, getBasecampProjects);
router.post('/basecamp/project', requireDashboardAuth, ensureBasecampToken, createBasecampProject);
router.post('/basecamp/todolist', requireDashboardAuth, ensureBasecampToken, createBasecampTodolist);
router.use(uploadMarkdown);

module.exports = router;
/**
 ***************************************************************
 * @documentation --> ../docs-code/API_Routes/Logout_Routes.md *
 ***************************************************************
**/

// IMPORTS + GLOBALS
const express = require('express');
const router = express.Router();

// ROUTES
router.get('/', (req, res) => {
    req.session.currentUser = undefined;
    res.clearCookie('_taskID');
    res.redirect('/login');
});

// EXPORTING ROUTES
module.exports = router;
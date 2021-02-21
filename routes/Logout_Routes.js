const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.app.locals.currentUser = {};
    res.clearCookie('_taskID');
    res.redirect('/login');
});

module.exports = router;
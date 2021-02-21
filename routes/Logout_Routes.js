const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.currentUser = undefined;
    res.clearCookie('_taskID');
    res.redirect('/login');
});

module.exports = router;
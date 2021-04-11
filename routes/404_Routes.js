/**
 ************************************************************
 * @documentation --> ../docs-code/API_Routes/404_Routes.md *
 ************************************************************
**/

// IMPORTS + GLOBALS
const express = require('express');
const router = express.Router();

// ROUTES
router.get('/', (req, res) => {
    res.sendFile('404.html', {root:'static'});
});

// EXPORTING ROUTES
module.exports = router;
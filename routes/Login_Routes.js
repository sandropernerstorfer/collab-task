/**
 **************************************************************
 * @documentation --> ../docs-code/API_Routes/Login_Routes.md *
 **************************************************************
**/

// IMPORTS + GLOBALS
const express = require('express');
const router = express.Router();

// ROUTES
router.get('/', (req, res) => {
    if(req.cookies._taskID){
        res.redirect('/board');
    }
    else{
        res.sendFile('login.html', {root: 'static'});
    } 
});

router.use('/*?', (req,res) => {
    res.redirect('/login');
});

// EXPORTING ROUTES
module.exports = router;
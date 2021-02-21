const express = require('express');
const router = express.Router();

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

module.exports = router;
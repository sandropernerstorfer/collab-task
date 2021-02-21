const express = require('express');
const router = express.Router();
const Desk = require('../models/Desk');
const User = require('../models/User');

router.get('/', (req, res) => {
    if(Object.keys(req.app.locals.currentUser).length == 0){
        res.redirect('/login');
    }
    else{
        res.sendFile('board.html', {root: 'static'});
    }
});

router.get('/boarddata', async (req, res) => {
    let desks = [];
    let sharedDesks = [];
    let invites = [];

    if(req.app.locals.currentUser.desks.length > 0){
        desks = await Desk.find().where('_id').in(req.app.locals.currentUser.desks).exec();
    }
    if(req.app.locals.currentUser.sharedDesks.length > 0){
        sharedDesks = await Desk.find().where('_id').in(req.app.locals.currentUser.sharedDesks).exec();
    }
    if(req.app.locals.currentUser.invites.length > 0){
        invites = await Desk.find().where('_id').in(req.app.locals.currentUser.invites).exec();
    }

    const boardData = {
        _id: req.app.locals.currentUser._id,
        name: req.app.locals.currentUser.name,
        image: req.app.locals.currentUser.image,
        desks: desks,
        sharedDesks: sharedDesks,
        invites: invites
    }
    res.end(JSON.stringify(boardData));
});

router.post('/desk', async (req, res) => {
    const desk = new Desk({
        name: req.body.name,
        color: req.body.color,
        admin: req.body.admin
    });
    const savedDesk = await desk.save();
    const updatedUser = await User.findOneAndUpdate({ _id: req.body.admin }, { $push: {desks: savedDesk._id}}, {new: true});
    req.app.locals.currentUser = updatedUser;
    res.end(JSON.stringify(savedDesk));
});

module.exports = router;
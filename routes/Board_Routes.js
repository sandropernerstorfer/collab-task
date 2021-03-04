const express = require('express');
const router = express.Router();
const Desk = require('../models/Desk');
const User = require('../models/User');

router.get('/', (req, res) => {
    if(!req.session.currentUser){
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
    const actualUser = await User.findOne({_id: req.session.currentUser._id});
    req.session.currentUser = actualUser;
    if(req.session.currentUser.desks.length > 0){
        desks = await Desk.find().where('_id').in(req.session.currentUser.desks).exec();
    }
    if(req.session.currentUser.sharedDesks.length > 0){
        sharedDesks = await Desk.find().where('_id').in(req.session.currentUser.sharedDesks).exec();
    }
    if(req.session.currentUser.invites.length > 0){
        invites = await Desk.find().where('_id').in(req.session.currentUser.invites).exec();
    }

    const boardData = {
        _id: req.session.currentUser._id,
        name: req.session.currentUser.name,
        image: req.session.currentUser.image,
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
    const updatedUser = await User.findOneAndUpdate({ _id: req.body.admin }, { $push: {desks: savedDesk._id}}, {new: true}).select('-password');
    req.session.currentUser = updatedUser;
    res.end(JSON.stringify(savedDesk));
});

router.patch('/invite', async (req, res) => {
    const inviteID = req.body.inviteID;
    await User.updateOne({_id: req.session.currentUser._id}, { $push: {sharedDesks: inviteID}});
    const updatedUser = await User.findOneAndUpdate({_id: req.session.currentUser._id}, { $pull: {invites: inviteID}}, {new: true}).select('-password');
    req.session.currentUser = updatedUser;
    await Desk.updateOne({_id: inviteID}, { $push: {members: req.session.currentUser._id}});
    res.end(JSON.stringify(true));
});

router.delete('/invite', async (req, res) => {
    const inviteID = req.body.inviteID;
    const updatedUser = await User.findOneAndUpdate({_id: req.session.currentUser._id}, { $pull: {invites: inviteID}}, {new: true}).select('-password');
    req.session.currentUser = updatedUser;
    res.end(JSON.stringify(true));
});

module.exports = router;
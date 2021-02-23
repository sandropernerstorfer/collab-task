const express = require('express');
const router = express.Router();
const Desk = require('../models/Desk');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.redirect('/board');
});

router.get('/deskdata', async (req, res) => {
    const userData = { id : req.session.currentUser._id, name : req.session.currentUser.name };
    let deskData = await Desk.findOne({ _id: req.session.currentDesk });
    const admin = await User.findOne({_id: deskData.admin})
        .select('-password -sessionid -invites -desks -sharedDesks');
    
    let members = [];
    if(deskData.members.length > 0){
        members = await User.find().where('_id').in(deskData.members)
            .select('-password -sessionid -invites -desks -sharedDesks').exec();
    };
    deskData = deskData.toObject();
    delete deskData.members;

    const fullDeskData = {
        user : userData,
        desk : deskData,
        admin : admin,
        members : members
    };
    res.status(200).end(JSON.stringify(fullDeskData));
});

router.use('/', express.static('static'));

router.get('/:deskID', (req, res) => {
    if(!req.cookies._taskID) res.redirect('/login')
    else{
        let desk;
        desk = req.session.currentUser.desks.find( desk => {
            return desk == req.params.deskID;
        });
        if(desk == undefined){
            desk = req.session.currentUser.sharedDesks.find( shared => {
                return shared == req.params.deskID;
            });    
        };   
        if(desk == undefined){
            res.redirect('/board');
        }
        else{
            req.session.currentDesk = desk;
            res.sendFile('desk.html', {root:'static'});
        }
    };
});

module.exports = router;
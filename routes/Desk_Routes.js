const express = require('express');
const router = express.Router();
const Desk = require('../models/Desk');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.redirect('/board');
});

router.get('/deskdata', async (req, res) => {
    const userData = { _id : req.session.currentUser._id, name : req.session.currentUser.name };
    let deskData = await Desk.findOne({ _id: req.session.currentDesk }).select('-date');
    const admin = await User.findOne({_id: deskData.admin})
        .select('-password -sessionid -invites -desks -sharedDesks');
    
    let members = [];
    if(deskData.members.length > 0){
        members = await User.find().where('_id').in(deskData.members)
            .select('-password -sessionid -invites -desks -sharedDesks').exec();
    };
    deskData = deskData.toObject();
    delete deskData.members;
    delete deskData.admin;

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

router.patch('/deskname', async (req, res) => {
    const updatedDesk = await Desk.findOneAndUpdate({_id : req.session.currentDesk}, { $set: {name: req.body.deskname}}, {new: true}).select('name');
    res.end(JSON.stringify(updatedDesk.name));
});

router.delete('/leave', async (req, res) => {
    const updatedUser = await User.findOneAndUpdate({_id: req.session.currentUser._id}, {$pull: {sharedDesks: req.session.currentDesk}}, {new: true}).select('-password');
    await Desk.updateOne({_id: req.session.currentDesk}, {$pull: {members: req.session.currentUser._id}});
    req.session.currentUser = updatedUser;
    res.end(JSON.stringify(true));
});

router.delete('/delete', async (req, res) => {
    const targetDesk = await Desk.findOneAndDelete({_id: req.session.currentDesk});
    if(!targetDesk){
        res.status(404).end();
    };
    await User.updateOne({_id : targetDesk.admin}, {$pull: {desks: req.session.currentDesk}});

    function updateMember(i = 0){
        if(!targetDesk.members[i]) return;
        User.updateOne({_id : targetDesk.members[i]}, { $pull: {sharedDesks: req.session.currentDesk}}, {}, (err, data) => {
            return updateMember(i+1);    
        });
    };
    updateMember();
    res.end();
});

router.post('/list', async (req, res) => {
    const newList = {
        name: req.body.name
    }
    const updatedLists = await Desk.findOneAndUpdate({_id: req.session.currentDesk}, {$push: {lists: newList}}, {new: true}).select('lists');
    res.end(JSON.stringify(updatedLists.lists));
});

router.delete('/list/:listID', async (req, res) => {
    const listID = req.params.listID;
    const desk = await Desk.findOne({_id: req.session.currentDesk});
    desk.lists = desk.lists.filter( list => list._id != listID);
    const updated = await desk.save();
    res.end(JSON.stringify(updated.lists));
});

router.post('/task', async (req, res) => {
    const newTask = {
        name: req.body.name
    };
    const desk = await Desk.findOne({_id: req.session.currentDesk});
    desk.lists.forEach( list => {
        if(list._id == req.body.listID){
            list.tasks.push(newTask);
        };
    });
    const updated = await desk.save();
    res.end(JSON.stringify(updated.lists));
});

module.exports = router;
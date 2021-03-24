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

router.patch('/list/order', async (req, res) => {
    const listArray = req.body;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        desk.lists.forEach( list => {
            const foundOrder = listArray.find( newList => {
                if(list._id == newList.id){
                    const index = listArray.indexOf(newList);
                    listArray.splice(index,1);
                    return newList;
                };
            });
            if(foundOrder){
                list.order = foundOrder.order;
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    };
});

router.patch('/list/name', async (req, res) => {
    const { listID, newName } = req.body;

    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);

        desk.lists[listIndex].name = newName;

        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    };
});

router.delete('/list/:listID', async (req, res) => {
    const listID = req.params.listID;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err || !doc){
            res.end(JSON.stringify(false));
        }
    });
    desk.lists = desk.lists.filter( list => list._id != listID);
    const updated = await desk.save();
    res.end(JSON.stringify(updated.lists));
});

router.post('/task', async (req, res) => {
    const newTask = {
        name: req.body.name
    };
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        desk.lists.forEach( list => {
            if(list._id == req.body.listID){
                list.tasks.push(newTask);
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    }
});

router.delete('/task/:listID/:taskID', async (req, res) => {
    const {listID, taskID} = req.params;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);
        desk.lists[listIndex].tasks = desk.lists[listIndex].tasks.filter( task => task._id != taskID);
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    }
});

router.patch('/task/name', async (req, res) => {
    const {name, listID, taskID} = req.body;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);
        desk.lists[listIndex].tasks.forEach( task => {
            if(task._id == taskID){
                task.name = name;
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));    
    }
});

router.patch('/task/description', async (req, res) => {
    const {desc, listID, taskID} = req.body;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);

        desk.lists[listIndex].tasks.forEach( task => {
            if(task._id == taskID){
                task.description = desc;
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    }
});

router.patch('/task/order', async (req, res) => {
    const {list1, list2} = req.body;

    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        let iteration = 1, targetTask;
        updateTasks(list1);
        updateTasks(list2);

        function updateTasks(taskArray){
            if(taskArray == undefined) return;
            listID = taskArray.shift();

            const getIndexWithID = list => list._id == listID;
            const listIndex = desk.lists.findIndex(getIndexWithID);

            desk.lists[listIndex].tasks.forEach( task => {

                const foundOrder = taskArray.find( newTask => {
                    if(task._id == newTask.id){
                        const index = taskArray.indexOf(newTask);
                        taskArray.splice(index,1);
                        return newTask;
                    };
                });

                if(foundOrder){
                    task.order = foundOrder.order;
                }
                else{
                    targetTask = task;
                    const index = desk.lists[listIndex].tasks.indexOf(task);
                    desk.lists[listIndex].tasks.splice(index,1);
                };
            });

            if(taskArray.length > 0){
                if(iteration == 2){
                    targetTask.order = taskArray[0].order;
                    desk.lists[listIndex].tasks.push(targetTask);
                };
            };
            iteration++;
        };

        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    };
});

router.post('/:listID/:taskID/member', async (req, res) => {
    const userID = req.body.userID;
    const listID = req.params.listID;
    const taskID = req.params.taskID;
    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);

        desk.lists[listIndex].tasks.forEach( task => {
            if(task._id == taskID){
                task.members.push(userID);
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    };
});

router.delete('/:listID/:taskID/:userID', async (req, res) => {
    const listID = req.params.listID;
    const taskID = req.params.taskID;
    const userID = req.params.userID;

    const desk = await Desk.findOne({_id: req.session.currentDesk}, (err, doc) => {
        if(err) res.end(JSON.stringify(false));
    });
    if(desk){
        const getIndexWithID = list => list._id == listID;
        const listIndex = desk.lists.findIndex(getIndexWithID);

        desk.lists[listIndex].tasks.forEach( task => {
            if(task._id == taskID){
                task.members = task.members.filter( member => member != userID);
            };
        });
        const updated = await desk.save();
        res.end(JSON.stringify(updated.lists));
    }
    else{
        res.end(JSON.stringify(false));
    };
});

module.exports = router;
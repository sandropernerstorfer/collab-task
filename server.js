const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
require('dotenv/config');
const User = require('./models/User');
const Desk = require('./models/Desk');
let currentUser = {};
let choosenDesk = '';

// Server Listen & Database Connection
const PORT = process.env.PORT || 5400;
app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);

//Middleware
mongoose.set('useFindAndModify', false);
app.use('/', express.static(__dirname + '/static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Functions
async function getUserDataLocal(req, res, next){
    if(req.cookies._taskID && Object.keys(currentUser).length !== 0){
        next();
    }
    else{
        if(req.cookies._taskID){
            const user = await User.findOne({sessionid: req.cookies._taskID}, (err, found) => {
                if(err){
                    req.clearCookie('_taskID');
                    next();
                };
            }).select('-password');
            if(user == null){
                currentUser = {};
                res.clearCookie('_taskID');
            }
            else{
                currentUser = user;
            }
            next();
        }
        else{
            next();
        }
    }
};

// GET AND SAVE USERDATA
app.use(getUserDataLocal);                          // gets User-Data by comparing cookieID and DB sessionID

//HOMEPAGE DATA
app.get('/userdata', (req, res) => {
    if(Object.keys(currentUser).length == 0){
        res.end(JSON.stringify(false));
    }
    else{
        res.end(JSON.stringify(currentUser.name));
    }
});

//LOGIN-ROUTES
app.use('/login/*?', (req,res) => {                 // catch all routes following Login and redirect to /login
    res.redirect('/login');
});
app.use('/login', (req, res) => {                   // if path /login AND cookieID found -> redirect to board / else login
    if(req.cookies._taskID){
        res.redirect('/board');
    }
    else{
        res.sendFile('login.html', {root: 'static'});
    } 
});

//USER-ROUTES
app.post('/user/signup', async (req, res) => {      // SIGNUP users and create session -> when done redirects to '/board'
    // suche USER in DB nach EMAIL
    const userExists = await User.findOne({email: req.body.email}, (err, found) => {
        if(err){
            res.redirect('/login');
        }
    });

    if(userExists != null){             // wenn user nicht null ist (also existiert) -> respond: existiert bereits
        res.end('user exists');
    }
    else{                               // wenn user noch nicht existiert    
        try{
            const sessionID = uuidv4();     // generiert uuid für session management
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const user = new User({         // neuer USER
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                sessionid: sessionID
            });
            const savedUser = await user.save();                // speichert USER in Datenbank
            currentUser = savedUser;                            // speichert USER lokal
            res.cookie('_taskID', sessionID, {httpOnly: false});    // erstellt cookie mit selber sessionID
            res.end();                                          // ende - client leitet auf /board
        }
        catch(err){
            res.json(err);
        };
    }
});
app.post('/user/signin', async (req, res) => {      // SIGNIN users and create session -> when done redirects to '/board'
    const userExists = await User.findOne({email: req.body.email}, (err, found) => {
        if(err){
            res.redirect('/login');
        }
    });

    if(userExists == null){             // wenn user NICHT existiert -> respond: kein user , kein login
        res.end('no user');
    }
    else{                               // wenn user existiert -> vergleiche passwörter
        try{
            if(await bcrypt.compare(req.body.password, userExists.password)){
                const sessionID = uuidv4();                             // wenn passwörter gleich -> erstelle neue sessionID
                const updatedUser = await User.findOneAndUpdate({ email: req.body.email }, { $set: {sessionid: sessionID}}, {new: true});   // sessionID update in datenbank
                res.cookie('_taskID', sessionID, {httpOnly: false});    // erstelle cookie mit gleicher sessionID
                currentUser = updatedUser;                          // USER lokal speichern
                res.end();                                      // ende - client leitet auf /board
            }
            else{
                res.end('wrong password');  // wenn passwörter nicht gleich -> respond: falsches passwort
            }
        }
        catch(err){
            res.json(err);
        }
    }
});
app.patch('/user/username', async (req, res) => {
    const updatedUser = await User.findOneAndUpdate({ _id: currentUser._id }, { $set: {name: req.body.username}}, {new: true});
    currentUser = updatedUser;
    res.end(JSON.stringify(currentUser.name));
});

//BOARD-ROUTES
app.get('/board', (req,res) => {
    if(Object.keys(currentUser).length == 0){
        res.redirect('/login');
    }
    else{
        res.sendFile('board.html', {root: 'static'});
    }
});
app.get('/board/userdata', async (req, res) => {
    let desks = [];
    let sharedDesks = [];
    let invites = [];

    if(currentUser.desks.length > 0){
        desks = await Desk.find().where('_id').in(currentUser.desks).exec();
    }
    if(currentUser.sharedDesks.length > 0){
        sharedDesks = await Desk.find().where('_id').in(currentUser.sharedDesks).exec();
    }
    if(currentUser.invites.length > 0){
        invites = await Desk.find().where('_id').in(currentUser.invites).exec();
    }

    const boardData = {
        _id: currentUser._id,
        name: currentUser.name,
        image: currentUser.image,
        desks: desks,
        sharedDesks: sharedDesks,
        invites: invites
    }
    res.end(JSON.stringify(boardData));
});
app.post('/board/desk', async (req, res) => {
    const desk = new Desk({
        name: req.body.name,
        color: req.body.color,
        admin: req.body.admin
    });
    const savedDesk = await desk.save();
    const updatedUser = await User.findOneAndUpdate({ _id: req.body.admin }, { $push: {desks: savedDesk._id}}, {new: true});
    currentUser = updatedUser;
    res.end(JSON.stringify(savedDesk));
});

//DESK-ROUTES
app.get('/desk', (req, res) => {
    res.redirect('/board');
});
app.use('/desk', express.static(__dirname + '/static'));

app.get('/desk/:deskID', (req, res) => {
    if(!req.cookies._taskID) res.redirect('/login')
    else{
        let desk;
        desk = currentUser.desks.find( desk => {
            return desk._id == req.params.deskID;
        });
        if(desk == undefined){
            desk = currentUser.sharedDesks.find( shared => {
                return shared._id == req.params.deskID;
            });    
        };   
        if(desk == undefined){
            res.redirect('/board');
        }
        else{
            choosenDesk = desk;
            res.sendFile('desk.html', {root:'static'});
        }
    };
});
app.get('/deskdata', async (req, res) => {
    const deskData = await Desk.findOne({ _id: choosenDesk });
    let members = [];

    if(deskData.members.length > 0){
        members = await User.find().where('_id').in(deskData.members).exec();
    };  //!! CUT OUT SENSITIVE DATA

    deskData.members = members;
    const userData = {
        name : currentUser.name,
        email : currentUser.email,
        image : currentUser.image
    };
    res.status(200).end(JSON.stringify([userData,deskData]));
});

// LOGOUT
app.get('/logout', (req, res) => {
    currentUser = {};
    res.clearCookie('_taskID');
    res.redirect('/login');
});
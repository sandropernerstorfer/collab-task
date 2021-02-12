const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
require('dotenv/config');
const User = require('./models/User');
let currentUser = {};

// Server Listen & Database Connection
const PORT = process.env.PORT || 5500;
app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);

//Middleware
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Functions
async function getUserDataLocal(req, res, next){
    if(req.cookies._taskID && Object.keys(currentUser).length > 0){ next(); };
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
        currentUser = {};
        next();
    }
};

// GET AND SAVE USERDATA
app.use(getUserDataLocal);                          // gets User-Data by comparing cookieID and DB sessionID

//HOMEPAGE DATA
app.get('/userdata', async (req, res) => {
    if(Object.keys(currentUser).length == 0 && req.cookies._taskID){
        const user = await User.findOne({sessionid: req.cookies._taskID}, (err, found) => {
            if(err){
                req.clearCookie('_taskID');
                res.end(JSON.stringify(false));
            }
        });
        if(user == null){
            currentUser = {};
            res.end(JSON.stringify(false));
        }
        else{
            currentUser = user;
            res.end(JSON.stringify(currentUser.name));
        }
    }
    else if(!req.cookies._taskID){
        currentUser = {};
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
app.use('/login', (req, res) => {                   // if path /login AND cookieID found -> redirect to desk / else login
    if(req.cookies._taskID){
        res.redirect('/desk');
    }
    else{
        res.sendFile('login.html', {root: 'static'});
    } 
});

//USER-ROUTES
app.post('/user/signup', async (req, res) => {      // SIGNUP users and create session -> when done redirects to '/desk'
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
            res.end();                                          // ende - client leitet auf /desk
        }
        catch(err){
            res.json(err);
        };
    }
});
app.post('/user/signin', async (req, res) => {      // SIGNIN users and create session -> when done redirects to '/desk'
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
                const updatedUser = await User.updateOne({ email: req.body.email }, { $set: {sessionid: sessionID}});   // sessionID update in datenbank
                res.cookie('_taskID', sessionID, {httpOnly: false});    // erstelle cookie mit gleicher sessionID
                currentUser = updatedUser;                          // USER lokal speichern
                res.end();                                      // ende - client leitet auf /desk
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

// DESK-ROUTES

app.get('/desk', (req,res) => {
    if(Object.keys(currentUser).length == 0){
        res.redirect('/login');
    }
    else{
        res.sendFile('board.html', {root: 'static'});
    }
});

app.get('/desk/userdata', (req, res) => {
    let desks = 0;
    let sharedDesks = 0;

    if(currentUser.desks.length > 0){
        // desks =  -> get deskinfos
    }
    if(currentUser.sharedDesks.length > 0){
        // sharedDesks =  -> get deskinfos
    }

    const boardData = {
        name: currentUser.name,
        desks: desks,
        sharedDesks: sharedDesks
    }
    res.send(JSON.stringify(boardData));
})

// LOGOUT
app.get('/logout', (req, res) => {
    currentUser = {};
    res.clearCookie('_taskID');
    res.redirect('/login');
});
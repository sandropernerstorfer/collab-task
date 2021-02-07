const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5500;
const User = require('./models/User');

app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);

let currentUser = {};

//Middleware
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    if(!req.cookies.logged){
        console.log('cookie no here');
        next();
    }
    else{
        console.log('cookie here');
        next();
    }
});

app.use('/login/*?', (req,res) => {                 // catch all routes following Login and redirect to /login
    res.redirect('/login');
});
app.use('/login', (req, res) => {                   // if path /login AND cookie found -> redirect to desk / else login
    if(req.cookies.logged){
        res.redirect('/desk');
    }
    else{
        res.sendFile(__dirname+'/static/login.html');
    } 
});
app.use((req, res, next) => {                       // if cookie NOT found -> redirect to login
    if(!req.cookies.logged){
        res.redirect('/login');
    }
    else{
        next();
    }
});

//USER-ROUTES
// POST - create user
app.post('/user', async (req, res) => {

    const userExists = await User.findOne({email: req.body.email}, (err,obj) => {
        try{
            console.log('checked db');
        }
        catch(err){
            res.end(err);
        }
        });
    if(req.body.name){
        if(userExists != null){
            res.end('user exists');
        }
        else{
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });

            try{
                const savedUser = await user.save();
                currentUser = savedUser;
                res.end();
            }
            catch(err){
                res.json(err);
            };
        }
    }
    else{
        if(userExists == null){
            res.end('no user');
        }
        else{
            const correctPassword = userExists.password == req.body.password ? true : false;

            if(!correctPassword) res.end('wrong password');
            else{
                currentUser = userExists;
                res.end();
            }
        }
    }
});

// DESK-ROUTES

app.get('/desk', (req,res) => {
    res.sendFile(__dirname+'/static/board.html')
});

app.get('/desk/userdata', (req, res) => {
    res.send(JSON.stringify(currentUser));
})

// LOGOUT
app.get('/logout', (req, res) => {
    currentUser = {};
    res.status(200).end();
});
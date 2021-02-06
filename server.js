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

app.use('/login', (req, res) => {                   // always allow access to login page
    if(req.cookies.logged){
        res.redirect('/desk');
    }
    else{
        res.sendFile(__dirname+'/static/login.html');
    } 
});

app.use((req, res, next) => {                       // check if logged in. if not -> redirect to login
    if(!req.cookies.logged){
        res.redirect('/login');
    }
    else{
        next();
    }
});

app.use('/desk', (req,res,next) => {                // send desk.html on /desk route
    res.sendFile(__dirname+'/static/desk.html');
    next();
});

// Routing

//USER-ROUTES

// POST - create user
app.post('/user', async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    });

    try{
        const savedUser = await user.save();
        res.json(savedUser);
    }
    catch(err){
        res.json(err);
    };
});

// DESK-ROUTES
app.get('/desk', (req,res) => {
    
});
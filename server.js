const express = require('express');
const app = express();
const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const cookieParser = require("cookie-parser");
require('dotenv/config');

// Import Routes
const 
User_Routes = require('./routes/User_Routes'),
Login_Routes = require('./routes/Login_Routes'),
Logout_Routes = require('./routes/Logout_Routes'),
Board_Routes = require('./routes/Board_Routes'),
Desk_Routes = require('./routes/Desk_Routes'),
NotFound_Routes = require('./routes/404_Routes');

// Local Data Storing
app.locals.currentUser = {};
app.locals.currentDesk = '';

// Middleware
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Get and Save Userdata
const User = require('./models/User');
app.use(getUserDataLocal);
async function getUserDataLocal(req, res, next){
    if(req.cookies._taskID && Object.keys(req.app.locals.currentUser).length !== 0){
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
                req.app.locals.currentUser = {};
                res.clearCookie('_taskID');
            }
            else{
                req.app.locals.currentUser = user;
            }
            next();
        }
        else{
            next();
        }
    }
};

// ROUTING
app.use('/login', Login_Routes);
app.use('/user', User_Routes);
app.use('/board', Board_Routes);
app.use('/desk', Desk_Routes);
app.use('/logout', Logout_Routes);
app.use('/*?', NotFound_Routes);

// PORT & DB Connection
const PORT = process.env.PORT || 5400;
app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);
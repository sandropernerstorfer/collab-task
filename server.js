const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv/config');
const loginRoute = require('./routes/loginRouter');
const deskRoute = require('./routes/deskRouter');

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});

let user = {};
let logged = true;

//Middleware
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/login', (req, res) => {                   // always allow access to login page
    if(logged) res.redirect('/desk');
    res.sendFile(__dirname+'/static/login.html');
});

app.use((req, res, next) => {                       // check if logged in. if not -> redirect to login
    if(!logged) res.redirect('/login')
    else next();
});

app.use('/desk', (req,res,next) => {                // send desk.html on /desk route
    res.sendFile(__dirname+'/static/desk.html');
    next();
});

// Routing

app.use('/login', loginRoute);
app.use('/desk', deskRoute);

// Database Connection
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);
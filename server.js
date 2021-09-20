/**
 ******************************************************
 * @documentation --> ./docs-code/Server/server.js.md *
 ******************************************************
**/

// Import Packages
const 
express = require('express'),
app = express(),
session = require('express-session'),
socket = require('socket.io'),
cookieParser = require('cookie-parser'),
mongoose = require('mongoose');
require('dotenv/config');

// Import Routes
const 
User_Routes = require('./routes/User_Routes'),
Login_Routes = require('./routes/Login_Routes'),
Logout_Routes = require('./routes/Logout_Routes'),
Board_Routes = require('./routes/Board_Routes'),
Desk_Routes = require('./routes/Desk_Routes'),
NotFound_Routes = require('./routes/404_Routes');

// PORT & DB Connection
const PORT = process.env.PORT || 5400;
app.set('port', PORT);
app.set('trust proxy', 1);
const server = app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);

// Middleware
mongoose.set('useFindAndModify', false);
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret : process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: {sameSite: 'lax', httpOnly: false} }));

// Check User/Session Status
const User = require('./models/User');
app.use(getUserDataLocal);
async function getUserDataLocal(req, res, next){
    if(req.cookies._taskID && req.session.currentUser){
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
                req.session.currentUser = undefined;
                res.clearCookie('_taskID');
            }
            else{
                req.session.currentUser = user;
            }
            next();
        }
        else{
            next();
        }
    }
};

// ROUTING
app.get('/', (req, res) => {
    res.sendFile('index.html', {root:'static'});
    res.end();
});
app.use('/login', Login_Routes);
app.use('/user', User_Routes);
app.use('/board', Board_Routes);
app.use('/desk', Desk_Routes);
app.use('/logout', Logout_Routes);
app.use('/*?', NotFound_Routes);

// Socket Connections / Events
const io = socket(server);
io.on('connection', socket => {
    socket.on('join', obj => {
        socket.join( obj.room );
        socket.userID = obj.id;
        socket.name = obj.name;
        socket.desk = obj.room;
    });
    socket.on('board-join', id => socket.join( id ));
    socket.on('sent-invite', id => socket.broadcast.to( id ).emit( 'new-invite' ));
    socket.on('invite-accepted', room => socket.broadcast.to( room ).emit( 'new-member' ));
    socket.on('member-leaving', id => socket.broadcast.to( socket.desk ).emit( 'left-member', id ));
    socket.on('desk-deletion', members => {
        socket.broadcast.to( socket.desk ).emit( 'desk-deleted' );
        members.forEach( board => {
            socket.broadcast.to( board ).emit( 'board-deleted' );
        });
    });
    socket.on('lists-change', lists => socket.broadcast.to( socket.desk ).emit( 'lists-changed', lists));
    socket.on('deskname-change', deskname => socket.broadcast.to( socket.desk ).emit( 'new-deskname', deskname ));
    socket.on('chat-send', obj => socket.broadcast.to( socket.desk ).emit( 'chat-receive', obj ));
    socket.on('chat-here', name => socket.broadcast.to( socket.desk ).emit( 'chat-otherHere', { id: socket.userID, name: name }));
    socket.on('status-here', id => socket.broadcast.to( socket.desk ).emit( 'status-otherHere', id ));
    socket.on('disconnect', () => socket.broadcast.to( socket.desk ).emit( 'desk-leave', { id: socket.userID, name: socket.name }));
});
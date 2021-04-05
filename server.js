const 
express = require('express'),
app = express(),
socket = require('socket.io'),
session = require('express-session'),
cookieParser = require("cookie-parser"),
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

// Middleware
mongoose.set('useFindAndModify', false);
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret : process.env.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: {sameSite: true} }));

/**
 * Check Status, Get and Save User Data (Middleware)
 * 
 * kontrolliert den User status und speichert user daten in das session objekt
 * .) ist der session cookie & session data vorhanden wird die middleware übersprungen
 * .) ist nur der session cookie vorhanden wird damit der passende user in der Datenbank gesucht
 *    wird kein User gefunden (zB. wegen falscher cookieID) wird der cookie gelöscht und session data zurückgesetzt
 *    ansonsten speichere die nötigen user daten in das session objekt
 */
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
app.use('/login', Login_Routes);
app.use('/user', User_Routes);
app.use('/board', Board_Routes);
app.use('/desk', Desk_Routes);
app.use('/logout', Logout_Routes);
app.use('/*?', NotFound_Routes);

// PORT & DB Connection
const PORT = process.env.PORT || 5400;
const server = app.listen(PORT);
mongoose.connect(
    process.env.DB_CONNECTION, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
        console.log('DB Connected');
    }
);

const io = socket(server);
io.on('connection', socket => {

    // join wird von client ausgelöst wenn ein user einen desk öffnet
    // client schickt: url-path und username. Welche im socket gespeichert werden
    // socket tritt raum bei welcher den namen der url-location hat
    socket.on('join', obj => {
        socket.join( obj.room );
        socket.userID = obj.id;
        socket.name = obj.name;
        socket.desk = obj.room;
    });

    // board-join wird von client ausgelöst wenn ein user sein dashboard öffnet
    // tritt einem privaten raum bei welcher dann live invites empfangen kann
    socket.on('board-join', id => socket.join( id ));

    // sent-invite wird von client im desk ausgelöst wenn eine einladung verschickt wird
    // server löst dann new-invite im client des eingeladenen users aus
    socket.on('sent-invite', id => socket.broadcast.to( id ).emit( 'new-invite' ));

    // invite-accepted wird von client im dashboard ausgelöst wenn eine einladung angenommen wird
    // client schickt: deskID (von einladung / als socket room) und löst new-member in den clients aus
    // lädt die neue member liste mit dem neuzugang im client
    socket.on('invite-accepted', room => socket.broadcast.to( room ).emit( 'new-member' ));

    // member-leaving wird von client ausgelöst wenn dieser user den desk verlässt
    // client schickt die userID an server und löst in den anderen clients left-member aus
    // entfernt den user aus den clients
    socket.on('member-leaving', id => socket.broadcast.to( socket.desk ).emit( 'left-member', id ));

    // chat-send wird von client ausgelöst wenn eine nachricht verschickt wird
    // server löst dann chat-receive in den anderen clients im selben raum aus
    // schickt username und nachricht mit
    socket.on('chat-send', obj => socket.broadcast.to( socket.desk ).emit( 'chat-receive', obj ));

    // chat-here wird von client ausgelöst wenn ein user einen desk öffnet
    // server löst dann chat-otherHere in den anderen clients im selben raum aus
    // schickt username mit
    socket.on('chat-here', name => socket.broadcast.to( socket.desk ).emit( 'chat-otherHere', { id: socket.userID, name: name }));

    // status-here wird von client ausgelöst wenn ein anderer user auf den desk kommt
    // server löst status-otherHere in den anderen clients aus um dem neuzugang anzuzeigen wer bereits online ist
    socket.on('status-here', id => socket.broadcast.to( socket.desk ).emit( 'status-otherHere', id ));

    // disconnect wird ausgelöst wenn die socket verbindung vom client getrennt wird
    // server löst dann desk-leave in den anderen clients im selben raum aus
    // schickt username mit
    socket.on('disconnect', () => socket.broadcast.to( socket.desk ).emit( 'desk-leave', { id: socket.userID, name: socket.name }));
});
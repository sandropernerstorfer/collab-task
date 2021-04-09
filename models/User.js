/**
 *************************************************
 * @documentation --> ../docs-code/db-schemas.md *
 *************************************************
**/

const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    sessionid: {
        type: String,
        required: true
    },
    desks: 
        [String]
    ,
    sharedDesks:
        [String]
    ,
    invites: 
        [String]
    ,
    image: {
        type: String,
        default: null
    }
});

module.exports = mongoose.model('Users', UserSchema);
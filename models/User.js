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
    desks: {
        type: Array,
        default: []
    },
    sharedDesks: {
        type: Array,
        default: []
    },
    invites: {
        type: Array,
        default: []
    },
    image: {
        type: String,
        default: 'user-default.png'
    }
});

module.exports = mongoose.model('Users', UserSchema);
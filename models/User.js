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
    desks: {
        type: Array,
        default: []
    },
    sharedDesks: {
        type: Array,
        default: []
    }
});

module.exports = mongoose.model('Users', UserSchema);
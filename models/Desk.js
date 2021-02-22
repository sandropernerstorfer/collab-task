const mongoose = require('mongoose');

const DeskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    admin: {
        type: String,
        required: true
    },
    members: {
        type: Array,
        default: []
    },
    lists: {
        type: Array,
        default: []
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Desks', DeskSchema);
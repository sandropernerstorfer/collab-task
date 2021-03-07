const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    members: [String],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = TaskSchema;
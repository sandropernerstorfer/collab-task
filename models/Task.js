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
    },
    order: {
        type: Number,
        default: Number.MAX_SAFE_INTEGER
    }
});

module.exports = TaskSchema;
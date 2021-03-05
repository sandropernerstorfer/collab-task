const mongoose = require('mongoose');
const Task = require('./Task');

const ListSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    tasks: 
        [Task]
    ,
    order: {
        type: Number,
        default: 0
    }
});

module.exports = ListSchema;
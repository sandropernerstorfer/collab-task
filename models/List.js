/**
 *************************************************
 * @documentation --> ../docs-code/db-schemas.md *
 *************************************************
**/

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
        default: Number.MAX_SAFE_INTEGER
    }
});

module.exports = ListSchema;
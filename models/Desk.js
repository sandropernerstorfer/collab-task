/**
 **********************************************************
 * @documentation --> ../docs-code/Database/db-schemas.md *
 **********************************************************
**/

const mongoose = require('mongoose');
const List = require('./List');

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
    members: 
        [String]
    ,
    lists: 
        [List]
    ,
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Desks', DeskSchema);
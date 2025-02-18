const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {       
        title: String,
        status: String,
        content: String,
        timeStart: Date,
        timeFinish: Date,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    }, 
    {
        timestamps: true
    }
);

const Task = mongoose.model('Task', taskSchema, "tasks"); // tasks: tên table(collection) trong database

module.exports = Task;
import mongoose from 'mongoose';
const { Schema } = mongoose;

const taskSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean, 
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("Task" , taskSchema)

export default Task;
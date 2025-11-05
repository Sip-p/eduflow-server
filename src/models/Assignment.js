import mongoose from "mongoose";
const AssignmentSchema=new mongoose.Schema({
    
    description:{
        type:String,
        trim:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        // required:true
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
    },
    dueDate:{
        type:Date,
        required:true
    },
    totalPoints:{
        type:Number,
        default:100
    },
    attachments:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    assignmentNumber:{
        type:Number,
        required:true
    },

});
const Assignment=mongoose.model('Assignment',AssignmentSchema);
export default Assignment;
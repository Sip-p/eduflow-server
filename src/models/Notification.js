 import mongoose from 'mongoose'
const notificationScema=new mongoose.Schema({
    recipient:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      message: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course",required:true },
  read: { type: Boolean, default: false },
},{timestamps:true})

export default mongoose.model('Notification',notificationScema)
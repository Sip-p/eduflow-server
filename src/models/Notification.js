import mongoose from 'mongoose'
const notificationScema=new mongoose.Schema({
    recipient:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
      message: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  read: { type: Boolean, default: false },
},{timestamps:true})

export default mongoose.model('NOtification',notificationScema)
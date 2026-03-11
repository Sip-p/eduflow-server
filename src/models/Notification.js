import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ['Course Published', 'Course Update', 'Assignment Deadline', 'New Announcement', 'Student Enrolled'],
    required: true
  },
  message:  { type: String, required: true },
  course:   { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // removed required:true
  data:     { type: Object, default: {} }, // ← add this for flexible payload (studentId etc)
  read:     { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('Notification', notificationSchema)
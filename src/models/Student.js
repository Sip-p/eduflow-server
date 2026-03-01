import User from '../models/User.js'
import mongoose from 'mongoose'

const studentSchema=new mongoose.Schema({
    coursesenrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
        
    }],
  courseProgress: [
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    
    completedLessons: [{  // ← track individual lessons, not just course status
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    }],
    
    lastAccessedLesson: { // ← "continue where you left off"
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    
    // Derived — calculate from completedLessons.length / course.totalLessons
    progressPercent: { type: Number, default: 0 },
    
    status: {
      type: String,
      enum: ['not started', 'continue', 'completed'],
      default: 'not started'
    },
    
    enrolledAt: { type: Date, default: Date.now }
  }
],
attemptedQuizzes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Quiz'
}]
})

export const student=User.discriminator("student",studentSchema)
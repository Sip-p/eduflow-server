// models/Lesson.js
import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },  // Cloudinary URL
  duration: { type: Number, default: 0 },       // in minutes
  order: { type: Number, required: true },       // Lesson 1, 2, 3 within chapter
  thumbnail: { type: String, default: '' },
  isFree: { type: Boolean, default: false },     // preview without enrollment
  
  // Parent references
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  course: {   // ← store courseId directly on lesson too
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
    // Why? So you can query "all lessons in course" without going through chapters
  },
  
  resources: [{ // ← PDFs, notes attached to lesson
    title: String,
    url: String
  }]
}, { timestamps: true });

LessonSchema.index({ chapter: 1, order: 1 }); // lessons within a chapter in order
LessonSchema.index({ course: 1 });             // all lessons in a course

export default mongoose.model('Lesson', LessonSchema);
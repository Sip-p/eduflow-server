// models/Chapter.js
import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: { type: Number, required: true }, // Chapter 1, 2, 3...
  isPublished: { type: Boolean, default: false }
}, { timestamps: true });

ChapterSchema.index({ course: 1, order: 1 }); // fetch chapters of a course in order

export default mongoose.model('Chapter', ChapterSchema);
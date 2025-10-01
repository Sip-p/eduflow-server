import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  videoUrl: { type: String, required: true },
  duration: { type: Number, default: 0 },
  order: { type: Number },
  thumbnail: { type: String, default: '' }
});

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // type:{type:String,enum:["free","paid"],required:true},
  price: { type: Number, required: true },
  category: { type: String, required: true },
  thumbnail: { type: String, required: true }, // updated here
  lessons: [LessonSchema],
  published: { type: Boolean, default: false },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentsEnrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  studentsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Course', CourseSchema);

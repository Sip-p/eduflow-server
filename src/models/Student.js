import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    coursesenrolled: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
          required: true
        },

        progressStatus: {
          type: String,
          enum: ["not started", "in-progress", "completed"],
          default: "not started"
        },

        progressPercent: {
          type: Number,
          default: 0
        },

        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson"
          }
        ],

        lastAccessedLesson: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Lesson",
          default: null
        },

        enrolledAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    attemptedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz"
      }
    ]
  },
  { timestamps: true }
);

// Prevent duplicate enrollment of same course
studentSchema.index({ studentId: 1, "coursesenrolled.course": 1 }, { unique: true });

const Student = mongoose.model("Student", studentSchema);
export default Student;
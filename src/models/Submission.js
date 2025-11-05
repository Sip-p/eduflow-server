// import mongoose from 'mongoose';

// const answerSchema = new mongoose.Schema({
//   question: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Question',
//     required: true
//   },
//   questionType: String,
//   // For MCQ/True-False
//   selectedOption: String,
//   // For Short Answer/Essay
//   textAnswer: String,
//   // For Code
//   codeAnswer: String,
//   codeLanguage: String,
//   executionResult: {
//     passed: Number,
//     failed: Number,
//     testResults: [{
//       testCase: Number,
//       passed: Boolean,
//       output: String,
//       error: String
//     }]
//   },
//   // For File Upload
//   fileUrl: String,
//   // Grading
//   isCorrect: Boolean,
//   pointsAwarded: {
//     type: Number,
//     default: 0
//   },
//   feedback: String,
//   gradedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   gradedAt: Date
// });

// const submissionSchema = new mongoose.Schema({
//   quiz: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Quiz',
//     required: true
//   },
//   student: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   course: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//     required: true
//   },
//   // Submission data
//   answers: [answerSchema],
//   // Status
//   status: {
//     type: String,
//     enum: ['in-progress', 'submitted', 'graded'],
//     default: 'in-progress'
//   },
//   attemptNumber: {
//     type: Number,
//     default: 1
//   },
//   // Timing
//   startedAt: {
//     type: Date,
//     default: Date.now
//   },
//   submittedAt: Date,
//   timeSpent: Number, // in seconds
//   // Scoring
//   totalScore: {
//     type: Number,
//     default: 0
//   },
//   percentage: {
//     type: Number,
//     default: 0
//   },
//   passed: {
//     type: Boolean,
//     default: false
//   },
//   // Auto-grading
//   autoGradedAt: Date,
//   needsManualGrading: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// // Indexes
// submissionSchema.index({ quiz: 1, student: 1 });
// submissionSchema.index({ course: 1, status: 1 });
// submissionSchema.index({ student: 1, status: 1 });

// // Calculate score
// submissionSchema.methods.calculateScore = function() {
//   this.totalScore = this.answers.reduce((sum, answer) => sum + (answer.pointsAwarded || 0), 0);
//   const quiz = this.quiz; // Should be populated
//   if (quiz && quiz.totalPoints > 0) {
//     this.percentage = (this.totalScore / quiz.totalPoints) * 100;
//     this.passed = this.percentage >= quiz.passingScore;
//   }
// };

// // Check if needs manual grading
// submissionSchema.methods.checkManualGrading = function() {
//   const manualTypes = ['essay', 'code', 'file-upload'];
//   this.needsManualGrading = this.answers.some(
//     answer => manualTypes.includes(answer.questionType) && !answer.gradedBy
//   );
// };

// export default mongoose.model('Submission', submissionSchema);
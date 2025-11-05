const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  questionType: String,
  // For MCQ/True-False
  selectedOption: String,
  // For Short Answer/Essay
  textAnswer: String,
  // For Code
  codeAnswer: String,
  codeLanguage: String,
  executionResult: {
    passed: Number,
    failed: Number,
    testResults: [{
      testCase: Number,
      passed: Boolean,
      output: String,
      error: String
    }]
  },
  // For File Upload
  fileUrl: String,
  // Grading
  isCorrect: Boolean,
  pointsAwarded: {
    type: Number,
    default: 0
  },
  feedback: String,
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date
});
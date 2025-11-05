import mongoose from 'mongoose'
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [String],
  correctAns: String,
  points: { type: Number, default: 1 }
}, { _id: true });

const quizSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        // required:true
    },
    instructor:{
        type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
    },
    duration:{
        type:String,
        default:60
    }
    ,totalPoints:{
        type:Number,
        default:0
    },
    passingScore:{
        type:Number,
        default:60
    },
     isPublished: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  maxAttempts: {
    type: Number,
    default: 1
  },
  allowReview: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  gradingType: {
    type: String,
    enum: ['automatic', 'manual', 'mixed'],
    default: 'automatic'
  },
  // Stats
  totalSubmissions: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  attemptedBy:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  questions:[questionSchema]
},{timestamps:true})

//Indexes
quizSchema.index({course:1,isPublished:1})
quizSchema.index({instructor:1});
quizSchema.index({course:1,instructor:1});


 


quizSchema.methods.updateTotalPoints=async function(){
    const Question=mongoose.model('Question');
    const questions = await Question.find({ quiz: this._id });
  this.totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  await this.save();
}

export default mongoose.model('Quiz', quizSchema);

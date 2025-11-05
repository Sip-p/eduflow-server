import mongoose from 'mongoose';
const AttemptQuizSchema=new mongoose.Schema({
    quizId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Quiz',
        required:true
    },
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    answers:[
        {
            questionId:{
                type:String,
            
                required:true
            },
            selectedOption:{
                type:String,
                required:true
            }
        }
    ],
    score:{
        type:Number,
        required:true
    },
    attemptedAt:{
        type:Date,
        default:Date.now
    },
    
});
const AttemptQuiz=mongoose.model('AttemptQuiz',AttemptQuizSchema);
export default AttemptQuiz;
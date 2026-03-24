// import mongoose from "mongoose";
// const options={discriminatorKey:"role",timestamps:true}
// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     // role: {
//     //     type: String,
//     //     enum: ["student", "teacher", "admin"],
//     // },
     
//     pic:{
//         type:String,
       
//         default:"https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
//     },
//     resetToken:{
//          type: String,
//     },resetTokenExpire:{
//          type: Date
//     },
    
//     // coursesenrolled:[{
//     //     type:mongoose.Schema.Types.ObjectId,
//     //     ref:"Course"
        
//     // }],
// //     courseProgress: [
// //   {
// //     course: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Course"
// //     },
// //     status: {
// //       type: String,
// //       enum: ["not started", "continue", "completed"],
// //       default: "not started"
// //     }
// //   }
// // ],
// // attemptedQuizzes:[{
// //     type:mongoose.Schema.Types.ObjectId,
// //     ref:'Quiz'
// // }]

 
// },
//  { options });

// const User = mongoose.model("User", userSchema);

// export default User;


import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
  },
  // TTL index — MongoDB auto-deletes unverified users after 1 hour
    // Once emailVerified = true, set this field to null to prevent deletion
    emailVerificationExpiry:{
       type:Date,
       default:()=>new Date(Date.now()+60*60*1000),
       index:{expireAfterSeconds:0}//TTL index to auto-delete after expiry time
    }
,
  password: {
    type: String,
    required: true
  },
  role: {                     // ✅ ADD THIS
    type: String,
    enum: ["student", "teacher"],
    required: true
  },
  pic: {
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg"
  },
  resetToken: {
    type: String,
  },
  resetTokenExpire: {
    type: Date
  }
  ,
 coursesenrolled: [
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    progressStatus: { 
      type: String, 
      enum: ['in-progress', 'completed'],
      default: 'in-progress' 
    }
  }
],
courseProgress: [          // ← ADD THIS BACK
    {
      course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
      status: { type: String, enum: ["not started", "continue", "completed"], default: "not started" },
      completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
      progressPercent: { type: Number, default: 0 },
      lastAccessedLesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', default: null }
    }
  ]
}, { timestamps: true });      // ✅ FIXED THIS

const User = mongoose.model("User", userSchema);

export default User;

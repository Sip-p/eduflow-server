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
  coursesenrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
        
    }],
}, { timestamps: true });      // ✅ FIXED THIS

const User = mongoose.model("User", userSchema);

export default User;

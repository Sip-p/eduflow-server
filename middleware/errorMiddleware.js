// class AppError extends Error {
//   constructor(message, statusCode) {
//     super(message)
//     this.statusCode = statusCode
//     this.isOperational = true
//   }
// }
// // Global error handling middleware
// const errorHandler=(err,req,res,next)=>{
//     let statusCode=err.statusCode||500
//     let message=err.message||'Internal Server Error'
    
//     //Mongoose duplicate Key error
//     if(err.code===11000){
//         message=`${Object.keys(err.keyValue)} already exists`
//         statusCode=400
//     }
//     //Mongoose validation error
//     if(err.name==='ValidationError'){
//         message=Object.values(err.errors).map(e=>e.message).join(', ')
//         statusCode=400
//     }
//     //JWT errors
//     if(err.name==='JsonWebTokenError'){
//         message='Invalid token. Please log in again.'
//         statusCode=401
//     }
//     if(err.name==='TokenExpiredError'){
//         message='Your token has expired. Please log in again.'
//         statusCode=401
//     }
//     res.status(statusCode).json({
//         success:false,
//         message,
//         // Include stack trace in development environment ONLY
//         ...(process.env.NODE_ENV==='development' && {stack:err.stack})
//     })
// }
// export default{AppError,errorHandler}
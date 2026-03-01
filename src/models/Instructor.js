import User from '../models/User.js'
import mongoose from 'mongoose'

const InstructorSchema=new mongoose.Schema({
    totalcourseCreated:[
        { type: mongoose.Schema.Types.ObjectId, ref: "Course" }
    ]
});

export const Instructor=User.discriminator('Instructor',InstructorSchema)
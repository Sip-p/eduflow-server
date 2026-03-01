import express from "express";
import Course from "../models/Course.js";
import Assignment from "../models/Assignment.js";
export const createAssignment=async(req,res)=>{
    try {
        // console.log("Request body for creating assignment:", req.body);
        const {description,course,dueDate,totalPoints,assignmentNumber,attachments}=req.body;
         const instructorId=req.user._id;
// console.log("Creating assignment with data:", req.body);
        const courseFound=await Course.findOne({
            title:course,
            instructor:instructorId,
        })
        console.log("Found course for assignment:", courseFound);
        if(!courseFound){
            return res.status(404).json({ message: "Course doesn't exists" });
        }
        const newAssignment=new Assignment({
           
            description,
            course:courseFound._id,
            instructor:instructorId,
            dueDate,
            totalPoints,
            attachments,
            assignmentNumber
        });
        await newAssignment.save();
        // console.log("Assignment created successfully:", newAssignment);
        res.status(201).json({

            message:"Assignment created successfully",
            assignment:newAssignment
        })
    } catch (error) {
        // console.log("Error creating assignment:", error.message);
        res.status(500).json({
            message:"Error creating assignment",
            error:error.message
        })
    }
}

export const getCourseAssignments=async(req,res)=>{
    try {
       const {courseId}=req.params; 
       const assignments=await Assignment.find({course:courseId})
    //    console.log("Fetched assignments for course:", courseId, assignments);
       res.status(200).json({
        assignments
       })
    } catch (error) {
        res.status(500).json({
            message:"Error fetching assignments",
            error:error.message
        })
    }
}

export const openAssignment = async (req, res) => {
  try {
    const { publicId } = req.params;
    const pdfUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      secure: true,
    });
    res.redirect(pdfUrl); // ✅ browser opens it directly
  } catch (err) {
    res.status(500).json({ message: "Failed to open assignment", error: err.message });
  }
};
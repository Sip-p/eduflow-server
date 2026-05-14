import express from 'express'
import Quiz from '../models/Quizzes.js'
import Course from "../models/Course.js";
import User from '../models/User.js';
import AttemptQuiz from '../models/AttemptQuiz.js';
import mongoose from 'mongoose';
const stripHtml = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, "").trim();
};

export const getAllQuizzesOfInstructor = async (req, res) => {
  try {

    const quizzes = await Quiz.find({ instructor: req.user._id });

    return res.status(200).json({ success: true, quizzes });
  } catch (error) {
    // console.error("Error fetching quizzes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllQuizzes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 6;
  const skip = (page - 1) * limit;
  const type = req.query.type || "new";
  // console.log("Fetching all quizzes for user:", req.user._id);
  try {
    const quizzes = await Quiz.find({});
    const attemptedQuizzesDocs = await AttemptQuiz.find({ studentId: req.user._id }).populate('quizId', 'title description duration course');

    // Filter valid attempts (in case a quiz was deleted)
    const validAttempts = attemptedQuizzesDocs.filter(a => a.quizId != null);

    const attemptedQuizIds = validAttempts.map(a => a.quizId._id.toString());

    // Connect to quizzes so frontend gets detail of each quiz attempted
    const attemptedQuizzes = validAttempts.map(a => ({
      _id: a.quizId._id,
      title: stripHtml(a.quizId.title),
      description: stripHtml(a.quizId.description),
      duration: a.quizId.duration,
      course: a.quizId.course,
      attemptId: a._id,
      score: a.score,
      attemptedAt: a.attemptedAt
    }));




    // Filter not attempted

    const notattemptedQuizzes = quizzes
      .filter(quiz => !attemptedQuizIds.includes(quiz._id.toString()))
      .map(quiz => ({
        _id: quiz._id,
        title: stripHtml(quiz.title),
        description: stripHtml(quiz.description),
        duration: quiz.duration,
        course: quiz.course
      }));



    const selectedData =
      type === "attempted" ? attemptedQuizzes : notattemptedQuizzes;

    const total = selectedData.length;


    const paginatedData = selectedData.slice(skip, skip + limit);
    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      data: paginatedData
    });

  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const createQuiz = async (req, res) => {
  console.log("Creating quiz with data:", req.body);
  try {
    // console.log("User creating quiz:", req.user);
    const instructorId = req.user._id;
    const { questionsData, metaData } = req.body;
    const {
      title,
      description,
      course,
      duration,
      totalPoints,
      passingScore,
      isPublished,
      startDate,
      endDate,
      maxAttempts,
      allowReview,
      showCorrectAnswers,
      shuffleQuestions,
      shuffleOptions,
      gradingType,



    } = metaData;
    // console.log("Course ID:", course);
    const coursefound = await Course.findOne({
      title: stripHtmlTags(course),
      instructor: req.user._id,
    });

    // console.log("Found course:", coursefound);
    if (!coursefound) {
      return res.status(404).json({ message: "Course doesn't exists" });
    }

    // ✅ Check if course exists
    // const courseExists = await Course.findById(course);
    // if (!courseExists) {
    //   return res.status(404).json({ message: "Course not found" });
    // }

    // ✅ Create quiz object
    const quizData = {
      title,
      description,
      passingScore,
      isPublished,
      startDate,
      endDate,
      maxAttempts,
      allowReview,
      showCorrectAnswers,
      shuffleQuestions,
      shuffleOptions,
      gradingType,
      duration: duration || 60,
      totalPoints: totalPoints || 100,
      course: coursefound,
      instructor: req.user._id,
      questions: questionsData,
      instructor: instructorId,
    };
    // console.log("________",questionsData)
    const newQuiz = await Quiz.create(quizData);
    console.log("Quiz created successfully:", newQuiz);
    res.status(201).json({
      message: "✅ Quiz created successfully",
      quiz: newQuiz,
    });

  } catch (error) {
    // console.log(error.message)
    res.status(500).json({
      message: "❌ Error creating quiz",
      error: error.message,
    });
  }
};


export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.body
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json("Quiz id is required")
    }
    await Quiz.findByIdAndDelete(quiz)
    res.status(200).json("Quiz deleted succsessfully")
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
export const editQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updates = req.body;

    if (!quizId) {
      return res.status(400).json({ message: "Quiz id is required" })
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "quiz not found" })
    }
    const allowedFields = ["title", "description", "duration", "totalPoints", "passingScore", "isPublished", "startDate", "endDate",
      "maxAttempts",
      "allowReview",
      "showCorrectAnswers",
      "shuffleQuestions",
      "shuffleOptions",
      "gradingType",]

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        quiz[field] = updates[field]
      }
    }

    await quiz.save()
    res.status(200).json({
      message: "Quiz updated successfully", quiz
    })
  } catch (error) {
    // console.log("Error updating quiz",error)
    res.status(500).json({
      message: "Server error whille updating quiz", error: error.message
    })
  }
}



export const SubmitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body
    const studentId = req.user._id

    const quiz = await Quiz.findById(quizId)
    // console.log("Quiz Found------**",quiz)
    if (!quiz) {
      return res.status("No Quiz Found")
    }
    // console.log("Your Quiz------",quiz)
    // console.log("Your Answers------",answers)
    const student = await User.findById(studentId)
    // console.log("Student Found------",student)
    if (!student) {
      return res.status("No Student Found")
    }

    if (!Array.isArray(student.attemptedQuizzes)) {
      student.attemptedQuizzes = [];
    }
    if (!Array.isArray(quiz.attemptedBy)) {
      quiz.attemptedBy = [];
    }

    if (!quiz.attemptedBy.some(id => id.equals(studentId))) {
      quiz.attemptedBy.push(studentId);
      await quiz.save();
    }

    if (!student.attemptedQuizzes.some(id => id.equals(quizId))) {
      student.attemptedQuizzes.push(quizId);
      await student.save();
    }

    let score = 0;
    console.log(quiz)
    for (let i = 0; i < quiz.questions.length; i++) {

      if (quiz.questions[i].correctAns === answers[i]) {
        score += quiz.questions[i].points || 1


      }
    }
    const attempttedQuiz = new AttemptQuiz({
      quizId,
      studentId,
      answers: answers.map((ans, idx) => ({
        questionId: quiz.questions[idx]._id,
        selectedOption: ans
      })),
      score
    })
    await attempttedQuiz.save()
    // console.log("____",attempttedQuiz)

    res.status(200).json({ message: "Quiz submitted successfully", score })
  } catch (error) {
    // console.log("Error submitting quiz",error)
    res.status(500).json({ message: "Server error while submitting quiz", error: error.message })
  }
}

export const getQuizResult = async (req, res) => {
  try {
    console.log("Fetching quiz result for:", req.params);
    const quizId = req.params.id; // ✅ fixed
    const studentId = req.user._id;

    const attempt = await AttemptQuiz.findOne({ quizId, studentId })
      .populate("quizId");
    // console.log("Found attempt:", attempt);
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // Optional: compute rank
    const allAttempts = await AttemptQuiz.find({ quizId }).sort({ score: -1 });
    const rank =
      allAttempts.findIndex(
        (a) => a.studentId.toString() === studentId.toString()
      ) + 1;

    res.json({
      attempt,
      rank,
      totalStudents: allAttempts.length, score: attempt.score
    });
  } catch (error) {
    console.log("Error fetching quiz result", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttemptedQuizzes = async (req, res) => {
  console.log("Fetching attempted quizzes for user:", req.user._id);
  try {
    const studentId = req.user._id
    const attemptedQuizzes = await AttemptQuiz.find({ studentId }).populate('quizId', 'title description duration course')
    const myattemptedQuizzes = attemptedQuizzes.map(quiz => {
      return (
        {
          id: quiz._id,
          title: stripHtml(quiz.quizId?.title),
          description: stripHtml(quiz.quizId?.description),
          duration: quiz.quizId?.duration,
          course: quiz.quizId?.course,
          attemptedAt: quiz.attemptedAt,
          score: quiz.score,


        }
      )
    })
     res.status(200).json({ success: true, myattemptedQuizzes })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}







export const getQuizResultforInstructor = async (req, res) => {
  console.log("Fetching quiz result for instructor:", req.query);
  try {
    const { quizId } = req.query;
    const instructorId = req.user._id;

    if (!quizId) {
      return res.status(400).json({ message: "Quiz ID is required" });
    }

    // ✅ Find all attempts for this quiz and populate student details
    const attempts = await AttemptQuiz.find({ quizId }).populate("studentId");
    console.log("Attempts fetched from DB:", attempts);

    const studentIds = attempts.map(attempt => attempt.studentId._id);
    // console.log("Student IDs extracted:", studentIds);


    const scores = await Promise.all(
      studentIds.map(async (studentId) => {
        const studentAttempts = await AttemptQuiz.find({ quizId, studentId }).select('score')
        return { studentId, score: studentAttempts.map(a => a.score) }
      })
    )
    console.log("Scores extracted:", scores);
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ message: "No one attempted this quiz yet" });
    }

    console.log("✅ Attempts found:", attempts.length);
    res.status(200).json({ attempts: attempts, scores: scores });
  } catch (error) {
    console.error("❌ Error fetching quiz result:", error);
    res.status(500).json({ message: "Server error" });
  }
};






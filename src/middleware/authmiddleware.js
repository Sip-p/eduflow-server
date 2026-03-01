// import jwt from 'jsonwebtoken';
// import User from '../models/User.js';

// export const authenticateToken = async (req, res, next) => {
//   try {
//     // Step 1: Extract token
//     const authHeader = req.headers["authorization"];
//     // console.log("...........",authHeader)
//     const token = authHeader && authHeader.split(" ")[1];

//     // Step 2: Validate presence
//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         message: "Access token required"
//       });
//     }

//     // Step 3: Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Step 4: Validate decoded data
//     if (!decoded?.id) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token payload"
//       });
//     }

//     // Step 5: Find user
//     const user = await User.findById(decoded.id).select('-password');
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token - user not found"
//       });
//     }

//     // Step 6: Attach user and proceed
//     req.user = user;
//     next();

//   } catch (error) {
//     console.error("Auth middleware error:", error);

//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({
//         success: false,
//         message: "Token expired"
//       });
//     }

//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token"
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "Server error during authentication"
//     });
//   }
// };


import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Access token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid token - user not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res.status(500).json({ success: false, message: "Server error during authentication" });
  }
};

// Always use AFTER authenticateToken — req.user is guaranteed to exist
// router.post("/create", authenticateToken, restrictTo("teacher"), createCourse)
export const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Only ${roles.join(" or ")} can do this.`
    });
  }
  next();
};
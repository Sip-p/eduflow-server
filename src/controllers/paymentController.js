import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Helper: Get user from token
const getUserFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1]; // "Bearer <token>"
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
};

// ✅ Create Dummy Order
export const createOrder = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { courseId, amount } = req.body;
    if (!courseId || !amount) {
      return res.status(400).json({ message: "Course ID and amount required" });
    }

    // Create a fake orderId
    const orderId = `order_${Date.now()}`;

    res.status(200).json({
      orderId,
      courseId,
      amount,
      message: "Dummy order created successfully",
    });
  } catch (err) {
    console.error("Error creating dummy order:", err);
    res.status(500).json({ message: "Failed to create dummy order" });
  }
};

// ✅ Verify Dummy Payment
export const verifyPayment = async (req, res) => {
  try {
    const userId = getUserFromToken(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { orderId, courseId } = req.body;
    if (!orderId || !courseId) {
      return res.status(400).json({ message: "Order ID and Course ID required" });
    }

    // Here you would normally save payment info
    // For dummy, just say success
    await User.findByIdAndUpdate(userId, {
      $addToSet: { purchasedCourses: courseId },
    });

    res.status(200).json({
      message: "Dummy payment verified successfully. Course unlocked!",
      orderId,
      courseId,
    });
  } catch (err) {
    console.error("Error verifying dummy payment:", err);
    res.status(500).json({ message: "Failed to verify dummy payment" });
  }
};

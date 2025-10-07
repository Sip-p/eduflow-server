import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const AccountDelete = async (req, res) => {
  try {
    const authorization = req.headers["authorization"];
    if (!authorization) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // ✅ Delete user by ID
    const deletedUser = await User.findByIdAndDelete(decoded.id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

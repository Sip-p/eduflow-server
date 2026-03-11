import Notification from "../models/Notification.js";

export const getAllNotifications = async (req, res) => {
  try {
    // ✅ use authenticated user's id — never trust client-sent userId4
console.log("User ID from token:", req.user._id); // debug log to verify user ID
    const userId = req.user._id;
console.log("Logged in user:", req.user._id);
    const notifications = await Notification.find({ recipient: userId })
      .populate("course", "title thumbnail")
      .sort({ createdAt: -1 });

    // ✅ response shape matches what your store expects: data.notifications
    return res.status(200).json({
      success: true,
      notifications,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};
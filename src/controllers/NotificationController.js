import Notification from "../models/Notification.js";

// Get all notifications (for now global, later you can filter by user)
export const getAllNotifications = async (req, res) => {
  try {
    // Optional: filter by recipient if you pass userId in query
    const { userId } = req.query;

    let query = {};
    if (userId) {
      query.recipient = userId;
    }

    const notifications = await Notification.find(query)
      .populate("recipient", "name email")  // show user details
      .populate("course", "title")          // show course details
      .sort({ createdAt: -1 });             // newest first

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

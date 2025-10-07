// server/src/controllers/GroupChatController.js
import GroupMessage from "../models/GroupMessage.js";

export const getAllMessage = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!courseId) {
      return res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
    }

    // const messages = await GroupMessage.find({ courseId })
    //   .populate("sender", "name email pic") // get sender info
    //   .sort({ timestamp: 1 }); // sort oldest → newest

    // res.status(200).json({
    //   success: true,
    //   count: messages.length,
    //   messages,
    // });

    const messages = await GroupMessage.find({ courseId })
  .populate("sender", "name email pic")
  .sort({ timestamp: 1 });

const formattedMessages = messages.map(msg => ({
  ...msg._doc,
  user: msg.sender ? {
    _id: msg.sender._id,
    name: msg.sender.name,
    pic: msg.sender.pic
  } : {
    _id: "system",
    name: "Anonymous",
    pic: "https://via.placeholder.com/40"
  }
}));

res.status(200).json({
  success: true,
  count: messages.length,
  messages: formattedMessages,
});

  } catch (error) {
    // console.error("❌ Error fetching group messages:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

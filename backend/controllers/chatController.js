const Message = require("../models/Message");
const ConnectionRequest = require("../models/ConnectionRequest");

// Get chat history between current user and a friend
exports.getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { friendId } = req.params;

    // Check if they are connected (accepted connection request)
    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: userId, recipient: friendId, status: "accepted" },
        { sender: friendId, recipient: userId, status: "accepted" },
      ]
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with connected peers.",
      });
    }

    // Fetch messages between the two users
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: friendId },
        { sender: friendId, recipient: userId },
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest

    // Mark messages as read
    await Message.updateMany(
      { sender: friendId, recipient: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch chat history.",
      error: error.message,
    });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { friendId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required.",
      });
    }

    // Check if they are connected
    const connection = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, recipient: friendId, status: "accepted" },
        { sender: friendId, recipient: senderId, status: "accepted" },
      ]
    });

    if (!connection) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with connected peers.",
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      recipient: friendId,
      content: content.trim(),
    });

    res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message.",
      error: error.message,
    });
  }
};

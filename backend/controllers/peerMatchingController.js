const User = require("../models/User");
const KMeansClustering = require("../algorithms/kmeans");
const { userToNumbers, calculateMatchScore } = require("../utils/peerMatching");

// ===== STEP 4: API CONTROLLERS =====

// Update user profile (interests and skills)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { interests, skills, academicLevel } = req.body;

    const updates = {};
    if (interests) updates.interests = interests;
    if (skills) updates.skills = skills;
    if (academicLevel) updates.academicLevel = academicLevel;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Get peer matches
exports.getPeerMatches = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;

    // Get current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get all other active users
    const allUsers = await User.find({
      _id: { $ne: userId },
      isActive: true,
    }).select(
      "firstName lastName avatar university major academicLevel interests skills plan"
    );

    if (allUsers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No other users available",
        data: { matches: [] },
      });
    }

    // Convert all users to numbers
    const allUsersNumbers = allUsers.map((user) => userToNumbers(user));
    const currentUserNumbers = userToNumbers(currentUser);

    // Create 3 groups using K-Means
    const kmeans = new KMeansClustering(3);
    const userGroups = kmeans.cluster(allUsersNumbers);
    const myGroup = kmeans.findGroup(currentUserNumbers);

    // Get users from my group
    const myGroupUsers = allUsers.filter(
      (_, idx) => userGroups[idx] === myGroup
    );

    // Calculate match scores for users in my group
    const matches = myGroupUsers
      .map((user) => ({
        user,
        matchScore: calculateMatchScore(currentUser, user),
      }))
      .filter((match) => match.matchScore > 0) // Only show if some match
      .sort((a, b) => b.matchScore - a.matchScore) // Highest score first
      .slice(0, parseInt(limit)); // Limit results

    res.status(200).json({
      success: true,
      data: {
        matches: matches.map((match) => ({
          _id: match.user._id,
          firstName: match.user.firstName,
          lastName: match.user.lastName,
          avatar: match.user.avatar,
          university: match.user.university,
          major: match.user.major,
          academicLevel: match.user.academicLevel,
          interests: match.user.interests,
          skills: match.user.skills,
          plan: match.user.plan,
          matchScore: match.matchScore,
        })),
        totalUsers: allUsers.length,
        matchesFound: matches.length,
      },
    });
  } catch (error) {
    console.error("Get peer matches error:", error);
    res.status(500).json({
      success: false,
      message: "Error finding peer matches",
      error: error.message,
    });
  }
};

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "firstName lastName email avatar university major academicLevel interests skills plan"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Get a specific user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      "firstName lastName avatar university major academicLevel interests skills plan"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    });
  }
};

// Browse all users
exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, search = "" } = req.query;

    const query = {
      _id: { $ne: userId },
      isActive: true,
    };

    // Search by name, university, interests, or skills
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { university: { $regex: search, $options: "i" } },
        { interests: { $in: [new RegExp(search, "i")] } },
        { skills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const users = await User.find(query)
      .select(
        "firstName lastName avatar university major academicLevel interests skills plan"
      )
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

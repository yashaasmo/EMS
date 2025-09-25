import Tag from "../Models/Tag.js";
import User from "../Models/user.model.js";

import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
// ✅ Create Tag (Admin Only)
export const createTag = async (req, res, next) => {
  try {
    const { name, isTrending } = req.body;
    const userId = req.user?._id;

    if (!name) {
      return res.status(400).json({ success: false, message: "Tag name required" });
    }

    const tag = await Tag.create({
      name,
      isTrending: isTrending || false,
      createdBy: userId,
    });

    res.status(201).json({
      success: true,
      message: MESSAGES.CREATED,
      data: tag,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Get All Tags
export const getAllTags = async (req, res, next) => {
  try {
    const tags = await Tag.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tags });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Tag
export const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, isTrending } = req.body;

    const tag = await Tag.findByIdAndUpdate(
      id,
      { name, isTrending },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.status(200).json({ success: true, data: tag });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Tag
export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByIdAndDelete(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.status(200).json({ success: true, message: "Tag deleted" });
  } catch (error) {
    next(error);
  }
};

// ✅ Get Trending Topics (Admin-marked)
export const getTrendingTopics = async (req, res, next) => {
  try {
    const trendingTags = await Tag.find({ isTrending: true })
       .populate("news", " slug_en ") .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: trendingTags });
  } catch (error) {
    next(error);
  }
};


export const getMyProfile = async (req, res, next) => {
    try {
        // req.user is populated by your authentication middleware
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing from token.");
        }

        // Find the user by ID and select specific fields.
        // You might want to select more fields for a user's *own* profile compared to a public profile.
        // const user = await User.findById(userId).select('name email profileImage role country state city address dateOfBirth');
            const user = await User.findById(userId)
      .select("name email profileImage role address dateOfBirth")
      .populate("country", "name code") // only name, code
      .populate("state", "name")        // only name
      .populate("city", "name");        // only name


        if (!user) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);
        }

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: MESSAGES.USER_FETCHED_SUCCESS,
            data: user,
        });

    } catch (error) {
        console.error("Error getting current user's profile:", error);
        next(error);
    }
};
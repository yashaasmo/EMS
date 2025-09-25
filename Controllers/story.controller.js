import Story from "../Models/story.model.js";
import User from "../Models/user.model.js";
import { uploadFileToSpaces } from "../Services/s3Service.js";
import { generateSlug } from "../Utils/slugifyUtils.js";
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:3000";

// ✅ Create Story
export const createStory = async (req, res) => {
  try {
    let { title, summary, category, tags = [], slides = [] } = req.body;
    const userId = req.user?._id;

    if (!title || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Title & Category required" });
    }

    // Ensure tags is array
    if (typeof tags === "string") {
      try {
        tags = JSON.parse(tags);
      } catch {
        tags = [tags];
      }
    }

    // Ensure slides is array
    if (typeof slides === "string") {
      try {
        slides = JSON.parse(slides);
      } catch {
        slides = [];
      }
    }

    // ✅ Upload new files (if any)
    let uploadedSlides = [];
    if (req.files && req.files.length > 0) {
      uploadedSlides = await Promise.all(
        req.files.map(async (file, index) => {
          const url = await uploadFileToSpaces(file, "story-slides");

          let caption = "";
          if (Array.isArray(req.body.captions)) {
            caption = req.body.captions[index] || "";
          } else if (req.body[`captions[${index}]`]) {
            caption = req.body[`captions[${index}]`];
          }

          return {
            mediaUrl: url,
            mediaType: file.mimetype.startsWith("video") ? "video" : "image",
            caption,
          };
        })
      );
    }

    const allSlides = [...slides, ...uploadedSlides];

    const user = await User.findById(userId);
    const status = user?.canDirectPost ? "posted" : "pending_approval";

    // ✅ Pehle story create karo
    const story = await Story.create({
      title,
      summary,
      category,
      tags,
      slides: allSlides,
      createdBy: userId,
      updatedBy: userId,
      status,
      publishedAt: status === "posted" ? new Date() : null,
    });

    // ✅ Slug & Share Link update
    story.slug = `${generateSlug(title, "hi")}-${story._id}`;
    story.shareLink = `${FRONTEND_BASE_URL}/story/${story.slug}`;
    await story.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: story,
    });
  } catch (error) {
    console.error("Error creating story:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to create story",
        error: error.message,
      });
  }
};

// ✅ Get All Stories
export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().populate("createdBy", "name")  .populate("category", "name") .sort({ createdAt: -1 });
    res.json({ success: true, data: stories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching stories" });
  }
};

// ✅ Get Single Story
export const getStoryById = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findById(storyId).populate("createdBy", "name");
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, data: story });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching story" });
  }
};

// Delete Story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });

    await story.deleteOne(); // Remove the story

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({ success: false, message: "Failed to delete story", error: error.message });
  }
};


export const addSlidesToStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    // We expect 'slides' from req.body to be pre-existing slides (if any, not the files)
    // and 'captions' to be an array corresponding to the uploaded files.
    let { slides = [], captions = [] } = req.body; // Added 'captions' here

    // Ensure slides is array (if they were sent as stringified JSON)
    if (typeof slides === "string") {
      try { slides = JSON.parse(slides); } catch { slides = []; }
    }
    // Ensure captions is array
    if (typeof captions === "string") {
      try { captions = JSON.parse(captions); } catch { captions = []; }
    }


    // ✅ Upload new files and associate with captions
    let uploadedFilesWithCaptions = [];
    if (req.files && req.files.length > 0) {
      uploadedFilesWithCaptions = await Promise.all(
        req.files.map(async (file, index) => { // Added 'index' here
          const url = await uploadFileToSpaces(file, "story-slides");
          return {
            mediaUrl: url,
            mediaType: file.mimetype.startsWith("video") ? "video" : "image",
            caption: captions[index] || file.originalname || "", // Use caption from req.body.captions
          };
        })
      );
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found" });
    }

  
    story.slides.push(...slides, ...uploadedFilesWithCaptions); // Keep existing 'slides' if any, then add the newly uploaded ones.
    story.updatedBy = req.user?._id;
    await story.save();

    res.json({
      success: true,
      message: "Slides added successfully",
      data: story,
    });
  } catch (error) {
    console.error("Error adding slides:", error);
    res.status(500).json({ success: false, message: "Failed to add slides", error: error.message });
  }
};


// export const addSlidesToStory = async (req, res) => {
//   try {
//     const { storyId } = req.params;
//     let { slides = [] } = req.body;

//     // Ensure slides is array
//     if (typeof slides === "string") {
//       try { slides = JSON.parse(slides); } catch { slides = []; }
//     }

//     // ✅ Upload new files if any
//     let uploadedSlides = [];
//     if (req.files && req.files.length > 0) {
//       uploadedSlides = await Promise.all(
//         req.files.map(async (file) => {
//           const url = await uploadFileToSpaces(file, "story-slides");
//           return {
//             mediaUrl: url,
//             mediaType: file.mimetype.startsWith("video") ? "video" : "image",
//             caption: file.originalname || "",
//           };
//         })
//       );
//     }

//     const story = await Story.findById(storyId);
//     if (!story) {
//       return res.status(404).json({ success: false, message: "Story not found" });
//     }

//     // ✅ Add new slides
//     story.slides.push(...slides, ...uploadedSlides);
//     story.updatedBy = req.user?._id;
//     await story.save();

//     res.json({
//       success: true,
//       message: "Slides added successfully",
//       data: story,
//     });
//   } catch (error) {
//     console.error("Error adding slides:", error);
//     res.status(500).json({ success: false, message: "Failed to add slides", error: error.message });
//   }
// };
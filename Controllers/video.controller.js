import videoModel from "../Models/video.model.js";
import { SubCategory, Category } from '../Models/lookupData.model.js';
import { ApiError } from "../Utils/apiError.js";
import { MESSAGES, STATUS_CODES } from "../Utils/status.codes.messages.js";
import { uploadFileToSpaces } from "../Services/s3Service.js";
import { generateSlug } from '../Utils/slugifyUtils.js';
// Create Video
// export const createVideo = async (req, res, next) => {
//     try {
//         const { title, videoUrl, category, subCategory } = req.body;
//         const createdById = req.user?._id;

//         const missingFields = [];
//         if (!title) missingFields.push('Title');
//         if (!videoUrl) missingFields.push('Video URL');
//         if (!category) missingFields.push('Category');
//         if (!createdById) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing or not authenticated.");
//         }
//         if (missingFields.length > 0) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, `${MESSAGES.BAD_REQUEST}: Missing required fields: ${missingFields.join(', ')}`);
//         }

//        const categoryDoc = await Category.findById(category);
// if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category.");
// let subCategoryName = null;
// let subCategoryDoc = null;
// if (subCategory) {
//   subCategoryDoc = await SubCategory.findOne({ _id: subCategory, category: categoryDoc._id });
//   if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid subCategory.");
//      subCategoryName = subCategoryDoc.name; // <-- store name instead of ID
// }


//         const newVideo = new videoModel({
//             title,
//             videoUrl,
//             createdBy: createdById,
//             category: categoryDoc.name,
//             subCategory: subCategoryName || null,
//         });

//         const video = await newVideo.save();
//         const populatedVideo = await video.populate([
//             { path: 'createdBy', select: 'username email role profileImage' },
//             { path: 'updatedBy', select: 'username email' },
          
//         ]);

//         const finalVideoData = populatedVideo.toObject();
//         finalVideoData.category_name = finalVideoData.category;
//         finalVideoData.subCategory_name = finalVideoData.subCategory;

//         res.status(STATUS_CODES.CREATED).json({
//             success: true,
//             message: "Video added successfully.",
//             data: finalVideoData,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

export const createVideo = async (req, res, next) => {
  try {
    const { title, videoUrl, category, subCategory } = req.body;
    const createdById = req.user?._id;

    if (!title || !category || !createdById) {
      const missingFields = [];
      if (!title) missingFields.push('Title');
      if (!category) missingFields.push('Category');
      if (!createdById) missingFields.push('User ID');
      throw new ApiError(STATUS_CODES.BAD_REQUEST, `${MESSAGES.BAD_REQUEST}: Missing required fields: ${missingFields.join(', ')}`);
    }

    // ✅ Validate category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category.");

    // ✅ Validate subCategory if provided
    let subCategoryName = null;
    if (subCategory) {
      const subCategoryDoc = await SubCategory.findOne({ _id: subCategory, category: categoryDoc._id });
      if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid subCategory.");
      subCategoryName = subCategoryDoc.name;
    }

    // ✅ Handle file upload
    let finalVideoUrl = videoUrl || null;
    if (req.file) {
      // Assuming single file upload using multer.single('videoFile')
      finalVideoUrl = await uploadFileToSpaces(req.file, "videos");
    }

    if (!finalVideoUrl) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, "Either video URL or video file must be provided.");
    }

    const newVideo = new videoModel({
      title,
      videoUrl: finalVideoUrl,
      createdBy: createdById,
      category: categoryDoc.name,
      subCategory: subCategoryName,
    });

    const video = await newVideo.save();
     // ✅ Slug update karo
    video.slug = `${generateSlug(title, "hi")}-${video._id}`;
    await video.save();

    const populatedVideo = await video.populate([
      { path: 'createdBy', select: 'username email role profileImage' },
      { path: 'updatedBy', select: 'username email' },
    ]);

    const finalVideoData = populatedVideo.toObject();
    finalVideoData.category_name = finalVideoData.category;
    finalVideoData.subCategory_name = finalVideoData.subCategory;

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Video added successfully.",
      data: finalVideoData,
    });
  } catch (error) {
    next(error);
  }
};


// Get All Videos
export const getAllVideos = async (req, res, next) => {
    try {
        const videos = await videoModel.find({})
            .populate('createdBy', 'username email role profileImage')
            .populate('updatedBy', 'username email')
            .sort({ createdAt: -1 });
         

        const finalVideos = videos.map(video => {
            const v = video.toObject();
            v.category_name = video.category;
            v.subCategory_name = video.subCategory;
            return v;
        });

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: finalVideos.length,
            data: finalVideos,
        });
    } catch (error) {
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.SERVER_ERROR_FETCHING_HEADLINES, [error.message]));
    }
};

// Get Video By ID
export const getVideoById = async (req, res, next) => {
    try {
        const video = await videoModel.findById(req.params.id)
            .populate('createdBy', 'username email role profileImage')
            .populate('updatedBy', 'username email');

        if (!video) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        const finalVideoData = video.toObject();
        finalVideoData.category_name = finalVideoData.category;
        finalVideoData.subCategory_name = finalVideoData.subCategory;

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            data: finalVideoData,
        });
    } catch (error) {
        next(error);
    }
};

// Update Video
export const updateVideo = async (req, res, next) => {
    try {
        const { title, videoUrl, category, subCategory } = req.body;
        const updatedById = req.user?._id;

        const updateData = {};

        const currentVideo = await videoModel.findById(req.params.id);
        if (!currentVideo) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        if (title !== undefined) updateData.title = title;
        if (videoUrl !== undefined) updateData.videoUrl = videoUrl;

        if (category !== undefined) {
    if (!category) {
        updateData.category = null;
        updateData.subCategory = null;
    } else {
        const categoryDoc = await Category.findById(category); // <-- change here
        if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Provided category ID is invalid.");
        updateData.category = categoryDoc.name; // store name in DB
    }
} else {
    updateData.category = currentVideo.category;
}


        // SubCategory handling
       if (subCategory !== undefined) {
    if (!subCategory) {
        updateData.subCategory = null;
    } else {
        const subCategoryDoc = await SubCategory.findById(subCategory);
        if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Provided subCategory ID is invalid.");
        updateData.subCategory = subCategoryDoc.name;
    }
}


        if (updatedById) updateData.updatedBy = updatedById;

        if (Object.keys(updateData).length === 0) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": No fields to update provided.");
        }

        const video = await videoModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate([
            { path: 'createdBy', select: 'username email role profileImage' },
            { path: 'updatedBy', select: 'username email' }
        ]);

        const finalVideoData = video.toObject();
        finalVideoData.category_name = finalVideoData.category;
        finalVideoData.subCategory_name = finalVideoData.subCategory;

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Video updated successfully.",
            data: finalVideoData,
        });
    } catch (error) {
        next(error);
    }
};

// Delete Video
export const deleteVideo = async (req, res, next) => {
    try {
        const video = await videoModel.findByIdAndDelete(req.params.id);
        if (!video) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Video deleted successfully.",
            data: {},
        });
    } catch (error) {
        next(error);
    }
};

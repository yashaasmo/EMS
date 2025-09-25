// // controllers/shortsController.js
// import Shorts from '../Models/shorts.model.js';
// import User from '../Models/user.model.js';
// import { Category, SubCategory, Country, State, City } from '../Models/lookupData.model.js'; // Ensure these are imported if needed for other checks
// import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
// import { ApiError } from '../Utils/apiError.js';
// import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';

// // Helper to delete multiple files
// const deleteMultipleFiles = async (urls) => {
//     if (!urls || urls.length === 0) return;
//     const deletePromises = urls.map(url => deleteFileFromSpaces(url));
//     await Promise.allSettled(deletePromises); // Use allSettled to ensure all attempts are made
// };

// // @desc    Create a new short post
// // @route   POST /api/shorts
// // @access  Private (Reporter, Admin, SuperAdmin)
// // export const createShort = async (req, res, next) => {
// //     try {
// //         const { title, description } = req.body;
// //         const userId = req.user?._id;

// //         if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

// //         const user = await User.findById(userId);
// //         if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

// //         if (!title) {
// //             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title is required for a short.");
// //         }

// //         const videoFile = req.files['video'] ? req.files['video'][0] : null;
// //         const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

// //         if (!videoFile) {
// //             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Video file is required for a short.");
// //         }

// //         let videoUrl = '';
// //         let thumbnailUrl = '';

// //         try {
// //             videoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
// //         } catch (uploadError) {
// //             throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload video file.");
// //         }

// //         if (thumbnailFile) {
// //             try {
// //                 thumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
// //             } catch (uploadError) {
// //                 // If thumbnail upload fails, delete the video and re-throw
// //                 await deleteFileFromSpaces(videoUrl);
// //                 throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload thumbnail file.");
// //             }
// //         }

// //         // Decide status based on user permission
// //         const status = user.canDirectPost ? 'published' : 'pending_approval';

// //         const short = await Shorts.create({
// //             title,
// //             description,
// //             videoUrl,
// //             thumbnailUrl,
// //             status,
// //             createdBy: userId,
// //             publishedAt: (status === 'published') ? new Date() : null
// //         });

// //         res.status(STATUS_CODES.CREATED).json({
// //             message: MESSAGES.SHORT_CREATED_SUCCESS,
// //             data: short
// //         });

// //     } catch (error) {
// //         // If an error occurs after files are uploaded, try to clean them up
// //         if (req.files && req.files['video'] && req.files['video'][0]?.location) {
// //             await deleteFileFromSpaces(req.files['video'][0].location);
// //         }
// //         if (req.files && req.files['thumbnail'] && req.files['thumbnail'][0]?.location) {
// //             await deleteFileFromSpaces(req.files['thumbnail'][0].location);
// //         }
// //         next(error);
// //     }
// // };

// // export const createShort = async (req, res, next) => {
// //     let videoUrl = ''; // Declare outside try-catch to ensure scope for final cleanup
// //     let thumbnailUrl = ''; // Declare outside try-catch for similar reason

// //     try {
// //         const { title, description } = req.body;
// //         const userId = req.user?._id;

// //         if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

// //         const user = await User.findById(userId);
// //         if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

// //         if (!title) {
// //             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title is required for a short.");
// //         }

// //         const videoFile = req.files && req.files['video'] ? req.files['video'][0] : null;
// //         const thumbnailFile = req.files && req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

// //         if (!videoFile) {
// //             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Video file is required for a short.");
// //         }

// //         try {
// //             videoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
// //         } catch (uploadError) {
// //             console.error("Error uploading video file:", uploadError);
// //             throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload video file.");
// //         }

// //         if (thumbnailFile) {
// //             try {
// //                 thumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
// //             } catch (uploadError) {
// //                 // If thumbnail upload fails, delete the *already uploaded* video and re-throw
// //                 console.error("Error uploading thumbnail file:", uploadError);
// //                 if (videoUrl) await deleteFileFromSpaces(videoUrl); // Clean up video if it was uploaded
// //                 throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload thumbnail file.");
// //             }
// //         }

// //         // Decide status based on user permission
// //         const status = user.canDirectPost ? 'published' : 'pending_approval';

// //         const short = await Shorts.create({
// //             title,
// //             description,
// //             videoUrl,
// //             thumbnailUrl,
// //             status,
// //             createdBy: userId,
// //             publishedAt: (status === 'published') ? new Date() : null
// //         });

// //         res.status(STATUS_CODES.CREATED).json({
// //             message: MESSAGES.SHORT_CREATED_SUCCESS,
// //             data: short
// //         });

// //     } catch (error) {
// //         console.error("Error creating short:", error);
// //         // If an error occurs after files were successfully uploaded to Spaces
// //         // but before or during the database save, clean up the uploaded files.
// //         // This handles cases where `Shorts.create` fails.
// //         if (videoUrl) { // Check if video was successfully uploaded
// //             await deleteFileFromSpaces(videoUrl).catch(cleanupErr => console.error("Failed to clean up video after error:", cleanupErr));
// //         }
// //         if (thumbnailUrl) { // Check if thumbnail was successfully uploaded
// //             await deleteFileFromSpaces(thumbnailUrl).catch(cleanupErr => console.error("Failed to clean up thumbnail after error:", cleanupErr));
// //         }
// //         next(error); // Pass the original error to the error handling middleware
// //     }
// // };

// export const createShort = async (req, res, next) => {
//     let videoUrl = '';
//     let thumbnailUrl = '';

//     try {
//         const {
//             title,
//             description,
//             category,
//             subCategory,
//             country,
//             state,
//             city
//         } = req.body;

//         const userId = req.user?._id;

//         if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

//         const user = await User.findById(userId);
//         if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

//         if (!title) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title is required for a short.");
//         }

//         const videoFile = req.files?.['video']?.[0] || null;
//         const thumbnailFile = req.files?.['thumbnail']?.[0] || null;

//         if (!videoFile) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Video file is required for a short.");
//         }

//         try {
//             videoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
//         } catch (uploadError) {
//             console.error("Error uploading video file:", uploadError);
//             throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload video file.");
//         }

//         if (thumbnailFile) {
//             try {
//                 thumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
//             } catch (uploadError) {
//                 console.error("Error uploading thumbnail file:", uploadError);
//                 if (videoUrl) await deleteFileFromSpaces(videoUrl);
//                 throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload thumbnail file.");
//             }
//         }

//         const status = user.canDirectPost ? 'published' : 'pending_approval';

//         // 👇 Prepare shortData with required fields
//         const shortData = {
//             title,
//             description,
//             videoUrl,
//             thumbnailUrl,
//             status,
//             createdBy: userId,
//             publishedAt: status === 'published' ? new Date() : null,
//         };

//         // 👇 Only add these fields if they are provided
//         if (category) shortData.category = category;
//         if (subCategory) shortData.subCategory = subCategory;
//         if (country) shortData.country = country;
//         if (state) shortData.state = state;
//         if (city) shortData.city = city;

//         const short = await Shorts.create(shortData);

//         res.status(STATUS_CODES.CREATED).json({
//             message: MESSAGES.SHORT_CREATED_SUCCESS,
//             data: short
//         });

//     } catch (error) {
//         console.error("Error creating short:", error);
//         if (videoUrl) await deleteFileFromSpaces(videoUrl).catch(cleanupErr => console.error("Failed to clean up video after error:", cleanupErr));
//         if (thumbnailUrl) await deleteFileFromSpaces(thumbnailUrl).catch(cleanupErr => console.error("Failed to clean up thumbnail after error:", cleanupErr));
//         next(error);
//     }
// };


// // @desc    Get all shorts (with optional filters, sorting, pagination)
// // @route   GET /api/shorts
// // @access  Public
// export const getAllShorts = async (req, res, next) => {
//     try {
//         let query;

//         const reqQuery = { ...req.query };
//         const removeFields = ['select', 'sort', 'page', 'limit'];
//         removeFields.forEach(param => delete reqQuery[param]);

//         let queryStr = JSON.stringify(reqQuery);
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//         // Only show 'published' shorts to general public unless role is admin/superadmin
//         if (!['admin', 'superadmin'].includes(req.user?.role)) {
//             queryStr = JSON.parse(queryStr);
//             queryStr.status = 'pending_approval';
//             queryStr = JSON.stringify(queryStr);
//         }

//         query = Shorts.find(JSON.parse(queryStr));

//         if (req.query.select) {
//             const fields = req.query.select.split(',').join(' ');
//             query = query.select(fields);
//         }

//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(',').join(' ');
//             query = query.sort(sortBy);
//         } else {
//             query = query.sort('-createdAt');
//         }

//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const startIndex = (page - 1) * limit;
//         const endIndex = page * limit;
//         const total = await Shorts.countDocuments(JSON.parse(queryStr));
//         const totalPages = Math.ceil(total / limit);

//         query = query.skip(startIndex).limit(limit);

//         query = query.populate([
//             {
//                 path: 'createdBy',
//                 select: 'name email profileImage'
//             },
//             { path: 'likes.user', select: 'name profileImage' },
//             { path: 'comments.user', select: 'name profileImage' },
//             {
//         path: 'comments.replies.user', // <-- This line is MISSING
//         select: 'name profileImage'
//     }
//         ]);

//         const shorts = await query;

//         const pagination = {};
//         if (endIndex < total) {
//             pagination.next = { page: page + 1, limit };
//         }
//         if (startIndex > 0) {
//             pagination.prev = { page: page - 1, limit };
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: shorts.length,
//             pagination,
//             data: shorts.map(short => {
//                 const shortObj = short.toObject({ virtuals: true });
//                 shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
//                 shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];
//                 return shortObj;
//             }),
//             totalPages
//         });

//     } catch (error) {
//         console.error("Error getting all shorts:", error);
//         next(error);
//     }
// };

// // @desc    Get single short by ID
// // @route   GET /api/shorts/:id
// // @access  Public
// export const getShortById = async (req, res, next) => {
//     try {
//         const short = await Shorts.findById(req.params.id)
//             .populate([
//                 {
//                     path: 'createdBy',
//                     select: 'name email profileImage'
//                 },
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         if (!short) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
//         }

//         // Increment views count
//         short.viewsCount = (short.viewsCount || 0) + 1;
//         await short.save();

//         const shortObj = short.toObject({ virtuals: true });
//         shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
//         shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             data: shortObj,
//         });

//     } catch (error) {
//         console.error("Error getting short by ID:", error);
//         next(error);
//     }
// };

// // @desc    Update a short post
// // @route   PUT /api/shorts/:id
// // @access  Private (Reporter who created it, Admin, SuperAdmin)
// export const updateShort = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?._id;
//         const userRole = req.user?.role;
//         const { title, description, status } = req.body;

//         let short = await Shorts.findById(id);

//         if (!short) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
//         }

//         // Authorization: Only creator, admin, or superadmin can update
//         if (short.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this short.");
//         }

//         const updateFields = {};
//         if (title !== undefined) updateFields.title = title;
//         if (description !== undefined) updateFields.description = description;

//         // Handle video and thumbnail file uploads
//         const videoFile = req.files['video'] ? req.files['video'][0] : null;
//         const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

//         let filesToDelete = [];

//         if (videoFile) {
//             const newVideoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
//             if (short.videoUrl) filesToDelete.push(short.videoUrl); // Add old video to delete list
//             updateFields.videoUrl = newVideoUrl;
//         }

//         if (thumbnailFile) {
//             const newThumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
//             if (short.thumbnailUrl) filesToDelete.push(short.thumbnailUrl); // Add old thumbnail to delete list
//             updateFields.thumbnailUrl = newThumbnailUrl;
//         } else if (req.body.clearThumbnail === 'true' && short.thumbnailUrl) { // Frontend explicit clear
//             filesToDelete.push(short.thumbnailUrl);
//             updateFields.thumbnailUrl = null;
//         }


//         // Status Update Logic
//         let updatedStatus = short.status;
//         if (status) {
//             if (!['draft', 'pending_approval', 'published', 'rejected'].includes(status)) {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
//             }
//             if (['admin', 'superadmin'].includes(userRole)) {
//                 updatedStatus = status;
//             } else if (userRole === 'reporter') {
//                 if (['draft', 'pending_approval'].includes(status)) {
//                     updatedStatus = status;
//                 } else if (status === 'published' && req.user.canDirectPost) {
//                     updatedStatus = status;
//                 } else {
//                     throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
//                 }
//             } else {
//                 throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update short status.");
//             }
//         }
//         updateFields.status = updatedStatus;

//         // Set publishedAt if status changes to 'published' and it wasn't already
//         if (updateFields.status === 'published' && short.status !== 'published' && !short.publishedAt) {
//             updateFields.publishedAt = new Date();
//         }

//         updateFields.updatedBy = userId; // Track who updated it

//         short = await Shorts.findByIdAndUpdate(id, updateFields, {
//             new: true,
//             runValidators: true
//         });

//         // Delete old files after successful update
//         await deleteMultipleFiles(filesToDelete);

//         const populatedShort = await Shorts.findById(short._id)
//             .populate([
//                 { path: 'createdBy', select: 'name email profileImage' },
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         const finalShortData = populatedShort.toObject({ virtuals: true });
//         finalShortData.postedDate = populatedShort.publishedAt ? populatedShort.publishedAt.toISOString().split('T')[0] : null;
//         finalShortData.createdAtDate = populatedShort.createdAt.toISOString().split('T')[0];

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.SHORT_UPDATED_SUCCESS,
//             data: finalShortData,
//         });

//     } catch (error) {
//         console.error("Error updating short:", error);
//         next(error);
//     }
// };

// // @desc    Delete a short post
// // @route   DELETE /api/shorts/:id
// // @access  Private (Reporter who created it, Admin, SuperAdmin)
// export const deleteShort = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?._id;
//         const userRole = req.user?.role;

//         const short = await Shorts.findById(id);

//         if (!short) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
//         }

//         // Authorization: Only creator, admin, or superadmin can delete
//         if (short.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to delete this short.");
//         }

//         // Delete associated files from Spaces
//         const filesToDelete = [];
//         if (short.videoUrl) filesToDelete.push(short.videoUrl);
//         if (short.thumbnailUrl) filesToDelete.push(short.thumbnailUrl);
//         await deleteMultipleFiles(filesToDelete);

//         await short.deleteOne();

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.SHORT_DELETED_SUCCESS,
//             data: {}
//         });

//     } catch (error) {
//         console.error("Error deleting short:", error);
//         next(error);
//     }
// };

// // @desc    Add a like to a short
// // @route   POST /api/shorts/:shortId/like
// // @access  Private (Authenticated Users)
// export const addLikeToShort = async (req, res, next) => {
//     try {
//         const { shortId } = req.params;
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }

//         const short = await Shorts.findById(shortId);
//         if (!short) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
//         }

//         const hasLiked = short.likes.some(like => like.user.toString() === userId.toString());

//         if (hasLiked) {
//             short.likes = short.likes.filter(like => like.user.toString() !== userId.toString());
//             await short.save();
//             res.status(STATUS_CODES.SUCCESS).json({
//                 success: true,
//                 message: MESSAGES.SHORT_UNLIKED_SUCCESS,
//                 likesCount: short.likes.length,
//             });
//         } else {
//             short.likes.push({ user: userId });
//             await short.save();
//             res.status(STATUS_CODES.CREATED).json({
//                 success: true,
//                 message: MESSAGES.SHORT_LIKED_SUCCESS,
//                 likesCount: short.likes.length,
//             });
//         }
//     } catch (error) {
//         console.error("Error liking short:", error);
//         next(error);
//     }
// };

// // @desc    Add a comment to a short
// // @route   POST /api/shorts/:shortId/comment
// // @access  Private (Authenticated Users)
// // export const addCommentToShort = async (req, res, next) => {
// //     try {
// //         const { shortId } = req.params;
// //         const { text } = req.body;
// //         const userId = req.user?._id;

// //         if (!userId) {
// //             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
// //         }
// //         if (!text || text.trim() === '') {
// //             throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Comment text cannot be empty.");
// //         }

// //         const short = await Shorts.findById(shortId);
// //         if (!short) {
// //             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
// //         }

// //         short.comments.push({ user: userId, text: text.trim() });
// //         await short.save();

// //         const newComment = short.comments[short.comments.length - 1];
// //         // Populate the user for the new comment before sending response
// //         await newComment.populate('user', 'name profileImage');

// //         res.status(STATUS_CODES.CREATED).json({
// //             success: true,
// //             message: MESSAGES.SHORT_COMMENT_ADDED_SUCCESS,
// //             comment: newComment,
// //             commentsCount: short.comments.length,
// //         });
// //     } catch (error) {
// //         console.error("Error adding comment to short:", error);
// //         next(error);
// //     }
// // };

// export const addCommentToShort = async (req, res, next) => {
//     try {
//         const { shortId } = req.params;
//         const { text } = req.body;
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }
//         if (!text || text.trim() === '') {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Comment text cannot be empty.");
//         }

//         const short = await Shorts.findById(shortId);
//         if (!short) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
//         }

//         short.comments.push({ user: userId, text: text.trim() });
//         await short.save();

//         // Re-fetch the short and populate the last comment's user
//         const updatedShort = await Shorts.findById(shortId)
//             .populate('comments.user', 'name profileImage');

//         const newComment = updatedShort.comments[updatedShort.comments.length - 1];

//         res.status(STATUS_CODES.CREATED).json({
//             success: true,
//             message: MESSAGES.SHORT_COMMENT_ADDED_SUCCESS,
//             comment: newComment,
//             commentsCount: updatedShort.comments.length,
//         });
//     } catch (error) {
//         console.error("Error adding comment to short:", error);
//         next(error);
//     }
// };


// export const replyToComment = async (req, res, next) => {
//   try {
//     const { shortId, commentId } = req.params;
//     const { text } = req.body;
//     const userId = req.user?._id;

//     if (!text || text.trim() === '') {
//       throw new ApiError(400, "Reply text cannot be empty");
//     }

//     const short = await Shorts.findById(shortId);
//     if (!short) {
//       throw new ApiError(404, "Short not found");
//     }

//     const comment = short.comments.id(commentId);
//     if (!comment) {
//       throw new ApiError(404, "Comment not found");
//     }

//     comment.replies.push({
//       user: userId,
//       text: text.trim(),
//       repliedAt: new Date()
//     });

//     await short.save();

//     // Re-fetch to populate
//     const updatedShort = await Shorts.findById(shortId)
//       .populate('comments.user', 'name profileImage')
//       .populate('comments.replies.user', 'name profileImage');

//     const updatedComment = updatedShort.comments.id(commentId);

//     res.status(201).json({
//       success: true,
//       message: "Reply added successfully",
//       reply: updatedComment.replies[updatedComment.replies.length - 1]
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// Controllers/shortsController.js
import Shorts from '../Models/shorts.model.js';
import User from '../Models/user.model.js';
import { Category, SubCategory, Country, State, City } from '../Models/lookupData.model.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import { ApiError } from '../Utils/apiError.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
import { generateSlug } from '../Utils/slugifyUtils.js';
// Helper to delete multiple files
const deleteMultipleFiles = async (urls) => {
    if (!urls || urls.length === 0) return;
    const deletePromises = urls.map(url => deleteFileFromSpaces(url));
    await Promise.allSettled(deletePromises); // Use allSettled to ensure all attempts are made
};


export const createShort = async (req, res, next) => {
    let videoUrl = '';
    let thumbnailUrl = '';

    try {
        const {
            title,
            description,
            category,
            subCategory,
            country,
            state,
            city
        } = req.body;

        const userId = req.user?._id;

        if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

        const user = await User.findById(userId);
        if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

        if (!title) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title is required for a short.");
        }

        const videoFile = req.files?.['video']?.[0] || null;
        const thumbnailFile = req.files?.['thumbnail']?.[0] || null;

        if (!videoFile) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Video file is required for a short.");
        }

        try {
            videoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
        } catch (uploadError) {
            console.error("Error uploading video file:", uploadError);
            throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload video file.");
        }

        if (thumbnailFile) {
            try {
                thumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
            } catch (uploadError) {
                console.error("Error uploading thumbnail file:", uploadError);
                if (videoUrl) await deleteFileFromSpaces(videoUrl);
                throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to upload thumbnail file.");
            }
        }

        // Decide initial status based on user permission
        const status = user.canDirectPost ? 'published' : 'pending_approval';

        // Prepare shortData with required fields
        const shortData = {
            title,
            description,
            videoUrl,
            thumbnailUrl,
            status,
            createdBy: userId,
            publishedAt: status === 'published' ? new Date() : null,
        };

        // Populate location and category/subcategory if provided (using names for lookup)
        if (category) {
            const categoryDoc = await Category.findOne({ name: category });
            if (categoryDoc) shortData.category = categoryDoc._id;
            else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid category name.");
        }
        if (subCategory) {
            const subCategoryDoc = await SubCategory.findOne({ name: subCategory });
            if (subCategoryDoc) shortData.subCategory = subCategoryDoc._id;
            else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid subCategory name.");
        }
        if (country) {
            const countryDoc = await Country.findOne({ name: country });
            if (countryDoc) shortData.country = countryDoc._id;
            else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Invalid country name.");
        }
        if (state) {
            const stateDoc = await State.findOne({ name: state });
            if (stateDoc) shortData.state = stateDoc._id;
            else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Invalid state name.");
        }
        if (city) {
            const cityDoc = await City.findOne({ name: city });
            if (cityDoc) shortData.city = cityDoc._id;
            else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Invalid city name.");
        }

        
        const short = await Shorts.create(shortData);
        short.slug = `${generateSlug(title, 'hi')}-${short._id}`;
        await short.save();

        res.status(STATUS_CODES.CREATED).json({
            message: "Short created successfully.",
            data: short
        });

    } catch (error) {
        console.error("Error creating short:", error);
        if (videoUrl) await deleteFileFromSpaces(videoUrl).catch(cleanupErr => console.error("Failed to clean up video after error:", cleanupErr));
        if (thumbnailUrl) await deleteFileFromSpaces(thumbnailUrl).catch(cleanupErr => console.error("Failed to clean up thumbnail after error:", cleanupErr));
        next(error);
    }
};



// export const getAllShorts = async (req, res, next) => {
//     try {
//         let query;

//         const reqQuery = { ...req.query };
//         const removeFields = ['select', 'sort', 'page', 'limit'];
//         removeFields.forEach(param => delete reqQuery[param]);

//         let queryStr = JSON.stringify(reqQuery);
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//         let finalQueryFilter = JSON.parse(queryStr);

//         // Only show 'published' shorts to general public unless role is admin/superadmin
//         if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
//             finalQueryFilter.status = 'published';
//         }

//         query = Shorts.find(finalQueryFilter);

//         if (req.query.select) {
//             const fields = req.query.select.split(',').join(' ');
//             query = query.select(fields);
//         }

//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(',').join(' ');
//             query = query.sort(sortBy);
//         } else {
//             query = query.sort('-createdAt');
//         }

//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const startIndex = (page - 1) * limit;
//         const endIndex = page * limit;
//         const total = await Shorts.countDocuments(finalQueryFilter);
//         const totalPages = Math.ceil(total / limit);

//         query = query.skip(startIndex).limit(limit);

//         query = query.populate([
//             { path: 'createdBy', select: 'name email profileImage' },
//             { path: 'category', select: 'name' }, // Populate category name
//             { path: 'subCategory', select: 'name' }, // Populate subCategory name
//             { path: 'country', select: 'name iso2' },
//             { path: 'state', select: 'name iso2' },
//             { path: 'city', select: 'name' },
//             { path: 'likes.user', select: 'name profileImage' },
//             { path: 'comments.user', select: 'name profileImage' },
//             { path: 'comments.replies.user', select: 'name profileImage' } // Populate replies' user
//         ]);

//         const shorts = await query;

//         const pagination = {};
//         if (endIndex < total) {
//             pagination.next = { page: page + 1, limit };
//         }
//         if (startIndex > 0) {
//             pagination.prev = { page: page - 1, limit };
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: shorts.length,
//             pagination,
//             data: shorts.map(short => {
//                 const shortObj = short.toObject({ virtuals: true });
//                 shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
//                 shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];
//                 return shortObj;
//             }),
//             totalPages
//         });

//     } catch (error) {
//         console.error("Error getting all shorts:", error);
//         next(error);
//     }
// };

export const getAllShorts = async (req, res, next) => {
    try {
        let query;

        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        let finalQueryFilter = JSON.parse(queryStr);

        // Only published shorts for public
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
            finalQueryFilter.status = 'published';
        }

        query = Shorts.find(finalQueryFilter);

        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Shorts.countDocuments(finalQueryFilter);
        const totalPages = Math.ceil(total / limit);

        query = query.skip(startIndex).limit(limit);

        query = query.populate([
            { path: 'createdBy', select: 'name email profileImage' },
            { path: 'category', select: 'name' },
            { path: 'subCategory', select: 'name' },
            { path: 'country', select: 'name iso2' },
            { path: 'state', select: 'name iso2' },
            { path: 'city', select: 'name' },
            { path: 'likes.user', select: '_id' }, // ✅ Only _id is needed to check like
            { path: 'comments.user', select: 'name profileImage' },
           
        ]);

        const shorts = await query;
      const currentUserId = req.user?._id?.toString();


const finalShorts = shorts.map(short => {
    const shortObj = short.toObject({ virtuals: true });

    // Format date
    shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
    shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];

    // ✅ Set isLikedByCurrentUser flag
    shortObj.isLikedByCurrentUser = false;

    if (currentUserId && Array.isArray(short.likes)) {
        shortObj.isLikedByCurrentUser = short.likes.some(like => {
            return like?.user?._id?.toString() === currentUserId;
        });
    }

    return shortObj;
});

        const pagination = {};
        if (endIndex < total) pagination.next = { page: page + 1, limit };
        if (startIndex > 0) pagination.prev = { page: page - 1, limit };

        res.status(STATUS_CODES.SUCCESS).json({
            status: STATUS_CODES.SUCCESS,
            success: true, 
            count: finalShorts.length,
            pagination,
            data: finalShorts,
            totalPages
        });

    } catch (error) {
        console.error("Error getting all shorts:", error);
        next(error);
    }
};









export const getShortById = async (req, res, next) => {
    try {
        const short = await Shorts.findById(req.params.id)
            .populate([
                { path: 'createdBy', select: 'name email profileImage' },
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                { path: 'country', select: 'name iso2' },
                { path: 'state', select: 'name iso2' },
                { path: 'city', select: 'name' },
                { path: 'likes.user', select: 'name profileImage' },
                { path: 'comments.user', select: 'name profileImage' },
                { path: 'comments.replies.user', select: 'name profileImage' }
            ]);

        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        // If not an admin/superadmin, ensure the short is 'published'
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
            if (short.status !== 'published') {
                throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND + ": This short is not publicly available.");
            }
        }


        // Increment views count
        short.viewsCount = (short.viewsCount || 0) + 1;
        await short.save();

        const shortObj = short.toObject({ virtuals: true });
        shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
        shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            data: shortObj,
        });

    } catch (error) {
        console.error("Error getting short by ID:", error);
        next(error);
    }
};


export const updateShort = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.role;
        const { title, description, status, category, subCategory, country, state, city } = req.body;

        let short = await Shorts.findById(id);

        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        // Authorization: Only creator, admin, or superadmin can update
        if (short.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this short.");
        }

        const updateFields = {};
        if (title !== undefined) updateFields.title = title;
        if (description !== undefined) updateFields.description = description;

        // Handle category, subCategory, country, state, city updates (similar to createShort)
        if (category !== undefined) {
            if (category === null || category === '') {
                updateFields.category = null;
                updateFields.subCategory = null; // Clear subcategory if category is cleared
            } else {
                const categoryDoc = await Category.findOne({ name: category });
                if (categoryDoc) updateFields.category = categoryDoc._id;
                else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid category name.");
            }
        }
        if (subCategory !== undefined) {
            if (subCategory === null || subCategory === '') {
                updateFields.subCategory = null;
            } else {
                const subCategoryDoc = await SubCategory.findOne({ name: subCategory });
                if (subCategoryDoc) updateFields.subCategory = subCategoryDoc._id;
                else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid.");
            }
        }
        if (country !== undefined) {
            if (country === null || country === '') {
                updateFields.country = null;
            } else {
                const countryDoc = await Country.findOne({ name: country });
                if (countryDoc) updateFields.country = countryDoc._id;
                else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Invalid country name.");
            }
        }
        if (state !== undefined) {
            if (state === null || state === '') {
                updateFields.state = null;
            } else {
                const stateDoc = await State.findOne({ name: state });
                if (stateDoc) updateFields.state = stateDoc._id;
                else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Invalid state name.");
            }
        }
        if (city !== undefined) {
            if (city === null || city === '') {
                updateFields.city = null;
            } else {
                const cityDoc = await City.findOne({ name: city });
                if (cityDoc) updateFields.city = cityDoc._id;
                else throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Invalid city name.");
            }
        }


        // Handle video and thumbnail file uploads
        const videoFile = req.files?.['video']?.[0] || null;
        const thumbnailFile = req.files?.['thumbnail']?.[0] || null;

        let filesToDelete = [];

        if (videoFile) {
            const newVideoUrl = await uploadFileToSpaces(videoFile, 'shorts-videos');
            if (short.videoUrl) filesToDelete.push(short.videoUrl); // Add old video to delete list
            updateFields.videoUrl = newVideoUrl;
        }

        if (thumbnailFile) {
            const newThumbnailUrl = await uploadFileToSpaces(thumbnailFile, 'shorts-thumbnails');
            if (short.thumbnailUrl) filesToDelete.push(short.thumbnailUrl); // Add old thumbnail to delete list
            updateFields.thumbnailUrl = newThumbnailUrl;
        } else if (req.body.clearThumbnail === 'true' && short.thumbnailUrl) { // Frontend explicit clear
            filesToDelete.push(short.thumbnailUrl);
            updateFields.thumbnailUrl = null;
        }


        // Status Update Logic
        let updatedStatus = short.status;
        if (status !== undefined) {
            if (!['draft', 'pending_approval', 'published', 'rejected'].includes(status)) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
            }

            const currentUser = req.user; // User object from authentication middleware

            // SuperAdmin or Admin with manageShorts permission can set any valid status
            if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageShorts)) {
                updatedStatus = status;
            }
            // Reporter can only set specific statuses based on their permissions
            else if (currentUser.role === 'reporter') {
                if (status === 'published' && currentUser.canDirectPost) { // Assuming canDirectPost also covers publishing directly
                    updatedStatus = status;
                } else if (['draft', 'pending_approval'].includes(status)) {
                    updatedStatus = status;
                } else {
                    throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
                }
            } else {
                throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update short status.");
            }
        }
        updateFields.status = updatedStatus;

        // Set publishedAt if status changes to 'published' and it wasn't already
        if (updateFields.status === 'published' && short.status !== 'published' && !short.publishedAt) {
            updateFields.publishedAt = new Date();
        }

        updateFields.updatedBy = userId; // Track who updated it

        short = await Shorts.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true
        });

        // Delete old files after successful update
        await deleteMultipleFiles(filesToDelete);

        const populatedShort = await Shorts.findById(short._id)
            .populate([
                { path: 'createdBy', select: 'name email profileImage' },
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
                { path: 'country', select: 'name iso2' },
                { path: 'state', select: 'name iso2' },
                { path: 'city', select: 'name' },
                { path: 'likes.user', select: 'name profileImage' },
                { path: 'comments.user', select: 'name profileImage' },
                { path: 'comments.replies.user', select: 'name profileImage' }
            ]);

        const finalShortData = populatedShort.toObject({ virtuals: true });
        finalShortData.postedDate = populatedShort.publishedAt ? populatedShort.publishedAt.toISOString().split('T')[0] : null;
        finalShortData.createdAtDate = populatedShort.createdAt.toISOString().split('T')[0];

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Short updated successfully.",
            data: finalShortData,
        });

    } catch (error) {
        console.error("Error updating short:", error);
        next(error);
    }
};


export const deleteShort = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.role;

        const short = await Shorts.findById(id);

        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        // Authorization: Only creator, admin, or superadmin can delete
        if (short.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to delete this short.");
        }

        // Delete associated files from Spaces
        const filesToDelete = [];
        if (short.videoUrl) filesToDelete.push(short.videoUrl);
        if (short.thumbnailUrl) filesToDelete.push(short.thumbnailUrl);
        await deleteMultipleFiles(filesToDelete);

        await short.deleteOne();

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Short deleted successfully.",
            data: {}
        });

    } catch (error) {
        console.error("Error deleting short:", error);
        next(error);
    }
};


export const addLikeToShort = async (req, res, next) => {
    try {
        const { shortId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }

        const short = await Shorts.findById(shortId);
        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        const hasLiked = short.likes.some(like => like.user.toString() === userId.toString());

        if (hasLiked) {
            short.likes = short.likes.filter(like => like.user.toString() !== userId.toString());
            await short.save();
            res.status(STATUS_CODES.SUCCESS).json({
                success: true,
                message: "Short unliked successfully.",
                likesCount: short.likes.length,
            });
        } else {
            short.likes.push({ user: userId });
            await short.save();
            res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: "Short liked successfully.",
                likesCount: short.likes.length,
            });
        }
    } catch (error) {
        console.error("Error liking short:", error);
        next(error);
    }
};


export const addCommentToShort = async (req, res, next) => {
    try {
        const { shortId } = req.params;
        const { text } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }
        if (!text || text.trim() === '') {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Comment text cannot be empty.");
        }

        const short = await Shorts.findById(shortId);
        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        short.comments.push({ user: userId, text: text.trim() });
        await short.save();

        // Re-fetch the short and populate the last comment's user
        const updatedShort = await Shorts.findById(shortId)
            .populate('comments.user', 'name profileImage');

        const newComment = updatedShort.comments[updatedShort.comments.length - 1];

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: "Comment added to short successfully.",
            comment: newComment,
            commentsCount: updatedShort.comments.length,
        });
    } catch (error) {
        console.error("Error adding comment to short:", error);
        next(error);
    }
};


export const replyToComment = async (req, res, next) => {
  try {
    const { shortId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
    }
    if (!text || text.trim() === '') {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Reply text cannot be empty.");
    }

    const short = await Shorts.findById(shortId);
    if (!short) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
    }

    const comment = short.comments.id(commentId);
    if (!comment) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.COMMENT_NOT_FOUND); // Assuming COMMENT_NOT_FOUND exists
    }

    comment.replies.push({
      user: userId,
      text: text.trim(),
      repliedAt: new Date()
    });

    await short.save();

    // Re-fetch to populate the newly added reply's user
    const updatedShort = await Shorts.findById(shortId)
      .populate('comments.user', 'name profileImage')
      .populate('comments.replies.user', 'name profileImage');

    const updatedComment = updatedShort.comments.id(commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: "Reply added successfully",
      reply: newReply
    });
  } catch (error) {
    next(error);
  }
};


export const getCommentsByShortId = async (req, res, next) => {
    try {
        const { shortId } = req.params;

        // Find the short and populate its comments and replies' user details
        const short = await Shorts.findById(shortId)
            .select('comments') // Only select the comments field
            .populate([
                { path: 'comments.user', select: 'name profileImage' },
                // { path: 'comments.replies.user', select: 'name profileImage' }
            ]);

        if (!short) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SHORT_NOT_FOUND);
        }

        // You might want to filter comments based on some criteria later,
        // but for now, we return all comments associated with the short.
        const comments = short.comments.map(comment => {
            // Convert to plain object to add virtuals/custom properties if needed
            const commentObj = comment.toObject();
            return commentObj;
        });

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: comments.length,
            data: comments,
        });

    } catch (error) {
        console.error("Error fetching comments for short:", error);
        next(error);
    }
};


export const getMyShorts = async (req, res, next) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
        }

        let query;

        const reqQuery = { ...req.query };
        const removeFields = ['select', 'sort', 'page', 'limit'];
        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
        let finalQueryFilter = JSON.parse(queryStr);

        // Filter by reporter (createdBy)
        finalQueryFilter.createdBy = userId;

        query = Shorts.find(finalQueryFilter);

        // Field selection
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            query = query.select(fields);
        }

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Shorts.countDocuments(finalQueryFilter);
        const totalPages = Math.ceil(total / limit);

        query = query.skip(startIndex).limit(limit);

        // Populate references
        query = query.populate([
            { path: 'createdBy', select: 'name email profileImage' },
            { path: 'category', select: 'name' },
            { path: 'subCategory', select: 'name' },
            { path: 'country', select: 'name iso2' },
            { path: 'state', select: 'name iso2' },
            { path: 'city', select: 'name' },
            { path: 'likes.user', select: '_id' },
            { path: 'comments.user', select: 'name profileImage' },
            { path: 'comments.replies.user', select: 'name profileImage' }
        ]);

        const shorts = await query;

        const currentUserId = userId.toString();

        // Add extra fields
        const finalShorts = shorts.map(short => {
            const shortObj = short.toObject({ virtuals: true });
            shortObj.postedDate = short.publishedAt ? short.publishedAt.toISOString().split('T')[0] : null;
            shortObj.createdAtDate = short.createdAt.toISOString().split('T')[0];

            shortObj.isLikedByCurrentUser = Array.isArray(short.likes)
                ? short.likes.some(like => like?.user?._id?.toString() === currentUserId)
                : false;

            return shortObj;
        });

        // Pagination metadata
        const pagination = {};
        if (endIndex < total) pagination.next = { page: page + 1, limit };
        if (startIndex > 0) pagination.prev = { page: page - 1, limit };

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: finalShorts.length,
            pagination,
            data: finalShorts,
            totalPages
        });

    } catch (error) {
        console.error("Error fetching reporter shorts:", error);
        next(error);
    }
};
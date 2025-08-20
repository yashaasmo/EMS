import News from '../Models/news.model.js';
import { Category, SubCategory, Country, State, City } from '../Models/lookupData.model.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import { ApiError } from '../Utils/apiError.js';
import User from '../Models/user.model.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';

// Helper function to convert Mongoose ObjectId to String for comparison
const convertIdToString = (id) => (id ? id.toString() : null);
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'; // लोकल डेवलपमेंट के लिए डिफ़ॉल्ट
//chage 8/7/25

// export const createNews = async (req, res, next) => {
//     try {
//         const {
//             title,
//             content,
//             summary,
//             category,
//             subCategory,
//             tags = [],
//             country,
//             state,
//             city,
//             localAddress
//         } = req.body;

//         const userId = req.user?._id; // Set by auth middleware

//         if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);
//         const user = await User.findById(userId);
//         if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

//         if (!title || !content || !category) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title, content and category are required.");
//         }

//         // Handle media uploads (assuming media files come in req.files)
//         let media = [];
//         if (req.files && req.files.length > 0) {
//             for (const file of req.files) {
//                 const url = await uploadFileToSpaces(file, 'news-media');
//                 media.push({
//                     url,
//                     type: file.mimetype.startsWith('video') ? 'video' : 'image',
//                     caption: file.originalname || ''
//                 });
//             }
//         }

//         // Decide initial status based on user permission (canDirectPost)
//         const status = user.canDirectPost ? 'posted' : 'pending_approval';

//         const news = await News.create({
//             title,
//             content,
//             summary,
//             category,
//             subCategory,
//             tags,
//             media,
//             country,
//             state,
//             city,
//             localAddress,
//             status,
//             createdBy: userId,
//             updatedBy: userId,
//             publishedAt: (status === 'posted' || status === 'live') ? new Date() : null
//         });

//         res.status(STATUS_CODES.CREATED).json({
//             message: MESSAGES.CREATED,
//             data: news
//         });

//     } catch (error) {
//         // Clean up uploaded files if DB save fails
//         if (req.files && req.files.length > 0) {
//             for (const file of req.files) {
//                 if (file.location) { // assuming `location` field is added by s3Service
//                     await deleteFileFromSpaces(file.location).catch(err => console.error("Cleanup error:", err));
//                 }
//             }
//         }
//         next(error);
//     }
// };
//  spacficne sucatgari ma 

export const createNews = async (req, res, next) => {
    try {
        const {
            title,
            content,
            summary,
            category,
            subCategory,
            subSubCategory,
            tags = [],
            country,
            state,
            city,
            localAddress
        } = req.body;

        const userId = req.user?._id;

        if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

        const user = await User.findById(userId);
        if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

        if (!title || !content || !category) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title, content and category are required.");
        }

        // Fetch category and subCategory names for conditional logic
        const categoryDoc = await Category.findById(category);
        const subCategoryDoc = await SubCategory.findById(subCategory);

        if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category ID");
        if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid subCategory ID");

        // Media upload
        let media = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const url = await uploadFileToSpaces(file, 'news-media');
                media.push({
                    url,
                    type: file.mimetype.startsWith('video') ? 'video' : 'image',
                    caption: file.originalname || ''
                });
            }
        }

        // Status based on permission
        const status = user.canDirectPost ? 'posted' : 'pending_approval';

        // Prepare news payload
        const newsPayload = {
            title,
            content,
            summary,
            category,
            subCategory,
            tags,
            media,
            country,
            state,
            city,
            localAddress,
            status,
            createdBy: userId,
            updatedBy: userId,
            publishedAt: (status === 'posted' || status === 'live') ? new Date() : null
        };

        // ✅ Only include subSubCategory if Astrology > Rashi
        if (
            categoryDoc.name.toLowerCase() === 'astrology' &&
            subCategoryDoc.name.toLowerCase() === 'rashi' &&
            subSubCategory
        ) {
            newsPayload.subSubCategory = subSubCategory;
        }

        const news = await News.create(newsPayload);
        news.shareLink = `${FRONTEND_BASE_URL}/news/${news._id}`;
        await news.save(); // शेयर लिंक अपडेट करने के लिए फिर से सेव करें

        res.status(STATUS_CODES.CREATED).json({
            message: MESSAGES.CREATED,
            data: news
        });


        res.status(STATUS_CODES.CREATED).json({
            message: MESSAGES.CREATED,
            data: news
        });

    } catch (error) {
        // Cleanup files if DB fails
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.location) {
                    await deleteFileFromSpaces(file.location).catch(err =>
                        console.error("Cleanup error:", err)
                    );
                }
            }
        }
        next(error);
    }
};


// export const addLikeToNews = async (req, res, next) => {
//     try {
//         const { newsId } = req.params;
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }

//         const news = await News.findById(newsId);
//         if (!news) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//         }

//         // Check if user already liked
//         const hasLiked = news.likes.some(like => like.user.toString() === userId.toString());

//         if (hasLiked) {
//             // If already liked, unlike it (toggle functionality)
//             news.likes = news.likes.filter(like => like.user.toString() !== userId.toString());
//             await news.save();
//             res.status(STATUS_CODES.SUCCESS).json({
//                 success: true,
//                 message: "News unliked successfully.",
//                 likesCount: news.likes.length,
//             });
//         } else {
//             // If not liked, add new like
//             news.likes.push({ user: userId });
//             await news.save();
//             res.status(STATUS_CODES.CREATED).json({
//                 success: true,
//                 message: "News liked successfully.",
//                 likesCount: news.likes.length,
//             });
//         }
//     } catch (error) {
//         console.error("Error liking news:", error);
//         next(error);
//     }
// };
export const addLikeToNews = async (req, res, next) => {
    try {
        const { newsId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }

        const news = await News.findById(newsId);
        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // Safe check for like
        const hasLiked = news.likes.some(
            like =>
                (like.user._id ? like.user._id.toString() : like.user.toString()) === userId.toString()
        );

        if (hasLiked) {
            // Unlike
            news.likes = news.likes.filter(
                like => (like.user._id ? like.user._id.toString() : like.user.toString()) !== userId.toString()
            );
            await news.save();
            res.status(STATUS_CODES.SUCCESS).json({
                success: true,
                message: "News unliked successfully.",
                likesCount: news.likes.length,
            });
        } else {
            // Like
            news.likes.push({ user: userId });
            await news.save();
            res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: "News liked successfully.",
                likesCount: news.likes.length,
            });
        }
    } catch (error) {
        console.error("Error liking news:", error);
        next(error);
    }
};


export const addCommentToNews = async (req, res, next) => {
    try {
        const { newsId } = req.params;
        const { text } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }
        if (!text || text.trim() === '') {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Comment text cannot be empty.");
        }

        const news = await News.findById(newsId);
        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // Add new comment
        news.comments.push({ user: userId, text: text.trim() });
        await news.save();

        // You might want to populate the last added comment's user for the response
        const newComment = news.comments[news.comments.length - 1];
        // Populate the user who just commented on the fetched news item
        const populatedNews = await News.findById(newsId)
                                    .populate('comments.user', 'name profileImage');
        const latestCommentPopulated = populatedNews.comments.find(c => c._id.toString() === newComment._id.toString());


        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: "Comment added successfully.",
            comment: latestCommentPopulated,
            commentsCount: populatedNews.comments.length,
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        next(error);
    }
};



// export const getAllNews = async (req, res, next) => {
//     try {
//         let query;

//         // Copy req.query
//         const reqQuery = { ...req.query };

//         // Fields to exclude from filtering
//         const removeFields = ['select', 'sort', 'page', 'limit'];

//         // Loop over removeFields and delete them from reqQuery
//         removeFields.forEach(param => delete reqQuery[param]);

//         // Create query string
//         let queryStr = JSON.stringify(reqQuery);

//         // Create operators ($gt, $gte, etc.)
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//         let finalQueryFilter = JSON.parse(queryStr);

//         // Apply status filter based on user role
//         // If not an admin or superadmin, only show 'posted' or 'live' news
//         if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
//             finalQueryFilter.status = { $in: ['posted', 'live'] };
//         }

//         query = News.find(finalQueryFilter);

//         // Select Fields
//         if (req.query.select) {
//             const fields = req.query.select.split(',').join(' ');
//             query = query.select(fields);
//         }

//         // Sort
//         if (req.query.sort) {
//             const sortBy = req.query.sort.split(',').join(' ');
//             query = query.sort(sortBy);
//         } else {
//             query = query.sort('-createdAt'); // Default sort by most recent
//         }

//         // Pagination
//         const page = parseInt(req.query.page, 10) || 1;
//         const limit = parseInt(req.query.limit, 10) || 10;
//         const startIndex = (page - 1) * limit;
//         const endIndex = page * limit;
//         const total = await News.countDocuments(finalQueryFilter); // Count with filters
//         const totalPages = Math.ceil(total / limit);

//         query = query.skip(startIndex).limit(limit);

//         // Populate related fields
//         query = query.populate([
//             {
//                 path: 'createdBy',
//                 select: 'name email role profileImage' // Select basic user details
//             },
//             { path: 'updatedBy', select: 'name email' },
    
//        { path: 'category', select: 'name iso2' },
//        { path: 'subCategory', select: 'name iso2' },
//             { path: 'country', select: 'name iso2' },
//             { path: 'state', select: 'name iso2' },
//             { path: 'city', select: 'name' },
//             { path: 'comments.user', select: 'name profileImage' },
//   { path: 'likes.user', select: 'name profileImage' }

//             // Nested arrays (likes, comments) will automatically be part of the News object,
//             // but their 'user' fields will not be populated by default unless explicitly asked.
//             // If you want to populate users in likes/comments:
//             // { path: 'likes.user', select: 'name' },
//             // { path: 'comments.user', select: 'name profileImage' }
//         ]);

//         const news = await query;

//         // Pagination result
//         const pagination = {};
//         if (endIndex < total) {
//             pagination.next = {
//                 page: page + 1,
//                 limit
//             };
//         }
//         if (startIndex > 0) {
//             pagination.prev = {
//                 page: page - 1,
//                 limit
//             };
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: news.length,
//             pagination,
//             data: news.map(item => {
//                 const newsObj = item.toObject({ virtuals: true }); // Include virtuals (likesCount, commentsCount)
//                 // Format dates/times
//                 newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split('T')[0] : null;
//                 newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//                 newsObj.createdAtDate = item.createdAt.toISOString().split('T')[0];
//                 newsObj.createdAtTime = item.createdAt.toISOString().split('T')[1].substring(0, 8);
//                 newsObj.updatedAtDate = item.updatedAt.toISOString().split('T')[0];
//                 newsObj.updatedAtTime = item.updatedAt.toISOString().split('T')[1].substring(0, 8);
//                 return newsObj;
//             }),
//             totalPages
//         });

//     } catch (error) {
//         console.error("Error getting all news:", error);
//         next(error);
//     }
// };

// export const getAllNews = async (req, res, next) => {
//     try {
//         let query;
//         const reqQuery = { ...req.query };
//         const removeFields = ['select', 'sort', 'page', 'limit'];
//         removeFields.forEach(param => delete reqQuery[param]);
//         let queryStr = JSON.stringify(reqQuery);
//         queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
//         let finalQueryFilter = JSON.parse(queryStr);

//         if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
//             finalQueryFilter.status = { $in: ['posted', 'live'] };
//         }

//         query = News.find(finalQueryFilter);

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
//         const total = await News.countDocuments(finalQueryFilter);
//         const totalPages = Math.ceil(total / limit);

//         query = query.skip(startIndex).limit(limit);

//         query = query.populate([
//             {
//                 path: 'createdBy',
//                 select: 'name email role profileImage'
//             },
//             { path: 'updatedBy', select: 'name email' },
//             { path: 'category', select: 'name iso2' },
//             { path: 'subCategory', select: 'name iso2' },
//             { path: 'country', select: 'name iso2' },
//             { path: 'state', select: 'name iso2' },
//             { path: 'city', select: 'name' },
//             { path: 'comments.user', select: 'name profileImage' },
//             { path: 'likes.user', select: 'name profileImage' }
//         ]);

//         const news = await query;

//         const pagination = {};
//         if (endIndex < total) {
//             pagination.next = {
//                 page: page + 1,
//                 limit
//             };
//         }
//         if (startIndex > 0) {
//             pagination.prev = {
//                 page: page - 1,
//                 limit
//             };
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: news.length,
//             pagination,
//             data: news.map(item => {
//                 const newsObj = item.toObject({ virtuals: true });
//                 // ✨ shareLink को शामिल करें ✨
//                 newsObj.shareLink = item.shareLink;
//                 newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split('T')[0] : null;
//                 newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//                 newsObj.createdAtDate = item.createdAt.toISOString().split('T')[0];
//                 newsObj.createdAtTime = item.createdAt.toISOString().split('T')[1].substring(0, 8);
//                 newsObj.updatedAtDate = item.updatedAt.toISOString().split('T')[0];
//                 newsObj.updatedAtTime = item.updatedAt.toISOString().split('T')[1].substring(0, 8);
//                 return newsObj;
//             }),
//             totalPages
//         });

//     } catch (error) {
//         console.error("Error getting all news:", error);
//         next(error);
//     }
// };



// export const getAllNews = async (req, res, next) => {
//   try {
//     let query;
//     const reqQuery = { ...req.query };
//     const removeFields = ["select", "sort", "page", "limit"];
//     removeFields.forEach((param) => delete reqQuery[param]);
//     let queryStr = JSON.stringify(reqQuery);
//     queryStr = queryStr.replace(
//       /\b(gt|gte|lt|lte|in)\b/g,
//       (match) => `$${match}`
//     );
//     let finalQueryFilter = JSON.parse(queryStr);

//     // ✅ अगर admin/superadmin नहीं है तो सिर्फ posted/live दिखे
//     if (
//       !req.user ||
//       (req.user.role !== "admin" && req.user.role !== "superadmin")
//     ) {
//       finalQueryFilter.status = { $in: ["posted", "live"] };
//     }

//     query = News.find(finalQueryFilter);

//     if (req.query.select) {
//       const fields = req.query.select.split(",").join(" ");
//       query = query.select(fields);
//     }

//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     query = query.populate([
//       {
//         path: "createdBy",
//         select: "name email role profileImage",
//       },
//       { path: "updatedBy", select: "name email" },
//       { path: "category", select: "name iso2" },
//       { path: "subCategory", select: "name iso2" },
//       { path: "country", select: "name iso2" },
//       { path: "state", select: "name iso2" },
//       { path: "city", select: "name" },
//       { path: "comments.user", select: "name profileImage" },
//       { path: "likes.user", select: "name profileImage" },
//     ]);

//     const news = await query;

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       count: news.length,
//    data: news.map((item) => {
//   const newsObj = item.toObject({ virtuals: true });
//   newsObj.shareLink = item.shareLink;
//   newsObj.postedDate = item.publishedAt
//     ? item.publishedAt.toISOString().split("T")[0]
//     : null;
//   newsObj.postedTime = item.publishedAt
//     ? item.publishedAt.toISOString().split("T")[1].substring(0, 8)
//     : null;
//   newsObj.createdAtDate = item.createdAt.toISOString().split("T")[0];
//   newsObj.createdAtTime = item.createdAt.toISOString().split("T")[1].substring(0, 8);
//   newsObj.updatedAtDate = item.updatedAt.toISOString().split("T")[0];
//   newsObj.updatedAtTime = item.updatedAt.toISOString().split("T")[1].substring(0, 8);

// const currentUserId = req.user?._id?.toString();
// console.log("id", currentUserId);
// newsObj.isLikedByCurrentUser = false;

// if (currentUserId && Array.isArray(newsObj.likes)) {
//     newsObj.isLikedByCurrentUser = newsObj.likes.some(like => {
//         // like.user agar populated object ho to _id use karo, nahi to user directly
//         const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
//         return likeUserId === currentUserId;
//     });
// }



//   return newsObj;
// })

//     });
//   } catch (error) {
//     console.error("Error getting all news:", error);
//     next(error);
//   }
// };

             
// update BY 8/20/25 ////////////////

export const getAllNews = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // select, sort हटाओ, बाकी काम करेंगे
    const removeFields = ["select", "sort"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Mongo operators add
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    let finalQueryFilter = JSON.parse(queryStr);

    // ✅ अगर admin/superadmin नहीं है तो सिर्फ posted/live दिखे
    if (
      !req.user ||
      (req.user.role !== "admin" && req.user.role !== "superadmin")
    ) {
      finalQueryFilter.status = { $in: ["posted", "live"] };
    }

    query = News.find(finalQueryFilter);

    // select handle
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // sort handle
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Populate relations
    query = query.populate([
      { path: "createdBy", select: "name email role profileImage" },
      { path: "updatedBy", select: "name email" },
      { path: "category", select: "name iso2" },
      { path: "subCategory", select: "name iso2" },
      { path: "country", select: "name iso2" },
      { path: "state", select: "name iso2" },
      { path: "city", select: "name" },
      { path: "comments.user", select: "name profileImage" },
      { path: "likes.user", select: "name profileImage" },
    ]);

    // ✅ बिना limit/skip => सारे news मिलेंगे
    const news = await query;

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: news.length,
      data: news.map((item) => {
        const newsObj = item.toObject({ virtuals: true });
        newsObj.shareLink = item.shareLink;
        newsObj.postedDate = item.publishedAt
          ? item.publishedAt.toISOString().split("T")[0]
          : null;
        newsObj.postedTime = item.publishedAt
          ? item.publishedAt.toISOString().split("T")[1].substring(0, 8)
          : null;
        newsObj.createdAtDate = item.createdAt
          .toISOString()
          .split("T")[0];
        newsObj.createdAtTime = item.createdAt
          .toISOString()
          .split("T")[1]
          .substring(0, 8);
        newsObj.updatedAtDate = item.updatedAt
          .toISOString()
          .split("T")[0];
        newsObj.updatedAtTime = item.updatedAt
          .toISOString()
          .split("T")[1]
          .substring(0, 8);

        const currentUserId = req.user?._id?.toString();
        newsObj.isLikedByCurrentUser = false;

        if (currentUserId && Array.isArray(newsObj.likes)) {
          newsObj.isLikedByCurrentUser = newsObj.likes.some((like) => {
            const likeUserId = like.user?._id
              ? like.user._id.toString()
              : like.user?.toString();
            return likeUserId === currentUserId;
          });
        }

        return newsObj;
      }),
    });
  } catch (error) {
    console.error("Error getting all news:", error);
    next(error);
  }
};


export const getNewsById = async (req, res, next) => {
    try {
        const news = await News.findById(req.params.id)
            .populate([
                {
                    path: 'createdBy',
                    select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
                },
                { path: 'updatedBy', select: 'name email' },
                { path: 'country', select: 'name iso2' },
                { path: 'state', select: 'name iso2' },
                { path: 'city', select: 'name' },
                // Populate user details for likes and comments
                { path: 'likes.user', select: 'name profileImage' },
                { path: 'comments.user', select: 'name profileImage' }
            ]);

        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // If not an admin/superadmin, ensure the news is 'posted' or 'live'
        if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
            if (!['posted', 'live'].includes(news.status)) {
                throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND + ": This news is not publicly available.");
            }
        }


        // Increment views count (optional, can be moved to a separate microservice/job for high traffic)
        news.viewsCount = (news.viewsCount || 0) + 1;
        await news.save();

        const newsObj = news.toObject({ virtuals: true }); // Include virtuals

        // Get reporter's location names for display (from createdBy user details)
        const reporterDetails = news.createdBy; // This is now populated
        if (reporterDetails) {
            // Need to ensure the populated country/state/city IDs are valid ObjectIds before querying.
            // If they are already populated by Mongoose, they'd be objects.
            const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
            const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
            const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;


            newsObj.reporterDetails = {
                id: reporterDetails._id,
                name: reporterDetails.name,
                email: reporterDetails.email,
                role: reporterDetails.role,
                profileImage: reporterDetails.profileImage,
                country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
                state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
                city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
                address: reporterDetails.address,
                dateOfBirth: reporterDetails.dateOfBirth,
                canDirectPost: reporterDetails.canDirectPost,
                canDirectGoLive: reporterDetails.canDirectGoLive,
            };
        } else {
            newsObj.reporterDetails = null; // Or handle as needed
        }


        // Add formatted date/time fields
        newsObj.postedDate = news.publishedAt ? news.publishedAt.toISOString().split('T')[0] : null;
        newsObj.postedTime = news.publishedAt ? news.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
        newsObj.createdAtDate = news.createdAt.toISOString().split('T')[0];
        newsObj.createdAtTime = news.createdAt.toISOString().split('T')[1].substring(0, 8);
        newsObj.updatedAtDate = news.updatedAt.toISOString().split('T')[0];
        newsObj.updatedAtTime = news.updatedAt.toISOString().split('T')[1].substring(0, 8);


        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            data: newsObj,
        });

    } catch (error) {
        console.error("Error getting news by ID:", error);
        next(error);
    }
};


export const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.role;
        const {
            title,
            content,
            summary,
            category,
            subCategory,
            tags,
            country,
            state,
            city,
            localAddress,
            status
        } = req.body;

        let news = await News.findById(id);

        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // Authorization: Only creator, admin, or superadmin can update
        if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this news.");
        }

        // --- Handle Media Updates ---
        let existingMediaUrls = news.media.map(m => m.url);
        let updatedMedia = [];
        let filesToDeleteFromCloud = [];

        // If new files are uploaded, process them
        if (req.files && req.files.length > 0) {
        for (const file of req.files) {
    const url = await uploadFileToSpaces(file, 'news-media');
    updatedMedia.push({
        url,
        type: file.mimetype.startsWith('video') ? 'video' : 'image',
        caption: file.originalname || ''
    });
}

        }

        // Handle `media` field from body: It should tell which existing media to keep.
        // If `req.body.existingMedia` is provided, assume it's an array of URLs to keep.
        // Any media in `news.media` but NOT in `req.body.existingMedia` (if provided) should be deleted.
        if (req.body.existingMedia) { // Expect `existingMedia` to be a JSON string of URLs or an array of URLs
            let mediaToKeep = [];
            try {
                mediaToKeep = typeof req.body.existingMedia === 'string' ? JSON.parse(req.body.existingMedia) : req.body.existingMedia;
            } catch (e) {
                console.error("Error parsing existingMedia:", e);
                throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for existingMedia.");
            }

            // Filter out media to delete
            for (const oldMedia of news.media) {
                if (!mediaToKeep.includes(oldMedia.url)) {
                    filesToDeleteFromCloud.push(oldMedia.url);
                }
            }
            // Add kept media to updatedMedia list
            updatedMedia = [...updatedMedia, ...news.media.filter(m => mediaToKeep.includes(m.url))];

        } else if (req.files && req.files.length > 0) {
            // If new files are uploaded but no `existingMedia` specified, assume all old media are replaced
            filesToDeleteFromCloud.push(...existingMediaUrls);
        }
        // If no new files and no `existingMedia` specified, `updatedMedia` remains based on prior state or empty.
        // If `req.body.media` explicitly passed as an empty array or null, it means clear all media.
        if (req.body.media === null || (Array.isArray(req.body.media) && req.body.media.length === 0 && !req.files?.length)) {
             filesToDeleteFromCloud.push(...existingMediaUrls);
             updatedMedia = [];
        }


        // --- Handle Location Updates ---
        let countryId = news.country;
        if (country !== undefined) {
            if (country === null || country === '') {
                countryId = null;
            } else {
                const countryDoc = await Country.findOne({ name: country });
                if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country name is invalid.");
                countryId = countryDoc._id;
            }
        }

        let stateId = news.state;
        if (state !== undefined) {
            if (state === null || state === '') {
                stateId = null;
            } else {
                const stateDoc = await State.findOne({ name: state });
                if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state name is invalid.");
                stateId = stateDoc._id;
                if (countryId && convertIdToString(stateDoc.country) !== convertIdToString(countryId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
                }
            }
        }

        let cityId = news.city;
        if (city !== undefined) {
            if (city === null || city === '') {
                cityId = null;
            } else {
                const cityDoc = await City.findOne({ name: city });
                if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city name is invalid.");
                cityId = cityDoc._id;
                if (stateId && convertIdToString(cityDoc.state) !== convertIdToString(stateId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
                }
                if (countryId && convertIdToString(cityDoc.country) !== convertIdToString(countryId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
                }
            }
        }

        // --- Handle Category/SubCategory Updates ---
        let finalCategory = news.category;
        if (category !== undefined) {
            if (category === null || category === '') {
                finalCategory = null;
                finalSubCategory = null; // If category is cleared, subcategory must also be cleared
            } else {
                const categoryDoc = await Category.findOne({ name: category });
                if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category name is invalid.");
                finalCategory = category;
            }
        }

        let finalSubCategory = news.subCategory;
        if (subCategory !== undefined) {
            if (subCategory === null || subCategory === '') {
                finalSubCategory = null;
            } else {
                const currentCategoryDoc = await Category.findOne({ name: finalCategory }); // Use the (potentially updated) category
                if (!currentCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category not found for subCategory validation.");
                const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: currentCategoryDoc._id });
                if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid or does not belong to the selected category.");
                finalSubCategory = subCategory;
            }
        } else if (category !== undefined && (category === null || category === '')) {
             // If category was explicitly cleared, clear subCategory too
            finalSubCategory = null;
        }


        // --- Status Update Logic (More flexible for updates) ---
        let updatedStatus = news.status;
        if (status !== undefined) {
            if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
            }

            const currentUser = req.user; // User object from authentication middleware

            // SuperAdmin or Admin with manageNews permission can set any valid status
            if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageNews)) {
                updatedStatus = status;
            }
            // Reporter can only set specific statuses based on their permissions
            else if (currentUser.role === 'reporter') {
                if (status === 'live' && currentUser.canDirectGoLive) {
                    updatedStatus = status;
                } else if (['posted'].includes(status) && currentUser.canDirectPost) {
                    updatedStatus = status;
                } else if (['draft', 'pending_approval'].includes(status)) {
                    updatedStatus = status; // Reporters can always set their own news to draft/pending
                } else {
                    throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
                }
            } else { // 'user' role should not be able to update news status
                throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update news status.");
            }
        }


        // Prepare fields to update
        const updateFields = {
            title: title !== undefined ? title : news.title,
            content: content !== undefined ? content : news.content,
            summary: summary !== undefined ? summary : news.summary,
            category: finalCategory,
            subCategory: finalSubCategory,
            tags: tags !== undefined ? tags : news.tags,
            media: updatedMedia, // Set the updated media array
            country: countryId,
            state: stateId,
            city: cityId,
            localAddress: localAddress !== undefined ? localAddress : news.localAddress,
            status: updatedStatus,
            updatedBy: userId, // Set the user who updated
        };

        // If status changes to posted/live and was not already, update publishedAt
        if ((updateFields.status === 'posted' || updateFields.status === 'live') && !news.publishedAt && updateFields.status !== news.status) {
            updateFields.publishedAt = new Date();
        } else if (updateFields.status !== 'posted' && updateFields.status !== 'live' && news.publishedAt && updateFields.status !== news.status) {
            // If news goes out of posted/live status, clear publishedAt (optional, depends on logic)
            // updateFields.publishedAt = null;
        }


        news = await News.findByIdAndUpdate(id, updateFields, {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        });

        // Delete old files from cloud after successful DB update
        for (const url of filesToDeleteFromCloud) {
            await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old media file:", err.message));
        }


        // Populate and Format Response
        const populatedNews = await News.findById(news._id)
            .populate([
                {
                    path: 'createdBy',
                    select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
                },
                { path: 'updatedBy', select: 'name email' },
                { path: 'country', select: 'name iso2' },
                { path: 'state', select: 'name iso2' },
                { path: 'city', select: 'name' },
                { path: 'likes.user', select: 'name profileImage' },
                { path: 'comments.user', select: 'name profileImage' }
            ]);

        const finalNewsData = populatedNews.toObject({ virtuals: true });

        const reporterDetails = populatedNews.createdBy;
        if (reporterDetails) {
             const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
             const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
             const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;

            finalNewsData.reporterDetails = {
                id: reporterDetails._id,
                name: reporterDetails.name,
                email: reporterDetails.email,
                role: reporterDetails.role,
                profileImage: reporterDetails.profileImage,
                country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
                state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
                city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
                address: reporterDetails.address,
                dateOfBirth: reporterDetails.dateOfBirth,
                canDirectPost: reporterDetails.canDirectPost,
                canDirectGoLive: reporterDetails.canDirectGoLive,
            };
        } else {
            finalNewsData.reporterDetails = null;
        }

        finalNewsData.postedDate = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[0] : null;
        finalNewsData.postedTime = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
        finalNewsData.createdAtDate = populatedNews.createdAt.toISOString().split('T')[0];
        finalNewsData.createdAtTime = populatedNews.createdAt.toISOString().split('T')[1].substring(0, 8);
        finalNewsData.updatedAtDate = populatedNews.updatedAt.toISOString().split('T')[0];
        finalNewsData.updatedAtTime = populatedNews.updatedAt.toISOString().split('T')[1].substring(0, 8);


        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "News updated successfully.",
            data: finalNewsData,
        });

    } catch (error) {
        console.error("Error updating news:", error);
        next(error);
    }
};


export const deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.role;

        const news = await News.findById(id);

        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // Authorization: Only creator, admin, or superadmin can delete
        if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to delete this news.");
        }

        // Delete associated files from Spaces
        const filesToDelete = news.media.map(m => m.url);
        for (const url of filesToDelete) {
            await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete media file during news deletion:", err.message));
        }

        await news.deleteOne();

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "News deleted successfully.",
            data: {}
        });

    } catch (error) {
        console.error("Error deleting news:", error);
        next(error);
    }
};


export const getAllPublicNews = async (req, res) => {
  try {
    const newsList = await News.find({ status: 'approved' }) // Only approved news
      .sort({ createdAt: -1 }) // Newest first
      .limit(50) // Limit to latest 50 news
      .populate([
        {
          path: 'createdBy',
          select: 'name profileImage role'
        },
        {
          path: 'category',
          select: 'name'
        },
        {
          path: 'subCategory',
          select: 'name'
        },
        {
          path: 'country',
          select: 'name'
        },
        {
          path: 'state',
          select: 'name'
        },
        {
          path: 'city',
          select: 'name'
        }
      ]);

    res.status(200).json({
      success: true,
      message: 'Public news fetched successfully',
      data: newsList
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching news'
    });
  }
};

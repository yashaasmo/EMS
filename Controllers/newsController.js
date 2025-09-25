

import News from '../Models/news.model.js';
import { Category, SubCategory, Country, State, City } from '../Models/lookupData.model.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js'; // Updated MESSAGES imported
import { ApiError } from '../Utils/apiError.js';
import User from '../Models/user.model.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
import headlineModel from '../Models/headline.model.js';

import NewsPoll from "../Models/NewsPoll.js"; // ✅ import Poll Model
import Tag from '../Models/Tag.js';
import SavedNews from '../Models/SavedNews.js';
import { generateSlug } from '../Utils/slugifyUtils.js';
// Helper function to convert Mongoose ObjectId to String for comparison
const convertIdToString = (id) => (id ? id.toString() : null);
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000'; // लोकल डेवलपमेंट के लिए डिफ़ॉल्ट
//chage 8/7/25

// export const createNews = async (req, res, next) => {
//   try {
//     const {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       subSubCategory,
//       tags = [],
//       country,
//       state,
//       city,
//       localAddress,
//       isHeadline,
//     } = req.body;

//     const userId = req.user?._id;

//     if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

//     const user = await User.findById(userId);
//     if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

//     if (!title || !content || !category) {
//       throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title, content and category are required.");
//     }

//     // Fetch category and subCategory names
//     const categoryDoc = await Category.findById(category);
//     const subCategoryDoc = await SubCategory.findById(subCategory);

//     if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category ID");
//     if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid subCategory ID");

//     // Media upload
//     let media = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const url = await uploadFileToSpaces(file, 'news-media');
//         media.push({
//           url,
//           type: file.mimetype.startsWith('video') ? 'video' : 'image',
//           caption: file.originalname || ''
//         });
//       }
//     }

//     // Status based on permission
//     const status = user.canDirectPost ? 'posted' : 'pending_approval';

//     // Prepare news payload
//     const newsPayload = {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       tags,
//       media,
//       country,
//       state,
//       city,
//       localAddress,
//       status,
//       createdBy: userId,
//       updatedBy: userId,
//       publishedAt: (status === 'posted' || status === 'live') ? new Date() : null
//     };

//     // ✅ Only include subSubCategory if Astrology > Rashi
//     if (
//       categoryDoc.name.toLowerCase() === 'astrology' &&
//       subCategoryDoc.name.toLowerCase() === 'rashi' &&
//       subSubCategory
//     ) {
//       newsPayload.subSubCategory = subSubCategory;
//     }

//     // ✅ Save News
//     const news = await News.create(newsPayload);
//     news.shareLink = `${FRONTEND_BASE_URL}/news/${news._id}`;
//     await news.save();

//     // ✅ If Headline option is true → save in headlineModel also
//     if (isHeadline === true || isHeadline === 'true') {
//       const newHeadline = new headlineModel({
//         newsId: news._id, // reference rakho
//         headlineText: news.title,
//         createdBy: news.createdBy,
//         category: news.category,
//         subCategory: news.subCategory || null,
//         country: news.country || null,
//         state: news.state || null,
//         city: news.city || null,
//         status: news.status,
//       });
//       await newHeadline.save();
//     }

//     // ✅ Single response only
//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: MESSAGES.CREATED, // Using MESSAGES.CREATED
//       data: news
//     });

//   } catch (error) {
//     // Cleanup files if DB fails
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         if (file.location) {
//           await deleteFileFromSpaces(file.location).catch(err =>
//             console.error("Cleanup error:", err)
//           );
//         }
//       }
//     }
//     next(error);
//   }
// };


// export const createNews = async (req, res, next) => {
//   try {
//     const {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       subSubCategory,
//       tags = [],
//       country,
//       state,
//       city,
//       localAddress,
//       isHeadline,
//       poll, // ✅ poll data accept kar rahe hain
//     } = req.body;

//     const userId = req.user?._id;

//     if (!userId) throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED);

//     const user = await User.findById(userId);
//     if (!user) throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND);

//     if (!title || !content || !category) {
//       throw new ApiError(STATUS_CODES.BAD_REQUEST, "Title, content and category are required.");
//     }

//     // Fetch category and subCategory names
//     const categoryDoc = await Category.findById(category);
//     const subCategoryDoc = await SubCategory.findById(subCategory);

//     if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid category ID");
//     if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid subCategory ID");

//     // Media upload
//     let media = [];
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const url = await uploadFileToSpaces(file, "news-media");
//         media.push({
//           url,
//           type: file.mimetype.startsWith("video") ? "video" : "image",
//           caption: file.originalname || "",
//         });
//       }
//     }

//     // Status based on permission
//     const status = user.canDirectPost ? "posted" : "pending_approval";

//     // Prepare news payload
//     const newsPayload = {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       tags,
//       media,
//       country,
//       state,
//       city,
//       localAddress,
//       status,
//       createdBy: userId,
//       updatedBy: userId,
//       publishedAt: status === "posted" || status === "live" ? new Date() : null,
//     };

//     // ✅ Only include subSubCategory if Astrology > Rashi
//     if (
//       categoryDoc.name.toLowerCase() === "astrology" &&
//       subCategoryDoc.name.toLowerCase() === "rashi" &&
//       subSubCategory
//     ) {
//       newsPayload.subSubCategory = subSubCategory;
//     }

//     // ✅ Save News
//     const news = await News.create(newsPayload);
//     news.shareLink = `${FRONTEND_BASE_URL}/news/${news._id}`;
//     await news.save();

//     // ✅ If Poll data provided → create poll
//     if (poll && poll.question && poll.options?.length > 0) {
//       const createdPoll = await NewsPoll.create({
//         question: poll.question,
//         options: poll.options.map((opt) => ({ text: opt })),
//         newsId: news._id,
//         createdBy: userId,
//       });

//       // Link poll back to news
//       news.poll = createdPoll._id;
//       await news.save();
//     }

//     if (tags && tags.length > 0) {
//   for (const tagName of tags) {
//     let tag = await Tag.findOne({ name: tagName.trim() });

//     if (!tag) {
//       // Agar tag exist nahi karta → naya create karo
//       tag = await Tag.create({
//         name: tagName.trim(),
//         createdBy: userId,
//         news: [news._id],   // naya news add karte hi
//       });
//     } else {
//       // Agar tag exist karta hai → usme newsId push karo (agar already nahi hai)
//       if (!tag.news.includes(news._id)) {
//         tag.news.push(news._id);
//         await tag.save();
//       }
//     }
//   }
// }

//     // ✅ If Headline option is true → save in headlineModel also
//     if (isHeadline === true || isHeadline === "true") {
//       const newHeadline = new headlineModel({
//         newsId: news._id, // reference rakho
//         headlineText: news.title,
//         createdBy: news.createdBy,
//         category: news.category,
//         subCategory: news.subCategory || null,
//         country: news.country || null,
//         state: news.state || null,
//         city: news.city || null,
//         status: news.status,
//       });
//       await newHeadline.save();

//       // ✅ Tags ko Tag Model me bhi save karo

//     }

//     // ✅ Single response only
//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: MESSAGES.CREATED, // Using MESSAGES.CREATED
//       data: news,
//     });
//   } catch (error) {
//     // Cleanup files if DB fails
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         if (file.location) {
//           await deleteFileFromSpaces(file.location).catch((err) =>
//             console.error("Cleanup error:", err)
//           );
//         }
//       }
//     }
//     next(error);
//   }
// };
///////////////////////////////////////////////////////  create new work done /////////////////////////////////

// export const createNews = async (req, res, next) => {
//   try {
//     let {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       subSubCategory,
//       tags = [],
//       country,
//       state,
//       city,
//       localAddress,
//       isHeadline,
//       poll,
//            referenceLinks = [], // ✅ New field for external links
//       mediaUrls = [], // frontend se aa sakta hai
//     } = req.body;

//     const userId = req.user?._id;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     // ✅ Validation
//     if (!title || !content || !category) {
//       return res.status(400).json({ success: false, message: "Title, Content, Category required" });
//     }

//     // ✅ Ensure tags is array
//     if (typeof tags === "string") {
//       try {
//         tags = JSON.parse(tags);
//       } catch {
//         tags = [tags];
//       }
//     }

//     // ✅ Ensure mediaUrls is array
//     if (typeof mediaUrls === "string") {
//       try {
//         mediaUrls = JSON.parse(mediaUrls);
//       } catch {
//         mediaUrls = [mediaUrls];
//       }
//     }
//     if (!Array.isArray(mediaUrls)) mediaUrls = [];

//        // ✅ Ensure referenceLinks is an array (New change)
//     if (typeof referenceLinks === "string") {
//       try {
//         referenceLinks = JSON.parse(referenceLinks);
//       } catch {
//         referenceLinks = [referenceLinks];
//       }
//     }
//     if (!Array.isArray(referenceLinks)) referenceLinks = [];


//     // ✅ Uploaded files → media objects
//     let uploadedMedia = [];
//     if (req.files && req.files.length > 0) {
//       uploadedMedia = await Promise.all(
//         req.files.map(async (file) => {
//           const url = await uploadFileToSpaces(file, "news-media"); // ✅ proper upload
//           return {
//             url,
//             type: file.mimetype.startsWith("video") ? "video" : "image",
//             caption: file.originalname || "",
//           };
//         })
//       );
//     }

//     // ✅ External URLs → media objects
//     const externalMedia = mediaUrls.map((url) => ({
//       url,
//       type: url.includes("youtube") || url.includes(".mp4") ? "video" : "image",
//       caption: "",
//     }));

//     // ✅ Merge both
//     const media = [...uploadedMedia, ...externalMedia];

//     // ✅ Status (admin vs reporter)
//     const user = await User.findById(userId);
//     const status = user?.canDirectPost ? "posted" : "pending_approval";

//     // ✅ Final payload
//     const newsPayload = {
//       title,
//       content,
//       summary,
//       category,
//       subCategory,
//       subSubCategory,
//       tags,
//       media,
//       country,
//       state,
//       city,
//       localAddress,
//       isHeadline,
//       poll,
//       status,
//       createdBy: userId,
//       updatedBy: userId,
//       publishedAt: status === "posted" ? new Date() : null,
//             referenceLinks, // ✅ Add the new field to the payload
//     };

//     const news = await News.create(newsPayload);

//     // ✅ Generate share link
//     news.shareLink = `${FRONTEND_BASE_URL}/news/${news._id}`;
//     await news.save();

//     // ✅ Poll create
//     if (poll && poll.question && poll.options?.length > 0) {
//       const createdPoll = await NewsPoll.create({
//         question: poll.question,
//         options: poll.options.map((opt) => ({ text: opt })),
//         newsId: news._id,
//         createdBy: userId,
//       });
//       news.poll = createdPoll._id;
//       await news.save();
//     }

//     if (tags && tags.length > 0) {
//   for (const tagName of tags) {
//     let tag = await Tag.findOne({ name: tagName.trim() });

//     if (!tag) {
//       // Agar tag exist nahi karta → naya create karo
//       tag = await Tag.create({
//         name: tagName.trim(),
//         createdBy: userId,
//         news: [news._id],   // naya news add karte hi
//       });
//     } else {
//       // Agar tag exist karta hai → usme newsId push karo (agar already nahi hai)
//       if (!tag.news.includes(news._id)) {
//         tag.news.push(news._id);
//         await tag.save();
//       }
//     }
//   }
// }

//     // ✅ Headline create
//     if (isHeadline === true || isHeadline === "true") {
//       await new headlineModel({
//         newsId: news._id,
//         headlineText: news.title,
//         createdBy: news.createdBy,
//         category: news.category,
//         subCategory: news.subCategory || null,
//         country: news.country || null,
//         state: news.state || null,
//         city: news.city || null,
//         status: news.status,
//       }).save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "News created successfully",
//       data: news,
//     });
//   } catch (error) {
//     console.error("Error creating news:", error);

//     // ✅ Cleanup uploaded files agar DB save fail ho jaye
//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         if (file.location) {
//           await deleteFileFromSpaces(file.location).catch((err) =>
//             console.error("Cleanup error:", err)
//           );
//         }
//       }
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create news",
//       error: error.message,
//     });
//   }
// };

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






export const createNews = async (req, res, next) => {
    try {
        let {
            title_en, // New
            title_hi, // New
            content_en, // New
            content_hi, // New
            summary_en, // New
            summary_hi, // New
            category,
            subCategory,
            subSubCategory,
            tags = [],
            country,
            state,
            city,
            localAddress,
            isHeadline,
            poll,
            referenceLinks = [],
            mediaUrls = [],
        } = req.body;

        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

    
        // ✅ Ensure tags is array
        if (typeof tags === "string") {
            try {
                tags = JSON.parse(tags);
            } catch {
                tags = [tags];
            }
        }

        // ✅ Ensure mediaUrls is array
        if (typeof mediaUrls === "string") {
            try {
                mediaUrls = JSON.parse(mediaUrls);
            } catch {
                mediaUrls = [mediaUrls];
            }
        }
        if (!Array.isArray(mediaUrls)) mediaUrls = [];

        // ✅ Ensure referenceLinks is an array (New change)
        if (typeof referenceLinks === "string") {
            try {
                referenceLinks = JSON.parse(referenceLinks);
            } catch {
                referenceLinks = [referenceLinks];
            }
        }
        if (!Array.isArray(referenceLinks)) referenceLinks = [];


        // ✅ Uploaded files → media objects
        let uploadedMedia = [];
        if (req.files && req.files.length > 0) {
            uploadedMedia = await Promise.all(
                req.files.map(async (file) => {
                    const url = await uploadFileToSpaces(file, "news-media"); // ✅ proper upload
                    return {
                        url,
                        type: file.mimetype.startsWith("video") ? "video" : "image",
                        caption: file.originalname || "",
                    };
                })
            );
        }

        // ✅ External URLs → media objects
        const externalMedia = mediaUrls.map((url) => ({
            url,
            type: url.includes("youtube") || url.includes(".mp4") ? "video" : "image",
            caption: "",
        }));

        // ✅ Merge both
        const media = [...uploadedMedia, ...externalMedia];

        // ✅ Status (admin vs reporter)
        const user = await User.findById(userId);
        const status = user?.canDirectPost ? "posted" : "pending_approval";

           
        // ✅ Final payload
        const newsPayload = {
            title_en, // New
            title_hi, // New
            content_en, // New
            content_hi, // New
            summary_en, // New
            summary_hi, // New
             
            category,
              subCategory,
              subSubCategory,
            tags,
            media,
            country,
            state,
            city,
            localAddress,
            isHeadline,
            poll,
            status,
            createdBy: userId,
            updatedBy: userId,
            publishedAt: status === "posted" ? new Date() : null,
            referenceLinks,
        };

        const news = await News.create(newsPayload);

        // ✅ Generate share link
        const slug_en = `${generateSlug(title_en)}-${news._id}`;
news.slug_en = slug_en;
        news.shareLink = `${FRONTEND_BASE_URL}/news/${news._id}`;
        // news.shareLink = `${FRONTEND_BASE_URL}/news/${slug_en}`
        await news.save();
        

        // ✅ Poll create
        if (poll && poll.question && poll.options?.length > 0) {
            const createdPoll = await NewsPoll.create({
                question: poll.question,
                options: poll.options.map((opt) => ({ text: opt })),
                newsId: news._id,
                createdBy: userId,
            });
            news.poll = createdPoll._id;
            await news.save();
        }

        if (tags && tags.length > 0) {
            for (const tagName of tags) {
                let tag = await Tag.findOne({ name: tagName.trim() });

                if (!tag) {
                    // Agar tag exist nahi karta → naya create karo
                    tag = await Tag.create({
                        name: tagName.trim(),
                        createdBy: userId,
                        news: [news._id],   // naya news add karte ही
                    });
                } else {
                    // Agar tag exist karta hai → usme newsId push karo (agar already nahi hai)
                    if (!tag.news.includes(news._id)) {
                        tag.news.push(news._id);
                        await tag.save();
                    }
                }
            }
        }

        // ✅ Headline create
        if (isHeadline === true || isHeadline === "true") {
            await new headlineModel({
                newsId: news._id,
                headlineText: news.title_en ||news.title_hi , // Using English title for headline text
                createdBy: news.createdBy,
                category: news.category,
                subCategory: news.subCategory || null,
                country: news.country || null,
                state: news.state || null,
                city: news.city || null,
                status: news.status,
            }).save();
        }

        res.status(201).json({
            success: true,
            message: "News created successfully",
            data: news,
        });
    } catch (error) {
        console.error("Error creating news:", error);

        // ✅ Cleanup uploaded files agar DB save fail ho jaye
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                if (file.location) {
                    await deleteFileFromSpaces(file.location).catch((err) =>
                        console.error("Cleanup error:", err)
                    );
                }
            }
        }

        res.status(500).json({
            success: false,
            message: "Failed to create news",
            error: error.message,
        });
    }
};

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
                message: MESSAGES.NEWS_UNLIKED, // Using MESSAGES.NEWS_UNLIKED
                likesCount: news.likes.length,
            });
        } else {
            // Like
            news.likes.push({ user: userId });
            await news.save();
            res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: MESSAGES.NEWS_LIKED, // Using MESSAGES.NEWS_LIKED
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
            message: MESSAGES.COMMENT_POSTED, // Using MESSAGES.COMMENT_POSTED
            comment: latestCommentPopulated,
            commentsCount: populatedNews.comments.length,
        });
    } catch (error) {
        console.error("Error adding comment:", error);
        next(error);
    }
};

// export const getAllNews = async (req, res, next) => {
//   try {
//     let query;
//     const reqQuery = { ...req.query };

//     // select, sort हटाओ, बाकी काम करेंगे
//     const removeFields = ["select", "sort"];
//     removeFields.forEach((param) => delete reqQuery[param]);

//     // Mongo operators add
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

//     // select handle
//     if (req.query.select) {
//       const fields = req.query.select.split(",").join(" ");
//       query = query.select(fields);
//     }

//     // sort handle
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // Populate relations
//     query = query.populate([
//       { path: "createdBy", select: "name email role profileImage" },
//       { path: "updatedBy", select: "name email" },
//       { path: "category", select: "name iso2" },
//       { path: "subCategory", select: "name iso2" },
//       { path: "country", select: "name iso2" },
//       { path: "state", select: "name iso2" },
//       { path: "city", select: "name" },
//       { path: "comments.user", select: "name profileImage" },
//       { path: "likes.user", select: "name profileImage" },
//     ]);

//     // ✅ बिना limit/skip => सारे news मिलेंगे
//     const news = await query;

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       count: news.length,
//       message: MESSAGES.NEWS_FETCHED_SUCCESS, // Using MESSAGES.NEWS_FETCHED_SUCCESS
//       data: news.map((item) => {
//         const newsObj = item.toObject({ virtuals: true });
//         newsObj.shareLink = item.shareLink;
//         newsObj.postedDate = item.publishedAt
//           ? item.publishedAt.toISOString().split("T")[0]
//           : null;
//         newsObj.postedTime = item.publishedAt
//           ? item.publishedAt.toISOString().split("T")[1].substring(0, 8)
//           : null;
//         newsObj.createdAtDate = item.createdAt
//           .toISOString()
//           .split("T")[0];
//         newsObj.createdAtTime = item.createdAt
//           .toISOString()
//           .split("T")[1]
//           .substring(0, 8);
//         newsObj.updatedAtDate = item.updatedAt
//           .toISOString()
//           .split("T")[0];
//         newsObj.updatedAtTime = item.updatedAt
//           .toISOString()
//           .split("T")[1]
//           .substring(0, 8);

//         const currentUserId = req.user?._id?.toString();
//         newsObj.isLikedByCurrentUser = false;

//         if (currentUserId && Array.isArray(newsObj.likes)) {
//           newsObj.isLikedByCurrentUser = newsObj.likes.some((like) => {
//             const likeUserId = like.user?._id
//               ? like.user._id.toString()
//               : like.user?.toString();
//             return likeUserId === currentUserId;
//           });
//         }

//         return newsObj;
//       }),
//     });
//   } catch (error) {
//     console.error("Error getting all news:", error);
//     next(error);
//   }
// };


// export const getAllNews = async (req, res, next) => {
//   try {
//     let query;
//     const reqQuery = { ...req.query };

//     // Remove select and sort
//     const removeFields = ["select", "sort"];
//     removeFields.forEach(param => delete reqQuery[param]);

//     // Mongo operators
//     let queryStr = JSON.stringify(reqQuery);
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
//     let finalQueryFilter = JSON.parse(queryStr);

//     // Only posted/live for non-admin users
//     if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
//       finalQueryFilter.status = { $in: ["posted", "live"] };
//     }

//     query = News.find(finalQueryFilter);

//     // select
//     if (req.query.select) {
//       const fields = req.query.select.split(",").join(" ");
//       query = query.select(fields);
//     }

//     // sort
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // populate
//     query = query.populate([
//       { path: "createdBy", select: "name email role profileImage" },
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

//     // Get current user's saved news IDs
//     const currentUserId = req.user?._id?.toString();
//     let savedNewsIds = [];
//     if (currentUserId) {
//       const userSavedNews = await SavedNews.findOne({ user: currentUserId });
//       if (userSavedNews && Array.isArray(userSavedNews.news)) {
//         savedNewsIds = userSavedNews.news.map(n => n.toString());
//       }
//     }

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       count: news.length,
//       message: MESSAGES.NEWS_FETCHED_SUCCESS,
//       data: news.map(item => {
//         const newsObj = item.toObject({ virtuals: true });
        
//         // Dates
//         newsObj.shareLink = item.shareLink;
//         newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split("T")[0] : null;
//         newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split("T")[1].substring(0, 8) : null;
//         newsObj.createdAtDate = item.createdAt.toISOString().split("T")[0];
//         newsObj.createdAtTime = item.createdAt.toISOString().split("T")[1].substring(0, 8);
//         newsObj.updatedAtDate = item.updatedAt.toISOString().split("T")[0];
//         newsObj.updatedAtTime = item.updatedAt.toISOString().split("T")[1].substring(0, 8);

//         // Likes
//         newsObj.isLiked  = false;
//         if (currentUserId && Array.isArray(newsObj.likes)) {
//           newsObj.isLiked = newsObj.likes.some(like => {
//             const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
//             return likeUserId === currentUserId;
//           });
//         }

//         // Saved news
//         newsObj.isSaved = savedNewsIds.includes(item._id.toString());

//         return newsObj;
//       }),
//     });
//   } catch (error) {
//     console.error("Error getting all news:", error);
//     next(error);
//   }
// };

// export const getAllNews = async (req, res, next) => {
//   try {
//     let query;
//     const reqQuery = { ...req.query };

//     // Remove select/sort/lang
//     const removeFields = ["select", "sort", "lang"];
//     removeFields.forEach(param => delete reqQuery[param]);

//     // Mongo operators
//     let queryStr = JSON.stringify(reqQuery);
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
//     let finalQueryFilter = JSON.parse(queryStr);

//     // Only posted/live for non-admin users
//     if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
//       finalQueryFilter.status = { $in: ["posted", "live"] };
//     }

//     query = News.find(finalQueryFilter);

//     // हमेशा दोनों lang fields select करेंगे
//     let selectFields =
//       "title_en content_en summary_en title_hi content_hi summary_hi slug_en category subCategory country state city media createdBy updatedBy publishedAt status";

//     query = query.select(selectFields);

//     // sort
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt");
//     }

//     // populate
//     query = query.populate([
//       { path: "createdBy", select: "name email role profileImage" },
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
//     const lang = req.query.lang || "en";

//     // ✅ filter करके सिर्फ उसी lang वाले लाओ जिनमें data है
//     const filteredData = news
//       .map(item => {
//         const obj = item.toObject();

//         if (lang === "hi") {
//           if (!obj.title_hi && !obj.content_hi && !obj.summary_hi) {
//             return null; // Hindi data खाली है → exclude कर दो
//           }
//           obj.displayTitle = obj.title_hi;
//           obj.displayContent = obj.content_hi;
//           obj.displaySummary = obj.summary_hi;
//         } else {
//           if (!obj.title_en && !obj.content_en && !obj.summary_en) {
//             return null; // English data खाली है → exclude कर दो
//           }
//           obj.displayTitle = obj.title_en;
//           obj.displayContent = obj.content_en;
//           obj.displaySummary = obj.summary_en;
//         }

//         return obj;
//       })
//       .filter(item => item !== null); // null objects हटा दो

//     res.status(200).json({
//       success: true,
//       count: filteredData.length,
//       message: "News fetched successfully",
//       data: filteredData,
//     });
//   } catch (error) {
//     console.error("Error getting all news:", error);
//     next(error);
//   }
// };

export const getAllNews = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Remove select/sort/lang
    const removeFields = ["select", "sort", "lang"];
    removeFields.forEach(param => delete reqQuery[param]);

    // Mongo operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    let finalQueryFilter = JSON.parse(queryStr);

    // Only posted/live for non-admin users
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
      finalQueryFilter.status = { $in: ["posted", "live"] };
    }

    query = News.find(finalQueryFilter);

    // ✅ language wise fields
    const lang = req.query.lang || "en";

    let selectFieldsCommon =
      "slug_en category subCategory country state city media createdBy updatedBy publishedAt status";

    let selectFieldsLang =
      lang === "hi"
        ? "title_hi content_hi summary_hi"
        : "title_en content_en summary_en";

    query = query.select(`${selectFieldsLang} ${selectFieldsCommon}`);

    // sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // populate
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

    const news = await query;

    // ✅ हमेशा output keys: title_hi, content_hi, summary_hi
    const filteredData = news
      .map(item => {
        const obj = item.toObject();

        if (lang === "hi") {
          if (!obj.title_hi && !obj.content_hi && !obj.summary_hi) {
            return null;
          }
          // keys वही रहेंगे
          obj.title_hi = obj.title_hi;
          obj.content_hi = obj.content_hi;
          obj.summary_hi = obj.summary_hi;
        } else {
          if (!obj.title_en && !obj.content_en && !obj.summary_en) {
            return null;
          }
          // English values को Hindi keys में map कर दो
          obj.title_hi = obj.title_en;
          obj.content_hi = obj.content_en;
          obj.summary_hi = obj.summary_en;

          // original English fields हटा दो ताकि frontend confuse ना हो
          delete obj.title_en;
          delete obj.content_en;
          delete obj.summary_en;
        }

        return obj;
      })
      .filter(item => item !== null);

    res.status(200).json({
      success: true,
      count: filteredData.length,
      message: "News fetched successfully",
      data: filteredData,
    });
  } catch (error) {
    console.error("Error getting all news:", error);
    next(error);
  }
};



export const getAllNewsAdmin = async (req, res, next) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Remove fields not meant for filtering
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Convert Mongo operators (gt, gte, lt, lte, in)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    let finalQueryFilter = JSON.parse(queryStr);

    // Role-based access: non-admins see only posted/live
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
      finalQueryFilter.status = { $in: ["posted", "live"] };
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    query = News.find(finalQueryFilter);

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Populate relations
    query = query.populate([
      { path: "createdBy", select: "name email role profileImage city state" },
      { path: "updatedBy", select: "name email" },
      { path: "category", select: "name iso2" },
      { path: "subCategory", select: "name iso2" },
      { path: "country", select: "name iso2" },
      { path: "state", select: "name iso2" },
      { path: "city", select: "name" },
      { path: "comments.user", select: "name profileImage" },
      { path: "likes.user", select: "name profileImage" },
    ]);

    // Apply pagination
    const totalNewsCount = await News.countDocuments(finalQueryFilter);
    const totalPages = Math.ceil(totalNewsCount / limit);
    const news = await query.skip(skip).limit(limit);

    // Map news objects for frontend
    const mappedNews = news.map((item) => {
      const newsObj = item.toObject({ virtuals: true });

      // Map reporterDetails
      newsObj.reporterDetails = item.createdBy;

      // Map category/subCategory
      newsObj.category = item.category?.name || "N/A";
      newsObj.subCategory = item.subCategory?.name || "N/A";

      // Timestamps
      newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split("T")[0] : null;
      newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split("T")[1].substring(0, 8) : null;
      newsObj.createdAtDate = item.createdAt.toISOString().split("T")[0];
      newsObj.createdAtTime = item.createdAt.toISOString().split("T")[1].substring(0, 8);
      newsObj.updatedAtDate = item.updatedAt.toISOString().split("T")[0];
      newsObj.updatedAtTime = item.updatedAt.toISOString().split("T")[1].substring(0, 8);

      // Share link
      newsObj.shareLink = item.shareLink;

      // Likes
      const currentUserId = req.user?._id?.toString();
      newsObj.isLiked = false;
      if (currentUserId && Array.isArray(newsObj.likes)) {
        newsObj.isLiked = newsObj.likes.some((like) => {
          const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
          return likeUserId === currentUserId;
        });
      }

      return newsObj;
    });

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: mappedNews.length,
      totalPages,
      page,
      message: MESSAGES.NEWS_FETCHED_SUCCESS,
      data: mappedNews,
    });
  } catch (error) {
    console.error("Error getting all news:", error);
    next(error);
  }
};

// export const getNewsById = async (req, res, next) => {
//     try {
//         const news = await News.findById(req.params.id)
//             .populate([
//                 {
//                     path: 'createdBy',
//                     select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
//                 },
//                 { path: 'updatedBy', select: 'name email' },
//                 { path: 'country', select: 'name iso2' },
//                 { path: 'state', select: 'name iso2' },
//                 { path: 'city', select: 'name' },
//                 // Populate user details for likes and comments
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         if (!news) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//         }

//         // If not an admin/superadmin, ensure the news is 'posted' or 'live'
//         if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
//             if (!['posted', 'live'].includes(news.status)) {
//                 throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND + ": This news is not publicly available.");
//             }
//         }


//         // Increment views count (optional, can be moved to a separate microservice/job for high traffic)
//         news.viewsCount = (news.viewsCount || 0) + 1;
//         await news.save();

//         const newsObj = news.toObject({ virtuals: true }); // Include virtuals

//         // Get reporter's location names for display (from createdBy user details)
//         const reporterDetails = news.createdBy; // This is now populated
//         if (reporterDetails) {
//             // Need to ensure the populated country/state/city IDs are valid ObjectIds before querying.
//             // If they are already populated by Mongoose, they'd be objects.
//             const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
//             const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
//             const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;


//             newsObj.reporterDetails = {
//                 id: reporterDetails._id,
//                 name: reporterDetails.name,
//                 email: reporterDetails.email,
//                 role: reporterDetails.role,
//                 profileImage: reporterDetails.profileImage,
//                 country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
//                 state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
//                 city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
//                 address: reporterDetails.address,
//                 dateOfBirth: reporterDetails.dateOfBirth,
//                 canDirectPost: reporterDetails.canDirectPost,
//                 canDirectGoLive: reporterDetails.canDirectGoLive,
//             };
//         } else {
//             newsObj.reporterDetails = null; // Or handle as needed
//         }


//         // Add formatted date/time fields
//         newsObj.postedDate = news.publishedAt ? news.publishedAt.toISOString().split('T')[0] : null;
//         newsObj.postedTime = news.publishedAt ? news.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//         newsObj.createdAtDate = news.createdAt.toISOString().split('T')[0];
//         newsObj.createdAtTime = news.createdAt.toISOString().split('T')[1].substring(0, 8);
//         newsObj.updatedAtDate = news.updatedAt.toISOString().split('T')[0];
//         newsObj.updatedAtTime = news.updatedAt.toISOString().split('T')[1].substring(0, 8);


//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.NEWS_FETCHED_SUCCESS, // Using MESSAGES.NEWS_FETCHED_SUCCESS
//             data: newsObj,
//         });

//     } catch (error) {
//         console.error("Error getting news by ID:", error);
//         next(error);
//     }
// };

// export const getNewsById = async (req, res, next) => {
//   try {
//     let news = await News.findById(req.params.id).populate([
//       {
//         path: 'createdBy',
//         select:
//           'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
//       },
//       { path: 'updatedBy', select: 'name email' },
//       { path: 'country', select: 'name iso2' },
//       { path: 'state', select: 'name iso2' },
//       { path: 'city', select: 'name' },
//       { path: 'likes.user', select: 'name profileImage' },
//       { path: 'comments.user', select: 'name profileImage' },
//       {
//         path: 'poll',
//         select: 'question options totalVotes status createdAt updatedAt',
//       },
//     ]);

//     if (!news) {
//       throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//     }

//     // ✅ Non-admin access control
//     if (
//       !req.user ||
//       (req.user.role !== 'admin' && req.user.role !== 'superadmin')
//     ) {
//       if (!['posted', 'live'].includes(news.status)) {
//         throw new ApiError(
//           STATUS_CODES.NOT_FOUND,
//           `${MESSAGES.NEWS_NOT_FOUND}: This news is not publicly available.`
//         );
//       }
//     }

//     // ✅ Atomic increment for viewsCount
//     await News.findByIdAndUpdate(news._id, {
//       $inc: { viewsCount: 1 },
//     });

//     // Fresh copy with incremented views
//     news = await News.findById(news._id).populate([
//       {
//         path: 'createdBy',
//         select:
//           'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
//       },
//       { path: 'updatedBy', select: 'name email' },
//       { path: 'country', select: 'name iso2' },
//       { path: 'state', select: 'name iso2' },
//       { path: 'city', select: 'name' },
//       { path: 'likes.user', select: 'name profileImage' },
//       { path: 'comments.user', select: 'name profileImage' },
//       {
//         path: 'poll',
//         select: 'question options totalVotes status createdAt updatedAt',
//       },
//     ]);

//     const newsObj = news.toObject({ virtuals: true });

//     // ✅ Poll percentage calculation
//     if (
//       newsObj.poll &&
//       Array.isArray(newsObj.poll.options) &&
//       newsObj.poll.totalVotes > 0
//     ) {
//       newsObj.poll.options = newsObj.poll.options.map((opt) => {
//         const optionObj = opt.toObject ? opt.toObject() : opt;
//         const percentage =
//           optionObj.votes && newsObj.poll.totalVotes > 0
//             ? ((optionObj.votes / newsObj.poll.totalVotes) * 100).toFixed(2) + '%'
//             : '0%';

//         return {
//           ...optionObj,
//           percentage,
//         };
//       });
//     }

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: MESSAGES.NEWS_FETCHED_SUCCESS,
//       data: newsObj,
//     });
//   } catch (error) {
//     console.error('Error getting news by ID:', error);
//     next(error);
//   }
// };


// export const updateNews = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?._id;
//         const userRole = req.user?.role;
//         const {
//             title,
//             content,
//             summary,
//             category,
//             subCategory,
//             tags,
//             country,
//             state,
//             city,
//             localAddress,
//             status
//         } = req.body;

//         let news = await News.findById(id);

//         if (!news) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//         }

//         // Authorization: Only creator, admin, or superadmin can update
//         if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this news.");
//         }

//         // --- Handle Media Updates ---
//         let existingMediaUrls = news.media.map(m => m.url);
//         let updatedMedia = [];
//         let filesToDeleteFromCloud = [];

//         // If new files are uploaded, process them
//         if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//     const url = await uploadFileToSpaces(file, 'news-media');
//     updatedMedia.push({
//         url,
//         type: file.mimetype.startsWith('video') ? 'video' : 'image',
//         caption: file.originalname || ''
//     });
// }

//         }

//         // Handle `media` field from body: It should tell which existing media to keep.
//         // If `req.body.existingMedia` is provided, assume it's an array of URLs to keep.
//         // Any media in `news.media` but NOT in `req.body.existingMedia` (if provided) should be deleted.
//         if (req.body.existingMedia) { // Expect `existingMedia` to be a JSON string of URLs or an array of URLs
//             let mediaToKeep = [];
//             try {
//                 mediaToKeep = typeof req.body.existingMedia === 'string' ? JSON.parse(req.body.existingMedia) : req.body.existingMedia;
//             } catch (e) {
//                 console.error("Error parsing existingMedia:", e);
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for existingMedia.");
//             }

//             // Filter out media to delete
//             for (const oldMedia of news.media) {
//                 if (!mediaToKeep.includes(oldMedia.url)) {
//                     filesToDeleteFromCloud.push(oldMedia.url);
//                 }
//             }
//             // Add kept media to updatedMedia list
//             updatedMedia = [...updatedMedia, ...news.media.filter(m => mediaToKeep.includes(m.url))];

//         } else if (req.files && req.files.length > 0) {
//             // If new files are uploaded but no `existingMedia` specified, assume all old media are replaced
//             filesToDeleteFromCloud.push(...existingMediaUrls);
//         }
//         // If no new files and no `existingMedia` specified, `updatedMedia` remains based on prior state or empty.
//         // If `req.body.media` explicitly passed as an empty array or null, it means clear all media.
//         if (req.body.media === null || (Array.isArray(req.body.media) && req.body.media.length === 0 && !req.files?.length)) {
//              filesToDeleteFromCloud.push(...existingMediaUrls);
//              updatedMedia = [];
//         }


//         // --- Handle Location Updates ---
//         let countryId = news.country;
//         if (country !== undefined) {
//             if (country === null || country === '') {
//                 countryId = null;
//             } else {
//                 const countryDoc = await Country.findOne({ name: country });
//                 if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country name is invalid.");
//                 countryId = countryDoc._id;
//             }
//         }

//         let stateId = news.state;
//         if (state !== undefined) {
//             if (state === null || state === '') {
//                 stateId = null;
//             } else {
//                 const stateDoc = await State.findOne({ name: state });
//                 if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state name is invalid.");
//                 stateId = stateDoc._id;
//                 if (countryId && convertIdToString(stateDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
//                 }
//             }
//         }

//         let cityId = news.city;
//         if (city !== undefined) {
//             if (city === null || city === '') {
//                 cityId = null;
//             } else {
//                 const cityDoc = await City.findOne({ name: city });
//                 if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city name is invalid.");
//                 cityId = cityDoc._id;
//                 if (stateId && convertIdToString(cityDoc.state) !== convertIdToString(stateId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
//                 }
//                 if (countryId && convertIdToString(cityDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
//                 }
//             }
//         }

//         // --- Handle Category/SubCategory Updates ---
//         let finalCategory = news.category;
//         if (category !== undefined) {
//             if (category === null || category === '') {
//                 finalCategory = null;
//                 finalSubCategory = null; // If category is cleared, subcategory must also be cleared
//             } else {
//                 const categoryDoc = await Category.findOne({ name: category });
//                 if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category name is invalid.");
//                 finalCategory = category;
//             }
//         }

//         let finalSubCategory = news.subCategory;
//         if (subCategory !== undefined) {
//             if (subCategory === null || subCategory === '') {
//                 finalSubCategory = null;
//             } else {
//                 const currentCategoryDoc = await Category.findOne({ name: finalCategory }); // Use the (potentially updated) category
//                 if (!currentCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category not found for subCategory validation.");
//                 const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: currentCategoryDoc._id });
//                 if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid or does not belong to the selected category.");
//                 finalSubCategory = subCategory;
//             }
//         } else if (category !== undefined && (category === null || category === '')) {
//              // If category was explicitly cleared, clear subCategory too
//             finalSubCategory = null;
//         }


//         // --- Status Update Logic (More flexible for updates) ---
//         let updatedStatus = news.status;
//         if (status !== undefined) {
//             if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
//             }

//             const currentUser = req.user; // User object from authentication middleware

//             // SuperAdmin or Admin with manageNews permission can set any valid status
//             if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageNews)) {
//                 updatedStatus = status;
//             }
//             // Reporter can only set specific statuses based on their permissions
//             else if (currentUser.role === 'reporter') {
//                 if (status === 'live' && currentUser.canDirectGoLive) {
//                     updatedStatus = status;
//                 } else if (['posted'].includes(status) && currentUser.canDirectPost) {
//                     updatedStatus = status;
//                 } else if (['draft', 'pending_approval'].includes(status)) {
//                     updatedStatus = status; // Reporters can always set their own news to draft/pending
//                 } else {
//                     throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
//                 }
//             } else { // 'user' role should not be able to update news status
//                 throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update news status.");
//             }
//         }


//         // Prepare fields to update
//         const updateFields = {
//             title: title !== undefined ? title : news.title,
//             content: content !== undefined ? content : news.content,
//             summary: summary !== undefined ? summary : news.summary,
//             category: finalCategory,
//             subCategory: finalSubCategory,
//             tags: tags !== undefined ? tags : news.tags,
//             media: updatedMedia, // Set the updated media array
//             country: countryId,
//             state: stateId,
//             city: cityId,
//             localAddress: localAddress !== undefined ? localAddress : news.localAddress,
//             status: updatedStatus,
//             updatedBy: userId, // Set the user who updated
//         };

//         // If status changes to posted/live and was not already, update publishedAt
//         if ((updateFields.status === 'posted' || updateFields.status === 'live') && !news.publishedAt && updateFields.status !== news.status) {
//             updateFields.publishedAt = new Date();
//         } else if (updateFields.status !== 'posted' && updateFields.status !== 'live' && news.publishedAt && updateFields.status !== news.status) {
//             // If news goes out of posted/live status, clear publishedAt (optional, depends on logic)
//             // updateFields.publishedAt = null;
//         }


//         news = await News.findByIdAndUpdate(id, updateFields, {
//             new: true, // Return the updated document
//             runValidators: true // Run schema validators
//         });

//         // Delete old files from cloud after successful DB update
//         for (const url of filesToDeleteFromCloud) {
//             await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old media file:", err.message));
//         }


//         // Populate and Format Response
//         const populatedNews = await News.findById(news._id)
//             .populate([
//                 {
//                     path: 'createdBy',
//                     select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
//                 },
//                 { path: 'updatedBy', select: 'name email' },
//                 { path: 'country', select: 'name iso2' },
//                 { path: 'state', select: 'name iso2' },
//                 { path: 'city', select: 'name' },
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         const finalNewsData = populatedNews.toObject({ virtuals: true });

//         const reporterDetails = populatedNews.createdBy;
//         if (reporterDetails) {
//              const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
//              const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
//              const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;

//             finalNewsData.reporterDetails = {
//                 id: reporterDetails._id,
//                 name: reporterDetails.name,
//                 email: reporterDetails.email,
//                 role: reporterDetails.role,
//                 profileImage: reporterDetails.profileImage,
//                 country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
//                 state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
//                 city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
//                 address: reporterDetails.address,
//                 dateOfBirth: reporterDetails.dateOfBirth,
//                 canDirectPost: reporterDetails.canDirectPost,
//                 canDirectGoLive: reporterDetails.canDirectGoLive,
//             };
//         } else {
//             finalNewsData.reporterDetails = null;
//         }

//         finalNewsData.postedDate = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[0] : null;
//         finalNewsData.postedTime = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//         finalNewsData.createdAtDate = populatedNews.createdAt.toISOString().split('T')[0];
//         finalNewsData.createdAtTime = populatedNews.createdAt.toISOString().split('T')[1].substring(0, 8);
//         finalNewsData.updatedAtDate = populatedNews.updatedAt.toISOString().split('T')[0];
//         finalNewsData.updatedAtTime = populatedNews.updatedAt.toISOString().split('T')[1].substring(0, 8);


//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.NEWS_UPDATED, // Using MESSAGES.NEWS_UPDATED
//             data: finalNewsData,
//         });

//     } catch (error) {
//         console.error("Error updating news:", error);
//         next(error);
//     }
// };

// export const getNewsById = async (req, res, next) => {
//   try {
//     let news = await News.findById(req.params.id).populate([
//       {
//         path: 'createdBy',
//         select:
//           'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
//       },
//       { path: 'updatedBy', select: 'name email' },
//       { path: 'country', select: 'name iso2' },
//       { path: 'state', select: 'name iso2' },
//       { path: 'city', select: 'name' },
//       { path: 'likes.user', select: 'name profileImage' },
//       { path: 'comments.user', select: 'name profileImage' },
//       {
//         path: 'poll',
//         select: 'question options totalVotes status createdAt updatedAt',
//       },
//     ]);

//     if (!news) {
//       throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//     }

//     // ✅ Non-admin access control
//     if (
//       !req.user ||
//       (req.user.role !== 'admin' && req.user.role !== 'superadmin')
//     ) {
//       if (!['posted', 'live'].includes(news.status)) {
//         throw new ApiError(
//           STATUS_CODES.NOT_FOUND,
//           `${MESSAGES.NEWS_NOT_FOUND}: This news is not publicly available.`
//         );
//       }
//     }

//     // ✅ Atomic increment for viewsCount
//     await News.findByIdAndUpdate(news._id, {
//       $inc: { viewsCount: 1 },
//     });

//     // Fresh copy with incremented views
//     news = await News.findById(news._id).populate([
//       {
//         path: 'createdBy',
//         select:
//           'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
//       },
//       { path: 'updatedBy', select: 'name email' },
//       { path: 'country', select: 'name iso2' },
//       { path: 'state', select: 'name iso2' },
//       { path: 'city', select: 'name' },
//       { path: 'likes.user', select: 'name profileImage' },
//       { path: 'comments.user', select: 'name profileImage' },
//       {
//         path: 'poll',
//         select: 'question options totalVotes status createdAt updatedAt',
//       },
//     ]);

//     let newsObj = news.toObject({ virtuals: true });

//     // ✅ Poll percentage calculation
//     if (
//       newsObj.poll &&
//       Array.isArray(newsObj.poll.options) &&
//       newsObj.poll.totalVotes > 0
//     ) {
//       newsObj.poll.options = newsObj.poll.options.map((opt) => {
//         const optionObj = opt.toObject ? opt.toObject() : opt;
//         const percentage =
//           optionObj.votes && newsObj.poll.totalVotes > 0
//             ? ((optionObj.votes / newsObj.poll.totalVotes) * 100).toFixed(2) + '%'
//             : '0%';

//         return {
//           ...optionObj,
//           percentage,
//         };
//       });
//     }

//     // ✅ Like status for current user
//     const currentUserId = req.user?._id?.toString();
//     newsObj.isLiked = false;
//     if (currentUserId && Array.isArray(newsObj.likes)) {
//       newsObj.isLiked = newsObj.likes.some((like) => {
//         const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
//         return likeUserId === currentUserId;
//       });
//     }

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: MESSAGES.NEWS_FETCHED_SUCCESS,
//       data: newsObj,
//     });
//   } catch (error) {
//     console.error('Error getting news by ID:', error);
//     next(error);
//   }
// };


export const getNewsById = async (req, res, next) => {
  try {
    const lang = req.query.lang || "en";

    let news = await News.findById(req.params.id).populate([
      {
        path: 'createdBy',
        select:
          'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
      },
      { path: 'updatedBy', select: 'name email' },
      { path: 'country', select: 'name iso2' },
      { path: 'state', select: 'name iso2' },
      { path: 'city', select: 'name' },
      { path: 'likes.user', select: 'name profileImage' },
      { path: 'comments.user', select: 'name profileImage' },
      {
        path: 'poll',
        select: 'question options totalVotes status createdAt updatedAt',
      },
    ]);

    if (!news) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
    }

    // ✅ Non-admin access control
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
      if (!['posted', 'live'].includes(news.status)) {
        throw new ApiError(
          STATUS_CODES.NOT_FOUND,
          `${MESSAGES.NEWS_NOT_FOUND}: This news is not publicly available.`
        );
      }
    }

    // ✅ Atomic increment for viewsCount
    await News.findByIdAndUpdate(news._id, { $inc: { viewsCount: 1 } });

    // Fresh copy with incremented views
    news = await News.findById(news._id).populate([
      {
        path: 'createdBy',
        select:
          'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive',
      },
      { path: 'updatedBy', select: 'name email' },
      { path: 'country', select: 'name iso2' },
      { path: 'state', select: 'name iso2' },
      { path: 'city', select: 'name' },
      { path: 'likes.user', select: 'name profileImage' },
      { path: 'comments.user', select: 'name profileImage' },
      {
        path: 'poll',
        select: 'question options totalVotes status createdAt updatedAt',
      },
    ]);

    let newsObj = news.toObject({ virtuals: true });

    // ✅ normalize language fields
    if (lang === "hi") {
      newsObj.title_hi = newsObj.title_hi;
      newsObj.content_hi = newsObj.content_hi;
      newsObj.summary_hi = newsObj.summary_hi;
    } else {
      newsObj.title_hi = newsObj.title_en;
      newsObj.content_hi = newsObj.content_en;
      newsObj.summary_hi = newsObj.summary_en;
    }

    // original english fields remove कर दो
    delete newsObj.title_en;
    delete newsObj.content_en;
    delete newsObj.summary_en;

    // ✅ Poll percentage calculation
    if (newsObj.poll && Array.isArray(newsObj.poll.options) && newsObj.poll.totalVotes > 0) {
      newsObj.poll.options = newsObj.poll.options.map((opt) => {
        const optionObj = opt.toObject ? opt.toObject() : opt;
        const percentage =
          optionObj.votes && newsObj.poll.totalVotes > 0
            ? ((optionObj.votes / newsObj.poll.totalVotes) * 100).toFixed(2) + '%'
            : '0%';
        return { ...optionObj, percentage };
      });
    }

    // ✅ Like status for current user
    const currentUserId = req.user?._id?.toString();
    newsObj.isLiked = false;
    if (currentUserId && Array.isArray(newsObj.likes)) {
      newsObj.isLiked = newsObj.likes.some((like) => {
        const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
        return likeUserId === currentUserId;
      });
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.NEWS_FETCHED_SUCCESS,
      data: newsObj,
    });
  } catch (error) {
    console.error('Error getting news by ID:', error);
    next(error);
  }
};

  

// export const updateNews = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?._id;
//         const userRole = req.user?.role;
//         const {
//             title,
//             content,
//             summary,
//             category,
//             subCategory,
//             tags,
//             country,
//             state,
//             city,
//             localAddress,
//             status
//         } = req.body;

//         let news = await News.findById(id);

//         if (!news) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//         }

//         // Authorization: Only creator, admin, or superadmin can update
//         if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this news.");
//         }

//         // --- Handle Media Updates ---
//         let existingMediaUrls = news.media.map(m => m.url);
//         let updatedMedia = []; // Initialize updatedMedia here!
//         let filesToDeleteFromCloud = [];

//         // 1. Process new files (if any)
//         if (req.files && req.files.length > 0) {
//             for (const file of req.files) {
//                 const url = await uploadFileToSpaces(file, 'news-media');
//                 updatedMedia.push({
//                     url,
//                     type: file.mimetype.startsWith('video') ? 'video' : 'image',
//                     caption: file.originalname || ''
//                 });
//             }
//         }

//         // 2. Determine which existing media to keep or delete
//         if (req.body.existingMedia) { // Expect `existingMedia` to be a JSON string of URLs or an array of URLs
//             let mediaToKeep = [];
//             try {
//                 mediaToKeep = typeof req.body.existingMedia === 'string' ? JSON.parse(req.body.existingMedia) : req.body.existingMedia;
//             } catch (e) {
//                 console.error("Error parsing existingMedia:", e);
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for existingMedia.");
//             }

//             // Filter out media to delete from old news.media
//             for (const oldMedia of news.media) {
//                 if (!mediaToKeep.includes(oldMedia.url)) {
//                     filesToDeleteFromCloud.push(oldMedia.url);
//                 }
//             }
//             // Add kept existing media to updatedMedia list
//             updatedMedia = [...updatedMedia, ...news.media.filter(m => mediaToKeep.includes(m.url))];

//         } else if (req.files && req.files.length > 0 && !req.body.existingMedia) {
//             // If new files are uploaded AND no `existingMedia` specified, assume all old media are replaced
//             // This case handles a complete replacement if existingMedia wasn't explicitly sent.
//             filesToDeleteFromCloud.push(...existingMediaUrls);
//             // In this scenario, updatedMedia already contains the new files from step 1.
//             // If the intent was to keep some old media, existingMedia should have been sent.
//         }
//         // 3. Handle explicit clear all media: if `req.body.media` is explicitly empty/null
//         // This condition is distinct from `existingMedia` which defines what to keep from *previous* media.
//         // `req.body.media` being null or empty array indicates a full clear, even if existingMedia was somehow malformed.
//         if (req.body.media === null || (Array.isArray(req.body.media) && req.body.media.length === 0 && (!req.files || req.files.length === 0))) {
//              filesToDeleteFromCloud.push(...existingMediaUrls);
//              updatedMedia = []; // Clear all media if explicitly requested and no new files
//         }


//         // --- Handle Location Updates ---
//         let countryId = news.country;
//         if (country !== undefined) {
//             if (country === null || country === '') {
//                 countryId = null;
//             } else {
//                 const countryDoc = await Country.findOne({ name: country });
//                 if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country name is invalid.");
//                 countryId = countryDoc._id;
//             }
//         }

//         let stateId = news.state;
//         if (state !== undefined) {
//             if (state === null || state === '') {
//                 stateId = null;
//             } else {
//                 const stateDoc = await State.findOne({ name: state });
//                 if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state name is invalid.");
//                 stateId = stateDoc._id;
//                 if (countryId && convertIdToString(stateDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
//                 }
//             }
//         }

//         let cityId = news.city;
//         if (city !== undefined) {
//             if (city === null || city === '') {
//                 cityId = null;
//             } else {
//                 const cityDoc = await City.findOne({ name: city });
//                 if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city name is invalid.");
//                 cityId = cityDoc._id;
//                 if (stateId && convertIdToString(cityDoc.state) !== convertIdToString(stateId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
//                 }
//                 if (countryId && convertIdToString(cityDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
//                 }
//             }
//         }

//         // --- Handle Category/SubCategory Updates ---
//         let finalCategory = news.category;
//         let categoryDocFound = null;
//         if (category !== undefined) {
//             if (category === null || category === '') {
//                 finalCategory = null;
//                 finalSubCategory = null;
//             } else {
//                 categoryDocFound = await Category.findOne({ name: category });
//                 if (!categoryDocFound) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category name is invalid.");
//                 finalCategory = categoryDocFound._id;
//             }
//         } else {
//             if (news.category) {
//                 categoryDocFound = await Category.findById(news.category);
//             }
//         }

//         let finalSubCategory = news.subCategory;
//         if (subCategory !== undefined) {
//             if (subCategory === null || subCategory === '') {
//                 finalSubCategory = null;
//             } else {
//                 if (!categoryDocFound) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category not found for subCategory validation. Please provide a valid category first.");
//                 }
//                 const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDocFound._id });
//                 if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid or does not belong to the selected category.");
//                 finalSubCategory = subCategoryDoc._id;
//             }
//         } else if (category !== undefined && (category === null || category === '')) {
//             finalSubCategory = null;
//         }

//         // --- Status Update Logic (More flexible for updates) ---
//         let updatedStatus = news.status;
//         if (status !== undefined) {
//             if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
//             }

//             const currentUser = req.user;

//             if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageNews)) {
//                 updatedStatus = status;
//             }
//             else if (currentUser.role === 'reporter') {
//                 if (status === 'live' && currentUser.canDirectGoLive) {
//                     updatedStatus = status;
//                 } else if (['posted'].includes(status) && currentUser.canDirectPost) {
//                     updatedStatus = status;
//                 } else if (['draft', 'pending_approval'].includes(status)) {
//                     updatedStatus = status;
//                 } else {
//                     throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
//                 }
//             } else {
//                 throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update news status.");
//             }
//         }

//         // Prepare fields to update
//         const updateFields = {
//             title: title !== undefined ? title : news.title,
//             content: content !== undefined ? content : news.content,
//             summary: summary !== undefined ? summary : news.summary,
//             category: finalCategory,
//             subCategory: finalSubCategory,
//             tags: tags !== undefined ? tags : news.tags,
//             media: updatedMedia, // This will now always be defined
//             country: countryId,
//             state: stateId,
//             city: cityId,
//             localAddress: localAddress !== undefined ? localAddress : news.localAddress,
//             status: updatedStatus,
//             updatedBy: userId,
//         };

//         // If status changes to posted/live and was not already, update publishedAt
//         if ((updateFields.status === 'posted' || updateFields.status === 'live') && !news.publishedAt && updateFields.status !== news.status) {
//             updateFields.publishedAt = new Date();
//         } else if (updateFields.status !== 'posted' && updateFields.status !== 'live' && news.publishedAt && updateFields.status !== news.status) {
//             // If news goes out of posted/live status, clear publishedAt (optional, depends on logic)
//             // updateFields.publishedAt = null;
//         }


//         news = await News.findByIdAndUpdate(id, updateFields, {
//             new: true,
//             runValidators: true
//         });

//         // Delete old files from cloud after successful DB update
//         for (const url of filesToDeleteFromCloud) {
//             await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old media file:", err.message));
//         }

//         // Populate and Format Response
//         const populatedNews = await News.findById(news._id)
//             .populate([
//                 {
//                     path: 'createdBy',
//                     select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
//                 },
//                 { path: 'updatedBy', select: 'name email' },
//                 { path: 'country', select: 'name iso2' },
//                 { path: 'state', select: 'name iso2' },
//                 { path: 'city', select: 'name' },
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         const finalNewsData = populatedNews.toObject({ virtuals: true });

//         const reporterDetails = populatedNews.createdBy;
//         if (reporterDetails) {
//              const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
//              const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
//              const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;

//             finalNewsData.reporterDetails = {
//                 id: reporterDetails._id,
//                 name: reporterDetails.name,
//                 email: reporterDetails.email,
//                 role: reporterDetails.role,
//                 profileImage: reporterDetails.profileImage,
//                 country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
//                 state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
//                 city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
//                 address: reporterDetails.address,
//                 dateOfBirth: reporterDetails.dateOfBirth,
//                 canDirectPost: reporterDetails.canDirectPost,
//                 canDirectGoLive: reporterDetails.canDirectGoLive,
//             };
//         } else {
//             finalNewsData.reporterDetails = null;
//         }

//         finalNewsData.postedDate = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[0] : null;
//         finalNewsData.postedTime = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//         finalNewsData.createdAtDate = populatedNews.createdAt.toISOString().split('T')[0];
//         finalNewsData.createdAtTime = populatedNews.createdAt.toISOString().split('T')[1].substring(0, 8);
//         finalNewsData.updatedAtDate = populatedNews.updatedAt.toISOString().split('T')[0];
//         finalNewsData.updatedAtTime = populatedNews.updatedAt.toISOString().split('T')[1].substring(0, 8);


//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.NEWS_UPDATED,
//             data: finalNewsData,
//         });

//     } catch (error) {
//         console.error("Error updating news:", error);
//         next(error);
//     }
// };

import mongoose from 'mongoose'; // Add this import for ObjectId validation

// Helper function to validate if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// export const updateNews = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const userId = req.user?._id;
//         const userRole = req.user?.role;

//         // Destructure all expected fields, including multi-language ones
//         const {
//             title_en,
//             title_hi,
//             content_en,
//             content_hi,
//             summary_en,
//             summary_hi,
//             category, // Expected to be an ID or null/empty string
//             subCategory, // Expected to be an ID or null/empty string
//             tags, // Expected to be a JSON string array or array
//             country, // Expected to be an ID or null/empty string
//             state, // Expected to be an ID or null/empty string
//             city, // Expected to be an ID or null/empty string
//             localAddress,
//             status,
//             existingMedia, // Expected to be a JSON string array of URLs or array
//             // req.files will contain new file uploads automatically from multer
//         } = req.body;

//         let news = await News.findById(id);

//         if (!news) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
//         }

//         // Authorization: Only creator, admin, or superadmin can update
//         if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this news.");
//         }

//         // --- Handle Media Updates ---
//         let existingMediaUrls = news.media.map(m => m.url);
//         let updatedMedia = [];
//         let filesToDeleteFromCloud = [];

//         // 1. Process new files (if any) uploaded via 'files' field
//         if (req.files && req.files.length > 0) {
//             for (const file of req.files) {
//                 const url = await uploadFileToSpaces(file, 'news-media'); // Assuming uploadFileToSpaces exists
//                 updatedMedia.push({
//                     url,
//                     type: file.mimetype.startsWith('video') ? 'video' : 'image',
//                     caption: file.originalname || ''
//                 });
//             }
//         }

//         // 2. Determine which existing media to keep or delete
//         if (existingMedia !== undefined) {
//             let mediaToKeep = [];
//             try {
//                 mediaToKeep = typeof existingMedia === 'string' ? JSON.parse(existingMedia) : existingMedia;
//                 if (!Array.isArray(mediaToKeep)) { // Ensure it's an array
//                     throw new Error("existingMedia must be an array or JSON string of an array.");
//                 }
//             } catch (e) {
//                 console.error("Error parsing existingMedia:", e);
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for existingMedia. " + e.message);
//             }

//             // Filter out media to delete from old news.media
//             for (const oldMedia of news.media) {
//                 if (!mediaToKeep.includes(oldMedia.url)) {
//                     filesToDeleteFromCloud.push(oldMedia.url);
//                 }
//             }
//             // Add kept existing media to updatedMedia list (append to new uploads)
//             updatedMedia = [...updatedMedia, ...news.media.filter(m => mediaToKeep.includes(m.url))];

//         } else if (req.files && req.files.length > 0) {
//             // If new files are uploaded AND `existingMedia` was NOT specified,
//             // assume all old media are replaced by the new ones.
//             filesToDeleteFromCloud.push(...existingMediaUrls);
//         }
//         // 3. Handle explicit clear all media: if `existingMedia` is explicitly empty array AND no new files
//         if ((existingMedia !== undefined && Array.isArray(existingMedia) && existingMedia.length === 0) && (!req.files || req.files.length === 0)) {
//              filesToDeleteFromCloud.push(...existingMediaUrls);
//              updatedMedia = []; // Clear all media
//         }

//         // --- Handle Tags Update ---
//         let finalTags = news.tags; // Default to existing tags
//         if (tags !== undefined) {
//             try {
//                 finalTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
//                 if (!Array.isArray(finalTags)) { // Ensure it's an array after parsing
//                     finalTags = [finalTags]; // Convert to array if it was a single tag string
//                 }
//             } catch (e) {
//                 console.error("Error parsing tags:", e);
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for tags. " + e.message);
//             }
//         }


//         // --- Handle Location Updates by ID ---
//         let countryId = news.country; // Default to existing
//         if (country !== undefined) {
//             if (country === null || country === '') {
//                 countryId = null; // Clear country
//             } else if (isValidObjectId(country)) {
//                 const countryDoc = await Country.findById(country); // Find by ID
//                 if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country ID is invalid or does not exist.");
//                 countryId = countryDoc._id;
//             } else {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided country is not a valid ID or null/empty.");
//             }
//         }

//         let stateId = news.state; // Default to existing
//         if (state !== undefined) {
//             if (state === null || state === '') {
//                 stateId = null; // Clear state
//             } else if (isValidObjectId(state)) {
//                 const stateDoc = await State.findById(state); // Find by ID
//                 if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state ID is invalid or does not exist.");
//                 stateId = stateDoc._id;
//                 // Validate if state belongs to the selected country (if both are provided)
//                 if (countryId && convertIdToString(stateDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
//                 }
//             } else {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided state is not a valid ID or null/empty.");
//             }
//         }

//         let cityId = news.city; // Default to existing
//         if (city !== undefined) {
//             if (city === null || city === '') {
//                 cityId = null; // Clear city
//             } else if (isValidObjectId(city)) {
//                 const cityDoc = await City.findById(city); // Find by ID
//                 if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city ID is invalid or does not exist.");
//                 cityId = cityDoc._id;
//                 // Validate if city belongs to the selected state/country (if provided)
//                 if (stateId && convertIdToString(cityDoc.state) !== convertIdToString(stateId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
//                 }
//                 if (countryId && convertIdToString(cityDoc.country) !== convertIdToString(countryId)) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
//                 }
//             } else {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided city is not a valid ID or null/empty.");
//             }
//         }

//         // --- Handle Category/SubCategory Updates by ID ---
//         let finalCategory = news.category; // Default to existing
//         let categoryDocFound = null; // Used for subCategory validation
//         if (category !== undefined) {
//             if (category === null || category === '') {
//                 finalCategory = null;
//                 finalSubCategory = null; // Also clear subCategory if parent is cleared
//             } else if (isValidObjectId(category)) {
//                 categoryDocFound = await Category.findById(category); // Find by ID
//                 if (!categoryDocFound) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category ID is invalid or does not exist.");
//                 finalCategory = categoryDocFound._id;
//             } else {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category is not a valid ID or null/empty.");
//             }
//         } else {
//             // If category was not provided in req.body, use existing category for subcategory validation if it's a valid ID
//             if (news.category && isValidObjectId(news.category)) {
//                 categoryDocFound = await Category.findById(news.category);
//             }
//         }

//         let finalSubCategory = news.subCategory; // Default to existing
//         if (subCategory !== undefined) {
//             if (subCategory === null || subCategory === '') {
//                 finalSubCategory = null; // Clear subCategory
//             } else if (isValidObjectId(subCategory)) {
//                 if (!categoryDocFound) {
//                     throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category not found for subCategory validation. Please provide a valid category first or ensure existing news category is valid.");
//                 }
//                 const subCategoryDoc = await SubCategory.findOne({ _id: subCategory, category: categoryDocFound._id }); // Find by ID and parent category
//                 if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory ID is invalid or does not belong to the selected category.");
//                 finalSubCategory = subCategoryDoc._id;
//             } else {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory is not a valid ID or null/empty.");
//             }
//         } else if (category !== undefined && (category === null || category === '')) {
//             // If category was explicitly cleared, also clear subCategory if not explicitly provided
//             finalSubCategory = null;
//         }


//         // --- Status Update Logic (More flexible for updates) ---
//         let updatedStatus = news.status;
//         if (status !== undefined) {
//             if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
//                 throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
//             }

//             const currentUser = req.user;

//             if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageNews)) {
//                 updatedStatus = status;
//             }
//             else if (currentUser.role === 'reporter') {
//                 if (status === 'live' && currentUser.canDirectGoLive) {
//                     updatedStatus = status;
//                 } else if (['posted'].includes(status) && currentUser.canDirectPost) {
//                     updatedStatus = status;
//                 } else if (['draft', 'pending_approval'].includes(status)) {
//                     updatedStatus = status;
//                 } else {
//                     throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
//                 }
//             } else {
//                 throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update news status.");
//             }
//         }

//         // Prepare fields to update
//         const updateFields = {
//             title_en: title_en !== undefined ? title_en : news.title_en,
//             title_hi: title_hi !== undefined ? title_hi : news.title_hi,
//             content_en: content_en !== undefined ? content_en : news.content_en,
//             content_hi: content_hi !== undefined ? content_hi : news.content_hi,
//             summary_en: summary_en !== undefined ? summary_en : news.summary_en,
//             summary_hi: summary_hi !== undefined ? summary_hi : news.summary_hi,
//             category: finalCategory,
//             subCategory: finalSubCategory,
//             tags: finalTags, // Use the parsed tags
//             media: updatedMedia, // This will now always be defined based on logic above
//             country: countryId,
//             state: stateId,
//             city: cityId,
//             localAddress: localAddress !== undefined ? localAddress : news.localAddress,
//             status: updatedStatus,
//             updatedBy: userId,
//         };

//         // If status changes to posted/live and was not already, update publishedAt
//         if ((updateFields.status === 'posted' || updateFields.status === 'live') && !news.publishedAt && updateFields.status !== news.status) {
//             updateFields.publishedAt = new Date();
//         } else if (updateFields.status !== 'posted' && updateFields.status !== 'live' && news.publishedAt && updateFields.status !== news.status) {
//             // If news goes out of posted/live status, clear publishedAt (optional, depends on logic)
//             // updateFields.publishedAt = null; // Uncomment if this logic is desired
//         }


//         news = await News.findByIdAndUpdate(id, updateFields, {
//             new: true,
//             runValidators: true
//         });

//         // Delete old files from cloud after successful DB update
//         for (const url of filesToDeleteFromCloud) {
//             await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old media file:", err.message)); // Assuming deleteFileFromSpaces exists
//         }

//         // Populate and Format Response
//         const populatedNews = await News.findById(news._id)
//             .populate([
//                 {
//                     path: 'createdBy',
//                     select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
//                 },
//                 { path: 'updatedBy', select: 'name email' },
//                 // Populate category, subCategory, country, state, city to return names to client
//                 { path: 'category', select: 'name' },
//                 { path: 'subCategory', select: 'name' },
//                 { path: 'country', select: 'name iso2' },
//                 { path: 'state', select: 'name iso2' },
//                 { path: 'city', select: 'name' },
//                 { path: 'likes.user', select: 'name profileImage' },
//                 { path: 'comments.user', select: 'name profileImage' }
//             ]);

//         const finalNewsData = populatedNews.toObject({ virtuals: true });

//         const reporterDetails = populatedNews.createdBy;
//         if (reporterDetails) {
//              const reporterCountry = reporterDetails.country ? await Country.findById(reporterDetails.country._id || reporterDetails.country) : null;
//              const reporterState = reporterDetails.state ? await State.findById(reporterDetails.state._id || reporterDetails.state) : null;
//              const reporterCity = reporterDetails.city ? await City.findById(reporterDetails.city._id || reporterDetails.city) : null;

//             finalNewsData.reporterDetails = {
//                 id: reporterDetails._id,
//                 name: reporterDetails.name,
//                 email: reporterDetails.email,
//                 role: reporterDetails.role,
//                 profileImage: reporterDetails.profileImage,
//                 country: reporterCountry ? reporterCountry.name : (typeof reporterDetails.country === 'object' ? reporterDetails.country.name : reporterDetails.country),
//                 state: reporterState ? reporterState.name : (typeof reporterDetails.state === 'object' ? reporterDetails.state.name : reporterDetails.state),
//                 city: reporterCity ? reporterCity.name : (typeof reporterDetails.city === 'object' ? reporterDetails.city.name : reporterDetails.city),
//                 address: reporterDetails.address,
//                 dateOfBirth: reporterDetails.dateOfBirth,
//                 canDirectPost: reporterDetails.canDirectPost,
//                 canDirectGoLive: reporterDetails.canDirectGoLive,
//             };
//         } else {
//             finalNewsData.reporterDetails = null;
//         }

//         finalNewsData.postedDate = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[0] : null;
//         finalNewsData.postedTime = populatedNews.publishedAt ? populatedNews.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//         finalNewsData.createdAtDate = populatedNews.createdAt.toISOString().split('T')[0];
//         finalNewsData.createdAtTime = populatedNews.createdAt.toISOString().split('T')[1].substring(0, 8);
//         finalNewsData.updatedAtDate = populatedNews.updatedAt.toISOString().split('T')[0];
//         finalNewsData.updatedAtTime = populatedNews.updatedAt.toISOString().split('T')[1].substring(0, 8);


//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: MESSAGES.NEWS_UPDATED,
//             data: finalNewsData,
//         });

//     } catch (error) {
//         console.error("Error updating news:", error);
//         next(error);
//     }
// };


//////////////////////////////////coump wordk //////////////////////////////

export const updateNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id; // Current user performing the update
        const userRole = req.user?.role;

        const {
            title_en,
            title_hi,
            content_en,
            content_hi,
            summary_en,
            summary_hi,
            category,
            subCategory,
            subSubCategory, // Added to handle Rashi option
            tags,
            // Renamed from 'existingMedia' to 'frontendDesiredUrlsJson'
            // This is the single, combined list of ALL desired URLs from the frontend
            mediaUrls: frontendDesiredUrlsJson,
            // Assuming referenceLinks are also sent as a JSON stringified array from frontend
            referenceLinks: frontendReferenceLinksJson,
            // Poll fields will be parsed from req.body directly due to their nested FormData structure
            // Example: req.body['poll[question]'], req.body['poll[options][]']
            country,
            state,
            city,
            localAddress,
            status,
        } = req.body;

        let news = await News.findById(id);

        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // Authorization: Only creator, admin, or superadmin can update
        if (news.createdBy.toString() !== userId.toString() && !['admin', 'superadmin'].includes(userRole)) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You are not authorized to update this news.");
        }

        // --- MEDIA HANDLING START ---
        let filesToDeleteFromCloud = []; // URLs of actual files to delete from cloud storage (e.g., S3, DigitalOcean Spaces)
        let finalNewsMediaObjects = []; // Will store objects for the `media` field in DB (internally uploaded files)
        let finalNewsExternalMediaUrls = []; // Will store strings for the `mediaUrls` field in DB (external links)

        // Parse `frontendDesiredUrlsJson` (the combined list of all URLs from frontend)
        let frontendDesiredUrls = [];
        if (frontendDesiredUrlsJson !== undefined) {
            try {
                frontendDesiredUrls = typeof frontendDesiredUrlsJson === 'string' ? JSON.parse(frontendDesiredUrlsJson) : frontendDesiredUrlsJson;
                if (!Array.isArray(frontendDesiredUrls)) {
                    throw new Error("mediaUrls must be an array or JSON string of an array.");
                }
            } catch (e) {
                console.error("Error parsing mediaUrls from frontend:", e);
                throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for mediaUrls. " + e.message);
            }
        }
        const frontendDesiredUrlsSet = new Set(frontendDesiredUrls); // For efficient lookup

        // 1. Process new file uploads via `req.files` (multer adds these)
        // These are guaranteed to be new files uploaded to our storage.
        const newlyUploadedFileObjects = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                // Ensure uploadFileToSpaces returns the full, publicly accessible URL
                const url = await uploadFileToSpaces(file, 'news-media');
                newlyUploadedFileObjects.push({
                    url,
                    type: file.mimetype.startsWith('video') ? 'video' : 'image',
                    caption: file.originalname || ''
                });
            }
        }
        finalNewsMediaObjects.push(...newlyUploadedFileObjects); // Add new uploads to our final list
        const newlyUploadedUrlsSet = new Set(newlyUploadedFileObjects.map(obj => obj.url)); // For efficient lookup

        // 2. Reconcile existing `news.media` objects (files already in our storage)
        // Keep `news.media` objects whose URLs are in `frontendDesiredUrls`.
        // Mark for deletion `news.media` objects whose URLs are NOT in `frontendDesiredUrls`.
        for (const oldMediaObj of news.media) {
            if (frontendDesiredUrlsSet.has(oldMediaObj.url)) {
                finalNewsMediaObjects.push(oldMediaObj); // Keep this existing uploaded file
            } else {
                // This old uploaded file is no longer desired by the frontend, mark its URL for cloud deletion
                filesToDeleteFromCloud.push(oldMediaObj.url);
            }
        }

        // 3. Reconcile `news.mediaUrls` (external links, or new external links)
        // Iterate through all URLs the frontend wants (`frontendDesiredUrls`).
        // If a URL is NOT a newly uploaded file and NOT an existing uploaded file,
        // then it must be an external link (either already existing or new).
        for (const url of frontendDesiredUrls) {
            if (newlyUploadedUrlsSet.has(url)) {
                continue; // Already handled as a new upload, it's in finalNewsMediaObjects
            }
            if (news.media.some(m => m.url === url)) {
                continue; // Already handled as an existing uploaded file, it's in finalNewsMediaObjects
            }
            // If we reach here, it's an external URL (either old or newly added in frontend)
            finalNewsExternalMediaUrls.push(url);
        }

        // Ensure uniqueness for both final arrays (if frontend sent duplicates or logic added them)
        // Using Map to preserve order and uniqueness based on URL
        finalNewsMediaObjects = Array.from(new Map(finalNewsMediaObjects.map(item => [item.url, item])).values());
        finalNewsExternalMediaUrls = Array.from(new Set(finalNewsExternalMediaUrls));
        // --- MEDIA HANDLING END ---

        // --- REFERENCE LINKS HANDLING START ---
        let finalReferenceLinks = [];
        if (frontendReferenceLinksJson !== undefined) {
            try {
                finalReferenceLinks = typeof frontendReferenceLinksJson === 'string' ? JSON.parse(frontendReferenceLinksJson) : frontendReferenceLinksJson;
                if (!Array.isArray(finalReferenceLinks)) {
                    throw new Error("referenceLinks must be an array or JSON string of an array.");
                }
            } catch (e) {
                console.error("Error parsing referenceLinks from frontend:", e);
                throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for referenceLinks. " + e.message);
            }
        }
        finalReferenceLinks = Array.from(new Set(finalReferenceLinks)); // Ensure uniqueness
        // --- REFERENCE LINKS HANDLING END ---

        // --- TAGS HANDLING START ---
        let finalTags = news.tags; // Default to existing tags
        if (tags !== undefined) {
            try {
                finalTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                if (!Array.isArray(finalTags)) { // Ensure it's an array after parsing
                    finalTags = [finalTags]; // Convert to array if it was a single tag string
                }
            } catch (e) {
                console.error("Error parsing tags:", e);
                throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid format for tags. " + e.message);
            }
        }
        // --- TAGS HANDLING END ---

        // --- POLL HANDLING START ---
        let finalPoll = news.poll; // Default to existing poll
        // Check if poll data was sent (assuming FormData structure for poll fields)
        if (req.body['poll[question]'] !== undefined || req.body['poll[options][]'] !== undefined) {
            const pollQuestion = req.body['poll[question]'] ? req.body['poll[question]'].trim() : '';
            const pollOptions = Array.isArray(req.body['poll[options][]']) ? req.body['poll[options][]'].map(opt => opt.trim()).filter(opt => opt !== '') :
                               (req.body['poll[options][]'] ? [req.body['poll[options][]'].trim()].filter(opt => opt !== '') : []); // Handle single option string from formData

            if (pollQuestion && pollOptions.length > 0) {
                finalPoll = {
                    question: pollQuestion,
                    options: pollOptions,
                    // If you want to preserve existing votes when updating, retrieve them here
                    // votes: news.poll?.votes || []
                };
            } else if (!pollQuestion && pollOptions.length === 0) {
                // If question is empty and no options, clear the poll
                finalPoll = { question: '', options: [] };
            } else if (pollQuestion && pollOptions.length === 0) {
                // Question provided but no options
                throw new ApiError(STATUS_CODES.BAD_REQUEST, "Poll question requires at least one option.");
            } else if (!pollQuestion && pollOptions.length > 0) {
                // Options provided but no question
                 throw new ApiError(STATUS_CODES.BAD_REQUEST, "Poll options cannot be present without a question.");
            }
        }
        // --- POLL HANDLING END ---


        // --- Handle Location Updates by ID (Improved validation and default handling) ---
        let countryId = news.country;
        if (country !== undefined) {
            if (country === null || country === '') {
                countryId = null; // Clear country
            } else if (isValidObjectId(country)) {
                const countryDoc = await Country.findById(country);
                if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country ID is invalid or does not exist.");
                countryId = countryDoc._id;
            } else {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided country is not a valid ID or null/empty.");
            }
        }

        let stateId = news.state;
        if (state !== undefined) {
            if (state === null || state === '') {
                stateId = null; // Clear state
            } else if (isValidObjectId(state)) {
                const stateDoc = await State.findById(state);
                if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state ID is invalid or does not exist.");
                stateId = stateDoc._id;
                // Validate if state belongs to the selected country (if both are provided)
                if (countryId && convertIdToString(stateDoc.country) !== convertIdToString(countryId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
                }
            } else {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided state is not a valid ID or null/empty.");
            }
        }

        let cityId = news.city;
        if (city !== undefined) {
            if (city === null || city === '') {
                cityId = null; // Clear city
            } else if (isValidObjectId(city)) {
                const cityDoc = await City.findById(city);
                if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city ID is invalid or does not exist.");
                cityId = cityDoc._id;
                // Validate if city belongs to the selected state/country (if provided)
                if (stateId && convertIdToString(cityDoc.state) !== convertIdToString(stateId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
                }
                if (countryId && convertIdToString(cityDoc.country) !== convertIdToString(countryId)) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
                }
            } else {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided city is not a valid ID or null/empty.");
            }
        }

        // --- Handle Category/SubCategory Updates by ID (Improved validation and default handling) ---
        let finalCategory = news.category;
        let categoryDocFound = null; // Used for subCategory validation
        if (category !== undefined) {
            if (category === null || category === '') {
                finalCategory = null;
                finalSubCategory = null; // Also clear subCategory if parent is cleared
                finalSubSubCategory = null; // Also clear subSubCategory if parent is cleared
            } else if (isValidObjectId(category)) {
                categoryDocFound = await Category.findById(category); // Find by ID
                if (!categoryDocFound) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category ID is invalid or does not exist.");
                finalCategory = categoryDocFound._id;
            } else {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category is not a valid ID or null/empty.");
            }
        } else {
            // If category was not provided in req.body, use existing category for subcategory validation if it's a valid ID
            if (news.category && isValidObjectId(news.category)) {
                categoryDocFound = await Category.findById(news.category);
            }
        }

        let finalSubCategory = news.subCategory;
        if (subCategory !== undefined) {
            if (subCategory === null || subCategory === '') {
                finalSubCategory = null; // Clear subCategory
                finalSubSubCategory = null; // Also clear subSubCategory if parent is cleared
            } else if (isValidObjectId(subCategory)) {
                if (!categoryDocFound) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category not found for subCategory validation. Please provide a valid category first or ensure existing news category is valid.");
                }
                const subCategoryDoc = await SubCategory.findOne({ _id: subCategory, category: categoryDocFound._id }); // Find by ID and parent category
                if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory ID is invalid or does not belong to the selected category.");
                finalSubCategory = subCategoryDoc._id;
            } else {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory is not a valid ID or null/empty.");
            }
        } else if (category !== undefined && (category === null || category === '')) {
            // If category was explicitly cleared, also clear subCategory if not explicitly provided
            finalSubCategory = null;
            finalSubSubCategory = null;
        }

        let finalSubSubCategory = news.subSubCategory; // Default to existing
        if (subSubCategory !== undefined) {
            finalSubSubCategory = subSubCategory === null || subSubCategory === '' ? null : subSubCategory;
        }


        // --- Status Update Logic (as provided, seems okay) ---
        let updatedStatus = news.status;
        if (status !== undefined) {
            if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
            }

            const currentUser = req.user;

            if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageNews)) {
                updatedStatus = status;
            }
            else if (currentUser.role === 'reporter') {
                if (status === 'live' && currentUser.canDirectGoLive) {
                    updatedStatus = status;
                } else if (['posted'].includes(status) && currentUser.canDirectPost) {
                    updatedStatus = status;
                } else if (['draft', 'pending_approval'].includes(status)) {
                    updatedStatus = status;
                } else {
                    throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
                }
            } else {
                throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update news status.");
            }
        }

        // Prepare fields to update
        const updateFields = {
            title_en: title_en !== undefined ? title_en : news.title_en,
            title_hi: title_hi !== undefined ? title_hi : news.title_hi,
            content_en: content_en !== undefined ? content_en : news.content_en,
            content_hi: content_hi !== undefined ? content_hi : news.content_hi,
            summary_en: summary_en !== undefined ? summary_en : news.summary_en,
            summary_hi: summary_hi !== undefined ? summary_hi : news.summary_hi,
            category: finalCategory,
            subCategory: finalSubCategory,
            subSubCategory: finalSubSubCategory, // Ensure this is updated
            tags: finalTags, // Use the parsed tags
            media: finalNewsMediaObjects, // Use the reconciled objects for internal files
            mediaUrls: finalNewsExternalMediaUrls, // Use the reconciled strings for external links
            referenceLinks: finalReferenceLinks, // Use the parsed reference links
            poll: finalPoll, // Use the parsed poll data
            country: countryId,
            state: stateId,
            city: cityId,
            localAddress: localAddress !== undefined ? localAddress : news.localAddress,
            status: updatedStatus,
            updatedBy: userId,
        };

        // If status changes to posted/live and was not already, update publishedAt
        if ((updateFields.status === 'posted' || updateFields.status === 'live') && !news.publishedAt && updateFields.status !== news.status) {
            updateFields.publishedAt = new Date();
        } else if (updateFields.status !== 'posted' && updateFields.status !== 'live' && news.publishedAt && updateFields.status !== news.status) {
            // If news goes out of posted/live status, clear publishedAt (optional, depends on logic)
            // updateFields.publishedAt = null; // Uncomment if this logic is desired
        }

        news = await News.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true
        });

        // Delete old files from cloud storage AFTER successful DB update
        for (const url of filesToDeleteFromCloud) {
            await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old media file:", err.message));
        }

        // Populate and Format Response (rest of the logic remains as you provided)
        const populatedNews = await News.findById(news._id)
            .populate([
                {
                    path: 'createdBy',
                    select: 'name email role profileImage country state city address dateOfBirth canDirectPost canDirectGoLive'
                },
                { path: 'updatedBy', select: 'name email' },
                { path: 'category', select: 'name' },
                { path: 'subCategory', select: 'name' },
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
            message: MESSAGES.NEWS_UPDATED,
            data: finalNewsData,
        });

    } catch (error) {
        console.error("Error updating news:", error);
        next(error);
    }
};

////////////////////////////////// complate woerk end ///////////////////////////////



export const deleteNews = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?._id;
        const userRole = req.user?.role;

        const news = await News.findById(id);

        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.NEWS_NOT_FOUND);
        }

        // ✅ Role-based rules
        if (userRole === "reporter") {
            // Reporter सिर्फ़ अपनी unpublished news delete कर सकता है
            if (news.createdBy.toString() !== userId.toString()) {
                throw new ApiError(
                    STATUS_CODES.FORBIDDEN,
                    "You are not authorized to delete this news."
                );
            }

            if (news.status === "posted" || news.status === "published") {
                throw new ApiError(
                    STATUS_CODES.FORBIDDEN,
                    "This news has already been published and cannot be deleted by reporter."
                );
            }
        }

        // ✅ Admin और Superadmin किसी की भी news delete कर सकते हैं (published भी)
        if (["admin", "superadmin"].includes(userRole)) {
            // कोई restriction नहीं
        }

        // ❌ बाकी roles delete नहीं कर सकते
        if (!["reporter", "admin", "superadmin"].includes(userRole)) {
            throw new ApiError(
                STATUS_CODES.FORBIDDEN,
                "You are not authorized to delete news."
            );
        }

        // Delete associated files from Spaces
        const filesToDelete = news.media.map(m => m.url);
        for (const url of filesToDelete) {
            await deleteFileFromSpaces(url).catch(err =>
                console.warn("Failed to delete media file during news deletion:", err.message)
            );
        }

        await news.deleteOne();

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: MESSAGES.NEWS_DELETED,
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

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.PUBLIC_NEWS_FETCHED_SUCCESS, // Using MESSAGES.PUBLIC_NEWS_FETCHED_SUCCESS
      data: newsList
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ // Using STATUS_CODES.INTERNAL_SERVER_ERROR
      success: false,
      message: MESSAGES.SERVER_ERROR_FETCHING_PUBLIC_NEWS // Using MESSAGES.SERVER_ERROR_FETCHING_PUBLIC_NEWS
    });
  }
};


// // New Controller Function: Get News by Authenticated Reporter
// export const getNewsByReporter = async (req, res, next) => {
//   try {
//     const userId = req.user?._id;

//     if (!userId) {
//       throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//     }

//     // Ensure the authenticated user is a 'reporter'
//     if (req.user.role !== 'reporter' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
//       throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Only reporters, admins, or superadmins can view their created news.");
//     }

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

//     // Filter by the authenticated user's ID
//     finalQueryFilter.createdBy = userId;

//     query = News.find(finalQueryFilter);

//     // Select Fields
//     if (req.query.select) {
//       const fields = req.query.select.split(",").join(" ");
//       query = query.select(fields);
//     }

//     // Sort
//     if (req.query.sort) {
//       const sortBy = req.query.sort.split(",").join(" ");
//       query = query.sort(sortBy);
//     } else {
//       query = query.sort("-createdAt"); // Default sort by most recent
//     }

//     // Pagination
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 10;
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const total = await News.countDocuments(finalQueryFilter); // Count with filters
//     const totalPages = Math.ceil(total / limit);

//     query = query.skip(startIndex).limit(limit);

//     // Populate related fields
//     query = query.populate([
//       {
//         path: 'createdBy',
//         select: 'name email role profileImage'
//       },
//       { path: 'updatedBy', select: 'name email' },
//       { path: 'category', select: 'name iso2' },
//       { path: 'subCategory', select: 'name iso2' },
//       { path: 'country', select: 'name iso2' },
//       { path: 'state', select: 'name iso2' },
//       { path: 'city', select: 'name' },
//       { path: 'comments.user', select: 'name profileImage' },
//       { path: 'likes.user', select: 'name profileImage' }
//     ]);

//     const news = await query;

//     // Pagination result
//     const pagination = {};
//     if (endIndex < total) {
//       pagination.next = {
//         page: page + 1,
//         limit
//       };
//     }
//     if (startIndex > 0) {
//       pagination.prev = {
//         page: page - 1,
//         limit
//       };
//     }

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       count: news.length,
//       pagination,
//       message: MESSAGES.NEWS_FETCHED_SUCCESS, // Using MESSAGES.NEWS_FETCHED_SUCCESS
//       data: news.map(item => {
//         const newsObj = item.toObject({ virtuals: true }); // Include virtuals (likesCount, commentsCount)
//         newsObj.shareLink = item.shareLink; // Include shareLink
//         // Format dates/times
//         newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split('T')[0] : null;
//         newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
//         newsObj.createdAtDate = item.createdAt.toISOString().split('T')[0];
//         newsObj.createdAtTime = item.createdAt.toISOString().split('T')[1].substring(0, 8);
//         newsObj.updatedAtDate = item.updatedAt.toISOString().split('T')[0];
//         newsObj.updatedAtTime = item.updatedAt.toISOString().split('T')[1].substring(0, 8);

//         const currentUserId = req.user?._id?.toString();
//         newsObj.isLikedByCurrentUser = false;

//         if (currentUserId && Array.isArray(newsObj.likes)) {
//             newsObj.isLikedByCurrentUser = newsObj.likes.some(like => {
//                 const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
//                 return likeUserId === currentUserId;
//             });
//         }

//         return newsObj;
//       }),
//       totalPages
//     });

//   } catch (error) {
//     console.error("Error getting news by reporter:", error);
//     next(error);
//   }
// };

// Assuming ApiError, STATUS_CODES, MESSAGES, News, User, etc. are imported or defined.
//////////////////////////////////////// HINDI ENGLISH ////////////////////////////////////////////////////
export const getNewsByReporter = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
    }

    // Ensure the authenticated user is a 'reporter'
    if (req.user.role !== 'reporter' && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
      throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Only reporters, admins, or superadmins can view their created news.");
    }

    let query;
    const reqQuery = { ...req.query };

    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    let finalQueryFilter = JSON.parse(queryStr);

    // Filter by the authenticated user's ID
    finalQueryFilter.createdBy = userId;

    query = News.find(finalQueryFilter);

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt"); // Default sort by most recent
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await News.countDocuments(finalQueryFilter); // Count with filters
    const totalPages = Math.ceil(total / limit);

    query = query.skip(startIndex).limit(limit);

    // Populate related fields
    query = query.populate([
      {
        path: 'createdBy',
        select: 'name email role profileImage'
      },
      { path: 'updatedBy', select: 'name email' },
      { path: 'category', select: 'name iso2' },
      { path: 'subCategory', select: 'name iso2' },
      { path: 'country', select: 'name iso2' },
      { path: 'state', select: 'name iso2' },
      { path: 'city', select: 'name' },
      { path: 'comments.user', select: 'name profileImage' },
      { path: 'likes.user', select: 'name profileImage' }
    ]);

    const news = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: news.length,
      pagination,
      message: MESSAGES.NEWS_FETCHED_SUCCESS,
      data: news.map(item => {
        const newsObj = item.toObject({ virtuals: true }); // Include virtuals (likesCount, commentsCount)
        newsObj.shareLink = item.shareLink; // Include shareLink
        // Format dates/times
        newsObj.postedDate = item.publishedAt ? item.publishedAt.toISOString().split('T')[0] : null;
        newsObj.postedTime = item.publishedAt ? item.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
        newsObj.createdAtDate = item.createdAt.toISOString().split('T')[0];
        newsObj.createdAtTime = item.createdAt.toISOString().split('T')[1].substring(0, 8);
        newsObj.updatedAtDate = item.updatedAt.toISOString().split('T')[0];
        newsObj.updatedAtTime = item.updatedAt.toISOString().split('T')[1].substring(0, 8);

        const currentUserId = req.user?._id?.toString();
        newsObj.isLikedByCurrentUser = false;

        if (currentUserId && Array.isArray(newsObj.likes)) {
            newsObj.isLikedByCurrentUser = newsObj.likes.some(like => {
                const likeUserId = like.user?._id ? like.user._id.toString() : like.user?.toString();
                return likeUserId === currentUserId;
            });
        }

        return newsObj;
      }),
      totalPages
    });

  } catch (error) {
    console.error("Error getting news by reporter:", error);
    next(error);
  }
};

// ✅ Get Comments of a Specific News

export const getCommentsForNews = async (req, res) => {
  try {
    const { id } = req.params; // newsId

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "News ID is required in params",
      });
    }

    // ✅ populate user inside comments
    const news = await News.findById(id).populate("comments.user", "name profileImage");

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

     res.status(STATUS_CODES.SUCCESS).json({
      status: STATUS_CODES.SUCCESS,
      success: true,
      comments: news.comments, // har comment ke sath user ka name & profileImage bhi aayega
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


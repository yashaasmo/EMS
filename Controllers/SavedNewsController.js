// Controllers/savedNews.controller.js
import SavedNews from '../Models/SavedNews.js';
import News from '../Models/news.model.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import { ApiError } from '../Utils/apiError.js';

// ✅ Save or Unsave News (Toggle functionality)
export const toggleSaveNews = async (req, res, next) => {
    try {
        const { newsId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }

        // Check if news exists
        const news = await News.findById(newsId);
        if (!news) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, "News not found");
        }

        // Find user's saved news document
        let userSavedNews = await SavedNews.findOne({ user: userId });

        if (!userSavedNews) {
            // Create new document if doesn't exist
            userSavedNews = await SavedNews.create({
                user: userId,
                news: [newsId]
            });

            res.status(STATUS_CODES.CREATED).json({
                success: true,
                message: "News saved successfully",
                isSaved: true
            });
        } else {
            // Check if news is already saved
            const newsIndex = userSavedNews.news.findIndex(id => id.toString() === newsId.toString());

            if (newsIndex > -1) {
                // Remove news (unsave)
                userSavedNews.news.splice(newsIndex, 1);
                await userSavedNews.save();

                res.status(STATUS_CODES.SUCCESS).json({
                    success: true,
                    message: "News unsaved successfully",
                    isSaved: false
                });
            } else {
                // Add news (save)
                userSavedNews.news.push(newsId);
                await userSavedNews.save();

                res.status(STATUS_CODES.CREATED).json({
                    success: true,
                    message: "News saved successfully",
                    isSaved: true
                });
            }
        }
    } catch (error) {
        console.error("Error toggling save news:", error);
        next(error);
    }
};

// ✅ Get All Saved News for Current User
export const getSavedNews = async (req, res, next) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Find user's saved news document
        const userSavedNews = await SavedNews.findOne({ user: userId })
            .populate({
                path: 'news',
                populate: [
                    { path: 'createdBy', select: 'name email role profileImage' },
                    { path: 'category', select: 'name iso2' },
                    { path: 'subCategory', select: 'name iso2' },
                    { path: 'country', select: 'name iso2' },
                    { path: 'state', select: 'name iso2' },
                    { path: 'city', select: 'name' },
                    { path: 'comments.user', select: 'name profileImage' },
                    { path: 'likes.user', select: 'name profileImage' }
                ],
                options: {
                    sort: { createdAt: -1 } // Most recent news first
                }
            });

        if (!userSavedNews || !userSavedNews.news.length) {
            return res.status(STATUS_CODES.SUCCESS).json({
                success: true,
                count: 0,
                totalPages: 0,
                currentPage: page,
                totalSavedNews: 0,
                message: "No saved news found",
                data: []
            });
        }

        // Filter out null news (in case some news were deleted)
        const validSavedNews = userSavedNews.news.filter(newsItem => newsItem !== null);

        // Apply pagination manually since we're dealing with an array
        const totalSavedNews = validSavedNews.length;
        const totalPages = Math.ceil(totalSavedNews / limit);
        const paginatedNews = validSavedNews.slice(skip, skip + limit);

        // Format response
        const formattedSavedNews = paginatedNews.map(newsItem => {
            const newsObj = newsItem.toObject({ virtuals: true });
            
            // Add formatted dates
            newsObj.postedDate = newsItem.publishedAt ? 
                newsItem.publishedAt.toISOString().split('T')[0] : null;
            newsObj.postedTime = newsItem.publishedAt ? 
                newsItem.publishedAt.toISOString().split('T')[1].substring(0, 8) : null;
            newsObj.createdAtDate = newsItem.createdAt.toISOString().split('T')[0];
            newsObj.createdAtTime = newsItem.createdAt.toISOString().split('T')[1].substring(0, 8);

            // Check if current user liked this news
            newsObj.isLikedByCurrentUser = false;
            if (Array.isArray(newsObj.likes)) {
                newsObj.isLikedByCurrentUser = newsObj.likes.some(like => {
                    const likeUserId = like.user?._id ? 
                        like.user._id.toString() : like.user?.toString();
                    return likeUserId === userId.toString();
                });
            }

            // Always true for saved news list
            newsObj.isSaved = true;

            return newsObj;
        });

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: formattedSavedNews.length,
            totalPages,
            currentPage: page,
            totalSavedNews,
            message: "Saved news fetched successfully",
            data: formattedSavedNews
        });

    } catch (error) {
        console.error("Error getting saved news:", error);
        next(error);
    }
};

// ✅ Check if specific news is saved by user
// export const checkIfNewsSaved = async (req, res, next) => {
//     try {
//         const { newsId } = req.params;
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }

//         const userSavedNews = await SavedNews.findOne({ user: userId });
        
//         let isSaved = false;
//         if (userSavedNews && userSavedNews.news.length > 0) {
//             isSaved = userSavedNews.news.some(id => id.toString() === newsId.toString());
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             isSaved
//         });

//     } catch (error) {
//         console.error("Error checking if news is saved:", error);
//         next(error);
//     }
// };?

// ✅ Remove specific saved news
export const removeSavedNews = async (req, res, next) => {
    try {
        const { newsId } = req.params;
        const userId = req.user?._id;

        if (!userId) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
        }

        const userSavedNews = await SavedNews.findOne({ user: userId });

        if (!userSavedNews) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, "No saved news found for user");
        }

        const newsIndex = userSavedNews.news.findIndex(id => id.toString() === newsId.toString());

        if (newsIndex === -1) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, "News not found in saved list");
        }

        userSavedNews.news.splice(newsIndex, 1);
        await userSavedNews.save();

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "News removed from saved list successfully"
        });

    } catch (error) {
        console.error("Error removing saved news:", error);
        next(error);
    }
};

// // ✅ Get saved news count for user
// export const getSavedNewsCount = async (req, res, next) => {
//     try {
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }

//         const userSavedNews = await SavedNews.findOne({ user: userId });
//         const count = userSavedNews ? userSavedNews.news.length : 0;

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             savedNewsCount: count
//         });

//     } catch (error) {
//         console.error("Error getting saved news count:", error);
//         next(error);
//     }
// };

// // ✅ Clear all saved news for user
// export const clearAllSavedNews = async (req, res, next) => {
//     try {
//         const userId = req.user?._id;

//         if (!userId) {
//             throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing.");
//         }

//         const userSavedNews = await SavedNews.findOne({ user: userId });

//         if (!userSavedNews) {
//             return res.status(STATUS_CODES.SUCCESS).json({
//                 success: true,
//                 message: "No saved news found to clear"
//             });
//         }

//         userSavedNews.news = [];
//         await userSavedNews.save();

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: "All saved news cleared successfully"
//         });

//     } catch (error) {
//         console.error("Error clearing saved news:", error);
//         next(error);
//     }
// };

// Helper function to check if news is saved by user (for use in other controllers)
export const checkIfNewsSavedByUser = async (newsId, userId) => {
    if (!userId) return false;
    
    try {
        const userSavedNews = await SavedNews.findOne({ user: userId });
        if (!userSavedNews || !userSavedNews.news.length) return false;
        
        return userSavedNews.news.some(id => id.toString() === newsId.toString());
    } catch (error) {
        console.error("Error checking if news is saved:", error);
        return false;
    }
};


// controllers/newsController.js
import CategoryNews from "../Models/CategoryNews.js";
import News from '../Models/news.model.js';

// // ✅ Admin sets which category is selected
// export const setCategoryNews = async (req, res, next) => {
//   try {
//     const { categoryId } = req.body;

//     let selected = await CategoryNews.findOne();
//     if (selected) {
//       selected.category = categoryId;
//       await selected.save();
//     } else {
//       selected = await CategoryNews.create({ category: categoryId });
//     }

//     res.json({
//       success: true,
//       message: "Category selected successfully",
//       data: selected,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// controllers/newsController.js
export const setCategoryNews = async (req, res, next) => {
  try {
    const { categoryIds } = req.body; // array expect karenge

    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ success: false, message: "At least one category is required" });
    }

    let selected = await CategoryNews.findOne();
    if (selected) {
      selected.categories = categoryIds;
      await selected.save();
    } else {
      selected = await CategoryNews.create({ categories: categoryIds });
    }

    res.json({
      success: true,
      message: "Categories selected successfully",
      data: selected,
    });
  } catch (error) {
    next(error);
  }
};



// export const getCategoryNews = async (req, res, next) => {
//   try {
//     const selected = await CategoryNews.findOne().populate("category", "name");

//     if (!selected) {
//       return res.status(404).json({
//         success: false,
//         message: "No category selected by admin",
//       });
//     }

//     let filter = { category: selected.category._id };

//     // अगर admin/superadmin नहीं है तो सिर्फ posted/live news दिखे
//     if (
//       !req.user ||
//       (req.user.role !== "admin" && req.user.role !== "superadmin")
//     ) {
//       filter.status = { $in: ["posted", "live"] };
//     }

//     const news = await News.find(filter)
//       .sort("-createdAt")
//       .populate("category", "_id name")
//       .populate("subCategory", "_id name")
//       .populate("subSubCategory", "_id name") // ✅ subSub भी
//       .populate("createdBy", "_id name email role profileImage")
//       .populate("updatedBy", "_id name email")
//       .populate("country", "_id name iso2")
//       .populate("state", "_id name")
//       .populate("city", "_id name");

//     res.status(200).json({
//       success: true,
//       count: news.length,
//       category: selected.category,
//       data: news.map(n => ({
//         ...n.toObject(),
//         likesCount: n.likes ? n.likes.length : 0,
//         commentsCount: n.comments ? n.comments.length : 0,
//         postedDate: n.createdAt?.toISOString().split("T")[0],
//         postedTime: n.createdAt?.toISOString().split("T")[1]?.split(".")[0],
//         createdAtDate: n.createdAt?.toISOString().split("T")[0],
//         createdAtTime: n.createdAt?.toISOString().split("T")[1]?.split(".")[0],
//         updatedAtDate: n.updatedAt?.toISOString().split("T")[0],
//         updatedAtTime: n.updatedAt?.toISOString().split("T")[1]?.split(".")[0],
//         isLikedByCurrentUser: req.user
//           ? n.likes?.includes(req.user._id)
//           : false,
//       })),
//     });
//   } catch (error) {
//     console.error("Error in getCategoryNews:", error);
//     next(error);
//   }
// };

export const getCategoryNews = async (req, res, next) => {
  try {
    const selected = await CategoryNews.findOne().populate("categories", "name");

    if (!selected || !selected.categories.length) {
      return res.status(404).json({
        success: false,
        message: "No categories selected by admin",
      });
    }

    let filter = { category: { $in: selected.categories.map(c => c._id) } };

    // agar admin/superadmin nahi hai
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "superadmin")) {
      filter.status = { $in: ["posted", "live"] };
    }

    const news = await News.find(filter)
      .sort("-createdAt")
      .populate("category", "_id name")
      .populate("subCategory", "_id name")
      .populate("subSubCategory", "_id name")
      .populate("createdBy", "_id name email role profileImage")
      .populate("updatedBy", "_id name email")
      .populate("country", "_id name iso2")
      .populate("state", "_id name")
      .populate("city", "_id name");

    res.status(200).json({
      success: true,
      count: news.length,
      categories: selected.categories,
      data: news.map((n) => ({
        ...n.toObject(),
        likesCount: n.likes?.length || 0,
        commentsCount: n.comments?.length || 0,
        postedDate: n.createdAt?.toISOString().split("T")[0],
        postedTime: n.createdAt?.toISOString().split("T")[1]?.split(".")[0],
        updatedAtDate: n.updatedAt?.toISOString().split("T")[0],
        updatedAtTime: n.updatedAt?.toISOString().split("T")[1]?.split(".")[0],
        isLikedByCurrentUser: req.user ? n.likes?.includes(req.user._id) : false,
      })),
    });
  } catch (error) {
    console.error("Error in getCategoryNews:", error);
    next(error);
  }
};

export const getSelectedCategories = async (req, res, next) => {
  try {
    const selected = await CategoryNews.findOne()
      .populate("categories", "_id name") // only id & name
      .lean();

    if (!selected || !selected.categories?.length) {
      return res.status(200).json({ success: true, categories: [] });
    }

    // return minimal structure
    const categories = selected.categories.map(c => ({ _id: c._id, name: c.name }));
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};
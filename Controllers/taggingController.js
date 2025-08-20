import { Category, SubCategory } from '../Models/lookupData.model.js';
import { ApiError } from '../Utils/apiError.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, slug } = req.body;

    if (!name) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Category name is required.");
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      throw new ApiError(STATUS_CODES.CONFLICT, MESSAGES.CONFLICT + ": Category with this name already exists.");
    }

    const newCategory = new Category({
      name,
      slug,
      description,
    });

    const category = await newCategory.save();
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.CATEGORY_CREATED,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.CATEGORY_NOT_FOUND);
    }
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, slug } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (slug) updateData.slug = slug;

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": No fields to update provided.");
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.CATEGORY_NOT_FOUND);
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.CATEGORY_UPDATED,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.CATEGORY_NOT_FOUND);
    }
    await SubCategory.deleteMany({ category: req.params.id });

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.CATEGORY_DELETED,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// --- SubCategory CRUD ---
export const createSubCategory = async (req, res, next) => {
  try {
    const { name, category: categoryId, description, slug } = req.body;

    if (!name || !categoryId) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": SubCategory name and category ID are required.");
    }

    const parentCategory = await Category.findById(categoryId);
    if (!parentCategory) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.CATEGORY_NOT_FOUND + ": Parent category not found.");
    }

    const subCategoryExists = await SubCategory.findOne({ name, category: categoryId });
    if (subCategoryExists) {
      throw new ApiError(STATUS_CODES.CONFLICT, MESSAGES.CONFLICT + ": SubCategory with this name already exists in this category.");
    }

    const newSubCategory = new SubCategory({
      name,
      category: parentCategory._id,
      slug,
      description,
    });

    const subCategory = await newSubCategory.save();
    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.SUBCATEGORY_CREATED,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSubCategories = async (req, res, next) => {
  try {
    const { category: categoryId } = req.query;

    let filter = {};
    if (categoryId) {
      if (!categoryId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid category ID format.");
      }
      filter.category = categoryId;
    }

    const subCategories = await SubCategory.find(filter)
      .populate('category', 'name slug')
      .sort({ name: 1 });

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      count: subCategories.length,
      data: subCategories,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubCategoryById = async (req, res, next) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id).populate('category', 'name slug');
    if (!subCategory) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SUBCATEGORY_NOT_FOUND);
    }
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubCategory = async (req, res, next) => {
  try {
    const { name, category: categoryId, description, slug } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (slug) updateData.slug = slug;
    if (categoryId) {
      const parentCategory = await Category.findById(categoryId);
      if (!parentCategory) {
        throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.CATEGORY_NOT_FOUND + ": New parent category not found.");
      }
      updateData.category = categoryId;
    }

    if (Object.keys(updateData).length === 0) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": No fields to update provided.");
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!subCategory) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SUBCATEGORY_NOT_FOUND);
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.SUBCATEGORY_UPDATED,
      data: subCategory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubCategory = async (req, res, next) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.SUBCATEGORY_NOT_FOUND);
    }
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: MESSAGES.SUBCATEGORY_DELETED,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};


// import Poll from '../Models/Poll.js';
// // =============== POLL SECTION ===============
// const generateRandomId = () => {
//   return Math.random().toString(36).substr(2, 9); // example: "5gk39s8u1"
// };


// export const createPoll = async (req, res) => {
//   try {
//     const { question, options, category, start_date, end_date, visibility, enable_comments } = req.body;
//     const poll_id = generateRandomId();

//     const poll = await Poll.create({
//       poll_id,
//       question: JSON.parse(question),
//       options: JSON.parse(options),
//       category,
//       start_date: new Date(start_date),
//       end_date: new Date(end_date),
//       visibility,
//       enable_comments,
//       created_by: req.admin._id
//     });
//     res.json({ success: true, poll });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const votePoll = async (req, res) => {
//   try {
//     const { poll_id } = req.params;
//     const { option_index } = req.body;
//     const poll = await Poll.findOne({ poll_id });
//     if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

//     // Prevent multiple voting (can be by user_id or IP - here by user_id)
//     if (poll.votes.some(v => String(v.user_id) === String(req.user._id)))
//       return res.status(400).json({ success: false, message: 'Already voted' });

//     poll.options[option_index].votes += 1;
//     poll.votes.push({ user_id: req.user._id, option_index, ip: req.ip });

//     await poll.save();
//     res.json({ success: true, poll });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getActivePoll = async (req, res) => {
//   try {
//     const now = new Date();
//     const poll = await Poll.findOne({ status: 'active', start_date: { $lte: now }, end_date: { $gte: now } });
//     if (!poll) return res.json({ success: true, poll: null });
//     res.json({ success: true, poll });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// export const getPollResult = async (req, res) => {
//   try {
//     const poll = await Poll.findOne({ poll_id: req.params.poll_id });
//     if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });
//     res.json({ success: true, options: poll.options, votes: poll.votes.length });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

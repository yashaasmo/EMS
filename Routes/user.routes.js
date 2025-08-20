



// export default router;

import express from 'express';
import { authenticate, isUser } from '../Middlewares/auth.js'; // Use authenticate for general user actions
import { loginUser, registerUser } from '../Controllers/authController.js';
import upload from '../Middlewares/multer.middleware.js';
import { getAllCountries, getCitiesByState, getStatesByCountry } from '../Controllers/locationDataController.js';
import { getAllCategories, getAllSubCategories, getCategoryById, getSubCategoryById } from '../Controllers/taggingController.js';
import { getAllNews, getNewsById, addLikeToNews, addCommentToNews } from '../Controllers/newsController.js';
import { getAllShorts, getShortById, addLikeToShort, addCommentToShort, replyToComment, getCommentsByShortId } from '../Controllers/shortsController.js';
import { getAllHeadlines } from '../Controllers/headlineController.js';
import {

  getAllPolls,
  getPollById,
  voteOnPoll,
  getPollResults,
} from '../Controllers/polls.controller.js';
const router = express.Router();

// Public routes for authentication
router.post('/register', upload.single('profileImageFile'), registerUser);
router.post('/login', loginUser);
router.get('/news', getAllNews);
router.get('/headline', getAllHeadlines);


// Public Routes for Location Data
router.get('/countries', getAllCountries);
router.get('/countries/:countryId/states', getStatesByCountry);
router.get('/states/:stateId/cities', getCitiesByState);

// Public Routes for Categories/Subcategories
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.get('/subcategories', getAllSubCategories);
router.get('/subcategories/:id', getSubCategoryById);


// router.get('/news', getAllNews);
router.get('/news/:id', getNewsById);


// router.get('/shorts', getAllShorts);
router.get('/shorts/:id', getShortById);

// Authenticated User Interactions (Likes, Comments, Replies) - Any authenticated user can do these
router.use(authenticate,isUser); // Ensures user is logged in (could be user, reporter, admin, superadmin)



router.post('/news/:newsId/like', addLikeToNews);
router.post('/news/:newsId/comment', addCommentToNews);

router.post('/shorts/:shortId/like', addLikeToShort);

router.post('/shorts/:shortId/comment', addCommentToShort);
router.get('/shorts/:shortId/comment', getCommentsByShortId); // <-- Add this
router.post('/shorts/:shortId/comments/:commentId/reply', replyToComment);

// Potentially add user profile management routes here later if needed for 'user' role.
router.get('/news', getAllNews);
router.get('/shorts', getAllShorts);
// Public Routes
router.get('/polls', getAllPolls); // Get all active polls
router.get('/polls/:id', getPollById); // Get a specific poll
router.post('/polls/:id/vote',  voteOnPoll); // Vote on a poll
router.get('/polls/:id/results', getPollResults); 

export default router;
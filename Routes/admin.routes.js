

// // import express from 'express';
// // import { authenticate, hasRole, canManageNews, canManageShorts, canManageAds, canManageHeadlines, canManageCategories, canManageSubCategories, canManageUsers, isAdmin } from '../middlewares/auth.js';
// // import upload from '../middlewares/multer.middleware.js';

// // // Import controllers based on required permissions
// // import { createHeadline, deleteHeadline, getAllHeadlines, getHeadlineById, updateHeadline } from '../controllers/headlineController.js';
// // import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } from '../controllers/taggingController.js';
// // import { getAllCountries, getStatesByCountry, getCitiesByState } from '../controllers/locationDataController.js';
// // import { getAllReporters } from '../Controllers/userManagementController.js'; // Import getAllReporters for admins if they have permission

// // // News Management
// // import { getAllNews, getNewsById, updateNews, deleteNews } from '../Controllers/newsController.js';

// // // Ads Management
// // import { createAd, getAllAds, updateAd, deleteAd } from '../Controllers/ad.controller.js';

// // // Shorts Management
// // import { createShort, getAllShorts, getShortById, updateShort, deleteShort } from '../controllers/shortsController.js';

// // const router = express.Router();

// // // Public Routes for Location Data (can remain public as they are lookup data)
// // router.get('/countries', getAllCountries);
// // router.get('/countries/:countryId/states', getStatesByCountry);
// // router.get('/states/:stateId/cities', getCitiesByState);

// // // Public Routes for Categories/Subcategories (read-only for non-admin users, but accessible if they hit this endpoint)
// // router.get('/categories', getAllCategories);
// // router.get('/categories/:id', getCategoryById);
// // router.get('/subcategories', getAllSubCategories);
// // router.get('/subcategories/:id', getSubCategoryById);


// // // --- All routes below require 'admin' or 'superadmin' role and specific granular permissions ---
// // // router.use(authenticate, hasRole(['admin', 'superadmin'])); // Base authentication and role check

// // router.use(authenticate, isAdmin);

// // router.get('/reporters', canManageUsers, getAllReporters); // Admins can view reporters if they have 'manageUsers'


// // // Category Management (Admin with 'manageCategories' permission)
// // router.post('/categories', canManageCategories, createCategory);
// // router.put('/categories/:id', canManageCategories, updateCategory);
// // router.delete('/categories/:id', canManageCategories, deleteCategory);

// // // SubCategory Management (Admin with 'manageSubCategories' permission)
// // router.post('/subcategories', canManageSubCategories, createSubCategory);
// // router.put('/subcategories/:id', canManageSubCategories, updateSubCategory);
// // router.delete('/subcategories/:id', canManageSubCategories, deleteSubCategory);

// // // Headline Management (Admin with 'manageHeadlines' permission)
// // router.post('/headlines', canManageHeadlines, createHeadline); // Renamed from '/headline' for consistency
// // router.get('/headlines', canManageHeadlines, getAllHeadlines);
// // router.get('/headlines/:id', canManageHeadlines, getHeadlineById);
// // router.put('/headlines/:id', canManageHeadlines, updateHeadline);
// // router.delete('/headlines/:id', canManageHeadlines, deleteHeadline);


// // // News Management (Admin with 'manageNews' permission)
// // router.get('/news', canManageNews, getAllNews); // Admin will fetch all news including pending for approval
// // router.get('/news/:id', canManageNews, getNewsById);
// // router.put('/news/:id', canManageNews, upload.array('mediaFiles', 10), updateNews); // Update news status, content etc.
// // router.delete('/news/:id', canManageNews, deleteNews);


// // // Ads Management (Admin with 'manageAds' permission)
// // router.post('/ads', canManageAds, upload.single('media'), createAd);
// // router.get('/ads', canManageAds, getAllAds);
// // router.put('/ads/:id', canManageAds, upload.single('media'), updateAd);
// // router.delete('/ads/:id', canManageAds, deleteAd);


// // // Shorts Management (Admin with 'manageShorts' permission)
// // router.post('/shorts', canManageShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
// // router.get('/shorts', canManageShorts, getAllShorts); // Admin will see all shorts (all statuses)
// // router.get('/shorts/:id', canManageShorts, getShortById);
// // router.put('/shorts/:id', canManageShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
// // router.delete('/shorts/:id', canManageShorts, deleteShort);

// // export default router;

// // routes/admin.routes.js


// import express from 'express';
// import { 
//     authenticate, 
//     isAdmin, 
//     // NEW granular permission imports based on your updated auth.js
//     canCreateNews, canUpdateNews, canDeleteNews, canApproveNews,
//     canCreateShorts, canUpdateShorts, canDeleteShorts, canApproveShorts,
//     canCreateAds, canUpdateAds, canDeleteAds, canApproveAds,
//     canCreateHeadlines, canUpdateHeadlines, canDeleteHeadlines, canApproveHeadlines,
//     canCreateCategories, canUpdateCategories, canDeleteCategories,
//     canCreateSubCategories, canUpdateSubCategories, canDeleteSubCategories,
//     canCreateUsers, canUpdateUsers, canDeleteUsers, // For general user management
//     canCreateReporters, canUpdateReporters, canDeleteReporters // For reporter account management
// } from '../middlewares/auth.js';
// import upload from '../middlewares/multer.middleware.js';

// // Import controllers based on required permissions
// import { createHeadline, deleteHeadline, getAllHeadlines, getHeadlineById, updateHeadline } from '../controllers/headlineController.js';
// import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } from '../controllers/taggingController.js';
// import { getAllCountries, getStatesByCountry, getCitiesByState } from '../controllers/locationDataController.js';
// import { getAllReporters } from '../Controllers/userManagementController.js'; 

// // News Management
// import { getAllNews, getNewsById, updateNews, deleteNews } from '../Controllers/newsController.js';

// // Ads Management
// import { createAd, getAllAds, updateAd, deleteAd } from '../Controllers/ad.controller.js';

// // Shorts Management
// import { createShort, getAllShorts, getShortById, updateShort, deleteShort } from '../controllers/shortsController.js';

// const router = express.Router();

// // Public Routes for Location Data (can remain public as they are lookup data)
// router.get('/countries', getAllCountries);
// router.get('/countries/:countryId/states', getStatesByCountry);
// router.get('/states/:stateId/cities', getCitiesByState);

// // Public Routes for Categories/Subcategories (read-only for non-admin users, but accessible if they hit this endpoint)
// // Note: If you want to restrict even read access for certain roles, move these below the authenticate middleware
// router.get('/categories', getAllCategories);
// router.get('/categories/:id', getCategoryById);
// router.get('/subcategories', getAllSubCategories);
// router.get('/subcategories/:id', getSubCategoryById);


// // --- All routes below require 'admin' or 'superadmin' role and specific granular permissions ---
// router.use(authenticate, isAdmin); // Base authentication and role check for all routes below

// // Reporter Viewing (Admin with 'updateReporters' permission, as it implies ability to view for management)
// router.get('/reporters', canUpdateReporters, getAllReporters); // Admins can view reporters if they have 'manageReporters.update' permission


// // Category Management (Admin with specific 'manageCategories' permissions)
// router.post('/categories', canCreateCategories, createCategory);
// router.put('/categories/:id', canUpdateCategories, updateCategory);
// router.delete('/categories/:id', canDeleteCategories, deleteCategory);

// // SubCategory Management (Admin with specific 'manageSubCategories' permissions)
// router.post('/subcategories', canCreateSubCategories, createSubCategory);
// router.put('/subcategories/:id', canUpdateSubCategories, updateSubCategory);
// router.delete('/subcategories/:id', canDeleteSubCategories, deleteSubCategory);

// // Headline Management (Admin with specific 'manageHeadlines' permissions)
// router.post('/headlines', canCreateHeadlines, createHeadline);
// router.get('/headlines', canUpdateHeadlines, getAllHeadlines); // Using canUpdateHeadlines as a proxy for view access
// router.get('/headlines/:id', canUpdateHeadlines, getHeadlineById); // Using canUpdateHeadlines as a proxy for view access
// router.put('/headlines/:id', canUpdateHeadlines, updateHeadline);
// router.delete('/headlines/:id', canDeleteHeadlines, deleteHeadline);


// // News Management (Admin with specific 'manageNews' permissions)
// router.get('/news', canUpdateNews, getAllNews); // Admin will fetch all news including pending for approval
// router.get('/news/:id', canUpdateNews, getNewsById);
// router.put('/news/:id', canUpdateNews, upload.array('mediaFiles', 10), updateNews); // Update news status, content etc.
// router.delete('/news/:id', canDeleteNews, deleteNews);
// // If you have an approval endpoint for news, it would be:
// // router.put('/news/:id/approve', canApproveNews, approveNewsControllerFunction); 


// // Ads Management (Admin with specific 'manageAds' permissions)
// router.post('/ads', canCreateAds, upload.single('media'), createAd);
// router.get('/ads', canUpdateAds, getAllAds); // Using canUpdateAds as a proxy for view access
// router.put('/ads/:id', canUpdateAds, upload.single('media'), updateAd);
// router.delete('/ads/:id', canDeleteAds, deleteAd);


// // Shorts Management (Admin with specific 'manageShorts' permissions)
// router.post('/shorts', canCreateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
// router.get('/shorts', canUpdateShorts, getAllShorts); // Admin will see all shorts (all statuses)
// router.get('/shorts/:id', canUpdateShorts, getShortById);
// router.put('/shorts/:id', canUpdateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
// router.delete('/shorts/:id', canDeleteShorts, deleteShort);
// // If you have an approval endpoint for shorts, it would be:
// // router.put('/shorts/:id/approve', canApproveShorts, approveShortsControllerFunction); 


// export default router;




// import express from 'express';
// import { 
//     authenticate, 
//     isAdmin, 
//     // Permission middlewares
//     canCreateNews, canUpdateNews, canDeleteNews, canApproveNews,
//     canCreateShorts, canUpdateShorts, canDeleteShorts, canApproveShorts,
//     canCreateAds, canUpdateAds, canDeleteAds, canApproveAds,
//     canCreateHeadlines, canUpdateHeadlines, canDeleteHeadlines, canApproveHeadlines,
//     canCreateCategories, canUpdateCategories, canDeleteCategories,
//     canCreateSubCategories, canUpdateSubCategories, canDeleteSubCategories,
//     canCreateUsers, canUpdateUsers, canDeleteUsers,
//     canCreateReporters, canUpdateReporters, canDeleteReporters,
//     canCreatePoll,
//     canUpdatePoll,
//     canDeletePoll
// } from '../middlewares/auth.js';

// import upload from '../middlewares/multer.middleware.js';

// // Controllers
// import { createHeadline, deleteHeadline, getAllHeadlines, getHeadlineById, updateHeadline } from '../controllers/headlineController.js';
// import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } from '../controllers/taggingController.js';
// import { getAllCountries, getStatesByCountry, getCitiesByState } from '../controllers/locationDataController.js';
// import { deleteReporterById, getAllReporters, updateReporterById } from '../Controllers/userManagementController.js'; 
// import { getAllNews, getNewsById, updateNews, deleteNews } from '../Controllers/newsController.js';
// import { createAd, getAllAds, updateAd, deleteAd } from '../Controllers/ad.controller.js';
// import { createShort, getAllShorts, getShortById, updateShort, deleteShort } from '../controllers/shortsController.js';
// import { loginUser, registerUser } from '../controllers/authController.js';
// import {
//   createPoll,
 
//   getAllPolls,
//   getPollResults,
//   deactivatePoll,
//   updatePoll,
// } from '../Controllers/polls.controller.js';
// const router = express.Router();


// // ─────────────────────────────────────────
// // ✅ PUBLIC ROUTES — Accessible without login
// // ─────────────────────────────────────────

// // Location Data
// router.get('/countries', getAllCountries);
// router.get('/countries/:countryId/states', getStatesByCountry);
// router.get('/states/:stateId/cities', getCitiesByState);

// // Categories & Subcategories (read-only)
// router.get('/categories', getAllCategories);
// router.get('/categories/:id', getCategoryById);
// router.get('/subcategories', getAllSubCategories);
// router.get('/subcategories/:id', getSubCategoryById);

// // ⭐ Public access to News, Headlines, Ads, Shorts
// router.get('/public/news', getAllNews);             // e.g., /api/public/news
// router.get('/public/news/:id', getNewsById);

// router.get('/public/headlines', getAllHeadlines);
// router.get('/public/headlines/:id', getHeadlineById);

// router.get('/public/ads', getAllAds);

// router.get('/public/shorts', getAllShorts);
// router.get('/public/shorts/:id', getShortById);

// router.post('/login', loginUser);

// // ─────────────────────────────────────────
// // 🔐 ADMIN + PERMISSION ROUTES (Protected)
// // ─────────────────────────────────────────
// router.use(authenticate, isAdmin); // Everything below requires admin + permission

// // Reporter Management
// router.get('/reporters', canUpdateReporters, getAllReporters);
// router.put("/reporters/:id", canUpdateReporters, updateReporterById);
// router.delete('/reporters/:id',canDeleteReporters, deleteReporterById);
// router.post('/register',canCreateReporters, upload.single('profileImageFile'), registerUser);
// // Category Management
// router.post('/categories', canCreateCategories, createCategory);
// router.put('/categories/:id', canUpdateCategories, updateCategory);
// router.delete('/categories/:id', canDeleteCategories, deleteCategory);

// // SubCategory Management
// router.post('/subcategories', canCreateSubCategories, createSubCategory);
// router.put('/subcategories/:id', canUpdateSubCategories, updateSubCategory);
// router.delete('/subcategories/:id', canDeleteSubCategories, deleteSubCategory);

// // Headline Management
// router.post('/headline', canCreateHeadlines, createHeadline);
// router.get('/headline', canUpdateHeadlines, getAllHeadlines);
// router.get('/headline/:id', canUpdateHeadlines, getHeadlineById);
// router.put('/headline/:id', canUpdateHeadlines, updateHeadline);
// router.delete('/headline/:id', canDeleteHeadlines, deleteHeadline);

// // News Management
// router.get('/news', canUpdateNews, getAllNews);
// router.get('/news/:id', canUpdateNews, getNewsById);
// router.put('/news/:id', canUpdateNews, upload.array('mediaFiles', 10), updateNews);
// router.delete('/news/:id', canDeleteNews, deleteNews);

// // Ads Management
// router.post('/ads', canCreateAds, upload.single('media'), createAd);
// router.get('/ads', canUpdateAds, getAllAds);
// router.put('/ads/:id', canUpdateAds, upload.single('media'), updateAd);
// router.delete('/ads/:id', canDeleteAds, deleteAd);

// // Shorts Management
// router.post('/shorts', canCreateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
// router.get('/shorts', canUpdateShorts, getAllShorts);
// router.get('/shorts/:id', canUpdateShorts, getShortById);
// router.put('/shorts/:id', canUpdateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
// router.delete('/shorts/:id', canDeleteShorts, deleteShort);




// // Protected Routes

// // poll mangemnetn 
// router.get('/polls', getAllPolls);
// router.get('/:pollId', getPollResults);
// router.post('/polls', canCreatePoll, createPoll);
// router.put('/polls/:id', canUpdatePoll, updatePoll);
// router.put('/deactivate/:pollId',canDeletePoll,  deactivatePoll);
// // router.post('/polls',  createPoll);
// // router.put('/polls/:id',  updatePoll);
// // router.put('/polls/deactivate/:pollId',  deactivatePoll);


// export default router;


// update by dpp ////////////////////////////////////





import express from 'express';
import { 
    authenticate, 
    isAdmin, 
    // Permission middlewares
    canUpdateNews, canDeleteNews, 
    canCreateShorts, canUpdateShorts, canDeleteShorts,
    canCreateAds, canUpdateAds, canDeleteAds, 
    canCreateHeadlines, canUpdateHeadlines, canDeleteHeadlines, 
    canCreateCategories, canUpdateCategories, canDeleteCategories,
    canCreateSubCategories, canUpdateSubCategories, canDeleteSubCategories,
    canCreateReporters, canUpdateReporters, canDeleteReporters,
    canCreatePoll,
    canUpdatePoll,
    canDeletePoll
} from '../Middlewares/auth.js';

import upload from '../Middlewares/multer.middleware.js';

// Controllers
import { createHeadline, deleteHeadline, getAllHeadlines, getHeadlineById, updateHeadline } from '../Controllers/headlineController.js';
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory, createSubCategory, getAllSubCategories, getSubCategoryById, updateSubCategory, deleteSubCategory } from '../Controllers/taggingController.js';
import { getAllCountries, getStatesByCountry, getCitiesByState } from '../Controllers/locationDataController.js';
import { deleteReporterById, getAllReporters, updateReporterById } from '../Controllers/userManagementController.js'; 
import { getAllNews, getNewsById, updateNews, deleteNews } from '../Controllers/newsController.js';
import { createAd, getAllAds, updateAd, deleteAd } from '../Controllers/ad.controller.js';
import { createShort, getAllShorts, getShortById, updateShort, deleteShort } from '../Controllers/shortsController.js';
import { loginUser, registerUser } from '../Controllers/authController.js';
import {
  createPoll, 
 
  getAllPolls,
  getPollResults,
  deactivatePoll,
  updatePoll,
} from '../Controllers/polls.controller.js';
const router = express.Router();


// ─────────────────────────────────────────
// ✅ PUBLIC ROUTES — Accessible without login
// ─────────────────────────────────────────

// Location Data
router.get('/countries', getAllCountries);
router.get('/countries/:countryId/states', getStatesByCountry);
router.get('/states/:stateId/cities', getCitiesByState);

// Categories & Subcategories (read-only)
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.get('/subcategories', getAllSubCategories);
router.get('/subcategories/:id', getSubCategoryById);

// ⭐ Public access to News, Headlines, Ads, Shorts
router.get('/public/news', getAllNews);             // e.g., /api/public/news
router.get('/public/news/:id', getNewsById);

router.get('/public/headlines', getAllHeadlines);
router.get('/public/headlines/:id', getHeadlineById);

router.get('/public/ads', getAllAds);

router.get('/public/shorts', getAllShorts);
router.get('/public/shorts/:id', getShortById);

router.post('/login', loginUser);

// ─────────────────────────────────────────
// 🔐 ADMIN + PERMISSION ROUTES (Protected)
// ─────────────────────────────────────────
router.use(authenticate, isAdmin); // Everything below requires admin + permission

// Reporter Management
router.get('/reporters', canUpdateReporters, getAllReporters);
router.put("/reporters/:id", canUpdateReporters, updateReporterById);
router.delete('/reporters/:id',canDeleteReporters, deleteReporterById);
router.post('/register',canCreateReporters, upload.single('profileImageFile'), registerUser);
// Category Management
router.post('/categories', canCreateCategories, createCategory);
router.put('/categories/:id', canUpdateCategories, updateCategory);
router.delete('/categories/:id', canDeleteCategories, deleteCategory);

// SubCategory Management
router.post('/subcategories', canCreateSubCategories, createSubCategory);
router.put('/subcategories/:id', canUpdateSubCategories, updateSubCategory);
router.delete('/subcategories/:id', canDeleteSubCategories, deleteSubCategory);

// Headline Management
router.post('/headline', canCreateHeadlines, createHeadline);
router.get('/headline', canUpdateHeadlines, getAllHeadlines);
router.get('/headline/:id', canUpdateHeadlines, getHeadlineById);
router.put('/headline/:id', canUpdateHeadlines, updateHeadline);
router.delete('/headline/:id', canDeleteHeadlines, deleteHeadline);

// News Management
router.get('/news', canUpdateNews, getAllNews);
router.get('/news/:id', canUpdateNews, getNewsById);
router.put('/news/:id', canUpdateNews, upload.array('mediaFiles', 10), updateNews);
router.delete('/news/:id', canDeleteNews, deleteNews);

// Ads Management
router.post('/ads', canCreateAds, upload.single('media'), createAd);
router.get('/ads', canUpdateAds, getAllAds);
router.put('/ads/:id', canUpdateAds, upload.single('media'), updateAd);
router.delete('/ads/:id', canDeleteAds, deleteAd);

// Shorts Management
router.post('/shorts', canCreateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
router.get('/shorts', canUpdateShorts, getAllShorts);
router.get('/shorts/:id', canUpdateShorts, getShortById);
router.put('/shorts/:id', canUpdateShorts, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
router.delete('/shorts/:id', canDeleteShorts, deleteShort);




// Protected Routes

// poll mangemnetn 
router.get('/polls', getAllPolls);
router.get('/:pollId', getPollResults);
router.post('/polls', canCreatePoll, createPoll);
router.put('/polls/:id', canUpdatePoll, updatePoll);
router.put('/deactivate/:pollId',canDeletePoll,  deactivatePoll);
// router.post('/polls',  createPoll);
// router.put('/polls/:id',  updatePoll);
// router.put('/polls/deactivate/:pollId',  deactivatePoll);


export default router;

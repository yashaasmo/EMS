





import express from 'express';
import { authenticate, isSuperAdmin } from '../Middlewares/auth.js';
import upload from '../Middlewares/multer.middleware.js';
import { loginUser, registerUser } from '../Controllers/authController.js';

import {
    getAllUsers,
    getAllReporters,
    updateReporterById,
    deleteReporterById,
    getAllAdmins,
    updateAdminPermissions,
    // deleteUserById
   
} from '../Controllers/userManagementController.js'; // New User Management Controller
import { createHeadline, deleteHeadline, getAllHeadlines, getHeadlineById, updateHeadline } from '../Controllers/headlineController.js';
import { deleteNews, getAllNews, getNewsById, updateNews } from '../Controllers/newsController.js';
import { createAd, deleteAd, getAllAds, updateAd } from '../Controllers/ad.controller.js';
import { createShort, deleteShort, getAllShorts, getShortById, updateShort } from '../Controllers/shortsController.js';
import { createPoll, deactivatePoll, getAllPolls, getPollResults, updatePoll } from '../Controllers/polls.controller.js';
const router = express.Router();

// Public Routes for Authentication=================================================================================================
router.post('/register', upload.single('profileImageFile'), registerUser);
router.post('/login', loginUser);


 router.use(authenticate, isSuperAdmin);







router.get('/users', getAllUsers);



// === Reporter Management (SuperAdmin updates reporter specific permissions) ===
router.get('/reporters', getAllReporters); 
router.put("/reporters/:id", upload.single('profileImageFile'), updateReporterById); // Update reporter details and permissions
router.delete('/reporters/:id', deleteReporterById); // Delete a reporter
router.post('/create-reporter',  upload.single('profileImageFile'), registerUser);

// === Admin Management (SuperAdmin updates other admin's granular permissions) ===

// Get all admins
router.get('/admins', getAllAdmins); 

router.put('/admins/:id/permissions', updateAdminPermissions); 
router.post('/create-admin',  upload.single('profileImageFile'), registerUser);

// Headline Management
router.post('/headline',  createHeadline);
router.get('/headline', getAllHeadlines);
router.get('/headline/:id', getHeadlineById);
router.put('/headline/:id',  updateHeadline);
router.delete('/headline/:id',  deleteHeadline)



// News Management
router.get('/news', getAllNews);
router.get('/news/:id',  getNewsById);
router.put('/news/:id',  upload.array('mediaFiles', 10), updateNews);
router.delete('/news/:id',  deleteNews);



// Ads Management
router.post('/ads', upload.single('media'), createAd);
router.get('/ads', getAllAds);
router.put('/ads/:id',  upload.single('media'), updateAd);
router.delete('/ads/:id',  deleteAd);


// Shorts Management
router.post('/shorts', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
router.get('/shorts',  getAllShorts);
router.get('/shorts/:id',  getShortById);
router.put('/shorts/:id',  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
router.delete('/shorts/:id',  deleteShort);



// poll mangemnetn 
router.get('/polls', getAllPolls);
router.get('/:pollId', getPollResults);
router.post('/polls',  createPoll);
router.put('/polls/:id',  updatePoll);
router.put('/polls/deactivate/:pollId',  deactivatePoll);

export default router;
// Routes/reporter.routes.js
import express from 'express';
import upload from '../Middlewares/multer.middleware.js';
import { authenticate, isReporter } from '../Middlewares/auth.js'; // Keep isReporter for reporter-specific actions
import { getAllCountries, getCitiesByState, getStatesByCountry } from '../Controllers/locationDataController.js';
import { getAllCategories, getAllSubCategories, getCategoryById, getSubCategoryById } from '../Controllers/taggingController.js';

// News Management by Reporter (only for their own news)
import { createNews, updateNews, deleteNews } from '../Controllers/newsController.js';

// Shorts Management by Reporter (only for their own shorts)
import { createShort, updateShort, deleteShort, getAllShorts, getShortById } from '../Controllers/shortsController.js';
import { loginUser } from '../Controllers/authController.js';

const router = express.Router();
router.post('/login', loginUser);
// Public access for lookup data (same as admin and user routes)
router.get('/countries', getAllCountries);
router.get('/countries/:countryId/states', getStatesByCountry);
router.get('/states/:stateId/cities', getCitiesByState);
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.get('/subcategories', getAllSubCategories);
router.get('/subcategories/:id', getSubCategoryById);

// Routes requiring reporter role for creating/managing *their own* content
router.use(authenticate, isReporter); // Ensures only reporters can hit these (or admins/superadmins directly if they hit reporter routes)

// News Management (Reporter's own news)
router.post('/news', upload.array('mediaFiles', 10), createNews);
router.put('/news/:id', upload.array('mediaFiles', 10), updateNews); // Reporter can update their own news
router.delete('/news/:id', deleteNews); // Reporter can delete their own news

// // Shorts Management (Reporter's own shorts)
// router.post('/shorts', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
// router.put('/shorts/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort); // Reporter can update their own shorts
// router.delete('/shorts/:id', deleteShort); // Reporter can delete their own shorts



router.post('/shorts',  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), createShort);
router.get('/shorts',  getAllShorts);
router.get('/shorts/:id',  getShortById);
router.put('/shorts/:id',  upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), updateShort);
router.delete('/shorts/:id',  deleteShort);

export default router;
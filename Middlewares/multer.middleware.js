import multer from 'multer';
import { MESSAGES } from '../Utils/status.codes.messages.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error(MESSAGES.VALIDATION_ERROR + ': Only image and video files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    
      fileSize: 50 * 1024 * 1024, // For media files (50MB)
    fieldSize: 10 * 1024 * 1024 // ✅ Add this line: For text fields (e.g., content), set to 10MB to be safe
  },
});

export default upload;
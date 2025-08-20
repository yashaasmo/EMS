// Controllers/ad.controller.js
import Ads from '../Models/ad.model.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';

// Helper to convert boolean string ('true'/'false') to actual boolean
const convertToBoolean = (val) => val === true || val === 'true';

// Create Ad
export const createAd = async (req, res) => {
  try {
    const { type, position, link, title, mediaType } = req.body;

    let mediaUrl = null;
    if (type === 'custom' && req.file) {
      mediaUrl = await uploadFileToSpaces(req.file, 'ads');
    }

    // Deactivate all existing active ads for this position before creating a new active one
    // This ensures only one ad is active per position at any given time.
    await Ads.updateMany({ position, isActive: true }, { isActive: false });

    const newAd = await Ads.create({
      type,
      position,
      link: type === 'google' ? link : null,
      title: type === 'custom' ? title : null,
      mediaType: type === 'custom' ? mediaType : null,
      mediaUrl: mediaUrl || null,
      isActive: true // New ad is always created as active
    });

    res.status(STATUS_CODES.CREATED).json({ success: true, ad: newAd });
  } catch (err) {
    // If upload was successful but DB creation failed, clean up the uploaded file
    if (req.file && req.file.location) {
        await deleteFileFromSpaces(req.file.location).catch(cleanupErr => console.error("Failed to clean up uploaded ad media after DB error:", cleanupErr));
    }
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// Get All Ads (for Admin, fetches all active and inactive)
export const getAllAds = async (req, res) => {
  try {
    const ads = await Ads.find().sort({ createdAt: -1 });
    res.status(STATUS_CODES.SUCCESS).json({ success: true, ads });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};


// Update Ad
export const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ads.findById(id);
    if (!ad) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Ad not found' });

    const { type, position, link, title, mediaType, isActive } = req.body; // Added isActive for manual toggle

    let mediaUrl = ad.mediaUrl;
    let filesToDelete = [];

    // If previous type was 'custom' and new is 'google', delete old media
    if (ad.type === 'custom' && type === 'google' && mediaUrl) {
      filesToDelete.push(mediaUrl);
      mediaUrl = null;
    }

    // If still custom, and new file uploaded, replace media
    if (type === 'custom' && req.file) {
      if (mediaUrl) filesToDelete.push(mediaUrl); // Add old media to delete list
      mediaUrl = await uploadFileToSpaces(req.file, 'ads');
    } else if (type === 'custom' && req.body.clearMedia === 'true' && mediaUrl) { // Explicitly clearing media without new upload
        filesToDelete.push(mediaUrl);
        mediaUrl = null;
    }


    // Handle isActive status: if this ad is set to active, deactivate others in the same position
    const newIsActive = convertToBoolean(isActive);
    if (newIsActive === true && (ad.isActive === false || ad.position !== position)) {
        // Deactivate all other active ads for this position (excluding itself)
        await Ads.updateMany(
            { position: position, isActive: true, _id: { $ne: id } },
            { isActive: false }
        );
    }
    // If ad is updated to inactive, no need to deactivate others.
    // If ad remains active and position is same, no change needed for others.

    // Update fields accordingly
    ad.type = type;
    ad.position = position;
    ad.link = type === 'google' ? link : null;
    ad.title = type === 'custom' ? title : null;
    ad.mediaType = type === 'custom' ? mediaType : null;
    ad.mediaUrl = type === 'custom' ? mediaUrl : null;
    ad.isActive = newIsActive;

    await ad.save();

    // Delete old files from Spaces after successful DB update
    for (const url of filesToDelete) {
        await deleteFileFromSpaces(url).catch(err => console.warn("Failed to delete old ad media file:", err.message));
    }

    res.status(STATUS_CODES.SUCCESS).json({ success: true, ad });
  } catch (err) {
    // If upload was successful but DB update failed, consider cleaning up the new uploaded file
    if (req.file && req.file.location) {
        await deleteFileFromSpaces(req.file.location).catch(cleanupErr => console.error("Failed to clean up new ad media after DB error:", cleanupErr));
    }
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};

// Delete Ad
export const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await Ads.findById(id);
    if (!ad) return res.status(STATUS_CODES.NOT_FOUND).json({ success: false, message: 'Ad not found' });

    if (ad.mediaUrl) {
      await deleteFileFromSpaces(ad.mediaUrl);
    }

    await ad.deleteOne();

    res.status(STATUS_CODES.SUCCESS).json({ success: true, message: 'Ad deleted successfully' });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};
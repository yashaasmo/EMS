
// import User from '../Models/user.model.js';
// import { ApiError } from '../Utils/apiError.js';
// import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
// import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
// import { Country, State, City } from '../Models/lookupData.model.js';


// const convertToBoolean = (val) => val === true || val === 'true';


// export const getAllUsers = async (req, res, next) => {
//     try {
//         const users = await User.find({ role: 'user' })
//             .select('-password -__v')
//             .populate('country', 'name iso2')
//             .populate('state', 'name iso2')
//             .populate('city', 'name');

//         const formattedUsers = users.map(user => ({
//             id: user._id.toString(),
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             profileImage: user.profileImage || null,
//             country: user.country ? { id: user.country._id, name: user.country.name, iso2: user.country.iso2 } : null,
//             state: user.state ? { id: user.state._id, name: user.state.name, iso2: user.state.iso2 } : null,
//             city: user.city ? { id: user.city._id, name: user.city.name } : null,
//             address: user.address || null,
//             dateOfBirth: user.dateOfBirth || null,
//             canDirectPost: user.canDirectPost,
//             canDirectGoLive: user.canDirectGoLive,
//             adminPermissions: user.adminPermissions || {},
//             createdAt: user.createdAt,
//             updatedAt: user.updatedAt
//         }));

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: formattedUsers.length,
//             data: formattedUsers
//         });
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch users", [error.message]));
//     }
// };


// export const getAllReporters = async (req, res, next) => {
//     try {
//         const reporters = await User.find({ role: 'reporter' })
//             .select('-password -__v')
//             .populate('country', 'name iso2')
//             .populate('state', 'name iso2')
//             .populate('city', 'name');

//         const formattedReporters = reporters.map(rep => ({
//             id: rep._id.toString(),
//             name: rep.name,
//             email: rep.email,
//             profileImage: rep.profileImage || null,
//             country: rep.country ? { id: rep.country._id, name: rep.country.name, iso2: rep.country.iso2 } : null,
//             state: rep.state ? { id: rep.state._id, name: rep.state.name, iso2: rep.state.iso2 } : null,
//             city: rep.city ? { id: rep.city._id, name: rep.city.name } : null,
//             canDirectPost: rep.canDirectPost,
//             canDirectGoLive: rep.canDirectGoLive,
//             createdAt: rep.createdAt,
//             updatedAt: rep.updatedAt,
//             address: rep.address,
//             dateOfBirth: rep.dateOfBirth
//         }));

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: formattedReporters.length,
//             data: formattedReporters
//         });

//     } catch (error) {
//         console.error("Error fetching reporters:", error);
//         next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch reporters", [error.message]));
//     }
// };


// export const updateReporterById = async (req, res, next) => {
//     try {
//         const reporterId = req.params.id;
//         const profileImageFile = req.file;

//         const existingReporter = await User.findById(reporterId);
//         if (!existingReporter) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found.");
//         }
//         if (existingReporter.role !== 'reporter') {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Cannot update non-reporter user through this endpoint.");
//         }

//         const updateFields = {};

//         if (req.body.name !== undefined) updateFields.name = req.body.name;
//         if (req.body.email !== undefined) updateFields.email = req.body.email;
//         if (req.body.address !== undefined) updateFields.address = req.body.address;

//         if (req.body.canDirectPost !== undefined) {
//             updateFields.canDirectPost = convertToBoolean(req.body.canDirectPost);
//         }
//         if (req.body.canDirectGoLive !== undefined) {
//             updateFields.canDirectGoLive = convertToBoolean(req.body.canDirectGoLive);
//         }

//         if (req.body.dateOfBirth !== undefined && req.body.dateOfBirth !== '') {
//             updateFields.dateOfBirth = new Date(req.body.dateOfBirth).toISOString();
//         } else if (req.body.dateOfBirth === '') {
//             updateFields.dateOfBirth = null;
//         }

//         if (profileImageFile) {
//             const newImageUrl = await uploadFileToSpaces(profileImageFile, 'profile-images');
//             updateFields.profileImage = newImageUrl;
//             if (existingReporter.profileImage) {
//                 await deleteFileFromSpaces(existingReporter.profileImage).catch(console.warn);
//             }
//         } else if (req.body.profileImage === '') { // Explicitly clearing profile image
//             if (existingReporter.profileImage) {
//                 await deleteFileFromSpaces(existingReporter.profileImage).catch(console.warn);
//             }
//             updateFields.profileImage = null;
//         }

//         if (req.body.country !== undefined) updateFields.country = req.body.country === '' ? null : req.body.country;
//         if (req.body.state !== undefined) updateFields.state = req.body.state === '' ? null : req.body.state;
//         if (req.body.city !== undefined) updateFields.city = req.body.city === '' ? null : req.body.city;

//         // Validate provided location IDs if they exist
//         if (updateFields.country && !(await Country.findById(updateFields.country))) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid country ID provided.");
//         }
//         if (updateFields.state && !(await State.findById(updateFields.state))) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid state ID provided.");
//         }
//         if (updateFields.city && !(await City.findById(updateFields.city))) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid city ID provided.");
//         }

//         const updatedRawReporter = await User.findByIdAndUpdate(reporterId, updateFields, {
//             new: true,
//             runValidators: true,
//         });

//         if (!updatedRawReporter) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found after update operation.");
//         }

//         const populatedReporter = await User.findById(updatedRawReporter._id)
//             .select('-password -__v')
//             .populate('country', 'name iso2')
//             .populate('state', 'name iso2')
//             .populate('city', 'name');

//         const formattedReporter = {
//             id: populatedReporter._id.toString(),
//             name: populatedReporter.name,
//             email: populatedReporter.email,
//             profileImage: populatedReporter.profileImage || null,
//             country: populatedReporter.country ? { id: populatedReporter.country._id, name: populatedReporter.country.name, iso2: populatedReporter.country.iso2 } : null,
//             state: populatedReporter.state ? { id: populatedReporter.state._id, name: populatedReporter.state.name, iso2: populatedReporter.state.iso2 } : null,
//             city: populatedReporter.city ? { id: populatedReporter.city._id, name: populatedReporter.city.name } : null,
//             canDirectPost: populatedReporter.canDirectPost,
//             canDirectGoLive: populatedReporter.canDirectGoLive,
//             createdAt: populatedReporter.createdAt,
//             dateOfBirth: populatedReporter.dateOfBirth,
//             address: populatedReporter.address,
//             updatedAt: populatedReporter.updatedAt
//         };

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: "Reporter updated successfully.",
//             data: formattedReporter,
//         });

//     } catch (error) {
//         console.error('Update reporter error:', error);
//         next(error);
//     }
// };


// export const deleteReporterById = async (req, res, next) => {
//   try {
//     const { id } = req.params;

//     const deleted = await User.findOneAndDelete({ _id: id, role: 'reporter' });

//     if (!deleted) {
//       return next(new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found."));
//     }
//     // Delete profile image from Spaces if it exists
//     if (deleted.profileImage) {
//         await deleteFileFromSpaces(deleted.profileImage).catch(warn => console.warn("Failed to delete reporter's old profile image:", warn.message));
//     }

//     res.status(STATUS_CODES.SUCCESS).json({ success: true, message: 'Reporter deleted successfully' });
//   } catch (error) {
//     next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to delete reporter', [error.message]));
//   }
// };


// export const getAllAdmins = async (req, res, next) => {
//     try {
//         const admins = await User.find({ role: 'admin' })
//             .select('-password -__v')
//             .populate('country', 'name iso2')
//             .populate('state', 'name iso2')
//             .populate('city', 'name');

//         const formattedAdmins = admins.map(admin => ({
//             id: admin._id.toString(),
//             name: admin.name,
//             email: admin.email,
//             profileImage: admin.profileImage || null,
//             country: admin.country ? { id: admin.country._id, name: admin.country.name, iso2: admin.country.iso2 } : null,
//             state: admin.state ? { id: admin.state._id, name: admin.state.name, iso2: admin.state.iso2 } : null,
//             city: admin.city ? { id: admin.city._id, name: admin.city.name } : null,
//             adminPermissions: admin.adminPermissions || {},
//             createdAt: admin.createdAt,
//             updatedAt: admin.updatedAt,
//             address: admin.address,
//             dateOfBirth: admin.dateOfBirth
//         }));

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             count: formattedAdmins.length,
//             data: formattedAdmins
//         });
//     } catch (error) {
//         console.error("Error fetching admins:", error);
//         next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch admins", [error.message]));
//     }
// };


// export const updateAdminPermissions = async (req, res, next) => {
//     try {
//         const adminId = req.params.id;
//         const { adminPermissions } = req.body; // Expects an object like { manageNews: true, manageShorts: false, ... }

//         const admin = await User.findById(adminId);
//         if (!admin) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Admin user not found.");
//         }
//         if (admin.role !== 'admin') {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": User is not an admin.");
//         }

//         // Validate and apply permissions
//         const newPermissions = { ...admin.adminPermissions };
//         for (const key in adminPermissions) {
//             // Only update if the key is a valid permission field in the schema
//             if (Object.prototype.hasOwnProperty.call(newPermissions, key)) {
//                 newPermissions[key] = convertToBoolean(adminPermissions[key]);
//             } else {
//                 console.warn(`Attempted to set an invalid admin permission key: ${key}`);
//             }
//         }

//         const updatedAdmin = await User.findByIdAndUpdate(adminId, { adminPermissions: newPermissions }, { new: true, runValidators: true })
//             .select('-password -__v')
//             .populate('country', 'name iso2')
//             .populate('state', 'name iso2')
//             .populate('city', 'name');

//         if (!updatedAdmin) {
//             throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to update admin permissions.");
//         }

//         const formattedAdmin = {
//             id: updatedAdmin._id.toString(),
//             name: updatedAdmin.name,
//             email: updatedAdmin.email,
//             profileImage: updatedAdmin.profileImage || null,
//             country: updatedAdmin.country ? { id: updatedAdmin.country._id, name: updatedAdmin.country.name, iso2: updatedAdmin.country.iso2 } : null,
//             state: updatedAdmin.state ? { id: updatedAdmin.state._id, name: updatedAdmin.state.name, iso2: updatedAdmin.state.iso2 } : null,
//             city: updatedAdmin.city ? { id: updatedAdmin.city._id, name: updatedAdmin.city.name } : null,
//             adminPermissions: updatedAdmin.adminPermissions,
//             createdAt: updatedAdmin.createdAt,
//             updatedAt: updatedAdmin.updatedAt,
//             address: updatedAdmin.address,
//             dateOfBirth: updatedAdmin.dateOfBirth
//         };

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: "Admin permissions updated successfully.",
//             data: formattedAdmin
//         });

//     } catch (error) {
//         console.error("Error updating admin permissions:", error);
//         next(error);
//     }
// };


// export const deleteUserById = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const requestingUserId = req.user._id;

//         if (id === requestingUserId.toString()) {
//             throw new ApiError(STATUS_CODES.BAD_REQUEST, "Super Admin cannot delete their own account via this endpoint.");
//         }

//         const userToDelete = await User.findById(id);
//         if (!userToDelete) {
//             throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": User to delete not found.");
//         }
//         if (userToDelete.role === 'superadmin') {
//             throw new ApiError(STATUS_CODES.FORBIDDEN, "Cannot delete another Super Admin account.");
//         }

//         // Delete profile image if exists
//         if (userToDelete.profileImage) {
//             await deleteFileFromSpaces(userToDelete.profileImage).catch(warn => console.warn("Failed to delete user's profile image:", warn.message));
//         }

//         await User.findByIdAndDelete(id);

//         res.status(STATUS_CODES.SUCCESS).json({
//             success: true,
//             message: "User deleted successfully."
//         });

//     } catch (error) {
//         console.error("Error deleting user:", error);
//         next(error);
//     }
// };


import User from '../Models/user.model.js';
import { ApiError } from '../Utils/apiError.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
import { Country, State, City } from '../Models/lookupData.model.js';


const convertToBoolean = (val) => val === true || val === 'true';


export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({ role: 'user' })
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage || null,
            country: user.country ? { id: user.country._id, name: user.country.name, iso2: user.country.iso2 } : null,
            state: user.state ? { id: user.state._id, name: user.state.name, iso2: user.state.iso2 } : null,
            city: user.city ? { id: user.city._id, name: user.city.name } : null,
            address: user.address || null,
            dateOfBirth: user.dateOfBirth || null,
            canDirectPost: user.canDirectPost,
            canDirectGoLive: user.canDirectGoLive,
            adminPermissions: user.adminPermissions || {},
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }));

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch users", [error.message]));
    }
};


export const getAllReporters = async (req, res, next) => {
    try {
        const reporters = await User.find({ role: 'reporter' })
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        const formattedReporters = reporters.map(rep => ({
            id: rep._id.toString(),
            name: rep.name,
            email: rep.email,
            profileImage: rep.profileImage || null,
            country: rep.country ? { id: rep.country._id, name: rep.country.name, iso2: rep.country.iso2 } : null,
            state: rep.state ? { id: rep.state._id, name: rep.state.name, iso2: rep.state.iso2 } : null,
            city: rep.city ? { id: rep.city._id, name: rep.city.name } : null,
            canDirectPost: rep.canDirectPost,
            canDirectGoLive: rep.canDirectGoLive,
            createdAt: rep.createdAt,
            updatedAt: rep.updatedAt,
            address: rep.address,
            dateOfBirth: rep.dateOfBirth
        }));

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: formattedReporters.length,
            data: formattedReporters
        });

    } catch (error) {
        console.error("Error fetching reporters:", error);
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch reporters", [error.message]));
    }
};


export const updateReporterById = async (req, res, next) => {
    try {
        const reporterId = req.params.id;
        const profileImageFile = req.file;

        const existingReporter = await User.findById(reporterId);
        if (!existingReporter) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found.");
        }
        if (existingReporter.role !== 'reporter') {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Cannot update non-reporter user through this endpoint.");
        }

        const updateFields = {};

        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.email !== undefined) updateFields.email = req.body.email;
        if (req.body.address !== undefined) updateFields.address = req.body.address;

        if (req.body.canDirectPost !== undefined) {
            updateFields.canDirectPost = convertToBoolean(req.body.canDirectPost);
        }
        if (req.body.canDirectGoLive !== undefined) {
            updateFields.canDirectGoLive = convertToBoolean(req.body.canDirectGoLive);
        }

        if (req.body.dateOfBirth !== undefined && req.body.dateOfBirth !== '') {
            updateFields.dateOfBirth = new Date(req.body.dateOfBirth).toISOString();
        } else if (req.body.dateOfBirth === '') {
            updateFields.dateOfBirth = null;
        }

        if (profileImageFile) {
            const newImageUrl = await uploadFileToSpaces(profileImageFile, 'profile-images');
            updateFields.profileImage = newImageUrl;
            if (existingReporter.profileImage) {
                await deleteFileFromSpaces(existingReporter.profileImage).catch(console.warn);
            }
        } else if (req.body.profileImage === '') { // Explicitly clearing profile image
            if (existingReporter.profileImage) {
                await deleteFileFromSpaces(existingReporter.profileImage).catch(console.warn);
            }
            updateFields.profileImage = null;
        }

        if (req.body.country !== undefined) updateFields.country = req.body.country === '' ? null : req.body.country;
        if (req.body.state !== undefined) updateFields.state = req.body.state === '' ? null : req.body.state;
        if (req.body.city !== undefined) updateFields.city = req.body.city === '' ? null : req.body.city;

        // Validate provided location IDs if they exist
        if (updateFields.country && !(await Country.findById(updateFields.country))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid country ID provided.");
        }
        if (updateFields.state && !(await State.findById(updateFields.state))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid state ID provided.");
        }
        if (updateFields.city && !(await City.findById(updateFields.city))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid city ID provided.");
        }

        const updatedRawReporter = await User.findByIdAndUpdate(reporterId, updateFields, {
            new: true,
            runValidators: true,
        });

        if (!updatedRawReporter) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found after update operation.");
        }

        const populatedReporter = await User.findById(updatedRawReporter._id)
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        const formattedReporter = {
            id: populatedReporter._id.toString(),
            name: populatedReporter.name,
            email: populatedReporter.email,
            profileImage: populatedReporter.profileImage || null,
            country: populatedReporter.country ? { id: populatedReporter.country._id, name: populatedReporter.country.name, iso2: populatedReporter.country.iso2 } : null,
            state: populatedReporter.state ? { id: populatedReporter.state._id, name: populatedReporter.state.name, iso2: populatedReporter.state.iso2 } : null,
            city: populatedReporter.city ? { id: populatedReporter.city._id, name: populatedReporter.city.name } : null,
            canDirectPost: populatedReporter.canDirectPost,
            canDirectGoLive: populatedReporter.canDirectGoLive,
            createdAt: populatedReporter.createdAt,
            dateOfBirth: populatedReporter.dateOfBirth,
            address: populatedReporter.address,
            updatedAt: populatedReporter.updatedAt
        };

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Reporter updated successfully.",
            data: formattedReporter,
        });

    } catch (error) {
        console.error('Update reporter error:', error);
        next(error);
    }
};


export const deleteReporterById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: 'reporter' });

    if (!deleted) {
      return next(new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Reporter not found."));
    }
    // Delete profile image from Spaces if it exists
    if (deleted.profileImage) {
        await deleteFileFromSpaces(deleted.profileImage).catch(warn => console.warn("Failed to delete reporter's old profile image:", warn.message));
    }

    res.status(STATUS_CODES.SUCCESS).json({ success: true, message: 'Reporter deleted successfully' });
  } catch (error) {
    next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Failed to delete reporter', [error.message]));
  }
};


export const getAllAdmins = async (req, res, next) => {
    try {
        const admins = await User.find({ role: 'admin' })
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        const formattedAdmins = admins.map(admin => ({
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            profileImage: admin.profileImage || null,
            country: admin.country ? { id: admin.country._id, name: admin.country.name, iso2: admin.country.iso2 } : null,
            state: admin.state ? { id: admin.state._id, name: admin.state.name, iso2: admin.state.iso2 } : null,
            city: admin.city ? { id: admin.city._id, name: admin.city.name } : null,
            // Ensure adminPermissions is returned correctly, potentially deeply copying
            adminPermissions: JSON.parse(JSON.stringify(admin.adminPermissions || {})),
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt,
            address: admin.address,
            dateOfBirth: admin.dateOfBirth
        }));

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: formattedAdmins.length,
            data: formattedAdmins
        });
    } catch (error) {
        console.error("Error fetching admins:", error);
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to fetch admins", [error.message]));
    }
};


export const updateAdminPermissions = async (req, res, next) => {
    try {
        const adminId = req.params.id;
        // adminPermissions will now be a nested object, e.g., { manageNews: { update: true, delete: false }, ... }
        const { adminPermissions } = req.body; 

        const admin = await User.findById(adminId);
        if (!admin) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": Admin user not found.");
        }
        if (admin.role !== 'admin') {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": User is not an admin.");
        }

        // Deep copy existing permissions to avoid direct modification and merge new ones
        const newPermissions = JSON.parse(JSON.stringify(admin.adminPermissions || {}));

        // Iterate through the provided adminPermissions and update deeply
        for (const category in adminPermissions) {
            // Check if the category exists in the schema's default structure
            if (Object.prototype.hasOwnProperty.call(newPermissions, category)) {
                // Ensure the sub-object exists before iterating its properties
                if (typeof newPermissions[category] !== 'object' || newPermissions[category] === null) {
                    newPermissions[category] = {}; // Initialize if not an object
                }
                for (const permissionType in adminPermissions[category]) {
                    // Check if the permissionType exists within that category in the schema's default structure
                    if (Object.prototype.hasOwnProperty.call(newPermissions[category], permissionType)) {
                        newPermissions[category][permissionType] = convertToBoolean(adminPermissions[category][permissionType]);
                    } else {
                        console.warn(`Attempted to set an invalid permission type '${permissionType}' for category '${category}'.`);
                    }
                }
            } else {
                console.warn(`Attempted to set permissions for an invalid category: ${category}`);
            }
        }
        
        const updatedAdmin = await User.findByIdAndUpdate(adminId, { adminPermissions: newPermissions }, { new: true, runValidators: true })
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        if (!updatedAdmin) {
            throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, "Failed to update admin permissions.");
        }

        const formattedAdmin = {
            id: updatedAdmin._id.toString(),
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            profileImage: updatedAdmin.profileImage || null,
            country: updatedAdmin.country ? { id: updatedAdmin.country._id, name: updatedAdmin.country.name, iso2: updatedAdmin.country.iso2 } : null,
            state: updatedAdmin.state ? { id: updatedAdmin.state._id, name: updatedAdmin.state.name, iso2: updatedAdmin.state.iso2 } : null,
            city: updatedAdmin.city ? { id: updatedAdmin.city._id, name: updatedAdmin.city.name } : null,
            // Ensure adminPermissions is returned correctly, potentially deeply copying
            adminPermissions: JSON.parse(JSON.stringify(updatedAdmin.adminPermissions)),
            createdAt: updatedAdmin.createdAt,
            updatedAt: updatedAdmin.updatedAt,
            address: updatedAdmin.address,
            dateOfBirth: updatedAdmin.dateOfBirth
        };

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Admin permissions updated successfully.",
            data: formattedAdmin
        });

    } catch (error) {
        console.error("Error updating admin permissions:", error);
        next(error);
    }
};


export const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const requestingUserId = req.user._id;

        if (id === requestingUserId.toString()) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Super Admin cannot delete their own account via this endpoint.");
        }

        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": User to delete not found.");
        }
        if (userToDelete.role === 'superadmin') {
            throw new ApiError(STATUS_CODES.FORBIDDEN, "Cannot delete another Super Admin account.");
        }

        // Delete profile image if exists
        if (userToDelete.profileImage) {
            await deleteFileFromSpaces(userToDelete.profileImage).catch(warn => console.warn("Failed to delete user's profile image:", warn.message));
        }

        await User.findByIdAndDelete(id);

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "User deleted successfully."
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
    }
};

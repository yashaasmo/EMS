
// Controllers/superAdminController.js (NEW FILE)
import User from '../Models/user.model.js';
import { Country, State, City } from '../Models/lookupData.model.js';
import { ApiError } from '../Utils/apiError.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';

// @desc    Get all users (for Super Admin to view and manage)
// @route   GET /api/v1/admin/users
// @access  Private (SuperAdmin)
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({})
            .select('-password -__v') // Exclude sensitive fields
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
            adminPermissions: user.adminPermissions || {}, // Include granular permissions for admins
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        }));

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: formattedUsers.length,
            data: formattedUsers,
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.INTERNAL_SERVER_ERROR + ": Failed to fetch users.", [error.message]));
    }
};

// @desc    Update user details and permissions (Super Admin)
// @route   PUT /api/v1/admin/users/:id/permissions
// @access  Private (SuperAdmin)
export const updateUserPermissions = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const profileImageFile = req.file;

        const userToUpdate = await User.findById(userId);
        if (!userToUpdate) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": User not found.");
        }

        const updateFields = {};

        // Update basic fields if provided
        if (req.body.name !== undefined) updateFields.name = req.body.name;
        if (req.body.email !== undefined) updateFields.email = req.body.email;
        if (req.body.address !== undefined) updateFields.address = req.body.address;
        if (req.body.dateOfBirth !== undefined) {
            updateFields.dateOfBirth = req.body.dateOfBirth === '' ? null : new Date(req.body.dateOfBirth);
        }
        if (req.body.country !== undefined) updateFields.country = req.body.country === '' ? null : req.body.country;
        if (req.body.state !== undefined) updateFields.state = req.body.state === '' ? null : req.body.state;
        if (req.body.city !== undefined) updateFields.city = req.body.city === '' ? null : req.body.city;

        // Handle profile image upload/clear
        if (profileImageFile) {
            const newImageUrl = await uploadFileToSpaces(profileImageFile, 'profile-images');
            updateFields.profileImage = newImageUrl;
            if (userToUpdate.profileImage) {
                await deleteFileFromSpaces(userToUpdate.profileImage).catch(err => console.warn("Failed to delete old profile image:", err.message));
            }
        } else if (req.body.profileImage === '') { // Explicitly clearing image
            if (userToUpdate.profileImage) {
                await deleteFileFromSpaces(userToUpdate.profileImage).catch(err => console.warn("Failed to delete old profile image on clear:", err.message));
            }
            updateFields.profileImage = null;
        }

        // Update role and specific boolean permissions
        if (req.body.role !== undefined) {
            if (!['user', 'reporter', 'admin', 'superadmin'].includes(req.body.role)) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid role provided.");
            }
            // Prevent superadmin from changing their own role or other superadmins' roles
            if (userToUpdate.role === 'superadmin' && userToUpdate._id.toString() !== req.user._id.toString()) {
                // If the target user is a superadmin, and it's not the requesting superadmin,
                // don't allow role change.
                if (req.body.role !== 'superadmin') { // Superadmin can't demote another superadmin
                    throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Cannot change another Super Admin's role.");
                }
            }
            updateFields.role = req.body.role;
        }

        if (req.body.canDirectPost !== undefined) {
            updateFields.canDirectPost = req.body.canDirectPost === 'true';
        }
        if (req.body.canDirectGoLive !== undefined) {
            updateFields.canDirectGoLive = req.body.canDirectGoLive === 'true';
        }

        // Handle adminPermissions (deep merge or replace)
        if (req.body.adminPermissions !== undefined) {
            try {
                // Parse the JSON string from FormData
                const newAdminPermissions = JSON.parse(req.body.adminPermissions);
                if (typeof newAdminPermissions !== 'object' || newAdminPermissions === null) {
                    throw new Error("adminPermissions must be a valid JSON object.");
                }
                updateFields.adminPermissions = newAdminPermissions;
            } catch (parseError) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid format for adminPermissions. It must be a valid JSON string. " + parseError.message);
            }
        }


        // Validate location IDs if provided
        if (updateFields.country && !(await Country.findById(updateFields.country))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid country ID provided.");
        }
        if (updateFields.state && !(await State.findById(updateFields.state))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid state ID provided.");
        }
        if (updateFields.city && !(await City.findById(updateFields.city))) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Invalid city ID provided.");
        }


        const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
            new: true,
            runValidators: true,
            // We explicitly do NOT set the role here, as it should be handled by the existingUser check
        })
            .select('-password -__v')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('city', 'name');

        if (!updatedUser) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": User not found after update.");
        }

        const formattedUser = {
            id: updatedUser._id.toString(),
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage || null,
            country: updatedUser.country ? { id: updatedUser.country._id, name: updatedUser.country.name, iso2: updatedUser.country.iso2 } : null,
            state: updatedUser.state ? { id: updatedUser.state._id, name: updatedUser.state.name, iso2: updatedUser.state.iso2 } : null,
            city: updatedUser.city ? { id: updatedUser.city._id, name: updatedUser.city.name } : null,
            address: updatedUser.address || null,
            dateOfBirth: updatedUser.dateOfBirth || null,
            canDirectPost: updatedUser.canDirectPost,
            canDirectGoLive: updatedUser.canDirectGoLive,
            adminPermissions: updatedUser.adminPermissions || {},
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: MESSAGES.PROFILE_UPDATED, // Reusing message, or define NEW_USER_PERMISSIONS_UPDATED
            data: formattedUser,
        });

    } catch (error) {
        console.error('Update user permissions error:', error);
        next(error);
    }
};


export const deleteUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const userToDelete = await User.findById(id);

        if (!userToDelete) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.USER_NOT_FOUND + ": User not found.");
        }

        // Prevent Super Admin from deleting themselves
        if (userToDelete.role === 'superadmin' && userToDelete._id.toString() === req.user._id.toString()) {
            throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You cannot delete your own Super Admin account.");
        }

        // If the user has a profile image, delete it from Spaces
        if (userToDelete.profileImage) {
            await deleteFileFromSpaces(userToDelete.profileImage).catch(err => console.warn("Failed to delete user profile image:", err.message));
        }

        await userToDelete.deleteOne(); // Or findByIdAndDelete(id)

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: MESSAGES.USER_DELETED,
            data: {}
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
    }
};
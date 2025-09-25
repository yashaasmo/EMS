// Controllers/headlineController.js
import headlineModel from "../Models/headline.model.js";
import { SubCategory, Country, State, City, Category } from '../Models/lookupData.model.js';
import { ApiError } from "../Utils/apiError.js";
import { MESSAGES, STATUS_CODES } from "../Utils/status.codes.messages.js";

// Create Headline for web and user app====================================================================================================
export const createHeadline = async (req, res, next) => {
    try {
        const { headlineText, category, subCategory, country, state, district, status } = req.body;
        const createdById = req.user?._id;
        const userCanDirectPost = req.user?.canDirectPost || false;
        const userCanDirectGoLive = req.user?.canDirectGoLive || false; // Although less relevant for initial creation, keep for consistency
        const userRole = req.user?.role;

        const missingFields = [];
        if (!headlineText) missingFields.push('Headline text');
        if (!category) missingFields.push('Category');
        if (!createdById) {
            throw new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User ID missing or not authenticated.");
        }
        if (missingFields.length > 0) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, `${MESSAGES.BAD_REQUEST}: Missing required fields: ${missingFields.join(', ')}`);
        }

        let countryId = null;
        if (country) {
            const countryDoc = await Country.findOne({ name: country });
            if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country name is invalid.");
            countryId = countryDoc._id;
        }

        let stateId = null;
        if (state) {
            const stateDoc = await State.findOne({ name: state });
            if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state name is invalid.");
            stateId = stateDoc._id;

            if (countryId && stateDoc.country.toString() !== countryId.toString()) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
            }
        }

        let districtId = null;
        if (district) {
            const cityDoc = await City.findOne({ name: district });
            if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city name is invalid.");
            districtId = cityDoc._id;

            if (stateId && cityDoc.state.toString() !== stateId.toString()) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
            }
            if (countryId && cityDoc.country.toString() !== countryId.toString()) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
            }
        }

        let categoryName = category;
        let subCategoryName = subCategory;

        const categoryDoc = await Category.findOne({ name: category });
        if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category name is invalid.");

        if (subCategory) {
            const subCategoryDoc = await SubCategory.findOne({ name: subCategory, category: categoryDoc._id });
            if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid or does not belong to the selected category.");
        }

        // Determine initial status
        let initialStatus = 'draft';
        if (userCanDirectPost) { initialStatus = 'posted'; } // Reporter can directly post
        // If an admin/superadmin is creating, they can set the status directly from the request
        if (userRole === 'admin' || userRole === 'superadmin') {
            if (status && ['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
                initialStatus = status;
            }
        } else {
             // For reporters, further status changes are not allowed during creation
             if (status && (status !== initialStatus)) {
                throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status during creation.");
             }
        }


        const newHeadline = new headlineModel({
            headlineText,
            createdBy: createdById,
            category: categoryName,
            subCategory: subCategoryName || null,
            country: countryId,
            state: stateId,
            district: districtId,
            status: initialStatus,
        });

        const headline = await newHeadline.save();
        const populatedHeadline = await headline.populate([
            { path: 'createdBy', select: 'username email role country state city profileImage canDirectPost canDirectGoLive' },
            { path: 'updatedBy', select: 'username email' },
            { path: 'country', select: 'name iso2' },
            { path: 'state', select: 'name iso2' },
            { path: 'district', select: 'name' }
        ]);

        const finalHeadlineData = populatedHeadline.toObject();
        finalHeadlineData.category_name = finalHeadlineData.category;
        finalHeadlineData.subCategory_name = finalHeadlineData.subCategory;

        res.status(STATUS_CODES.CREATED).json({
            success: true,
            message: "Headline added successfully.",
            data: finalHeadlineData,
        });
    } catch (error) {
        next(error);
    }
};

// Get All Headlines ======================================================================================================================
export const getAllHeadlines = async (req, res, next) => {
    try {
        const headlines = await headlineModel.find({})
            .populate('createdBy', 'username email role country state city profileImage canDirectPost canDirectGoLive')
            .populate('updatedBy', 'username email')
            .populate('country', 'name iso2')
            .populate('newsId', 'slug_en ')
            .populate('state', 'name iso2')
            .populate('district', 'name')
            .sort({ createdAt: -1 })
               
            .limit(5); 

        const finalHeadlines = headlines.map(headline => {
            const h = headline.toObject();
            h.category_name = headline.category;
            h.subCategory_name = headline.subCategory;
            return h;
        });

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            count: finalHeadlines.length,
            data: finalHeadlines,
        });
    } catch (error) {
        next(new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, MESSAGES.SERVER_ERROR_FETCHING_HEADLINES, [error.message]));
    }
};

// Get Headline By ID =====================================================================================================================
export const getHeadlineById = async (req, res, next) => {
    try {
        const headline = await headlineModel.findById(req.params.id)
            .populate('createdBy', 'username email role country state city profileImage canDirectPost canDirectGoLive')
            .populate('updatedBy', 'username email')
            .populate('country', 'name iso2')
            .populate('state', 'name iso2')
            .populate('district', 'name');

        if (!headline) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        const finalHeadlineData = headline.toObject();
        finalHeadlineData.category_name = finalHeadlineData.category;
        finalHeadlineData.subCategory_name = finalHeadlineData.subCategory;

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            data: finalHeadlineData,
        });
    } catch (error) {
        next(error);
    }
};

// Update Headline==========================================================================================================================
export const updateHeadline = async (req, res, next) => {
    try {
        const { headlineText, category, subCategory, country, state, district, status } = req.body;
        const updatedById = req.user?._id;
        const userCanDirectPost = req.user?.canDirectPost || false;
        const userCanDirectGoLive = req.user?.canDirectGoLive || false;
        const userRole = req.user?.role;

        const updateData = {};

        // Fetch current headline to get existing values for validation if not provided in update
        const currentHeadline = await headlineModel.findById(req.params.id);
        if (!currentHeadline) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        if (headlineText !== undefined) updateData.headlineText = headlineText;

        // Category handling (expects name from frontend, stores name)
        if (category !== undefined) {
            if (category === null || category === '') {
                updateData.category = null;
                updateData.subCategory = null; // Clear subcategory if category is cleared
            } else {
                const categoryDoc = await Category.findOne({ name: category });
                if (!categoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided category name is invalid.");
                updateData.category = categoryDoc.name;
            }
        } else {
            // If category is not provided in update, use existing for subcategory validation context
            updateData.category = currentHeadline.category;
        }

        // SubCategory handling (expects name from frontend, stores name)
        if (subCategory !== undefined) {
            if (subCategory === null || subCategory === '') {
                updateData.subCategory = null;
            } else {
                const subCategoryDoc = await SubCategory.findOne({ name: subCategory });
                if (!subCategoryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Provided subCategory name is invalid.");

                // Validate subcategory belongs to selected category (if category is being updated or exists)
                const categoryForSubcatValidation = updateData.category || currentHeadline.category;
                if (categoryForSubcatValidation) {
                    const parentCategoryDoc = await Category.findOne({ name: categoryForSubcatValidation });
                    if (!parentCategoryDoc || subCategoryDoc.category.toString() !== parentCategoryDoc._id.toString()) {
                        throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Subcategory does not belong to the selected category.");
                    }
                }
                updateData.subCategory = subCategoryDoc.name;
            }
        } else if (category !== undefined && (category === null || category === '')) {
            // If category was explicitly cleared, clear subCategory too
            updateData.subCategory = null;
        }


        let resolvedCountryId = currentHeadline.country; // Start with current headline's country
        if (country !== undefined) {
            if (country === null || country === '') {
                updateData.country = null;
                resolvedCountryId = null;
            } else {
                const countryDoc = await Country.findOne({ name: country });
                if (!countryDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.COUNTRY_NOT_FOUND + ": Provided country name is invalid.");
                updateData.country = countryDoc._id; // Store ObjectId
                resolvedCountryId = countryDoc._id;
            }
        }

        let resolvedStateId = currentHeadline.state; // Start with current headline's state
        if (state !== undefined) {
            if (state === null || state === '') {
                updateData.state = null;
                resolvedStateId = null;
            } else {
                const stateDoc = await State.findOne({ name: state });
                if (!stateDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.STATE_NOT_FOUND + ": Provided state name is invalid.");
                // Validate state belongs to resolved country
                if (resolvedCountryId && stateDoc.country.toString() !== resolvedCountryId.toString()) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": State does not belong to the selected country.");
                }
                updateData.state = stateDoc._id; // Store ObjectId
                resolvedStateId = stateDoc._id;
            }
        }

        if (district !== undefined) {
            if (district === null || district === '') {
                updateData.district = null;
            } else {
                const cityDoc = await City.findOne({ name: district });
                if (!cityDoc) throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.CITY_NOT_FOUND + ": Provided city name is invalid.");
                // Validate city belongs to resolved state
                if (resolvedStateId && cityDoc.state.toString() !== resolvedStateId.toString()) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected state.");
                }
                // Validate city belongs to resolved country
                if (resolvedCountryId && cityDoc.country.toString() !== resolvedCountryId.toString()) {
                    throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": City does not belong to the selected country.");
                }
                updateData.district = cityDoc._id; // Store ObjectId
            }
        }

        // Status handling
        if (status !== undefined) {
            if (!['draft', 'pending_approval', 'posted', 'live', 'rejected'].includes(status)) {
                throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": Invalid status provided.");
            }

            const currentUser = req.user; // User object from authentication middleware

            // SuperAdmin or Admin with manageHeadlines permission can set any valid status
            if (currentUser.role === 'superadmin' || (currentUser.role === 'admin' && currentUser.adminPermissions.manageHeadlines)) {
                updateData.status = status;
            }
            // Reporter can only set specific statuses based on their permissions
            else if (currentUser.role === 'reporter') {
                if (status === 'live' && currentUser.canDirectGoLive) {
                    updateData.status = 'live';
                } else if (['posted'].includes(status) && currentUser.canDirectPost) {
                    updateData.status = status;
                } else if (['draft', 'pending_approval'].includes(status)) {
                    updateData.status = status;
                } else {
                    throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to set this status.");
                }
            } else { // User role cannot update status
                throw new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": You do not have permission to update headline status.");
            }
        }

        if (updatedById) updateData.updatedBy = updatedById;

        if (Object.keys(updateData).length === 0) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, MESSAGES.BAD_REQUEST + ": No fields to update provided.");
        }

        const headline = await headlineModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        ).populate([
            { path: 'createdBy', select: 'username email role country state city profileImage canDirectPost canDirectGoLive' },
            { path: 'updatedBy', select: 'username email' },
            { path: 'country', select: 'name iso2' },
            { path: 'state', select: 'name iso2' },
            { path: 'district', select: 'name' }
        ]);

        if (!headline) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        const finalHeadlineData = headline.toObject();
        finalHeadlineData.category_name = finalHeadlineData.category;
        finalHeadlineData.subCategory_name = finalHeadlineData.subCategory;

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Headline updated successfully.",
            data: finalHeadlineData,
        });
    } catch (error) {
        next(error);
    }
};

// Delete Headline==========================================================================================================================
export const deleteHeadline = async (req, res, next) => {
    try {
        const headline = await headlineModel.findByIdAndDelete(req.params.id);

        if (!headline) {
            throw new ApiError(STATUS_CODES.NOT_FOUND, MESSAGES.HEADLINE_NOT_FOUND);
        }

        res.status(STATUS_CODES.SUCCESS).json({
            success: true,
            message: "Headline deleted successfully.",
            data: {},
        });
    } catch (error) {
        next(error);
    }
};
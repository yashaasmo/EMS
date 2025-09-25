import { uploadFileToSpaces, deleteFileFromSpaces } from '../Services/s3Service.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';
import User from '../Models/user.model.js';
import { getTokenForUser } from '../Utils/tokenUtils.js';
import { ApiError } from '../Utils/apiError.js';

// Super Admin, Admin, User Registration====================================================================== 
export const registerUser = async (req, res, next) => {
    const {
        name,
        email,
        password,
        role,
        country,
        state,
        city,
        address,
        dateOfBirth,
        canDirectPost,
        canDirectGoLive
    } = req.body;

    const profileImageFile = req.file;
    let profileImageUrl = null;
    const convertToBoolean = (val) => val === true || val === 'true';

    try {
        if (!name || !email || !password) {
            throw new ApiError(STATUS_CODES.BAD_REQUEST, "Name, email, and password are required.");
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new ApiError(STATUS_CODES.CONFLICT, MESSAGES.EMAIL_ALREADY_EXISTS);
        }

        if (profileImageFile) {
            profileImageUrl = await uploadFileToSpaces(profileImageFile, 'profile-images');
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'user',
            profileImage: profileImageUrl,
            country,
            state,
            city,
            address,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            canDirectPost: convertToBoolean(canDirectPost),
            canDirectGoLive: convertToBoolean(canDirectGoLive),
        });

        res.status(STATUS_CODES.CREATED).json({
            message: MESSAGES.REGISTRATION_SUCCESS,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                country: user.country,
                state: user.state,
                city: user.city,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                canDirectPost: user.canDirectPost,
                canDirectGoLive: user.canDirectGoLive,
                accessToken: getTokenForUser(user),
            }
        });

    } catch (error) {
        if (profileImageUrl) {
            await deleteFileFromSpaces(profileImageUrl);
        }
        next(error);
    }
};




// Super Admin, Admin, User Login============================================================================= 
// export const loginUser = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_CREDENTIALS });
//         }

//         const isMatch = await user.comparePassword(password);
//         if (!isMatch) {
//             return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_CREDENTIALS });
//         }

//         res.status(STATUS_CODES.SUCCESS).json({
//             message: MESSAGES.LOGIN_SUCCESS,
//             user: {
//                 id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 profileImage: user.profileImage,
//                 country: user.country,
//                 state: user.state,
//                 city: user.city,
//                 address: user.address,
//                 dateOfBirth: user.dateOfBirth,
//                 canDirectPost: user.canDirectPost,
//                 canDirectGoLive: user.canDirectGoLive,
//             },
//             token: getTokenForUser(user),
//         });

//     } catch (error) {
//         console.error("Login Error:", error);
//         res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
//     }
// };

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password'); // 👈 FIXED

        if (!user) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_CREDENTIALS });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.INVALID_CREDENTIALS });
        }

        res.status(STATUS_CODES.SUCCESS).json({
            message: MESSAGES.LOGIN_SUCCESS,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                country: user.country,
                state: user.state,
                city: user.city,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                canDirectPost: user.canDirectPost,
                canDirectGoLive: user.canDirectGoLive,
                
            },
            token: getTokenForUser(user), // ✅ token generation function
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

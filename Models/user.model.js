// import mongoose from 'mongoose';
// import { hashPassword, comparePasswords } from '../Utils/bcryptUtils.js';

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'Name is required'],
//         trim: true,
//     },
//     email: {
//         type: String,
//         required: [true, 'Email is required'],
//         unique: true,
//         trim: true,
//         lowercase: true,
//         match: [/.+@.+\..+/, 'Please fill a valid email address'],
//     },
//     password: {
//         type: String,
//         required: [true, 'Password is required'],
//         minlength: [5, 'Password must be at least 6 characters long'],
//     },
//     role: {
//         type: String,
//         enum: ['user', 'reporter', 'admin','superadmin'],
//         default: 'user',
//     },
//     profileImage: {
//         type: String,
//         default: null,
//     },
//        country: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Country',
//         default: null,
//     },
//     state: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'State',
//         default: null,
//     },
//     city: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'City',
//         default: null,
//     },

//     address: {
//         type: String,
//         trim: true,
//         default: null,
//     },
//     dateOfBirth: {
//         type: Date,
//         default: null,
//     },
//     canDirectPost: {
//         type: Boolean,
//         default: false,
//         description: "Allows the user to directly post content without requiring admin approval for initial creation."
//     },
//     canDirectGoLive: {
//         type: Boolean,
//         default: false,
//         description: "Allows the user to directly set content live without requiring admin approval after posting."
//     },


//     adminPermissions: {
//         manageNews: { type: Boolean, default: false },
//         manageShorts: { type: Boolean, default: false },
//         manageAds: { type: Boolean, default: false },
//         manageHeadlines: { type: Boolean, default: false },
//         manageCategories: { type: Boolean, default: false },
//         manageSubCategories: { type: Boolean, default: false },
//         manageUsers: { type: Boolean, default: false }, // For Admins who can create/manage reporters (optional permission)
//     },
// }, {
//     timestamps: true,
// });


// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         return next();
//     }
//     try {
//         this.password = await hashPassword(this.password);
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// userSchema.methods.comparePassword = async function (enteredPassword) {
//     return await comparePasswords(enteredPassword, this.password);
// };

// const User = mongoose.model('User', userSchema);
// export default User;


// Models/user.model.js

import mongoose from 'mongoose';
import { hashPassword, comparePasswords } from '../Utils/bcryptUtils.js'; // Assuming these are correctly defined

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [5, 'Password must be at least 6 characters long'], // Changed to 5 based on your original, but generally 6 is better
        select: false // Do not return password by default when querying
    },
    role: {
        type: String,
        enum: ['user', 'reporter', 'admin', 'superadmin'],
        default: 'user',
    },
    profileImage: {
        type: String,
        default: null,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        default: null,
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
        default: null,
    },
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'City',
        default: null,
    },
    address: {
        type: String,
        trim: true,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    canDirectPost: {
        type: Boolean,
        default: false,
        description: "Allows the user to directly post content without requiring admin approval for initial creation."
    },
    canDirectGoLive: {
        type: Boolean,
        default: false,
        description: "Allows the user to directly set content live without requiring admin approval after posting."
    },

    // Admin specific granular permissions (for admin role only)
    adminPermissions: {
        manageNews: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            approve: { type: Boolean, default: false }
        },
        manageShorts: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            approve: { type: Boolean, default: false }
        },
        manageAds: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            approve: { type: Boolean, default: false }
        },
        manageHeadlines: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
            approve: { type: Boolean, default: false }
        },
        manageCategories: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        manageSubCategories: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        manageUsers: { // For managing general users
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        manageReporters: { // For managing reporter accounts
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        },
        managePolls: {
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false },
        
    },

        manageAdmins: { // For managing other admin accounts (excluding superadmin)
            create: { type: Boolean, default: false },
            update: { type: Boolean, default: false },
            delete: { type: Boolean, default: false }
        }
        
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await comparePasswords(enteredPassword, this.password);
};


// Add JWT token generation for user methods
import jwt from 'jsonwebtoken';
userSchema.methods.getSignedJwtToken = function () {
    // Make sure process.env.JWT_SECRET and process.env.JWT_EXPIRE are defined in your .env
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};


const User = mongoose.model('User', userSchema);
export default User;
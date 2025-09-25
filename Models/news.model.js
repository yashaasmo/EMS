// // Models/News.js
// import mongoose from 'mongoose';

// // --- Nested Schemas for Media, Likes, Comments ---

// const mediaSchema = mongoose.Schema({
//     url: {
//         type: String,
//         required: true,
//     },
//     type: { // 'image' or 'video'
//         type: String,
//         enum: ['image', 'video'],
//         required: true,
//     },
//     caption: String,
// });

// const likeSchema = mongoose.Schema(
//     {
//         user: { // User who liked (ObjectId to User model)
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true,
//         },
//     },
//     {
//         timestamps: true, // createdAt for the like
//     }
// );

// const commentSchema = mongoose.Schema(
//     {
//         user: { // User who made the comment (ObjectId to User model)
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: true,
//         },
//         text: { // Comment content
//             type: String,
//             required: true,
//             trim: true,
//             maxlength: [500, 'Comment cannot be more than 500 characters'],
//         },
//     },
//     {
//         timestamps: true, // createdAt for the comment
//     }
// );

// // --- Main News Schema ---

// const newsSchema = mongoose.Schema(
//     {
//         // title: {
//         //     type: String,
//         //     required: [true, 'Please add a news title'],
//         //     trim: true,
//         //     minlength: [5, 'Title must be at least 5 characters long'],
//         //     maxlength: [200, 'Title cannot be more than 200 characters long'],
//         // },
//         // content: {
//         //     type: String,
//         //     required: [true, 'Please add news content'],
//         //     minlength: [20, 'Content must be at least 20 characters long'],
//         //     maxlength: [10000000000, 'Content cannot be more than 10000 characters long'],
//         // },
//         // summary: {
//         //     type: String,
//         //     maxlength: [500, 'Summary cannot be more than 500 characters long'],
//         //     trim: true,
//         // },

//          title: {
//       en: {
//         type: String,
//         required: [true, "Please add a news title in English"],
//         trim: true,
//         minlength: [5, "Title must be at least 5 characters long"],
//         maxlength: [200, "Title cannot be more than 200 characters long"],
//       },
//       hi: {
//         type: String,
//         required: [true, "कृपया हिंदी में शीर्षक डालें"],
//         trim: true,
//         minlength: [5, "शीर्षक कम से कम 5 अक्षरों का होना चाहिए"],
//         maxlength: [200, "शीर्षक 200 अक्षरों से अधिक नहीं हो सकता"],
//       },
//     },

//     content: {
//       en: {
//         type: String,
//         required: [true, "Please add news content in English"],
//         minlength: [20, "Content must be at least 20 characters long"],
//       },
//       hi: {
//         type: String,
//         required: [true, "कृपया हिंदी में समाचार सामग्री डालें"],
//         minlength: [20, "सामग्री कम से कम 20 अक्षरों की होनी चाहिए"],
//       },
//     },

//     summary: {
//       en: {
//         type: String,
//         maxlength: [500, "Summary cannot be more than 500 characters long"],
//         trim: true,
//       },
//       hi: {
//         type: String,
//         maxlength: [500, "सारांश 500 अक्षरों से अधिक नहीं हो सकता"],
//         trim: true,
//       },
//     },

//       category: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Category',
// },

// subCategory: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'SubCategory',
// },

// // bhia  ya 8/7/25
// subSubCategory: {
//     type: String,
//     trim: true,
//     default: null,
// },

//         tags: {
//             type: [String],
//             default: [],
//         },
//         media: [mediaSchema], // Array of nested mediaSchema documents
//         country: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'Country',
//             default: null,
//         },
//         state: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'State',
//             default: null,
//         },
//         city: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'City',
//             default: null,
//         },
//         localAddress: {
//             type: String,
//             trim: true,
//             maxlength: [200, 'Local address cannot be more than 200 characters long'],
//             default: null,
//         },
//         status: {
//             type: String,
//             enum: ['draft', 'pending_approval', 'posted', 'live', 'rejected'],
//             default: 'pending_approval',
//             required: true,
//         },
//         createdBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             required: [true, 'News creator is required'],
//         },
//         updatedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//             default: null,
//         },
//         publishedAt: {
//             type: Date,
//             default: null,
//         },
//         viewsCount: {
//             type: Number,
//             default: 0,
//         },
//         likes: [likeSchema], // Array of nested likeSchema documents
//         comments: [commentSchema], // Array of nested commentSchema documents
//            shareLink: {
//             type: String,
//             default: null, // यह न्यूज़ बनने के बाद जेनरेट होगा
//         },


//           referenceLinks: {
//     type: [String], // An array of strings to store multiple URLs
//     default: [],    // Default to an empty array
//   }, 
//         poll: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "NewsPoll",
//   default: null,
// },
//     },

   
    
//     {
//         timestamps: true, // createdAt and updatedAt for the news item itself
//     }
// );


// newsSchema.pre('save', function(next) {
//     // Only set publishedAt if status is changing TO 'posted' or 'live'
//     // AND it hasn't been set before (or it's explicitly cleared and being reset)
//     if (this.isModified('status')) {
//         if ((this.status === 'posted' || this.status === 'live') && !this.publishedAt) {
//             this.publishedAt = new Date();
//         }
//         // Optional: If you want to clear publishedAt when status changes from posted/live
//         // else if (!(this.status === 'posted' || this.status === 'live') && this.publishedAt) {
//         //     this.publishedAt = null;
//         // }
//     }
//     next();
// });


// newsSchema.virtual('likesCount').get(function() {
//     return this.likes ? this.likes.length : 0;
// });


// newsSchema.virtual('commentsCount').get(function() {
//     return this.comments ? this.comments.length : 0;
// });

// export default mongoose.model('News', newsSchema);


import mongoose from 'mongoose';

// --- Nested Schemas for Media, Likes, Comments ---

const mediaSchema = mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    type: { // 'image' or 'video'
        type: String,
        enum: ['image', 'video'],
        required: true,
    },
    caption: String,
});

const likeSchema = mongoose.Schema(
    {
        user: { // User who liked (ObjectId to User model)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // createdAt for the like
    }
);

const commentSchema = mongoose.Schema(
    {
        user: { // User who made the comment (ObjectId to User model)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: { // Comment content
            type: String,
            required: true,
            trim: true,
            maxlength: [500, 'Comment cannot be more than 500 characters'],
        },
    },
    {
        timestamps: true, // createdAt for the comment
    }
);

// --- Main News Schema ---

const newsSchema = mongoose.Schema(
    {
        // --- English Fields ---
        // --- English Fields ---
title_en: {
    type: String,
    trim: true,
   
    maxlength: [200, 'English title cannot be more than 200 characters long'],
},
content_en: {
    type: String,
   
    maxlength: [100000000, 'English content cannot be more than 10000 characters long'],
},
summary_en: {
    type: String,
    maxlength: [500, 'English summary cannot be more than 500 characters long'],
    trim: true,
},

// --- Hindi Fields ---
title_hi: {
    type: String,
    trim: true,
 
    maxlength: [200, 'हिंदी शीर्षक 200 अक्षरों से अधिक नहीं हो सकता'],
},
content_hi: {
    type: String,
  
    maxlength: [10000000, 'हिंदी सामग्री 10000 अक्षरों से अधिक नहीं हो सकती'],
},
summary_hi: {
    type: String,
    maxlength: [500, 'हिंदी सारांश 500 अक्षरों से अधिक नहीं हो सकता'],
    trim: true,
},

         slug_en: { // New field for English slug
            type: String,
            // Slugs should ideally be unique within a context (e.g., category, or globally).
            // Combine with newsId in URL for global uniqueness.
            // unique: true, // Consider carefully if slugs alone should be unique. With newsId, it's fine.
            index: true,
            sparse: true // Allows null values, good if not all news will have an English slug
        },
        

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
        },

        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SubCategory',
        },

        subSubCategory: {
            type: String,
            trim: true,
            default: null,
        },

        tags: {
            type: [String],
            default: [],
        },
        media: [mediaSchema], // Array of nested mediaSchema documents
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
        localAddress: {
            type: String,
            trim: true,
            maxlength: [200, 'Local address cannot be more than 200 characters long'],
            default: null,
        },
        status: {
            type: String,
            enum: ['draft', 'pending_approval', 'posted', 'live', 'rejected'],
            default: 'pending_approval',
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'News creator is required'],
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        publishedAt: {
            type: Date,
            default: null,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        likes: [likeSchema], // Array of nested likeSchema documents
        comments: [commentSchema], // Array of nested commentSchema documents
        shareLink: {
            type: String,
            default: null, // यह न्यूज़ बनने के बाद जेनरेट होगा
        },
        referenceLinks: {
            type: [String], // An array of strings to store multiple URLs
            default: [],    // Default to an empty array
        },
        poll: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NewsPoll",
            default: null,
        },
    },
    {
        timestamps: true, // createdAt and updatedAt for the news item itself
    }
);


newsSchema.pre('save', function (next) {
    // Only set publishedAt if status is changing TO 'posted' or 'live'
    // AND it hasn't been set before (or it's explicitly cleared and being reset)
    if (this.isModified('status')) {
        if ((this.status === 'posted' || this.status === 'live') && !this.publishedAt) {
            this.publishedAt = new Date();
        }
        // Optional: If you want to clear publishedAt when status changes from posted/live
        // else if (!(this.status === 'posted' || this.status === 'live') && this.publishedAt) {
        //     this.publishedAt = null;
        // }
    }
    next();
});


newsSchema.virtual('likesCount').get(function () {
    return this.likes ? this.likes.length : 0;
});


newsSchema.virtual('commentsCount').get(function () {
    return this.comments ? this.comments.length : 0;
});

export default mongoose.model('News', newsSchema);  
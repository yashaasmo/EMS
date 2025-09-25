

// import mongoose from 'mongoose';

// const optionSchema = new mongoose.Schema({
//   text: {
//     type: String,
//     required: [true, 'Option text is required'],
//     trim: true,
//   },
//   votes: {
//     type: Number,
//     default: 0,
//     min: [0, 'Votes cannot be negative']
//   }
// }, { _id: false });

// const pollSchema = new mongoose.Schema({
//   question: {
//     type: String,
//     required: [true, 'Poll question is required'],
//     trim: true,
//     minlength: [5, 'Question must be at least 5 characters']
//   },
//   options: {
//     type: [optionSchema],
//     validate: {
//       validator: function (val) {
//         return val.length >= 2;
//       },
//       message: 'At least 2 options are required'
//     }
//   },
//   totalVotes: {
//     type: Number,
//     default: 0,
//     min: [0, 'Total votes cannot be negative']
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Poll creator is required']
//   },
//   votes: {
//     type: [
//       {
//         user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//         optionIndex: Number,
//         votedAt: { type: Date, default: Date.now }
//       }
//     ],
//     default: []
//   }
// }, {
//   timestamps: true
// });

// export default mongoose.model('Poll', pollSchema);


import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Option text is required'],
    trim: true,
  },
  votes: {
    type: Number,
    default: 0,
    min: [0, 'Votes cannot be negative'],
  },
}, { _id: false });

const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Poll question is required'],
    trim: true,
    minlength: [5, 'Question must be at least 5 characters'],
  },
  options: {
    type: [optionSchema],
    validate: {
      validator: function (val) {
        return val.length >= 2;
      },
      message: 'At least 2 options are required',
    },
  },
  totalVotes: {
    type: Number,
    default: 0,
    min: [0, 'Total votes cannot be negative'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
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
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  visibility: {
    type: String,
    enum: ['public', 'registered'],
    default: 'public',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
  },
  
  votes: {
    type: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        optionIndex: Number,
        votedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Poll', pollSchema);

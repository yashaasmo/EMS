// // controllers/polls.controller.js
// import Poll from '../Models/poll.model.js';
// import { STATUS_CODES } from '../Utils/status.codes.messages.js';

// // Create poll
// export const createPoll = async (req, res) => {
//   try {
//     const { question, options } = req.body;

//     if (!question || !Array.isArray(options) || options.length < 2) {
//       return res.status(400).json({ success: false, message: 'Invalid poll data' });
//     }

//     const formattedOptions = options.map(text => ({ text }));

//     const poll = await Poll.create({
//       question,
//       options: formattedOptions,
//       createdBy: req.user._id,
//     });

//     res.status(201).json({ success: true, poll });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Get all polls
// export const getAllPolls = async (req, res) => {
//   try {
//     const polls = await Poll.find().sort({ createdAt: -1 });
//     res.status(200).json({ success: true, polls });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update poll
// export const updatePoll = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { question, options, isActive } = req.body;

//     const poll = await Poll.findById(id);
//     if (!poll) return res.status(404).json({ success: false, message: 'Poll not found' });

//     if (question) poll.question = question;
//     if (Array.isArray(options) && options.length >= 2) {
//       poll.options = options.map(opt => ({ text: opt.text || opt, votes: opt.votes || 0 }));
//     }
//     if (typeof isActive === 'boolean') poll.isActive = isActive;

//     await poll.save();
//     res.status(200).json({ success: true, poll });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete poll
// export const deletePoll = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Poll.findByIdAndDelete(id);
//     res.status(200).json({ success: true, message: 'Poll deleted' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // polls.controller.js

// export const getPollById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const poll = await Poll.findById(id);
//     if (!poll) {
//       return res.status(404).json({ message: "Poll not found" });
//     }
//     res.status(200).json(poll);
//   } catch (error) {
//     next(error);
//   }
// };



import Poll from '../Models/poll.model.js';
import { ApiError } from '../Utils/apiError.js';
import { STATUS_CODES, MESSAGES } from '../Utils/status.codes.messages.js';

// Create a poll
// export const createPoll = async (req, res, next) => {
//   try {
//     const { question, options } = req.body;

//     if (!question || !options || !Array.isArray(options) || options.length < 2) {
//       return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Poll must have a question and at least 2 options.'));
//     }

//     const formattedOptions = options.map(option => ({ text: option, votes: 0 }));

//     const newPoll = await Poll.create({ question, options: formattedOptions , createdBy: req.user._id, });

//     res.status(STATUS_CODES.CREATED).json({
//       success: true,
//       message: 'Poll created successfully.',
//       data: newPoll,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const createPoll = async (req, res, next) => {
  try {
    const {
      question,
      options,
      start_date,
      end_date,
      visibility,
      category,
      subCategory,
    } = req.body;

    if (!question || !options || !Array.isArray(options) || options.length < 2) {
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Poll must have a question and at least 2 options.'));
    }

    if (!start_date || !end_date) {
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Start and end dates are required.'));
    }

    const formattedOptions = options.map(option => ({
      text: option,
      votes: 0,
    }));

    const newPoll = await Poll.create({
      question,
      options: formattedOptions,
      start_date,
      end_date,
      visibility,
      category,
      subCategory,
      created_by: req?.admin?._id, // For Admin-created polls
     
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: 'Poll created successfully.',
      data: newPoll,
    });
  } catch (error) {
    next(error);
  }
};


// // Get all polls
// export const getAllPolls = async (req, res, next) => {
//   try {
//     const polls = await Poll.find();
//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: 'Polls fetched successfully.',
//       data: polls,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const getAllPolls = async (req, res, next) => {
//   try {
//     const userId = req.user?._id; // logged-in user id

//     let polls = await Poll.find().lean(); // lean() to allow direct modification

//     // Add custom field: hasVoted
//     polls = polls.map(poll => {
//       const hasVoted = poll.votes.some(vote => vote.user.toString() === userId.toString());

//       return {
//         ...poll,
//         hasVoted,
//       };
//     });

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: 'Polls fetched successfully.',
//       data: polls,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const getAllPolls = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const now = new Date();

    let polls = await Poll.find({
      end_date: { $gt: now } // only polls whose end_date is in future
    })
      .populate('category', 'name') // get category name
      .populate('subCategory', 'name') // get subCategory name
      .populate('created_by', 'name email') // get admin info (optional)
      .lean(); // convert to plain objects

    // Add custom field: hasVoted
    polls = polls.map(poll => {
      const hasVoted = poll.votes.some(
        vote => vote.user.toString() === userId.toString()
      );

      return {
        ...poll,
        hasVoted,
      };
    });

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: 'Polls fetched successfully.',
      data: polls,
    });
  } catch (error) {
    next(error);
  }
};



// export const getAllPolls = async (req, res, next) => {
//   try {
//     const userId = req.user?._id; // logged-in user id

//     let polls = await Poll.find().lean(); // lean() to allow direct modification

//     // Add custom field: hasVoted
//     polls = polls.map(poll => {
//       const hasVoted = poll.votes.some(vote => vote.user.toString() === userId.toString());

//       return {
//         ...poll,
//         hasVoted,
//       };
//     });

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: 'Polls fetched successfully.',
//       data: polls,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// Get poll by ID
export const getPollById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
    }

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

// Vote on a poll
// export const voteOnPoll = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { optionIndex } = req.body;

//     const poll = await Poll.findById(id);
//     if (!poll) {
//       return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
//     }

//     if (optionIndex < 0 || optionIndex >= poll.options.length) {
//       return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Invalid option index.'));
//     }

//     poll.options[optionIndex].votes += 1;
//     await poll.save();

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: 'Vote recorded successfully.',
//       data: poll,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const voteOnPoll = async (req, res, next) => {
  try {
    const { id } = req.params; // poll ID
    const { optionIndex } = req.body;
    const userId = req.user?._id; // from authenticate middleware

    if (!userId) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED));
    }

    const poll = await Poll.findById(id);
    if (!poll) {
      return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
    }

    if (!poll.isActive) {
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'This poll is not active.'));
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return next(new ApiError(STATUS_CODES.BAD_REQUEST, 'Invalid option index.'));
    }

    // Check if user has already voted
    const existingVote = poll.votes.find(v => v.user.toString() === userId.toString());

    if (existingVote) {
      // Remove vote from previous option
      if (typeof existingVote.optionIndex === 'number') {
        poll.options[existingVote.optionIndex].votes -= 1;
      }

      // Update vote entry
      existingVote.optionIndex = optionIndex;
      existingVote.votedAt = new Date();
    } else {
      // New voter — add vote record
      poll.votes.push({ user: userId, optionIndex, votedAt: new Date() });
    }

    // Add vote to selected option
    poll.options[optionIndex].votes += 1;

    // Update totalVotes (recalculate fresh)
    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    await poll.save();

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: 'Vote recorded successfully.',
      data: poll,
    });
  } catch (error) {
    next(error);
  }
};

// Get poll results
export const getPollResults = async (req, res, next) => {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id);
    if (!poll) {
      return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
    }

    const totalVotes = poll.options.reduce((acc, option) => acc + option.votes, 0);

    const results = poll.options.map(option => ({
      text: option.text,
      votes: option.votes,
      percentage: totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(2) : '0.00',
    }));

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      data: {
        question: poll.question,
        totalVotes,
        results,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deactivatePoll = async (req, res, next) => {
  try {
    const { pollId } = req.params;

    const poll = await Poll.findById(pollId);
    if (!poll) return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found'));

    poll.isActive = false;
    await poll.save();

    res.status(STATUS_CODES.SUCCESS).json({ success: true, message: 'Poll deactivated' });
  } catch (error) {
    next(error);
  }
};



// export const updatePoll = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const { question, options, isActive } = req.body;
//     const userId = req.user?._id;

//     const poll = await Poll.findById(id);
//     if (!poll) {
//       return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
//     }

//     // Only poll creator can update
//     if (poll.createdBy.toString() !== userId.toString()) {
//       return next(new ApiError(STATUS_CODES.FORBIDDEN, 'You are not allowed to update this poll.'));
//     }

//     // Update question
//     if (question) {
//       poll.question = question.trim();
//     }

//     // Update options (replaces all)
//     if (Array.isArray(options) && options.length >= 2) {
//       poll.options = options.map(text => ({
//         text: text.trim(),
//         votes: 0
//       }));
//       // Reset votes since options changed
//       poll.votes = [];
//       poll.totalVotes = 0;
//     }

//     // Update active/inactive status
//     if (typeof isActive === 'boolean') {
//       poll.isActive = isActive;
//     }

//     await poll.save();

//     res.status(STATUS_CODES.SUCCESS).json({
//       success: true,
//       message: 'Poll updated successfully.',
//       data: poll
//     });
//   } catch (error) {
//     next(error);
//   }
// };

export const updatePoll = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      question,
      options,
      isActive,
      visibility,
      start_date,
      end_date
    } = req.body;

    const userId = req.user?._id;

    const poll = await Poll.findById(id);
    if (!poll) {
      return next(new ApiError(STATUS_CODES.NOT_FOUND, 'Poll not found.'));
    }


    // Update question
    if (question) {
      poll.question = question.trim();
    }

    // Update options
    if (Array.isArray(options) && options.length >= 2) {
      poll.options = options.map(option => ({
        text: option.trim(),
        votes: 0
      }));
      poll.votes = [];
      poll.totalVotes = 0;
    }

    // Update isActive
    if (typeof isActive === 'boolean') {
      poll.isActive = isActive;
    }

    // Update visibility
    if (visibility && ['public', 'registered'].includes(visibility)) {
      poll.visibility = visibility;
    }

    // Update start_date
    if (start_date) {
      poll.start_date = new Date(start_date);
    }

    // Update end_date
    if (end_date) {
      poll.end_date = new Date(end_date);
    }

    await poll.save();

    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      message: 'Poll updated successfully.',
      data: poll
    });

  } catch (error) {
    next(error);
  }
};

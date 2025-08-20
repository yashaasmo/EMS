

// import jwt from 'jsonwebtoken';
// import { ApiError } from '../Utils/apiError.js';
// import { MESSAGES, STATUS_CODES } from '../Utils/status.codes.messages.js';
// import User from '../Models/user.model.js';

// export const authenticate = async (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": No token provided."));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Select all necessary user fields including new adminPermissions
//     const user = await User.findById(decoded.id).select('+canDirectPost +canDirectGoLive +adminPermissions');

//     if (!user) {
//       return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User associated with token not found."));
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("JWT Error:", error.message);
//     if (error.name === 'TokenExpiredError') {
//       return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_EXPIRED));
//     }
//     return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_INVALID));
//   }
// };

// export const isAdmin = (req, res, next) => {
//   if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Admin access required."));
//   }
//   next();
// };

// export const isSuperAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== 'superadmin') {
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Super Admin access required."));
//   }
//   next();
// };

// export const isReporter = (req, res, next) => {
//   if (!req.user || req.user.role !== 'reporter') {
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Reporter access required."));
//   }
//   next();
// };

// export const isUser = (req, res, next) => {
//   if (!req.user || req.user.role !== 'user') {
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": User role required."));
//   }
//   next();
// };

// export const hasRole = (allowedRoles) => (req, res, next) => {
//   if (!req.user || !allowedRoles.includes(req.user.role)) {
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Insufficient role permissions."));
//   }
//   next();
// };

// // NEW: Granular permission checking middleware
// export const hasPermission = (permissionKey) => (req, res, next) => {
//     if (!req.user) {
//         return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User not authenticated."));
//     }
//     // SuperAdmin implicitly has all specific permissions
//     if (req.user.role === 'superadmin') {
//         return next();
//     }
//     // Admin must have the specific permission set to true
//     if (req.user.role === 'admin' && req.user.adminPermissions && req.user.adminPermissions[permissionKey]) {
//         return next();
//     }
//     // For any other role or if admin doesn't have the permission
//     return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + `: Insufficient permissions. Requires ${permissionKey}.`));
// };

// // Convenience wrappers for specific permissions
// export const canManageNews = hasPermission('manageNews');
// export const canManageShorts = hasPermission('manageShorts');
// export const canManageAds = hasPermission('manageAds');
// export const canManageHeadlines = hasPermission('manageHeadlines');
// export const canManageCategories = hasPermission('manageCategories');
// export const canManageSubCategories = hasPermission('manageSubCategories');
// export const canManageUsers = hasPermission('manageUsers'); // For admins who can create/manage reporters




import jwt from 'jsonwebtoken';
import { ApiError } from '../Utils/apiError.js';
import { MESSAGES, STATUS_CODES } from '../Utils/status.codes.messages.js';
import User from '../Models/user.model.js';

// export const authenticate = async (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": No token provided."));
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Select all necessary user fields including new granular adminPermissions
//     // Note: Mongoose automatically handles nested objects for `select`
//     const user = await User.findById(decoded.id).select('+canDirectPost +canDirectGoLive +adminPermissions');

//     if (!user) {
//       return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User associated with token not found."));
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.log("JWT Error:", error.message);
//     if (error.name === 'TokenExpiredError') {
//       return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_EXPIRED));
//     }
//     return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_INVALID));
//   }
// };


export const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": No token provided."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Select all necessary user fields including new adminPermissions
    const user = await User.findById(decoded.id).select('+canDirectPost +canDirectGoLive +adminPermissions');

    if (!user) {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User associated with token not found."));
    }

    req.user = user;
    next();
  } catch (error) {
    console.log("JWT Error:", error.message);
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_EXPIRED));
    }
    return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.TOKEN_INVALID));
  }
};
export const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Admin access required."));
  }
  next();
};

export const isSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Super Admin access required."));
  }
  next();
};

export const isReporter = (req, res, next) => {
  if (!req.user || req.user.role !== 'reporter') {
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Reporter access required."));
  }
  next();
};

export const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== 'user') {
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": User role required."));
  }
  next();
};

export const hasRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + ": Insufficient role permissions."));
  }
  next();
};

// NEW: Granular permission checking middleware for nested permissions
export const hasSpecificPermission = (category, permissionType) => (req, res, next) => {
    if (!req.user) {
        return next(new ApiError(STATUS_CODES.UNAUTHORIZED, MESSAGES.UNAUTHORIZED + ": User not authenticated."));
    }
    // SuperAdmin implicitly has all specific permissions
    if (req.user.role === 'superadmin') {
        return next();
    }
    // Admin must have the specific nested permission set to true
    if (req.user.role === 'admin' && 
        req.user.adminPermissions && 
        req.user.adminPermissions[category] && 
        req.user.adminPermissions[category][permissionType]) {
        return next();
    }
    // For any other role or if admin doesn't have the specific permission
    return next(new ApiError(STATUS_CODES.FORBIDDEN, MESSAGES.FORBIDDEN + `: Insufficient permissions. Requires ${category}.${permissionType}.`));
};

// Convenience wrappers for specific granular permissions
export const canCreateNews = hasSpecificPermission('manageNews', 'create');
export const canUpdateNews = hasSpecificPermission('manageNews', 'update');
export const canDeleteNews = hasSpecificPermission('manageNews', 'delete');
export const canApproveNews = hasSpecificPermission('manageNews', 'approve');

export const canCreateShorts = hasSpecificPermission('manageShorts', 'create');
export const canUpdateShorts = hasSpecificPermission('manageShorts', 'update');
export const canDeleteShorts = hasSpecificPermission('manageShorts', 'delete');
export const canApproveShorts = hasSpecificPermission('manageShorts', 'approve');

export const canCreateAds = hasSpecificPermission('manageAds', 'create');
export const canUpdateAds = hasSpecificPermission('manageAds', 'update');
export const canDeleteAds = hasSpecificPermission('manageAds', 'delete');
export const canApproveAds = hasSpecificPermission('manageAds', 'approve');

export const canCreateHeadlines = hasSpecificPermission('manageHeadlines', 'create');
export const canUpdateHeadlines = hasSpecificPermission('manageHeadlines', 'update');
export const canDeleteHeadlines = hasSpecificPermission('manageHeadlines', 'delete');
export const canApproveHeadlines = hasSpecificPermission('manageHeadlines', 'approve');

export const canCreateCategories = hasSpecificPermission('manageCategories', 'create');
export const canUpdateCategories = hasSpecificPermission('manageCategories', 'update');
export const canDeleteCategories = hasSpecificPermission('manageCategories', 'delete');

export const canCreateSubCategories = hasSpecificPermission('manageSubCategories', 'create');
export const canUpdateSubCategories = hasSpecificPermission('manageSubCategories', 'update');
export const canDeleteSubCategories = hasSpecificPermission('manageSubCategories', 'delete');

export const canCreateUsers = hasSpecificPermission('manageUsers', 'create');
export const canUpdateUsers = hasSpecificPermission('manageUsers', 'update');
export const canDeleteUsers = hasSpecificPermission('manageUsers', 'delete');

export const canCreateReporters = hasSpecificPermission('manageReporters', 'create');
export const canUpdateReporters = hasSpecificPermission('manageReporters', 'update');
export const canDeleteReporters = hasSpecificPermission('manageReporters', 'delete');

export const canCreateAdmins = hasSpecificPermission('manageAdmins', 'create');
export const canUpdateAdmins = hasSpecificPermission('manageAdmins', 'update');
export const canDeleteAdmins = hasSpecificPermission('manageAdmins', 'delete');


export const canCreatePoll = hasSpecificPermission('managePolls', 'create');
export const canUpdatePoll = hasSpecificPermission('managePolls', 'update');
export const canDeletePoll = hasSpecificPermission('managePolls', 'delete');

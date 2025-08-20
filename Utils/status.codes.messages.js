const STATUS_CODES = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};

const MESSAGES = {
    SUCCESS: 'Operation successful',
    CREATED: 'Resource created successfully',
    BAD_REQUEST: 'Bad request',
    UNAUTHORIZED: 'Unauthorized: Access token is missing or invalid',
    FORBIDDEN: 'Forbidden: You do not have permission to access this resource',
    NOT_FOUND: 'Resource not found',
    CONFLICT: 'Resource already exists',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    SERVICE_UNAVAILABLE: 'Service unavailable',

    // Auth specific
    REGISTRATION_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'Login successful',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset link sent to your email',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully',
    PASSWORD_CHANGE_SUCCESS: 'Password changed successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
    EMAIL_ALREADY_EXISTS: 'Email already exists',
    TOKEN_EXPIRED: 'Access token expired',
    TOKEN_INVALID: 'Access token invalid',

    // User specific
    USER_NOT_FOUND: 'User not found',
    PROFILE_UPDATED: 'Profile updated successfully',
    USER_DELETED: 'User deleted successfully',

    // Headline specific
    HEADLINE_TEXT_REQUIRED: 'Headline text is required.',
    HEADLINE_CREATED: 'Headline added successfully.',
    HEADLINE_UPDATED: 'Headline updated successfully.',
    HEADLINE_DELETED: 'Headline deleted successfully.',
    HEADLINE_NOT_FOUND: 'Headline not found.',
    INVALID_HEADLINE_ID_FORMAT: 'Invalid Headline ID format.',
    SERVER_ERROR_FETCHING_HEADLINES: 'Server Error: Could not retrieve headlines.',
    SERVER_ERROR_CREATING_HEADLINE: 'Server Error: Could not create headline.',
    SERVER_ERROR_UPDATING_HEADLINE: 'Server Error: Could not update headline.',
    SERVER_ERROR_DELETING_HEADLINE: 'Server Error: Could not delete headline.',
    HEADLINE_CATEGORY_REQUIRED: 'Headline category is required.',

    // Category specific
    CATEGORY_CREATED: 'Category created successfully.',
    CATEGORY_UPDATED: 'Category updated successfully.',
    CATEGORY_DELETED: 'Category deleted successfully.',
    CATEGORY_NOT_FOUND: 'Category not found.',

    // SubCategory specific
    SUBCATEGORY_CREATED: 'SubCategory created successfully.',
    SUBCATEGORY_UPDATED: 'SubCategory updated successfully.',
    SUBCATEGORY_DELETED: 'SubCategory deleted successfully.',
    SUBCATEGORY_NOT_FOUND: 'SubCategory not found.',

    // Location specific (Country, State, City)
    COUNTRY_NOT_FOUND: 'Country not found.',
    STATE_NOT_FOUND: 'State not found.',
    CITY_NOT_FOUND: 'City not found.',
    SERVER_ERROR_FETCHING_COUNTRIES: 'Server Error: Could not retrieve countries.',
    SERVER_ERROR_FETCHING_STATES: 'Server Error: Could not retrieve states.',
    SERVER_ERROR_FETCHING_CITIES: 'Server Error: Could not retrieve cities.',


    // Article specific
    ARTICLE_CREATED: 'Article created successfully',
    ARTICLE_UPDATED: 'Article updated successfully',
    ARTICLE_DELETED: 'Article deleted successfully',
    ARTICLE_NOT_FOUND: 'Article not found',
    ARTICLE_SUBMITTED_FOR_REVIEW: 'Article submitted for review',
    ARTICLE_STATUS_UPDATED: 'Article status updated successfully',

    // Category specific
    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    CATEGORY_NOT_FOUND: 'Category not found',

    // Tag specific
    TAG_CREATED: 'Tag created successfully',
    TAG_UPDATED: 'Tag updated successfully',
    TAG_DELETED: 'Tag deleted successfully',
    TAG_NOT_FOUND: 'Tag not found',

    // Comment specific
    COMMENT_POSTED: 'Comment posted successfully',
    COMMENT_UPDATED: 'Comment updated successfully',
    COMMENT_DELETED: 'Comment deleted successfully',
    COMMENT_NOT_FOUND: 'Comment not found',
    COMMENT_REPORTED: 'Comment reported successfully',
    COMMENT_STATUS_UPDATED: 'Comment status updated successfully',

        SHORT_CREATED_SUCCESS: "Short created successfully.",
    SHORT_FETCHED_SUCCESS: "Short fetched successfully.",
    SHORTS_FETCHED_SUCCESS: "Shorts fetched successfully.",
    SHORT_UPDATED_SUCCESS: "Short updated successfully.",
    SHORT_DELETED_SUCCESS: "Short deleted successfully.",
    SHORT_NOT_FOUND: "Short not found.",
    SHORT_LIKED_SUCCESS: "Short liked successfully.",
    SHORT_UNLIKED_SUCCESS: "Short unliked successfully.",
    SHORT_COMMENT_ADDED_SUCCESS: "Comment added to short successfully.",

    // Media specific
    FILE_UPLOAD_SUCCESS: 'File(s) uploaded successfully',
    NO_FILE_UPLOADED: 'No file uploaded',
    FILE_NOT_FOUND: 'File not found',
};

export { STATUS_CODES, MESSAGES };
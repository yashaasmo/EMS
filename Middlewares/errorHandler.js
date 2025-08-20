import { STATUS_CODES, MESSAGES } from '../constants/api.constants.js';
import { ApiError } from '../Utils/apiError.js';

const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
            data: err.data,
        });
    }

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(val => val.message);
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: `${MESSAGES.VALIDATION_ERROR}: ${errors.join(', ')}`,
            errors: errors,
        });
    }

    if (err.name === 'CastError') {
        return res.status(STATUS_CODES.BAD_REQUEST).json({
            success: false,
            message: MESSAGES.INVALID_HEADLINE_ID_FORMAT,
            errors: [`Invalid ${err.path}: ${err.value}`],
        });
    }

    console.error("UNHANDLED ERROR:", err);

    const statusCode = err.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR;
    const message = err.message || MESSAGES.INTERNAL_SERVER_ERROR;
    const errors = err.errors || [];

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
    });
};

export { errorHandler };
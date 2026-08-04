import AppError from "./appError.js";
import logger from "./logger.js";

/**
 * Handle MongoDB CastError (invalid ID format).
 */
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Fields Error (11000).
 */
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue
        ? Object.values(err.keyValue)[0]
        : err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

/**
 * Handle Mongoose Validation Error.
 */
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data: ${errors.join(". ")}`;
    return new AppError(message, 400);
};

/**
 * Handle JWT Invalid Error.
 */
const handleJWTError = () =>
    new AppError("Invalid token. Please log in again!", 401);

/**
 * Handle JWT Expired Error.
 */
const handleJWTExpiredError = () =>
    new AppError("Your token has expired! Please log in again.", 401);

/**
 * Handle Multer Error (file upload issues).
 */
const handleMulterError = (err) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return new AppError("File is too large! Maximum limit is 5MB.", 400);
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return new AppError(
            "Too many files uploaded or invalid field name.",
            400,
        );
    }
    return new AppError(err.message, 400);
};

/**
 * Send detailed error response in development environment.
 */
const sendErrorDev = (err, req, res) => {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        ...(err.data && { data: err.data }),
        ...(err.errors && { errors: err.errors }),
        stack: err.stack,
    });
};

/**
 * Send clean operational error response in production environment.
 */
const sendErrorProd = (err, req, res) => {
    // Operational, trusted error: send message (and error details if any) to client
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            ...(err.data && { data: err.data }),
            ...(err.errors && { errors: err.errors }),
        });
    }

    // Programming or unknown error: do not leak details
    logger.error("Unhandled REST Error 💥", {
        message: err.message,
        stack: err.stack,
    });
    return res.status(500).json({
        status: "error",
        message: "Something went very wrong!",
    });
};

/**
 * Global Error Handling Middleware
 */
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, req, res);
    } else {
        let error = Object.assign(
            Object.create(Object.getPrototypeOf(err)),
            err,
        );
        error.message = err.message;
        error.name = err.name;
        error.data = err.data;
        error.errors = err.errors;
        error.statusCode = err.statusCode;
        error.status = err.status;
        error.isOperational = err.isOperational;

        if (error.name === "CastError") error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = handleJWTError();
        if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
        if (error.name === "MulterError") error = handleMulterError(error);

        sendErrorProd(error, req, res);
    }
};

/**
 * Format GraphQL Errors (Development vs Production)
 */
export const formatGraphQLError = (graphqlError) => {
    // Extract original error thrown in resolver/service
    let error = graphqlError.originalError || graphqlError;

    // Transform Mongoose & JWT errors into operational AppErrors
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
        error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    const statusCode = error.statusCode || 500;
    const status = error.status || "error";
    const data = error.data || null;

    // 🟢 DEVELOPMENT MODE: Full details + Stack Trace
    if (process.env.NODE_ENV === "development") {
        return {
            message: error.message || "An error occurred.",
            locations: graphqlError.locations,
            path: graphqlError.path,
            extensions: {
                statusCode: statusCode,
                status: status,
                data: data,
                stack: error.stack,
            },
        };
    }

    // 🔴 PRODUCTION MODE: Operational vs Unknown Errors
    if (error.isOperational) {
        return {
            message: error.message,
            path: graphqlError.path,
            extensions: {
                statusCode: statusCode,
                status: status,
                ...(data && { data }),
            },
        };
    }

    // Hide internal details for unhandled programming bugs in Production
    console.error("GRAPHQL ERROR 💥", graphqlError);
    return {
        message: "Something went very wrong!",
        extensions: {
            statusCode: 500,
            status: "error",
        },
    };
};

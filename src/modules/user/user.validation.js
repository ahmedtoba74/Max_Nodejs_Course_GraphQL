import validator from "validator";
import AppError from "../../utils/appError.js";

export const validateGetUser = (userId) => {
    const errors = [];
    if (!userId || !validator.isMongoId(userId.toString())) {
        errors.push({ message: "Invalid user ID." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const validateUpdateUser = ({ userId, status, name, email } = {}) => {
    const errors = [];
    if (!userId || !validator.isMongoId(userId)) {
        errors.push({ message: "Invalid user ID." });
    }
    if (status && !validator.isLength(status.trim(), { min: 1, max: 280 })) {
        errors.push({
            message: "Status must be between 1 and 280 characters.",
        });
    }
    if (name && !validator.isLength(name.trim(), { min: 3 })) {
        errors.push({ message: "Name must be at least 3 characters long." });
    }
    if (email && !validator.isEmail(email)) {
        errors.push({ message: "Invalid email address." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

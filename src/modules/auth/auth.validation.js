import validator from "validator";
import AppError from "../../utils/appError.js";

export const validateLogin = ({ email, password }) => {
    const errors = [];

    if (!email || !validator.isEmail(email)) {
        errors.push({ message: "Invalid email address." });
    }
    if (!password || validator.isEmpty(password)) {
        errors.push({
            message: "Password is required.",
        });
    }

    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const validateSignup = ({ email, name, password }) => {
    const errors = [];

    if (!email || !validator.isEmail(email)) {
        errors.push({ message: "Invalid email address." });
    }
    if (
        !password ||
        validator.isEmpty(password) ||
        !validator.isLength(password, { min: 6 })
    ) {
        errors.push({
            message: "Password must be at least 6 characters long.",
        });
    }
    if (
        !name ||
        validator.isEmpty(name) ||
        !validator.isLength(name, { min: 3 })
    ) {
        errors.push({
            message: "Name is required and must be at least 3 characters long.",
        });
    }

    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

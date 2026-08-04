import validator from "validator";
import AppError from "../../utils/appError.js";

export const getPostValidation = ({ postId } = {}) => {
    const errors = [];
    if (!postId || !validator.isMongoId(postId.toString())) {
        errors.push({ message: "Invalid post ID." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const getAllPostsValidation = ({ page } = {}) => {
    const errors = [];
    if (page && !validator.isInt(page.toString())) {
        errors.push({ message: "Invalid page number." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const createPostValidation = ({ title, content, imageUrl } = {}) => {
    const errors = [];
    if (!title || !validator.isLength(title.trim(), { min: 3 })) {
        errors.push({ message: "Title must be at least 3 characters long." });
    }
    if (!content || !validator.isLength(content.trim(), { min: 5 })) {
        errors.push({
            message: "Content must be at least 5 characters long.",
        });
    }
    if (
        imageUrl &&
        !validator.isURL(imageUrl) &&
        !imageUrl.startsWith("images/")
    ) {
        errors.push({ message: "Invalid image URL or path." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const updatePostValidation = ({
    postId,
    title,
    content,
    imageUrl,
} = {}) => {
    const errors = [];
    if (!postId || !validator.isMongoId(postId.toString())) {
        errors.push({ message: "Invalid post ID." });
    }
    if (title && !validator.isLength(title.trim(), { min: 3 })) {
        errors.push({ message: "Title must be at least 3 characters long." });
    }
    if (content && !validator.isLength(content.trim(), { min: 5 })) {
        errors.push({
            message: "Content must be at least 5 characters long.",
        });
    }
    if (
        imageUrl &&
        !validator.isURL(imageUrl) &&
        !imageUrl.startsWith("images/")
    ) {
        errors.push({ message: "Invalid image URL or path." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

export const deletePostValidation = ({ postId } = {}) => {
    const errors = [];
    if (!postId || !validator.isMongoId(postId.toString())) {
        errors.push({ message: "Invalid post ID." });
    }
    if (errors.length > 0) {
        const error = new AppError(errors[0].message, 422);
        error.data = errors;
        throw error;
    }
};

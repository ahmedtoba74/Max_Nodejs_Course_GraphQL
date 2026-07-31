import { body, param } from "express-validator";

export const createPostValidation = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Please provide title")
        .isLength({ min: 5 })
        .withMessage("Title must be at least 5 characters long"),
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Please provide content")
        .isLength({ min: 5 })
        .withMessage("Content must be at least 5 characters long"),
];

export const getPostValidation = [
    param("id")
        .trim()
        .notEmpty()
        .withMessage("Please provide ID")
        .isMongoId()
        .withMessage("Invalid ID format"),
];

export const updatePostValidation = [
    ...getPostValidation,
    body("title")
        .trim()
        .optional({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage("Title must be at least 5 characters long"),
    body("content")
        .trim()
        .optional({ checkFalsy: true })
        .isLength({ min: 5 })
        .withMessage("Content must be at least 5 characters long"),
];

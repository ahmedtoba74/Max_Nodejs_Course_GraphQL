import { body } from "express-validator";

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

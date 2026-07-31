import { body } from "express-validator";

export const updateUserStatusValidation = [
    body("status")
        .trim()
        .notEmpty()
        .withMessage("Status is required")
        .isLength({ min: 3 })
        .withMessage("Status must be at least 3 characters long"),
];

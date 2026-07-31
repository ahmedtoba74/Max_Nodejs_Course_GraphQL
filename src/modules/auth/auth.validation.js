import { body } from "express-validator";

export const signupValidation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 3 })
        .withMessage("Name must be at least 3 characters long"),
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    // body("confirmPassword")
    //     .trim()
    //     .notEmpty()
    //     .withMessage("Confirm password is required")
    //     .custom((value, { req }) => {
    //         if (value !== req.body.password) {
    //             throw new Error("Passwords do not match");
    //         }
    //         return true;
    //     }),
];

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address")
        .normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password is required"),
];

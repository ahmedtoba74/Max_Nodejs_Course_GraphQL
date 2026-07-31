import { validationResult } from "express-validator";
import AppError from "../utils/appError.js";

const validate = (...validationArrays) => [
    ...validationArrays.flat(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new AppError("Validation failed", 422);
            error.data = errors.array();
            error.errors = errors.array();
            return next(error);
        }
        next();
    },
];

export default validate;

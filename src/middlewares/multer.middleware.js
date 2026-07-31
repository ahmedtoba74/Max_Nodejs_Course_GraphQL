import multer from "multer";
import path from "path";
import crypto from "crypto";
import AppError from "../utils/appError.js";

// Storage configuration — where and how to save files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${crypto.randomUUID()}${ext}`);
    },
});

// File filter — only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new AppError("Only .jpg, .png and .webp files are allowed", 400),
            false,
        );
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// Reusable exports for different use cases
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, max) => upload.array(fieldName, max);

export default upload;

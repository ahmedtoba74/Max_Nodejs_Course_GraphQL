import { validationResult } from "express-validator";

import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";

export const getPosts = catchAsync(async (req, res, next) => {
    const posts = [];

    res.status(200).json({
        status: "success",
        message: "Posts fetched successfully",
        posts: [
            {
                _id: "1",
                title: "First Post",
                content: "This is the content of the first post",
                imageUrl: "/images/img01.jpg",
                createdAt: new Date().toISOString(),
                creator: {
                    name: "John Doe",
                },
            },
        ],
    });
});

export const createPost = catchAsync(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new AppError("Validation failed", 422);
        error.errors = errors.array();
        return next(error);
    }

    const { title, content } = req.body;

    const newPost = {
        _id: new Date().toISOString(),
        title: title,
        content: content,
        imageUrl: "/images/img01.jpg",
        createdAt: new Date().toISOString(),
        creator: {
            name: "John Doe",
        },
    };

    res.status(201).json({
        status: "success",
        message: "Post created successfully",
        post: newPost,
    });
});

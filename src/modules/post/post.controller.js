import * as postService from "./post.service.js";
import AppError from "../../utils/appError.js";
import catchAsync from "../../utils/catchAsync.js";

export const getAllPosts = catchAsync(async (req, res, next) => {
    const { posts, totalItems, page, totalPages } =
        await postService.getAllPosts(req.query);

    res.status(200).json({
        status: "success",
        message: "Posts fetched successfully",
        totalItems,
        page,
        totalPages,
        posts,
    });
});

export const createPost = catchAsync(async (req, res, next) => {
    if (!req.file) {
        return next(new AppError("Please upload an image", 400));
    }

    // Replace backslashes with forward slashes for Windows compatibility
    const imageUrl = req.file.path.replaceAll("\\", "/");

    const post = await postService.createPost({
        ...req.body,
        imageUrl,
        creator: req.user._id,
    });

    res.status(201).json({
        status: "success",
        message: "Post created successfully",
        post,
    });
});

export const getPost = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const post = await postService.getPost(id);

    if (!post) {
        return next(new AppError("Post not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Post fetched successfully",
        post,
    });
});

export const updatePost = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const imageUrl = req.file ? req.file.path.replaceAll("\\", "/") : undefined;

    const post = await postService.updatePost(
        id,
        req.user._id,
        req.body,
        imageUrl,
    );

    res.status(200).json({
        status: "success",
        message: "Post updated successfully",
        post,
    });
});

export const deletePost = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await postService.deletePost(id, req.user._id);

    res.status(200).json({
        status: "success",
        message: "Post deleted successfully",
    });
});

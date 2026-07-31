import Post from "./post.model.js";
import User from "../user/user.model.js";
import AppError from "../../utils/appError.js";
import clearImage from "../../utils/clearImage.js";
import APIFeatures from "../../utils/apiFeatures.js";
import { getIO } from "../../config/socket.js";

export const createPost = async (data) => {
    const { title, content, imageUrl, creator } = data;

    const post = await Post.create({
        title,
        content,
        imageUrl,
        creator,
    });

    // Update user's posts array
    await User.findByIdAndUpdate(creator, { $push: { posts: post._id } });

    const populatedPost = await post.populate("creator", "name email");

    getIO().emit("posts", {
        action: "create",
        post: populatedPost,
    });

    return populatedPost;
};

export const getAllPosts = async (queryString) => {
    const features = new APIFeatures(
        Post.find().populate("creator", "name email"),
        queryString,
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const [posts, totalItems] = await Promise.all([
        features.query,
        features.countTotal(Post),
    ]);

    const formattedPosts = posts.map((post) => {
        const postObj = post.toObject ? post.toObject() : post;
        if (!postObj.creator) {
            postObj.creator = { name: "Anonymous" };
        }
        return postObj;
    });

    return {
        posts: formattedPosts,
        totalItems,
        page: features.page,
        limit: features.limit,
        totalPages: Math.ceil(totalItems / features.limit),
    };
};

export const getPost = async (id) => {
    const post = await Post.findById(id).populate("creator", "name email");
    if (!post) return null;
    const postObj = post.toObject ? post.toObject() : post;
    if (!postObj.creator) {
        postObj.creator = { name: "Anonymous" };
    }
    return postObj;
};

export const updatePost = async (id, userId, data, newImageUrl = null) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Ownership check
    if (post.creator.toString() !== userId.toString()) {
        throw new AppError("Not authorized to update this post", 403);
    }

    const { title, content } = data;

    if (title) post.title = title;
    if (content) post.content = content;

    if (newImageUrl && post.imageUrl !== newImageUrl) {
        clearImage(post.imageUrl);
        post.imageUrl = newImageUrl;
    }

    await post.save();

    const populatedPost = await post.populate("creator", "name email");

    getIO().emit("posts", {
        action: "update",
        post: populatedPost,
    });

    return populatedPost;
};

export const deletePost = async (id, userId) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Ownership check
    if (post.creator.toString() !== userId.toString()) {
        throw new AppError("Not authorized to delete this post", 403);
    }

    if (post.imageUrl) {
        clearImage(post.imageUrl);
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(post.creator, { $pull: { posts: id } });

    getIO().emit("posts", {
        action: "delete",
        post: id,
    });

    return post;
};

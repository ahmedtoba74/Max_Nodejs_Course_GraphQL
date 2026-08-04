import Post from "./post.model.js";
import User from "../user/user.model.js";
import AppError from "../../utils/appError.js";
import clearImage from "../../utils/clearImage.js";
import APIFeatures from "../../utils/apiFeatures.js";

export const createPost = async (postInput, userId) => {
    const { title, content, imageUrl } = postInput;

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const post = await Post.create({
        title,
        content,
        imageUrl: imageUrl || "images/default.jpg",
        creator: userId,
    });

    // Update user's posts array
    user.posts.push(post._id);
    await user.save();

    const populatedPost = await post.populate("creator", "name email status");

    return {
        ...populatedPost._doc,
        _id: populatedPost._id.toString(),
        createdAt: populatedPost.createdAt.toISOString(),
        updatedAt: populatedPost.updatedAt.toISOString(),
        creator: populatedPost.creator
            ? {
                  ...populatedPost.creator._doc,
                  _id: populatedPost.creator._id.toString(),
              }
            : { _id: "0", name: "Anonymous", email: "", status: "I am new!" },
    };
};

export const getAllPosts = async ({ page }) => {
    const features = new APIFeatures(
        Post.find().populate("creator", "name email status"),
        { page },
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
        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt ? post.createdAt.toISOString() : "",
            updatedAt: post.updatedAt ? post.updatedAt.toISOString() : "",
            creator: post.creator
                ? {
                      ...post.creator._doc,
                      _id: post.creator._id.toString(),
                  }
                : {
                      _id: "0",
                      name: "Anonymous",
                      email: "",
                      status: "I am new!",
                  },
        };
    });

    return {
        posts: formattedPosts,
        totalItems,
    };
};

export const getPost = async (id) => {
    const post = await Post.findById(id).populate(
        "creator",
        "name email status",
    );
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        creator: post.creator
            ? {
                  ...post.creator._doc,
                  _id: post.creator._id.toString(),
              }
            : { _id: "0", name: "Anonymous", email: "", status: "I am new!" },
    };
};

export const updatePost = async (id, userId, data) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Ownership check
    if (post.creator.toString() !== userId.toString()) {
        throw new AppError("Not authorized to update this post!", 403);
    }

    const { title, content, imageUrl } = data;

    if (title) post.title = title;
    if (content) post.content = content;

    if (imageUrl && post.imageUrl !== imageUrl) {
        if (post.imageUrl && post.imageUrl !== "images/default.png") {
            clearImage(post.imageUrl);
        }
        post.imageUrl = imageUrl;
    }

    await post.save();

    const populatedPost = await post.populate("creator", "name email status");

    return {
        ...populatedPost._doc,
        _id: populatedPost._id.toString(),
        createdAt: populatedPost.createdAt.toISOString(),
        updatedAt: populatedPost.updatedAt.toISOString(),
        creator: populatedPost.creator
            ? {
                  ...populatedPost.creator._doc,
                  _id: populatedPost.creator._id.toString(),
              }
            : { _id: "0", name: "Anonymous", email: "" },
    };
};

export const deletePost = async (id, userId) => {
    const post = await Post.findById(id);
    if (!post) {
        throw new AppError("Post not found", 404);
    }

    // Ownership check
    if (post.creator.toString() !== userId.toString()) {
        throw new AppError("Not authorized to delete this post!", 403);
    }

    if (
        post.imageUrl &&
        post.imageUrl.includes("images/") &&
        !post.imageUrl.includes("default.png")
    ) {
        clearImage(post.imageUrl);
    }

    await post.deleteOne();

    // Pull from user's posts array
    await User.findByIdAndUpdate(post.creator, { $pull: { posts: id } });

    return {
        ...post._doc,
        _id: post._id.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
};

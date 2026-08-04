import * as postService from "./post.service.js";
import AppError from "../../utils/appError.js";
import {
    getAllPostsValidation,
    getPostValidation,
    createPostValidation,
    updatePostValidation,
    deletePostValidation,
} from "./post.validation.js";

export const postResolvers = {
    getPosts: async (args, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        getAllPostsValidation(args);
        return await postService.getAllPosts(args);
    },

    getPost: async ({ id }, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        getPostValidation({ postId: id });
        return await postService.getPost(id);
    },

    createPost: async ({ postInput }, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        createPostValidation(postInput);
        return await postService.createPost(postInput, context.req.userId);
    },

    updatePost: async ({ postInput }, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        updatePostValidation({
            postId: postInput?.id?.toString(),
            ...postInput,
        });
        return await postService.updatePost(
            postInput.id,
            context.req.userId,
            postInput,
        );
    },

    deletePost: async ({ id }, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        deletePostValidation({ postId: id });
        return await postService.deletePost(id, context.req.userId);
    },
};

export default postResolvers;

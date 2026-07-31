import express from "express";
import * as postController from "./post.controller.js";
import {
    createPostValidation,
    getPostValidation,
    updatePostValidation,
} from "./post.validation.js";
import { uploadSingle } from "../../middlewares/multer.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(protect);

router
    .route("/")
    .get(postController.getAllPosts)
    .post(
        uploadSingle("image"),
        validate(createPostValidation),
        postController.createPost,
    );
router
    .route("/:id")
    .get(validate(getPostValidation), postController.getPost)
    .patch(
        uploadSingle("image"),
        validate(updatePostValidation),
        postController.updatePost,
    )
    .delete(validate(getPostValidation), postController.deletePost);

export default router;

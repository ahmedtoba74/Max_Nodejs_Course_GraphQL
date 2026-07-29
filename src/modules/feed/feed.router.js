import express from "express";
import * as feedController from "./feed.controller.js";
import { createPostValidation } from "./feed.validation.js";

const router = express.Router();

router.get("/posts", feedController.getPosts);
router.post("/post", createPostValidation, feedController.createPost);

export default router;

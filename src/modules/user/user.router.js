import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { getUserStatus, updateUserStatus } from "./user.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { updateUserStatusValidation } from "./user.validation.js";

const router = express.Router();

router.get("/status", protect, getUserStatus);

router.put(
    "/status",
    protect,
    validate(updateUserStatusValidation),
    updateUserStatus,
);

export default router;

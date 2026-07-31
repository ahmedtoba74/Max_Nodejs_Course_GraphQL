import express from "express";
import * as authController from "./auth.controller.js";
import validate from "../../middlewares/validate.middleware.js";
import { signupValidation, loginValidation } from "./auth.validation.js";

const router = express.Router();

router.post("/signup", validate(signupValidation), authController.signup);
router.post("/login", validate(loginValidation), authController.login);
router.post("/logout", authController.logout);

export default router;

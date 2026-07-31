import * as authService from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";

// Set cookie
const cookieOptions = {
    expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};

export const signup = catchAsync(async (req, res, next) => {
    const { user, token } = await authService.signup(req.body);

    user.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(201).json({
        status: "success",
        message: "User created successfully",
        token,
        user,
    });
});

export const login = catchAsync(async (req, res, next) => {
    const { user, token } = await authService.login(req.body);
    user.password = undefined;
    res.cookie("jwt", token, cookieOptions);
    res.status(200).json({
        status: "success",
        message: "User logged in successfully",
        token,
        user,
    });
});

export const logout = catchAsync(async (req, res, next) => {
    res.cookie("jwt", "", {
        expires: new Date(Date.now() + 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: "success",
        message: "User logged out successfully",
    });
});

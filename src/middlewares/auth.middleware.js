import jwt from "jsonwebtoken";
import User from "../modules/user/user.model.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

export const protect = catchAsync(async (req, res, next) => {
    // 1) Get token from Authorization header (Local Storage) or Cookies
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(
            new AppError(
                "You are not logged in! Please log in to get access.",
                401,
            ),
        );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(
            new AppError(
                "The user belonging to this token no longer exists.",
                401,
            ),
        );
    }

    // 4) Attach user to request
    req.user = user;

    next();
});

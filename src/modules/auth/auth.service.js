import User from "../user/user.model.js";
import AppError from "../../utils/appError.js";
import { generateToken } from "../../utils/jwtHelper.js";

export const signup = async (data) => {
    const { name, email, password, status } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError("User already exists", 400);
    }

    const user = await User.create({
        name,
        email,
        password,
        status,
    });

    const token = generateToken({ id: user._id });

    user.password = undefined;

    return {
        user,
        token,
    };
};

export const login = async (data) => {
    const { email, password } = data;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    // Check password
    const isPasswordValid = await user.correctPassword(password, user.password);
    if (!isPasswordValid) {
        throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = generateToken({ id: user._id });

    user.password = undefined;
    return {
        user,
        token,
    };
};

import User from "./user.model.js";
import AppError from "../../utils/appError.js";

export const getUserStatus = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user.status;
};

export const updateUserStatus = async (userId, status) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    user.status = status;
    await user.save();
    return user;
};

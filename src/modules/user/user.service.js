import User from "./user.model.js";
import AppError from "../../utils/appError.js";

export const getUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

export const updateUser = async (userId, { status, name, email }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (status) user.status = status;
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();
    return user;
};

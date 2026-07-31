import * as userService from "./user.service.js";
import catchAsync from "../../utils/catchAsync.js";

export const getUserStatus = catchAsync(async (req, res, next) => {
    const status = await userService.getUserStatus(req.user.id);
    res.status(200).json({ status });
});

export const updateUserStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;
    const updatedStatus = await userService.updateUserStatus(
        req.user.id,
        status,
    );
    res.status(200).json({ updatedStatus });
});

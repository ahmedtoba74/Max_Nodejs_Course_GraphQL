import * as userService from "./user.service.js";
import { validateGetUser, validateUpdateUser } from "./user.validation.js";
import AppError from "../../utils/appError.js";

export const userResolvers = {
    getUser: async (_, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        validateGetUser(context.req.userId);
        const user = await userService.getUser(context.req.userId);
        return user;
    },

    updateUser: async ({ userInput }, context) => {
        if (!context.req.isAuth) {
            throw new AppError("Not authenticated!", 401);
        }
        validateUpdateUser({ userId: context.req.userId?.toString(), ...userInput });
        const user = await userService.updateUser(context.req.userId, userInput);
        return user;
    },
};

export default userResolvers;

import * as authService from "./auth.service.js";
import { validateLogin, validateSignup } from "./auth.validation.js";
import { cookiesOptions } from "../../utils/cookies.js";

export const authResolvers = {
    login: async ({ email, password }, context) => {
        validateLogin({ email, password });

        const { user, token } = await authService.login({ email, password });

        context.res.cookie("token", token, cookiesOptions);
        return {
            token,
            userId: user._id.toString(),
        };
    },

    createUser: async ({ userInput }) => {
        const { email, name, password } = userInput;

        validateSignup({ email, name, password });

        const { user } = await authService.signup({
            email,
            name,
            password,
        });

        return {
            ...user._doc,
            _id: user._id.toString(),
        };
    },

    logout: async (_, context) => {
        context.res.cookie("token", "", {
            ...cookiesOptions,
            expires: new Date(0),
        });
        return true;
    },
};

export default authResolvers;

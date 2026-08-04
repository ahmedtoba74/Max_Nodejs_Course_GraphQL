import { expect } from "chai";
import { signup, login } from "../../../src/modules/auth/auth.service.js";
import AppError from "../../../src/utils/appError.js";
import User from "../../../src/modules/user/user.model.js";

describe("Auth Service", () => {
    it("should 400 on signup if user already exists", async () => {
        await User.create({
            name: "test",
            email: "test@test.com",
            password: "[PASSWORD]",
        });

        try {
            await signup({
                name: "test",
                email: "test@test.com",
                password: "[PASSWORD]",
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(400);
            expect(error.message).to.equal("User already exists");
        }
    });
});

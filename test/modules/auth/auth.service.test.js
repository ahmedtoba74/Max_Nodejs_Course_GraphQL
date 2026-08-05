import { expect } from "chai";
import { signup, login } from "../../../src/modules/auth/auth.service.js";
import AppError from "../../../src/utils/appError.js";
import User from "../../../src/modules/user/user.model.js";

describe("Auth Service", () => {
    it("should return 400 on signup if user already exists", async () => {
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
    it("should create user successfully", async () => {
        const user = await signup({
            name: "test",
            email: "test2@test.com",
            password: "[PASSWORD]",
        });
        expect(user).to.have.property("token");
        expect(user).to.have.property("user");
        expect(user.user).to.have.property("email").to.equal("test2@test.com");
    });
    it("Should return 401 invalid email or password for wrong email", async () => {
        try {
            await login({
                email: "[EMAIL_ADDRESS]",
                password: "wrongPassword",
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(401);
            expect(error.message).to.equal("Invalid email or password");
        }
    });

    it("should return 401 invalid email or password for wrong password", async () => {
        try {
            await login({
                email: "[EMAIL_ADDRESS]",
                password: "wrongPassword",
            });
            expect.fail("Should have thrown an error");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(401);
            expect(error.message).to.equal("Invalid email or password");
        }
    });

    it("Should return 200 and user data for valid email and password", async () => {
        await signup({
            name: "test",
            email: "test3@test.com",
            password: "[PASSWORD]",
        });

        const user = await login({
            email: "test3@test.com",
            password: "[PASSWORD]",
        });
        expect(user).to.have.property("token");
        expect(user).to.have.property("user");
        expect(user.user).to.have.property("email").to.equal("test3@test.com");
    });
});

import { expect } from "chai";
import User from "../../../src/modules/user/user.model.js";
import { getUser, updateUser } from "../../../src/modules/user/user.service.js";
import AppError from "../../../src/utils/appError.js";

describe("User Service", () => {
    it("Should throw 404 app error for user that doesn't exist for get user", async () => {
        const userId = "64f123456789012345678901";
        try {
            await getUser(userId);
            expect.fail(
                "Should return 404 App error for user that doesn't exist",
            );
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(404);
            expect(error.message).to.equal("User not found");
        }
    });

    it("Should return a user that exists", async () => {
        const user = await User.create({
            name: "John Doe",
            email: "test@test.com",
            password: "password",
        });
        const userId = user._id.toString();
        const foundUser = await getUser(userId);
        expect(foundUser).to.be.an("object");
        expect(foundUser._id.toString()).to.equal(userId);
        expect(foundUser.email).to.equal("test@test.com");
    });

    it("Should throw 404 app error for user that doesn't exist for update user", async () => {
        const userId = "64f123456789012345678901";
        try {
            await updateUser(userId, { name: "John Doe" });
            expect.fail(
                "Should return 404 App error for user that doesn't exist",
            );
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(404);
            expect(error.message).to.equal("User not found");
        }
    });

    it("Should update user that exists", async () => {
        const user = await User.create({
            name: "John Doe",
            email: "test@test.com",
            password: "password",
        });
        const userId = user._id.toString();
        const updatedUser = await updateUser(userId, { name: "Ahmed Toba" });
        expect(updatedUser).to.be.an("object");
        expect(updatedUser._id.toString()).to.equal(userId);
        expect(updatedUser.name).to.equal("Ahmed Toba");
    });
});

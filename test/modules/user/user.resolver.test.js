import { expect } from "chai";
import Sinon from "sinon";

import { userService } from "../../../src/modules/user/user.service.js";
import { userResolvers } from "../../../src/modules/user/user.resolver.js";
import AppError from "../../../src/utils/appError.js";

describe("User Resolver", () => {
    afterEach(() => {
        Sinon.restore();
    });

    it("Should return a user that exists", async () => {
        const dummyUserId = "64f123456789012345678901";
        Sinon.stub(userService, "getUser").resolves({
            _id: dummyUserId,
            name: "John Doe",
            email: "test@test.com",
        });

        const context = {
            req: {
                isAuth: true,
                userId: dummyUserId,
            },
        };

        const result = await userResolvers.getUser({}, context);
        expect(result).to.deep.equal({
            _id: dummyUserId,
            name: "John Doe",
            email: "test@test.com",
        });
    });

    it("getUser should throw 422 AppError if context.req.userId is invalid", async () => {
        const getUserSinon = Sinon.stub(userService, "getUser");

        const context = {
            req: {
                isAuth: true,
                userId: "invalid-mongo-id-123",
            },
        };

        try {
            await userResolvers.getUser({}, context);
            expect.fail("Should have thrown 422 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.message).to.equal("Invalid user ID.");
        }
        expect(getUserSinon.called).to.be.false;
    });

    it("Should throw 401 AppError if unauthenticated for get user", async () => {
        const getUserSinon = Sinon.stub(userService, "getUser");

        const context = {
            req: {
                isAuth: false,
            },
        };

        try {
            await userResolvers.getUser({}, context);
            expect.fail("Should have thrown 401 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(401);
            expect(error.message).to.equal("Not authenticated!");
        }
        expect(getUserSinon.called).to.be.false;
    });

    it("Should throw 404 AppError for user that doesn't exist", async () => {
        const dummyUserId = "64f123456789012345678901";
        const getUserSinon = Sinon.stub(userService, "getUser").rejects(
            new AppError("User not found", 404),
        );

        const context = {
            req: {
                isAuth: true,
                userId: dummyUserId,
            },
        };

        try {
            await userResolvers.getUser({}, context);
            expect.fail("Should have thrown 404 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(404);
            expect(error.message).to.equal("User not found");
        }
        expect(getUserSinon.called).to.be.true;
    });

    it("Should update user successfully", async () => {
        const dummyUserId = "64f123456789012345678901";
        const updateUserSinon = Sinon.stub(userService, "updateUser").resolves({
            _id: dummyUserId,
            name: "John Doe",
            email: "test@test.com",
            status: "active",
        });

        const context = {
            req: {
                isAuth: true,
                userId: dummyUserId,
            },
        };

        const result = await userResolvers.updateUser(
            {
                userId: dummyUserId,
                name: "John Doe",
                email: "test@test.com",
                status: "active",
            },
            context,
        );
        expect(result).to.deep.equal({
            _id: dummyUserId,
            name: "John Doe",
            email: "test@test.com",
            status: "active",
        });
        expect(updateUserSinon.calledOnce).to.be.true;
    });

    it("Should throw 401 AppError if unauthenticated for update uesr", async () => {
        const updateUserSinon = Sinon.stub(userService, "updateUser");
        const context = {
            req: {
                isAuth: false,
            },
        };

        try {
            await userResolvers.updateUser({}, context);
            expect.fail("Should have thrown 401 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(401);
            expect(error.message).to.equal("Not authenticated!");
        }
        expect(updateUserSinon.called).to.be.false;
    });

    it("Should throw 404 AppError for user that doesn't exist", async () => {
        const dummyUserId = "64f123456789012345678901";
        const updateUserSinon = Sinon.stub(userService, "updateUser").rejects(
            new AppError("User not found", 404),
        );

        const context = {
            req: {
                isAuth: true,
                userId: dummyUserId,
            },
        };

        try {
            await userResolvers.updateUser({}, context);
            expect.fail("Should have thrown 404 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(404);
            expect(error.message).to.equal("User not found");
        }
        expect(updateUserSinon.called).to.be.true;
    });

    it("Should throw 422 AppError for validation failed", async () => {
        const dummyUserId = "64f123456789012345678901";
        const updateUserSinon = Sinon.stub(userService, "updateUser").rejects(
            new AppError("User validation failed", 422),
        );

        const context = {
            req: {
                isAuth: true,
                userId: dummyUserId,
            },
        };

        try {
            await userResolvers.updateUser(
                {
                    userId: dummyUserId,
                    name: "John Doe",
                    email: "test@test.com",
                    status: "active",
                },
                context,
            );
            expect.fail("Should have thrown 422 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(422);
            expect(error.message).to.equal("User validation failed");
        }
        expect(updateUserSinon.called).to.be.true;
    });
});

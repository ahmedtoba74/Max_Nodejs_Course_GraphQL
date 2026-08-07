import { expect } from "chai";
import Sinon from "sinon";
import { postService } from "../../../src/modules/post/post.service.js";
import { postResolvers } from "../../../src/modules/post/post.resolver.js";
import AppError from "../../../src/utils/appError.js";

describe("Post Resolver Suite", () => {
    afterEach(() => {
        Sinon.restore();
    });

    describe("getPosts", () => {
        it("getPosts should return posts when authenticated", async () => {
            Sinon.stub(postService, "getAllPosts").resolves({
                posts: [{ _id: "1", title: "Post 1" }],
                totalItems: 1,
            });

            const context = { req: { isAuth: true } };
            const result = await postResolvers.getPosts({ page: 1 }, context);

            expect(result).to.deep.equal({
                posts: [{ _id: "1", title: "Post 1" }],
                totalItems: 1,
            });
        });

        it("getPosts should throw 401 AppError if unauthenticated and not call service", async () => {
            const serviceStub = Sinon.stub(postService, "getAllPosts");
            const context = { req: { isAuth: false } };

            try {
                await postResolvers.getPosts({}, context);
                expect.fail("Should have thrown 401 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(401);
                expect(error.message).to.equal("Not authenticated!");
                expect(serviceStub.called).to.be.false;
            }
        });
    });

    describe("getPost", () => {
        it("getPost should return post when authenticated and ID is valid", async () => {
            const dummyId = "64f123456789012345678901";
            Sinon.stub(postService, "getPost").resolves({
                _id: dummyId,
                title: "Post 1",
            });

            const context = { req: { isAuth: true } };
            const result = await postResolvers.getPost({ id: dummyId }, context);

            expect(result).to.deep.equal({
                _id: dummyId,
                title: "Post 1",
            });
        });

        it("getPost should throw 401 AppError if unauthenticated and not call service", async () => {
            const serviceStub = Sinon.stub(postService, "getPost");
            const context = { req: { isAuth: false } };

            try {
                await postResolvers.getPost({ id: "64f123456789012345678901" }, context);
                expect.fail("Should have thrown 401 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(401);
                expect(serviceStub.called).to.be.false;
            }
        });

        it("getPost should throw 422 AppError if ID is invalid and not call service", async () => {
            const serviceStub = Sinon.stub(postService, "getPost");
            const context = { req: { isAuth: true } };

            try {
                await postResolvers.getPost({ id: "invalid-id" }, context);
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(serviceStub.called).to.be.false;
            }
        });
    });

    describe("createPost", () => {
        it("createPost should create post when authenticated and input is valid", async () => {
            const dummyUserId = "64f123456789012345678901";
            Sinon.stub(postService, "createPost").resolves({
                _id: "post123",
                title: "New Title",
            });

            const context = { req: { isAuth: true, userId: dummyUserId } };
            const postInput = {
                title: "New Title",
                content: "Valid Content Here",
                imageUrl: "images/test.jpg",
            };

            const result = await postResolvers.createPost({ postInput }, context);
            expect(result).to.deep.equal({ _id: "post123", title: "New Title" });
        });

        it("createPost should throw 401 AppError if unauthenticated and not call service", async () => {
            const serviceStub = Sinon.stub(postService, "createPost");
            const context = { req: { isAuth: false } };

            try {
                await postResolvers.createPost({ postInput: {} }, context);
                expect.fail("Should have thrown 401 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(401);
                expect(serviceStub.called).to.be.false;
            }
        });

        it("createPost should throw 422 AppError if validation fails and not call service", async () => {
            const serviceStub = Sinon.stub(postService, "createPost");
            const context = { req: { isAuth: true } };

            try {
                await postResolvers.createPost(
                    { postInput: { title: "ab" } },
                    context,
                );
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(serviceStub.called).to.be.false;
            }
        });
    });

    describe("updatePost", () => {
        it("updatePost should update post when executed by owner", async () => {
            const dummyId = "64f123456789012345678901";
            Sinon.stub(postService, "updatePost").resolves({
                _id: dummyId,
                title: "Updated Title",
            });

            const context = { req: { isAuth: true, userId: dummyId } };
            const postInput = { id: dummyId, title: "Updated Title" };

            const result = await postResolvers.updatePost({ postInput }, context);
            expect(result).to.deep.equal({ _id: dummyId, title: "Updated Title" });
        });

        it("updatePost should propagate 403 AppError when service rejects for non-owner", async () => {
            const dummyId = "64f123456789012345678901";
            Sinon.stub(postService, "updatePost").rejects(
                new AppError("Not authorized to update this post!", 403),
            );

            const context = { req: { isAuth: true, userId: "other-user" } };
            const postInput = { id: dummyId, title: "Updated Title" };

            try {
                await postResolvers.updatePost({ postInput }, context);
                expect.fail("Should have thrown 403 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(403);
            }
        });
    });

    describe("deletePost", () => {
        it("deletePost should return post object when deleted by owner", async () => {
            const dummyId = "64f123456789012345678901";
            Sinon.stub(postService, "deletePost").resolves({ _id: dummyId });

            const context = { req: { isAuth: true, userId: dummyId } };
            const result = await postResolvers.deletePost({ id: dummyId }, context);

            expect(result).to.deep.equal({ _id: dummyId });
        });

        it("deletePost should propagate 403 AppError when service rejects for non-owner", async () => {
            const dummyId = "64f123456789012345678901";
            Sinon.stub(postService, "deletePost").rejects(
                new AppError("Not authorized to delete this post!", 403),
            );

            const context = { req: { isAuth: true, userId: "other-user" } };

            try {
                await postResolvers.deletePost({ id: dummyId }, context);
                expect.fail("Should have thrown 403 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(403);
            }
        });
    });
});

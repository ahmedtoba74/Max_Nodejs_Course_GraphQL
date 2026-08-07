import { expect } from "chai";
import {
    createPostValidation,
    getPostValidation,
    updatePostValidation,
    deletePostValidation,
} from "../../../src/modules/post/post.validation.js";
import AppError from "../../../src/utils/appError.js";

describe("Post Validation Suite", () => {
    describe("createPostValidation", () => {
        it("Should throw 422 AppError if title is under 3 characters", () => {
            try {
                createPostValidation({
                    title: "ab",
                    content: "Valid Content Here",
                    imageUrl: "images/test.jpg",
                });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Title must be at least 3 characters long.");
            }
        });

        it("Should throw 422 AppError if content is under 5 characters", () => {
            try {
                createPostValidation({
                    title: "Valid Title",
                    content: "1234",
                    imageUrl: "images/test.jpg",
                });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Content must be at least 5 characters long.");
            }
        });

        it("Should throw 422 AppError if imageUrl is invalid", () => {
            try {
                createPostValidation({
                    title: "Valid Title",
                    content: "Valid Content Here",
                    imageUrl: "invalid_path",
                });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Invalid image URL or path.");
            }
        });

        it("Should not throw an error if input is valid", () => {
            expect(() =>
                createPostValidation({
                    title: "Valid Title",
                    content: "Valid Content Here",
                    imageUrl: "images/test.jpg",
                }),
            ).to.not.throw();
        });
    });

    describe("getPostValidation", () => {
        it("Should throw 422 AppError if postId is invalid Mongo ID", () => {
            try {
                getPostValidation({ postId: "invalid-id" });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Invalid post ID.");
            }
        });

        it("Should not throw an error if postId is valid Mongo ID", () => {
            expect(() =>
                getPostValidation({ postId: "64f123456789012345678901" }),
            ).to.not.throw();
        });
    });

    describe("updatePostValidation", () => {
        it("Should throw 422 AppError if postId is invalid Mongo ID", () => {
            try {
                updatePostValidation({ postId: "invalid-id" });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Invalid post ID.");
            }
        });

        it("Should throw 422 AppError if updated title is under 3 characters", () => {
            try {
                updatePostValidation({
                    postId: "64f123456789012345678901",
                    title: "ab",
                });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Title must be at least 3 characters long.");
            }
        });

        it("Should not throw an error if updatePost input is valid", () => {
            expect(() =>
                updatePostValidation({
                    postId: "64f123456789012345678901",
                    title: "Updated Title",
                    content: "Updated Content",
                }),
            ).to.not.throw();
        });
    });

    describe("deletePostValidation", () => {
        it("Should throw 422 AppError if postId is invalid Mongo ID", () => {
            try {
                deletePostValidation({ postId: "invalid-id" });
                expect.fail("Should have thrown 422 AppError");
            } catch (error) {
                expect(error).to.be.instanceOf(AppError);
                expect(error.statusCode).to.equal(422);
                expect(error.data[0].message).to.equal("Invalid post ID.");
            }
        });

        it("Should not throw an error if postId is valid", () => {
            expect(() =>
                deletePostValidation({ postId: "64f123456789012345678901" }),
            ).to.not.throw();
        });
    });
});

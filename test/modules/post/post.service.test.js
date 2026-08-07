import { expect } from "chai";
import User from "../../../src/modules/user/user.model.js";
import Post from "../../../src/modules/post/post.model.js";
import {
    createPost,
    getAllPosts,
    getPost,
    updatePost,
    deletePost,
} from "../../../src/modules/post/post.service.js";
import AppError from "../../../src/utils/appError.js";

describe("Post Service Suite", () => {
    let dummyUser;

    beforeEach(async () => {
        dummyUser = await User.create({
            name: "John Owner",
            email: "owner@test.com",
            password: "password123",
        });
    });

    it("createPost should create post and add post ID to user's posts array", async () => {
        const postInput = {
            title: "First Post Title",
            content: "First Post Content Here",
            imageUrl: "images/default.jpg",
        };

        const post = await createPost(postInput, dummyUser._id.toString());

        expect(post).to.have.property("_id");
        expect(post).to.have.property("title", "First Post Title");
        expect(post.creator).to.have.property("email", "owner@test.com");

        const updatedUser = await User.findById(dummyUser._id);
        expect(updatedUser.posts).to.have.lengthOf(1);
    });

    it("getAllPosts should return paginated posts and total count", async () => {
        await Post.create({
            title: "Post 1",
            content: "Content 1",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const result = await getAllPosts({ page: 1 });
        expect(result).to.have.property("totalItems", 1);
        expect(result.posts).to.be.an("array").that.has.lengthOf(1);
        expect(result.posts[0]).to.have.property("title", "Post 1");
    });

    it("getPost should return post document by ID", async () => {
        const createdPost = await Post.create({
            title: "Target Post",
            content: "Target Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const post = await getPost(createdPost._id.toString());
        expect(post).to.have.property("title", "Target Post");
        expect(post.creator).to.have.property("name", "John Owner");
    });

    it("getPost should throw 404 AppError if post does not exist", async () => {
        try {
            await getPost("64f123456789012345678901");
            expect.fail("Should have thrown 404 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(404);
            expect(error.message).to.equal("Post not found");
        }
    });

    it("updatePost should update fields when executed by owner", async () => {
        const createdPost = await Post.create({
            title: "Old Title",
            content: "Old Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const updated = await updatePost(
            createdPost._id.toString(),
            dummyUser._id.toString(),
            { title: "New Updated Title" },
        );

        expect(updated.title).to.equal("New Updated Title");
    });

    it("updatePost should throw 403 AppError when non-owner attempts update", async () => {
        const otherUser = await User.create({
            name: "Other User",
            email: "other@test.com",
            password: "password123",
        });

        const createdPost = await Post.create({
            title: "Owner Post",
            content: "Owner Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        try {
            await updatePost(
                createdPost._id.toString(),
                otherUser._id.toString(), // ──► Non-owner ID
                { title: "Hacked Title" },
            );
            expect.fail("Should have thrown 403 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(403);
            expect(error.message).to.equal("Not authorized to update this post!");
        }
    });

    it("deletePost should delete post and pull ID from user's posts array", async () => {
        const createdPost = await Post.create({
            title: "Post to Delete",
            content: "Content to Delete",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        dummyUser.posts.push(createdPost._id);
        await dummyUser.save();

        await deletePost(
            createdPost._id.toString(),
            dummyUser._id.toString(),
        );

        const foundPost = await Post.findById(createdPost._id);
        expect(foundPost).to.be.null;

        const updatedUser = await User.findById(dummyUser._id);
        expect(updatedUser.posts).to.have.lengthOf(0);
    });

    it("deletePost should throw 403 AppError when non-owner attempts delete", async () => {
        const otherUser = await User.create({
            name: "Other User",
            email: "other2@test.com",
            password: "password123",
        });

        const createdPost = await Post.create({
            title: "Owner Post",
            content: "Owner Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        try {
            await deletePost(
                createdPost._id.toString(),
                otherUser._id.toString(),
            );
            expect.fail("Should have thrown 403 AppError");
        } catch (error) {
            expect(error).to.be.instanceOf(AppError);
            expect(error.statusCode).to.equal(403);
            expect(error.message).to.equal("Not authorized to delete this post!");
        }
    });
});

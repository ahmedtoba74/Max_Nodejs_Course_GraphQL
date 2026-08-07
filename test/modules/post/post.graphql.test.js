import { expect } from "chai";
import request from "supertest";
import app from "../../../app.js";
import User from "../../../src/modules/user/user.model.js";
import Post from "../../../src/modules/post/post.model.js";
import { generateToken } from "../../../src/utils/jwtHelper.js";

describe("Post GraphQL E2E Suite", () => {
    let dummyUser;
    let token;

    beforeEach(async () => {
        dummyUser = await User.create({
            name: "Post Owner",
            email: "post_owner@test.com",
            password: "password123",
        });
        token = generateToken({ id: dummyUser._id });
    });

    it("mutation createPost should create post over HTTP GraphQL with Bearer token", async () => {
        const graphqlQuery = `
            mutation CreatePost($postInput: CreatePostInputData!) {
                createPost(postInput: $postInput) {
                    _id
                    title
                    content
                    imageUrl
                    creator {
                        name
                        email
                    }
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: graphqlQuery,
                variables: {
                    postInput: {
                        title: "GraphQL E2E Post",
                        content: "GraphQL E2E Content Here",
                        imageUrl: "images/default.jpg",
                    },
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.createPost).to.have.property("title", "GraphQL E2E Post");
        expect(res.body.data.createPost.creator).to.have.property("email", "post_owner@test.com");
    });

    it("query getPosts should return paginated posts list over GraphQL", async () => {
        await Post.create({
            title: "Post 1",
            content: "Content 1",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            query {
                getPosts(page: 1) {
                    totalItems
                    posts {
                        _id
                        title
                    }
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({ query: graphqlQuery });

        expect(res.status).to.equal(200);
        expect(res.body.data.getPosts).to.have.property("totalItems", 1);
        expect(res.body.data.getPosts.posts[0]).to.have.property("title", "Post 1");
    });

    it("query getPost should return single post by ID over GraphQL", async () => {
        const createdPost = await Post.create({
            title: "Target Post",
            content: "Target Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            query GetPost($id: ID!) {
                getPost(id: $id) {
                    _id
                    title
                    content
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: graphqlQuery,
                variables: { id: createdPost._id.toString() },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.getPost).to.have.property("title", "Target Post");
    });

    it("mutation updatePost should update post title by owner over GraphQL", async () => {
        const createdPost = await Post.create({
            title: "Old Title",
            content: "Old Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            mutation UpdatePost($postInput: UpdatePostInputData!) {
                updatePost(postInput: $postInput) {
                    _id
                    title
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: graphqlQuery,
                variables: {
                    postInput: {
                        id: createdPost._id.toString(),
                        title: "New E2E Title",
                    },
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.updatePost).to.have.property("title", "New E2E Title");
    });

    it("mutation updatePost should return 403 error when non-owner attempts update", async () => {
        const otherUser = await User.create({
            name: "Other User",
            email: "other_user@test.com",
            password: "password123",
        });
        const otherToken = generateToken({ id: otherUser._id });

        const createdPost = await Post.create({
            title: "Owner Post",
            content: "Owner Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            mutation UpdatePost($postInput: UpdatePostInputData!) {
                updatePost(postInput: $postInput) {
                    _id
                    title
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${otherToken}`)
            .send({
                query: graphqlQuery,
                variables: {
                    postInput: {
                        id: createdPost._id.toString(),
                        title: "Hacked Title",
                    },
                },
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0].message).to.equal("Not authorized to update this post!");
    });

    it("mutation deletePost should delete post by owner over GraphQL", async () => {
        const createdPost = await Post.create({
            title: "Post to Delete",
            content: "Content to Delete",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            mutation DeletePost($id: ID!) {
                deletePost(id: $id) {
                    _id
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${token}`)
            .send({
                query: graphqlQuery,
                variables: { id: createdPost._id.toString() },
            });

        expect(res.status).to.equal(200);
        expect(res.body.data.deletePost).to.have.property("_id", createdPost._id.toString());
    });

    it("mutation deletePost should return 403 error when non-owner attempts delete", async () => {
        const otherUser = await User.create({
            name: "Other User",
            email: "other_user2@test.com",
            password: "password123",
        });
        const otherToken = generateToken({ id: otherUser._id });

        const createdPost = await Post.create({
            title: "Owner Post",
            content: "Owner Content",
            imageUrl: "images/default.jpg",
            creator: dummyUser._id,
        });

        const graphqlQuery = `
            mutation DeletePost($id: ID!) {
                deletePost(id: $id) {
                    _id
                }
            }
        `;

        const res = await request(app)
            .post("/graphql")
            .set("Authorization", `Bearer ${otherToken}`)
            .send({
                query: graphqlQuery,
                variables: { id: createdPost._id.toString() },
            });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("errors");
        expect(res.body.errors[0].message).to.equal("Not authorized to delete this post!");
    });
});

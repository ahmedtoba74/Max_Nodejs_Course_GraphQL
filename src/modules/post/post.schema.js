export const postTypeDefs = `
    type Posts {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type PostsData {
        posts: [Posts!]!
        totalItems: Int!
    }

    input CreatePostInputData {
        title: String!
        content: String!
        imageUrl: String
    }

    input UpdatePostInputData {
        id: ID!
        title: String
        content: String
        imageUrl: String
    }
`;

export const postQueries = `
    getPosts(page: Int): PostsData!
    getPost(id: ID!): Posts!
`;

export const postMutations = `
    createPost(postInput: CreatePostInputData!): Posts!
    updatePost(postInput: UpdatePostInputData!): Posts!
    deletePost(id: ID!): Posts!
`;

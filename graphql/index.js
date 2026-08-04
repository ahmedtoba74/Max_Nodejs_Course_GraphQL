import { buildSchema } from "graphql";
import {
    authTypeDefs,
    authQueries,
    authMutations,
} from "../src/modules/auth/auth.schema.js";
import { authResolvers } from "../src/modules/auth/auth.resolver.js";
import {
    userTypeDefs,
    userQueries,
    userMutations,
} from "../src/modules/user/user.schema.js";
import { userResolvers } from "../src/modules/user/user.resolver.js";
import {
    postTypeDefs,
    postQueries,
    postMutations,
} from "../src/modules/post/post.schema.js";

import { postResolvers } from "../src/modules/post/post.resolver.js";

// Combine type definitions and root schemas cleanly
export const schema = buildSchema(`

    ${authTypeDefs}
    ${userTypeDefs}
    ${postTypeDefs}

    type RootQuery {
        ${authQueries}
        ${userQueries}
        ${postQueries}
    }

    type RootMutation {
        ${authMutations}
        ${userMutations}
        ${postMutations}
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

// Combine modular resolvers
export const resolvers = {
    ...authResolvers,
    ...userResolvers,
    ...postResolvers,
};

export default { schema, resolvers };

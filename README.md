# Production-Ready Modular Node.js & GraphQL API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![GraphQL](https://img.shields.io/badge/GraphQL-v16-e535ab.svg)](https://graphql.org/)
[![Express](https://img.shields.io/badge/Express-v5-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://www.mongodb.com/)
[![Security](https://img.shields.io/badge/Security-Production--Grade-blue.svg)](#security--hardening)

A production-ready, feature-isolated, modular GraphQL API built with Node.js, Express, MongoDB (Mongoose), JWT Authentication, Winston Logging, and Enterprise Security standards.

---

## 🌟 Key Features

- **Feature-Based Modular Architecture**: Organized into self-contained feature modules (`auth`, `user`, `post`) encapsulating schemas, resolvers, services, validations, and models.
- **Dynamic GraphQL Schema Assembly**: Modular composition of type definitions, queries, mutations, and resolvers in [graphql/index.js](file:///e:/Max_Nodejs_Course_GraphQL/Max_Nodejs_Course_GraphQL/graphql/index.js).
- **Authentication & Authorization**: Bearer JWT token authentication via [src/middlewares/auth.middleware.js](file:///e:/Max_Nodejs_Course_GraphQL/Max_Nodejs_Course_GraphQL/src/middlewares/auth.middleware.js) attached to GraphQL `context`.
- **Resource Ownership Guards**: Strict creator checks ensuring users can only modify or delete their own posts.
- **Input Validation**: Centralized custom validation using `validator` with structured `422 Unprocessable Entity` error formatting.
- **Decoupled Binary Media Upload**: Specialized REST endpoint (`PUT /post-image`) for handling `multipart/form-data` uploads alongside GraphQL JSON mutations.
- **Production Error Handling & Winston Logging**: Environment-aware error responses (Development vs Production) with structured JSON logging (`logs/error.log` and `logs/combined.log`).
- **Process Guarding & Graceful Shutdown**: Handlers for `uncaughtException`, `unhandledRejection`, and `SIGTERM`.

---

## 🛡️ Security & Hardening

| Security Mechanism | Technology / Package | Purpose |
| :--- | :--- | :--- |
| **HTTP Security Headers** | `helmet` | Sets CSP, HSTS, X-Frame-Options, and X-Content-Type-Options. |
| **Query Depth Limiting** | `graphql-depth-limit` | Caps GraphQL query nesting depth to max **5 levels** to prevent DoS recursion. |
| **NoSQL & XSS Sanitization** | `perfect-express-sanitizer` | Cleans request body & inputs against NoSQL operator injection and XSS script tags. |
| **Parameter Pollution** | `hpp` | Whitelists query fields (`page`, `sort`, `limit`, `fields`) and blocks HPP attacks. |
| **Framework Masking** | `app.disable("x-powered-by")` | Strips `X-Powered-By: Express` headers to prevent server fingerprinting. |
| **Rate Limiting** | `express-rate-limit` | Limits request bursts per IP to prevent brute-force attacks. |
| **Server Overload Protection** | `toobusy-js` | Monitors event loop lag and returns `503 Service Unavailable` during high CPU spikes. |
| **Payload Size Limiting** | `express.json({ limit: "10kb" })` | Blocks oversized JSON payloads to defend against buffer overflow DoS. |
| **Dev-Only GraphQL UI** | `ruru` | Restricts GraphQL Playground UI to development environment (`process.env.NODE_ENV === "development"`). |

---

## 📂 Project Architecture

```
Max_Nodejs_Course_GraphQL/
├── graphql/
│   └── index.js                 # Central GraphQL Schema & Resolver Merger
├── images/                      # Uploaded Static Media Storage
├── logs/                        # Winston Log Output Directory
│   ├── combined.log
│   └── error.log
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB Mongoose Connection Setup
│   ├── middlewares/
│   │   ├── auth.middleware.js   # Bearer JWT Verification Guard
│   │   ├── multer.middleware.js # File Upload Config
│   │   └── validate.middleware.js
│   ├── modules/                 # Feature-Based Modules
│   │   ├── auth/
│   │   │   ├── auth.resolver.js # Auth Resolvers
│   │   │   ├── auth.schema.js   # Auth GraphQL Types, Queries, Mutations
│   │   │   ├── auth.service.js  # Auth Business Logic & JWT Generation
│   │   │   └── auth.validation.js
│   │   ├── post/
│   │   │   ├── post.model.js    # Mongoose Post Model
│   │   │   ├── post.resolver.js # Post Resolvers
│   │   │   ├── post.schema.js   # Post GraphQL Types, Queries, Mutations
│   │   │   ├── post.service.js  # Post Business Logic & Ownership Checks
│   │   │   └── post.validation.js
│   │   └── user/
│   │       ├── user.model.js    # Mongoose User Model
│   │       ├── user.resolver.js # User Resolvers
│   │       ├── user.schema.js   # User GraphQL Types, Queries, Mutations
│   │       ├── user.service.js  # User Business Logic
│   │       └── user.validation.js
│   └── utils/
│       ├── apiFeatures.js       # Filtering, Sorting, Pagination Helper
│       ├── appError.js          # Custom Operational Error Class
│       ├── catchAsync.js        # Async Error Handler Wrapper
│       ├── clearImage.js        # File System Deletion Utility
│       ├── cookies.js           # Secure Cookie Config
│       ├── errorHandler.js      # Centralized REST & GraphQL Error Formatter
│       ├── jwtHelper.js        # JWT Signing & Verification Utility
│       └── logger.js           # Winston Production Logger
├── .env                         # Environment Variables
├── .gitignore
├── app.js                       # Express Middleware Pipeline & Security Setup
├── package.json
├── README.md                    # Project Documentation
└── server.js                    # Server Bootstrapper & Process Guards
```

---

## 📑 API Reference

### 1. GraphQL Endpoint: `POST /graphql`

#### Auth Queries & Mutations
```graphql
# Login
query Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    userId
  }
}

# Create User (Signup)
mutation CreateUser($userInput: UserInputData!) {
  createUser(userInput: $userInput) {
    _id
    name
    email
  }
}

# Logout
mutation Logout {
  logout
}
```

#### User Queries & Mutations
```graphql
# Get Authenticated User
query GetUser {
  getUser {
    _id
    name
    email
    status
  }
}

# Update User Status / Profile
mutation UpdateUser($userInput: UpdateUserInputData!) {
  updateUser(userInput: $userInput) {
    _id
    name
    status
  }
}
```

#### Post Queries & Mutations
```graphql
# Get Paginated Posts
query GetPosts($page: Int) {
  getPosts(page: $page) {
    posts {
      _id
      title
      content
      imageUrl
      createdAt
      creator {
        _id
        name
        email
        status
      }
    }
    totalItems
  }
}

# Get Single Post by ID
query GetPost($id: ID!) {
  getPost(id: $id) {
    _id
    title
    content
    imageUrl
    createdAt
    creator {
      name
      email
      status
    }
  }
}

# Create Post
mutation CreatePost($postInput: CreatePostInputData!) {
  createPost(postInput: $postInput) {
    _id
    title
    content
    imageUrl
    createdAt
  }
}

# Update Post (Owner Only)
mutation UpdatePost($postInput: UpdatePostInputData!) {
  updatePost(postInput: $postInput) {
    _id
    title
    content
    imageUrl
  }
}

# Delete Post (Owner Only)
mutation DeletePost($id: ID!) {
  deletePost(id: $id) {
    _id
  }
}
```

---

### 2. REST Endpoint: `PUT /post-image`

- **URL**: `PUT /post-image`
- **Headers**: `Authorization: Bearer <TOKEN>`
- **Body**: `multipart/form-data` (`image`: file, `oldPath`: optional string)
- **Response**:
```json
{
  "message": "File stored.",
  "filePath": "images/1722741234567-image.png"
}
```

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in the root directory:

```env
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://<username>:<db_password>@cluster0.mongodb.net/database_name?retryWrites=true&w=majority
MONGODB_PASSWORD=your_mongodb_password

# Authentication & Security
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
COOKIE_EXPIRES_IN=7
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Cloud Atlas or Local)

### 2. Installation
```bash
# Clone repository
git clone <repository-url>
cd Max_Nodejs_Course_GraphQL

# Install dependencies
npm install
```

### 3. Running the Server

#### Development Mode (With Auto-Reload & GraphQL Playground)
```bash
npm start
```
- Server: `http://localhost:8000`
- GraphQL Playground UI: `http://localhost:8000/graphql`

---

## 📝 License
This project is open-source and available under the [ISC License](LICENSE).

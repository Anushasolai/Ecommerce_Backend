"use strict";
// import express from "express";
// import { ApolloServer } from "apollo-server-express";
// import { typeDefs } from "./graphql/schema";
// import { resolvers } from "./graphql/resolvers";
// import { AppSource } from "./config/ormconfig";
// import cors from "cors";
// import { Server } from "http";
// import dotenv from "dotenv";
// import { checkConnection } from ".";
// import { Product } from "./entities/ProductEntity";
// import { User } from "./entities/UserEntity";
// import { Cart } from "./entities/CartEntity";
// import { CartItem } from "./entities/CartItemEntity"; // Assuming you have this entity as well
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopServer = exports.startServer = void 0;
// dotenv.config();
// const app = express();
// // Middleware setup
// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:5173", // Update this if needed
//     methods: "GET,POST",
//     // allowedHeaders: "Content-Type",
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );
// const server = new ApolloServer({
//   typeDefs,
//   resolvers,
//   context: async () => {
//     if (!AppSource.isInitialized) {
//       await AppSource.initialize();
//     }
//     const productRepository = AppSource.getRepository(Product);
//     const userRepository = AppSource.getRepository(User);
//     const cartRepository = AppSource.getRepository(Cart); // Assuming you have a Cart entity
//     const cartItemRepository = AppSource.getRepository(CartItem); // Assuming you have a CartItem entity
//     return {
//       productRepository,
//       userRepository,
//       cartRepository,
//       cartItemRepository,
//     };
//   },
//   formatError: (err) => {
//     // Custom error format to provide more clarity during development
//     console.error("GraphQL Error:", err);
//     return {
//       message: err.message,
//       code: err.extensions?.code || "INTERNAL_SERVER_ERROR",
//       path: err.path,
//       locations: err.locations,
//     };
//   },
// });
// // Variables to handle server instances
// let serverInstance: Server | null = null;
// export const startServer = async () => {
//   if (serverInstance) {
//     console.log("Server is already running");
//     throw new Error("Server is already running");
//   }
//   try {
//     // Start Apollo Server
//     await server.start();
//     // Apply Apollo middleware to Express app
//     server.applyMiddleware({ app: app as any, path: "/graphql" });
//     const PORT = process.env.PORT || 4000;
//     serverInstance = app.listen(PORT, () => {
//       console.log(
//         `Server is running on http://localhost:${PORT}${server.graphqlPath}`
//       );
//       checkConnection(); // Custom function to verify the database connection
//     });
//     return serverInstance;
//   } catch (err) {
//     console.error("Failed to start server:", err);
//     throw new Error("Failed to start server");
//   }
// };
// // Graceful shutdown of the server
// export const stopServer = async () => {
//   if (serverInstance) {
//     return new Promise<void>((resolve, reject) => {
//       serverInstance?.close((err: Error | undefined) => {
//         if (err) {
//           reject(err);
//         } else {
//           console.log("Server stopped successfully");
//           serverInstance = null;
//           resolve();
//         }
//       });
//     });
//   } else {
//     return Promise.resolve();
//   }
// };
// // Automatically start the server if this script is executed directly
// if (require.main === module) {
//   startServer().catch((err) => {
//     console.error("Failed to start server:", err);
//     process.exit(1);
//   });
// }
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const schema_1 = require("./graphql/schema");
const resolvers_1 = require("./graphql/resolvers");
const ormconfig_1 = require("./config/ormconfig");
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const _1 = require(".");
const ProductEntity_1 = require("./entities/ProductEntity");
const UserEntity_1 = require("./entities/UserEntity");
const CartEntity_1 = require("./entities/CartEntity");
const CartItemEntity_1 = require("./entities/CartItemEntity"); // Assuming you have this entity as well
const authenticateToken_1 = __importDefault(require("./middleware/authenticateToken"));
const jwtmiddleware_1 = require("./graphql/jwtmiddleware"); // Corrected import path
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware setup
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: "GET,POST",
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Apply the authenticateToken middleware to secure routes
app.use('/secure-route', authenticateToken_1.default, (req, res) => {
    var _a;
    // Make sure req.user is of type User
    res.send(`Hello ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.userId}`);
});
// Optional: Apply the middleware to the GraphQL endpoint (if needed)
app.use('/graphql', authenticateToken_1.default);
// Apollo Server setup
const server = new apollo_server_express_1.ApolloServer({
    typeDefs: schema_1.typeDefs,
    resolvers: resolvers_1.resolvers,
    context: async ({ req }) => {
        var _a;
        const token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]) || "";
        try {
            // Verify the token using the verifyToken function
            const verifiedUser = (0, jwtmiddleware_1.verifyToken)(token);
            if (!ormconfig_1.AppSource.isInitialized) {
                await ormconfig_1.AppSource.initialize();
            }
            const productRepository = ormconfig_1.AppSource.getRepository(ProductEntity_1.Product);
            const userRepository = ormconfig_1.AppSource.getRepository(UserEntity_1.User);
            const cartRepository = ormconfig_1.AppSource.getRepository(CartEntity_1.Cart);
            const cartItemRepository = ormconfig_1.AppSource.getRepository(CartItemEntity_1.CartItem);
            return {
                productRepository,
                userRepository,
                cartRepository,
                cartItemRepository,
                user: verifiedUser, // Pass the authenticated user to the context
            };
        }
        catch (error) {
            throw new Error("Authentication error: Invalid or expired token");
        }
    },
    formatError: (err) => {
        var _a;
        console.error("GraphQL Error:", err);
        return {
            message: err.message,
            code: ((_a = err.extensions) === null || _a === void 0 ? void 0 : _a.code) || "INTERNAL_SERVER_ERROR",
            path: err.path,
            locations: err.locations,
        };
    },
});
// Variables to handle server instances
let serverInstance = null;
const startServer = async () => {
    if (serverInstance) {
        console.log("Server is already running");
        throw new Error("Server is already running");
    }
    try {
        await server.start();
        server.applyMiddleware({ app: app, path: "/graphql" });
        const PORT = process.env.PORT || 4000;
        serverInstance = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}${server.graphqlPath}`);
            (0, _1.checkConnection)(); // Custom function to verify the database connection
        });
        return serverInstance;
    }
    catch (err) {
        console.error("Failed to start server:", err);
        throw new Error("Failed to start server");
    }
};
exports.startServer = startServer;
// Graceful shutdown of the server
const stopServer = async () => {
    if (serverInstance) {
        return new Promise((resolve, reject) => {
            serverInstance === null || serverInstance === void 0 ? void 0 : serverInstance.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log("Server stopped successfully");
                    serverInstance = null;
                    resolve();
                }
            });
        });
    }
    else {
        return Promise.resolve();
    }
};
exports.stopServer = stopServer;
// Automatically start the server if this script is executed directly
if (require.main === module) {
    (0, exports.startServer)().catch((err) => {
        console.error("Failed to start server:", err);
        process.exit(1);
    });
}
//# sourceMappingURL=app.js.map
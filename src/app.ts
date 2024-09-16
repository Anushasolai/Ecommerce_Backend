import express from "express";
import { ApolloServer } from "apollo-server-express";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { AppSource } from "./config/ormconfig";
import cors from "cors";
import { Server } from "http";
import dotenv from "dotenv";
import { checkConnection } from ".";
import { Product } from "./entities/ProductEntity";

dotenv.config();

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST",
    allowedHeaders: "Content-Type",
  })
);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => {
    if (!AppSource.isInitialized) {
      await AppSource.initialize();
    }
    const productRepository = AppSource.getRepository(Product);
    return { productRepository };
  },
});

let serverInstance: Server | null = null;

export const startServer = async () => {
  if (serverInstance) {
    console.log("Server is already running");
    throw new Error("Server is already running");
  }

  await server.start();
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  const PORT = process.env.PORT || 4000;
  serverInstance = app.listen(PORT, () => {
    console.log(
      `Server is running on http://localhost:${PORT}${server.graphqlPath}`
    );
    checkConnection();
  });

  return serverInstance;
};

export const stopServer = async () => {
  if (serverInstance) {
    return new Promise<void>((resolve, reject) => {
      serverInstance?.close((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          console.log("Server stopped successfully");
          serverInstance = null;
          resolve();
        }
      });
    });
  } else {
    return Promise.resolve();
  }
};

if (require.main === module) {
  startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

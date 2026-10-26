import "dotenv/config";

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "node:http";
import { GraphQLError } from "graphql";

import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { createContext } from "./middleware/auth.js";

const PORT = Number(process.env.PORT || 4000);
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

async function startServer() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required in .env");
  }

  if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured with at least 32 characters."
    );
  }

  await mongoose.connect(MONGODB_URI);

  console.log("Connected to MongoDB");

  const app = express();
  const httpServer = http.createServer(app);

  app.disable("x-powered-by");

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      database: mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    });
  });

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,

    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
    ],

    formatError(formattedError) {
      // Do not expose unexpected internal server errors to clients.
      if (
        formattedError.extensions?.code === "INTERNAL_SERVER_ERROR"
      ) {
        return {
          message: "An unexpected server error occurred.",
          extensions: {
            code: "INTERNAL_SERVER_ERROR",
          },
        };
      }

      return formattedError;
    },
  });

  await apolloServer.start();

  app.use(
    "/graphql",
    cors({
      origin: CLIENT_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
    express.json({ limit: "1mb" }),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => createContext({ req }),
    })
  );

  await new Promise((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(PORT, "0.0.0.0", resolve);
  });

  console.log(`GraphQL API: http://localhost:${PORT}/graphql`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  async function shutdown() {
    console.log("Shutting down server...");

    await apolloServer.stop();
    await mongoose.disconnect();

    process.exit(0);
  }

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
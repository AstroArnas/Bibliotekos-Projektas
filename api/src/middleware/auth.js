import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import User from "../models/User.js";

export function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
      issuer: "library-api",
    }
  );
}

export async function createContext({ req }) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (!token || scheme?.toLowerCase() !== "bearer") {
    return { user: null };
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "library-api",
    });

    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      return { user: null };
    }

    return { user };
  } catch {
    // An invalid or expired token does not authenticate the request.
    return { user: null };
  }
}

export function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError("You must be logged in.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.user;
}

export function requireRole(context, ...roles) {
  const user = requireAuth(context);

  if (!roles.includes(user.role)) {
    throw new GraphQLError("You do not have permission.", {
      extensions: { code: "FORBIDDEN" },
    });
  }

  return user;
}

export function requireObjectId(id, field = "id") {
  // Accept only valid 24-character hexadecimal MongoDB ObjectIds.
  if (
    typeof id !== "string" ||
    !/^[a-f\d]{24}$/i.test(id)
  ) {
    throw new GraphQLError(`Invalid ${field}.`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }

  return id;
}
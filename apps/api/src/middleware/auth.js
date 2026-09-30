import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const cookieName = "almost_session";

export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export function issueSession(response, user) {
  const token = jwt.sign(
    { ver: user.sessionVersion ?? 0 },
    process.env.AUTH_SECRET,
    {
      subject: String(user._id),
      expiresIn: "7d",
      algorithm: "HS256",
      issuer: "almost",
      audience: "almost-web",
    },
  );

  response.cookie(cookieName, token, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function requireAuth(request, response, next) {
  let claims;

  try {
    claims = jwt.verify(
      request.cookies[cookieName] || "",
      process.env.AUTH_SECRET,
      {
        algorithms: ["HS256"],
        issuer: "almost",
        audience: "almost-web",
      },
    );

    if (!/^[a-f0-9]{24}$/i.test(claims.sub)) {
      throw new Error("Invalid subject");
    }
  } catch {
    return response.status(401).json({
      message: "Please log in to continue.",
    });
  }

  try {
    const user = await User.findById(claims.sub).select(
      "+sessionVersion",
    );

    if (!user || user.sessionVersion !== claims.ver) {
      return response.status(401).json({
        message: "Your session has expired. Please log in.",
      });
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
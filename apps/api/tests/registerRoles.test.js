import { after, test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "../src/routes/authRoutes.js";
import User from "../src/models/User.js";

process.env.APP_URL = "http://localhost:5173";
process.env.AUTH_SECRET = "test-only-secret-not-for-production-12345";
const saved = [];
User.create = async ({ name, email, role, passwordHash }) => {
  const item = { _id: new mongoose.Types.ObjectId(), name, email, role, passwordHash, sessionVersion: 0 };
  saved.push(item);
  return item;
};
User.findById = (id) => ({ select: async () => saved.find((u) => String(u._id) === String(id)) });
const app = express(); app.use(express.json()); app.use(cookieParser()); app.use("/api/auth", authRoutes);
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
after(() => new Promise((resolve) => server.close(resolve)));
const root = `http://127.0.0.1:${server.address().port}`;
async function register(role) {
  const res = await fetch(root + "/api/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: process.env.APP_URL, "X-Almost-Request": "1" },
    body: JSON.stringify({ name: "Example", email: `${role || "missing"}@example.com`, password: "long-demo-password-1234", ...(role ? { role } : {}) }),
  });
  return { status: res.status, body: await res.json(), cookie: res.headers.get("set-cookie") };
}
test("registration persists selected student/teacher role and rejects privilege strings", async () => {
  const invalid = await register("admin");
  assert.equal(invalid.status, 400); assert.equal(saved.length, 0);
  const missing = await register();
  assert.equal(missing.status, 400); assert.equal(saved.length, 0);
  for (const role of ["student", "teacher"]) {
    const result = await register(role);
    assert.equal(result.status, 201);
    assert.equal(result.body.user.role, role);
    assert.equal(saved.at(-1).role, role);
    assert.ok(result.cookie.startsWith("almost_session="));
    const me = await fetch(root + "/api/auth/me", { headers: { Cookie: result.cookie.split(";")[0] } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).user.role, role);
  }
});

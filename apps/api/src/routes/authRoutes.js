import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { rateLimit } from "express-rate-limit";
import User from "../models/User.js";
import { requireAuth, issueSession, publicUser, cookieName, cookieOptions } from "../middleware/auth.js";

const router = Router();
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const normalizeEmail = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const validEmail = (value) => value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPassword = (value) => typeof value === "string" && value.length >= 12 && Buffer.byteLength(value, "utf8") <= 72;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");
const passwordMessage = "Use at least 12 characters and at most 72 UTF-8 bytes for your password.";
const dummyHash = bcrypt.hashSync(randomBytes(32).toString("hex"), 12);
const limit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many requests. Please try again in 15 minutes." } });
const resetLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many reset requests. Please try again later." } });
router.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
// Same-origin browser writes only; all frontend POST requests set this header.
router.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const allowedOrigin = new URL(process.env.APP_URL).origin;
  if (req.get("Origin") !== allowedOrigin || req.get("X-Almost-Request") !== "1" || !req.is("application/json")) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  next();
});
router.post("/register", limit, run(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const password = req.body?.password;
  const role = req.body?.role;
  if (role !== "student" && role !== "teacher") return res.status(400).json({ message: "Choose Student or Teacher." });
  if (!name || name.length > 80 || !validEmail(email)) return res.status(400).json({ message: "Enter a name (up to 80 characters) and a valid email." });
  if (!validPassword(password)) return res.status(400).json({ message: passwordMessage });
  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try { user = await User.create({ name, email, passwordHash, role }); }
  catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Unable to register with this email. Try logging in or resetting your password." });
    throw error;
  }
  issueSession(res, user);
  res.status(201).json({ user: publicUser(user) });
}));
router.post("/login", limit, run(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  if (!validEmail(email) || typeof password !== "string" || Buffer.byteLength(password) > 72) return res.status(401).json({ message: "Email or password is incorrect." });
  const user = await User.findOne({ email }).select("+passwordHash +sessionVersion");
  const matches = await bcrypt.compare(password, user?.passwordHash || dummyHash);
  if (!user || !matches) return res.status(401).json({ message: "Email or password is incorrect." });
  issueSession(res, user);
  res.json({ user: publicUser(user) });
}));
router.get("/me", requireAuth, (req, res) => res.json({ user: publicUser(req.user) }));
router.post("/logout", run(async (req, res) => {
  // Clear this browser's cookie. Password reset revokes all sessions.
  res.clearCookie(cookieName, cookieOptions());
  res.json({ message: "Logged out." });
}));
router.post("/forgot-password", resetLimit, run(async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!validEmail(email)) return res.status(400).json({ message: "Enter a valid email." });
  if (!process.env.SMTP_HOST || !process.env.MAIL_FROM) return res.status(503).json({ message: "Password reset email is not configured yet." });
  const user = await User.findOne({ email });
  if (user) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    await User.updateOne({ _id: user._id }, { $set: { resetTokenHash: tokenHash, resetExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    const url = new URL("/reset-password", process.env.APP_URL);
    url.hash = `token=${token}`;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } : {}),
      connectionTimeout: 10000, socketTimeout: 15000,
    });
    try {
      await transport.sendMail({ from: process.env.MAIL_FROM, to: email,
        subject: "Reset your Almost password",
        text: `Open this link to choose a new password:\n${url.href}\n\nThis link expires in 30 minutes and can be used once. If you did not request it, ignore this email.`,
      });
    } catch {
      await User.updateOne({ _id: user._id, resetTokenHash: tokenHash }, { $unset: { resetTokenHash: 1, resetExpiresAt: 1 } });
      // Do not expose whether the account exists or log the secret reset link.
      console.error("Password reset mail delivery failed.");
    }
  }
  res.json({ message: "If this email is registered, you will receive a reset link. Check your inbox and spam folder." });
}));
router.post("/reset-password", limit, run(async (req, res) => {
  const { token, password } = req.body || {};
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({ message: "This reset link is invalid or expired." });
  if (!validPassword(password)) return res.status(400).json({ message: passwordMessage });
  const resetTokenHash = hashToken(token);
  const eligible = await User.exists({ resetTokenHash, resetExpiresAt: { $gt: new Date() } });
  if (!eligible) return res.status(400).json({ message: "This reset link is invalid or expired." });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.findOneAndUpdate({ resetTokenHash, resetExpiresAt: { $gt: new Date() } }, {
    $set: { passwordHash }, $inc: { sessionVersion: 1 }, $unset: { resetTokenHash: 1, resetExpiresAt: 1 },
  }, { new: true });
  if (!user) return res.status(400).json({ message: "This reset link is invalid or expired." });
  res.clearCookie(cookieName, cookieOptions());
  res.json({ message: "Password updated. Log in with your new password." });
}));
export default router;

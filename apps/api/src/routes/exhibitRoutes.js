import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import Exhibit from "../models/Exhibit.js";
import Attempt from "../models/Attempt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const run = (handler) => (req, res, next) => Promise.resolve(handler(req, res)).catch(next);
const feedbackFields = "+correctOptionId +correctOptionText +explanation +selectedOptionFeedback";
const submitLimit = rateLimit({
  windowMs: 60 * 1000, limit: 30, standardHeaders: "draft-7", legacyHeaders: false,
  message: { message: "Too many submissions. Please wait a minute." },
});

function noStore(_req, res, next) { res.set("Cache-Control", "no-store"); next(); }
function safeWrite(req, res, next) {
  if (req.get("Origin") !== new URL(process.env.APP_URL).origin ||
      req.get("X-Almost-Request") !== "1" || !req.is("application/json")) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  next();
}
function attemptKey(user, exhibit) {
  return { user: user._id, exhibit: exhibit._id, exhibitVersion: exhibit.version };
}
function resultOf(attempt) {
  return {
    selectedOptionId: attempt.selectedOptionId,
    reasoning: attempt.reasoning,
    isCorrect: attempt.isCorrect,
    submittedAt: attempt.submittedAt,
    exhibitVersion: attempt.exhibitVersion,
    correctOptionId: attempt.correctOptionId,
    correctOptionText: attempt.correctOptionText,
    explanation: attempt.explanation,
    selectedOptionFeedback: attempt.selectedOptionFeedback || null,
  };
}

router.get("/:slug", run(async (req, res) => {
  const exhibit = await Exhibit.findOne({ slug: req.params.slug, status: "published" })
    .select("slug roomSlug version number topic title question incorrectAnswer options.id options.text -_id").lean();
  if (!exhibit) return res.status(404).json({ message: "Exhibit not found." });
  res.json({ exhibit });
}));

router.get("/:slug/attempt", noStore, requireAuth, run(async (req, res) => {
  const exhibit = await Exhibit.findOne({ slug: req.params.slug, status: "published" })
    .select("_id version").lean();
  if (!exhibit) return res.status(404).json({ message: "Exhibit not found." });
  const attempt = await Attempt.findOne(attemptKey(req.user, exhibit)).select(feedbackFields).lean();
  // No attempt: no correct answer or explanation is returned.
  res.json({ attempt: attempt ? resultOf(attempt) : null });
}));

router.post("/:slug/attempt", noStore, safeWrite, requireAuth, submitLimit, run(async (req, res) => {
  if (req.user.role !== "student") return res.status(403).json({ message: "Only student accounts can submit learning attempts." });
  const body = req.body;
  const allowed = ["selectedOptionId", "reasoning", "exhibitVersion"];
  if (!body || Array.isArray(body) || Object.keys(body).some((key) => !allowed.includes(key))) {
    return res.status(400).json({ message: "Invalid attempt fields." });
  }
  const { selectedOptionId, exhibitVersion } = body;
  const reasoning = body.reasoning ?? "";
  if (typeof selectedOptionId !== "string" || !selectedOptionId || selectedOptionId.length > 100 ||
      typeof reasoning !== "string" || reasoning.length > 1000 ||
      !Number.isInteger(exhibitVersion) || exhibitVersion < 1) {
    return res.status(400).json({ message: "Choose an answer and keep your reasoning under 1,001 characters." });
  }
  const exhibit = await Exhibit.findOne({ slug: req.params.slug, status: "published" })
    .select("_id version options +correctOptionId +explanation").lean();
  if (!exhibit) return res.status(404).json({ message: "Exhibit not found." });
  if (exhibit.version !== exhibitVersion) return res.status(409).json({ message: "This exhibit has changed. Refresh the page before answering." });
  if (!exhibit.options.some((option) => option.id === selectedOptionId)) {
    return res.status(400).json({ message: "Choose one of this exhibit's answer options." });
  }
  const correctOption = exhibit.options.find((option) => option.id === exhibit.correctOptionId);
  const selectedOption = exhibit.options.find((option) => option.id === selectedOptionId);
  if (!correctOption || !exhibit.explanation) return res.status(409).json({ message: "This challenge is not ready for submissions." });

  // This unique index is also provisioned by setupAttemptIndexes.js.
  await Attempt.init();
  const key = attemptKey(req.user, exhibit);
  const existing = await Attempt.findOne(key).select(feedbackFields).lean();
  if (existing) return res.json({ attempt: resultOf(existing), alreadySubmitted: true });

  try {
    const attempt = await Attempt.create({
      ...key, selectedOptionId, reasoning: reasoning.trim(),
      isCorrect: selectedOptionId === exhibit.correctOptionId,
      correctOptionId: correctOption.id, correctOptionText: correctOption.text,
      explanation: exhibit.explanation,
      selectedOptionFeedback: selectedOption.feedback || "",
    });
    res.status(201).json({ attempt: resultOf(attempt), alreadySubmitted: false });
  } catch (error) {
    if (error.code !== 11000) throw error;
    // Concurrent duplicate: return the winning first attempt, never overwrite it.
    const first = await Attempt.findOne(key).select(feedbackFields).lean();
    if (!first) throw error;
    res.json({ attempt: resultOf(first), alreadySubmitted: true });
  }
}));
export default router;
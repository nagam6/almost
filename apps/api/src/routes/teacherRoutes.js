import { Router } from "express";
import { randomUUID } from "node:crypto";
import Exhibit from "../models/Exhibit.js";
import Room from "../models/Room.js";
import Attempt from "../models/Attempt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const run = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res)).catch(next);
const privateFields = "+correctOptionId +explanation";
const fail = (status, message) =>
  Object.assign(new Error(message), { status });

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
router.use(requireAuth);
router.use((req, res, next) => {
  if (req.user.role !== "teacher") {
    return res.status(403).json({ message: "Teacher access is required." });
  }
  if (
    !["GET", "HEAD"].includes(req.method) &&
    (req.get("Origin") !== new URL(process.env.APP_URL).origin ||
      req.get("X-Almost-Request") !== "1" ||
      !req.is("application/json"))
  ) {
    return res.status(403).json({ message: "Request origin is not allowed." });
  }
  next();
});

function plainBody(body, keys) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !keys.includes(key))
  ) {
    throw fail(400, "Invalid request fields.");
  }
}

function revision(body) {
  if (!Number.isInteger(body.revision) || body.revision < 0) {
    throw fail(400, "A valid revision is required.");
  }
}

function content(body) {
  plainBody(body, [
    "roomSlug",
    "number",
    "topic",
    "title",
    "question",
    "incorrectAnswer",
    "options",
    "correctOptionId",
    "explanation",
    "revision",
  ]);

  const result = {};
  for (const [key, max] of Object.entries({
    roomSlug: 100,
    topic: 100,
    title: 160,
    question: 2000,
    incorrectAnswer: 2000,
    explanation: 3000,
    correctOptionId: 20,
  })) {
    if (
      typeof body[key] !== "string" ||
      !body[key].trim() ||
      body[key].length > max
    ) {
      throw fail(400, `${key} is required (maximum ${max} characters).`);
    }
    result[key] = body[key].trim();
  }

  if (
    !Number.isInteger(body.number) ||
    body.number < 1 ||
    body.number > 9999
  ) {
    throw fail(400, "Exhibit number must be between 1 and 9999.");
  }
  result.number = body.number;

  if (
    !Array.isArray(body.options) ||
    body.options.length < 2 ||
    body.options.length > 6
  ) {
    throw fail(400, "Provide 2–6 answer choices.");
  }

  result.options = body.options.map((option) => {
    plainBody(option, ["id", "text", "feedback"]);
    if (
      typeof option.id !== "string" ||
      !/^[a-z0-9-]{1,20}$/.test(option.id) ||
      typeof option.text !== "string" ||
      !option.text.trim() ||
      option.text.length > 500 ||
      typeof option.feedback !== "string" ||
      !option.feedback.trim() ||
      option.feedback.length > 600
    ) {
      throw fail(
        400,
        "Each option needs a valid ID, text (max 500) and feedback (max 600)."
      );
    }
    return {
      id: option.id,
      text: option.text.trim(),
      feedback: option.feedback.trim(),
    };
  });

  if (
    new Set(result.options.map((option) => option.id)).size !==
      result.options.length ||
    !result.options.some((option) => option.id === result.correctOptionId)
  ) {
    throw fail(
      400,
      "Choose exactly one valid correct option; option IDs must be unique."
    );
  }

  return result;
}

function teacherView(doc) {
  return {
    slug: doc.slug,
    roomSlug: doc.roomSlug,
    number: doc.number,
    topic: doc.topic,
    title: doc.title,
    question: doc.question,
    incorrectAnswer: doc.incorrectAnswer,
    options: doc.options,
    correctOptionId: doc.correctOptionId,
    explanation: doc.explanation,
    status: doc.status,
    version: doc.version,
    revision: doc.__v ?? 0,
    updatedAt: doc.updatedAt,
  };
}

async function owned(req) {
  const doc = await Exhibit.findOne({
    slug: req.params.slug,
    owner: req.user._id,
  }).select(privateFields);

  if (!doc) throw fail(404, "Exhibit not found.");
  return doc;
}

async function validRoom(slug) {
  if (!(await Room.exists({ slug }))) {
    throw fail(400, "Choose an existing museum room.");
  }
}

router.get(
  "/summary",
  run(async (req, res) => {
    const [states, totals] = await Promise.all([
      Exhibit.aggregate([
        { $match: { owner: req.user._id } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Exhibit.aggregate([
        { $match: { owner: req.user._id } },
        {
          $lookup: {
            from: Attempt.collection.name,
            let: { exhibitId: "$_id", version: "$version" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$exhibit", "$$exhibitId"] },
                      { $eq: ["$exhibitVersion", "$$version"] },
                      { $ne: ["$user", req.user._id] },
                    ],
                  },
                },
              },
              { $project: { user: 1, isCorrect: 1 } },
            ],
            as: "attempts",
          },
        },
        { $unwind: "$attempts" },
        {
          $group: {
            _id: "$attempts.user",
            attempts: { $sum: 1 },
            correct: {
              $sum: { $cond: ["$attempts.isCorrect", 1, 0] },
            },
          },
        },
        {
          $group: {
            _id: null,
            learners: { $sum: 1 },
            attempts: { $sum: "$attempts" },
            correct: { $sum: "$correct" },
          },
        },
      ]),
    ]);

    const total = totals[0] || {
      learners: 0,
      attempts: 0,
      correct: 0,
    };

    res.json({
      summary: {
        learners: total.learners,
        attempts: total.attempts,
        correct: total.correct,
        accuracy: total.attempts
          ? Math.round((total.correct / total.attempts) * 100)
          : null,
        states: Object.fromEntries(
          states.map((state) => [state._id, state.count])
        ),
      },
    });
  })
);

router.get(
  "/exhibits",
  run(async (req, res) => {
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1 || page > 10000) {
      throw fail(400, "Invalid page.");
    }

    const filter = { owner: req.user._id };
    const [items, total] = await Promise.all([
      Exhibit.find(filter)
        .select("slug title topic status roomSlug updatedAt")
        .sort({ updatedAt: -1, _id: -1 })
        .skip((page - 1) * 20)
        .limit(20)
        .lean(),
      Exhibit.countDocuments(filter),
    ]);

    res.json({
      exhibits: items.map(({ _id, ...item }) => item),
      page,
      total,
      pages: Math.max(1, Math.ceil(total / 20)),
    });
  })
);

router.post(
  "/exhibits",
  run(async (req, res) => {
    const values = content(req.body);
    await validRoom(values.roomSlug);

    const doc = await Exhibit.create({
      ...values,
      owner: req.user._id,
      slug: `exhibit-${randomUUID()}`,
      status: "draft",
    });

    res.status(201).json({ exhibit: teacherView(doc) });
  })
);

router.get(
  "/exhibits/:slug",
  run(async (req, res) => {
    res.json({ exhibit: teacherView(await owned(req)) });
  })
);

router.put(
  "/exhibits/:slug",
  run(async (req, res) => {
    const values = content(req.body);
    revision(req.body);
    const doc = await owned(req);

    if (doc.status !== "draft") {
      throw fail(
        409,
        "Only drafts can be edited. Published content stays unchanged."
      );
    }

    await validRoom(values.roomSlug);

    // Validate the full document so the correct answer matches an option.
    doc.set(values);
    await doc.validate();

    const changed = await Exhibit.findOneAndUpdate(
      {
        _id: doc._id,
        owner: req.user._id,
        status: "draft",
        __v: req.body.revision,
      },
      { $set: values, $inc: { __v: 1 } },
      { new: true }
    ).select(privateFields);

    if (!changed) {
      throw fail(
        409,
        "This draft changed in another tab. Reload before editing again."
      );
    }

    res.json({ exhibit: teacherView(changed) });
  })
);

router.delete(
  "/exhibits/:slug",
  run(async (req, res) => {
    plainBody(req.body, ["revision"]);
    revision(req.body);
    const doc = await owned(req);

    if (doc.status !== "draft") {
      throw fail(
        409,
        "Only drafts can be deleted. Archive published exhibits instead."
      );
    }

    if (await Attempt.exists({ exhibit: doc._id })) {
      throw fail(
        409,
        "This exhibit has learner attempts and cannot be deleted."
      );
    }

    const deleted = await Exhibit.findOneAndDelete({
      _id: doc._id,
      owner: req.user._id,
      status: "draft",
      __v: req.body.revision,
    });

    if (!deleted) {
      throw fail(
        409,
        "This draft changed in another tab. Reload before deleting it."
      );
    }

    res.json({ message: "Draft deleted." });
  })
);

router.post(
  "/exhibits/:slug/:action",
  run(async (req, res) => {
    const transitions = {
      publish: { from: "draft", to: "published" },
      archive: { from: "published", to: "archived" },
      restore: { from: "archived", to: "published" },
    };

    const transition = transitions[req.params.action];
    if (!transition) throw fail(404, "Action not found.");

    plainBody(req.body, ["revision"]);
    revision(req.body);
    const doc = await owned(req);
    const { from, to } = transition;

    if (doc.status !== from) {
      throw fail(409, `Only ${from} exhibits support this action.`);
    }

    if (to === "published") {
      await validRoom(doc.roomSlug);
      await doc.validate();
    }

    const changed = await Exhibit.findOneAndUpdate(
      {
        _id: doc._id,
        owner: req.user._id,
        status: from,
        __v: req.body.revision,
      },
      { $set: { status: to }, $inc: { __v: 1 } },
      { new: true }
    ).select(privateFields);

    if (!changed) {
      throw fail(
        409,
        "This exhibit changed in another tab. Reload to see its latest state."
      );
    }

    res.json({ exhibit: teacherView(changed) });
  })
);

router.get(
  "/exhibits/:slug/stats",
  run(async (req, res) => {
    const doc = await owned(req);
    const groups = await Attempt.aggregate([
      {
        $match: {
          exhibit: doc._id,
          exhibitVersion: doc.version,
          user: { $ne: req.user._id },
        },
      },
      {
        $group: {
          _id: "$selectedOptionId",
          count: { $sum: 1 },
        },
      },
    ]);

    const counts = new Map(
      groups.map((group) => [group._id, group.count])
    );
    const total = groups.reduce(
      (sum, group) => sum + group.count,
      0
    );
    const correct = counts.get(doc.correctOptionId) ?? 0;

    res.json({
      stats: {
        total,
        correct,
        accuracy: total
          ? Math.round((correct / total) * 100)
          : null,
        version: doc.version,
        options: doc.options.map((option) => ({
          id: option.id,
          text: option.text,
          count: counts.get(option.id) ?? 0,
          isCorrect: option.id === doc.correctOptionId,
        })),
      },
    });
  })
);

router.use((error, _req, res, next) => {
  if ([400, 404, 409].includes(error.status)) {
    return res.status(error.status).json({
      message: error.message,
    });
  }
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Complete all exhibit fields with valid values.",
    });
  }
  next(error);
});

export default router;
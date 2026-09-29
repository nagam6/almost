import {
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const generationLimit = rateLimit({
  windowMs: 60_000,
  limit: 6,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const answerLimit = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const recentByUser = new Map();

function build(kind, variant = 0) {
  const examples = {
    age: {
      title: "The age boundary",
      context: `A club allows people who are ${variant} or older, but the code excludes someone who just turned ${variant}.`,
      question: `Why does age ${variant} fail?`,
      wrongCode: `function canJoin(age) {\n  return age > ${variant};\n}`,
      correctCode: `function canJoin(age) {\n  return age >= ${variant};\n}`,
      wrongLine: `return age > ${variant};`,
      correctLine: `return age >= ${variant};`,
      choices: [
        `The comparison excludes age ${variant} itself.`,
        "Age should be a string.",
        "The function needs console.log.",
      ],
      explanation: `> excludes the boundary age ${variant}. >= includes it.`,
      hint: `Test the exact boundary: ${variant}.`,
    },

    last_item: {
      title: "One index too far",
      context:
        "A list of scores has entries, but the function returns undefined instead of the last score.",
      question: "Which index is the last item?",
      wrongCode:
        "function getLastItem(items) {\n  return items[items.length];\n}",
      correctCode:
        "function getLastItem(items) {\n  return items[items.length - 1];\n}",
      wrongLine: "return items[items.length];",
      correctLine: "return items[items.length - 1];",
      choices: [
        "The last index is length - 1.",
        "Arrays cannot be returned.",
        "The variable must be renamed.",
      ],
      explanation:
        "Indexes start at zero. The last index is one less than the array's length.",
      hint: "Write down the indexes of a three-item array.",
    },

    sum_loop: {
      title: "The missing final number",
      context:
        "A calculator adds a list of points, but skips the final point.",
      question: "Why is the last number missing from the total?",
      wrongCode:
        "function sumPoints(points) {\n  let total = 0;\n  for (let i = 0; i < points.length - 1; i++) total += points[i];\n  return total;\n}",
      correctCode:
        "function sumPoints(points) {\n  let total = 0;\n  for (let i = 0; i < points.length; i++) total += points[i];\n  return total;\n}",
      wrongLine:
        "for (let i = 0; i < points.length - 1; i++) total += points[i];",
      correctLine:
        "for (let i = 0; i < points.length; i++) total += points[i];",
      choices: [
        "The loop stops before the final index.",
        "The total must start at 1.",
        "Arrays cannot be used in loops.",
      ],
      explanation:
        "Starting at zero, i < points.length visits every valid index, including the last one.",
      hint: "Trace the loop for two points.",
    },

    uppercase: {
      title: "A label in the wrong case",
      context:
        "A badge must show a name in capital letters, but the function makes it lowercase.",
      question: "Which string method matches the requirement?",
      wrongCode:
        "function badgeName(name) {\n  return name.toLowerCase();\n}",
      correctCode:
        "function badgeName(name) {\n  return name.toUpperCase();\n}",
      wrongLine: "return name.toLowerCase();",
      correctLine: "return name.toUpperCase();",
      choices: [
        "Use toUpperCase() to make capital letters.",
        "Strings cannot be returned.",
        "The parameter must be an array.",
      ],
      explanation:
        "toLowerCase() makes letters small; toUpperCase() makes them capital.",
      hint: "Compare the names of the two string methods.",
    },

    object_property: {
      title: "The invisible name",
      context:
        "A profile has a fullName field, but the greeting shows undefined.",
      question: "Which property does the object actually contain?",
      wrongCode:
        "function greet(user) {\n  return 'Hi, ' + user.fullname;\n}",
      correctCode:
        "function greet(user) {\n  return 'Hi, ' + user.fullName;\n}",
      wrongLine: "return 'Hi, ' + user.fullname;",
      correctLine: "return 'Hi, ' + user.fullName;",
      choices: [
        "Property names are case-sensitive: fullName is different from fullname.",
        "Objects cannot contain names.",
        "The return keyword should be removed.",
      ],
      explanation:
        "JavaScript property names are case-sensitive, so user.fullname does not read user.fullName.",
      hint: "Compare the capital N in fullName.",
    },

    even_number: {
      title: "Oddly even",
      context:
        "A helper should find even numbers, but it accepts odd numbers.",
      question:
        "What remainder does an even number have after division by 2?",
      wrongCode:
        "function isEven(number) {\n  return number % 2 === 1;\n}",
      correctCode:
        "function isEven(number) {\n  return number % 2 === 0;\n}",
      wrongLine: "return number % 2 === 1;",
      correctLine: "return number % 2 === 0;",
      choices: [
        "Even numbers have a remainder of 0 when divided by 2.",
        "Even numbers must be strings.",
        "The % operator divides and rounds up.",
      ],
      explanation:
        "The % operator gives the remainder. An even number divided by 2 leaves 0.",
      hint: "Try 4 % 2 and 5 % 2.",
    },

    double_value: {
      title: "Not quite double",
      context:
        "A game promises double points, but its helper only adds two points.",
      question: "How do we double any value?",
      wrongCode:
        "function doublePoints(points) {\n  return points + 2;\n}",
      correctCode:
        "function doublePoints(points) {\n  return points * 2;\n}",
      wrongLine: "return points + 2;",
      correctLine: "return points * 2;",
      choices: [
        "Multiply by 2 instead of adding 2.",
        "Subtract 2 from the points.",
        "Change the function name only.",
      ],
      explanation:
        "Adding 2 only doubles the value 2. Multiplying by 2 doubles every value.",
      hint: "Think about what happens when points is 10.",
    },

    trim_name: {
      title: "Spaces still at the front",
      context:
        "A form removes spaces around a name, but leading spaces remain.",
      question: "Which method removes spaces from both ends?",
      wrongCode:
        "function cleanName(name) {\n  return name.trimEnd();\n}",
      correctCode:
        "function cleanName(name) {\n  return name.trim();\n}",
      wrongLine: "return name.trimEnd();",
      correctLine: "return name.trim();",
      choices: [
        "trim() removes whitespace from both ends.",
        "trimEnd() also removes spaces at the beginning.",
        "Whitespace cannot be removed from strings.",
      ],
      explanation:
        "trimEnd() only removes trailing spaces. trim() removes leading and trailing spaces.",
      hint: "The word End in trimEnd tells you where it works.",
    },

    largest: {
      title: "The smaller winner",
      context:
        "A contest should pick the larger score, but this helper picks the smaller one.",
      question: "Which comparison chooses the larger score?",
      wrongCode:
        "function largerScore(a, b) {\n  return a < b ? a : b;\n}",
      correctCode:
        "function largerScore(a, b) {\n  return a > b ? a : b;\n}",
      wrongLine: "return a < b ? a : b;",
      correctLine: "return a > b ? a : b;",
      choices: [
        "The < comparison selects the smaller score; use >.",
        "The function has too many parameters.",
        "The conditional operator cannot return numbers.",
      ],
      explanation:
        "When a > b, return a. Otherwise return b; either way the larger value wins.",
      hint: "Try a = 7 and b = 3.",
    },

    first_item: {
      title: "Second place first",
      context:
        "A playlist should show its first song, but the function shows the second.",
      question: "What index holds the first item?",
      wrongCode:
        "function firstSong(songs) {\n  return songs[1];\n}",
      correctCode:
        "function firstSong(songs) {\n  return songs[0];\n}",
      wrongLine: "return songs[1];",
      correctLine: "return songs[0];",
      choices: [
        "The first array index is 0.",
        "The array needs to be sorted.",
        "Array indexes are strings.",
      ],
      explanation:
        "JavaScript arrays start at index 0, so index 1 is the second song.",
      hint: "Count array positions starting at zero.",
    },
  };

  return examples[kind] || null;
}

const kinds = [
  "age",
  "last_item",
  "sum_loop",
  "uppercase",
  "object_property",
  "even_number",
  "double_value",
  "trim_name",
  "largest",
  "first_item",
];

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    context: { type: "string" },
    wrongCode: { type: "string" },
    correctCode: { type: "string" },
  },
  required: [
    "title",
    "context",
    "wrongCode",
    "correctCode",
  ],
  additionalProperties: false,
};

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  const signature = createHmac(
    "sha256",
    process.env.AUTH_SECRET
  )
    .update(body)
    .digest("base64url");

  return `${body}.${signature}`;
}

function verify(token, userId) {
  if (typeof token !== "string" || token.length > 2000) {
    return null;
  }

  const [body, signature, extra] = token.split(".");

  if (!body || !signature || extra) {
    return null;
  }

  const expected = createHmac(
    "sha256",
    process.env.AUTH_SECRET
  )
    .update(body)
    .digest();

  let actual;

  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }

  if (
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    );

    if (
      payload.userId !== userId ||
      !Number.isSafeInteger(payload.expires) ||
      payload.expires < Date.now()
    ) {
      return null;
    }

    if (
      !kinds.includes(payload.kind) ||
      !/^[a-f0-9]{32}$/.test(payload.nonce)
    ) {
      return null;
    }

    if (
      payload.kind === "age" &&
      (
        !Number.isInteger(payload.variant) ||
        payload.variant < 16 ||
        payload.variant > 21
      )
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function allowedRequest(request, response, next) {
  const origin = request.get("origin");

  if (
    origin &&
    origin !== new URL(process.env.APP_URL).origin
  ) {
    return response.status(403).json({
      message: "Request origin is not allowed.",
    });
  }

  if (
    request.get("X-Almost-Request") !== "1" ||
    !request.is("application/json")
  ) {
    return response.status(403).json({
      message: "Invalid request.",
    });
  }

  next();
}

function chooseKind(userId) {
  const recent = recentByUser.get(userId) || [];
  const choices = kinds.filter(
    (kind) => !recent.includes(kind)
  );

  return choices[randomInt(choices.length)];
}

function rememberKind(userId, kind) {
  const previous = recentByUser.get(userId) || [];

  recentByUser.delete(userId);
  recentByUser.set(
    userId,
    [kind, ...previous].slice(0, 5)
  );

  if (recentByUser.size > 1000) {
    recentByUser.delete(
      recentByUser.keys().next().value
    );
  }
}

function validateDraft(draft, base) {
  if (!draft || typeof draft !== "object") {
    return null;
  }

  if (
    typeof draft.title !== "string" ||
    draft.title.trim().length < 5 ||
    draft.title.length > 65
  ) {
    return null;
  }

  if (
    typeof draft.context !== "string" ||
    draft.context.trim().length < 15 ||
    draft.context.length > 240
  ) {
    return null;
  }

  if (
    typeof draft.wrongCode !== "string" ||
    typeof draft.correctCode !== "string"
  ) {
    return null;
  }

  const compact = (value) => value.replace(/\s/g, "");

  if (
    compact(draft.wrongCode) !==
      compact(base.wrongCode) ||
    compact(draft.correctCode) !==
      compact(base.correctCode)
  ) {
    return null;
  }

  return {
    ...base,
    title: draft.title.trim(),
    context: draft.context.trim(),
    wrongCode: draft.wrongCode,
  };
}

async function generate(base, kind) {
  const response = await fetch(
    "https://api.openai.com/v1/responses",
    {
      method: "POST",
      headers: {
        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(20_000),
      body: JSON.stringify({
        model:
          process.env.OPENAI_MODEL ||
          "gpt-4.1-mini",
        store: false,
        input: [
          {
            role: "system",
            content:
              "Create one beginner JavaScript debugging challenge. The specific mistake category and code are provided. Return exactly the supplied wrongCode and correctCode as JSON strings, plus a fresh short title and everyday context matching this code. Keep title/context accurate: do not change the rule, introduce another mistake, or claim the code is correct. No markdown or extra fields.",
          },
          {
            role: "user",
            content: JSON.stringify({
              category: kind,
              question: base.question,
              wrongCode: base.wrongCode,
              correctCode: base.correctCode,
              inspiration: randomInt(1_000_000),
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "almost_js_challenge",
            strict: true,
            schema,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    const details = await response
      .json()
      .catch(() => ({}));

    const error = new Error(
      `OpenAI response status ${response.status}: ${
        details.error?.code ||
        details.error?.type ||
        "unknown"
      }`
    );

    error.httpStatus = response.status;
    error.apiCode = details.error?.code;
    throw error;
  }

  const data = await response.json();

  const output = data.output
    ?.flatMap((item) => item.content || [])
    .find((part) => part.type === "output_text")
    ?.text;

  if (!output) {
    throw new Error(
      "OpenAI returned no challenge text"
    );
  }

  const challenge = validateDraft(
    JSON.parse(output),
    base
  );

  if (!challenge) {
    throw new Error(
      "AI output did not match the checked code pattern"
    );
  }

  return challenge;
}

router.post(
  "/challenge",
  requireAuth,
  allowedRequest,
  generationLimit,
  async (request, response) => {
    if (!process.env.OPENAI_API_KEY) {
      return response.status(503).json({
        message:
          "AI challenges are not configured yet.",
      });
    }

    const userId = String(request.user._id);
    const kind = chooseKind(userId);
    const variant =
      kind === "age" ? randomInt(16, 22) : 0;
    const base = build(kind, variant);

    let challenge;
    let source = "live";

    for (
      let attempt = 0;
      attempt < 3 && !challenge;
      attempt += 1
    ) {
      try {
        challenge = await generate(base, kind);
      } catch (error) {
        console.warn(
          "AI challenge generation failed:",
          error.message
        );

        if (
          error.httpStatus === 401 ||
          error.httpStatus === 403
        ) {
          return response.status(503).json({
            message: "Check the AI service key.",
          });
        }

        if (error.httpStatus === 429) {
          break;
        }
      }
    }

    if (!challenge) {
      challenge = base;
      source = "reviewed";
    }

    rememberKind(userId, kind);

    const nonce = randomBytes(16).toString("hex");

    const correctIndex =
      createHmac(
        "sha256",
        process.env.AUTH_SECRET
      )
        .update(nonce)
        .digest()[0] % 3;

    const options = [...base.choices];
    options.splice(
      correctIndex,
      0,
      options.shift()
    );

    const token = sign({
      kind,
      variant,
      nonce,
      userId,
      expires: Date.now() + 20 * 60_000,
    });

    response.json({
      challenge: {
        token,
        kind,
        source,
        title: challenge.title,
        context: challenge.context,
        question: base.question,
        code: challenge.wrongCode,
        wrongLine: base.wrongLine,
        options: options.map((text, index) => ({
          id: String(index),
          text,
        })),
      },
    });
  }
);

router.post(
  "/check",
  requireAuth,
  allowedRequest,
  answerLimit,
  (request, response) => {
    const {
      token,
      mode,
      selectedOptionId,
      correctedLine,
    } = request.body || {};

    const payload = verify(
      token,
      String(request.user._id)
    );

    if (!payload) {
      return response.status(400).json({
        message:
          "This challenge expired. Get a new one.",
      });
    }

    const base = build(
      payload.kind,
      payload.variant
    );

    if (
      mode !== "choice" &&
      mode !== "edit"
    ) {
      return response.status(400).json({
        message: "Choose how to answer.",
      });
    }

    if (
      mode === "choice" &&
      !["0", "1", "2"].includes(
        selectedOptionId
      )
    ) {
      return response.status(400).json({
        message: "Choose an answer.",
      });
    }

    if (
      mode === "edit" &&
      (
        typeof correctedLine !== "string" ||
        correctedLine.length > 160 ||
        !correctedLine.trim()
      )
    ) {
      return response.status(400).json({
        message: "Enter a corrected line.",
      });
    }

    const correctIndex =
      createHmac(
        "sha256",
        process.env.AUTH_SECRET
      )
        .update(payload.nonce)
        .digest()[0] % 3;

    const correct =
      mode === "choice"
        ? Number(selectedOptionId) ===
          correctIndex
        : correctedLine.replace(/\s/g, "") ===
          base.correctLine.replace(/\s/g, "");

    response.json({
      correct,
      hint: correct ? "" : base.hint,
      explanation: base.explanation,
      correctedLine: base.correctLine,
      correctedCode: base.correctCode,
    });
  }
);

export default router;
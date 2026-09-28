// API checks use in-memory model doubles, not your Atlas database.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Exhibit from "../src/models/Exhibit.js";
import Room from "../src/models/Room.js";
import Attempt from "../src/models/Attempt.js";
import User from "../src/models/User.js";
import teacherRoutes from "../src/routes/teacherRoutes.js";
import exhibitRoutes from "../src/routes/exhibitRoutes.js";

process.env.AUTH_SECRET = "test-only-secret-not-used-outside-these-tests";
process.env.APP_URL = "http://localhost:5173";
const teacher = { _id: new mongoose.Types.ObjectId(), role: "teacher", sessionVersion: 0 };
const other = { _id: new mongoose.Types.ObjectId(), role: "teacher", sessionVersion: 0 };
const student = { _id: new mongoose.Types.ObjectId(), role: "student", sessionVersion: 0 };
const users = [teacher, other, student];
const records = new Map();
let sequence = 0;
const query = (initial) => {
  let value = initial;
  return { select(fields) {
    if (value && fields.includes("options.id options.text")) {
      const doc = value.toObject ? value.toObject() : value;
      value = { slug: doc.slug, roomSlug: doc.roomSlug, version: doc.version,
        number: doc.number, topic: doc.topic, title: doc.title, question: doc.question,
        incorrectAnswer: doc.incorrectAnswer,
        options: doc.options.map(({ id, text }) => ({ id, text })) };
    }
    return this;
  }, lean: async () => value, then(resolve, reject) { return Promise.resolve(value).then(resolve, reject); } };
};
User.findById = (id) => query(users.find((u) => String(u._id) === id));
Room.exists = async ({ slug }) => slug === "math";
Exhibit.create = async (values) => {
  const doc = new Exhibit(values); await doc.validate();
  doc.__v = 0; doc.updatedAt = new Date(); records.set(doc.slug, doc); sequence++;
  return doc;
};
Exhibit.findOne = (filter) => query([...records.values()].find((doc) => Object.entries(filter).every(([key, value]) => String(doc[key]) === String(value))));
Exhibit.findOneAndUpdate = (filter, update) => {
  const doc = [...records.values()].find((item) => Object.entries(filter).every(([key, value]) => String(item[key]) === String(value)));
  if (doc) { doc.set(update.$set); doc.__v += update.$inc.__v; }
  return query(doc);
};
const attempts = [];
Attempt.init = async () => Attempt;
Attempt.findOne = (filter) => query(attempts.find((item) => Object.entries(filter).every(([key, value]) => String(item[key]) === String(value))));
Attempt.create = async (values) => { const doc = new Attempt(values); await doc.validate(); attempts.push(doc); return doc; };
Attempt.aggregate = async (pipeline) => {
  assert.ok(pipeline[0].$match.exhibit);
  assert.equal(pipeline[0].$match.exhibitVersion, 1);
  assert.equal(String(pipeline[0].$match.user.$ne), String(teacher._id));
  return [{ _id: "a", count: 1 }, { _id: "b", count: 2 }];
};
const app = express(); app.use(express.json()); app.use(cookieParser());
app.use("/api/teacher", teacherRoutes); app.use("/api/exhibits", exhibitRoutes);
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
after(() => new Promise((resolve) => server.close(resolve)));
const base = `http://127.0.0.1:${server.address().port}`;
async function request(path, { user = teacher, method = "GET", body, origin = process.env.APP_URL } = {}) {
  const headers = { Origin: origin, "X-Almost-Request": "1", "Content-Type": "application/json" };
  if (user) headers.Cookie = `almost_session=${jwt.sign({ ver: 0 }, process.env.AUTH_SECRET, { subject: String(user._id), algorithm: "HS256", issuer: "almost", audience: "almost-web" })}`;
  const res = await fetch(base + path, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: res.status, body: await res.json() };
}
const valid = { roomSlug: "math", number: 4, topic: "Discounts", title: "A second discount", question: "What happens after a second discount?", incorrectAnswer: "Add both percentages.", options: [{ id: "a", text: "Same base", feedback: "Adding the percentages treats them as the same base." }, { id: "b", text: "Different base", feedback: "Good: the second discount applies to the reduced price." }], correctOptionId: "b", explanation: "Apply each discount to the current price, not the original price." };

test("teacher flow, ownership, CSRF, validation, lifecycle and aggregate privacy", async () => {
  assert.equal((await request("/api/teacher/exhibits", { user: null })).status, 401);
  assert.equal((await request("/api/teacher/exhibits", { user: student })).status, 403);
  assert.equal((await request("/api/teacher/exhibits", { method: "POST", body: valid, origin: "https://other.example" })).status, 403);
  for (const change of [{ options: valid.options.map(({ id, text }) => ({ id, text })) }, { owner: String(other._id) }, { status: "published" }, { roomSlug: "unknown" }, { correctOptionId: "z" }, { options: [{ id: "a", text: "x" }, { id: "a", text: "y" }] }]) {
    assert.equal((await request("/api/teacher/exhibits", { method: "POST", body: { ...valid, ...change } })).status, 400);
  }
  const created = await request("/api/teacher/exhibits", { method: "POST", body: valid });
  assert.equal(created.status, 201); assert.equal(sequence, 1);
  const doc = created.body.exhibit; const path = `/api/teacher/exhibits/${doc.slug}`;
  assert.equal(doc.status, "draft"); assert.equal(doc.correctOptionId, "b");
  assert.equal((await request(path, { user: other })).status, 404);
  assert.equal((await request(path + "/stats", { user: other })).status, 404);
  assert.equal((await request(path, { method: "PUT", user: other, body: { ...valid, revision: 0 } })).status, 404);
  assert.equal((await request(`/api/exhibits/${doc.slug}`)).status, 404);
  assert.equal((await request(path, { method: "PUT", body: { ...valid, revision: 0 } })).status, 200);
  assert.equal((await request(path + "/publish", { method: "POST", body: { revision: 0 } })).status, 409);
  assert.equal((await request(path + "/publish", { method: "POST", body: { revision: 1 } })).status, 200);
  const publicExhibit = await request(`/api/exhibits/${doc.slug}`);
  assert.equal(publicExhibit.status, 200);
  assert.ok(!JSON.stringify(publicExhibit.body).includes("Adding the percentages"));
  assert.ok(!JSON.stringify(publicExhibit.body).includes("correctOptionId"));
  const submitted = await request(`/api/exhibits/${doc.slug}/attempt`, { user: student, method: "POST", body: { selectedOptionId: "a", exhibitVersion: 1 } });
  assert.equal(submitted.status, 201);
  assert.equal(submitted.body.attempt.selectedOptionFeedback, valid.options[0].feedback);
  const recovered = await request(`/api/exhibits/${doc.slug}/attempt`, { user: student });
  assert.equal(recovered.body.attempt.selectedOptionFeedback, valid.options[0].feedback);
  assert.equal((await request(path, { method: "PUT", body: { ...valid, revision: 2 } })).status, 409);
  assert.equal((await request(path + "/publish", { method: "POST", body: { revision: 2 } })).status, 409);
  const stats = await request(path + "/stats");
  assert.equal(stats.body.stats.total, 3); assert.equal(stats.body.stats.correct, 2); assert.equal(stats.body.stats.accuracy, 67);
  assert.deepEqual(Object.keys(stats.body), ["stats"]);
  assert.ok(!JSON.stringify(stats.body).includes('"user"'));
  assert.equal((await request(path + "/archive", { method: "POST", body: { revision: 2 } })).status, 200);
  assert.equal((await request(`/api/exhibits/${doc.slug}`)).status, 404);
  assert.equal((await request(path + "/stats")).status, 200);
  assert.equal((await request(path + "/publish", { method: "POST", body: { revision: 3 } })).status, 409);
});

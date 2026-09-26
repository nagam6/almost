import express from "express";

const app = express();
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", project: "All Most" });
});

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => {
  console.log(`All Most API listening on http://localhost:${port}`);
});

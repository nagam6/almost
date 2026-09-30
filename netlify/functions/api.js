import serverless from "serverless-http";
import app from "../../apps/api/src/app.js";
import User from "../../apps/api/src/models/User.js";
import { connectDB } from "../../apps/api/src/config/db.js";

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  await connectDB();
  await User.init();

  return serverlessHandler(event, context);
};
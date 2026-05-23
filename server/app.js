import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { initializeStore } from "./models/store.js";
import authRoutes from "./routes/authRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import userRoutes from "./routes/userRoutes.js";

initializeStore();

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !env.clientOrigins.length || env.clientOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json({ limit: env.jsonLimit }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/users", userRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

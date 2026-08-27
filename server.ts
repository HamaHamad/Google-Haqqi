/**
 * Haqqi — Express server.
 *
 * Fixes over the previous version:
 *  - SPA fallback now uses Express 4 syntax (`app.get('*')` instead of the
 *    Express 5-only `app.get('*all')`), so deep links work in production.
 *  - Production static serving no longer depends on NODE_ENV being set in the
 *    shell: `npm start` sets it via cross-env, and the server also auto-detects
 *    a built `dist/` when NODE_ENV is unset.
 *  - Added helmet (security headers), rate limiting, body size limits,
 *    GEMINI_API_KEY startup warning, and JSON 404s for unknown API routes.
 */
import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { router as apiRouter } from "./server/routes";
import { isAiConfigured } from "./server/ai";

dotenv.config();

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const distPath = path.join(process.cwd(), "dist");
const hasDist = fs.existsSync(path.join(distPath, "index.html"));
const isProduction =
  process.env.NODE_ENV === "production" || (!process.env.NODE_ENV && hasDist);

if (!isAiConfigured()) {
  console.warn(
    "[haqqi] WARNING: GEMINI_API_KEY is not set — AI endpoints will return 503. Copy .env.example to .env and configure it."
  );
}

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "عدد كبير من الطلبات، يرجى المحاولة بعد قليل." },
});

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "عدد كبير من طلبات الذكاء الاصطناعي، يرجى المحاولة بعد قليل." },
});

async function startServer() {
  const app = express();

  app.use(
    helmet({
      // Google Fonts + Vite dev inline styles require relaxed CSP.
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(express.json({ limit: "12mb" })); // base64 evidence uploads can be a few MB

  // API (rate limited; AI routes stricter)
  app.use("/api/intake/message", aiLimiter);
  app.use("/api/chat/general", aiLimiter);
  app.use("/api/drafts/generate", aiLimiter);
  app.use("/api", generalLimiter, apiRouter);

  if (!isProduction) {
    // Development: Vite middleware serves the SPA with HMR.
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: static assets + Express 4 SPA fallback.
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        next();
        return;
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.use("/api", (_req, res) => res.status(404).json({ error: "المسار غير موجود." }));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[haqqi] Server running on http://localhost:${PORT} (${isProduction ? "production" : "development"})`
    );
  });
}

startServer().catch((error) => {
  console.error("[haqqi] Failed to start server:", error);
  process.exit(1);
});

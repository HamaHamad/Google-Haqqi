/**
 * Haqqi API routes.
 * All routes are validated (zod), rate-limited (see server.ts) and persisted to the JSON store.
 */
import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { z } from "zod";
import {
  DATA_DIR,
  UPLOADS_DIR,
  readCollection,
  appendToCollection,
  removeFromCollection,
  newId,
} from "./db";
import { AiUnavailableError, formatHistory, generateText } from "./ai";

export const router = express.Router();

/* ------------------------------- helpers ------------------------------- */

const AR_SERVER_ERROR = "حدث خطأ داخل الخدمة، يرجى المحاولة لاحقاً.";
const AR_AI_UNCONFIGURED = "خدمة الذكاء الاصطناعي غير مهيأة حالياً (GEMINI_API_KEY مفقود).";

function handleError(res: Response, error: unknown, context: string) {
  if (error instanceof AiUnavailableError) {
    res.status(503).json({ error: AR_AI_UNCONFIGURED });
    return;
  }
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: "البيانات المرسلة غير صالحة أو ناقصة." });
    return;
  }
  console.error(`[api] ${context}:`, error);
  res.status(500).json({ error: AR_SERVER_ERROR });
}

function parseBody<T extends z.ZodTypeAny>(schema: T, req: Request, res: Response):
  z.infer<T> | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      error: "البيانات المرسلة غير صالحة أو ناقصة.",
      details: result.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return null;
  }
  return result.data;
}

/* ------------------------------- schemas ------------------------------- */

const chatSchema = z.object({
  message: z.string().trim().min(1, "الرسالة مطلوبة").max(2000),
  history: z
    .array(
      z.object({
        role: z.string().max(20),
        content: z.string().max(4000),
      })
    )
    .max(60)
    .optional()
    .default([]),
});

const DRAFT_TYPES = [
  "insurer_demand",
  "cbj_complaint",
  "statement_of_claim",
  "settlement_release",
  "power_of_attorney",
] as const;

const draftSchema = z.object({
  templateType: z.enum(DRAFT_TYPES),
  caseData: z.record(z.unknown()).optional().default({}),
  intakeTranscript: z.string().max(20000).optional(),
});

const reviewSchema = z.object({
  caseId: z.string().max(100).optional(),
  templateType: z.enum(DRAFT_TYPES),
  content: z.string().trim().min(10).max(50000),
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  contact: z.string().trim().min(5).max(200),
  message: z.string().trim().min(5).max(3000),
});

const storySchema = z.object({
  type: z.enum(["story", "warning"]),
  content: z.string().trim().min(10).max(2000),
});

const shareCreateSchema = z.object({
  caseId: z.string().max(100).optional(),
  payload: z.unknown(),
});

const backupSchema = z.object({
  caseId: z.string().max(100).optional(),
  payload: z.unknown(),
});

const base64UploadSchema = z.object({
  base64: z.string().regex(/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/),
  filename: z.string().max(120).optional(),
  category: z.string().max(40).optional(),
  caseId: z.string().max(100).optional(),
});

/* ------------------------------ AI routes ------------------------------ */

const INTAKE_SYSTEM = `You are a helpful, empathetic legal AI assistant for 'Haqqi' in Jordan.
Your goal is to guide victims of car accidents through a 7-stage intake process:
1. Triage & safety (death/injury/threats).
2. Accident facts (date/time/location, police report).
3. Losses & damages.
4. Claims history.
5. Goals & constraints.
6. Document collection checklist.
7. Consent & disclaimers.

Ask ONE question at a time. Be empathetic. Use plain Arabic. Do not offer legal advice, only collect facts and provide structural guidance.`;

const GENERAL_SYSTEM = `You are a helpful, empathetic legal assistant for the 'Haqqi' platform in Jordan.
Your goal is to answer general questions about Jordanian traffic laws, insurance, and compensation.
Be concise and use plain Arabic.
If applicable, recommend the user to use the specific sections of the Haqqi platform such as:
- 'Rights Calculator' (حاسبة الحقوق السريعة) for estimating compensation.
- 'AI Intake' (المساعد الذكي) to document their specific case step-by-step.
- 'Drafting' (الصياغة القانونية) for generating legal letters.
Do not provide definitive legal advice; remind them that this is for informational purposes only.`;

const DRAFT_PROMPTS: Record<(typeof DRAFT_TYPES)[number], string> = {
  insurer_demand:
    "إنذار عدلي موجه لشركة التأمين يتضمن: عرض الوقائع، الأساس القانوني (القانون المدني الأردني ونظام التأمين الإلزامي)، تفصيل الأضرار والمبالغ، وطلب السداد خلال مهلة محددة مع التحفظ على كامل الحقوق.",
  cbj_complaint:
    "شكوى رسمية موجهة لدائرة حماية المستهلك المالي في البنك المركزي الأردني تتضمن: بيانات مقدم الشكوى، شركة التأمين، رقم المطالبة، شرح المماطلة أو الرفض أو البخس، والطلب.",
  statement_of_claim:
    "لائحة دعوى حقوقية (صلح أو بداية حسب قيمة المطالبة) تتضمن: الوقائع، الأسانيد القانونية، قرارات المحكمة المزمع استنادها إن وجدت، الطلبات النهائية.",
  settlement_release:
    "مخالصة وإسقاط حق مع تنبيه واضح بصياغة تحفظية: أن التوقيع يتم بعد استقرار الحالة الطبية ومعرفة نسبة العجز، وأن المخالصة مقصورة على المبالغ المذكورة فقط.",
  power_of_attorney:
    "نموذج وكالة خاصة لمحامٍ لمتابعة مطالبة تعويض عن حادث سير أمام شركات التأمين والجهات الرسمية والمحاكم الأردنية.",
};

router.post("/intake/message", async (req, res) => {
  try {
    const data = parseBody(chatSchema, req, res);
    if (!data) return;
    const contents = [
      ...formatHistory(data.history),
      { role: "user", parts: [{ text: data.message }] },
    ];
    const text = await generateText(contents, {
      systemInstruction: INTAKE_SYSTEM,
      temperature: 0.2,
    });
    res.json({ text });
  } catch (error) {
    handleError(res, error, "intake/message");
  }
});

router.post("/chat/general", async (req, res) => {
  try {
    const data = parseBody(chatSchema, req, res);
    if (!data) return;
    const contents = [
      ...formatHistory(data.history),
      { role: "user", parts: [{ text: data.message }] },
    ];
    const text = await generateText(contents, {
      systemInstruction: GENERAL_SYSTEM,
      temperature: 0.3,
    });
    res.json({ text });
  } catch (error) {
    handleError(res, error, "chat/general");
  }
});

router.post("/drafts/generate", async (req, res) => {
  try {
    const data = parseBody(draftSchema, req, res);
    if (!data) return;
    const transcript = data.intakeTranscript?.trim()
      ? `\n\nمقتطف من محادثة توثيق الحادث مع المستخدم (استخرج منها ما هو متوفر فقط):\n${data.intakeTranscript.slice(-6000)}`
      : "";
    const prompt = `قم بصياغة مسودة قانونية باللغة العربية الفصحى لاستخدامها في الأردن بخصوص مطالبة تعويض عن حادث سير.

نوع المستند المطلوب: ${DRAFT_PROMPTS[data.templateType]}

بيانات الحالة (JSON): ${JSON.stringify(data.caseData ?? {}).slice(0, 4000)}${transcript}

تعليمات:
- استخدم الحقول النائبة بين معقوفتين [هكذا] لأي بيانات غير متوفرة.
- التزم بالبنية الرسمية المعتمدة في المخاطبات واللوائح الأردنية.
- لا تختلق أرقام قرارات قضائية أو نصوص قانونية غير موجودة.
- اجعل المستند جاهزاً للطباعة مع أماكن مخصصة للتوقيع والتاريخ.`;
    const text = await generateText(prompt, { temperature: 0.1 });
    res.json({ text });
  } catch (error) {
    handleError(res, error, "drafts/generate");
  }
});

router.post("/drafts/review", async (req, res) => {
  try {
    const data = parseBody(reviewSchema, req, res);
    if (!data) return;
    const saved = await appendToCollection("reviews", {
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    res.status(201).json({ ok: true, id: saved.id });
  } catch (error) {
    handleError(res, error, "drafts/review");
  }
});

/* ----------------------------- contact form ---------------------------- */

router.post("/contact", async (req, res) => {
  try {
    const data = parseBody(contactSchema, req, res);
    if (!data) return;
    await appendToCollection("contacts", { ...data, createdAt: new Date().toISOString() });
    res.status(201).json({ ok: true });
  } catch (error) {
    handleError(res, error, "contact");
  }
});

/* -------------------------------- stories ------------------------------ */

router.get("/stories", async (_req, res) => {
  try {
    const all = await readCollection<{
      id: string;
      date: string;
      type: string;
      content: string;
      tags?: string[];
      isApproved: boolean;
    }>("stories");
    const approved = all
      .filter((s) => s.isApproved)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    res.json({ stories: approved });
  } catch (error) {
    handleError(res, error, "stories/list");
  }
});

router.post("/stories", async (req, res) => {
  try {
    const data = parseBody(storySchema, req, res);
    if (!data) return;
    const story = await appendToCollection("stories", {
      date: new Date().toISOString().slice(0, 10),
      type: data.type,
      content: data.content,
      tags: data.type === "warning" ? ["تحذير"] : ["تجربة"],
      isApproved: false, // requires moderation before publishing
    });
    res.status(201).json({ ok: true, id: story.id, moderated: true });
  } catch (error) {
    handleError(res, error, "stories/create");
  }
});

/* ------------------------------ evidence ------------------------------- */

const ALLOWED_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = ALLOWED_MIME[file.mimetype] || path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME[file.mimetype]) cb(null, true);
    else cb(new Error("BAD_FILE_TYPE"));
  },
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

async function saveEvidenceRecord(params: {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  category?: string;
  caseId?: string;
}) {
  return appendToCollection("evidence", {
    ...params,
    category: params.category || "misc",
    caseId: params.caseId || null,
    uploadedAt: new Date().toISOString(),
  });
}

router.post("/evidence/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      const message =
        err.message === "BAD_FILE_TYPE"
          ? "نوع الملف غير مدعوم. المسموح: PDF, PNG, JPG, WEBP."
          : err.code === "LIMIT_FILE_SIZE"
            ? "حجم الملف يتجاوز الحد المسموح (10 ميغابايت)."
            : AR_SERVER_ERROR;
      res.status(400).json({ error: message });
      return;
    }
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({ error: "لم يتم إرفاق أي ملف." });
      return;
    }
    saveEvidenceRecord({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      category: typeof req.body.category === "string" ? req.body.category.slice(0, 40) : "misc",
      caseId: typeof req.body.caseId === "string" ? req.body.caseId.slice(0, 100) : undefined,
    })
      .then((record) => res.status(201).json({ ok: true, file: record }))
      .catch((error) => handleError(res, error, "evidence/upload"));
  });
});

router.post("/evidence/upload-base64", async (req, res) => {
  try {
    const data = parseBody(base64UploadSchema, req, res);
    if (!data) return;
    const base64Data = data.base64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: "حجم الصورة يتجاوز الحد المسموح (10 ميغابايت)." });
      return;
    }
    const mime = data.base64.match(/^data:(image\/[a-z+]+);/)?.[1] || "image/jpeg";
    const ext = ALLOWED_MIME[mime] || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    await fs.writeFile(path.join(UPLOADS_DIR, filename), buffer);
    const record = await saveEvidenceRecord({
      filename,
      originalname: data.filename || "مستند ممسوح ضوئياً",
      mimetype: mime,
      size: buffer.length,
      category: data.category,
      caseId: data.caseId,
    });
    res.status(201).json({ ok: true, file: record });
  } catch (error) {
    handleError(res, error, "evidence/upload-base64");
  }
});

router.get("/evidence/files", async (req, res) => {
  try {
    const caseId = typeof req.query.caseId === "string" ? req.query.caseId : null;
    const all = await readCollection<{
      id: string;
      filename: string;
      originalname: string;
      mimetype: string;
      size: number;
      category: string;
      caseId: string | null;
      uploadedAt: string;
    }>("evidence");
    const files = caseId ? all.filter((f) => f.caseId === caseId) : all;
    res.json({ files });
  } catch (error) {
    handleError(res, error, "evidence/list");
  }
});

router.delete("/evidence/files/:id", async (req, res) => {
  try {
    const id = String(req.params.id || "");
    const all = await readCollection<{ id: string; filename: string }>("evidence");
    const target = all.find((f) => f.id === id);
    if (!target) {
      res.status(404).json({ error: "الملف غير موجود." });
      return;
    }
    await removeFromCollection("evidence", id);
    await fs.unlink(path.join(UPLOADS_DIR, target.filename)).catch(() => undefined);
    res.json({ ok: true });
  } catch (error) {
    handleError(res, error, "evidence/delete");
  }
});

/* -------------------------------- share -------------------------------- */

router.post("/share", async (req, res) => {
  try {
    const data = parseBody(shareCreateSchema, req, res);
    if (!data) return;
    const token = crypto.randomBytes(12).toString("hex");
    await appendToCollection("shares", {
      token,
      caseId: data.caseId || null,
      payload: data.payload,
      createdAt: new Date().toISOString(),
    });
    const origin = process.env.APP_URL || `${req.protocol}://${req.get("host")}`;
    res.status(201).json({ token, url: `${origin}/shared/${token}` });
  } catch (error) {
    handleError(res, error, "share/create");
  }
});

router.get("/share/:token", async (req, res) => {
  try {
    const token = String(req.params.token || "");
    if (!/^[a-f0-9]{8,64}$/i.test(token)) {
      res.status(400).json({ error: "رابط غير صالح." });
      return;
    }
    const all = await readCollection<{ token: string; payload: unknown }>("shares");
    const found = all.find((s) => s.token === token);
    if (!found) {
      res.status(404).json({ error: "لم يتم العثور على الملف المشترك أو أن الرابط منتهي." });
      return;
    }
    res.json({ payload: found.payload });
  } catch (error) {
    handleError(res, error, "share/get");
  }
});

/* ------------------------------ backup --------------------------------- */

router.post("/export/backup", async (req, res) => {
  try {
    const data = parseBody(backupSchema, req, res);
    if (!data) return;
    const caseId = (data.caseId as string | undefined) || null;
    const evidence = caseId
      ? (await readCollection<{ caseId: string | null }>("evidence")).filter(
          (f) => f.caseId === caseId
        )
      : [];
    const bundle = {
      app: "haqqi",
      version: 1,
      exportedAt: new Date().toISOString(),
      caseId,
      client: data.payload,
      evidenceFiles: evidence,
    };
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="haqqi-backup-${(caseId || "case").slice(0, 12)}.json"`
    );
    res.send(JSON.stringify(bundle, null, 2));
  } catch (error) {
    handleError(res, error, "export/backup");
  }
});

/* ---------------------------- integrations ----------------------------- */

router.get("/integrations/drive/status", (_req, res) => {
  // Drive sync requires server-side OAuth credentials; report honestly.
  const configured = Boolean(process.env.GOOGLE_DRIVE_CLIENT_ID && process.env.GOOGLE_DRIVE_CLIENT_SECRET);
  res.json({ configured });
});

/* --------------------------------- misc -------------------------------- */

router.get("/health", (_req, res) => {
  res.json({ status: "ok", dataDir: DATA_DIR });
});

// JSON 404 for unknown API routes (must come before SPA fallback in server.ts)
router.use((_req: Request, res: Response) => {
  res.status(404).json({ error: "المسار غير موجود." });
});

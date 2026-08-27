# حقي (Haqqi)

منصة ويب لمساعدة ضحايا حوادث السير في الأردن على معرفة حقوقهم، تنظيم ملف مطالباتهم، توليد المسودات القانونية، وتقديم الشكاوى للجهات الرقابية.

A bilingual (Arabic-first, RTL) legal-aid platform for Jordanian car-accident victims: rights estimation, case evaluation, evidence management, AI-assisted document drafting, and regulatory complaint guidance.

## Features

| Section | Description |
| --- | --- |
| **المساعد الذكي (AI Intake)** | 7-stage conversational intake (Gemini) that documents the accident step by step; the conversation is persisted and reused as context for drafting. |
| **حاسبة الحقوق (Rights Calculator)** | 5-step wizard that estimates claimable compensation categories, with role-aware guidance (driver / passenger / pedestrian). |
| **تقييم القضية (Case Evaluation)** | Evidence-based strength scoring (0–100%) with tailored recommendations. |
| **حاسبة الرسوم (Costs Estimator)** | Estimated court fees, expert fees, stamps and lawyer contingency ranges by court level. |
| **مسار القضية (Workflow)** | Interactive D3 timeline of the claim process with persistent progress tracking. |
| **منظم الأدلة (Evidence Organizer)** | Real file uploads (PDF/images, 10 MB limit), document scanner via camera capture, communication log, JSON backup download. |
| **الصياغة القانونية (Drafting)** | Gemini-powered Arabic legal drafts (insurer demand, CBJ complaint, statement of claim, settlement release, power of attorney) using the user's real case context, with e-signature, manual editing, copy and PDF export. |
| **الاجتهادات (Precedents)** | Curated Court of Cassation legal principles (searchable). |
| **دليل الجهات (Directory)** | Official institutions (medical committees, courts, insurance bodies). |
| **دليل الشكاوى (Complaints)** | CBJ complaint template with copy/PDF download and a working contact form. |
| **تجارب وتحذيرات (Stories)** | Moderated community stories with server-side approval workflow. |
| **ملف شامل (Dossier)** | One-click PDF export of the complete case file + secure share links (`/shared/:token`). |

Everything the user enters (tasks, workflow progress, evaluation, calculator answers, drafts, intake conversation, log events) is persisted — locally via `localStorage` and, where relevant, server-side in a JSON store.

## Tech Stack

- **Frontend**: React 19, Vite 6, TypeScript (strict), Tailwind CSS v4, React Router 7, D3, lucide-react
- **Backend**: Node + Express 4, `@google/genai` (Gemini), multer (uploads), zod (validation), helmet, express-rate-limit
- **Persistence**: dependency-free JSON file store (`data/`) with atomic, serialized writes
- **PDF**: html2canvas + jsPDF (browser-rendered Arabic → rasterized A4 pages), dynamically imported
- **Tests**: Vitest (27 unit tests over costs, evaluation scoring, storage, and the JSON DB)
- **CI**: GitHub Actions (type check → tests → production build)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then edit .env and set GEMINI_API_KEY (required for the AI endpoints)

# 3. Development (Express + Vite middleware with HMR)
npm run dev
# → http://localhost:3000

# 4. Production
npm run build
npm start          # serves dist/ with the Express 4 SPA fallback
```

> The AI endpoints return a clear Arabic 503 error when `GEMINI_API_KEY` is missing; the rest of the app keeps working.

## Environment Variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | yes* | — | Gemini API key for intake chat, general chat, and drafting |
| `GEMINI_MODEL` | no | `gemini-2.5-flash` | Model override |
| `PORT` | no | `3000` | Server port |
| `DATA_DIR` | no | `./data` | JSON store + uploaded evidence location |
| `APP_URL` | no | request origin | Base URL used when generating share links |
| `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_SECRET` | no | — | Enables the Drive sync status endpoint (reported honestly as unconfigured otherwise) |

\* Only required for the three AI-powered features.

## API Overview

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Liveness + data dir |
| POST | `/api/intake/message` | AI intake chat (validated, rate-limited) |
| POST | `/api/chat/general` | General legal Q&A chat |
| POST | `/api/drafts/generate` | Legal draft generation from case context |
| POST | `/api/drafts/review` | Submit a draft to the lawyer review queue |
| POST | `/api/contact` | Contact/inquiry form |
| GET/POST | `/api/stories` | List approved stories / submit a story (moderated) |
| POST | `/api/evidence/upload` | Multipart file upload (PDF/PNG/JPG/WEBP, ≤10 MB) |
| POST | `/api/evidence/upload-base64` | Camera-scan upload (data URL) |
| GET | `/api/evidence/files` | List uploaded evidence |
| DELETE | `/api/evidence/files/:id` | Delete an evidence file |
| POST | `/api/share` | Create a secure share link token |
| GET | `/api/share/:token` | Fetch a shared dossier payload |
| POST | `/api/export/backup` | Download a full JSON backup |
| GET | `/api/integrations/drive/status` | Drive sync configuration status |

All API routes are validated with zod, rate-limited (30 AI requests / 10 min per IP; 300 general requests / 15 min), and return Arabic error messages.

## Project Structure

```
├── server.ts               # Express entry: middleware, static, SPA fallback
├── server/
│   ├── routes.ts           # All API routes (zod validation, multer)
│   ├── ai.ts               # Gemini client + prompt helpers
│   └── db.ts               # JSON file store (atomic, seeded)
├── src/
│   ├── components/         # Layout, TimelineChart, VoiceAssistant, ErrorBoundary
│   ├── pages/              # All routes incl. SharedCase & NotFound
│   └── lib/                # storage, api client, pdf export, caseStore, pure logic
├── tests/                  # Vitest unit tests
└── data/                   # Runtime store (gitignored): JSON + uploads
```

## Privacy & Content Notes

- The platform collects sensitive personal data (national ID, medical documents). Before any public deployment you **must** add a privacy policy aligned with Jordan's Personal Data Protection Law (No. 24 of 2023), plus terms of use.
- Uploaded evidence is stored on the server filesystem without authentication in this MVP — add authentication and encryption at rest before production use.
- Precedent numbers in `src/pages/Precedents.tsx` are illustrative and should be verified by a licensed lawyer before publication.
- All AI output is informational, carries no legal liability, and drafts must pass the lawyer review workflow before official use.

## Roadmap Ideas

- Authentication + multi-device sync of the case store
- Real Google Drive OAuth backup flow
- Statute-of-limitations deadline engine driven by the accident date
- Admin panel for story moderation and draft review
- OCR for scanned evidence (Gemini vision)

## License

Apache-2.0 — see [LICENSE](./LICENSE).

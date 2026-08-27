/**
 * Arabic-safe PDF export.
 * The browser renders the Arabic markup (correct RTL shaping), then html2canvas
 * rasterizes it and jsPDF slices it into A4 pages. Libraries are imported
 * dynamically to keep the main bundle small.
 */

const A4_WIDTH_PX = 794; // 96dpi

export function createHiddenContainer(html: string, width = A4_WIDTH_PX): HTMLElement {
  const el = document.createElement("div");
  el.dir = "rtl";
  el.lang = "ar";
  el.innerHTML = html;
  Object.assign(el.style, {
    position: "fixed",
    top: "0",
    left: "-10000px",
    width: `${width}px`,
    backgroundColor: "#ffffff",
    fontFamily: "'Tajawal', 'Segoe UI', Tahoma, sans-serif",
    padding: "32px",
    boxSizing: "border-box",
    zIndex: "-1",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(el);
  return el;
}

export async function exportElementToPdf(el: HTMLElement, filename: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
    logging: false,
  });
  const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.92);

  let remaining = imgH;
  let position = 0;
  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  remaining -= pageH;
  while (remaining > 1) {
    position -= pageH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    remaining -= pageH;
  }
  pdf.save(filename);
}

export async function exportMarkupToPdf(html: string, filename: string): Promise<void> {
  const el = createHiddenContainer(html);
  try {
    await exportElementToPdf(el, filename);
  } finally {
    el.remove();
  }
}

/* ----------------------- dossier document builders ----------------------- */

const section = (title: string, body: string): string => `
  <div style="margin-top:24px;">
    <h2 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 10px;border-bottom:2px solid #10b981;padding-bottom:6px;">${title}</h2>
    <div style="font-size:13px;color:#334155;line-height:1.9;">${body}</div>
  </div>`;

const listItems = (items: string[]): string =>
  items.length
    ? `<ul style="margin:0;padding-right:18px;">${items
        .map((i) => `<li style="margin-bottom:6px;">${i}</li>`)
        .join("")}</ul>`
    : `<p style="margin:0;color:#94a3b8;">لا توجد بيانات مسجلة في هذا القسم بعد.</p>`;

export interface DossierData {
  caseId: string;
  exportedAt: string;
  profile?: Record<string, string>;
  tasks?: Array<{ title: string; completed: boolean }>;
  workflow?: Array<{ title: string; completed: boolean }>;
  evaluation?: { score: number; label: string; description: string } | null;
  calculator?: { advice: string; rights: string[] } | null;
  drafts?: Array<{ label: string; createdAt: string; content: string }>;
  evidenceFiles?: Array<{ originalname: string; uploadedAt: string; category: string }>;
}

export function buildDossierHtml(data: DossierData): string {
  const header = `
    <div style="display:flex;align-items:center;gap:12px;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:8px;">
      <div style="width:40px;height:40px;border-radius:8px;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;">ح</div>
      <div>
        <h1 style="font-size:22px;font-weight:800;color:#0f172a;margin:0;">ملف القضية الشامل — منصة حقي</h1>
        <p style="font-size:12px;color:#64748b;margin:4px 0 0;">رقم الملف: ${data.caseId} · تاريخ التصدير: ${data.exportedAt}</p>
      </div>
    </div>`;

  const profileRows = Object.entries(data.profile ?? {})
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 10px;border:1px solid #e2e8f0;background:#f8fafc;font-weight:700;width:220px;">${k}</td><td style="padding:6px 10px;border:1px solid #e2e8f0;">${v}</td></tr>`
    )
    .join("");

  const tasks = (data.tasks ?? []).map(
    (t) =>
      `<li style="margin-bottom:6px;list-style:none;">${t.completed ? "✅" : "⬜"} ${t.title}</li>`
  );

  const workflow = (data.workflow ?? []).map(
    (s) =>
      `<li style="margin-bottom:6px;list-style:none;">${s.completed ? "✅" : "⬜"} ${s.title}</li>`
  );

  const evaluation = data.evaluation
    ? `<p style="margin:0 0 8px;"><strong>النتيجة:</strong> ${data.evaluation.score}% — ${data.evaluation.label}</p><p style="margin:0;color:#475569;">${data.evaluation.description}</p>`
    : "";

  const calculator = data.calculator
    ? `<p style="margin:0 0 8px;">${data.calculator.advice}</p>${listItems(data.calculator.rights)}`
    : "";

  const drafts = (data.drafts ?? [])
    .map(
      (d) =>
        `<div style="border:1px solid #e2e8f0;border-radius:10px;padding:14px;margin-bottom:12px;"><p style="margin:0 0 8px;font-weight:700;color:#0f172a;">${d.label} <span style="color:#94a3b8;font-weight:400;font-size:11px;">(${d.createdAt})</span></p><pre style="white-space:pre-wrap;font-family:inherit;font-size:12px;color:#334155;margin:0;line-height:1.8;">${d.content}</pre></div>`
    )
    .join("");

  const evidence = data.evidenceFiles?.length
    ? listItems(
        data.evidenceFiles.map(
          (f) => `${f.originalname} — ${f.category} — ${f.uploadedAt.slice(0, 10)}`
        )
      )
    : `<p style="margin:0;color:#94a3b8;">لم يتم رفع ملفات بعد.</p>`;

  const disclaimer = `<p style="margin-top:28px;font-size:11px;color:#94a3b8;border-top:1px dashed #e2e8f0;padding-top:12px;line-height:1.8;">إخلاء مسؤولية: هذا الملف مولد إرشادياً عبر منصة حقي ولا يعتبر بديلاً عن الاستشارة القانونية المتخصصة. يُنصح بمراجعة محامٍ مرخص قبل اتخاذ أي إجراء قانوني.</p>`;

  return `
    ${header}
    ${profileRows ? section("بيانات الملف", `<table style="border-collapse:collapse;width:100%;">${profileRows}</table>`) : ""}
    ${data.tasks ? section("خطة العمل المقترحة", tasks.length ? `<ul style="margin:0;padding:0;">${tasks.join("")}</ul>` : "") : ""}
    ${data.workflow ? section("مسار القضية (الخطوات المنجزة معلّمة)", workflow.length ? `<ul style="margin:0;padding:0;">${workflow.join("")}</ul>` : "") : ""}
    ${data.evaluation ? section("تقييم قوة القضية", evaluation) : ""}
    ${data.calculator ? section("الحقوق التقديرية للحالة", calculator) : ""}
    ${data.drafts ? section("المسودات القانونية المحفوظة", drafts || "") : ""}
    ${section("الأدلة والمرفقات المرفوعة", evidence)}
    ${disclaimer}
  `;
}

export function buildDraftHtml(title: string, content: string, signatureImg?: string | null): string {
  return `
    <div style="border-bottom:1px solid #e2e8f0;padding-bottom:12px;margin-bottom:18px;">
      <h1 style="font-size:18px;font-weight:800;color:#0f172a;margin:0;">${title}</h1>
      <p style="font-size:11px;color:#94a3b8;margin:4px 0 0;">منصة حقي — الصياغة القانونية الذكية</p>
    </div>
    <pre style="white-space:pre-wrap;font-family:inherit;font-size:13px;color:#1e293b;line-height:2;margin:0;">${content}</pre>
    ${
      signatureImg
        ? `<div style="margin-top:40px;border-top:1px solid #cbd5e1;padding-top:16px;"><p style="font-size:12px;font-weight:700;color:#334155;margin:0 0 10px;">توقيع الموكل (إلكتروني):</p><img src="${signatureImg}" style="height:90px;" /></div>`
        : ""
    }
    <p style="margin-top:24px;font-size:10px;color:#94a3b8;">تنبيه: جميع المستندات المولدة يجب أن تمر عبر مسار المراجعة القانونية قبل اعتمادها رسمياً.</p>
  `;
}

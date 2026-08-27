import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FolderDown, ShieldCheck, Loader2, AlertCircle, CheckCircle2, Circle, Scale } from "lucide-react";
import { api } from "../lib/api";
import type { DossierData } from "../lib/pdf";

/** Read-only viewer for a case dossier shared via /shared/:token (same design language as the app). */
export default function SharedCase() {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<DossierData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api<{ payload: DossierData }>(`/api/share/${token}`);
        if (!cancelled) setData(res.payload);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "تعذر تحميل الملف المشترك.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center text-slate-500 flex items-center justify-center gap-2" dir="rtl">
        <Loader2 className="w-5 h-5 animate-spin" />
        جاري تحميل الملف المشترك...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-5" dir="rtl">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">تعذر الوصول للملف</h1>
        <p className="text-slate-600">{error ?? "لم يتم العثور على الملف المشترك."}</p>
        <Link to="/" className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12" dir="rtl">
      {/* Header */}
      <div className="bg-indigo-900 rounded-2xl p-6 md:p-8 text-white space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-800 rounded-xl">
            <FolderDown className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ملف قضية مشترك — منصة حقي</h1>
            <p className="text-indigo-200 text-sm mt-1">
              رقم الملف: {data.caseId} · تاريخ المشاركة: {data.exportedAt}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-indigo-100 text-xs leading-relaxed bg-indigo-800/60 rounded-xl p-3">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
          هذا الملف معروض للاطلاع فقط. المعلومات إرشادية ولا تغني عن الاستشارة القانونية المتخصصة.
        </div>
      </div>

      {/* Profile */}
      {data.profile && Object.values(data.profile).some(Boolean) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">بيانات الملف</h2>
          <dl className="grid sm:grid-cols-2 gap-3">
            {Object.entries(data.profile)
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <dt className="text-xs text-slate-500 font-medium">{k}</dt>
                  <dd className="text-slate-800 font-bold mt-0.5">{v}</dd>
                </div>
              ))}
          </dl>
        </div>
      )}

      {/* Evaluation */}
      {data.evaluation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">تقييم قوة القضية</h2>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-emerald-600">{data.evaluation.score}%</span>
            <span className="text-lg font-bold px-3 py-1 rounded-lg bg-emerald-500 text-white">
              {data.evaluation.label}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed text-sm">{data.evaluation.description}</p>
        </div>
      )}

      {/* Tasks */}
      {data.tasks && data.tasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">خطة العمل</h2>
          <ul className="space-y-2">
            {data.tasks.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                {t.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                {t.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Workflow */}
      {data.workflow && data.workflow.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">مسار القضية</h2>
          <ul className="space-y-2">
            {data.workflow.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-slate-700 text-sm">
                {s.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                {s.title}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drafts */}
      {data.drafts && data.drafts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">المسودات القانونية</h2>
          {data.drafts.map((d, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-400" />
                <h3 className="font-bold text-slate-900">{d.label}</h3>
                <span className="text-xs text-slate-400">({d.createdAt})</span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 leading-relaxed max-h-64 overflow-y-auto">
                {d.content}
              </pre>
            </div>
          ))}
        </div>
      )}

      {/* Evidence */}
      {data.evidenceFiles && data.evidenceFiles.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <h2 className="text-lg font-bold text-slate-900">الأدلة والمرفقات</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.evidenceFiles.map((f, i) => (
              <li key={i} className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span>{f.originalname}</span>
                <span className="text-xs text-slate-400">{f.uploadedAt.slice(0, 10)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

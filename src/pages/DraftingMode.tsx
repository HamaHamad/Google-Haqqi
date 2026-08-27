import { useState, useRef } from "react";
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from "react";
import { FileText, Wand2, Download, Copy, RefreshCw, PenTool, X, CheckCircle2, Loader2, PencilLine, Save } from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";
import { getCaseId, getIntakeTranscript, profileForDrafting, saveDraft } from "../lib/caseStore";
import { buildDraftHtml, exportMarkupToPdf } from "../lib/pdf";

const TEMPLATES = [
  { id: 'insurer_demand', label: 'إنذار لشركة التأمين (مطالبة مالية)' },
  { id: 'cbj_complaint', label: 'شكوى للبنك المركزي' },
  { id: 'statement_of_claim', label: 'لائحة دعوى (صلح/بداية)' },
  { id: 'settlement_release', label: 'مخالصة وإسقاط حق' },
  { id: 'power_of_attorney', label: 'نموذج توكيل محامي (وكالة خاصة)' }
];

const DRAFT_ERROR = "تعذر توليد المسودة. تأكد من تشغيل الخدمة الخلفية وتوفر مفتاح الذكاء الاصطناعي، ثم حاول مرة أخرى.";

export default function DraftingMode() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  
  // Signature States
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate scale to match canvas internal resolution vs css size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // slate-900
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImg(canvas.toDataURL("image/png"));
      setShowSignatureModal(false);
    }
  };

  const generateDraft = async () => {
    setIsGenerating(true);
    setDraftError(null);
    setReviewStatus('idle');
    try {
      // Use the real case profile + AI intake transcript instead of hardcoded demo data.
      // Missing fields are sent as [placeholders] which the model keeps in the document.
      const caseData = {
        caseId: getCaseId(),
        ...profileForDrafting(),
      };
      const data = await api<{ text: string }>("/api/drafts/generate", {
        json: {
          templateType: selectedTemplate,
          caseData,
          intakeTranscript: getIntakeTranscript(),
        },
      });
      setDraft(data.text);
      setIsEditing(false);
      setSignatureImg(null); // Reset signature when a new draft is generated
      saveDraft({
        templateType: selectedTemplate,
        label: TEMPLATES.find(t => t.id === selectedTemplate)?.label ?? selectedTemplate,
        content: data.text,
      });
    } catch (error) {
      console.error(error);
      setDraftError(error instanceof Error ? error.message : DRAFT_ERROR);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // clipboard unavailable (e.g. insecure context)
    }
  };

  const handleDownload = async () => {
    if (!draft) return;
    setIsDownloading(true);
    try {
      const label = TEMPLATES.find(t => t.id === selectedTemplate)?.label ?? 'مسودة قانونية';
      await exportMarkupToPdf(buildDraftHtml(label, draft, signatureImg), `haqqi-draft-${selectedTemplate}.pdf`);
    } catch (error) {
      console.error(error);
      alert("تعذر تحميل ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendForReview = async () => {
    if (!draft) return;
    setReviewStatus('sending');
    try {
      await api("/api/drafts/review", {
        json: {
          caseId: getCaseId(),
          templateType: selectedTemplate,
          content: draft,
        },
      });
      setReviewStatus('sent');
    } catch (error) {
      console.error(error);
      setReviewStatus('idle');
      alert("تعذر إرسال المسودة للمراجعة. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">الصياغة القانونية الذكية</h1>
        <p className="text-slate-600">إنشاء مسودات قانونية مدعمة بنصوص القانون الأردني ومراجعة من قبل محامين.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">اختر نوع المستند</h3>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={cn(
                    "w-full text-right px-4 py-3 rounded-lg text-sm font-medium transition-colors border",
                    selectedTemplate === t.id
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-white border-slate-100 text-slate-600 hover:border-emerald-100"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <button
                onClick={generateDraft}
                disabled={isGenerating}
                className="w-full flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors font-medium"
              >
                {isGenerating ? (
                  <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5 ml-2" />
                )}
                {isGenerating ? 'جاري الصياغة...' : 'توليد المسودة بذكاء'}
              </button>
            </div>
            
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800 leading-relaxed">
              <strong>تنبيه هام:</strong> جميع المستندات المولدة يجب أن تمر عبر مسار المراجعة القانونية (Lawyer Review Workflow) قبل إرسالها أو اعتمادها رسمياً.
            </div>
          </div>
        </div>

        {/* Draft Editor Area */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[600px] overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center text-slate-700 font-medium">
                <FileText className="w-5 h-5 ml-2 text-slate-400" />
                المسودة الحالية
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="p-2 text-slate-500 hover:bg-slate-200 rounded transition-colors" title="نسخ">
                  {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                <button onClick={handleDownload} disabled={isDownloading} className="p-2 text-slate-500 hover:bg-slate-200 rounded transition-colors disabled:opacity-50" title="تحميل PDF">
                  {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {draftError && (
                <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm leading-relaxed flex items-start gap-2">
                  <X className="w-4 h-4 mt-0.5 shrink-0" />
                  {draftError}
                </div>
              )}
              {draft ? (
                isEditing ? (
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    dir="rtl"
                    className="w-full h-full min-h-[400px] p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-sm leading-loose text-slate-800 bg-white"
                  />
                ) : (
                <div className="prose prose-slate max-w-none font-mono text-sm leading-loose whitespace-pre-wrap pb-12">
                  {draft}
                  {signatureImg && (
                    <div className="mt-12 pt-8 border-t border-slate-200">
                      <p className="font-bold text-slate-800 mb-4">توقيع الموكل (إلكتروني):</p>
                      <div className="bg-white border border-slate-200 rounded-xl p-4 inline-block shadow-sm">
                        <img src={signatureImg} alt="التوقيع" className="h-24 object-contain" />
                      </div>
                    </div>
                  )}
                </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                  <FileText className="w-16 h-16 opacity-20" />
                  <p>اختر نوع المستند واضغط على "توليد المسودة"</p>
                </div>
              )}
            </div>
            
            {draft && (
              <div className="p-4 border-t border-slate-100 bg-white flex justify-between gap-3">
                <button 
                  onClick={() => setShowSignatureModal(true)}
                  className="flex items-center px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 font-medium text-sm transition-colors border border-indigo-100"
                >
                  <PenTool className="w-4 h-4 ml-2" />
                  توقيع إلكتروني
                </button>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (isEditing && draft) {
                        // Persist the manually edited draft
                        saveDraft({
                          templateType: selectedTemplate,
                          label: TEMPLATES.find(t => t.id === selectedTemplate)?.label ?? selectedTemplate,
                          content: draft,
                        });
                      }
                      setIsEditing(!isEditing);
                    }}
                    className={cn(
                      "flex items-center px-6 py-2.5 border rounded-lg font-medium text-sm transition-colors",
                      isEditing
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-slate-300 text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-4 h-4 ml-2" />
                        حفظ التعديلات
                      </>
                    ) : (
                      <>
                        <PencilLine className="w-4 h-4 ml-2" />
                        تعديل يدوي
                      </>
                    )}
                  </button>
                  <button 
                    onClick={handleSendForReview}
                    disabled={reviewStatus !== 'idle'}
                    className={cn(
                      "flex items-center px-6 py-2.5 rounded-lg font-medium text-sm transition-colors",
                      reviewStatus === 'sent'
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70"
                    )}
                  >
                    {reviewStatus === 'sending' ? (
                      <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الإرسال...</>
                    ) : reviewStatus === 'sent' ? (
                      <><CheckCircle2 className="w-4 h-4 ml-2" /> تم الإرسال للمراجعة</>
                    ) : (
                      "إرسال للمراجعة القانونية"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900">توقيع المستند إلكترونياً</h3>
              <button onClick={() => setShowSignatureModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">يرجى التوقيع داخل المربع أدناه باستخدام الماوس أو اللمس:</p>
              <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-slate-50 touch-none">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={200}
                  className="w-full h-[200px] cursor-crosshair block"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex justify-between items-center mt-6">
                <button onClick={clearSignature} className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors">
                  مسح التوقيع
                </button>
                <div className="flex gap-2">
                   <button onClick={() => setShowSignatureModal(false)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                     إلغاء
                   </button>
                   <button onClick={saveSignature} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors shadow-sm">
                     اعتماد التوقيع
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

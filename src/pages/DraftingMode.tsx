import { useState, useRef } from "react";
import { FileText, Wand2, Download, Copy, RefreshCw, PenTool, X } from "lucide-react";
import { cn } from "../lib/utils";

const TEMPLATES = [
  { id: 'insurer_demand', label: 'إنذار لشركة التأمين (مطالبة مالية)' },
  { id: 'cbj_complaint', label: 'شكوى للبنك المركزي' },
  { id: 'statement_of_claim', label: 'لائحة دعوى (صلح/بداية)' },
  { id: 'settlement_release', label: 'مخالصة وإسقاط حق' },
  { id: 'power_of_attorney', label: 'نموذج توكيل محامي (وكالة خاصة)' }
];

export default function DraftingMode() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  
  // Signature States
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureImg, setSignatureImg] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
    try {
      const response = await fetch('/api/drafts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: selectedTemplate,
          caseData: {
            clientName: "أحمد عبدالله",
            nationalId: "9876543210",
            lawyerName: "[اسم المحامي الموكل]",
            accidentDate: "2026-08-01",
            injuries: true,
            medicalBills: 500,
            insurerName: "شركة التأمين الوطنية"
          } // Mock data for now, would come from context/state
        })
      });
      const data = await response.json();
      setDraft(data.text);
      setSignatureImg(null); // Reset signature when a new draft is generated
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
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
              <strong>تنبيه هام:</strong> جميع المستودات المولدة يجب أن تمر عبر مسار المراجعة القانونية (Lawyer Review Workflow) قبل إرسالها أو اعتمادها رسمياً.
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
                <button className="p-2 text-slate-500 hover:bg-slate-200 rounded transition-colors" title="نسخ">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-500 hover:bg-slate-200 rounded transition-colors" title="تحميل">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
              {draft ? (
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
                  <button className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors">
                    تعديل يدوي
                  </button>
                  <button className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm transition-colors">
                    إرسال للمراجعة القانونية
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

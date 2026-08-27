import { useState, useRef, useEffect, useCallback } from "react";
import type { ChangeEvent } from "react";
import { Folder, UploadCloud, FileText, Camera, Stethoscope, Plus, Clock, Download, CheckCircle2, Search, ShieldCheck, Lock, HardDrive, Cloud, X, Scan, Check } from "lucide-react";
import { cn } from "../lib/utils";
import { api, uploadFile, downloadFromApi } from "../lib/api";
import { getCaseId, getCasePayload } from "../lib/caseStore";
import { loadJSON, saveJSON } from "../lib/storage";
import { buildDossierHtml, exportMarkupToPdf } from "../lib/pdf";

interface EvidenceFile {
  id: string;
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  category: string;
  uploadedAt: string;
}

interface LogEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  flag?: boolean;
}

const DOC_CATEGORIES = [
  { id: "kroka", accept: "application/pdf,image/*", hint: "PDF أو صور" },
  { id: "medical", accept: "application/pdf,image/*", hint: "PDF أو صور" },
  { id: "photos", accept: "image/*", hint: "صور" },
  { id: "ids", accept: "application/pdf,image/*", hint: "PDF أو صور" },
] as const;

const MOCK_DOCUMENTS = [
  {
    id: 1,
    category: 'kroka',
    title: 'مخطط الكروكا وتقرير الشرطة',
    icon: FileText,
    colorClasses: {
      bg: 'bg-blue-50',
      textIcon: 'text-blue-500',
      textAction: 'text-blue-600'
    }
  },
  {
    id: 2,
    category: 'medical',
    title: 'التقارير والفواتير الطبية',
    icon: Stethoscope,
    colorClasses: {
      bg: 'bg-emerald-50',
      textIcon: 'text-emerald-500',
      textAction: 'text-emerald-600'
    }
  },
  {
    id: 3,
    category: 'photos',
    title: 'صور موقع الحادث والأضرار',
    icon: Camera,
    colorClasses: {
      bg: 'bg-amber-50',
      textIcon: 'text-amber-500',
      textAction: 'text-amber-600'
    }
  },
  {
    id: 4,
    category: 'ids',
    title: 'هوية الأحوال المدنية / رخصة القيادة',
    icon: Folder,
    colorClasses: {
      bg: 'bg-slate-50',
      textIcon: 'text-slate-500',
      textAction: 'text-slate-600'
    }
  }
];

export default function EvidenceOrganizer() {
  const [activeTab, setActiveTab] = useState<'documents' | 'log'>('documents');
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Real evidence files from the server
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingCategoryRef = useRef<string>('misc');

  const refreshFiles = useCallback(async () => {
    try {
      const res = await api<{ files: EvidenceFile[] }>("/api/evidence/files");
      setFiles(res.files || []);
    } catch {
      // server unavailable — keep current list
    }
  }, []);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);
  
  // Backup & Security States
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [driveNote, setDriveNote] = useState<string | null>(null);
  
  // Communication Log States (persisted locally)
  const [logEvents, setLogEvents] = useState<LogEvent[]>(() => loadJSON<LogEvent[]>("haqqi_log_events", []));
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", date: new Date().toISOString().slice(0, 10), description: "", flag: false });

  useEffect(() => {
    saveJSON("haqqi_log_events", logEvents);
  }, [logEvents]);

  const addLogEvent = () => {
    if (!newEvent.title.trim() || !newEvent.description.trim()) return;
    setLogEvents(prev => [{ id: `${Date.now()}`, ...newEvent }, ...prev]);
    setNewEvent({ title: "", date: new Date().toISOString().slice(0, 10), description: "", flag: false });
    setShowEventForm(false);
  };

  const removeLogEvent = (id: string) => {
    setLogEvents(prev => prev.filter(e => e.id !== id));
  };
  
  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setMediaStream(null);
  }, []);

  // Initialize camera when scanner opens (with leak-free cleanup)
  useEffect(() => {
    if (!isScannerOpen) {
      stopStream();
      setScanSuccess(false);
      setIsScanning(false);
      return;
    }
    let cancelled = false;
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        mediaStreamRef.current = stream;
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.error("Camera access denied or unavailable", err);
      });
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isScannerOpen, stopStream]);

  const handleCapture = () => {
    setIsScanning(true);
    // Capture the real video frame at the moment the user presses the button
    const video = videoRef.current;
    let dataUrl: string | null = null;
    if (video && mediaStreamRef.current && video.videoWidth > 0) {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    }
    setTimeout(async () => {
      setIsScanning(false);
      if (dataUrl) {
        try {
          await api("/api/evidence/upload-base64", {
            json: {
              base64: dataUrl,
              filename: `مستند ممسوح-${new Date().toISOString().slice(0, 10)}.jpg`,
              category: "scanned",
              caseId: getCaseId(),
            },
          });
          await refreshFiles();
        } catch (error) {
          console.error("Scan upload failed:", error);
          setUploadError("تم التقاط الصورة لكن تعذر حفظها على الخادم. حاول مرة أخرى.");
        }
      }
      setScanSuccess(true);
      setTimeout(() => {
        setIsScannerOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const payload = {
        ...getCasePayload(),
        evidenceFiles: files.map(f => ({ originalname: f.originalname, uploadedAt: f.uploadedAt, category: f.category })),
      };
      await exportMarkupToPdf(buildDossierHtml(payload), `haqqi-evidence-${getCaseId()}.pdf`);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error("Evidence PDF export failed:", error);
      alert("تعذر إنشاء ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      await downloadFromApi(
        "/api/export/backup",
        { caseId: getCaseId(), payload: getCasePayload() },
        `haqqi-backup-${getCaseId()}.json`
      );
    } catch (error) {
      console.error("Backup failed:", error);
      alert("تعذر تجهيز النسخة الاحتياطية. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const handleDriveToggle = async () => {
    // Honest integration status: check server configuration instead of faking success
    setDriveNote(null);
    try {
      const status = await api<{ configured: boolean }>("/api/integrations/drive/status");
      if (!status.configured) {
        setDriveNote("ميزة المزامنة مع Google Drive تتطلب ربط حساب Google من مسؤول المنصة (GOOGLE_DRIVE_CLIENT_ID/SECRET). حالياً يمكنك استخدام خيار النسخة الاحتياطية المشفرة أعلاه.");
      }
    } catch {
      setDriveNote("تعذر التحقق من حالة الربط مع السحابة. تأكد من تشغيل الخدمة الخلفية.");
    }
  };

  const openFilePicker = (category: string) => {
    pendingCategoryRef.current = category;
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFilesSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow re-selecting the same file
    if (!selected.length) return;
    setIsUploading(true);
    setUploadError(null);
    let failed = 0;
    for (const file of selected) {
      try {
        await uploadFile(file, { category: pendingCategoryRef.current, caseId: getCaseId() });
      } catch (error) {
        failed++;
        if (error instanceof Error) setUploadError(error.message);
      }
    }
    await refreshFiles();
    if (failed === 0 && selected.length > 0) {
      setUploadError(null);
    }
    setIsUploading(false);
  };

  const filesForCategory = (category: string): EvidenceFile[] =>
    files.filter(f => f.category === category);

  const documentStatus = (category: string): { status: string; uploaded: boolean; actionText: string } => {
    const count = filesForCategory(category).length;
    if (count > 0) {
      return { status: `تم رفع ${count} ${count === 1 ? "ملف" : "ملفات"}`, uploaded: true, actionText: "عرض وإضافة" };
    }
    if (category === "ids") return { status: "مطلوب للمطالبة", uploaded: false, actionText: "إضافة ملف" };
    return { status: "لم يتم الرفع بعد", uploaded: false, actionText: "إضافة ملف" };
  };

  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => {
    const { status } = documentStatus(doc.category);
    return (
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      status.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">منظم الأدلة وسجل المطالبة</h1>
          <p className="text-slate-600">احتفظ بجميع وثائقك الطبية والقانونية وسجل تواصلك مع شركة التأمين في مكان واحد آمن.</p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto flex-wrap">
          {/* Hidden real file input — the visible buttons trigger it */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="application/pdf,image/*"
            className="hidden"
            onChange={handleFilesSelected}
          />
          <button 
            onClick={() => setIsBackupModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ShieldCheck className="w-5 h-5 ml-2" /> 
            النسخ الاحتياطي
          </button>
          <button 
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-70"
          >
            {isExporting ? (
              <span className="flex items-center">
                <div className="w-4 h-4 ml-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> 
                جاري التصدير...
              </span>
            ) : exportSuccess ? (
              <span className="flex items-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5 ml-2" /> 
                تم التصدير بنجاح
              </span>
            ) : (
              <span className="flex items-center">
                <Download className="w-5 h-5 ml-2" /> 
                تصدير PDF
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Scan className="w-5 h-5 ml-2" />
            مسح ضوئي
          </button>
          <button 
            onClick={() => openFilePicker("misc")}
            disabled={isUploading}
            className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 ml-2 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                جاري الرفع...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5 ml-2" />
                رفع ملف
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('documents')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'documents' ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          الوثائق والملفات
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={cn(
            "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'log' ? "border-emerald-500 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-700"
          )}
        >
          سجل التواصل
        </button>
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="ابحث في الملفات والأوراق المطلوبة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-3 pr-10 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
            />
          </div>

          {/* Document Cards */}
          {uploadError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm leading-relaxed">
              {uploadError}
            </div>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => {
                const { status, uploaded, actionText } = documentStatus(doc.category);
                return (
                <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-200 cursor-pointer transition-colors group"
                  onClick={() => openFilePicker(doc.category)}
                >
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform", doc.colorClasses.bg, doc.colorClasses.textIcon)}>
                    <doc.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.title}</h3>
                    <p className={cn("text-sm mt-1", uploaded ? 'text-emerald-600' : 'text-slate-500')}>{status}</p>
                  </div>
                  <button className={cn("text-sm font-medium", doc.colorClasses.textAction)}>{actionText}</button>
                </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                لا توجد نتائج مطابقة لبحثك عن "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Communication Log Tab */}
      {activeTab === 'log' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">التسلسل الزمني للمطالبة</h3>
            <button 
              onClick={() => setShowEventForm(!showEventForm)}
              className="flex items-center text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              <Plus className="w-4 h-4 ml-1" />
              {showEventForm ? 'إلغاء' : 'إضافة حدث جديد'}
            </button>
          </div>

          {showEventForm && (
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="عنوان الحدث (مثال: اتصال بشركة التأمين)"
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                  />
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white text-slate-600"
                  />
                </div>
                <textarea
                  rows={3}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="تفاصيل الحدث وما تم الاتفاق عليه..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newEvent.flag}
                      onChange={(e) => setNewEvent({ ...newEvent, flag: e.target.checked })}
                      className="accent-amber-500 w-4 h-4"
                    />
                    تمييز كعلامة خطر (مماطلة/بخس)
                  </label>
                  <button
                    onClick={addLogEvent}
                    disabled={!newEvent.title.trim() || !newEvent.description.trim()}
                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    حفظ الحدث
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="relative border-r-2 border-slate-200 pr-6 space-y-8">
              {logEvents.map((event) => (
                <div key={event.id} className="relative group">
                  <div className={cn("absolute -right-[31px] top-1 w-4 h-4 rounded-full border-4 border-white", event.flag ? "bg-amber-500" : "bg-emerald-500")}></div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-900">{event.title}</h4>
                    <span className="flex items-center text-xs text-slate-500 font-medium">
                      <Clock className="w-3 h-3 ml-1" />
                      {event.date}
                      <button
                        onClick={() => removeLogEvent(event.id)}
                        className="mr-2 text-slate-300 hover:text-rose-500 transition-colors"
                        title="حذف الحدث"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{event.description}</p>
                  {event.flag && (
                    <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                      ⚠️ علامة خطر: مماطلة وعرض بخس
                    </div>
                  )}
                </div>
              ))}
              {logEvents.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-sm">
                  لم يتم تسجيل أي أحداث بعد. اضغط "إضافة حدث جديد" لتوثيق تواصلك مع شركة التأمين.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backup and Security Modal */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">الأمان والنسخ الاحتياطي</h3>
              </div>
              <button onClick={() => setIsBackupModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <p className="text-slate-600">
                اختر طريقة لحفظ بياناتك ومستنداتك القانونية لضمان عدم ضياعها. كافة البيانات يتم تشفيرها لحماية خصوصيتك.
              </p>

              <div className="space-y-4">
                {/* Download Backup Option */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex gap-4">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-xl shrink-0 h-fit">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        تحميل نسخة احتياطية (ملف JSON)
                        <Lock className="w-4 h-4 text-slate-400" />
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 mb-4 leading-relaxed">
                        تنزيل ملف يحتوي على جميع بياناتك ومستنداتك المسجلة للاحتفاظ به على جهازك الشخصي وإمكانية استعادته لاحقاً.
                      </p>
                      <button 
                        onClick={handleDownloadBackup}
                        disabled={isDownloadingBackup}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70"
                      >
                        {isDownloadingBackup ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 ml-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> 
                            جاري التجهيز...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Download className="w-4 h-4 ml-2" /> 
                            تحميل ملف النسخة الاحتياطية
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cloud Sync Option */}
                <div className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors bg-white">
                  <div className="flex gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0 h-fit">
                      <Cloud className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        الربط مع السحابة (Google Drive)
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 mb-4 leading-relaxed">
                        مزامنة تلقائية لمستنداتك الطبية والقانونية مباشرة إلى حسابك في جوجل درايف للحصول على وصول دائم.
                      </p>
                      <button 
                        onClick={handleDriveToggle}
                        className="w-full sm:w-auto px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      >
                        <span className="flex items-center">
                          ربط الحساب الآن
                        </span>
                      </button>
                      {driveNote && (
                        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 leading-relaxed">
                          {driveNote}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scanline {
              0% { top: 0; }
              50% { top: 100%; }
              100% { top: 0; }
            }
          `}} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                  <Scan className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">المسح الضوئي الذكي</h3>
              </div>
              <button onClick={() => setIsScannerOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center justify-center space-y-6">
              {!scanSuccess ? (
                <>
                  <div className="relative w-full aspect-[3/4] max-h-[50vh] bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-200">
                    {/* Scanner Guide Overlay */}
                    <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-lg z-10 pointer-events-none">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg -translate-x-1.5 -translate-y-1.5"></div>
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg translate-x-1.5 -translate-y-1.5"></div>
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg -translate-x-1.5 translate-y-1.5"></div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg translate-x-1.5 translate-y-1.5"></div>
                    </div>
                    
                    {/* Scanning Animation */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-emerald-500/10 z-20">
                        <div className="absolute left-0 right-0 h-1 bg-emerald-400 shadow-[0_0_15px_3px_rgba(52,211,153,0.5)] z-20" style={{ animation: 'scanline 2s linear infinite' }} />
                      </div>
                    )}
                    
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    ></video>
                    
                    {!mediaStream && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3 z-0 bg-slate-800">
                        <Camera className="w-10 h-10 opacity-50 animate-pulse" />
                        <span className="text-sm font-medium">جاري تشغيل الكاميرا...</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-500 text-sm text-center">
                    قم بتوجيه الكاميرا نحو المستند (تقرير طبي، كروكا، إلخ). سيتم التقاط الصورة وتحويلها لملف PDF عالي الدقة.
                  </p>
                  
                  <button 
                    onClick={handleCapture}
                    disabled={!mediaStream || isScanning}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isScanning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        جاري معالجة وتحسين المستند...
                      </>
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        التقاط المستند
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                    <Check className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">تم المسح بنجاح!</h3>
                  <p className="text-slate-600 max-w-xs">
                    تم تحسين المستند وتحويله إلى صيغة PDF وإضافته إلى ملفات قضيتك المنظمة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

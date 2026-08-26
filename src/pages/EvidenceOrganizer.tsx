import { useState, useRef, useEffect } from "react";
import { Folder, UploadCloud, FileText, Camera, Stethoscope, Plus, Clock, Download, CheckCircle2, Search, ShieldCheck, Lock, HardDrive, Cloud, X, Scan, Check } from "lucide-react";
import { cn } from "../lib/utils";

const MOCK_DOCUMENTS = [
  {
    id: 1,
    title: 'مخطط الكروكا وتقرير الشرطة',
    status: 'لم يتم الرفع بعد',
    icon: FileText,
    colorClasses: {
      bg: 'bg-blue-50',
      textIcon: 'text-blue-500',
      textAction: 'text-blue-600'
    },
    actionText: 'إضافة ملف'
  },
  {
    id: 2,
    title: 'التقارير والفواتير الطبية',
    status: 'تم رفع 3 ملفات',
    icon: Stethoscope,
    colorClasses: {
      bg: 'bg-emerald-50',
      textIcon: 'text-emerald-500',
      textAction: 'text-emerald-600'
    },
    actionText: 'عرض وإضافة'
  },
  {
    id: 3,
    title: 'صور موقع الحادث والأضرار',
    status: 'لم يتم الرفع بعد',
    icon: Camera,
    colorClasses: {
      bg: 'bg-amber-50',
      textIcon: 'text-amber-500',
      textAction: 'text-amber-600'
    },
    actionText: 'إضافة ملف'
  },
  {
    id: 4,
    title: 'هوية الأحوال المدنية / رخصة القيادة',
    status: 'مطلوب للمطالبة',
    icon: Folder,
    colorClasses: {
      bg: 'bg-slate-50',
      textIcon: 'text-slate-500',
      textAction: 'text-slate-600'
    },
    actionText: 'إضافة ملف'
  }
];

export default function EvidenceOrganizer() {
  const [activeTab, setActiveTab] = useState<'documents' | 'log'>('documents');
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Backup & Security States
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  
  // Scanner States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Initialize camera when scanner opens
  useEffect(() => {
    if (isScannerOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera access denied or unavailable", err);
        });
    } else {
      // Cleanup stream
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        setMediaStream(null);
      }
      setScanSuccess(false);
      setIsScanning(false);
    }
    
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerOpen]);

  const handleCapture = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
      setTimeout(() => {
        setIsScannerOpen(false);
      }, 2000);
    }, 1500);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    // Simulate PDF generation delay
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    }, 1500);
  };

  const handleDownloadBackup = () => {
    setIsDownloadingBackup(true);
    setTimeout(() => {
      setIsDownloadingBackup(false);
      // Simulate file download
      const element = document.createElement("a");
      const file = new Blob(["{ \"encrypted\": true, \"data\": \"encrypted_blob_data_here\" }"], {type: 'application/json'});
      element.href = URL.createObjectURL(file);
      element.download = "haqqi-backup.haqqi";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }, 1500);
  };

  const filteredDocuments = MOCK_DOCUMENTS.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doc.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">منظم الأدلة وسجل المطالبة</h1>
          <p className="text-slate-600">احتفظ بجميع وثائقك الطبية والقانونية وسجل تواصلك مع شركة التأمين في مكان واحد آمن.</p>
        </div>
        <div className="flex gap-3 shrink-0 w-full md:w-auto flex-wrap">
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
          <button className="flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
            <UploadCloud className="w-5 h-5 ml-2" />
            رفع ملف
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 hover:border-emerald-200 cursor-pointer transition-colors group">
                  <div className={cn("w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform", doc.colorClasses.bg, doc.colorClasses.textIcon)}>
                    <doc.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{doc.title}</h3>
                    <p className={cn("text-sm mt-1", doc.status.includes('تم رفع') ? 'text-emerald-600' : 'text-slate-500')}>{doc.status}</p>
                  </div>
                  <button className={cn("text-sm font-medium", doc.colorClasses.textAction)}>{doc.actionText}</button>
                </div>
              ))
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
            <button className="flex items-center text-sm text-emerald-600 font-medium hover:text-emerald-700">
              <Plus className="w-4 h-4 ml-1" />
              إضافة حدث جديد
            </button>
          </div>
          <div className="p-6">
            <div className="relative border-r-2 border-slate-200 pr-6 space-y-8">
              {/* Event 1 */}
              <div className="relative">
                <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-slate-300 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">مراجعة شركة التأمين الأولى</h4>
                  <span className="flex items-center text-xs text-slate-500 font-medium">
                    <Clock className="w-3 h-3 ml-1" />
                    2026-08-10
                  </span>
                </div>
                <p className="text-sm text-slate-600">تم تقديم الكروكا ورخصة القيادة وتم فتح ملف مطالبة برقم #4592.</p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-4 border-white"></div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900">عرض تسوية مبدئي</h4>
                  <span className="flex items-center text-xs text-slate-500 font-medium">
                    <Clock className="w-3 h-3 ml-1" />
                    2026-08-15
                  </span>
                </div>
                <p className="text-sm text-slate-600">اتصل موظف التعويضات وعرض مبلغ 300 دينار. تم رفض العرض لأنه لا يغطي نصف الفواتير الطبية.</p>
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                  ⚠️ علامة خطر: مماطلة وعرض بخس
                </div>
              </div>
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
                        تحميل نسخة احتياطية (ملف مشفر)
                        <Lock className="w-4 h-4 text-slate-400" />
                      </h4>
                      <p className="text-sm text-slate-500 mt-1 mb-4 leading-relaxed">
                        تنزيل ملف بصيغة (haqqi.) يحتوي على جميع بياناتك مرفقة بتشفير آمن للاحتفاظ به على جهازك الشخصي.
                      </p>
                      <button 
                        onClick={handleDownloadBackup}
                        disabled={isDownloadingBackup}
                        className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-70"
                      >
                        {isDownloadingBackup ? (
                          <span className="flex items-center">
                            <div className="w-4 h-4 ml-2 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> 
                            جاري التجهيز والتشفير...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Download className="w-4 h-4 ml-2" /> 
                            تحميل الملف المشفر
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
                        onClick={() => setIsCloudConnected(!isCloudConnected)}
                        className={cn(
                          "w-full sm:w-auto px-5 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center",
                          isCloudConnected 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                        )}
                      >
                        {isCloudConnected ? (
                          <span className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 ml-2" /> 
                            تم الربط والمزامنة بنجاح
                          </span>
                        ) : (
                          <span className="flex items-center">
                            ربط الحساب الآن
                          </span>
                        )}
                      </button>
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

import { useState, useEffect, useRef } from "react";
import { Mic, X, Check, FileText, Trash2, MicOff, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const navigate = useNavigate();

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Load notes from local storage
    const saved = localStorage.getItem('haqqi_voice_notes');
    if (saved) {
      try { setNotes(JSON.parse(saved)); } catch (e) {}
    }

    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'ar-JO';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; 

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processCommand(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error !== 'aborted') {
          setFeedback("تعذر سماع الصوت بوضوح، يرجى المحاولة مرة أخرى.");
          setTimeout(() => setFeedback(""), 3000);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [navigate]);

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    let handled = false;
    
    // Navigation Commands
    if (lowerText.includes('رئيسي') || lowerText.includes('بداية')) { navigate('/'); setFeedback('جاري الانتقال إلى الرئيسية...'); handled = true; }
    else if (lowerText.includes('مساعد') || lowerText.includes('ذكاء')) { navigate('/ai-intake'); setFeedback('جاري الانتقال إلى المساعد الذكي...'); handled = true; }
    else if (lowerText.includes('مسار') || lowerText.includes('خطوات')) { navigate('/workflow'); setFeedback('جاري الانتقال إلى مسار القضية...'); handled = true; }
    else if (lowerText.includes('تقييم')) { navigate('/evaluation'); setFeedback('جاري الانتقال إلى تقييم القضية...'); handled = true; }
    else if (lowerText.includes('حاسب') || lowerText.includes('رسوم') || lowerText.includes('تكاليف')) { navigate('/costs-estimator'); setFeedback('جاري الانتقال إلى حاسبة الرسوم...'); handled = true; }
    else if (lowerText.includes('أدل') || lowerText.includes('مستندات') || lowerText.includes('منظم')) { navigate('/evidence'); setFeedback('جاري الانتقال إلى منظم الأدلة...'); handled = true; }
    else if (lowerText.includes('صياغ') || lowerText.includes('لائح') || lowerText.includes('دعوى')) { navigate('/drafting'); setFeedback('جاري الانتقال إلى الصياغة القانونية...'); handled = true; }
    else if (lowerText.includes('اجتهاد') || lowerText.includes('محكم')) { navigate('/precedents'); setFeedback('جاري الانتقال إلى الاجتهادات...'); handled = true; }
    else if (lowerText.includes('جهات') || lowerText.includes('عناوين') || lowerText.includes('دليل')) { navigate('/directory'); setFeedback('جاري الانتقال إلى دليل الجهات...'); handled = true; }
    else {
      // If no navigation command is found, save as a note
      setNotes(prev => {
        const newNotes = [text, ...prev];
        localStorage.setItem('haqqi_voice_notes', JSON.stringify(newNotes));
        return newNotes;
      });
      setFeedback('تم حفظ الملاحظة بنجاح.');
      handled = true;
    }
    
    setTimeout(() => {
      setFeedback('');
      setTranscript('');
      setIsListening(false);
    }, 2500);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('عذراً، متصفحك الحالي لا يدعم ميزة التعرف على الصوت.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setFeedback('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Handle case where it might already be started
        console.error(e);
      }
    }
  };

  const clearNotes = () => {
    setNotes([]);
    localStorage.removeItem('haqqi_voice_notes');
  }

  return (
    <div className="fixed bottom-[5.5rem] md:bottom-6 right-4 md:right-8 z-50 flex flex-col items-start" dir="rtl">
      {isOpen && (
        <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-[320px] max-w-[calc(100vw-2rem)] h-[450px] max-h-[60vh] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 origin-bottom-right">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              <h3 className="font-bold text-sm">التحكم الصوتي والملاحظات</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Command Area */}
          <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50 relative overflow-hidden">
            {isListening && (
              <div className="absolute inset-0 bg-indigo-50/50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.1)_0,transparent_100%)] animate-pulse"></div>
              </div>
            )}
            
            <button 
              onClick={toggleListen}
              className={cn(
                "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                isListening 
                  ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110" 
                  : "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105"
              )}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              {isListening && (
                <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-75"></span>
              )}
            </button>
            
            <div className="mt-4 text-center min-h-[3rem] w-full flex items-center justify-center relative z-10">
              {feedback ? (
                <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 animate-in fade-in slide-in-from-bottom-2">
                  <Check className="w-4 h-4" /> {feedback}
                </span>
              ) : isListening ? (
                <span className="text-slate-600 text-sm font-medium animate-pulse">
                  {transcript || "تحدث الآن... قل 'الرئيسية' أو سجل ملاحظة"}
                </span>
              ) : (
                <span className="text-slate-400 text-sm">
                  انقر للتحدث، يمكنك طلب الانتقال لصفحة أو تسجيل ملاحظة سريعة
                </span>
              )}
            </div>
          </div>

          {/* Quick Notes List */}
          <div className="flex-1 overflow-y-auto p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                الملاحظات الصوتية المحفوظة
              </h4>
              {notes.length > 0 && (
                <button onClick={clearNotes} className="text-[10px] text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                  <Trash2 className="w-3 h-3" /> مسح
                </button>
              )}
            </div>
            
            {notes.length > 0 ? (
              <div className="space-y-2">
                {notes.map((note, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-700 leading-relaxed shadow-sm">
                    {note}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex flex-col items-center justify-center text-slate-400 gap-2 opacity-50">
                <Mic className="w-8 h-8" />
                <span className="text-xs">لا توجد ملاحظات مسجلة</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 z-50 text-white",
          isOpen 
            ? "bg-slate-800 scale-90" 
            : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:-translate-y-1"
        )}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
      </button>
    </div>
  );
}

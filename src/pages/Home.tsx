import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Activity, BookOpen, AlertCircle, BellRing, Clock, FileWarning, MessageCircle, X, Send, Bot, User, ChevronDown, Library, ClipboardList, CheckCircle2, Circle, FolderDown } from "lucide-react";
import { cn } from "../lib/utils";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const LEGAL_TERMS = [
  {
    id: 1,
    term: "التعويض عن الضرر المعنوي",
    definition: "تعويض مالي يُحكم به للمتضرر عن الألم النفسي، المعاناة، أو التشوه الذي لحق به نتيجة الحادث، ولا يشمل الأضرار الجسدية أو المادية المباشرة."
  },
  {
    id: 2,
    term: "الخبرة الفنية (الكروكا)",
    definition: "تقرير رسمي يُنظم من قبل رقيب السير في مكان الحادث، يحدد ظروف الحادث ونسبة المسؤولية والخطأ لكل طرف، وهو أساس المطالبة."
  },
  {
    id: 3,
    term: "فترة التقادم",
    definition: "المدة القانونية التي يحق لك خلالها المطالبة بحقك. في حوادث السير، تسقط دعوى التعويض عادة بمرور سنتين أو ثلاث سنوات (حسب طبيعة الدعوى) من تاريخ وقوع الحادث."
  },
  {
    id: 4,
    term: "اللجنة الطبية اللوائية / القطعية",
    definition: "لجنة طبية رسمية مختصة بتقييم الحالة الصحية للمصاب بعد استقرار حالته لتحديد نسبة العجز الدائم الناتجة عن الحادث بشكل قطعي ونهائي."
  },
  {
    id: 5,
    term: "التأمين الإلزامي (ضد الغير)",
    definition: "تأمين يُلزم به كل صاحب مركبة، هدفه تعويض الآخرين (الغير) عن الأضرار الجسدية والمادية التي قد تسببها مركبته لهم."
  }
];

export default function Home() {
  const [activeTermId, setActiveTermId] = useState<number | null>(null);
  
  // Interactive To-Do List State
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "مراجعة المستشفى للحصول على التقرير الطبي الأولي",
      description: "بما أنك أشرت لوجود إصابات، يجب الحصول على التقرير الطبي الذي يصف الحالة عند دخول الطوارئ.",
      completed: true,
    },
    {
      id: 2,
      title: "مراجعة المركز الأمني لختم الكروكا",
      description: "تأكد من الحصول على نسخة الكروكا المطبوعة ومختومة بختم المركز الأمني التابع لمنطقة الحادث.",
      completed: false,
    },
    {
      id: 3,
      title: "تقديم إشعار بالحادث لشركة التأمين",
      description: "يجب إشعار شركة التأمين (الخاصة بالمركبة المتسببة) بوقوع الحادث في أقرب وقت لتفادي أي رفض مبدئي.",
      completed: false,
    },
    {
      id: 4,
      title: "عرض المصاب على اللجان الطبية اللوائية",
      description: "بعد استقرار الحالة (الشفاء التام من الإصابة الأولية)، يجب تقييم نسبة العجز الوظيفي إن وجد بواسطة لجنة طبية قطعية.",
      completed: false,
    }
  ]);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "أهلاً بك! أنا المساعد القانوني لمنصة حقي. كيف يمكنني مساعدتك اليوم في الإجابة على استفساراتك حول حوادث السير وقوانين التأمين الأردنية؟"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: chatInput.trim() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat/general', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: chatMessages
        })
      });

      const data = await response.json();
      if (data.text) {
        setChatMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text
        }]);
      }
    } catch (error) {
      console.error("Error in general chat:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const MOCK_ALERTS = [
    {
      id: 1,
      type: "urgent",
      title: "تنبيه: اقتراب موعد قانوني",
      message: "لم يتبق سوى 30 يوماً على مرور فترة التقادم القانونية (سنتان) لحادثك الموثق. يرجى تقديم المطالبة أو رفع الدعوى لتجنب سقوط حقك.",
      icon: Clock,
      actionText: "صياغة لائحة دعوى",
      actionLink: "/drafting",
      color: "rose"
    },
    {
      id: 2,
      type: "warning",
      title: "نواقص في ملف الأدلة",
      message: "لقد أشرت إلى وجود إصابات، ولكن لم يتم رفع (التقرير الطبي القطعي) حتى الآن. هذا المستند أساسي للمطالبة بتعويض العجز.",
      icon: FileWarning,
      actionText: "رفع التقرير الآن",
      actionLink: "/evidence",
      color: "amber"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12 lg:py-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight">
          اعرف حقك، ولا تضيعه
        </h1>
        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">
          منصة "حقي" تساعد متضرري حوادث السير في الأردن على فهم حقوقهم القانونية، وحساب التعويضات التقريبية، وتنظيم ملف المطالبة خطوة بخطوة.
        </p>
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/ai-intake"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
          >
            تحدث مع المساعد الذكي
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            حاسبة الحقوق السريعة
          </Link>
        </div>
      </section>

      {/* Dashboard Alerts Section */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">تنبيهات ملفك</h2>
        </div>
        
        <div className="grid gap-4">
          {MOCK_ALERTS.map((alert) => (
            <div 
              key={alert.id} 
              className={`bg-${alert.color}-50 border border-${alert.color}-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 bg-${alert.color}-100 text-${alert.color}-600 rounded-xl shrink-0`}>
                  <alert.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-${alert.color}-900 text-lg`}>{alert.title}</h3>
                  <p className={`text-${alert.color}-800 mt-1 leading-relaxed`}>{alert.message}</p>
                </div>
              </div>
              <Link
                to={alert.actionLink}
                className={`shrink-0 w-full sm:w-auto px-6 py-2.5 bg-white border border-${alert.color}-200 text-${alert.color}-700 text-sm font-bold rounded-lg hover:bg-${alert.color}-100 transition-colors text-center`}
              >
                {alert.actionText}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive To-Do List Section */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">خطة العمل المقترحة</h2>
        </div>
        <p className="text-slate-600 mb-6">
          قائمة مهام مخصصة بناءً على تفاصيل الحادث والإصابات التي أدخلتها. قم بتحديد المهام المنجزة لمتابعة تقدمك.
        </p>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={cn(
                  "p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50",
                  task.completed ? "bg-slate-50/50" : "bg-white"
                )}
                onClick={() => toggleTask(task.id)}
              >
                <button className="mt-0.5 shrink-0 transition-colors focus:outline-none">
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className={cn(
                    "font-bold text-lg transition-colors",
                    task.completed ? "text-slate-500 line-through" : "text-slate-900"
                  )}>
                    {task.title}
                  </h3>
                  <p className={cn(
                    "mt-1 leading-relaxed transition-colors",
                    task.completed ? "text-slate-400" : "text-slate-600"
                  )}>
                    {task.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              تم إنجاز {tasks.filter(t => t.completed).length} من {tasks.length} مهام
            </span>
            <div className="flex-1 max-w-xs mx-4 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-500 ease-out" 
                style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Complete Case Dossier Section */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="bg-indigo-900 rounded-2xl overflow-hidden shadow-lg relative text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <div className="relative p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4 text-center md:text-right">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center md:justify-start gap-3">
                <div className="p-2 bg-indigo-800 rounded-xl">
                  <FolderDown className="w-7 h-7 text-indigo-300" />
                </div>
                ملف القضية الشامل
              </h2>
              <p className="text-indigo-200 text-lg leading-relaxed max-w-2xl">
                بضغطة واحدة، قم بتجميع (التقييم، مسودات الوثائق، الأدلة المرفوعة، والمهام المنجزة) في ملف PDF واحد منظم واحترافي. ملفك جاهز للطباعة والتقديم للمحامي مباشرة.
              </p>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              <button 
                className="w-full md:w-auto px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-sm flex items-center justify-center gap-3 text-lg group"
                onClick={() => {
                  alert("سيتم الآن إنشاء وتجميع ملف القضية الشامل بصيغة PDF...");
                }}
              >
                تصدير الملف الآن
                <FolderDown className="w-5 h-5 text-indigo-500 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Glossary Section */}
      <section className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Library className="w-6 h-6 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-900">المصطلحات القانونية</h2>
        </div>
        <p className="text-slate-600 mb-6">
          دليل مبسط لأهم المصطلحات القانونية المتداولة في قضايا حوادث السير حسب القانون الأردني.
        </p>
        
        <div className="grid gap-3">
          {LEGAL_TERMS.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "border rounded-xl transition-all overflow-hidden",
                activeTermId === item.id ? "bg-white border-blue-200 shadow-md" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
              )}
            >
              <button
                onClick={() => setActiveTermId(activeTermId === item.id ? null : item.id)}
                className="w-full px-5 py-4 flex items-center justify-between text-right"
              >
                <span className={cn(
                  "font-bold text-lg",
                  activeTermId === item.id ? "text-blue-700" : "text-slate-900"
                )}>
                  {item.term}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-slate-400 transition-transform duration-200",
                  activeTermId === item.id && "rotate-180 text-blue-600"
                )} />
              </button>
              
              <div 
                className={cn(
                  "px-5 transition-all duration-300 ease-in-out",
                  activeTermId === item.id ? "py-4 border-t border-blue-50 opacity-100 max-h-40" : "max-h-0 py-0 opacity-0"
                )}
              >
                <p className="text-slate-600 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-8 pb-12">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">حاسبة التعويضات</h3>
          <p className="text-slate-600">
            أجب على أسئلة بسيطة لمعرفة أنواع التعويضات التي يحق لك المطالبة بها وفقاً للقانون الأردني.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">دليل الخطوات</h3>
          <p className="text-slate-600">
            قائمة مهام واضحة لكل ما تحتاجه من تقرير الشرطة، الفحوصات الطبية، وحتى تقديم المطالبة لشركة التأمين.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">توجيه وحماية</h3>
          <p className="text-slate-600">
            نماذج جاهزة لتقديم شكاوى للبنك المركزي في حال ماطلت شركة التأمين، وتوعية بمخاطر التنازل عن حقك.
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-slate-100 p-6 rounded-xl flex gap-4 text-slate-700">
        <AlertCircle className="w-6 h-6 shrink-0 text-slate-500 mt-1" />
        <div className="text-sm leading-relaxed">
          <strong>إخلاء مسؤولية:</strong> هذه المنصة توفر معلومات إرشادية وتثقيفية فقط ولا تعتبر بديلاً عن الاستشارة القانونية المتخصصة. المبالغ المحسوبة هي تقديرية وتعتمد على التفاصيل الطبية والقانونية الدقيقة لكل حالة. يُنصح دائماً باستشارة محامٍ مرخص قبل توقيع أي تسوية مع شركات التأمين.
        </div>
      </section>

      {/* Floating Chatbot Widget */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end">
        {isChatOpen && (
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-[350px] max-w-[calc(100vw-3rem)] h-[450px] max-h-[calc(100vh-8rem)] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            {/* Chat Header */}
            <div className="bg-emerald-600 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-bold">المساعد الذكي (عام)</span>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn("flex gap-2 max-w-[90%]", msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                    msg.role === 'user' ? "bg-slate-200 text-slate-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-slate-900 text-white rounded-tr-none" 
                      : "bg-white border border-emerald-100 text-slate-800 rounded-tl-none shadow-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex gap-2 max-w-[90%] ml-auto">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 rounded-2xl bg-white border border-emerald-100 rounded-tl-none shadow-sm flex items-center gap-1.5 h-10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form onSubmit={handleSendChat} className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="اسأل هنا..."
                  className="w-full pl-12 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm"
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !chatInput.trim()}
                  className="absolute left-1.5 top-1.5 bottom-1.5 w-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4 rtl:rotate-180" />
                </button>
              </form>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105",
            isChatOpen ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"
          )}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}

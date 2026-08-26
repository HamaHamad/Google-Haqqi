import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ShieldAlert } from "lucide-react";
import { cn } from "../lib/utils";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiIntake() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "مرحباً بك في منصة حقي. أنا المساعد الذكي، سأقوم بجمع تفاصيل الحادث منك خطوة بخطوة لمساعدتك في فهم حقوقك وتجهيز ملف المطالبة. هل أنت بأمان الآن وهل هناك أية إصابات تستدعي تدخلاً طبياً طارئاً؟"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/intake/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages
        })
      });

      const data = await response.json();
      if (data.text) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text
        }]);
      }
    } catch (error) {
      console.error("Error calling AI API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[80vh]">
      <div className="text-center space-y-2 mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-slate-900">المساعد الذكي لجمع بيانات الحادث</h1>
        <p className="text-slate-600">أجب عن أسئلة المساعد لتوثيق حالتك وتحديد حقوقك بدقة.</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4 max-w-[85%]", msg.role === 'user' ? "mr-auto flex-row-reverse" : "ml-auto")}>
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-slate-900 text-white rounded-tr-none" 
                  : "bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-[85%] ml-auto">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-none flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب ردك هنا..."
              className="w-full pl-14 pr-4 py-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-shadow bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute left-2 top-2 bottom-2 w-10 flex items-center justify-center bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 rtl:rotate-180" />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center text-xs text-slate-500 gap-1.5">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>المعلومات المقدمة هنا تُستخدم فقط لغايات إرشادية ولا تعتبر استشارة قانونية.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

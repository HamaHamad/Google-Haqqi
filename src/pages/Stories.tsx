import { useState } from "react";
import { MessageSquare, AlertTriangle } from "lucide-react";
import { cn } from "../lib/utils";

const MOCK_STORIES = [
  {
    id: 1,
    date: "2026-07-15",
    type: "story",
    content: "بعد الحادث، حاولت إحدى الشركات المماطلة في دفع مصاريف العلاج. بفضل تقديم شكوى للبنك المركزي، تم صرف المبلغ كاملاً خلال أسبوعين.",
    tags: ["نجاح مطالبات", "البنك المركزي"]
  },
  {
    id: 2,
    date: "2026-08-01",
    type: "warning",
    content: "احذروا من الأشخاص الذين يتواجدون حول المستشفيات ويعرضون (شراء الكروكا) أو تمثيلكم مقابل تنازل فوري. لقد وقعت في هذا الفخ وخسرت أكثر من نصف حقي.",
    tags: ["سماسرة الحوادث", "تحذير"]
  }
];

export default function Stories() {
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'story' | 'warning'>('story');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">تجارب وتحذيرات</h1>
          <p className="text-slate-600">شارك تجربتك (بشكل مجهول) لتوعية الآخرين بحقوقهم أو تحذيرهم من الممارسات الخاطئة.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shrink-0"
        >
          {showForm ? 'إلغاء' : 'أضف تجربتك / تحذير'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">مشاركة جديدة (بدون ذكر أسماء)</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFormType('story')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border-2 font-medium flex items-center justify-center transition-colors",
                formType === 'story' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-600 hover:border-emerald-200"
              )}
            >
              <MessageSquare className="w-5 h-5 ml-2" />
              قصة نجاح / تجربة
            </button>
            <button
              onClick={() => setFormType('warning')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl border-2 font-medium flex items-center justify-center transition-colors",
                formType === 'warning' ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-600 hover:border-amber-200"
              )}
            >
              <AlertTriangle className="w-5 h-5 ml-2" />
              تحذير من ممارسة
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">تفاصيل التجربة (يرجى عدم ذكر أسماء أشخاص)</label>
              <textarea 
                rows={4}
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="اكتب تجربتك هنا لتعم الفائدة..."
              />
            </div>
            <button 
              onClick={() => {
                alert('تم الإرسال بنجاح، سيتم نشر المشاركة بعد مراجعتها من قبل الإدارة.');
                setShowForm(false);
              }}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              إرسال المشاركة
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {MOCK_STORIES.map((item) => (
          <div 
            key={item.id} 
            className={cn(
              "p-6 rounded-2xl border",
              item.type === 'warning' ? "bg-amber-50/50 border-amber-100" : "bg-white border-slate-100 shadow-sm"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                {item.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                ) : (
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                )}
                <span className="text-sm font-medium text-slate-500">{item.date}</span>
              </div>
            </div>
            <p className="text-slate-700 leading-relaxed mb-4">{item.content}</p>
            <div className="flex gap-2">
              {item.tags.map(tag => (
                <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

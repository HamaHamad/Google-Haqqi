import { useState } from "react";
import { Search, Scale, FileText, ChevronDown, Gavel } from "lucide-react";
import { cn } from "../lib/utils";

const PRECEDENTS = [
  {
    id: 1,
    number: "1500 / 2021",
    court: "محكمة التمييز بصفتها الحقوقية",
    topic: "التعويض عن الضرر المعنوي المستقل",
    summary: "التعويض عن الضرر المعنوي في حوادث السير يعتبر مستقلاً عن التعويض المادي ويُقدر بناءً على جسامة الإصابة وتأثيرها النفسي على المصاب.",
    principle: "استقر اجتهاد محكمة التمييز على أن الضرر المعنوي الذي يصيب المضرور جراء حادث السير يستوجب التعويض متى توافرت أركان المسؤولية، ويستقل هذا التعويض عن ما يحكم به للضرر المادي كالغياب عن العمل ونسبة العجز، وتقدر المحكمة هذا التعويض استناداً لأحكام القانون المدني الأردني."
  },
  {
    id: 2,
    number: "340 / 2019",
    court: "محكمة التمييز بصفتها الحقوقية",
    topic: "حدود مسؤولية شركة التأمين",
    summary: "مسؤولية شركة التأمين في حوادث المركبات تحددها وثيقة التأمين الإلزامي والحدود المالية المقررة بنظام التأمين.",
    principle: "إن التزام شركة التأمين بالتعويض عن الأضرار الناشئة عن حوادث السير هو التزام عقدي وقانوني يستمد من وثيقة التأمين الإلزامي ونظام التأمين الإلزامي للمركبات النافذ وقت الحادث. فلا تسأل الشركة عن تعويضات تتجاوز السقوف المحددة في النظام المذكور، بينما يبقى المتسبب بالحادث (السائق) ومالك المركبة مسؤولين عن كامل الضرر بالتضامن والتكافل."
  },
  {
    id: 3,
    number: "2100 / 2020",
    court: "محكمة التمييز بصفتها الحقوقية",
    topic: "اعتماد تقارير اللجان الطبية القطعية",
    summary: "تعتمد المحكمة في تقدير نسبة العجز الدائم على التقارير الصادرة عن اللجان الطبية اللوائية القطعية باعتبارها بينة فنية متخصصة.",
    principle: "لغايات تحديد نسبة العجز التي تخلف لدى المصاب وتاريخ استقرار حالته الطبية، فإن المحكمة تعتمد على التقرير الطبي القطعي الصادر عن اللجنة الطبية اللوائية أو اللجنة الطبية المركزية، ولا يقبل إثبات ما يخالف هذه التقارير الرسمية إلا بالطعن بالتزوير أو بطلب دعوة منظميها لمناقشتهم أو إحالة الأمر للجنة طبية أعلى (اللجنة المركزية)."
  },
  {
    id: 4,
    number: "850 / 2018",
    court: "محكمة التمييز بصفتها الحقوقية",
    topic: "احتساب فترة التقادم في دعاوى حوادث السير",
    summary: "يبدأ سريان فترة التقادم للمطالبة بالتعويض عن الأضرار الجسدية من تاريخ استقرار الحالة الطبية وليس من تاريخ وقوع الحادث.",
    principle: "إن مدة التقادم (مرور الزمن المانع من سماع الدعوى) في دعاوى التعويض عن حوادث السير الناتجة عن أضرار جسدية تبدأ من تاريخ استقرار حالة المصاب الطبية وثبوت نسبة العجز بتقرير طبي قطعي، وليس من تاريخ وقوع الحادث، لأن الضرر لا يعتبر مستقراً ومحدداً إلا من ذلك التاريخ."
  },
  {
    id: 5,
    number: "112 / 2022",
    court: "محكمة التمييز بصفتها الحقوقية",
    topic: "التضامن والتكافل في دفع التعويض",
    summary: "إلزام السائق المتسبب بالحادث ومالك المركبة وشركة التأمين بدفع التعويض بالتضامن والتكافل.",
    principle: "إن مسؤولية السائق عن الحادث هي مسؤولية تقصيرية استناداً لقاعدة (الاضرار)، بينما مسؤولية مالك المركبة مسؤولية متبوع عن أعمال تابعه، ومسؤولية شركة التأمين مسؤولية عقدية وقانونية. وعليه، يُحكم عليهم جميعاً بدفع التعويض المحكوم به للمضرور بالتضامن والتكافل."
  }
];

export default function Precedents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCaseId, setActiveCaseId] = useState<number | null>(null);

  const filteredPrecedents = PRECEDENTS.filter(item => 
    item.topic.includes(searchQuery) || 
    item.summary.includes(searchQuery) ||
    item.principle.includes(searchQuery) ||
    item.number.includes(searchQuery)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <Gavel className="w-6 h-6" />
          </div>
          الاجتهادات والقرارات القضائية
        </h1>
        <p className="text-slate-600">
          قاعدة بيانات لأهم المبادئ القانونية والقرارات الصادرة عن محكمة التمييز الأردنية لتعزيز موقفك القانوني في قضايا حوادث السير.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="ابحث برقم القرار، أو الموضوع، أو الكلمات المفتاحية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-4 pr-12 py-4 border border-slate-200 rounded-2xl leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-base"
        />
      </div>

      {/* Precedents List */}
      <div className="space-y-4">
        {filteredPrecedents.length > 0 ? (
          filteredPrecedents.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "bg-white border rounded-2xl overflow-hidden transition-all duration-200",
                activeCaseId === item.id 
                  ? "border-indigo-200 shadow-md ring-1 ring-indigo-50" 
                  : "border-slate-200 shadow-sm hover:border-slate-300"
              )}
            >
              <button
                onClick={() => setActiveCaseId(activeCaseId === item.id ? null : item.id)}
                className="w-full px-6 py-5 flex items-start justify-between text-right gap-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200 inline-flex items-center gap-1">
                      <Scale className="w-3 h-3" />
                      {item.court}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      قرار رقم {item.number}
                    </span>
                  </div>
                  <h3 className={cn(
                    "font-bold text-lg transition-colors",
                    activeCaseId === item.id ? "text-indigo-700" : "text-slate-900"
                  )}>
                    {item.topic}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className={cn(
                  "p-2 rounded-full mt-2 shrink-0 transition-colors",
                  activeCaseId === item.id ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-400"
                )}>
                  <ChevronDown className={cn(
                    "w-5 h-5 transition-transform duration-300",
                    activeCaseId === item.id && "rotate-180"
                  )} />
                </div>
              </button>
              
              <div 
                className={cn(
                  "px-6 transition-all duration-300 ease-in-out",
                  activeCaseId === item.id ? "py-5 border-t border-slate-100 opacity-100" : "max-h-0 py-0 opacity-0 hidden"
                )}
              >
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                  <h4 className="flex items-center gap-2 font-bold text-slate-900 mb-3 text-sm">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    المبدأ القانوني للقرار:
                  </h4>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {item.principle}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed">
            <Gavel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">لم نجد قرارات مطابقة</h3>
            <p className="text-slate-500">جرب البحث بكلمات مختلفة أو باستخدام رقم القرار.</p>
          </div>
        )}
      </div>
    </div>
  );
}

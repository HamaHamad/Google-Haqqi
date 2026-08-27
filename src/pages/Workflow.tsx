import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../lib/utils";
import TimelineChart from "../components/TimelineChart";
import { loadJSON, saveJSON } from "../lib/storage";

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "موقع الحادث (الكروكا)",
    description: "انتظر رقيب السير لتنظيم المخطط الكروكي. تأكد من الحصول على وصل المراجعة ولا تعترف بالمسؤولية فوراً.",
    timeframe: "يوم الحادث"
  },
  {
    id: 2,
    title: "التقرير الطبي الأولي",
    description: "في حال وجود إصابات، راجع أقرب مستشفى حكومي فوراً للحصول على تقرير طبي قطعي أو أولي.",
    timeframe: "خلال 24 ساعة"
  },
  {
    id: 3,
    title: "إبلاغ شركة التأمين",
    description: "تبليغ شركة تأمين المركبة المتسببة بالحادث بوقوع الحادث لفتح ملف مطالبة، وتزويدهم بالكروكا ورخصة القيادة.",
    timeframe: "خلال 3-7 أيام"
  },
  {
    id: 4,
    title: "استكمال العلاج واللجنة الطبية",
    description: "الاحتفاظ بكافة الفواتير الطبية. بعد استقرار الحالة، يتم العرض على اللجنة الطبية اللوائية لتحديد نسبة العجز.",
    timeframe: "حسب الحالة"
  },
  {
    id: 5,
    title: "تقديم المطالبة المالية",
    description: "توجيه إنذار عدلي أو مطالبة خطية لشركة التأمين بقيمة التعويض المطلوب مرفقاً بالتقارير والفواتير.",
    timeframe: "بعد استقرار الحالة الطبية"
  },
  {
    id: 6,
    title: "اللجوء للقضاء أو البنك المركزي",
    description: "في حال رفضت الشركة أو ماطلت، يمكنك تقديم شكوى للبنك المركزي أو توكيل محامٍ لرفع دعوى حقوقية.",
    timeframe: "في حال عدم التوصل لتسوية"
  }
];

export default function Workflow() {
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => loadJSON<number[]>("haqqi_workflow", []));

  // Persist progress so the user never loses their checklist on refresh
  useEffect(() => {
    saveJSON("haqqi_workflow", completedSteps);
  }, [completedSteps]);

  const toggleStep = (id: number) => {
    setCompletedSteps(prev => 
      prev.includes(id) ? prev.filter(stepId => stepId !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2 mb-10">
        <h1 className="text-3xl font-bold text-slate-900">خطوات المطالبة بعد حادث السير</h1>
        <p className="text-slate-600">قائمة مرجعية لضمان عدم ضياع حقوقك. قم بتعليم الخطوات التي أنجزتها.</p>
      </div>

      <TimelineChart steps={WORKFLOW_STEPS} completedSteps={completedSteps} />

      <div className="relative border-r-2 border-slate-200 pr-8 space-y-12 pb-12 mt-12">
        {WORKFLOW_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          return (
            <div key={step.id} className="relative">
              {/* Timeline dot */}
              <div 
                className="absolute -right-[41px] top-1 bg-white cursor-pointer"
                onClick={() => toggleStep(step.id)}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 bg-white" />
                ) : (
                  <Circle className="w-8 h-8 text-slate-300 bg-white hover:text-emerald-400 transition-colors" />
                )}
              </div>

              <div className={cn(
                "bg-white p-6 rounded-2xl shadow-sm border transition-all",
                isCompleted ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100"
              )}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <h3 className={cn(
                    "text-xl font-bold",
                    isCompleted ? "text-emerald-900 line-through opacity-70" : "text-slate-900"
                  )}>
                    {index + 1}. {step.title}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 self-start sm:self-auto">
                    {step.timeframe}
                  </span>
                </div>
                <p className={cn(
                  "text-slate-600 leading-relaxed",
                  isCompleted && "opacity-70"
                )}>
                  {step.description}
                </p>
                
                {!isCompleted && (
                  <button 
                    onClick={() => toggleStep(step.id)}
                    className="mt-4 text-sm text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    تحديد كـ "مُنجز"
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

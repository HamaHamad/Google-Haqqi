import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

type Step = 1 | 2 | 3 | 4 | 5;

export default function RightsCalculator() {
  const [step, setStep] = useState<Step>(1);
  const [formData, setFormData] = useState({
    role: "",
    injuries: "",
    hasMedicalBills: "",
    hasDisabilityOrDeath: "",
    otherPartyInsured: "",
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const calculateResults = () => {
    const rights = [];
    if (formData.injuries === "yes") {
      rights.push("تعويض عن الأضرار الجسدية (الإصابات)");
    }
    if (formData.hasMedicalBills === "yes") {
      rights.push("تغطية المصاريف الطبية الموثقة (فواتير، مستشفيات)");
    }
    if (formData.hasDisabilityOrDeath === "yes") {
      rights.push("تعويض عن العجز الدائم أو الوفاة (لورثة المتوفى)");
    }
    
    let advice = "";
    if (formData.otherPartyInsured === "no") {
      advice = "بما أن الطرف الآخر غير مؤمن (أو مجهول)، يحق لك مراجعة (صندوق تعويض المتضررين من حوادث المركبات).";
    } else {
      advice = "تقع مسؤولية التعويض على شركة تأمين المركبة المتسببة بالحادث (التأمين الإلزامي/ضد الغير).";
    }

    return { rights, advice };
  };

  const results = step === 5 ? calculateResults() : null;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">حاسبة الحقوق والتعويضات</h1>
        <p className="text-slate-600">أجب عن الأسئلة التالية لمعرفة أنواع التعويضات التي يحق لك المطالبة بها</p>
      </div>

      {/* Progress Bar */}
      <div className="relative pt-4 pb-8">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-200">
          <div 
            style={{ width: `${(step / 5) * 100}%` }} 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-300"
          ></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500">
          <span>الخطوة 1 من 5</span>
          <span>النتيجة</span>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100">
        
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-4">ما كانت صفتك في الحادث؟</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {['سائق', 'راكب', 'مشاة'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFormData({ ...formData, role })}
                  className={cn(
                    "p-4 border-2 rounded-xl text-center font-medium transition-all",
                    formData.role === role 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : "border-slate-200 hover:border-emerald-200 text-slate-700"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-4">هل تعرضت لأي إصابات جسدية بسبب الحادث؟</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ label: 'نعم', val: 'yes'}, { label: 'لا، أضرار مادية فقط', val: 'no'}].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, injuries: opt.val })}
                  className={cn(
                    "p-4 border-2 rounded-xl text-center font-medium transition-all",
                    formData.injuries === opt.val 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : "border-slate-200 hover:border-emerald-200 text-slate-700"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-4">هل يوجد لديك فواتير طبية أو مصاريف علاج موثقة؟</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ label: 'نعم', val: 'yes'}, { label: 'لا', val: 'no'}].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, hasMedicalBills: opt.val })}
                  className={cn(
                    "p-4 border-2 rounded-xl text-center font-medium transition-all",
                    formData.hasMedicalBills === opt.val 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : "border-slate-200 hover:border-emerald-200 text-slate-700"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-slate-900 mb-4">هل نتج عن الحادث أي نسبة عجز دائم (حسب تقرير اللجنة الطبية) أو حالة وفاة؟</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[{ label: 'نعم', val: 'yes'}, { label: 'لا', val: 'no'}].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => setFormData({ ...formData, hasDisabilityOrDeath: opt.val })}
                  className={cn(
                    "p-4 border-2 rounded-xl text-center font-medium transition-all",
                    formData.hasDisabilityOrDeath === opt.val 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                      : "border-slate-200 hover:border-emerald-200 text-slate-700"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && results && (
          <div className="space-y-8 animate-in fade-in">
            <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-100">
              <h2 className="text-xl font-bold text-emerald-900 mb-4">النتيجة المبدئية لحالتك</h2>
              <p className="text-emerald-800 leading-relaxed mb-6">{results.advice}</p>
              
              <h3 className="font-bold text-emerald-900 mb-3">يحق لك المطالبة بما يلي (في حال إثبات المسؤولية):</h3>
              <ul className="space-y-3">
                {results.rights.length > 0 ? results.rights.map((right, idx) => (
                  <li key={idx} className="flex items-start text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 ml-2 shrink-0 text-emerald-600" />
                    <span>{right}</span>
                  </li>
                )) : (
                  <li className="text-slate-600">بناءً على إجاباتك، المطالبة تقتصر على الأضرار المادية للمركبة (يتم تغطيتها من تأمين الطرف المتسبب).</li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200">
              ملاحظة: هذه النتيجة استرشادية ولا تغني عن استشارة محامٍ أو الرجوع لتقرير الكروكا لتحديد نسبة المسؤولية.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-100">
          <button
            onClick={handlePrev}
            disabled={step === 1}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-lg",
              step === 1 
                ? "text-slate-300 cursor-not-allowed" 
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            السابق
          </button>
          
          {step < 5 && (
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700"
            >
              التالي
              <ArrowLeft className="w-4 h-4 mr-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

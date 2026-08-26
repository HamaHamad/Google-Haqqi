import { useState } from "react";
import { Activity, ShieldCheck, AlertCircle, FileText, Camera, Users, Car, Stethoscope, CheckCircle2, XCircle, Info, BarChart2 } from "lucide-react";
import { cn } from "../lib/utils";

type Answer = 'yes' | 'no' | null;

export default function CaseEvaluation() {
  const [answers, setAnswers] = useState<{
    kroka: Answer;
    insurance: Answer;
    medical: 'yes' | 'no' | 'na' | null;
    photos: Answer;
    witnesses: Answer;
  }>({
    kroka: null,
    insurance: null,
    medical: null,
    photos: null,
    witnesses: null,
  });

  const [showResult, setShowResult] = useState(false);

  const calculateScore = () => {
    let score = 0;
    let maxScore = 100;

    if (answers.kroka === 'yes') score += 40;
    if (answers.insurance === 'yes') score += 20;
    
    if (answers.medical === 'yes') {
      score += 20;
    } else if (answers.medical === 'na') {
      // Adjust max score if medical is not applicable
      maxScore -= 20;
    }

    if (answers.photos === 'yes') score += 10;
    if (answers.witnesses === 'yes') score += 10;

    return Math.round((score / maxScore) * 100);
  };

  const getScoreDetails = (score: number) => {
    if (score >= 80) return { label: "قوية جداً", color: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-200", desc: "فرص نجاح المطالبة والحصول على التعويض عالية جداً. أدلتك مكتملة." };
    if (score >= 50) return { label: "متوسطة", color: "text-amber-500", bg: "bg-amber-500", border: "border-amber-200", desc: "القضية جيدة ولكن قد تواجه بعض التحديات أو تأخيرات في التفاوض بسبب نقص بعض الأدلة." };
    return { label: "ضعيفة", color: "text-rose-500", bg: "bg-rose-500", border: "border-rose-200", desc: "فرص النجاح منخفضة حالياً. ينقصك أدلة جوهرية (مثل الكروكا أو التعرف على المتسبب) مما يصعب المطالبة." };
  };

  const handleEvaluate = () => {
    if (
      answers.kroka !== null &&
      answers.insurance !== null &&
      answers.medical !== null &&
      answers.photos !== null &&
      answers.witnesses !== null
    ) {
      setShowResult(true);
      // Scroll to result smoothly
      setTimeout(() => {
        document.getElementById('evaluation-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      alert("يرجى الإجابة على جميع الأسئلة للحصول على التقييم.");
    }
  };

  const score = calculateScore();
  const resultDetails = getScoreDetails(score);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <BarChart2 className="w-6 h-6" />
          </div>
          تقييم قوة القضية
        </h1>
        <p className="text-slate-600">
          أجب عن الأسئلة التالية لمعرفة مدى قوة موقفك القانوني واحتمالية نجاح مطالبتك بالتعويض.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-8">
        
        {/* Question 1: Kroka */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 font-bold text-slate-800 text-lg">
            <FileText className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            1. هل يوجد مخطط كروكي (تقرير حادث رسمي) يثبت مسؤولية الطرف الآخر؟
          </label>
          <div className="flex gap-4 pr-9">
            <button
              onClick={() => setAnswers({ ...answers, kroka: 'yes' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.kroka === 'yes' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <CheckCircle2 className="w-5 h-5" /> نعم، متوفر
            </button>
            <button
              onClick={() => setAnswers({ ...answers, kroka: 'no' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.kroka === 'no' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <XCircle className="w-5 h-5" /> لا يوجد
            </button>
          </div>
        </div>

        {/* Question 2: Insurance */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 font-bold text-slate-800 text-lg">
            <Car className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            2. هل المركبة المتسببة بالحادث معروفة وتمتلك تأميناً ساري المفعول؟
          </label>
          <div className="flex gap-4 pr-9">
            <button
              onClick={() => setAnswers({ ...answers, insurance: 'yes' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.insurance === 'yes' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <CheckCircle2 className="w-5 h-5" /> نعم
            </button>
            <button
              onClick={() => setAnswers({ ...answers, insurance: 'no' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.insurance === 'no' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <XCircle className="w-5 h-5" /> مجهولة / غير مؤمنة
            </button>
          </div>
        </div>

        {/* Question 3: Medical */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 font-bold text-slate-800 text-lg">
            <Stethoscope className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            3. في حال وجود إصابات، هل تملك تقارير طبية قطعية تثبت الإصابة؟
          </label>
          <div className="flex gap-4 pr-9 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setAnswers({ ...answers, medical: 'yes' })}
              className={cn("flex-1 w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.medical === 'yes' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" /> نعم
            </button>
            <button
              onClick={() => setAnswers({ ...answers, medical: 'no' })}
              className={cn("flex-1 w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.medical === 'no' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <XCircle className="w-5 h-5 shrink-0" /> قيد العلاج / لا يوجد
            </button>
            <button
              onClick={() => setAnswers({ ...answers, medical: 'na' })}
              className={cn("flex-1 w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.medical === 'na' ? "bg-slate-200 border-slate-400 text-slate-800" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <Info className="w-5 h-5 shrink-0" /> أضرار مادية فقط
            </button>
          </div>
        </div>

        {/* Question 4: Photos */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 font-bold text-slate-800 text-lg">
            <Camera className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            4. هل قمت بتوثيق الحادث بالصور (الأضرار، موقع الحادث، إلخ)؟
          </label>
          <div className="flex gap-4 pr-9">
            <button
              onClick={() => setAnswers({ ...answers, photos: 'yes' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.photos === 'yes' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <CheckCircle2 className="w-5 h-5" /> نعم
            </button>
            <button
              onClick={() => setAnswers({ ...answers, photos: 'no' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.photos === 'no' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <XCircle className="w-5 h-5" /> لا
            </button>
          </div>
        </div>

        {/* Question 5: Witnesses */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 font-bold text-slate-800 text-lg">
            <Users className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
            5. هل يتوفر شهود عيان أو تسجيلات كاميرات مراقبة للحادث؟
          </label>
          <div className="flex gap-4 pr-9">
            <button
              onClick={() => setAnswers({ ...answers, witnesses: 'yes' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.witnesses === 'yes' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <CheckCircle2 className="w-5 h-5" /> نعم
            </button>
            <button
              onClick={() => setAnswers({ ...answers, witnesses: 'no' })}
              className={cn("flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium", answers.witnesses === 'no' ? "bg-rose-50 border-rose-500 text-rose-700" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100")}
            >
              <XCircle className="w-5 h-5" /> لا
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 pr-9">
          <button 
            onClick={handleEvaluate}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Activity className="w-5 h-5" />
            تحليل وتقييم القضية
          </button>
        </div>

      </div>

      {showResult && (
        <div id="evaluation-result" className={cn("bg-white rounded-2xl border-2 p-8 text-center space-y-6 animate-in slide-in-from-bottom-8 duration-500", resultDetails.border)}>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-600">نتيجة التقييم</h2>
            <div className="flex justify-center items-center gap-4">
              <span className={cn("text-5xl font-black", resultDetails.color)}>{score}%</span>
              <span className={cn("text-2xl font-bold px-4 py-1.5 rounded-lg text-white", resultDetails.bg)}>
                {resultDetails.label}
              </span>
            </div>
          </div>
          
          <div className="max-w-lg mx-auto bg-slate-50 p-6 rounded-xl border border-slate-100">
            <p className="text-slate-700 font-medium leading-relaxed">
              {resultDetails.desc}
            </p>
          </div>

          <div className="text-right space-y-4 max-w-lg mx-auto">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-500" />
              توصيات لتحسين موقفك:
            </h3>
            <ul className="space-y-3 text-slate-600">
              {answers.kroka === 'no' && (
                <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" /> الكروكا أساسية جداً. راجع المركز الأمني التابع لمنطقة الحادث بأسرع وقت للحصول عليها أو لتقديم بلاغ.</li>
              )}
              {answers.insurance === 'no' && (
                <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /> إذا كانت المركبة مجهولة (فرار)، يمكنك تقديم شكوى لدى الشرطة للبحث والتحري. في حال القبض عليه ستتمكن من المطالبة.</li>
              )}
              {answers.medical === 'no' && (
                <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" /> لا تستعجل بالمخالصة. انتظر حتى استقرار حالتك الطبية واحصل على تقرير طبي قطعي لضمان حقك بالتعويض عن العجز.</li>
              )}
              {answers.photos === 'no' && (
                <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" /> حاول جمع أي صور للحادث، أو اطلب من الجهات الأمنية الاطلاع على صور كاميرات المراقبة المحيطة إذا تطلب الأمر إثباتاً إضافياً.</li>
              )}
              {score >= 80 && (
                <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" /> ملفك جاهز. انتقل إلى أداة "الصياغة القانونية" لتوليد إنذار لشركة التأمين أو استشر محامياً لمباشرة الإجراءات.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

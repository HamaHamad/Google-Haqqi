import { useEffect, useState } from "react";
import { Calculator, Landmark, Receipt, Scale, AlertCircle, Info, PiggyBank, FileSignature } from "lucide-react";
import { cn } from "../lib/utils";
import {
  calculateCourtFee,
  calculateExpertFee,
  calculateInitialCosts,
  calculateLawyerFeeRange,
  courtTypeForAmount,
  STAMPS_FEE,
  type CourtType,
} from "../lib/costs";
import { loadJSON, saveJSON } from "../lib/storage";

export default function CostsEstimator() {
  const [amount, setAmount] = useState<number>(() => loadJSON<number>("haqqi_costs_amount", 5000));
  const [courtType, setCourtType] = useState<CourtType>(() => loadJSON<CourtType>("haqqi_costs_court", "solh"));

  // Auto-update court type based on amount (Jordanian law: <= 10000 is Solh, > 10000 is Bidaya)
  useEffect(() => {
    if (courtType !== "appeal") {
      const auto = courtTypeForAmount(amount);
      if (auto !== courtType) setCourtType(auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  // Persist inputs
  useEffect(() => {
    saveJSON("haqqi_costs_amount", amount);
  }, [amount]);
  useEffect(() => {
    saveJSON("haqqi_costs_court", courtType);
  }, [courtType]);

  // Guard against NaN / negative typed input
  const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 0;

  // Calculations (pure functions, unit tested in tests/costs.test.ts)
  const calculatedCourtFee = calculateCourtFee(safeAmount, courtType);
  const expertFee = calculateExpertFee(courtType);
  const stampsFee = STAMPS_FEE;
  const initialCosts = calculateInitialCosts(safeAmount, courtType);
  const { min: lawyerFeeMin, max: lawyerFeeMax } = calculateLawyerFeeRange(safeAmount);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Calculator className="w-6 h-6" />
          </div>
          حاسبة الرسوم والمصاريف
        </h1>
        <p className="text-slate-600">
          أداة تقديرية لحساب رسوم المحكمة، مصاريف الخبرة، وأتعاب المحاماة المتوقعة بناءً على قيمة المطالبة والدرجة القضائية.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Input Section */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div className="space-y-3">
              <label className="font-bold text-slate-900 block">قيمة المطالبة المتوقعة (دينار أردني)</label>
              <div className="relative">
                <input
                  type="number"
                  value={Number.isFinite(amount) ? amount : ""}
                  onChange={(e) => setAmount(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="w-full text-2xl font-bold text-slate-900 py-3 pl-14 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  min="0"
                  step="500"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">دينار</span>
              </div>
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="500"
                value={Math.max(safeAmount, 500)}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                <span>500 د.أ</span>
                <span>50,000+ د.أ</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="font-bold text-slate-900 block">الدرجة القضائية للمحكمة</label>
              <div className="space-y-2">
                <button
                  onClick={() => setCourtType('solh')}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-right transition-colors flex items-center justify-between",
                    courtType === 'solh' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="font-medium">محكمة الصلح</span>
                  <span className="text-xs opacity-70">(للمطالبات حتى 10,000 د.أ)</span>
                </button>
                <button
                  onClick={() => setCourtType('bidaya')}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-right transition-colors flex items-center justify-between",
                    courtType === 'bidaya' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="font-medium">محكمة البداية</span>
                  <span className="text-xs opacity-70">(للمطالبات فوق 10,000 د.أ)</span>
                </button>
                <button
                  onClick={() => setCourtType('appeal')}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-right transition-colors flex items-center justify-between",
                    courtType === 'appeal' ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="font-medium">محكمة الاستئناف</span>
                  <span className="text-xs opacity-70">(الطعن بالأحكام الصادرة)</span>
                </button>
              </div>
            </div>

          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              <strong>تنويه قانوني:</strong> هذه الأرقام هي تقديرات مبدئية استرشادية بناءً على القواعد العامة لرسوم المحاكم. الأتعاب الفعلية تعتمد على قرار القاضي والاتفاقية الموقعة مع المحامي.
            </p>
          </div>
        </div>

        {/* Results Section */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-slate-500" />
                المصاريف والرسوم المبدئية (تدفع للمحكمة)
              </h2>
            </div>
            <div className="p-6 space-y-4">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">رسوم تسجيل الدعوى</h4>
                    <p className="text-sm text-slate-500">حوالي 3% من قيمة المطالبة</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">{calculatedCourtFee.toLocaleString()} د.أ</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">سلف أتعاب الخبراء</h4>
                    <p className="text-sm text-slate-500">للجان الطبية وخبراء السير (تقديري)</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">{expertFee.toLocaleString()} د.أ</span>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">طوابع ورسوم وكالة</h4>
                    <p className="text-sm text-slate-500">رسوم إبراز وكالة المحامي والطوابع</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-slate-900">{stampsFee.toLocaleString()} د.أ</span>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg">إجمالي المصاريف الأولية</h3>
                <span className="text-2xl font-black text-emerald-600">{initialCosts.toLocaleString()} د.أ</span>
              </div>

            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden text-white">
            <div className="p-6 border-b border-slate-700/50 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-400" />
                  أتعاب المحاماة (الاتفاقية)
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  في قضايا الحوادث، غالباً ما يتم الاتفاق على نسبة مئوية (10% - 20%) تدفع بعد تحصيل التعويض.
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between bg-slate-800/50">
              <span className="text-slate-300 font-medium">الأتعاب المتوقعة عند التحصيل:</span>
              <span className="text-xl font-bold text-emerald-400">
                {lawyerFeeMin.toLocaleString()} - {lawyerFeeMax.toLocaleString()} د.أ
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

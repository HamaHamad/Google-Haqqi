import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-6" dir="rtl">
      <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
        <SearchX className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900">الصفحة غير موجودة</h1>
      <p className="text-slate-600 leading-relaxed">
        عذراً، الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها. يمكنك العودة إلى الصفحة الرئيسية والمتابعة من هناك.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
      >
        <Home className="w-5 h-5 ml-2" />
        العودة للرئيسية
      </Link>
    </div>
  );
}

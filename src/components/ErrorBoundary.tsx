import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/** Catches render errors anywhere below and shows a graceful Arabic fallback. */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[haqqi] UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 max-w-md w-full text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">حدث خطأ غير متوقع</h1>
            <p className="text-slate-600 leading-relaxed text-sm">
              نعتذر عن هذا الخلل. يمكنك إعادة تحميل الصفحة والمحاولة من جديد، وإذا استمرت المشكلة يرجى التواصل معنا.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

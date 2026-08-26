import { Link, Outlet, useLocation } from "react-router-dom";
import { Scale, Activity, ShieldAlert, BookOpen, Menu, X, Globe, Gavel, BarChart2, Calculator } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import VoiceAssistant from "./VoiceAssistant";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: "الرئيسية", nameEn: "Home", href: "/", icon: Scale },
    { name: "المساعد الذكي", nameEn: "AI Intake", href: "/ai-intake", icon: Globe },
    { name: "مسار القضية", nameEn: "Timeline", href: "/workflow", icon: Activity },
    { name: "تقييم القضية", nameEn: "Evaluation", href: "/evaluation", icon: BarChart2 },
    { name: "حاسبة الرسوم", nameEn: "Costs Estimator", href: "/costs-estimator", icon: Calculator },
    { name: "منظم الأدلة", nameEn: "Evidence", href: "/evidence", icon: BookOpen },
    { name: "الصياغة القانونية", nameEn: "Drafting", href: "/drafting", icon: Scale },
    { name: "الاجتهادات القضائية", nameEn: "Precedents", href: "/precedents", icon: Gavel },
    { name: "دليل الجهات", nameEn: "Directory", href: "/directory", icon: BookOpen },
  ];

  // Mobile Bottom Navigation Tabs
  const bottomNav = [
    { name: "الرئيسية", href: "/", icon: Scale },
    { name: "المساعد", href: "/ai-intake", icon: Globe },
    { name: "المسار", href: "/workflow", icon: Activity },
    { name: "التقييم", href: "/evaluation", icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-16 pb-20 md:pb-0" dir="rtl">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white">
                  <Scale className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold text-slate-900">حقي <span className="font-normal text-slate-500 text-sm">Haqqi</span></span>
              </Link>
            </div>
            
            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8 space-x-reverse">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "inline-flex items-center px-1 h-16 border-b-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "border-emerald-500 text-emerald-600" 
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                    )}
                  >
                    <item.icon className="w-4 h-4 ml-2" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-500 hover:text-emerald-600 p-2 -mr-2"
              >
                <Menu className="w-7 h-7" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Native-like Side Menu (Drawer) */}
      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[55] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 bottom-0 h-full right-0 z-[60] w-64 max-w-[80vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="px-4 h-16 shrink-0 flex items-center justify-between border-b border-slate-100">
          <span className="text-lg font-bold text-slate-900">القائمة الرئيسية</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5 pb-24">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100 font-bold" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-5 h-5 ml-3", isActive ? "text-emerald-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-40 pb-safe">
        <div className="flex items-center justify-around h-16">
          {bottomNav.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
                  isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive ? "fill-emerald-100" : "")} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Menu Trigger on Bottom Bar */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors",
              isMobileMenuOpen ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Menu className="w-6 h-6" />
            <span className="text-[10px] font-bold">القائمة</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Voice Assistant */}
      <VoiceAssistant />
    </div>
  );
}

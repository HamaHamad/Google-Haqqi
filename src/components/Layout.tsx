import { Link, Outlet, useLocation } from "react-router-dom";
import { Scale, Activity, ShieldAlert, BookOpen, Menu, X, Globe, Gavel, BarChart2, Calculator } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
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
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors",
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
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 rounded-md text-base font-medium",
                      isActive 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 ml-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

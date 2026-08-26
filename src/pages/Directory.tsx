import { useState } from "react";
import { Search, MapPin, Phone, Building2, Landmark, ShieldPlus, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

const DIRECTORY_DATA = [
  {
    id: 1,
    category: "medical",
    name: "اللجنة الطبية اللوائية - العاصمة",
    description: "لجنة تقييم نسب العجز الطبي القطعي لمحافظة العاصمة.",
    address: "عمان، جبل الحسين، مبنى مديرية صحة العاصمة",
    phone: "06-1234567",
    icon: ShieldPlus
  },
  {
    id: 2,
    category: "medical",
    name: "اللجنة الطبية المركزية",
    description: "الجهة الطبية العليا للاعتراض على قرارات اللجان اللوائية.",
    address: "عمان، طبربور، بالقرب من مستشفى الأمير حمزة",
    phone: "06-7654321",
    icon: ShieldPlus
  },
  {
    id: 3,
    category: "court",
    name: "قصر العدل - عمان",
    description: "المحكمة المختصة بالنظر في قضايا التعويضات الكبرى (محكمة البداية).",
    address: "عمان، شارع السلط، منطقة العبدلي",
    phone: "06-4600000",
    icon: Landmark
  },
  {
    id: 4,
    category: "court",
    name: "محكمة صلح عمان",
    description: "المحكمة المختصة بقضايا الحوادث التي تقل المطالبة فيها عن 10,000 دينار.",
    address: "عمان، العبدلي، قصر العدل",
    phone: "06-4600000",
    icon: Landmark
  },
  {
    id: 5,
    category: "insurance",
    name: "الاتحاد الأردني لشركات التأمين",
    description: "الجهة المرجعية لشركات التأمين ومتابعة قضايا حوادث السير والمكتب الموحد.",
    address: "عمان، الشميساني، شارع عبدالحميد شرف",
    phone: "06-5689266",
    icon: Building2
  },
  {
    id: 6,
    category: "insurance",
    name: "إدارة السير المركزية",
    description: "مقر إدارة السير لطباعة المخطط الكروكي والمراجعات المرورية.",
    address: "عمان، المحطة",
    phone: "191",
    icon: Building2
  }
];

export default function Directory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filteredData = DIRECTORY_DATA.filter(item => {
    const matchesSearch = item.name.includes(searchQuery) || item.address.includes(searchQuery) || item.description.includes(searchQuery);
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          دليل الجهات الرسمية
        </h1>
        <p className="text-slate-600">
          عناوين وأرقام اللجان الطبية، المحاكم، والجهات التأمينية التي قد تحتاج لمراجعتها أثناء قضيتك.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="ابحث عن محكمة، لجنة طبية، أو إدارة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-4 pr-12 py-3 border border-slate-200 rounded-xl bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 shrink-0 hide-scrollbar">
          <button
            onClick={() => setActiveFilter("all")}
            className={cn("px-4 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors", activeFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveFilter("court")}
            className={cn("px-4 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors", activeFilter === "court" ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            المحاكم
          </button>
          <button
            onClick={() => setActiveFilter("medical")}
            className={cn("px-4 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors", activeFilter === "medical" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            اللجان الطبية
          </button>
          <button
            onClick={() => setActiveFilter("insurance")}
            className={cn("px-4 py-3 rounded-xl border text-sm font-bold whitespace-nowrap transition-colors", activeFilter === "insurance" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50")}
          >
            إدارات التأمين
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-slate-300 transition-all flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className={cn(
                  "p-3 rounded-xl shrink-0",
                  item.category === 'court' && "bg-indigo-50 text-indigo-600",
                  item.category === 'medical' && "bg-rose-50 text-rose-600",
                  item.category === 'insurance' && "bg-emerald-50 text-emerald-600"
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{item.name}</h3>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
              <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-start gap-2 text-slate-600 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{item.address}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-sm">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span dir="ltr" className="text-right inline-block">{item.phone}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white border border-slate-200 border-dashed rounded-2xl">
            <p className="text-slate-500 font-medium">لم يتم العثور على جهات مطابقة لبحثك.</p>
          </div>
        )}
      </div>
    </div>
  );
}

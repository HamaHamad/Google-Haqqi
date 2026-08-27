import { Phone, Mail, Globe, Download, Copy, FileText, Send, CheckCircle2, Loader2 } from "lucide-react";
import React, { useState, useRef } from "react";
import { api } from "../lib/api";
import { createHiddenContainer, exportElementToPdf } from "../lib/pdf";

export default function Complaints() {
  const [copied, setCopied] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", contact: "", message: "" });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const templateRef = useRef<HTMLDivElement | null>(null);

  const cbjComplaintTemplate = `بسم الله الرحمن الرحيم
السادة/ دائرة حماية المستهلك المالي - البنك المركزي الأردني المحترمين،

الموضوع: شكوى ضد شركة التأمين [اسم الشركة] بخصوص مماطلة/رفض مطالبة تأمينية

تحية طيبة وبعد،
أتقدم لسيادتكم بشكوى بخصوص الحادث المروري الذي وقع بتاريخ [تاريخ الحادث]، حيث أنني المتضرر وأحمل الكروكا رقم [رقم الكروكا].
تم تقديم المطالبة لشركة [اسم الشركة] تحت رقم [رقم المطالبة]، إلا أن الشركة [اذكر المشكلة: تماطل في الصرف / تعرض مبلغاً بخساً / ترفض التغطية لأسباب غير مبررة].

أرجو منكم التكرم بالنظر في الشكوى وإلزام الشركة بتعويضي حسب القانون.

مقدم الشكوى: [الاسم]
رقم الهاتف: [رقم الهاتف]
الرقم الوطني: [الرقم الوطني]
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cbjComplaintTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      // Real submission — stored server-side for the support team
      await api("/api/contact", { json: contactForm });
      setFormStatus('success');
      setContactForm({ name: "", contact: "", message: "" });
      setTimeout(() => setFormStatus('idle'), 3000);
    } catch (error) {
      console.error("Contact submit failed:", error);
      setFormStatus('error');
      setTimeout(() => setFormStatus('idle'), 4000);
    }
  };

  const handleDownloadPdf = async () => {
    const el = templateRef.current;
    if (!el) return;
    setIsPdfLoading(true);
    try {
      await exportElementToPdf(el, "haqqi-cbj-complaint.pdf");
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("تعذر تحميل ملف PDF. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">دليل الشكاوى والجهات الرقابية</h1>
        <p className="text-slate-600">في حال واجهت مماطلة أو رفض غير مبرر من شركة التأمين، يمكنك اللجوء للجهات التالية.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* CBJ Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <ShieldIcon className="w-6 h-6 mr-2 text-emerald-600 ml-2" />
              البنك المركزي الأردني (حماية المستهلك المالي)
            </h2>
            <p className="text-slate-600 mb-6">
              الجهة الرقابية على قطاع التأمين في الأردن. يمكنك تقديم شكوى رسمية مجانية وسيقومون بمتابعتها مع شركة التأمين.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center text-slate-700">
                <Phone className="w-5 h-5 ml-3 text-slate-400" />
                <span dir="ltr">+962 6 463 0301</span>
              </div>
              <div className="flex items-center text-slate-700">
                <Mail className="w-5 h-5 ml-3 text-slate-400" />
                <a href="mailto:fcpd@cbj.gov.jo" className="text-blue-600 hover:underline">fcpd@cbj.gov.jo</a>
              </div>
              <div className="flex items-center text-slate-700">
                <Globe className="w-5 h-5 ml-3 text-slate-400" />
                <a href="https://www.cbj.gov.jo" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">البوابة الإلكترونية للشكاوى</a>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">متى تلجأ للبنك المركزي؟</h3>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
              <li>تأخر الشركة في الرد أكثر من 15 يوم عمل.</li>
              <li>عرض مبلغ تعويض غير عادل.</li>
              <li>رفض المطالبة بأسباب تراها غير قانونية.</li>
            </ul>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-blue-600 ml-2" />
            نموذج شكوى للبنك المركزي
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            يمكنك نسخ هذا النموذج، تعبئة بياناتك، وإرساله عبر الإيميل أو البوابة الإلكترونية.
          </p>
          
          <div ref={templateRef} className="bg-white p-4 rounded-lg border border-slate-200 font-mono text-sm whitespace-pre-wrap flex-grow overflow-auto">
            {cbjComplaintTemplate}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium"
            >
              {copied ? <CheckIcon className="w-4 h-4 ml-2" /> : <Copy className="w-4 h-4 ml-2" />}
              {copied ? 'تم النسخ' : 'نسخ النص'}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isPdfLoading}
              className="flex items-center justify-center flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-70"
            >
              {isPdfLoading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Download className="w-4 h-4 ml-2" />}
              تحميل PDF
            </button>
          </div>
        </div>
      </div>

      {/* Support Contact Form */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">استفسار قانوني أولي</h2>
          <p className="text-slate-600 text-center mb-8">هل لديك سؤال محدد؟ أرسل استفسارك لفريق الدعم وسنقوم بتوجيهك للخطوة التالية.</p>

          <form onSubmit={handleSubmitContact} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={e => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="الاسم الكريم"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم الهاتف أو البريد الإلكتروني</label>
                <input
                  type="text"
                  required
                  value={contactForm.contact}
                  onChange={e => setContactForm({...contactForm, contact: e.target.value})}
                  className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="للتواصل معك"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">استفسارك</label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={e => setContactForm({...contactForm, message: e.target.value})}
                className="w-full rounded-lg border-slate-300 border p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="اكتب تفاصيل استفسارك هنا..."
              />
            </div>

            <button
              type="submit"
              disabled={formStatus === 'submitting' || formStatus === 'success'}
              className="w-full flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              {formStatus === 'submitting' ? (
                <span className="flex items-center"><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جاري الإرسال...</span>
              ) : formStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 ml-2" />
                  تم إرسال استفسارك بنجاح
                </>
              ) : formStatus === 'error' ? (
                <span>تعذر الإرسال — حاول مرة أخرى</span>
              ) : (
                <>
                  <Send className="w-5 h-5 ml-2" />
                  إرسال الاستفسار
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

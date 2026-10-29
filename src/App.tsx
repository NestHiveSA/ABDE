import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, User, Sparkles, Download, Loader2, RefreshCw, 
  Code, Cpu, Palette, Globe, ShieldCheck, Camera, 
  ChevronRight, ChevronLeft, Star, Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SPECIALTIES = [
  { id: 'coding', label: 'البرمجة', icon: Code, color: 'bg-blue-500', description: 'بطل الأكواد والبرمجيات' },
  { id: 'robotics', label: 'الروبوتيك', icon: Cpu, color: 'bg-orange-500', description: 'مخترع الآلات الذكية' },
  { id: 'design', label: 'التصميم الرقمي', icon: Palette, color: 'bg-pink-500', description: 'فنان العوالم الرقمية' },
  { id: 'citizenship', label: 'المواطنة الرقمية', icon: ShieldCheck, color: 'bg-green-500', description: 'حارس الأمان الرقمي' },
];

interface MemberData {
  name: string;
  specialty: string;
  level: string;
  memberId: string;
}

export default function App() {
  const [step, setStep] = useState(1);
  const [image, setImage] = useState<string | null>(null);
  const [cartoonImage, setCartoonImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData>({
    name: '',
    specialty: 'coding',
    level: 'A',
    memberId: `NEST-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
  });

  const cardRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setCartoonImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': ['.jpeg', '.jpg'], 'image/png': ['.png'] },
    multiple: false
  } as any);

  const generateCartoon = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const specialtyLabel = SPECIALTIES.find(s => s.id === memberData.specialty)?.label;
      
      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
            {
              text: `Transform this child into a heroic, high-quality 3D cartoon character (Pixar/Disney style). 
              The character should be themed around "${specialtyLabel}". 
              If it's coding, maybe they have cool futuristic goggles. 
              If it's robotics, maybe they have a small cute robot companion. 
              Keep the child's facial features recognizable but in a fun, brave, and friendly hero form. 
              The background should be vibrant and match the theme. High resolution, professional lighting.`,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setCartoonImage(`data:image/png;base64,${part.inlineData.data}`);
          setStep(4);
          break;
        }
      }
    } catch (error) {
      console.error('Error generating cartoon:', error);
      alert('حدث خطأ أثناء إنشاء بطلك الرقمي. حاول مرة أخرى!');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (cartoonImage) {
      const link = document.createElement('a');
      link.href = cartoonImage;
      link.download = `explorer-${memberData.name || 'hero'}.png`;
      link.click();
    }
  };

  const currentSpecialty = SPECIALTIES.find(s => s.id === memberData.specialty);

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden" dir="rtl">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-nest-teal/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-nest-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-6xl px-6 py-8 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-nest-blue rounded-xl flex items-center justify-center text-white shadow-lg animate-float">
            <Globe size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-nest-blue leading-tight">جمعية العش الرقمي</h1>
            <p className="text-xs text-nest-gold font-medium tracking-widest">نبني جيلاً رقمياً واعياً</p>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          <div className="px-4 py-2 glass rounded-full text-xs font-bold text-nest-blue flex items-center gap-2">
            <Star size={14} className="fill-nest-gold text-nest-gold" />
            نادي المبدعين الرقميين
          </div>
        </div>
      </header>

      <main className="w-full max-w-4xl px-6 py-12 flex flex-col items-center z-10">
        {/* Progress Tracker */}
        <div className="w-full max-w-md mb-12 flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-nest-teal -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 font-bold",
                step >= s ? "bg-nest-teal text-white shadow-lg scale-110" : "bg-white text-gray-400 border-2 border-gray-100"
              )}
            >
              {s}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl text-center space-y-8"
            >
              <div className="w-20 h-20 bg-nest-teal/10 rounded-3xl flex items-center justify-center mx-auto text-nest-teal">
                <User size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-nest-ink">مرحباً بك يا مستكشف!</h2>
                <p className="text-gray-500">ما هو اسمك في عالم العش الرقمي؟</p>
                <input
                  type="text"
                  value={memberData.name}
                  onChange={(e) => setMemberData({ ...memberData, name: e.target.value })}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 focus:border-nest-teal outline-none text-center text-xl font-bold transition-all"
                />
              </div>
              <button
                onClick={() => memberData.name && setStep(2)}
                disabled={!memberData.name}
                className="w-full py-5 bg-nest-teal text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-nest-teal/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3 group"
              >
                التالي
                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-2xl glass p-10 rounded-[40px] shadow-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-nest-ink">اختر تخصصك الإبداعي</h2>
                <p className="text-gray-500">ما هي القوة التي تريد امتلاكها؟</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPECIALTIES.map((spec) => (
                  <button
                    key={spec.id}
                    onClick={() => setMemberData({ ...memberData, specialty: spec.id })}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all text-right flex items-center gap-4 group",
                      memberData.specialty === spec.id 
                        ? "border-nest-teal bg-nest-teal/5 shadow-md" 
                        : "border-gray-100 hover:border-nest-teal/30 bg-white"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", spec.color)}>
                      <spec.icon size={28} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{spec.label}</h3>
                      <p className="text-xs text-gray-400">{spec.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  رجوع
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-[2] py-5 bg-nest-teal text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-nest-teal/90 transition-all flex items-center justify-center gap-3 group"
                >
                  التالي
                  <ChevronLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl text-center space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-nest-ink">التقط صورتك!</h2>
                <p className="text-gray-500">سنحولك إلى بطل خارق في العش الرقمي</p>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  "border-4 border-dashed rounded-[40px] p-12 transition-all cursor-pointer relative overflow-hidden group",
                  isDragActive ? "border-nest-teal bg-nest-teal/5" : "border-gray-100 hover:border-nest-teal/30 bg-white"
                )}
              >
                <input {...getInputProps()} />
                {image ? (
                  <div className="relative">
                    <img src={image} alt="Preview" className="w-48 h-48 mx-auto rounded-full object-cover border-8 border-white shadow-2xl" />
                    <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold">
                      تغيير الصورة
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-24 h-24 bg-nest-teal/10 rounded-full flex items-center justify-center mx-auto text-nest-teal animate-pulse">
                      <Camera size={40} />
                    </div>
                    <p className="font-bold text-gray-400">اضغط هنا أو اسحب صورتك</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-5 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
                >
                  رجوع
                </button>
                <button
                  onClick={generateCartoon}
                  disabled={!image || loading}
                  className="flex-[2] py-5 bg-nest-gold text-white rounded-2xl font-bold text-lg shadow-xl hover:bg-nest-gold/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      جاري التحويل...
                    </>
                  ) : (
                    <>
                      <Zap size={24} className="fill-white" />
                      تفعيل القوة!
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center space-y-12"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold text-nest-blue">أهلاً بك يا بطل!</h2>
                <p className="text-gray-500">تم تفعيل هويتك الرقمية بنجاح</p>
              </div>

              {/* ID Card Preview */}
              <div className="card-3d perspective-1000">
                <div 
                  id="membership-card"
                  className="w-[380px] h-[540px] bg-white rounded-[48px] shadow-2xl overflow-hidden flex flex-col border-8 border-white relative"
                >
                  {/* Card Header */}
                  <div className={cn("h-40 relative flex items-center justify-center overflow-hidden", currentSpecialty?.color)}>
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    <div className="absolute top-6 left-6 opacity-20 rotate-12">
                      <Globe size={120} />
                    </div>
                    <div className="z-10 text-center">
                      <h3 className="text-white text-3xl font-black tracking-tighter">EXPLORER</h3>
                      <p className="text-white/80 text-[10px] font-bold tracking-[0.3em] uppercase">Digital Nest ID</p>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="flex-1 flex flex-col items-center -mt-20 px-10 text-center relative z-10">
                    <div className="w-44 h-44 rounded-[40px] border-[10px] border-white bg-gray-100 overflow-hidden shadow-2xl mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
                      <img src={cartoonImage || ''} alt="Hero" className="w-full h-full object-cover" />
                    </div>

                    <div className="space-y-2 w-full">
                      <h4 className="text-4xl font-bold text-nest-ink truncate">
                        {memberData.name}
                      </h4>
                      <div className={cn("inline-flex items-center gap-2 px-4 py-1 rounded-full text-white text-xs font-bold shadow-sm", currentSpecialty?.color)}>
                        {currentSpecialty && <currentSpecialty.icon size={14} />}
                        {currentSpecialty?.label}
                      </div>
                    </div>

                    <div className="mt-auto mb-10 w-full pt-8 border-t border-gray-50 flex justify-between items-end">
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Level</div>
                        <div className="text-2xl font-black text-nest-gold">RANK {memberData.level}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">ID Code</div>
                        <div className="font-mono text-xs text-gray-600">{memberData.memberId}</div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute bottom-6 right-6 w-12 h-12 opacity-10">
                    <Star size={48} className="fill-nest-ink" />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 w-full max-w-md">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-5 bg-white border-2 border-gray-100 rounded-3xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={20} />
                  واحد جديد؟
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-[2] py-5 bg-nest-blue text-white rounded-3xl font-bold text-lg shadow-xl hover:bg-nest-blue/90 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={24} />
                  تحميل البطاقة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-auto py-8 text-gray-400 text-sm font-medium">
        © {new Date().getFullYear()} جمعية العش الرقمي • نبني جيلاً رقمياً واعياً
      </footer>
    </div>
  );
}

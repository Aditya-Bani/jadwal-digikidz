import { Megaphone, GraduationCap } from 'lucide-react';

interface RunningTextProps {
  messages: string[];
}

const DEFAULT_MESSAGE = 'Selamat datang di Dashboard Digikidz Kota Wisata Cibubur. Pantau jadwal mengajar, lacak progres akademik, dan kelola aktivitas hari ini dengan mudah.';

export function RunningText({ messages }: RunningTextProps) {
  const hasMessages = messages.length > 0;
  const combined = hasMessages ? messages.join('. ') : DEFAULT_MESSAGE;

  return (
    <div className="mb-6 rounded-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center h-10">
      {/* Marquee Text */}
      <div className="overflow-hidden flex-1 relative flex items-center">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
            <GraduationCap className="w-4 h-4 inline-block mr-2 text-blue-500 align-text-bottom" />
            {combined} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {combined}
          </span>
        </div>

        {/* Fade edges */}
        <div className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none bg-gradient-to-r from-blue-50 dark:from-[#111827] to-transparent" />
        <div className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none bg-gradient-to-l from-blue-50 dark:from-[#111827] to-transparent" />
      </div>
    </div>
  );
}

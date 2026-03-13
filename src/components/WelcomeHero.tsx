import { useAuth } from '@/hooks/useAuth';
import { Sparkles } from 'lucide-react';
import mascotWaving from '@/assets/Mascot Optional CS6-19.png';

export function WelcomeHero() {
    const { user } = useAuth();

    const rawName = user?.email?.split('@')[0] ?? '';
    const displayName = rawName
        .split(/[._-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

    const hour = new Date().getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
    if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    if (hour >= 18 || hour < 4) greeting = 'Selamat Malam';

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 mb-8 text-white shadow-md animate-fade-in group">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl transition-transform duration-700 group-hover:scale-110" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                {/* Text content */}
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border border-white/20 pulse-subtle">
                            <Sparkles className="h-4 w-4 text-blue-100" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-100">
                            Dashboard Overview
                        </span>
                    </div>

                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                            {greeting},{' '}
                            <br className="sm:hidden" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
                                Coach {displayName || ''}
                            </span>
                        </h1>
                        <p className="text-blue-100/90 max-w-md text-sm sm:text-base font-medium leading-relaxed mt-2">
                            Overview performa kelas dan jadwal mengajar hari ini. Mari persiapkan pengalaman belajar yang luar biasa untuk murid-murid!
                        </p>
                    </div>
                </div>

                {/* Mascot */}
                <div className="relative shrink-0 flex justify-center md:justify-end">
                    <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-75 animate-pulse" />
                    <img
                        src={mascotWaving}
                        alt="Digikidz Mascot"
                        className="relative h-32 sm:h-40 md:h-48 w-auto object-contain hover:scale-105 transition-transform duration-500 cursor-default drop-shadow-xl"
                    />
                </div>
            </div>
        </div>
    );
}

import { Link, useLocation, useNavigate } from 'react-router-dom';
import logodk from '@/assets/logodk.png';
import { LiveClock } from './LiveClock';
import { MobileNav } from './MobileNav';
import { CalendarDays, LayoutGrid, FileText, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const navItems = [
  { to: '/', label: 'Jadwal', icon: LayoutGrid },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/parent', label: 'Parent Portal', icon: Users },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const email = user?.email ?? '';
  const rawName = email.split('@')[0];
  const displayName = rawName
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  const initials = rawName
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-2 sm:py-3 relative z-10">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={logodk}
                alt="DIGIKIDZ Logo"
                className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Kota Wisata Cibubur
                </p>
              </div>
            </Link>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />

            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Clock + User + Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LiveClock />

            {displayName && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-1.5 pr-3 py-1 shadow-sm">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-blue-600 text-white dark:bg-blue-500 shadow-inner">
                  {initials}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">
                  {displayName}
                </span>
              </div>
            )}

            {/* Logout */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-900/20 rounded-xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-semibold">Keluar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-slate-900 dark:text-slate-100 font-bold">
                    Konfirmasi Keluar
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                    Apakah Anda yakin ingin keluar dari sistem? Anda perlu melakukan otentikasi ulang untuk masuk kembali.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl font-semibold border-slate-200 dark:border-slate-700">
                    Batal
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white"
                  >
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutGrid, CalendarDays, FileText, Users, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import logodk from '@/assets/logodk.png';

const navItems = [
  { to: '/', label: 'Jadwal', icon: LayoutGrid },
  { to: '/kalender', label: 'Kalender', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/sertifikat', label: 'Sertifikat', icon: GraduationCap },
  { to: '/parent', label: 'Parent Portal', icon: Users },
];

export function MobileNav() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="p-4 border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <img src={logodk} alt="DIGIKIDZ" className="h-10 w-auto" />
            <span className="text-sm text-muted-foreground">Kota Wisata</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                location.pathname === to
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

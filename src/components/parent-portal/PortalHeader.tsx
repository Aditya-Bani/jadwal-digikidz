import { User, LogOut } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import logodk from '@/assets/logodk.png';

interface PortalHeaderProps {
  studentName: string;
  onLogout: () => void;
}

export function PortalHeader({ studentName, onLogout }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logodk} alt="Digikidz" className="h-6 sm:h-8" />
          <div className="h-4 w-px bg-slate-200" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Portal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Student Account</p>
            <p className="text-sm font-black text-slate-800 leading-none">{studentName}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-destructive">
                  <LogOut className="w-5 h-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-3xl p-8 max-w-md bg-white border-none shadow-2xl">
                <AlertDialogHeader className="space-y-4">
                  <div className="mx-auto bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center">
                    <LogOut className="h-8 w-8 text-slate-400" />
                  </div>
                  <AlertDialogTitle className="text-2xl font-black text-center">Keluar Portal?</AlertDialogTitle>
                  <AlertDialogDescription className="text-center font-medium text-slate-500">Anda perlu memasukkan kode akses kembali untuk masuk.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 flex gap-3">
                  <AlertDialogCancel className="flex-1 rounded-xl h-12 font-bold bg-slate-100 border-none">Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={onLogout} className="flex-1 rounded-xl h-12 font-bold bg-primary text-white border-none shadow-lg shadow-primary/20">Ya, Keluar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </header>
  );
}

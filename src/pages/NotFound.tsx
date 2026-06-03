import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import logodk from "@/assets/logodk.png";
import mascot from "@/assets/Mascot Optional CS6-05.png";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blurs */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md animate-fade-in">
        {/* Logo */}
        <img src={logodk} alt="DIGIKIDZ" className="h-12 w-auto opacity-80" />

        {/* Mascot */}
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 animate-pulse" />
          <img
            src={mascot}
            alt="404 Mascot"
            className="relative h-52 w-auto object-contain drop-shadow-2xl animate-bounce-subtle"
          />
        </div>

        {/* Error info */}
        <div className="glass-card rounded-3xl p-8 border-none shadow-2xl shadow-primary/10 w-full space-y-4">
          <div className="inline-flex items-center gap-2 bg-destructive/10 border border-destructive/20 px-4 py-1.5 rounded-full">
            <span className="text-destructive font-black text-sm">404</span>
            <div className="w-1 h-1 rounded-full bg-destructive/50" />
            <span className="text-destructive/80 font-bold text-xs uppercase tracking-widest">Halaman Tidak Ditemukan</span>
          </div>

          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Oops! Tersesat?
          </h1>
          <p className="text-muted-foreground font-medium text-sm leading-relaxed">
            Halaman <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{location.pathname}</code> tidak ditemukan.
            Mungkin link sudah berubah atau belum pernah ada.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex-1 rounded-xl gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="flex-1 rounded-xl gap-2 shadow-lg shadow-primary/20"
            >
              <Home className="h-4 w-4" />
              Ke Dashboard
            </Button>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">
          © 2026 Digikidz Indonesia
        </p>
      </div>
    </div>
  );
};

export default NotFound;

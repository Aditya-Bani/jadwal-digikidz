import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import logodk from '@/assets/logodk.png';
import logodkPutih from '@/assets/logodk_putih.png';
import mascotAuth from '@/assets/Mascot Optional CS6-13.png';
import { LogIn, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Akses Ditolak', description: 'Masukkan kredensial yang valid.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Gagal Masuk', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 sm:p-4 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in border border-slate-200 dark:border-slate-800">

        {/* Left Side: Brand Imagery */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700">
          <div className="relative z-10">
            <img src={logodkPutih} alt="DIGIKIDZ" className="h-10 w-auto drop-shadow-md" />
            <div className="mt-20 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/20 text-white border border-white/20 backdrop-blur-sm shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Scholar System</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Technology for<br />
                <span className="text-blue-200">Creative Kids</span>
              </h2>
              <p className="text-lg font-medium max-w-sm text-blue-100">
                Portal manajemen akademik terpadu untuk Coach dan staf administrasi Digikidz.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex justify-center mt-12 mb-[-80px]">
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-125" />
            <img
              src={mascotAuth}
              alt="Mascot Welcome"
              className="relative h-72 object-contain drop-shadow-2xl z-10"
            />
          </div>
        </div>

        {/* Right Side: Clean Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 relative bg-white dark:bg-slate-900">
          <div className="mb-10 text-center lg:text-left">
            <div className="lg:hidden mb-8 -mx-8 -mt-8 p-12 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden rounded-b-[2rem] shadow-lg">
              <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10 -right-10 w-40 h-40" />
              <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full -bottom-10 -left-10 w-40 h-40" />
              <div className="relative z-10 flex flex-col items-center">
                <img src={logodkPutih} alt="DIGIKIDZ" className="h-10 mb-4 drop-shadow-md" />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/20 text-white border border-white/20 backdrop-blur-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  <span>Scholar System</span>
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight mb-2 text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
              Masuk ke Portal
            </h3>
            <p className="font-medium text-slate-500 dark:text-slate-400">Silakan masukkan detail akun Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">
                Alamat Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="coach@digikidz.id"
                className="h-12 rounded-xl transition-all font-medium border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">
                  Kata Sandi
                </Label>
                <button type="button" className="text-xs font-bold hover:underline text-blue-600 dark:text-blue-400">
                  Lupa Sandi?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl transition-all font-medium border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800"
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Koneksi aman terlindungi</p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl text-md font-bold transition-all mt-2 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-3" />
              )}
              Masuk Sekarang
            </Button>
          </form>

          <div className="mt-12 pt-8 flex justify-between items-center text-xs font-semibold border-t border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
            <p>© {new Date().getFullYear()} Digikidz Indonesia</p>
            <div className="flex gap-4">
              <button className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Bantuan</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

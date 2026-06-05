import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="bg-mesh min-h-screen flex flex-col text-[#191c1e]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <style>
        {`
          .glass-panel {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.4);
              box-shadow: 0 20px 50px rgba(0, 74, 198, 0.08);
          }
          .glass-card {
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.4);
          }
          .bg-mesh {
              background-color: #f7f9fb;
              background-image: 
                  radial-gradient(at 0% 0%, rgba(0, 74, 198, 0.05) 0px, transparent 50%),
                  radial-gradient(at 100% 0%, rgba(180, 197, 255, 0.1) 0px, transparent 50%);
          }
          .bg-desktop {
              background: linear-gradient(135deg, #f7f9fb 0%, #dbe1ff 100%);
          }
          .btn-premium-shine {
              position: relative;
              overflow: hidden;
          }
          .btn-premium-shine::after {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,255,255,0.2), transparent);
              transform: rotate(45deg);
              transition: 0.5s;
          }
          .btn-premium-shine:hover::after {
              left: 120%;
          }
          .floating-mascot {
              animation: float 4s ease-in-out infinite;
          }
          @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(2deg); }
          }
          input[type="password"]::-ms-reveal,
          input[type="password"]::-ms-clear {
              display: none;
          }
        `}
      </style>

      {/* Header (Desktop Only) */}
      <header className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-end items-center px-4 md:px-10 h-16">
        <a className="text-[#737686] hover:text-[#004ac6] transition-colors font-semibold text-sm" href="#">
          Hubungi Support
        </a>
      </header>

      <main className="flex-grow flex flex-col md:flex-row items-center justify-center px-4 md:px-10 py-10 md:py-24 relative overflow-hidden md:bg-desktop bg-mesh">
        {/* Abstract Background Decorative Elements (Desktop Only) */}
        <div className="hidden md:block absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-[#004ac6]/10 rounded-full blur-3xl"></div>
        <div className="hidden md:block absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-[#fd761a]/10 rounded-full blur-3xl"></div>
        
        <div className="relative w-full max-w-5xl flex flex-col md:flex-row items-center gap-6 lg:gap-16">
          
          {/* Welcome Column / Mascot */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 space-y-2 md:space-y-6 mt-4 md:mt-0">
            {/* Mobile Logo */}
            <img 
              alt="Digikidz Logo" 
              className="md:hidden h-14 object-contain mb-4" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIimhuVvrkr1iUkMNEAP2vFOWGBsp3RY4u4NFPzO3Lu5-lJMorLWdL_iYaL2xbTKsDMEUVieBvGmvjoqxUZZwaj0juBj_-fgKseP3BpK-lZmas346NT9keEYb68EVgqIUkXbBQ7rM61i0mmfyLJV0RvTUAQoihF4Cs9IiePseS5Jy6gNcMbbkMc47aFrrpxHeP_5x7_7-_mkF8riPaNqI1nInrc-IfyOVdqz9_Mb2dJCudv0Ud81zAsCXxyW1o_rKCQaAr2-m5pRU"
            />
            
            <div className="md:hidden text-center space-y-1 mb-2">
               <h1 className="text-2xl font-bold text-[#004ac6] tracking-tight">Halo, Coach Hebat!</h1>
               <p className="text-base text-[#434655]">Siap membimbing generasi cerdas hari ini?</p>
            </div>

            <div className="relative w-40 h-40 md:w-auto md:h-auto mb-2 md:mb-0 group md:pt-8 flex justify-center">
              <div className="md:hidden absolute inset-0 bg-[#004ac6]/10 rounded-full blur-2xl group-hover:bg-[#004ac6]/20 transition-all duration-500"></div>
              <img 
                alt="Mascot Digikidz" 
                className="relative z-10 w-full h-full md:w-64 lg:w-80 object-contain transform group-hover:scale-105 md:group-hover:scale-100 transition-transform duration-300 md:floating-mascot md:drop-shadow-xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwUg7q9oXSD9UnVVpdxjwiDleK1xohLxUnGZke_dXK91qXe72lVikGRMJcQrx2cIczyOzUaFEYkzS0FYDH_CWGjsJfmOqjKQmogpC71iOytFX-79befwPrFMg9LYWsb_iUI_uGK4flNkSmDOuIgFKuQ1UIkGdEwkizdfvNFk4RsL1zKRNBgkv6iITKgWmpmqO9W8Ha1io2lK0IUDL8tu3ZMYcfngAHnjEa1F5F2MTEFA9_FwJEckhdtJk5t-t9ypcjEUgMwt66Buo"
              />
              <div className="hidden md:block absolute -top-4 -right-12 glass-panel p-4 rounded-xl rounded-bl-none shadow-sm max-w-[180px]">
                <p className="text-sm font-semibold text-[#004ac6]">Ayo buat belajar jadi menyenangkan!</p>
              </div>
            </div>

            <div className="hidden md:block space-y-2">
              <h1 className="text-5xl font-extrabold text-[#004ac6] leading-tight tracking-tight">
                Halo,<br />Coach Hebat!
              </h1>
              <p className="text-lg text-[#434655] max-w-sm">
                Siap untuk menginspirasi anak-anak kreatif hari ini? Masuk ke portal Anda untuk memulai petualangan edukasi digital.
              </p>
            </div>
          </div>

          {/* Login Card */}
          <div className="w-full max-w-[480px] glass-card md:glass-panel rounded-lg md:rounded-[2rem] p-6 md:p-10 flex flex-col z-10 relative shadow-xl shadow-[#004ac6]/5 md:shadow-[0_20px_50px_rgba(0,74,198,0.08)]">
            <div className="hidden md:flex flex-col items-center mb-8">
              <img 
                alt="Digikidz Logo Desktop" 
                className="h-16 md:h-20 mb-6 drop-shadow-sm" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIimhuVvrkr1iUkMNEAP2vFOWGBsp3RY4u4NFPzO3Lu5-lJMorLWdL_iYaL2xbTKsDMEUVieBvGmvjoqxUZZwaj0juBj_-fgKseP3BpK-lZmas346NT9keEYb68EVgqIUkXbBQ7rM61i0mmfyLJV0RvTUAQoihF4Cs9IiePseS5Jy6gNcMbbkMc47aFrrpxHeP_5x7_7-_mkF8riPaNqI1nInrc-IfyOVdqz9_Mb2dJCudv0Ud81zAsCXxyW1o_rKCQaAr2-m5pRU" 
              />
              <h2 className="text-2xl font-bold text-center text-[#191c1e]">Masuk sebagai Coach</h2>
              <p className="text-sm font-medium text-[#737686] mt-1">Gunakan akun resmi Digikidz Anda</p>
            </div>

            <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#434655] block ml-1 md:ml-0" htmlFor="email">Email Coach</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] group-focus-within:text-[#004ac6] transition-colors pointer-events-none md:text-[24px] text-[20px]">mail</span>
                  <input 
                    className="w-full pl-11 md:pl-12 pr-4 py-3.5 md:py-3 bg-white border border-[#c3c6d7] rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#004ac6]/20 md:focus:ring-[#004ac6] focus:border-[#004ac6] transition-all text-base outline-none text-[#191c1e] placeholder:text-[#c3c6d7]" 
                    id="email" 
                    name="email" 
                    placeholder="coach@digikidz.id" 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1 md:px-0">
                  <label className="text-sm font-semibold text-[#434655]" htmlFor="password">Kata Sandi</label>
                  <a className="text-[#004ac6] hover:underline text-xs font-semibold" href="#">Lupa sandi?</a>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#737686] group-focus-within:text-[#004ac6] transition-colors pointer-events-none md:text-[24px] text-[20px]">lock</span>
                  <input 
                    className="w-full pl-11 md:pl-12 pr-11 md:pr-12 py-3.5 md:py-3 bg-white border border-[#c3c6d7] rounded-lg md:rounded-xl focus:ring-2 focus:ring-[#004ac6]/20 md:focus:ring-[#004ac6] focus:border-[#004ac6] transition-all text-base outline-none text-[#191c1e] placeholder:text-[#c3c6d7]" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#737686] hover:text-[#004ac6] transition-colors" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined md:text-[24px] text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-2 px-1 md:px-0 md:pt-2 pt-1">
                <input className="w-5 h-5 md:w-4 md:h-4 text-[#004ac6] border-[#737686] rounded focus:ring-[#004ac6] md:focus:ring-[#004ac6] focus:ring-[#004ac6]/20 cursor-pointer" id="remember" type="checkbox"/>
                <label className="text-sm md:text-xs font-medium md:font-medium text-[#434655] cursor-pointer select-none" htmlFor="remember">Tetap masuk selama 30 hari</label>
              </div>

              <button 
                className="w-full py-4 bg-[#004ac6] hover:bg-[#2563eb] md:hover:bg-[#004ac6] text-white font-bold md:font-semibold text-lg md:text-base rounded-lg md:rounded-xl shadow-lg shadow-[#004ac6]/20 md:shadow-[0_8px_20px_rgba(0,74,198,0.3)] md:hover:shadow-[0_12px_24px_rgba(0,74,198,0.4)] md:hover:scale-[1.02] active:scale-[0.98] md:active:scale-95 transition-all md:btn-premium-shine flex justify-center items-center gap-2 mt-4 md:mt-0" 
                type="submit"
                disabled={loading}
              >
                {loading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : (
                  <>
                    <span className="material-symbols-outlined md:hidden block" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                    <span>Masuk ke Portal</span>
                    <span className="material-symbols-outlined hidden md:block">rocket_launch</span>
                  </>
                )}
              </button>
            </form>

            <div className="hidden md:block mt-8 pt-8 border-t border-[#c3c6d7]/50 text-center">
              <p className="text-sm text-[#737686]">
                Belum punya akun? <a className="text-[#004ac6] font-bold hover:underline" href="#">Hubungi Admin</a>
              </p>
            </div>

            <div className="md:hidden mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-[#434655]">
                <div className="h-px w-8 bg-[#c3c6d7]"></div>
                <span className="text-xs font-medium">Butuh bantuan?</span>
                <div className="h-px w-8 bg-[#c3c6d7]"></div>
              </div>
              <button className="flex items-center gap-2 text-[#004ac6] font-bold hover:text-[#2563eb] transition-colors group">
                <span className="material-symbols-outlined">support_agent</span>
                <span className="text-sm">Hubungi Admin</span>
                <span className="material-symbols-outlined text-sm transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full pb-8 md:py-8 px-4 md:px-10 flex flex-col md:flex-row justify-center md:justify-between items-center gap-4 border-t-0 md:border-t border-[#c3c6d7]/30 bg-transparent md:bg-[#f7f9fb]/50 backdrop-blur-sm mt-auto z-10">
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm font-bold text-[#004ac6]">Digikidz Coaches</span>
          <span className="text-[#c3c6d7]">|</span>
          <p className="text-xs font-medium text-[#737686]">© 2024 Digikidz Technology for Creative Kids. All rights reserved.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4 md:mb-0">
          <a className="text-xs md:text-sm font-medium md:font-semibold text-[#737686] hover:text-[#004ac6] transition-colors" href="#">Pusat Bantuan</a>
          <a className="text-xs md:text-sm font-medium md:font-semibold text-[#737686] hover:text-[#004ac6] transition-colors" href="#">Kebijakan Privasi</a>
          <a className="text-xs md:text-sm font-medium md:font-semibold text-[#737686] hover:text-[#004ac6] transition-colors" href="#">Syarat & Ketentuan</a>
        </div>
        <p className="md:hidden text-center text-xs font-medium text-[#737686]/60">
            © 2024 Digikidz MIS. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Megaphone, Rocket, Sparkles, ChevronRight, CheckCircle, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { LevelGroup } from '@/lib/levelUtils';
import { StudentCertificate } from '@/hooks/useCertificates';
import { ActivityReport } from '@/hooks/useActivityReports';
import logodk from '@/assets/logodk.png';
import mascotChild from '@/assets/Mascot Optional CS6-05.png'; // placeholder for child avatar
import { ActivityFilterBar } from './ActivityFilterBar';

interface PortalDashboardProps {
  studentName: string;
  parentNotifications: string[];
  stats: {
    totalReports: number;
    completedLevels: number;
    currentLevel: number;
    programName: string;
    maxLevel: number;
  };
  levels: LevelGroup[];
  trialReport: ActivityReport | undefined;
  getCertForLevel: (level: number) => StudentCertificate | undefined;
  onViewCertificate: (cert: StudentCertificate) => void;
  onViewActivity: (level: number) => void;
  onViewTrial: () => void;
  onLogout?: () => void;
  
  // Filter props
  activityFilterLevel: string;
  setActivityFilterLevel: (val: string) => void;
  activityFilterWeek: string;
  setActivityFilterWeek: (val: string) => void;
  activityFilterMedia: 'all' | 'photo' | 'video';
  setActivityFilterMedia: (val: 'all' | 'photo' | 'video') => void;
  allReportWeeks: number[];
  filteredActivityReports: ActivityReport[];
  hasActiveActivityFilter: boolean;
  activeActivityFilterCount: number;
  onOpenReport: (report: ActivityReport) => void;
}

export function PortalDashboard({
  studentName,
  parentNotifications,
  stats,
  levels,
  trialReport,
  getCertForLevel,
  onViewCertificate,
  onViewActivity,
  onViewTrial,
  onLogout,
  activityFilterLevel,
  setActivityFilterLevel,
  activityFilterWeek,
  setActivityFilterWeek,
  activityFilterMedia,
  setActivityFilterMedia,
  allReportWeeks,
  filteredActivityReports,
  hasActiveActivityFilter,
  activeActivityFilterCount,
  onOpenReport
}: PortalDashboardProps) {

  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleScroll = () => {
      const timelineElement = document.getElementById('timeline');
      const certificatesElement = document.getElementById('certificates');
      if (!timelineElement || !certificatesElement) return;

      // Calculate middle of the screen
      const scrollPosition = window.scrollY + window.innerHeight / 2.5;

      if (certificatesElement.offsetTop <= scrollPosition) {
        setActiveTab('certificates');
      } else if (timelineElement.offsetTop <= scrollPosition) {
        setActiveTab('timeline');
      } else {
        setActiveTab('overview');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get most recent 5 activities if no filter is active, otherwise all filtered
  const timelineReports = hasActiveActivityFilter 
    ? filteredActivityReports 
    : [...filteredActivityReports].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 text-[#191c1e] min-h-screen relative font-sans flex flex-col md:flex-row w-full overflow-x-hidden">
      <style>
        {`
          .glass-panel {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(20px);
              -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.4);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          }
        `}
      </style>

      {/* Side Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col h-full w-64 fixed left-0 top-0 z-50 bg-white/80 backdrop-blur-2xl border-r border-white/30 shadow-lg p-6 gap-2">
        <div className="flex items-center gap-4 mb-10 px-2">
          <img alt="Digikidz Logo" className="h-8 w-auto object-contain" src={logodk} />
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <a 
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all font-semibold text-sm ${activeTab === 'overview' ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/20' : 'text-[#434655] hover:bg-[#f2f4f6]'}`} 
            href="#"
            onClick={() => setActiveTab('overview')}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
            <span>Overview</span>
          </a>
          <a 
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all font-semibold text-sm ${activeTab === 'timeline' ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/20' : 'text-[#434655] hover:bg-[#f2f4f6]'}`} 
            href="#timeline"
            onClick={() => setActiveTab('timeline')}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'timeline' ? "'FILL' 1" : "'FILL' 0" }}>analytics</span>
            <span>Activity Reports</span>
          </a>
          <a 
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all font-semibold text-sm ${activeTab === 'certificates' ? 'bg-[#004ac6] text-white shadow-md shadow-[#004ac6]/20' : 'text-[#434655] hover:bg-[#f2f4f6]'}`} 
            href="#certificates"
            onClick={() => setActiveTab('certificates')}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'certificates' ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
            <span>Certificates</span>
          </a>
        </nav>
        
        <div className="flex flex-col gap-2 mt-auto border-t border-[#c3c6d7]/30 pt-4">
          <a 
            className="flex items-center gap-3 text-[#434655] px-4 py-3 hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-lg transition-all font-semibold text-sm group" 
            href={`https://wa.me/6285169991918?text=${encodeURIComponent(`Halo Education Consultant, saya orang tua dari ${studentName}. Saya ingin bertanya/konfirmasi mengenai laporan aktivitas anak saya yang belum diupload.`)}`}
            target="_blank" 
            rel="noopener noreferrer"
          >
            <span className="material-symbols-outlined group-hover:text-[#25D366]">help</span>
            <span>Help Center</span>
          </a>
          <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-[#ffdad6]/50 text-[#ba1a1a] rounded-lg transition-all font-semibold text-sm w-full text-left">
            <span className="material-symbols-outlined text-[#ba1a1a]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-10 min-h-screen overflow-y-auto pb-24 md:pb-10">
        
        {/* Mobile Top Bar */}
        <header className="md:hidden flex justify-between items-center mb-8 glass-panel rounded-xl p-4 sticky top-4 z-40 bg-white/80">
          <img alt="Digikidz Logo" className="h-6 w-auto object-contain" src={logodk} />
          <button className="p-2 rounded-full hover:bg-[#e0e3e5] text-[#434655] transition-colors" onClick={onLogout}>
            <span className="material-symbols-outlined">logout</span>
          </button>
        </header>

        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Announcement Banner */}
          {parentNotifications.length > 0 && (
            <div className="glass-panel bg-white/60 rounded-xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 border-l-4 border-[#fd761a]">
              <div className="bg-[#fd761a]/20 p-3 rounded-full flex-shrink-0 text-[#fd761a]">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#191c1e]">Pemberitahuan Baru</h3>
                <div className="text-sm text-[#434655] mt-1">
                  {parentNotifications.map((msg, idx) => <p key={idx}>{msg}</p>)}
                </div>
              </div>
            </div>
          )}

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Col (Sticky Profile & Certificates) */}
            <div className="md:col-span-4 flex flex-col gap-6 self-start md:sticky md:top-24">
              <div className="glass-panel bg-white/60 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#dbe1ff] rounded-full blur-3xl opacity-50 z-0"></div>
                <div className="relative z-10 w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-[#e0e3e5] flex items-center justify-center p-2">
                  <img alt="Profile Picture" className="w-full h-full object-contain" src={mascotChild} />
                </div>
                <h2 className="text-2xl font-bold text-[#191c1e] mb-1 z-10">{studentName}</h2>
                <p className="text-sm text-[#434655] mb-4 z-10">{stats.programName}</p>
                
                <div className="flex flex-wrap justify-center gap-2 z-10 w-full mb-6">
                  <span className="px-3 py-1 bg-[#004ac6]/10 text-[#004ac6] rounded-full text-xs font-bold">Level {stats.currentLevel}</span>
                  <span className="px-3 py-1 bg-[#fd761a]/10 text-[#fd761a] rounded-full text-xs font-bold">{stats.completedLevels} Sertifikat</span>
                </div>
                
                <div className="mt-auto w-full glass-panel bg-white/80 rounded-lg p-4 flex justify-between items-center z-10">
                  <div className="text-left">
                    <div className="text-xs text-[#737686]">Total Sesi</div>
                    <div className="text-xl text-[#004ac6] font-bold">{stats.totalReports}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#737686]">Target</div>
                    <div className="text-base text-[#191c1e] font-bold">Lv {stats.maxLevel}</div>
                  </div>
                </div>
              </div>

              {/* Certificates Section (Moved to Left Col) */}
              <div className="glass-panel bg-gradient-to-b from-white/80 to-[#fff8e6]/80 rounded-2xl p-6 shadow-lg shadow-[#fd761a]/5 border border-white" id="certificates">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-[#191c1e] flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#fd761a] to-[#ff9b52] rounded-xl text-white shadow-md shadow-[#fd761a]/30">
                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>trophy</span>
                    </div>
                    Pencapaian
                  </h3>
                </div>
                
                <div className="flex flex-col gap-4">
                  {levels.map((lvl) => {
                    const cert = getCertForLevel(lvl.level);
                    if (cert) {
                      return (
                        <div key={lvl.level} onClick={() => onViewCertificate(cert)} className="relative overflow-hidden bg-gradient-to-br from-[#004ac6] to-[#3b82f6] rounded-2xl p-4 flex items-center gap-4 group cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-white/20">
                          <div className="absolute -top-6 -right-6 p-4 opacity-20 pointer-events-none text-white transition-transform group-hover:rotate-12 group-hover:scale-110 duration-500">
                             <Sparkles className="w-24 h-24" />
                          </div>
                          <div className="w-12 h-12 rounded-full bg-white/20 text-[#ffd700] flex items-center justify-center shrink-0 backdrop-blur-md shadow-inner border border-white/30">
                            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                          </div>
                          <div className="flex-1 min-w-0 z-10 text-white">
                            <h4 className="text-sm font-black truncate drop-shadow-md">{cert.courseName || `Sertifikat Level ${lvl.level}`}</h4>
                            <p className="text-[10px] text-blue-100 uppercase tracking-widest font-bold mt-0.5">Lulus dengan baik</p>
                          </div>
                          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity z-10 border border-white/20">
                            <span className="material-symbols-outlined text-sm">download</span>
                          </div>
                        </div>
                      );
                    } else if (lvl.level === stats.currentLevel) {
                      return (
                        <div key={lvl.level} className="border-2 border-dashed border-[#c3c6d7] rounded-2xl p-4 flex items-center gap-4 bg-white/40 text-[#737686] opacity-80">
                          <div className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center shrink-0 text-[#a4a7b5]">
                            <span className="material-symbols-outlined text-lg">lock</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#434655]">Level {lvl.level}</h4>
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-[#737686] mt-0.5">Sedang Dikerjakan</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                  
                  {stats.completedLevels === 0 && (
                    <div className="border-2 border-dashed border-[#c3c6d7]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 bg-white/50 text-[#737686]">
                       <span className="material-symbols-outlined opacity-50 text-3xl mb-1 text-[#004ac6]">school</span>
                       <span className="text-sm font-bold text-[#191c1e]">Belum ada sertifikat</span>
                       <span className="text-xs font-medium">Selesaikan level untuk memenangkan piala!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Main Activity & Progress (Right Col) */}
            <div className="md:col-span-8 flex flex-col gap-6" id="timeline">
              <div className="glass-panel bg-white/60 rounded-2xl p-6 flex-1">
                <div className="flex justify-between items-center mb-6 border-b border-[#c3c6d7]/30 pb-4">
                  <h3 className="text-xl text-[#191c1e] flex items-center gap-2 font-bold">
                    <span className="material-symbols-outlined text-[#004ac6]">timeline</span>
                    Aktivitas Terbaru
                  </h3>
                  <button className="text-[#004ac6] text-sm hover:underline font-semibold hidden md:block">Filter & Cari</button>
                </div>
                
                {/* Embedded Filter Bar */}
                <div className="mb-6">
                  <ActivityFilterBar
                    activityFilterLevel={activityFilterLevel}
                    setActivityFilterLevel={setActivityFilterLevel}
                    activityFilterWeek={activityFilterWeek}
                    setActivityFilterWeek={setActivityFilterWeek}
                    activityFilterMedia={activityFilterMedia}
                    setActivityFilterMedia={setActivityFilterMedia}
                    levels={levels}
                    allReportWeeks={allReportWeeks}
                    filteredActivityReports={filteredActivityReports}
                    hasActiveActivityFilter={hasActiveActivityFilter}
                    activeActivityFilterCount={activeActivityFilterCount}
                    onOpenReport={onOpenReport}
                  />
                </div>
                
                {/* Trial Report Callout if available and no filter active */}
                {!hasActiveActivityFilter && trialReport && (
                  <div className="mb-8 p-4 bg-gradient-to-br from-[#dbe1ff]/50 to-white border border-[#b4c5ff]/50 rounded-xl flex flex-col md:flex-row items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onViewTrial}>
                    <div className="w-12 h-12 rounded-full bg-[#004ac6] text-white flex items-center justify-center shrink-0">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-[#191c1e]">Masa Percobaan (Trial)</h4>
                      <p className="text-sm text-[#434655]">Sesi perkenalan pertama kali saat bergabung.</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 rounded-full">Lihat Trial</Button>
                  </div>
                )}

                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#c3c6d7]/50 before:to-transparent">
                  
                  {timelineReports.length === 0 ? (
                     <EmptyState title="Belum Ada Aktivitas" description="Laporan belajar anak akan muncul di sini." />
                  ) : timelineReports.map((report, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group cursor-pointer" onClick={() => onOpenReport(report)}>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-[#dbe1ff] text-[#004ac6] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-panel bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-bold text-[#004ac6] uppercase bg-[#004ac6]/10 px-2 py-0.5 rounded">M {report.lessonWeek}</span>
                          <time className="text-xs text-[#737686]">{report.createdAt ? new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}</time>
                        </div>
                        <h4 className="text-sm font-bold text-[#191c1e] mb-2">{report.moduleName || `Aktivitas ${report.level}`}</h4>
                        <p className="text-xs text-[#434655] mb-3 line-clamp-2">{report.evaluation || 'Tidak ada catatan evaluasi.'}</p>
                        
                        {report.mediaUrls && report.mediaUrls.length > 0 && (
                          <div className="rounded-lg overflow-hidden h-24 relative bg-[#e0e3e5]">
                            {report.mediaUrls[0].match(/\.(mov|mp4|webm|ogg)$/i) ? (
                              <div className="w-full h-full flex items-center justify-center bg-black/10">
                                <span className="material-symbols-outlined text-white text-3xl drop-shadow-md">play_circle</span>
                              </div>
                            ) : (
                              <img alt="Project" className="w-full h-full object-cover" src={report.mediaUrls[0]} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          </div>



        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full glass-panel bg-white/90 border-t-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center px-4 pb-4 pt-2">
        <a 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'overview' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`} 
          href="#"
          onClick={() => setActiveTab('overview')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'overview' ? "'FILL' 1" : "'FILL' 0" }}>dashboard</span>
          <span className="text-[10px] font-semibold">Overview</span>
        </a>
        <a 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'timeline' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`} 
          href="#timeline"
          onClick={() => setActiveTab('timeline')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'timeline' ? "'FILL' 1" : "'FILL' 0" }}>analytics</span>
          <span className="text-[10px] font-semibold">Aktivitas</span>
        </a>
        <a 
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === 'certificates' ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'}`} 
          href="#certificates"
          onClick={() => setActiveTab('certificates')}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'certificates' ? "'FILL' 1" : "'FILL' 0" }}>workspace_premium</span>
          <span className="text-[10px] font-semibold">Sertifikat</span>
        </a>
      </nav>
    </div>
  );
}

import { Sparkles, User, ChevronLeft, ChevronRight, PlayCircle, FolderOpen, PanelRightClose, PanelRightOpen, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LinkifiedText } from '@/components/LinkifiedText';
import { ActivityReport } from '@/hooks/useActivityReports';
import { LevelGroup } from '@/lib/levelUtils';
import logodk from '@/assets/logodk.png';

interface ActivityReportPlayerProps {
  selectedReport: ActivityReport | null;
  selectedLevel: number | null;
  setSelectedReport: (report: ActivityReport) => void;
  setSelectedLevel: (level: number | null) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  progressPercent: number;
  trialReport: ActivityReport | undefined;
  levels: LevelGroup[];
  reportsA: ActivityReport[];
  reportsB: ActivityReport[];
  effectiveLevel: number | null;
}

export function ActivityReportPlayer({
  selectedReport,
  selectedLevel,
  setSelectedReport,
  setSelectedLevel,
  isSidebarOpen,
  setIsSidebarOpen,
  progressPercent,
  trialReport,
  levels,
  reportsA,
  reportsB,
  effectiveLevel
}: ActivityReportPlayerProps) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-16 border-b border-slate-200 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white z-50">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => setSelectedLevel(null)} className="rounded-xl hover:bg-slate-100 shrink-0 gap-2 px-2 sm:px-3 text-slate-600">
            <ChevronLeft className="w-5 h-5" />
            <span className="text-xs font-bold">Dashboard</span>
          </Button>
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />
          <div className="min-w-0">
            <h2 className="font-bold text-slate-900 truncate text-sm sm:text-base">Level {selectedLevel} - Kurikulum Pembelajaran</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">School of Technology Digikidz</p>
          </div>
        </div>
        <img src={logodk} alt="DIGIKIDZ" className="h-6 sm:h-8 hidden xs:block" />
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className={`flex-1 overflow-y-auto bg-slate-50/30 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:mr-[350px]' : ''}`}>
          <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
            {selectedReport ? (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary p-6 sm:p-10 text-white relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-white">
                    <Sparkles className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">Week {selectedReport.lessonWeek}</p>
                    </div>
                    <div className="h-1 w-1 rounded-full bg-white/50" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{selectedReport.level}</p>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-black leading-tight tracking-tight">{selectedReport.lessonName}</h1>
                </div>

                <div className="p-6 sm:p-10 space-y-10 relative select-none">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden"
                    style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(`<svg width='400' height='400' xmlns='http://www.w3.org/2000/svg'><text x='50%' y='50%' text-anchor='middle' fill='black' font-size='14' font-family='sans-serif' font-weight='bold' transform='rotate(-45 200 200)'>DIGIKIDZ KOTA WISATA CIBUBUR</text></svg>`)}")` }}
                  />

                  <div className="relative z-10 space-y-10">
                    {selectedReport.goalsMateri && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-1.5 rounded-full bg-primary" />
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Goals Materi</h3>
                        </div>
                        <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-100">
                          <ul className="space-y-4">
                            {selectedReport.goalsMateri.split('\n').filter(Boolean).map((line, i) => (
                              <li key={i} className="flex gap-4">
                                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-black">{i + 1}</div>
                                <p className="text-slate-700 font-medium leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {selectedReport.activityReportText && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-1.5 rounded-full bg-primary" />
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Activity Report</h3>
                        </div>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-lg"><LinkifiedText text={selectedReport.activityReportText} /></p>
                        </div>
                      </div>
                    )}

                    {selectedReport.mediaUrls.length > 0 && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-1.5 rounded-full bg-primary" />
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">Dokumentasi Kelas</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedReport.mediaUrls.map((url, i) => {
                            const isVideo = url.toLowerCase().match(/\.(mov|mp4|webm|ogg)$/);
                            return (
                              <div key={i} onContextMenu={(e) => e.preventDefault()} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-black relative group aspect-video sm:aspect-square">
                                {isVideo ? (
                                  <video src={url} className="w-full h-full object-cover pointer-events-none" autoPlay muted loop playsInline controls={false} onContextMenu={(e) => e.preventDefault()} />
                                ) : (
                                  <img src={url} alt="Activity" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 pointer-events-none" onContextMenu={(e) => e.preventDefault()} />
                                )}
                                <a href={url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg">Lihat Media Full HD</span>
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-10 border-t border-slate-100 space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between gap-6">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Coach Pengajar :</p>
                          <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                            <span className="font-bold text-slate-900">{selectedReport.coach}</span>
                          </div>
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                          Sesi pada {new Date(selectedReport.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>

                      {(() => {
                        const all = [...reportsA, ...reportsB].sort((a, b) => a.lessonWeek - b.lessonWeek);
                        const idx = all.findIndex(r => r.id === selectedReport.id);
                        const prev = idx > 0 ? all[idx - 1] : null;
                        const next = idx < all.length - 1 ? all[idx + 1] : null;
                        if (!prev && !next) return null;
                        return (
                          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                            {prev ? (
                              <Button variant="ghost" onClick={() => setSelectedReport(prev)} className="flex flex-1 items-center justify-start gap-2 h-14 rounded-2xl border border-slate-100 px-2 sm:px-4">
                                <ChevronLeft className="w-4 h-4 text-slate-400" />
                                <div className="text-left min-w-0">
                                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Sebelumnya</p>
                                  <p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Week {prev.lessonWeek}</p>
                                </div>
                              </Button>
                            ) : <div />}
                            {next ? (
                              <Button variant="ghost" onClick={() => setSelectedReport(next)} className="flex flex-1 items-center justify-end gap-2 h-14 rounded-2xl border border-slate-100 px-2 sm:px-4 text-right">
                                <div className="text-right min-w-0">
                                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Selanjutnya</p>
                                  <p className="text-[10px] sm:text-xs font-black text-slate-700 truncate">Week {next.lessonWeek}</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-primary" />
                              </Button>
                            ) : <div />}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="bg-slate-50 p-8 rounded-full"><PlayCircle className="w-16 h-16 text-slate-200" /></div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">Pilih Pertemuan</h3>
                  <p className="text-slate-500 font-medium">Klik salah satu minggu di daftar sebelah kanan untuk melihat detail laporan aktivitas.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className={`fixed inset-y-0 right-0 w-full sm:w-[350px] bg-white border-l border-slate-200 z-[60] transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col bg-white">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-900 tracking-tight">Daftar pertemuan</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="lg:hidden rounded-full"><ChevronRight className="w-5 h-5" /></Button>
            </div>
            <div className="p-5 bg-slate-50/50 border-b border-slate-100">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Progress Level</span>
                <span className="text-sm font-black text-primary">{progressPercent}% Selesai</span>
              </div>
              <Progress value={progressPercent} className="h-2 bg-slate-200 shadow-inner" />
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                <Accordion
                  type="single"
                  collapsible
                  defaultValue={effectiveLevel ? `level-${effectiveLevel}` : (trialReport ? 'trial' : (levels[0] ? `level-${levels[0].level}` : undefined))}
                  className="w-full"
                >
                  {trialReport && (
                    <AccordionItem value="trial" className="border-none">
                      <AccordionTrigger className="hover:no-underline px-3 py-4 rounded-xl hover:bg-slate-50 group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-data-[state=open]:bg-amber-600 group-data-[state=open]:text-white transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-sm text-slate-700">Trial (W0)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-2 px-2 space-y-1">
                        <button
                          key={trialReport.id}
                          onClick={() => {
                            setSelectedLevel(null);
                            setSelectedReport(trialReport);
                            if (window.innerWidth < 1024) setIsSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedReport?.id === trialReport.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-slate-50 text-slate-500'}`}
                        >
                          <div className={`w-2 h-2 rounded-full shrink-0 ${selectedReport?.id === trialReport.id ? 'bg-primary' : 'bg-slate-200'}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-black leading-tight mb-1">Week 0</p>
                            <p className="text-[11px] font-bold truncate leading-none">{trialReport.lessonName}</p>
                          </div>
                        </button>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                  {levels.map((lvl) => {
                    const allInLevel = [...lvl.halfA, ...lvl.halfB].sort((a, b) => a.lessonWeek - b.lessonWeek);
                    return (
                      <AccordionItem key={lvl.level} value={`level-${lvl.level}`} className="border-none">
                        <AccordionTrigger className="hover:no-underline px-3 py-4 rounded-xl hover:bg-slate-50 group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-colors">
                              <FolderOpen className="w-4 h-4" />
                            </div>
                            <span className="font-bold text-sm text-slate-700">Level {lvl.level}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-1 pb-2 px-2 space-y-1">
                          {allInLevel.length > 0 ? allInLevel.map(r => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setSelectedLevel(lvl.level);
                                setSelectedReport(r);
                                if (window.innerWidth < 1024) setIsSidebarOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedReport?.id === r.id ? 'bg-primary/10 text-primary shadow-sm border border-primary/10' : 'hover:bg-slate-50 text-slate-500'}`}
                            >
                              <div className={`w-2 h-2 rounded-full shrink-0 ${selectedReport?.id === r.id ? 'bg-primary' : 'bg-slate-200'}`} />
                              <div className="min-w-0">
                                <p className="text-xs font-black leading-tight mb-1">Week {r.lessonWeek}</p>
                                <p className="text-[11px] font-bold truncate leading-none">{r.lessonName}</p>
                              </div>
                            </button>
                          )) : (
                            <div className="p-4 text-[10px] text-center italic text-slate-400">Belum ada modul terisi</div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </ScrollArea>
          </div>
        </aside>

        {!isSidebarOpen && (
          <Button onClick={() => setIsSidebarOpen(true)} className="fixed right-0 top-1/2 -translate-y-1/2 h-14 w-10 p-0 rounded-l-2xl bg-white border border-slate-200 border-r-0 shadow-xl z-50 text-slate-600 hover:bg-slate-50 hidden lg:flex items-center justify-center">
            <PanelRightOpen className="w-5 h-5 mx-auto -translate-x-0.5" />
          </Button>
        )}
        {isSidebarOpen && (
          <Button onClick={() => setIsSidebarOpen(false)} className="fixed right-[350px] top-1/2 -translate-y-1/2 h-14 w-10 p-0 rounded-l-2xl bg-white border border-slate-200 border-r-0 shadow-xl z-[70] text-slate-600 hover:bg-slate-50 hidden lg:flex items-center justify-center transform transition-all duration-300">
            <PanelRightClose className="w-5 h-5 mx-auto -translate-x-0.5" />
          </Button>
        )}
        <Button onClick={() => setIsSidebarOpen(true)} className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-slate-900 shadow-2xl text-white lg:hidden z-50 animate-bounce">
          <Menu className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}

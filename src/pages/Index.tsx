import { useMemo } from 'react';
import { useSchedule } from '@/hooks/useSchedule';
import { useAuth } from '@/hooks/useAuth';
import { getDisplayName } from '@/lib/displayNames';
import { Link, useNavigate } from 'react-router-dom';
import { DayOfWeek, DAY_LABELS } from '@/types/schedule';
import { LiveDateTime } from '@/components/LiveDateTime';

// Map JS getDay() (0=Sun, 1=Mon, ...) ke DayOfWeek
const JS_DAY_TO_SCHEDULE: Record<number, DayOfWeek> = {
  1: 'senin',
  2: 'selasa',
  3: 'rabu',
  4: 'kamis',
  5: 'jumat',
  6: 'sabtu',
  0: 'minggu',
};

const COACH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Mr. Bani':  { bg: '#dbe1ff', text: '#004ac6', border: '#004ac6' },
  'Mr. Argy':  { bg: '#f3e8ff', text: '#7c3aed', border: '#7c3aed' },
  'Ms. Zaura': { bg: '#fce7f3', text: '#be185d', border: '#be185d' },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  'Little Creator': { bg: '#e8fce8', text: '#006229' },
  'Junior':         { bg: '#dbe1ff', text: '#004ac6' },
  'Teenager':       { bg: '#ffdbca', text: '#9d4300' },
};

function getLevelColor(level: string) {
  if (level.startsWith('Little Creator')) return LEVEL_COLORS['Little Creator'];
  if (level.startsWith('Junior')) return LEVEL_COLORS['Junior'];
  return LEVEL_COLORS['Teenager'];
}

const statCard = {
  background: 'rgba(255,255,255,0.8)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.5)',
  borderRadius: 20,
  padding: 24,
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'space-between',
  position: 'relative' as const,
  overflow: 'hidden' as const,
  boxShadow: '0 2px 16px rgba(0,74,198,0.06)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const Index = () => {
  const { schedule, loading } = useSchedule();
  const { user } = useAuth();
  const navigate = useNavigate();
  const displayedCoachName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Coach';

  const activeStudents = useMemo(() => schedule.filter(s => s.isActive).length, [schedule]);

  const levelDistribution = useMemo(() => {
    let littleCreator = 0, junior = 0, teenager = 0;
    schedule.forEach(s => {
      if (s.level.startsWith('Little Creator')) littleCreator++;
      if (s.level.startsWith('Junior')) junior++;
      if (s.level.startsWith('Teenager')) teenager++;
    });
    const total = littleCreator + junior + teenager || 1;
    return {
      littleCreator: (littleCreator / total) * 100,
      junior: (junior / total) * 100,
      teenager: (teenager / total) * 100
    };
  }, [schedule]);

  // ── Agenda Hari Ini ──
  const todayKey = JS_DAY_TO_SCHEDULE[new Date().getDay()];
  const todayLabel = DAY_LABELS[todayKey];
  const todayDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const todayStudents = useMemo(() => {
    return schedule
      .filter(s => s.day === todayKey && s.isActive && s.status === 'active')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [schedule, todayKey]);

  return (
    <>
      {/* Page Header (Desktop) */}
      <div
        className="hidden relative overflow-hidden rounded-2xl mb-8 md:flex items-center justify-between px-5 py-6 md:px-8 md:py-7"
        style={{
          background: 'linear-gradient(135deg, #dbe1ff 0%, #eef2ff 60%, #fff 100%)',
          boxShadow: '0 2px 16px rgba(0,74,198,0.08)',
        }}
      >
        <div className="relative z-10 pr-24 md:pr-0">
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#191c1e', lineHeight: 1.2, margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 15, color: '#434655', marginTop: 4, fontWeight: 400 }}>
            Selamat datang, {displayedCoachName} 👋 Ini yang terjadi hari ini.
          </p>
        </div>
        <img
          alt="Digikidz Mascot"
          className="absolute right-[-10px] md:right-8 -bottom-2 h-24 md:h-28 w-auto object-contain z-10 opacity-90 md:opacity-100"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeoUy-VYNz48-vUSNO6KGS01ekOfzl4sTt57LpQfDbbeyBtx0zG6tcQ9Oyg08p1lE1AlSLLEE3n5k9PVot-GW3Wethqz-z9eS7SWJD-pwJ7rZGUPvPvdfoc4-eE_F6Z3zwy-6gCF2U4kFSDUAjX0Z2FzcU0fQEU6ZW-moOEla5GIt5eV0dDEuYSFEMDXAl81M8K-uTT9XZxFJJvbpwx6HoPQCw310evRQnTkzofMF2HV259BTzOyLpMjmat5WUvh8rtoQBp3d8bFQ"
        />
      </div>

      {/* --- Mobile View --- */}
      <div className="md:hidden block space-y-6 mb-6">
        <section className="glass-panel rounded-xl p-6 relative overflow-hidden flex items-center shadow-sm">
          <div className="flex-1 z-10">
            <h2 className="text-[24px] font-bold text-slate-900 mb-1 leading-[32px]">Hi, {displayedCoachName}! 👋</h2>
            <p className="text-[14px] font-semibold text-slate-500 max-w-[180px]">Ready to inspire our little creators today?</p>
            <div className="mt-4 flex gap-2">
              <Link to="/reports" className="bg-[#004ac6] text-white px-4 py-2 rounded-lg text-[14px] font-semibold shadow-lg shadow-[#004ac6]/20 active:scale-95 transition-all">Quick Report</Link>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-2 w-40 h-auto z-0 opacity-90">
            <img alt="Digikidz Mascot" className="w-full h-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPgZ5E9MWw7tG8w7XJbbo1Mtk_Jyg9Kd4MJrqjY1DFF-O5MqLiWrpzUUJEnv7H5pppgXPch6_3448kjwDDwJ-9qD12qXXQWf0JNL4vEYRACZ-Dt5wgw2K5SMQVO6UtU53y5yVnAGuUGR4YiEUwYGchkznocH1JLY6PFizDT4lhmish2Mme6CzebVu8PrJTaMIF8KTY54nInIkkW8HTUMJl2iV6qpNi1ZYw7SbzhJ2u96-FHMRo2wzq-gjSMBwjWvOJhu-gfzOyfr4" />
          </div>
        </section>

        {/* Overview Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-bold uppercase tracking-wider text-slate-500">Overview</h3>
            <span className="text-[12px] font-medium text-[#004ac6]">All Time</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-xl shadow-sm border-l-4 border-[#004ac6]">
              <span className="text-[12px] font-medium text-slate-500">Active Students</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-semibold text-slate-900">{activeStudents}</span>
              </div>
            </div>
            <div className="glass-panel p-4 rounded-xl shadow-sm border-l-4 border-[#9d4300]">
              <span className="text-[12px] font-medium text-slate-500">Total Enrollments</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-[24px] font-semibold text-slate-900">{schedule.length}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Class Distribution Chart */}
        <section className="glass-panel p-5 rounded-xl shadow-sm">
          <h3 className="text-[14px] font-bold mb-4 text-slate-900">Class Distribution</h3>
          <div className="flex items-end justify-around h-32 px-2">
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-[#006229]/20 rounded-t-lg relative h-24">
                <div className="w-10 bg-[#006229] rounded-t-lg absolute bottom-0 transition-all duration-1000" style={{ height: `${levelDistribution.littleCreator}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">L. Creator</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-[#004ac6]/20 rounded-t-lg relative h-24">
                <div className="w-10 bg-[#004ac6] rounded-t-lg absolute bottom-0 transition-all duration-1000" style={{ height: `${levelDistribution.junior}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Junior</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 bg-[#9d4300]/20 rounded-t-lg relative h-24">
                <div className="w-10 bg-[#9d4300] rounded-t-lg absolute bottom-0 transition-all duration-1000" style={{ height: `${levelDistribution.teenager}%` }}></div>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Teenager</span>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <h3 className="text-[14px] font-bold uppercase tracking-wider text-slate-500">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/reports" className="flex items-center gap-3 p-3 glass-panel rounded-xl hover:bg-[#004ac6]/5 active:scale-95 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-[#2563eb]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#004ac6]">vpn_key</span>
              </div>
              <span className="text-[14px] font-semibold text-slate-900 leading-tight">Access Code</span>
            </Link>
            <Link to="/kalender" className="flex items-center gap-3 p-3 glass-panel rounded-xl hover:bg-[#004ac6]/5 active:scale-95 transition-all text-left">
              <div className="w-10 h-10 rounded-lg bg-[#fd761a]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#9d4300]">calendar_today</span>
              </div>
              <span className="text-[14px] font-semibold text-slate-900 leading-tight">View Schedule</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Stats Cards (Desktop) */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Active Students */}
        <div style={statCard}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: '#eef2ff' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#004ac6', fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#434655', marginBottom: 4 }}>Active Students</p>
            <p style={{ fontSize: 48, fontWeight: 800, color: '#191c1e', lineHeight: 1 }}>{activeStudents}</p>
          </div>
          <div style={{ position: 'absolute', bottom: -16, right: -16, width: 80, height: 80, background: '#004ac6', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.15 }} />
        </div>

        {/* Total Enrollments */}
        <div style={statCard}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: '#fff3ee' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#9d4300', fontVariationSettings: "'FILL' 1" }}>person_add</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#434655', marginBottom: 4 }}>Total Enrollments</p>
            <p style={{ fontSize: 48, fontWeight: 800, color: '#191c1e', lineHeight: 1 }}>{schedule.length}</p>
            <p style={{ fontSize: 12, color: '#737686', marginTop: 4 }}>All time</p>
          </div>
          <div style={{ position: 'absolute', bottom: -16, right: -16, width: 80, height: 80, background: '#9d4300', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.15 }} />
        </div>

        {/* Level Distribution */}
        <div style={statCard}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center justify-center rounded-full" style={{ width: 44, height: 44, background: '#e8fce8' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#006229', fontVariationSettings: "'FILL' 1" }}>category</span>
            </div>
          </div>
          <div className="w-full mt-auto">
            <p style={{ fontSize: 13, fontWeight: 500, color: '#434655', marginBottom: 10 }}>Class Distribution</p>
            <div style={{ display: 'flex', height: 10, width: '100%', borderRadius: 999, overflow: 'hidden', gap: 2, background: '#e6e8ea' }}>
              <div style={{ background: '#006229', height: '100%', width: `${levelDistribution.littleCreator}%`, borderRadius: 999 }} />
              <div style={{ background: '#004ac6', height: '100%', width: `${levelDistribution.junior}%`, borderRadius: 999 }} />
              <div style={{ background: '#9d4300', height: '100%', width: `${levelDistribution.teenager}%`, borderRadius: 999 }} />
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#006229' }} /><span style={{ fontSize: 10, color: '#434655' }}>Little Creator</span></div>
              <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#004ac6' }} /><span style={{ fontSize: 10, color: '#434655' }}>Junior</span></div>
              <div className="flex items-center gap-1"><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9d4300' }} /><span style={{ fontSize: 10, color: '#434655' }}>Teenager</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Agenda Hari Ini + Quick Actions (Desktop / General) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

        {/* ── Agenda Hari Ini ── */}
        <div className="col-span-12 md:col-span-8">
          {/* Header row */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191c1e', margin: 0 }}>
                Agenda Hari Ini
              </h2>
              <div className="mt-2">
                <LiveDateTime />
              </div>
            </div>
            <Link
              to="/kalender"
              className="flex items-center gap-1 hover:underline"
              style={{ fontSize: 13, fontWeight: 600, color: '#004ac6', textDecoration: 'none' }}
            >
              Lihat Jadwal <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>

          {/* Card */}
          <div
            style={{
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.5)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 2px 16px rgba(0,74,198,0.06)',
            }}
          >
            {/* Table Header */}
            <div
              className="hidden md:grid grid-cols-12 gap-2"
              style={{ padding: '12px 24px', borderBottom: '1px solid #f0f2f4' }}
            >
              <div className="col-span-1" style={{ fontSize: 11, fontWeight: 600, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Jam</div>
              <div className="col-span-4" style={{ fontSize: 11, fontWeight: 600, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Murid</div>
              <div className="col-span-3" style={{ fontSize: 11, fontWeight: 600, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Level</div>
              <div className="col-span-2" style={{ fontSize: 11, fontWeight: 600, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Coach</div>
              <div className="col-span-2" style={{ fontSize: 11, fontWeight: 600, color: '#737686', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Aksi</div>
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ padding: 24 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ height: 56, background: '#f2f4f6', borderRadius: 12, marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
                ))}
              </div>
            ) : todayStudents.length > 0 ? (
              todayStudents.map((entry, i) => {
                const coachColor = COACH_COLORS[entry.coach] ?? { bg: '#eef2ff', text: '#004ac6', border: '#004ac6' };
                const levelColor = getLevelColor(entry.level);
                return (
                  <div
                    key={entry.id}
                    className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 md:items-center"
                    style={{
                      padding: '16px 24px',
                      borderBottom: i < todayStudents.length - 1 ? '1px solid #f0f2f4' : 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,74,198,0.03)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {/* Jam (Desktop) */}
                    <div className="md:col-span-1 hidden md:flex items-center">
                      <span className="flex-shrink-0 inline-block" style={{ fontSize: 13, fontWeight: 700, color: '#004ac6', background: '#eef2ff', padding: '4px 10px', borderRadius: 8 }}>
                        {entry.time}
                      </span>
                    </div>

                    {/* Murid (with Mobile Jam) */}
                    <div className="md:col-span-4 flex items-center gap-4 md:gap-3">
                      <span className="md:hidden flex-shrink-0 inline-block" style={{ fontSize: 13, fontWeight: 700, color: '#004ac6', background: '#eef2ff', padding: '4px 10px', borderRadius: 8 }}>
                        {entry.time}
                      </span>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 36, height: 36, background: coachColor.bg, color: coachColor.text, fontWeight: 700, fontSize: 13 }}
                        >
                          {entry.studentName.substring(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#191c1e' }}>{entry.studentName}</span>
                      </div>
                    </div>

                    {/* Level (with Mobile Coach) */}
                    <div className="md:col-span-3 flex flex-wrap items-center gap-2">
                      <span className="inline-block" style={{ padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: levelColor.bg, color: levelColor.text }}>
                        {entry.level}
                      </span>
                      <span className="md:hidden flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: coachColor.text }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                        {entry.coach}
                      </span>
                    </div>

                    {/* Coach (Desktop) */}
                    <div className="md:col-span-2 hidden md:flex items-center">
                      <span className="flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: coachColor.text, border: `1px solid ${coachColor.border}`, padding: '4px 10px', borderRadius: 8 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>person</span>
                        {entry.coach}
                      </span>
                    </div>

                    {/* Tulis Report Button */}
                    <div className="md:col-span-2 w-full mt-1 md:mt-0 flex md:justify-end">
                      <button
                        onClick={() => navigate(`/reports?student=${encodeURIComponent(entry.studentName)}`)}
                        className="flex items-center justify-center gap-2 rounded-xl transition-all w-full md:w-auto"
                        style={{
                          background: '#004ac6',
                          color: '#fff',
                          border: 'none',
                          padding: '10px 16px',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0,74,198,0.2)',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#003aab'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#004ac6'; }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span>
                        Tulis Report
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#c3c6d7', display: 'block', marginBottom: 12 }}>
                  event_busy
                </span>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#434655', marginBottom: 4 }}>
                  Tidak ada kelas hari {todayLabel} ini
                </p>
                <p style={{ fontSize: 13, color: '#737686' }}>Semua jadwal kelas ada di halaman Jadwal.</p>
                <Link
                  to="/kalender"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, padding: '8px 18px', background: '#004ac6', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,74,198,0.25)' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                  Lihat Jadwal
                </Link>
              </div>
            )}
          </div>

          {/* Summary chip */}
          {todayStudents.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#737686' }}>
                <strong style={{ color: '#004ac6' }}>{todayStudents.length} murid</strong> terjadwal hari {todayLabel}
              </span>
              <button
                onClick={() => navigate('/reports')}
                style={{ fontSize: 12, fontWeight: 700, color: '#004ac6', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                Buka halaman Report →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191c1e' }}>Quick Actions</h2>
          <Link
            to="/kalender"
            className="flex flex-col items-start rounded-2xl"
            style={{
              padding: '20px 24px',
              background: '#004ac6',
              color: '#fff',
              textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(0,74,198,0.3)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(0,74,198,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,74,198,0.3)'; }}
          >
            <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.2)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Manage Schedule</span>
            <span style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>View and manage student schedules.</span>
          </Link>

          <Link
            to="/reports"
            className="flex flex-col items-start rounded-2xl"
            style={{
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.5)',
              color: '#191c1e',
              textDecoration: 'none',
              boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
          >
            <div className="flex items-center justify-center rounded-full mb-3" style={{ width: 40, height: 40, background: '#fff3ee' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#9d4300', fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#004ac6' }}>Activity Reports</span>
            <span style={{ fontSize: 13, color: '#434655', marginTop: 4 }}>Write reports and send to parents via WA.</span>
          </Link>

          {/* Today's count badge */}
          {todayStudents.length > 0 && (
            <div
              style={{
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.5)',
                borderRadius: 16,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#006229', fontVariationSettings: "'FILL' 1" }}>today</span>
              <div>
                <p style={{ fontSize: 12, color: '#737686', margin: 0 }}>Murid hari ini</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#006229', margin: 0 }}>{todayStudents.length} murid</p>
              </div>
            </div>
          )}

          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ padding: 20, background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.4)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#737686', marginRight: 6 }}>verified_user</span>
            <span style={{ fontSize: 12, color: '#737686', fontWeight: 500 }}>System Status: Optimal</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Index;

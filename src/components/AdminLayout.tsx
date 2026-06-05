import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/displayNames";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Dashboard", path: "/", icon: "dashboard" },
  { name: "Jadwal", path: "/kalender", icon: "calendar_today" },
  { name: "Activity Reports", path: "/reports", icon: "analytics" },
  { name: "Sertifikat", path: "/sertifikat", icon: "workspace_premium" },
  { name: "Parent Portal", path: "/parent", icon: "family_restroom", external: true },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.user_metadata?.full_name || getDisplayName(user?.email || '') || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }} className="min-h-screen bg-[#f7f9fb] overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 600, height: 600,
            top: -200, left: -100,
            background: 'var(--primary-fixed-dim)',
            filter: 'blur(80px)',
            opacity: 0.35,
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500, height: 500,
            bottom: -150, right: -100,
            background: 'var(--secondary-fixed)',
            filter: 'blur(80px)',
            opacity: 0.2,
          }}
        />
      </div>

      <div className="relative z-10 flex h-screen w-full">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ── */}
        <nav
          className={`fixed left-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
          style={{
            width: 240,
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '4px 0 24px rgba(0,74,198,0.05)',
            padding: '24px 16px',
            gap: 8,
          }}
        >
          {/* Close button for mobile */}
          <button 
            className="md:hidden absolute top-4 right-4 p-1 text-gray-500 hover:bg-gray-100 rounded-full"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div
              className="flex-shrink-0 rounded-xl overflow-hidden"
              style={{ width: 44, height: 44, background: '#eef2ff' }}
            >
              <img
                alt="Digikidz"
                className="w-full h-full object-contain p-1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRKHynERf5wOA8tgfU9v2Phn0cnFl1t-odrlzqRW66eyM8P0bMiNRphbcj1RAVJGu9EVTIXLyYtTtPbYU669zpPfC23q9DzpaDGoRmMqTyGw6ke6OA5_D8jVPGde8PdzqcTXpWahYDQhqnG728r8IUIhFl56Jav5htmRGNxIRIiAKRfnvbt3gFZnB30uNbPUQtt5_AAXj3H_MZiF1fNP2wMOaeJFMyf-y70wbcc9SAxYphc0y52ejfmTxR2sRnnGV2v1kndz3uQvE"
              />
            </div>
            <div>
              <div style={{ color: '#004ac6', fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>DigiKidz</div>
              <div style={{ color: '#434655', fontSize: 11, fontWeight: 500 }}>Learning Management</div>
            </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1 flex-1">
            {navItems.map((item) => {
              const isExternal = 'external' in item && item.external;
              const isActive = !isExternal && (
                location.pathname === item.path ||
                (item.path !== "/" && location.pathname.startsWith(item.path))
              );

              const sharedStyle = {
                padding: '10px 14px',
                background: isActive ? '#004ac6' : 'transparent',
                color: isActive ? '#ffffff' : isExternal ? '#9d4300' : '#434655',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                boxShadow: isActive ? '0 4px 12px rgba(0,74,198,0.25)' : 'none',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                borderRadius: 12,
                transition: 'background 0.15s',
                cursor: 'pointer',
                border: isExternal ? '1px dashed #ffb690' : 'none',
              };

              if (isExternal) {
                return (
                  <a
                    key={item.path}
                    href={item.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={sharedStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff3ee'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 20, fontVariationSettings: "'FILL' 0, 'wght' 400" }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 'auto', opacity: 0.5 }}>open_in_new</span>
                  </a>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={sharedStyle}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f0f4ff';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 20,
                      fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-1" style={{ borderTop: '1px solid #e0e3e5', paddingTop: 16 }}>
            <div
              className="flex items-center gap-3 rounded-xl"
              style={{ padding: '10px 14px', background: '#f0f4ff' }}
            >
              <div
                className="rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  width: 32, height: 32,
                  background: '#004ac6',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontSize: 13, fontWeight: 600, color: '#191c1e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: 11, color: '#434655' }}>Administrator</div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-3 rounded-xl w-full transition-all duration-200"
              style={{ padding: '10px 14px', color: '#ba1a1a', fontWeight: 500, fontSize: 14, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff0f0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <main className="relative flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 md:ml-[240px]">
          {/* Top Nav */}
          <header
            className="flex items-center justify-between absolute top-0 left-0 w-full z-30 px-4 py-3 md:px-8 md:py-4"
            style={{
              background: 'rgba(255, 255, 255, 0.45)',
              backdropFilter: 'blur(10px) saturate(150%)',
              WebkitBackdropFilter: 'blur(10px) saturate(150%)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            }}
          >
            <div className="flex items-center gap-3 w-full max-w-md">
              {/* Mobile menu toggle */}
              <button 
                className="md:hidden p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>menu</span>
              </button>

              {/* Spacer */}
              <div className="relative flex-1"></div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                className="rounded-full flex items-center justify-center transition-all"
                style={{ width: 38, height: 38, border: 'none', background: 'transparent', cursor: 'pointer', color: '#434655' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0f4ff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
              </button>
              <div
                className="rounded-full flex items-center justify-center"
                style={{ width: 36, height: 36, background: '#004ac6', color: '#fff', fontWeight: 700, fontSize: 14 }}
              >
                {initials}
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-6 pt-[80px] md:px-8 md:pb-8 md:pt-[90px]">
            {children}
            <div style={{ height: 32 }} />
          </div>
        </main>
      </div>
    </div>
  );
}

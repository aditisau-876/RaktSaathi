import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_CHAPTERS } from '@/core/constants/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white/88 backdrop-blur-xl border-r border-slate-200/70 z-50 flex flex-col justify-between select-none shadow-xs transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Brand Logo Header */}
          <div className="h-16 px-5 border-b border-slate-200/80 flex items-center justify-between">
            <NavLink to="/overview" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm ring-2 ring-red-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[19px]">vital_signs</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-extrabold text-[16px] tracking-tight text-ink-main">
                    RaktSaathi
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-50 text-primary font-bold tracking-wider border border-red-100">
                    Ops
                  </span>
                </div>
                <span className="text-[9px] text-ink-faint tracking-wider uppercase font-semibold">
                  Shortage Intelligence
                </span>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-ink-main hover:bg-slate-100 transition-colors"
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            )}
          </div>

          {/* Categorized Navigation Chapters */}
          <div className="p-3 flex-1 overflow-y-auto space-y-5">
            {NAVIGATION_CHAPTERS.map(chapter => (
              <div key={chapter.title} className="flex flex-col gap-1">
                <span className="px-2.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-mono">
                  {chapter.title}
                </span>
                <div className="space-y-0.5 mt-0.5">
                  {chapter.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => onClose?.()}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          isActive
                            ? 'bg-red-50/90 text-primary font-bold border border-red-200/90 shadow-xs'
                            : 'text-slate-600 hover:text-ink-main hover:bg-slate-100/70'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0 truncate">
                            <span
                              className={`material-symbols-outlined text-[19px] ${
                                isActive ? 'text-primary' : 'text-slate-400'
                              }`}
                            >
                              {item.icon}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                item.badgeType === 'alert'
                                  ? 'bg-red-100 text-primary animate-pulse'
                                  : item.badgeType === 'count'
                                  ? 'bg-slate-100 text-slate-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engine Operational Telemetry Badge */}
        <div className="p-3 m-3 bg-slate-50 border border-slate-200/90 rounded-xl flex flex-col gap-1.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-main">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Shortage Engine
            </span>
            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
              ONLINE
            </span>
          </div>
          <p className="text-[10px] leading-tight text-slate-500 font-mono">
            Snowflake DW Core • Cloudinary Edge
          </p>
          <div className="text-[9px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span>Delhi NCR Cluster</span>
            <span>Sync: 22:48 IST</span>
          </div>
        </div>

        {/* Portal Exit Links */}
        <div className="px-3 pb-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <NavLink
            to="/"
            className="flex items-center gap-1.5 hover:text-primary transition-colors py-1 px-1.5 rounded hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[15px]">public</span>
            <span>Public Portal</span>
          </NavLink>
          <NavLink
            to="/auth"
            className="flex items-center gap-1 hover:text-primary transition-colors py-1 px-1.5 rounded hover:bg-slate-100"
          >
            <span className="material-symbols-outlined text-[15px]">logout</span>
            <span>Exit</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};

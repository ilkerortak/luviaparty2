import React from 'react';
import { Gamepad2, Radio, Compass, MessageSquare, User as UserIcon } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export type TabType = 'lobby' | 'voice_lobby' | 'moments' | 'messages' | 'profile';

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'lobby' as TabType,
      label: 'Luvia',
      icon: Gamepad2,
    },
    {
      id: 'voice_lobby' as TabType,
      label: 'Sohbet Odası',
      icon: Radio,
      badge: 'CANLI',
    },
    {
      id: 'messages' as TabType,
      label: 'Mesaj',
      icon: MessageSquare,
      hasDot: true,
    },
    {
      id: 'moments' as TabType,
      label: 'Keşfet',
      icon: Compass,
    },
    {
      id: 'profile' as TabType,
      label: 'Benim',
      icon: UserIcon,
    },
  ];

  return (
    <nav className="sticky bottom-0 z-40 w-full select-none bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] transition-all">
      <div className="px-3 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),6px)] flex items-center justify-around gap-1 max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playPop();
                onSelectTab(tab.id);
              }}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 active:scale-95 group cursor-pointer ${
                isActive ? 'text-pink-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {/* Icon Capsule */}
              <div
                className={`relative px-3.5 py-1.5 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-amber-500/15 text-pink-600 shadow-sm -translate-y-0.5'
                    : 'group-hover:bg-slate-100/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-pink-600 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />

                {/* Live Badge for Voice Room */}
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 px-1.5 py-[1px] rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[8px] font-black tracking-wider text-white shadow-sm shadow-red-500/40 flex items-center gap-0.5 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                    <span>{tab.badge}</span>
                  </span>
                )}

                {/* Unread Message Dot with ping effect */}
                {tab.hasDot && (
                  <span className="absolute top-1 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500 ring-2 ring-white" />
                  </span>
                )}
              </div>

              {/* Tab Title Label */}
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  isActive ? 'font-black text-pink-600 scale-105' : 'font-semibold text-slate-400'
                }`}
              >
                {tab.label}
              </span>

              {/* Active Tab Glow Bar */}
              {isActive && (
                <span className="w-4 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mt-0.5 shadow-[0_1px_4px_rgba(236,72,153,0.5)] animate-in zoom-in-75 duration-200" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

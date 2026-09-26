import React, { useState } from 'react';
import type { User } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import { Coins, Plus, Bell, Crown } from 'lucide-react';
import { CharmBadge, getCharmInfo } from '../../utils/charmLevel';

interface TopBarProps {
  currentUser: User;
  onOpenProfile: () => void;
  onOpenShop: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onOpenProfile,
  onOpenShop,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full select-none bg-white border-b border-gray-100 transition-colors flex-shrink-0 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)]">
      <div className="px-4 py-2 flex items-center justify-between gap-3">
        {/* Left: User Avatar & Micro Profile Capsule */}
        <div
          onClick={() => {
            soundFX.playPop();
            onOpenProfile();
          }}
          className="flex items-center gap-2.5 cursor-pointer group p-1 -ml-1 rounded-2xl hover:bg-gray-50 transition-all"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-teal-400 to-cyan-500 flex items-center justify-center">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <AvatarRenderer config={currentUser.avatarConfig} className="w-full h-full" />
              </div>
            </div>

            {/* Micro Level Tag */}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-[1px] rounded-full bg-cyan-500 text-[9px] font-black text-white shadow-sm leading-tight border-2 border-white">
              {currentUser.level}
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-gray-800 group-hover:text-gray-900 tracking-tight">
                {currentUser.username}
              </span>
              <CharmBadge level={getCharmInfo(currentUser.charm).level || 2} size="xs" />
              {currentUser.vipLevel > 0 && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-[1px] rounded bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-extrabold uppercase">
                  <Crown className="w-2.5 h-2.5 text-amber-500" />
                  VIP{currentUser.vipLevel}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Çevrimiçi</span>
            </div>
          </div>
        </div>

        {/* Right: Currency Chips & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Pill - Sadece Altın */}
          <div
            onClick={() => {
              soundFX.playPop();
              onOpenShop();
            }}
            className="flex items-center bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 px-2.5 py-1 rounded-full cursor-pointer transition-all active:scale-95 shadow-xs"
          >
            {/* Coins */}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-xs">
                <Coins className="w-2.5 h-2.5 text-amber-950 font-bold" />
              </div>
              <span className="text-xs font-black text-amber-700 tabular-nums">
                {currentUser.coins.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="w-4 h-4 ml-1.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </div>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                soundFX.playPop();
                setShowNotifications(!showNotifications);
              }}
              className="relative w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition active:scale-90"
              title="Bildirimler"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            
            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-10 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-black text-gray-800">Bildirimler</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {[
                      { icon: '🎁', text: 'Günlük ödülünüz hazır!', time: 'Şimdi' },
                      { icon: '🎉', text: 'Yeni etkinlik başladı!', time: '2 saat önce' },
                      { icon: '👋', text: 'Arkadaşınız online!', time: '1 gün önce' },
                    ].map((notif, idx) => (
                      <div key={idx} className="p-3 border-b border-gray-50 hover:bg-gray-50 flex items-start gap-3 cursor-pointer">
                        <span className="text-xl">{notif.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-gray-700">{notif.text}</p>
                          <span className="text-[10px] text-gray-400">{notif.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { UserCheck, X, Check, Heart, Shield, Crown } from 'lucide-react';
import { CharmBadge, getCharmInfo } from '../../utils/charmLevel';

export interface WaitlistApplicant {
  id: string;
  username: string;
  avatarUrl?: string;
  gender?: 'female' | 'male';
  gemLevel?: number;
  charmLevel?: number;
  vipTag?: string;
  appliedAt: number;
}

interface MicWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  isHost: boolean;
  waitlist: WaitlistApplicant[];
  onApply: () => void;
  onCancelApply: () => void;
  onAdmitUser?: (applicant: WaitlistApplicant) => void;
}

export const MicWaitlistModal: React.FC<MicWaitlistModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  isHost,
  waitlist,
  onApply,
  onCancelApply,
  onAdmitUser,
}) => {
  if (!isOpen) return null;

  const isUserQueued = waitlist.some(u => u.id === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in duration-200">
      <div 
        className="w-full bg-white text-slate-900 rounded-t-[32px] px-5 pt-3 pb-6 shadow-2xl flex flex-col max-h-[82vh] animate-in slide-in-from-bottom duration-300 relative select-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header matching media_1790339116055.jpg: Bekleniliyor (6 kişi) */}
        <div className="text-center pb-3 border-b border-slate-100">
          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Bekleniliyor ({waitlist.length} kişi)
          </h3>
        </div>

        {/* Applicant List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 my-1 no-scrollbar min-h-[220px] max-h-[380px]">
          {waitlist.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <span className="text-4xl mb-2">🛋️</span>
              <p className="text-xs font-bold text-slate-600">Henüz bekleyen kimse yok</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mikrofona başvurarak sıraya katılabilirsiniz.</p>
            </div>
          ) : (
            waitlist.map((applicant) => {
              const isMe = applicant.id === currentUser.id;

              return (
                <div
                  key={applicant.id}
                  onClick={() => {
                    if (isHost && !isMe && onAdmitUser) {
                      soundFX.playPop();
                      const confirmSeat = window.confirm(`${applicant.username} kullanıcısını boş bir koltuğa almak istiyor musunuz?`);
                      if (confirmSeat) {
                        onAdmitUser(applicant);
                      }
                    }
                  }}
                  className={`flex items-center justify-between p-2 rounded-2xl transition ${
                    isHost && !isMe
                      ? 'hover:bg-slate-50 cursor-pointer active:scale-98'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* User Avatar */}
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-200 shadow-sm shrink-0">
                      <img
                        src={applicant.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={applicant.username}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Name & Badges Column matching media_1790339116055.jpg */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 tracking-tight">
                          {applicant.username}
                        </span>
                        {/* Gender Icon */}
                        {applicant.gender === 'female' ? (
                          <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-[10px] font-bold">
                            ♀
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                            ♂
                          </span>
                        )}
                        {/* Diamond / Gem Level Badge */}
                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-600 font-black text-[9px]">
                          💎{applicant.gemLevel || 5}
                        </span>
                      </div>

                      {/* Badges Row (Charm, VIP, Crown badges) */}
                      <div className="flex items-center gap-1 mt-1">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[9px] shadow-sm">
                          🏅
                        </span>
                        <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center text-[9px] shadow-sm">
                          🏵️
                        </span>
                        <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[9px] shadow-sm">
                          🛡️
                        </span>
                        {applicant.vipTag && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[8px] font-black uppercase">
                            {applicant.vipTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Action / Host Indicator */}
                  {isHost && !isMe ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAdmitUser) onAdmitUser(applicant);
                      }}
                      className="px-3 py-1.5 rounded-full bg-cyan-50 text-[#00a8e0] border border-cyan-300 font-bold text-xs hover:bg-cyan-100 active:scale-95 transition"
                    >
                      Koltuğa Al
                    </button>
                  ) : isMe ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                      Sıranız: #{waitlist.findIndex(u => u.id === currentUser.id) + 1}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Bottom Action Button matching media_1790339116055.jpg: Mikrofon kullanımı için başvur */}
        <div className="pt-2 border-t border-slate-100">
          {isUserQueued ? (
            <button
              onClick={() => {
                soundFX.playPop();
                onCancelApply();
              }}
              className="w-full py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm active:scale-98 transition shadow-sm"
            >
              Başvuruyu İptal Et
            </button>
          ) : (
            <button
              onClick={() => {
                soundFX.playSuccess();
                onApply();
              }}
              className="w-full py-3.5 rounded-full bg-[#00c3ff] hover:bg-[#00b4eb] text-white font-black text-sm active:scale-98 transition shadow-[0_4px_20px_rgba(0,195,255,0.4)] flex items-center justify-center gap-2"
            >
              <span>Mikrofon kullanımı için başvur</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { User } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import { CHARM_TIERS, getCharmInfo, CharmBadge } from '../../utils/charmLevel';
import { calculateLevelInfo } from '../../utils/levelSystem';
import { ArrowLeft, ChevronRight, Gift, Gamepad2, FileText, Sparkles } from 'lucide-react';

interface Props {
  currentUser: User;
  initialTab?: 'charm' | 'activity';
  onClose: () => void;
  onOpenCheckIn?: () => void;
  onOpenLobby?: () => void;
  onOpenLeaderboard?: () => void;
}

export const CharmAndLevelModal: React.FC<Props> = ({
  currentUser,
  initialTab = 'charm',
  onClose,
  onOpenCheckIn,
  onOpenLobby,
  onOpenLeaderboard,
}) => {
  const [activeTab, setActiveTab] = useState<'charm' | 'activity'>(initialTab);

  const charmValue = currentUser.charm ?? 7668;
  const charmInfo = getCharmInfo(charmValue);

  const levelInfo = calculateLevelInfo(currentUser.totalExp ?? currentUser.exp ?? 0, charmValue);
  const currentLevel = currentUser.level || levelInfo.level || 1;
  const expValue = currentUser.exp ?? levelInfo.currentExp;
  const maxExpValue = currentUser.maxExp ?? levelInfo.maxExp;
  const neededExp = levelInfo.neededExp;

  return (
    <div className="fixed inset-0 z-50 bg-[#fafafa] flex flex-col font-sans select-none overflow-hidden animate-in slide-in-from-right duration-200">
      {/* ═══ TOP DYNAMIC GRADIENT HEADER ═══ */}
      <div
        className={`w-full transition-colors duration-300 ${
          activeTab === 'charm'
            ? 'bg-gradient-to-b from-[#8b5cf6] via-[#7c3aed] to-[#6d28d9]'
            : 'bg-gradient-to-b from-[#f97316] via-[#ea580c] to-[#c2410c]'
        } text-white pt-2 pb-6 px-4 flex-shrink-0 relative shadow-md`}
      >
        {/* Status bar spacer + Top Nav Bar */}
        <div className="flex items-center justify-between h-12">
          {/* Back button */}
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="p-1 -ml-1 text-white hover:text-white/80 active:scale-90 transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Two Tabs */}
          <div className="flex items-center gap-6 text-sm font-bold">
            <button
              onClick={() => {
                soundFX.playPop();
                setActiveTab('charm');
              }}
              className={`relative py-2 transition-all ${
                activeTab === 'charm' ? 'text-white font-extrabold text-base' : 'text-white/70 hover:text-white'
              }`}
            >
              Cazibe Seviyeleri
              {activeTab === 'charm' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-sm animate-in fade-in" />
              )}
            </button>

            <button
              onClick={() => {
                soundFX.playPop();
                setActiveTab('activity');
              }}
              className={`relative py-2 transition-all ${
                activeTab === 'activity' ? 'text-white font-extrabold text-base' : 'text-white/70 hover:text-white'
              }`}
            >
              Aktiflik Seviyesi
              {activeTab === 'activity' && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-sm animate-in fade-in" />
              )}
            </button>
          </div>

          <div className="w-6" /> {/* spacer for alignment */}
        </div>

        {/* ═══ TOP FLOATING PROFILE CARD ═══ */}
        <div className="mt-4 bg-white rounded-3xl p-4 shadow-xl text-gray-900 border border-black/5">
          <div className="flex items-center gap-3.5">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-md bg-slate-900 flex-shrink-0 relative">
              <AvatarRenderer config={currentUser.avatarConfig} className="w-full h-full" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-base text-gray-900 truncate tracking-tight">
                  {currentUser.username}
                </span>
                <span className="text-amber-500">👑</span>
                {activeTab === 'charm' && (
                  <div className="inline-flex items-center">
                    <CharmBadge level={charmInfo.level || 2} size="md" />
                  </div>
                )}
              </div>

              {activeTab === 'charm' ? (
                <div className="text-xs text-gray-500 font-semibold mt-0.5">
                  Cazibe Değeri:{' '}
                  <span className="text-gray-700 font-bold">{charmValue.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black tracking-wide">
                    LV {currentLevel}
                  </span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[140px]">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (expValue / maxExpValue) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {expValue}/{maxExpValue}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Requirement Pill */}
          <div
            className={`mt-3 py-1.5 px-3 rounded-full text-center text-[11px] font-semibold flex items-center justify-center gap-1 ${
              activeTab === 'charm'
                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                : 'bg-orange-50 text-orange-700 border border-orange-100'
            }`}
          >
            {activeTab === 'charm' ? (
              <span>
                Cazibe değerini <CharmBadge level={(charmInfo.level || 2) + 1} size="xs" /> yapmak için{' '}
                <strong className="font-bold">{charmInfo.neededForNext.toLocaleString()}</strong> gerekiyor
              </span>
            ) : (
              <span>
                Seviye <strong className="font-bold">LV {currentLevel + 1}</strong> yapmak için{' '}
                <strong className="font-bold">{neededExp} EXP</strong> gerekiyor
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT BODY ═══ */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6 pb-20">
        {activeTab === 'charm' ? (
          <>
            {/* Cazibe Seviyeleri Açıklama */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2">Cazibe Seviyeleri</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Cazibe Değeri bir oyuncunun popülaritesini temsil eder. Oyunda iyi performans gösteren oyuncular övgü ve hediyeler alabilir, böylece Cazibe Değeri artar.
              </p>
              <p className="text-xs text-gray-500 leading-relaxed font-normal mt-2">
                Belirli bir Cazibe Değeri'ne ulaştıktan sonra ilgili Kimlik İşareti kazanılır. Odada konuşurken, oyuncunun popülaritesini göstermek için adının yanında bir Cazibe işareti bulunur.
              </p>

              {/* Badge Preview Row (WePlay Screenshot 1) */}
              <div className="mt-3.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between px-4">
                <span className="text-xl">⭐</span>
                <span className="text-xl">💎</span>
                <span className="text-xl">👑</span>
                <span className="text-xl">👑</span>
                <span className="text-xl">👑</span>
                <span className="text-xl">🌟</span>
                <span className="text-xl">🎖️</span>
              </div>
            </div>

            {/* Cazibe nasıl artırılır? */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2.5">Cazibe nasıl artırılır?</h3>
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                  🎁
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900">Ödül Kazan</h4>
                  <p className="text-xs text-gray-500 mt-0.5 font-medium">
                    5 Altınlık hediye=1 Cazibe Değeri
                  </p>
                </div>
              </div>
            </div>

            {/* Cazibe Seviyesi Amblemi Tablosu (Screenshots 1, 2, 3) */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2.5">Cazibe Seviyesi Amblemi</h3>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="flex items-center justify-between px-6 py-3 bg-slate-50/70 border-b border-gray-100 text-xs font-bold text-gray-600">
                  <span>Cazibe Değeri</span>
                  <span>Amblem</span>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-gray-50">
                  {CHARM_TIERS.map((tier) => {
                    const isUnlocked = charmValue >= tier.threshold;
                    return (
                      <div
                        key={tier.level}
                        className={`flex items-center justify-between px-6 py-3.5 text-xs transition ${
                          isUnlocked ? 'bg-purple-50/20' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <span className={`font-mono font-medium ${isUnlocked ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                          {tier.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <CharmBadge level={tier.level} size="md" />
                          {isUnlocked && (
                            <span className="text-[10px] font-bold text-purple-600 ml-1">✓</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ═══ AKTİFLİK SEVİYESİ SEKMESİ (Screenshot 4) ═══ */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2">Aktiflik Seviyesi</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Aktiflik seviyesi oyuncunun WePlay üzerindeki aktifliğinin göstergesidir. Oyuncular, görevler yaparak ve oyunlar oynayarak EXP kazanarak seviyelerini yükseltebilirler. Seviye, kişisel ana sayfada gösterilir. Kimin en iyi oyuncu olduğunu hemen kontrol edin!
              </p>
            </div>

            {/* Aktiflik nasıl artırılır? */}
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-2.5">Aktiflik nasıl artırılır?</h3>
              <div className="space-y-3">
                {/* Görev Yap */}
                <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      📋
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Görev Yap</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Günlük Görevleri ve Büyüme Görevlerini tamamla
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundFX.playPop();
                      onClose();
                      if (onOpenCheckIn) onOpenCheckIn();
                    }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-200 active:scale-95 transition flex-shrink-0"
                  >
                    Git
                  </button>
                </div>

                {/* Masa Oyunları Oyna */}
                <div className="p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                      🎮
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">Masa Oyunları Oyna</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Çizim Senden-Tahmin Benden, Vampir-Köylü, Köstebek Kim oyna
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      soundFX.playPop();
                      onClose();
                      if (onOpenLobby) onOpenLobby();
                    }}
                    className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-md shadow-orange-200 active:scale-95 transition flex-shrink-0"
                  >
                    Oyna
                  </button>
                </div>
              </div>
            </div>

            {/* Oyun Seviyeleri */}
            <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-extrabold text-gray-900">Oyun Seviyeleri</h3>
                <button
                  onClick={() => {
                    soundFX.playPop();
                    onClose();
                    if (onOpenLeaderboard) onOpenLeaderboard();
                  }}
                  className="text-xs text-orange-600 font-bold flex items-center gap-0.5 hover:underline"
                >
                  Sonuçları İncele <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-normal">
                Uzay Vampir Köylü Oyunu gibi diğer oyunların da seviyeleri vardır. Sevdiğiniz oyunlarda ustalaşın! Oyun ya da savaş başarılarından kontrol edebilirsiniz.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

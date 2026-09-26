import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { X, ArrowLeft, Clock, Crown, ChevronRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RedPacketModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onSendRedPacket: (totalGold: number, count: number, message: string, countdownSeconds: number, isServerWide?: boolean) => void;
  onClose: () => void;
}

export const RedPacketModal: React.FC<RedPacketModalProps> = ({
  currentUser,
  onUpdateUser,
  onSendRedPacket,
  onClose,
}) => {
  // Tabs: 'normal' = Normal kırmızı zarf | 'message' = İletili Kırmızı Zarf
  const [activeTab, setActiveTab] = useState<'normal' | 'message'>('normal');

  // Selected Amount: 600, 1800, 3000, 10000, 50000
  const [selectedGold, setSelectedGold] = useState<number>(10000);
  const [isCustomGold, setIsCustomGold] = useState<boolean>(false);
  const [customGoldInput, setCustomGoldInput] = useState<string>('20000');

  // Options matching screenshot
  const [selectedSkin, setSelectedSkin] = useState<string>('Varsayılan');
  const [showSkinPicker, setShowSkinPicker] = useState<boolean>(false);

  const [countdownSeconds, setCountdownSeconds] = useState<number>(60); // Screenshot default: 60 saniye
  const [showCountdownPicker, setShowCountdownPicker] = useState<boolean>(false);

  const [serverWideComment, setServerWideComment] = useState<boolean>(true); // Screenshot: switch turned ON
  const [commentMessage, setCommentMessage] = useState<string>('Bol şanslar herkese! 🧧✨');

  const [backpackNotice, setBackpackNotice] = useState<string | null>(null);

  // Price mapping matching ShopModal & reference screenshot (10000 -> ₺699.99)
  const PRESET_AMOUNTS = [
    { gold: 600, label: '600 altın para', priceTl: '₺ 49.99' },
    { gold: 1800, label: '1800 altın para', priceTl: '₺ 149.99' },
    { gold: 3000, label: '3000 altın para', priceTl: '₺ 249.99' },
    { gold: 10000, label: '10000 altın para', priceTl: '₺ 699.99', isHavadis: true },
    { gold: 50000, label: '50000 altın para', priceTl: '₺ 3099.99', isHavadis: true },
  ];

  const SKINS = ['Varsayılan', 'VIP Altın Kaplama', 'Ejderha Yılı', 'Şans Yıldızı'];

  const COUNTDOWN_PRESETS = [
    { label: 'Hemen (0s) ⚡', seconds: 0 },
    { label: '5 saniye ⚡', seconds: 5 },
    { label: '15 saniye', seconds: 15 },
    { label: '30 saniye', seconds: 30 },
    { label: '60 saniye', seconds: 60 },
    { label: '120 saniye', seconds: 120 },
  ];

  const effectiveGold = isCustomGold ? (parseInt(customGoldInput, 10) || 0) : selectedGold;
  const currentPreset = PRESET_AMOUNTS.find(p => p.gold === effectiveGold);
  const currentPriceTl = currentPreset ? currentPreset.priceTl : `₺ ${((effectiveGold / 10000) * 699.99).toFixed(2)}`;

  const handleSelectAmount = (gold: number) => {
    soundFX.playPop();
    setIsCustomGold(false);
    setSelectedGold(gold);
    if (gold >= 10000) {
      setServerWideComment(true);
    }
  };

  const handleSend = () => {
    if (effectiveGold <= 0) {
      alert('Lütfen geçerli bir altın tutarı seçin!');
      return;
    }

    // Check if user has sufficient gold
    if (currentUser.coins < effectiveGold) {
      soundFX.playPop();
      const needGold = effectiveGold - currentUser.coins;
      const confirmBuy = window.confirm(
        `Altın bakiyeniz yetersiz!\n\nGereken: ${effectiveGold.toLocaleString('tr-TR')} 🪙\nMevcut: ${currentUser.coins.toLocaleString('tr-TR')} 🪙\nEksik: ${needGold.toLocaleString('tr-TR')} 🪙\n\n${currentPriceTl} karşılığında altın yükleyip kırmızı zarfı göndermek ister misiniz?`
      );

      if (confirmBuy) {
        // Instant top-up & send
        soundFX.playGiftFanfare();
        confetti({
          particleCount: 130,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#ff6600', '#ef4444', '#fbbf24', '#ffffff'],
        });

        // Calculate packet recipient count based on amount
        const count = effectiveGold >= 50000 ? 50 : effectiveGold >= 10000 ? 30 : effectiveGold >= 3000 ? 20 : 12;
        const msg = activeTab === 'message' || serverWideComment ? commentMessage : 'Bol şanslar herkese! 🧧✨';

        onSendRedPacket(effectiveGold, count, msg, countdownSeconds, serverWideComment || effectiveGold >= 10000);
        onClose();
      }
      return;
    }

    soundFX.playGiftFanfare();
    confetti({
      particleCount: 130,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#ff6600', '#ef4444', '#fbbf24', '#ffffff'],
    });

    // Deduct user coins
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - effectiveGold,
    });

    const count = effectiveGold >= 50000 ? 50 : effectiveGold >= 10000 ? 30 : effectiveGold >= 3000 ? 20 : 12;
    const msg = activeTab === 'message' || serverWideComment ? commentMessage : 'Bol şanslar herkese! 🧧✨';

    onSendRedPacket(effectiveGold, count, msg, countdownSeconds, serverWideComment || effectiveGold >= 10000);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#12162a]/98 backdrop-blur-2xl border-t sm:border border-white/10 rounded-t-3xl sm:rounded-3xl max-w-md w-full text-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* ═══ TOP BAR (Screenshot: < Kırmızı zarf gönder) ═══ */}
        <div className="relative px-4 pt-3.5 pb-2 flex items-center justify-between border-b border-white/[0.08] flex-shrink-0">
          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="p-1.5 -ml-1 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition"
            title="Geri"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h2 className="text-base font-bold text-white tracking-wide">
            Kırmızı zarf gönder
          </h2>

          <button
            onClick={() => {
              soundFX.playPop();
              onClose();
            }}
            className="p-1.5 -mr-1 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ═══ TABS (Normal kırmızı zarf | İletili Kırmızı Zarf) ═══ */}
        <div className="flex items-center justify-center gap-8 pt-3 pb-2 border-b border-white/[0.06] bg-black/20 flex-shrink-0">
          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('normal');
            }}
            className={`text-sm font-bold relative pb-2 transition-all ${
              activeTab === 'normal'
                ? 'text-[#ff6600]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Normal kırmızı zarf</span>
            {activeTab === 'normal' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              soundFX.playPop();
              setActiveTab('message');
              setServerWideComment(true);
            }}
            className={`text-sm font-bold relative pb-2 transition-all ${
              activeTab === 'message'
                ? 'text-[#ff6600]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>İletili Kırmızı Zarf</span>
            {activeTab === 'message' && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#ff6600] rounded-full" />
            )}
          </button>
        </div>

        {/* ═══ SCROLLABLE CONTENT BODY ═══ */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 no-scrollbar">
          {/* Section 1: Kırmızı zarf miktarını seçin */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-200">
                Kırmızı zarf miktarını seçin
              </span>
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setIsCustomGold(!isCustomGold);
                }}
                className="text-[11px] text-[#ff6600] hover:underline font-bold"
              >
                {isCustomGold ? '← Sabit Seçenekler' : '+ Özel Miktar'}
              </button>
            </div>

            {!isCustomGold ? (
              <div className="grid grid-cols-3 gap-2.5">
                {/* 1. Sıra: 600, 1800, 3000 */}
                {PRESET_AMOUNTS.slice(0, 3).map(item => {
                  const isSelected = selectedGold === item.gold;
                  return (
                    <button
                      key={item.gold}
                      type="button"
                      onClick={() => handleSelectAmount(item.gold)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center relative ${
                        isSelected
                          ? 'border-[#ff6600] bg-[#ff6600]/15 text-[#ff8833] ring-1 ring-[#ff6600]/50 shadow-md shadow-[#ff6600]/10'
                          : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                {/* 2. Sıra: 10000, 50000 (Screenshot'taki gibi geniş 2 sütun) */}
                {PRESET_AMOUNTS.slice(3, 5).map(item => {
                  const isSelected = selectedGold === item.gold;
                  return (
                    <button
                      key={item.gold}
                      type="button"
                      onClick={() => handleSelectAmount(item.gold)}
                      className={`col-span-1.5 py-3 px-2 rounded-2xl text-xs font-bold border transition-all text-center relative ${
                        isSelected
                          ? 'border-[#ff6600] bg-[#ff6600]/15 text-[#ff8833] ring-1 ring-[#ff6600]/50 shadow-md shadow-[#ff6600]/10'
                          : 'border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-500 text-[8px] font-black text-slate-950 uppercase tracking-tight shadow">
                        HAVADİS 👑
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-white/[0.06] border border-[#ff6600]/70 rounded-2xl px-3.5 py-3">
                <input
                  type="number"
                  min="600"
                  step="500"
                  value={customGoldInput}
                  onChange={e => setCustomGoldInput(e.target.value)}
                  placeholder="Örn: 20000, 100000..."
                  className="bg-transparent text-sm font-black text-amber-300 outline-none w-full placeholder-slate-500"
                />
                <span className="text-xs font-bold text-amber-300 whitespace-nowrap">🪙 Altın Para</span>
              </div>
            )}
          </div>

          {/* Section 2: Seçenek Listesi (Sırt Çantası, Kaplama, Bekleme Süresi) */}
          <div className="space-y-1 divide-y divide-white/[0.06] bg-white/[0.03] rounded-2xl p-2.5 border border-white/[0.06]">
            {/* Sırt çantası */}
            <div
              onClick={() => {
                soundFX.playPop();
                setBackpackNotice('Mevcut tutar için sırt çantasında kırmızı zarf yok.');
                setTimeout(() => setBackpackNotice(null), 3500);
              }}
              className="flex items-center justify-between py-2.5 px-1.5 cursor-pointer hover:bg-white/[0.03] rounded-xl transition"
            >
              <span className="text-xs font-semibold text-slate-200">Sırt çantası</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-400">Mevcut tutar için kırmızı zarf yok</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {backpackNotice && (
              <div className="text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl text-center animate-in fade-in">
                {backpackNotice}
              </div>
            )}

            {/* Kırmızı zarf kaplamasını seçin */}
            <div
              onClick={() => {
                soundFX.playPop();
                setShowSkinPicker(!showSkinPicker);
              }}
              className="flex items-center justify-between py-2.5 px-1.5 cursor-pointer hover:bg-white/[0.03] rounded-xl transition"
            >
              <span className="text-xs font-semibold text-slate-200">Kırmızı zarf kaplamasını seçin</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-300 font-medium">{selectedSkin}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Kaplama Seçici Açılır Liste */}
            {showSkinPicker && (
              <div className="grid grid-cols-2 gap-2 py-2 px-1">
                {SKINS.map(skin => (
                  <button
                    key={skin}
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setSelectedSkin(skin);
                      setShowSkinPicker(false);
                    }}
                    className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold border flex items-center justify-between transition ${
                      selectedSkin === skin
                        ? 'border-[#ff6600] bg-[#ff6600]/20 text-[#ff8833]'
                        : 'border-white/10 bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    <span>{skin}</span>
                    {selectedSkin === skin && <Check className="w-3.5 h-3.5 text-[#ff6600]" />}
                  </button>
                ))}
              </div>
            )}

            {/* Bekleme süresi */}
            <div
              onClick={() => {
                soundFX.playPop();
                setShowCountdownPicker(!showCountdownPicker);
              }}
              className="flex items-center justify-between py-2.5 px-1.5 cursor-pointer hover:bg-white/[0.03] rounded-xl transition"
            >
              <span className="text-xs font-semibold text-slate-200">Bekleme süresi</span>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-300 font-medium">
                  {countdownSeconds > 0 ? `${countdownSeconds} saniye` : 'Hemen (0s)'}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Bekleme Süresi Seçici */}
            {showCountdownPicker && (
              <div className="grid grid-cols-3 gap-1.5 py-2 px-1">
                {COUNTDOWN_PRESETS.map(item => (
                  <button
                    key={item.seconds}
                    type="button"
                    onClick={() => {
                      soundFX.playPop();
                      setCountdownSeconds(item.seconds);
                      setShowCountdownPicker(false);
                    }}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition ${
                      countdownSeconds === item.seconds
                        ? 'border-[#ff6600] bg-[#ff6600]/20 text-[#ff8833]'
                        : 'border-white/10 bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            {/* Sunucu genelinde yorum (Switch Toggle) */}
            <div className="py-2.5 px-1.5 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Sunucu genelinde yorum
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Sunucudaki tüm oyuncular yorumu görebilir ve kırmızı zarfları almak için odaya girebilir
                </p>
              </div>

              {/* iOS Tarzı Modern Toggle Switch */}
              <button
                type="button"
                onClick={() => {
                  soundFX.playPop();
                  setServerWideComment(!serverWideComment);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                  serverWideComment ? 'bg-[#00c0f0]' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                    serverWideComment ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* İletili Kırmızı Zarf veya Sunucu Yorumu Açıkken Metin Kutusu */}
          {(activeTab === 'message' || serverWideComment) && (
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-300">Zarf ve Sunucu Yorumu:</span>
              <input
                type="text"
                value={commentMessage}
                onChange={e => setCommentMessage(e.target.value)}
                placeholder="Örn: Bol şanslar herkese! 🧧✨"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white/[0.06] border border-white/10 focus:border-[#ff6600] text-xs text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          )}

          {/* Price Tag (Screenshot: ₺ 699.99 right-aligned) */}
          <div className="pt-2 flex items-baseline justify-between border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Hesap Bakiyesi:</span>
              <span className="text-amber-300 font-bold">
                {currentUser.coins.toLocaleString('tr-TR')} 🪙
              </span>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-white tracking-tight">
                {currentPriceTl}
              </span>
            </div>
          </div>

          {/* Main Action Button (Screenshot: Kırmızı zarf gönder) */}
          <button
            onClick={handleSend}
            className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#ff5e00] to-[#ff7700] hover:from-[#e85500] hover:to-[#f06e00] active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-[#ff5e00]/25 transition flex items-center justify-center gap-2"
          >
            <span>Kırmızı zarf gönder</span>
          </button>

          {/* Disclaimer Text at Bottom (Screenshot Legal Text) */}
          <p className="text-[9.5px] text-slate-400/90 leading-relaxed text-left pb-1 border-t border-white/[0.04] pt-2">
            Lütfen ilgili yasa ve yönetmeliklere uygun, kırmızı zarf işlevini makul şekilde kullanın ve aşırı harcamadan kaçının.
            <br />
            Altın yalnızca eğlence ve etkileşim amaçlıdır; gerçek bir maddi değeri yoktur. Lütfen yükleme ve harcamalarınızı bilinçli yapın, oyun süreniz ile günlük yaşamınız arasında denge kurun. Sağlıklı ve güvenli bir oyun ortamını birlikte koruyalım.
          </p>
        </div>
      </div>
    </div>
  );
};

// Safe Grab Red Packet Floating Action
interface GrabRedPacketProps {
  packet: {
    id: string;
    senderName: string;
    totalGold: number;
    remainingGold: number;
    count: number;
    claimedUsers?: string[];
    message: string;
    unlockAt?: number;
  };
  currentUserId: string;
  onGrab: () => void;
  onClose: () => void;
}

export const GrabRedPacketPopup: React.FC<GrabRedPacketProps> = ({
  packet,
  currentUserId,
  onGrab,
  onClose,
}) => {
  const [grabbedReward, setGrabbedReward] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (packet.unlockAt && packet.unlockAt > Date.now()) {
      return Math.max(0, Math.ceil((packet.unlockAt - Date.now()) / 1000));
    }
    return 0;
  });

  const claimedList = Array.isArray(packet.claimedUsers) ? packet.claimedUsers : [];
  const alreadyClaimed = claimedList.includes(currentUserId);
  const isLocked = secondsRemaining > 0;

  React.useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const handleOpen = () => {
    if (isLocked) return;
    soundFX.playGiftFanfare();
    confetti({ particleCount: 80, spread: 60, colors: ['#ff6600', '#ef4444', '#ffffff'] });
    const reward = Math.max(10, Math.floor(packet.totalGold / Math.max(1, packet.count)) + Math.floor(Math.random() * 20));
    setGrabbedReward(reward);
    onGrab();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-72 bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#1c0404] rounded-3xl p-6 text-white text-center shadow-2xl border-2 border-amber-400 animate-in zoom-in duration-300 flex flex-col items-center">
        <button onClick={onClose} className="absolute top-3 right-3 text-red-200 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        {/* Upright User Image Icon */}
        <div className="w-20 h-28 my-1 flex items-center justify-center">
          <img
            src="/assets/red_packet_luvia.png"
            alt="Kırmızı Zarf"
            className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] animate-bounce"
          />
        </div>

        <h3 className="text-sm font-black text-amber-300 mt-2">{packet.senderName}</h3>
        <p className="text-xs text-red-100 font-medium italic mt-1">"{packet.message}"</p>

        {grabbedReward !== null ? (
          <div className="my-5 p-4 rounded-2xl bg-white/10 border border-white/20 w-full animate-in zoom-in-75">
            <span className="text-[11px] text-amber-300 block font-bold">KAZANDIN!</span>
            <span className="text-2xl font-black text-amber-400">+{grabbedReward} Altın 🪙</span>
          </div>
        ) : (
          <div className="my-5 flex flex-col items-center">
            {alreadyClaimed ? (
              <span className="text-xs text-amber-200 font-bold bg-black/30 px-3 py-1.5 rounded-full border border-white/10">
                Zarfı zaten aldınız!
              </span>
            ) : isLocked ? (
              <div className="flex flex-col items-center gap-1.5 bg-black/40 border border-amber-400/50 px-4 py-2.5 rounded-2xl">
                <div className="flex items-center gap-1.5 text-amber-300 font-mono font-black text-lg">
                  <Clock className="w-4 h-4 animate-spin text-amber-400" />
                  <span>00:{secondsRemaining.toString().padStart(2, '0')}</span>
                </div>
                <span className="text-[10px] text-amber-200 font-semibold">
                  Açılması için süre bekleniyor...
                </span>
              </div>
            ) : (
              <button
                onClick={handleOpen}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 text-amber-950 font-black text-base shadow-xl border-2 border-white hover:scale-105 active:scale-95 transition flex items-center justify-center animate-pulse"
              >
                AÇ
              </button>
            )}
          </div>
        )}

        <span className="text-[10px] text-red-300">
          Kalan: {Math.max(0, packet.count - claimedList.length)} / {packet.count} Zarf
        </span>
      </div>
    </div>
  );
};

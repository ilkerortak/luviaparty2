import React, { useState } from 'react';
import { soundFX } from '../../utils/soundEffects';
import { X, Sparkles, Flame, Heart, Smile } from 'lucide-react';

export interface StickerItem {
  id: string;
  name: string;
  category: 'party' | 'love' | 'reaction' | 'vip';
  emoji: string;
  animationClass: string;
  soundType: 'applause' | 'horn' | 'success' | 'alarm' | 'car' | 'pop';
  tag: string;
}

export const STICKER_PACK: StickerItem[] = [
  { id: 'dance_rabbit', name: 'Dans Eden Tavşan', category: 'party', emoji: '🐰💃', animationClass: 'animate-bounce', soundType: 'applause', tag: 'Kutlama' },
  { id: 'howling_wolf', name: 'Uluyan Alfa Kurt', category: 'party', emoji: '🐺🌕', animationClass: 'animate-pulse', soundType: 'alarm', tag: 'Kurtadam' },
  { id: 'love_fox', name: 'Kalp Gözlü Tilki', category: 'love', emoji: '🦊💖', animationClass: 'animate-pulse', soundType: 'success', tag: 'Aşk' },
  { id: 'rose_bouquet', name: '999 Gül Buketi', category: 'love', emoji: '💐🌹', animationClass: 'animate-bounce', soundType: 'success', tag: 'CP Özel' },
  { id: 'laughing_cat', name: 'Kahkaha Kedisi', category: 'reaction', emoji: '😹✨', animationClass: 'animate-spin', soundType: 'pop', tag: 'Hahaha' },
  { id: 'rage_thunder', name: 'Şimşek Öfkesi', category: 'reaction', emoji: '⚡😡', animationClass: 'animate-pulse', soundType: 'horn', tag: 'Kızdım' },
  { id: 'king_mvp', name: 'Taçlı Kral MVP', category: 'vip', emoji: '👑😎', animationClass: 'animate-bounce', soundType: 'applause', tag: 'MVP' },
  { id: 'flame_dragon', name: 'Alev Ejderi', category: 'vip', emoji: '🐉🔥', animationClass: 'animate-pulse', soundType: 'car', tag: 'Efsane' },
  { id: 'diamond_rich', name: 'Elmas Zengini', category: 'vip', emoji: '💎🤑', animationClass: 'animate-bounce', soundType: 'success', tag: 'Zengin' },
  { id: 'cry_bear', name: 'Ağlayan Ayı', category: 'reaction', emoji: '🐻😭', animationClass: 'animate-pulse', soundType: 'pop', tag: 'Üzgün' },
  { id: 'party_popper', name: 'Konfeti Şöleni', category: 'party', emoji: '🎉🥳', animationClass: 'animate-bounce', soundType: 'applause', tag: 'Parti' },
  { id: 'mic_star', name: 'Mikrofon Yıldızı', category: 'party', emoji: '🎤⭐', animationClass: 'animate-pulse', soundType: 'success', tag: 'Şarkıcı' },
];

interface StickerPickerProps {
  onSelectSticker: (sticker: StickerItem) => void;
  onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({
  onSelectSticker,
  onClose,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'party' | 'love' | 'reaction' | 'vip'>('all');

  const filteredStickers = activeCategory === 'all'
    ? STICKER_PACK
    : STICKER_PACK.filter(s => s.category === activeCategory);

  const handlePick = (sticker: StickerItem) => {
    // Play associated sound
    if (sticker.soundType === 'applause') soundFX.playApplause();
    else if (sticker.soundType === 'horn') soundFX.playHorn();
    else if (sticker.soundType === 'success') soundFX.playSuccess();
    else if (sticker.soundType === 'alarm') soundFX.playAlarm();
    else if (sticker.soundType === 'car') soundFX.playCarRev();
    else soundFX.playPop();

    onSelectSticker(sticker);
    onClose();
  };

  return (
    <div className="absolute bottom-16 right-2 left-2 z-50 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-3xl p-3 shadow-2xl flex flex-col space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-1.5">
          <Smile className="w-4 h-4 text-pink-400" />
          <span className="text-xs font-black text-white">WePlay Animasyonlu Çıkartmalar</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex space-x-1 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'Tümü' },
          { id: 'party', label: '🎉 Parti' },
          { id: 'love', label: '💖 Aşk & CP' },
          { id: 'reaction', label: '🔥 Tepki' },
          { id: 'vip', label: '👑 VIP' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-2.5 py-1 rounded-full text-[10px] font-black transition whitespace-nowrap ${
              activeCategory === cat.id
                ? 'bg-pink-600 text-white shadow'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stickers Grid */}
      <div className="grid grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
        {filteredStickers.map(sticker => (
          <button
            key={sticker.id}
            onClick={() => handlePick(sticker)}
            className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-pink-500/50 transition transform active:scale-90 group"
          >
            <span className={`text-2xl mb-1 group-hover:scale-125 transition ${sticker.animationClass}`}>
              {sticker.emoji}
            </span>
            <span className="text-[9px] font-black text-slate-300 truncate w-full text-center">
              {sticker.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

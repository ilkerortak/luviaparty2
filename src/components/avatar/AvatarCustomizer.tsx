import React, { useState } from 'react';
import type { AvatarConfig } from '../../types';
import { AvatarRenderer } from './AvatarRenderer';
import { Sparkles, Shuffle, Check, Palette, Smile, Shirt, Crown, User as UserIcon, Camera, Image as ImageIcon, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AvatarCustomizerProps {
  initialConfig: AvatarConfig;
  onSave: (config: AvatarConfig) => void;
  onClose?: () => void;
}

const SKIN_COLORS = ['#FFDCB1', '#E8B688', '#C68642', '#8D5524', '#FEE3D4', '#E0A899'];
const HAIR_COLORS = ['#1e1b4b', '#3b2219', '#d97706', '#ec4899', '#3b82f6', '#10b981', '#f8fafc', '#a855f7'];
const OUTFIT_COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#1f2937', '#8b5cf6'];

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({
  initialConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<'photo' | 'hair' | 'face' | 'outfit' | 'skin' | 'accessories' | 'frame'>('photo');
  const [isDancing, setIsDancing] = useState(false);

  const randomize = () => {
    const hairStyles: AvatarConfig['hairStyle'][] = ['kpop', 'messy', 'curly', 'ponytail', 'short', 'anime'];
    const eyeStyles: AvatarConfig['eyeStyle'][] = ['sparkle', 'cool', 'wink', 'cute', 'determined'];
    const mouthStyles: AvatarConfig['mouthStyle'][] = ['smile', 'laugh', 'smirk', 'neutral', 'bubblegum'];
    const outfits: AvatarConfig['outfit'][] = ['hoodie', 'streetwear', 'cyberpunk', 'suit', 'party_dress', 'space_suit'];
    const accessories: AvatarConfig['accessory'][] = ['none', 'cat_ears', 'gaming_headset', 'glasses', 'angel_wings', 'crown'];
    const frames: AvatarConfig['frame'][] = ['none', 'gold_vip', 'neon_fire', 'sakura', 'cyber_glow'];

    setConfig({
      skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyeStyle: eyeStyles[Math.floor(Math.random() * eyeStyles.length)],
      mouthStyle: mouthStyles[Math.floor(Math.random() * mouthStyles.length)],
      outfit: outfits[Math.floor(Math.random() * outfits.length)],
      outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
      accessory: accessories[Math.floor(Math.random() * accessories.length)],
      frame: frames[Math.floor(Math.random() * frames.length)],
    });
  };

  const handleSave = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
    onSave(config);
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] pb-3 border-b border-white/[0.08] bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '3s' }} />
          <h2 className="font-black text-lg bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Avatar Stüdyosu
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={randomize}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Rastgele</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-xs font-black text-white shadow-lg shadow-pink-500/30 transition transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>
      </div>

      {/* Avatar Stage / Podium */}
      <div className="relative flex flex-col items-center justify-center py-6 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950">
        {/* Spotlight effect */}
        <div className="absolute top-0 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div
          onClick={() => setIsDancing(!isDancing)}
          className={`relative z-10 transition-transform ${isDancing ? 'animate-bounce' : ''}`}
        >
          <AvatarRenderer config={config} size="2xl" />
        </div>

        {/* Podium base */}
        <div className="w-44 h-4 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/40 to-purple-500/20 shadow-[0_0_20px_rgba(236,72,153,0.3)] mt-2" />
        <span className="text-[11px] text-slate-400 mt-1 font-medium">Avatara dokunarak dans ettir 💃</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/50 px-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'photo', label: 'Fotoğraf & Logo', icon: Camera },
          { id: 'hair', label: 'Saç', icon: Sparkles },
          { id: 'face', label: 'Yüz', icon: Smile },
          { id: 'outfit', label: 'Kıyafet', icon: Shirt },
          { id: 'skin', label: 'Ten', icon: UserIcon },
          { id: 'accessories', label: 'Aksesuar', icon: Crown },
          { id: 'frame', label: 'Çerçeve', icon: Palette },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition ${
                isActive
                  ? 'border-pink-500 text-pink-400 bg-pink-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Customization Options Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-900">
        {/* Photo & Logo Tab */}
        {activeTab === 'photo' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-1">
                Profil Resmi / Logo
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Kendi galerinizden fotoğraf yükleyin veya varsayılan resmi kullanın.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Upload Button */}
                <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-pink-500/50 bg-pink-500/10 hover:bg-pink-500/20 cursor-pointer transition active:scale-95 text-center group">
                  <Camera className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform mb-2" />
                  <span className="text-xs font-bold text-white">Fotoğraf Yükle</span>
                  <span className="text-[10px] text-pink-300/80 mt-0.5">Galeriden Seç</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        alert('Fotoğraf boyutu en fazla 5MB olabilir.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setConfig({ ...config, customPhotoUrl: reader.result as string });
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>

                {/* Default Luvia Avatar Button */}
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, customPhotoUrl: '/luvia-avatar.png' })}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition active:scale-95 text-center ${
                    config.customPhotoUrl === '/luvia-avatar.png' || config.customPhotoUrl === '/luvia-logo.png'
                      ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden mb-2 shadow-sm border border-pink-400/40 flex items-center justify-center">
                    <img src="/luvia-avatar.png" alt="Luvia" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-bold">Luvia Avatarı</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Varsayılan Profil</span>
                </button>
              </div>

              {/* Reset to 3D Avatar */}
              {config.customPhotoUrl && (
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, customPhotoUrl: undefined })}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>3D Çizim Avatara Geri Dön</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hair Tab */}
        {activeTab === 'hair' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Saç Modeli</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'kpop', name: 'K-Pop Fön' },
                  { id: 'messy', name: 'Dağınık' },
                  { id: 'curly', name: 'Kıvırcık' },
                  { id: 'ponytail', name: 'At Kuyruğu' },
                  { id: 'short', name: 'Klasik Kısa' },
                  { id: 'anime', name: 'Anime Diken' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, hairStyle: item.id as any })}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition text-center ${
                      config.hairStyle === item.id
                        ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Saç Rengi</label>
              <div className="flex space-x-3 overflow-x-auto py-1">
                {HAIR_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, hairColor: color })}
                    className={`w-9 h-9 rounded-full border-2 transition transform active:scale-95 ${
                      config.hairColor === color ? 'border-white ring-2 ring-pink-500 scale-110 shadow-lg' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Face Tab */}
        {activeTab === 'face' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Göz İfadesi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sparkle', name: 'Işıltılı ✨' },
                  { id: 'cool', name: 'Havalı Gözlük 😎' },
                  { id: 'wink', name: 'Göz Kırpan 😉' },
                  { id: 'cute', name: 'Sevimli / Masum 🥺' },
                  { id: 'determined', name: 'Odaklanmış 😼' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, eyeStyle: item.id as any })}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                      config.eyeStyle === item.id
                        ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Ağız İfadesi</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'smile', name: 'Gülümseme 🙂' },
                  { id: 'laugh', name: 'Kahkaha 😄' },
                  { id: 'smirk', name: 'Hınzır 😏' },
                  { id: 'neutral', name: 'Ciddi 😐' },
                  { id: 'bubblegum', name: 'Sakız Şişiren 🍬' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, mouthStyle: item.id as any })}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                      config.mouthStyle === item.id
                        ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Outfit Tab */}
        {activeTab === 'outfit' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Kıyafet Tarzı</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'hoodie', name: 'Kapüşonlu Sweat' },
                  { id: 'streetwear', name: 'Sokak Modası WP' },
                  { id: 'cyberpunk', name: 'Siberpunk Neon' },
                  { id: 'suit', name: 'Smokin / Takım' },
                  { id: 'party_dress', name: 'Parti Elbisesi' },
                  { id: 'space_suit', name: 'Uzay Tulumu 🚀' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setConfig({ ...config, outfit: item.id as any })}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                      config.outfit === item.id
                        ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                        : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Kıyafet Rengi</label>
              <div className="flex space-x-3 overflow-x-auto py-1">
                {OUTFIT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, outfitColor: color })}
                    className={`w-9 h-9 rounded-full border-2 transition transform active:scale-95 ${
                      config.outfitColor === color ? 'border-white ring-2 ring-pink-500 scale-110 shadow-lg' : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Skin Tab */}
        {activeTab === 'skin' && (
          <div>
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Ten Rengi</label>
            <div className="grid grid-cols-3 gap-3">
              {SKIN_COLORS.map((color, idx) => (
                <button
                  key={color}
                  onClick={() => setConfig({ ...config, skinColor: color })}
                  className={`flex items-center space-x-3 p-3 rounded-xl border transition ${
                    config.skinColor === color ? 'border-pink-500 bg-pink-500/20' : 'border-slate-800 bg-slate-800/60'
                  }`}
                >
                  <span className="w-7 h-7 rounded-full shadow border border-white/20" style={{ backgroundColor: color }} />
                  <span className="text-xs font-bold text-slate-300">Ton {idx + 1}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Accessories Tab */}
        {activeTab === 'accessories' && (
          <div>
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Aksesuar & Başlık</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'none', name: 'Yok', icon: '❌' },
                { id: 'cat_ears', name: 'Kedi Kulakları 🐱', icon: '🐾' },
                { id: 'gaming_headset', name: 'Oyuncu Kulaklığı 🎧', icon: '🎙️' },
                { id: 'glasses', name: 'Yuvarlak Gözlük 👓', icon: '✨' },
                { id: 'angel_wings', name: 'Melek Kanatları 🪽', icon: '🤍' },
                { id: 'crown', name: 'Kraliyet Tacı 👑', icon: '⭐' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setConfig({ ...config, accessory: item.id as any })}
                  className={`flex items-center space-x-2 p-3 rounded-xl border transition ${
                    config.accessory === item.id
                      ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-bold">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Frame Tab */}
        {activeTab === 'frame' && (
          <div>
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider block mb-2">Avatar Çerçevesi</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'none', name: 'Standart', desc: 'Düz çerçeve' },
                { id: 'gold_vip', name: '👑 Altın VIP', desc: 'Işıltılı altın halka' },
                { id: 'neon_fire', name: '🔥 Neon Ateş', desc: 'Pembe ateş efekti' },
                { id: 'sakura', name: '🌸 Sakura Baharı', desc: 'Kiraz çiçeği aurası' },
                { id: 'cyber_glow', name: '⚡ Siber Parıltı', desc: 'Mavi neon güç dalgası' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setConfig({ ...config, frame: item.id as any })}
                  className={`flex flex-col text-left p-3 rounded-xl border transition ${
                    config.frame === item.id
                      ? 'border-pink-500 bg-pink-500/20 text-white shadow-lg'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold text-white mb-0.5">{item.name}</span>
                  <span className="text-[10px] text-slate-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

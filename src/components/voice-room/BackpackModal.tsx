import React, { useState } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import { X, Backpack, Sparkles, Check, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BackpackModalProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onClose: () => void;
}

interface InventoryItem {
  id: string;
  name: string;
  type: 'frame' | 'gift' | 'badge' | 'card';
  icon: string;
  count: number;
  description: string;
}

export const BackpackModal: React.FC<BackpackModalProps> = ({
  currentUser,
  onUpdateUser,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'gifts' | 'frames'>('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Mock sample inventory items collected from tasks/events
  const [items, setItems] = useState<InventoryItem[]>([
    { id: 'bp-1', name: 'Gül Paketi', type: 'gift', icon: '🌹', count: 12, description: 'Sesli odalarda arkadaşına hediye et.' },
    { id: 'bp-2', name: 'Alev Ejderi Bileti', type: 'gift', icon: '🐉', count: 1, description: '1 adet ücretsiz efsanevi Alev Ejderi fırlat.' },
    { id: 'bp-3', name: 'Sakura Çerçevesi (7 Gün)', type: 'frame', icon: '🌸', count: 1, description: 'Profilinde bahar esintisi estiren çiçekli çerçeve.' },
    { id: 'bp-4', name: 'Altın VIP Çerçevesi', type: 'frame', icon: '👑', count: 1, description: 'Lüks altın VIP ışıltılı çerçeve.' },
    { id: 'bp-5', name: 'Şans Zarı', type: 'card', icon: '🎲', count: 5, description: 'Kızma Birader oyununda +1 ekstra zar hakkı verir.' },
    { id: 'bp-6', name: 'Tatlı Donut', type: 'gift', icon: '🍩', count: 8, description: 'Lezzetli donut hediyesi.' },
  ]);

  const filteredItems = items.filter(i => {
    if (activeTab === 'gifts') return i.type === 'gift';
    if (activeTab === 'frames') return i.type === 'frame';
    return true;
  });

  const handleUseItem = (item: InventoryItem) => {
    soundFX.playSuccess();
    confetti({ particleCount: 60, spread: 50 });

    if (item.type === 'frame') {
      const frameKey = item.name.includes('Sakura') ? 'sakura' : 'gold_vip';
      onUpdateUser({
        ...currentUser,
        avatarConfig: {
          ...currentUser.avatarConfig,
          frame: frameKey as any,
        }
      });
      alert(`🎉 "${item.name}" başarıyla profilinize takıldı!`);
    } else {
      alert(`🎁 "${item.name}" aktif edildi!`);
    }

    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121626] rounded-3xl p-5 border border-amber-500/30 max-w-sm w-full text-white shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            <div>
              <h3 className="text-sm font-black text-amber-300">Sırt Çantası & Envanter</h3>
              <p className="text-[10px] text-slate-400">Etkinliklerden kazandığın tüm eşyalar burada!</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 my-3">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'gifts', label: 'Hediyeler' },
            { id: 'frames', label: 'Çerçeveler' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-amber-950 font-black'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid Items */}
        <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-2.5 p-1 no-scrollbar">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`p-2.5 rounded-2xl border text-center flex flex-col items-center justify-between cursor-pointer transition active:scale-95 ${
                selectedItem?.id === item.id
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-3xl my-1 filter drop-shadow">{item.icon}</span>
              <div className="w-full">
                <div className="text-[10px] font-black truncate text-white">{item.name}</div>
                <span className="text-[9px] text-amber-400 font-bold">x{item.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Item Details */}
        {selectedItem && (
          <div className="mt-3 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex-1 pr-2">
              <span className="text-xs font-black text-amber-300 block">{selectedItem.name}</span>
              <span className="text-[10px] text-slate-400">{selectedItem.description}</span>
            </div>
            <button
              onClick={() => handleUseItem(selectedItem)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-950 text-xs font-black active:scale-95 transition shadow"
            >
              {selectedItem.type === 'frame' ? 'Kullan' : 'Gönder'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

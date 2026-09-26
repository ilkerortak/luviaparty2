import React, { useState, useEffect } from 'react';
import type { User, VoiceRoom } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { Plus, Search, Users, X, Crown, Sparkles, Trash2 } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { subscribeToVoiceRooms, createVoiceRoom, deleteVoiceRoom } from '../../services/onlineService';

interface VoiceRoomsLobbyProps {
  currentUser: User;
  onSelectRoom: (roomId: string) => void;
  onUpdateUser?: (user: User) => void;
}

export const VoiceRoomsLobby: React.FC<VoiceRoomsLobbyProps> = ({
  currentUser,
  onSelectRoom,
  onUpdateUser,
}) => {
  const [rooms, setRooms] = useState<VoiceRoom[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<'benim' | 'oneri' | 'populer'>('oneri');
  const [selectedTag, setSelectedTag] = useState<string>('Bütün');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomTag, setNewRoomTag] = useState('Müzik');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [newRoomType, setNewRoomType] = useState<'free' | 'premium'>('free');

  useEffect(() => {
    const unsub = subscribeToVoiceRooms((remoteRooms) => {
      if (remoteRooms) {
        setRooms(remoteRooms);
      }
    });
    return () => unsub();
  }, []);

  const categoryPills = ['Bütün', 'Arkadaşlar', 'Müzik', 'Video', 'Oyun', 'Sohbet'];

  const tagColors: Record<string, string> = {
    'Arkadaşlar': 'bg-cyan-500 text-white',
    'Müzik': 'bg-purple-500 text-white',
    'Oyun': 'bg-orange-500 text-white',
    'Sohbet': 'bg-emerald-500 text-white',
    'CP / Tanışma': 'bg-pink-500 text-white',
    'Video': 'bg-blue-500 text-white',
  };

  const filteredRooms = rooms.filter(r => {
    if (activeMainTab === 'benim') {
      if (r.host?.id !== currentUser.id) return false;
    }
    const matchesTag = selectedTag === 'Bütün' || r.tag === selectedTag;
    const matchesSearch = r.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.host?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) return;

    if (newRoomType === 'premium') {
      if (currentUser.coins < 2000) {
        soundFX.playPop();
        alert('Kalıcı (Premium) Oda kurabilmek için en az 2.000 Altın gereklidir! Mevcut Altınınız: ' + currentUser.coins);
        return;
      }
      if (onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          coins: currentUser.coins - 2000,
        });
      }
    }

    soundFX.playSuccess();
    
    const roomId = await createVoiceRoom({
      title: newRoomTitle,
      tag: newRoomTag,
      host: currentUser,
      bgTheme: 'neon_night',
      onlineCount: 1,
      roomType: newRoomType,
      isPermanent: newRoomType === 'premium',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
      price: newRoomType === 'premium' ? 2000 : 0,
    } as any);
    
    setShowCreateModal(false);
    setNewRoomTitle('');
    onSelectRoom(roomId);
  };

  const handleDeleteRoom = async (e: React.MouseEvent, roomId: string) => {
    e.stopPropagation();
    soundFX.playPop();
    if (confirm('Bu odayı silmek istediğinize emin misiniz?')) {
      await deleteVoiceRoom(roomId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 select-none overflow-y-auto no-scrollbar pb-16">
      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Yeni Oda Kur</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Oda Türü: Ücretsiz vs Premium (2000 Altın) */}
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1.5 block">Oda Türü</label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setNewRoomType('free')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newRoomType === 'free'
                        ? 'border-cyan-500 bg-cyan-50/60 shadow-sm'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-gray-950">Ücretsiz Oda</span>
                      <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded-full font-bold text-gray-700">0 🪙</span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                      Oda sahibi çıkınca oda otomatik kapanır ve silinir.
                    </p>
                  </div>

                  <div
                    onClick={() => setNewRoomType('premium')}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                      newRoomType === 'premium'
                        ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-black text-amber-950">Kalıcı Oda</span>
                      </div>
                      <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-black">2.000 🪙</span>
                    </div>
                    <p className="text-[10px] text-amber-800/80 mt-1 leading-tight">
                      Sonsuz kalır! Sadece 1 yıl girilmezse silinir.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Oda Adı</label>
                <input 
                  type="text" 
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="Eğlenceli bir oda adı seç..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm outline-none focus:border-cyan-400 transition"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Kategori</label>
                <select 
                  value={newRoomTag}
                  onChange={(e) => setNewRoomTag(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm outline-none focus:border-cyan-400"
                >
                  <option value="Müzik">Müzik</option>
                  <option value="Oyun">Oyun</option>
                  <option value="Sohbet">Sohbet</option>
                  <option value="CP / Tanışma">CP / Tanışma</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-500 font-bold mb-1 block">Şifre (İsteğe Bağlı)</label>
                <input 
                  type="text" 
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  placeholder="Gizli oda için şifre koy..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-800 text-sm outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            
            <button 
              onClick={handleCreateRoom}
              disabled={!newRoomTitle.trim()}
              className={`w-full mt-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition active:scale-98 ${
                newRoomType === 'premium'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-amber-200'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-white shadow-cyan-200'
              } disabled:opacity-50`}
            >
              {newRoomType === 'premium' ? '👑 2.000 Altın ile Kalıcı Oda Aç' : 'Oluştur & Katıl (Ücretsiz)'}
            </button>
          </div>
        </div>
      )}

      {/* ═══ TOP HEADER: Benim / Öneri / Popüler tabs + Search + Create ═══ */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            { id: 'benim' as const, label: 'Benim' },
            { id: 'oneri' as const, label: 'Öneri' },
            { id: 'populer' as const, label: 'Popüler' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                soundFX.playPop();
                setActiveMainTab(tab.id);
              }}
              className={`text-base font-bold pb-1 transition-colors ${
                activeMainTab === tab.id
                  ? 'text-gray-900 border-b-2 border-gray-900'
                  : 'text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700">
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              soundFX.playPop();
              setShowCreateModal(true);
            }}
            className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white active:scale-95 transition shadow-sm"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* ═══ EVENT BANNER ═══ */}
      <div className="px-4 py-2">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 p-4 relative">
          <div className="relative z-10">
            <h3 className="text-white font-black text-sm">🎉 Pasta Bombası</h3>
            <p className="text-white/80 text-[10px] mt-0.5">11 Eylül 12:00 - 30 Eylül 23:59</p>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-4xl opacity-80">🎂</div>
        </div>
      </div>

      {/* ═══ CATEGORY PILLS ═══ */}
      <div className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar">
        {categoryPills.map(cat => {
          const isSelected = selectedTag === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                soundFX.playPop();
                setSelectedTag(cat);
              }}
              className={`px-3 py-1 text-sm font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'text-gray-900 font-bold border-b-2 border-cyan-500'
                  : 'text-gray-400'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ═══ ROOM CARDS LIST ═══ */}
      <div className="px-4 py-2 space-y-1">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 space-y-2">
            <Users className="w-10 h-10 opacity-40" />
            <p className="text-sm font-medium">Oda bulunamadı</p>
            <p className="text-xs text-gray-400">Yeni bir oda kurabilirsiniz.</p>
          </div>
        ) : (
          filteredRooms.map(room => {
            const hostAvatar = room.host?.avatarConfig || currentUser.avatarConfig;
            const tagStyle = tagColors[room.tag] || 'bg-cyan-500 text-white';

            return (
              <div
                key={room.id}
                onClick={() => {
                  soundFX.playPop();
                  onSelectRoom(room.id);
                }}
                className="flex items-center gap-3 py-3 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition"
              >
                {/* Square thumbnail */}
                <div className="w-14 h-14 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100">
                  <AvatarRenderer config={hostAvatar} className="w-full h-full" />
                </div>

                {/* Room info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <h3 className="text-sm font-bold text-gray-900 truncate">
                      {room.title}
                    </h3>
                    {room.isPermanent && (
                      <span className="flex-shrink-0 px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                        <Crown className="w-2.5 h-2.5 text-amber-600" />
                        Kalıcı
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-1.5 py-[1px] rounded text-[10px] font-bold ${tagStyle}`}>
                      {room.tag}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Users className="w-3 h-3" />
                      {(room.seats || []).filter(s => s.user).length || 1}
                    </span>
                  </div>
                </div>

                {/* Member avatars & Owner delete button */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex -space-x-1.5">
                    <div className="w-7 h-7 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                      <AvatarRenderer config={hostAvatar} className="w-full h-full" />
                    </div>
                    {(room.seats || []).filter(s => s.seatIndex > 0 && s.user).slice(0, 2).map((s, idx) => (
                      <div key={idx} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                        <AvatarRenderer config={s.user!.avatarConfig} className="w-full h-full" />
                      </div>
                    ))}
                  </div>

                  {/* Oda Sahibi için Silme Butonu */}
                  {room.host?.id === currentUser.id && (
                    <button
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                      className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                      title="Odayı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

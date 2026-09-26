import React, { useState, useEffect, useRef } from 'react';
import type { User, AvatarConfig } from '../../types';
import { getNumericId } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import { ArrowLeft, Gamepad2, Send, Trash2, UserPlus, Search, X, Check, Copy, Plus } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

/** Generate deterministic private room ID for two users */
const getRoomId = (uidA: string, uidB: string): string => {
  return [uidA, uidB].sort().join('_');
};

interface DirectMessagesProps {
  currentUser: User;
  onLaunchGame: (gameId: any) => void;
}

interface ContactUser {
  id: string;
  numericId: string;
  username: string;
  avatarConfig: AvatarConfig;
  isOfficial?: boolean;
}

interface ConversationItem {
  id: string;
  user: ContactUser;
  lastMessage?: string;
  lastTime?: string;
}

// Built-in standard contacts with fixed 7-digit numeric IDs
const DEFAULT_SYSTEM_CONTACTS: ConversationItem[] = [
  {
    id: 'bot-1',
    user: {
      id: 'bot-1',
      numericId: '1029384',
      username: 'Paul',
      avatarConfig: {
        skinColor: '#FEE3D4',
        hairStyle: 'ponytail',
        hairColor: '#d97706',
        eyeStyle: 'cute',
        mouthStyle: 'smile',
        outfit: 'party_dress',
        outfitColor: '#ec4899',
        accessory: 'cat_ears',
        frame: 'sakura',
      },
      isOfficial: true,
    },
    lastMessage: '🏋 SUNUCU ALIM VE ETKİNLİK SÜRECİ 1. Ön Eleme...',
    lastTime: '21:12',
  },
  {
    id: 'bot-2',
    user: {
      id: 'bot-2',
      numericId: '2049581',
      username: 'Bing',
      avatarConfig: {
        skinColor: '#FFDCB1',
        hairStyle: 'anime',
        hairColor: '#06b6d4',
        eyeStyle: 'cool',
        mouthStyle: 'smirk',
        outfit: 'cyberpunk',
        outfitColor: '#3b82f6',
        accessory: 'gaming_headset',
        frame: 'cyber_glow',
      },
      isOfficial: true,
    },
    lastMessage: 'Geçen haftanın Arena sonuçları açıklandı. 19839. o...',
    lastTime: 'Dün 00:00',
  },
  {
    id: 'bot-3',
    user: {
      id: 'bot-3',
      numericId: '3094821',
      username: 'Dedektif',
      avatarConfig: {
        skinColor: '#E8B688',
        hairStyle: 'curly',
        hairColor: '#3b2219',
        eyeStyle: 'sparkle',
        mouthStyle: 'laugh',
        outfit: 'streetwear',
        outfitColor: '#10b981',
        accessory: 'glasses',
        frame: 'none',
      },
      isOfficial: true,
    },
    lastMessage: 'Yükleme ile ilgili sorun mu yaşıyorsunuz? Lütfen mü...',
    lastTime: 'Cumartesi',
  },
];

export const DirectMessages: React.FC<DirectMessagesProps> = ({ currentUser, onLaunchGame }) => {
  const myNumericId = getNumericId(currentUser);

  // Load custom contacts from local storage or fallback to defaults
  const [conversations, setConversations] = useState<ConversationItem[]>(() => {
    try {
      const saved = localStorage.getItem(`luvia_contacts_${currentUser.id}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return DEFAULT_SYSTEM_CONTACTS;
  });

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [messages, setMessages] = useState<Array<{ id: string; senderId?: string; senderName?: string; text: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add friend by numeric ID state
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [searchIdInput, setSearchIdInput] = useState('');
  const [searchResult, setSearchResult] = useState<ContactUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [copiedMyId, setCopiedMyId] = useState(false);

  // Save contacts to localStorage when updated
  const saveContacts = (updated: ConversationItem[]) => {
    setConversations(updated);
    try {
      localStorage.setItem(`luvia_contacts_${currentUser.id}`, JSON.stringify(updated));
    } catch (_) {}
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const roomId = activeConvId ? getRoomId(currentUser.id, activeConvId) : null;

  useEffect(() => {
    if (!roomId) return undefined;
    const unsubscribe = chatService.subscribe(roomId, setMessages);
    return () => unsubscribe();
  }, [roomId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = async () => {
    if (!textInput.trim() || !roomId) return;
    soundFX.playPop();
    const textToSend = textInput.trim();
    setTextInput('');
    await chatService.sendMessage(roomId, currentUser.id, currentUser.username, textToSend);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!roomId) return;
    soundFX.playPop();
    await chatService.deleteMessage(roomId, messageId);
  };

  const handleClearConversation = async () => {
    if (!roomId) return;
    if (window.confirm('Bu sohbetteki tüm mesajları silmek istediğinizden emin misiniz?')) {
      soundFX.playPop();
      await chatService.clearConversation(roomId);
      setMessages([]);
    }
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (window.confirm('Bu sohbeti listenizden silmek istiyor musunuz?')) {
      soundFX.playPop();
      const updated = conversations.filter((c) => c.id !== convId);
      saveContacts(updated);
      if (activeConvId === convId) {
        setActiveConvId(null);
      }
      const targetRoomId = getRoomId(currentUser.id, convId);
      chatService.clearConversation(targetRoomId).catch(() => {});
    }
  };

  const handleSearchFriend = async () => {
    const cleanId = searchIdInput.trim();
    if (!cleanId) return;

    if (!/^\d+$/.test(cleanId)) {
      setSearchError('ID sadece rakamlardan oluşmalıdır!');
      setSearchResult(null);
      return;
    }

    if (cleanId === myNumericId) {
      setSearchError('Kendi ID numaranızı arkadaş olarak ekleyemezsiniz!');
      setSearchResult(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResult(null);
    soundFX.playPop();

    try {
      const defaultMatch = DEFAULT_SYSTEM_CONTACTS.find((c) => c.user.numericId === cleanId);
      if (defaultMatch) {
        setSearchResult(defaultMatch.user);
        setIsSearching(false);
        return;
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('numericId', '==', cleanId));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundDoc = snap.docs[0];
        const data = foundDoc.data() as User;
        setSearchResult({
          id: foundDoc.id,
          numericId: data.numericId || cleanId,
          username: data.username || 'Oyuncu',
          avatarConfig: data.avatarConfig || {
            skinColor: '#FFDCB1',
            hairStyle: 'kpop',
            hairColor: '#3b2219',
            eyeStyle: 'sparkle',
            mouthStyle: 'smile',
            outfit: 'hoodie',
            outfitColor: '#ec4899',
            accessory: 'none',
            frame: 'none',
          },
        });
      } else {
        setSearchError('Bu ID ile kayıtlı bir kullanıcı bulunamadı.');
      }
    } catch (err) {
      console.warn('Friend search error:', err);
      setSearchError('Arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFoundFriend = (targetUser: ContactUser) => {
    soundFX.playSuccess();
    const existing = conversations.find((c) => c.id === targetUser.id);
    if (!existing) {
      const updated = [{ id: targetUser.id, user: targetUser }, ...conversations];
      saveContacts(updated);
    }
    setActiveConvId(targetUser.id);
    setIsAddFriendOpen(false);
    setSearchIdInput('');
    setSearchResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-white text-gray-800 select-none relative">
      {!activeConv ? (
        /* ═══ MESSAGES LIST VIEW ═══ */
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900">Mesaj</h2>
              <span className="text-gray-400">📋</span>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-gray-500 hover:text-gray-700">
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setIsAddFriendOpen(true);
                }}
                className="text-cyan-500 hover:text-cyan-600"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <UserPlus className="w-8 h-8" />
                </div>
                <p className="text-sm font-bold text-gray-600">Henüz sohbetiniz yok</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Sağ üstteki "+" butonuna basarak arkadaş ekleyin.
                </p>
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    soundFX.playPop();
                    setActiveConvId(conv.id);
                  }}
                  className="group flex items-center gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center">
                      <AvatarRenderer config={conv.user.avatarConfig} className="w-full h-full" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 truncate">{conv.user.username}</span>
                      {conv.user.isOfficial && (
                        <span className="px-1.5 py-[1px] rounded text-[9px] font-bold bg-cyan-100 text-cyan-600">
                          Yetkili
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {conv.lastMessage || 'Sohbeti açmak için dokun'}
                    </p>
                  </div>

                  {/* Time + Delete */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[11px] text-gray-400">
                      {conv.lastTime || ''}
                    </span>
                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.id)}
                      className="p-1 rounded text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="Sohbeti Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* ═══ ACTIVE CHAT VIEW ═══ */
        <div className="flex flex-col h-full bg-gray-50">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => {
                  soundFX.playPop();
                  setActiveConvId(null);
                }}
                className="p-1 rounded-full text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                <AvatarRenderer config={activeConv.user.avatarConfig} className="w-full h-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900">{activeConv.user.username}</span>
                  {activeConv.user.isOfficial && (
                    <span className="px-1.5 py-[1px] rounded text-[9px] font-bold bg-cyan-100 text-cyan-600">
                      Yetkili
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-500 font-medium block">● Çevrim İçi</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearConversation}
                className="p-1.5 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-50 transition"
                title="Sohbeti Temizle"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundFX.playPop();
                  onLaunchGame('werewolf');
                }}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-600 border border-cyan-200 text-[10px] font-bold active:scale-95 transition"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Oyuna Çağır</span>
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center text-gray-400 text-xs">
                <span>💬 Henüz bir mesaj yok.</span>
                <span className="text-[11px] mt-1">İlk mesajı göndererek sohbeti başlatın!</span>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                return (
                  <div key={m.id} className={`group flex items-center gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <div
                      className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                        isMe
                          ? 'bg-cyan-500 text-white rounded-br-none'
                          : 'bg-white text-gray-700 rounded-bl-none border border-gray-100'
                      }`}
                    >
                      {m.text}
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => handleDeleteMessage(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-400 transition"
                        title="Mesajı Sil"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none border border-gray-200 focus:border-cyan-400 transition"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition active:scale-95 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══ ADD FRIEND MODAL ═══ */}
      {isAddFriendOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-500">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-900">Sayısal ID ile Arkadaş Ekle</h3>
              </div>
              <button
                onClick={() => {
                  soundFX.playPop();
                  setIsAddFriendOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* My Numeric ID */}
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Senin Profil ID'n:</span>
              <div
                onClick={() => {
                  soundFX.playPop();
                  navigator.clipboard?.writeText(myNumericId);
                  setCopiedMyId(true);
                  setTimeout(() => setCopiedMyId(false), 2000);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 font-mono font-bold cursor-pointer hover:bg-cyan-100 transition"
              >
                <span>{myNumericId}</span>
                {copiedMyId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
              </div>
            </div>

            {/* Search Input */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500">Arkadaşının 7 Haneli ID Numarası:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  value={searchIdInput}
                  onChange={(e) => setSearchIdInput(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchFriend()}
                  placeholder="Örn: 1029384"
                  className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-800 font-mono placeholder-gray-400 border border-gray-200 focus:border-cyan-400 outline-none"
                />
                <button
                  onClick={handleSearchFriend}
                  disabled={isSearching || !searchIdInput.trim()}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ara</span>
                </button>
              </div>
            </div>

            {/* Error */}
            {searchError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-500 text-xs">
                {searchError}
              </div>
            )}

            {/* Found User */}
            {searchResult && (
              <div className="p-3.5 rounded-xl bg-gray-50 border border-cyan-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    <AvatarRenderer config={searchResult.avatarConfig} className="w-full h-full" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{searchResult.username}</span>
                    <span className="text-[10px] text-cyan-600 font-mono font-bold">ID: {searchResult.numericId}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddFoundFriend(searchResult)}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow transition active:scale-95"
                >
                  Ekle & Sohbet Et
                </button>
              </div>
            )}

            {/* Quick Demo IDs */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Örnek Ekleyebileceğiniz ID'ler:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Paul', id: '1029384' },
                  { name: 'Bing', id: '2049581' },
                  { name: 'Dedektif', id: '3094821' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSearchIdInput(item.id);
                      setSearchError(null);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-[10px] text-gray-500 hover:text-gray-700 border border-gray-200 transition"
                  >
                    {item.name}: <span className="font-mono text-cyan-600">{item.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

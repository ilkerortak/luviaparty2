import React, { useState, useEffect, useRef } from 'react';
import type { RoomSeat, User, ActiveGift, VoiceRoom } from '../../types';
import { AvatarRenderer } from '../avatar/AvatarRenderer';
import { soundFX } from '../../utils/soundEffects';
import { GiftVisualRenderer } from './GiftVisualRenderer';
import {
  subscribeToVoiceRoom,
  subscribeToVoiceRooms,
  updateVoiceRoomSeat,
  subscribeToRoomMessages,
  sendRoomChatMessage,
  broadcastRoomGift,
  subscribeToLiveGifts,
  subscribeToLiveRoomChat,
  kickUserFromVoiceRoom,
  deleteVoiceRoom,
  updateVoiceRoomActivity
} from '../../services/onlineService';
import { voiceWebRTC } from '../../services/voiceWebRTCService';
import {
  Mic,
  MicOff,
  Gift,
  Send,
  Users,
  X,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  Search,
  Trash2,
  Settings,
  MoreHorizontal,
  Minus,
  Crown,
  Volume2,
  VolumeX,
  Gamepad2,
  Smile,
  Shield,
  Radio,
  Sliders,
  Check,
  Lock,
  Unlock,
  Music2,
  Clock,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RedPacketModal } from './RedPacketModal';
import { FallingRedPackets } from './FallingRedPackets';
import { LuckyWheelModal } from './LuckyWheelModal';
import { BackpackModal } from './BackpackModal';
import { PKBattleModal } from './PKBattleModal';
import { BingoModal } from './BingoModal';
import { MicWaitlistModal, type WaitlistApplicant } from './MicWaitlistModal';
import { RedPacketCountdownModal } from './RedPacketCountdownModal';
import { FloatingReactions } from './FloatingReactions';
import audioResources from '../../assets/audioResources.json';
import { CharmBadge, getCharmInfo } from '../../utils/charmLevel';
import { broadcastGlobalHavadis } from '../../services/havadisService';
import { voicePresence, type PresenceUser } from '../../services/voicePresenceService';
import { ref as dbRef, set as dbSet, onValue as dbOnValue, off as dbOff, remove as dbRemove, push as dbPush, onChildAdded as dbOnChildAdded } from 'firebase/database';
import { rtdb } from '../../firebase/config';

import { ROOM_GIFTS, RoomGift } from '../../data/gifts';

interface VoiceRoomProps {
  roomId: string;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLeaveRoom: () => void;
  onMinimize?: () => void;
  onSelectRoom?: (roomId: string) => void;
}

const GIFTS = ROOM_GIFTS;

const makeMockUser = (
  id: string,
  username: string,
  level: number,
  charm: number,
  hairStyle: 'messy' | 'kpop' | 'curly' | 'ponytail' | 'short' | 'anime' = 'short',
  outfit: 'hoodie' | 'streetwear' | 'cyberpunk' | 'suit' | 'party_dress' | 'space_suit' = 'streetwear',
  accessory: 'none' | 'cat_ears' | 'gaming_headset' | 'glasses' | 'angel_wings' | 'crown' = 'none',
  frame: 'none' | 'gold_vip' | 'neon_fire' | 'sakura' | 'cyber_glow' = 'none'
): User => ({
  id,
  username,
  level,
  exp: level * 1000,
  maxExp: (level + 1) * 1000,
  coins: 50000,
  diamonds: 1200,
  charm,
  vipLevel: Math.min(10, Math.floor(level / 2)),
  statusMessage: 'Harika bir gün!',
  followersCount: 120,
  followingCount: 45,
  gamesPlayed: 500,
  gamesWon: 250,
  avatarConfig: {
    skinColor: '#ffd1a4',
    hairColor: '#1e293b',
    hairStyle,
    eyeStyle: 'cool',
    mouthStyle: 'smile',
    outfit,
    outfitColor: '#3b82f6',
    accessory,
    frame,
  },
});

const DEFAULT_ROOM_SPEAKERS: (User | null)[] = Array(12).fill(null);

export const VoiceRoomComponent: React.FC<VoiceRoomProps> = ({
  roomId,
  currentUser,
  onUpdateUser,
  onLeaveRoom,
  onMinimize,
  onSelectRoom,
}) => {
  // 12 VIP Seats matching media_1790339116030.jpg (Host & Co-host row, 2 middle rows of 4, bottom VIP crown row)
  const [seats, setSeats] = useState<RoomSeat[]>(() =>
    Array.from({ length: 12 }, (_, idx) => ({
      seatIndex: idx,
      user: null,
      isMuted: false,
      isSpeaking: false,
      micLevel: 0,
    }))
  );

  const [mySeatIndex, setMySeatIndex] = useState<number | null>(null);
  const mySeatIndexRef = useRef<number | null>(null);
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceUser>>({});
  const [isMyMicMuted, setIsMyMicMuted] = useState<boolean>(false);
  const [isDeafened, setIsDeafened] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; isGift?: boolean; isSystem?: boolean; receiver?: string; giftName?: string; charmGain?: number; timestamp?: number }[]>([
    { id: '1', sender: 'Sistem', text: '🎉 Sohbet odasına hoş geldiniz! Saygılı bir ortam dileriz.', isSystem: true },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [selectedSeatForGift, setSelectedSeatForGift] = useState<number>(0);
  const [activeGiftBanner, setActiveGiftBanner] = useState<ActiveGift | null>(null);
  const [selectedGiftCategory, setSelectedGiftCategory] = useState<'all' | 'popular' | 'special' | 'vip' | 'event'>('all');
  const [selectedGiftId, setSelectedGiftId] = useState<string>('flower_goddess');
  const [giftMultiplier, setGiftMultiplier] = useState<number>(1);
  const [showMultiplierDropdown, setShowMultiplierDropdown] = useState<boolean>(false);
  const [giftTargetMode, setGiftTargetMode] = useState<'single' | 'all_speakers'>('single');
  const [giftCustomNote, setGiftCustomNote] = useState<string>('');
  const [luckyRefundModal, setLuckyRefundModal] = useState<{ amount: number; giftName: string; multiplier: number } | null>(null);

  // Odayı Takip Etme / Üye Olma Durumu
  const [isFollowingRoom, setIsFollowingRoom] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`room_followed_${roomId}`) === 'true';
    } catch {
      return false;
    }
  });

  const [roomMemberCount, setRoomMemberCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`room_member_count_${roomId}`);
      return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    } catch {
      return 1;
    }
  });

  // Odaya Biri Girdiğinde 2 Saniyelik Kayan Bildirim [ (user) geldi.. ]
  const [userJoinToast, setUserJoinToast] = useState<{ id: string; username: string } | null>(null);
  const toastTimeoutRef = useRef<any>(null);
  const prevPresenceKeysRef = useRef<string[]>([]);

  const triggerUserJoinToast = (username: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setUserJoinToast({ id: `join_${Date.now()}`, username });
    toastTimeoutRef.current = setTimeout(() => {
      setUserJoinToast(null);
    }, 2000);
  };

  // Host Moderation Modal State (Ayağa kaldır & Odadan at)
  const [selectedUserForManage, setSelectedUserForManage] = useState<{ user: User; seatIndex?: number } | null>(null);

  // WePlay Modals
  const [showGameFunModal, setShowGameFunModal] = useState(false); // "Oyun eğlencesi & Oda Araçları"
  const [showMembersModal, setShowMembersModal] = useState(false); // "Çevrimiçi & Üye Listesi"
  const [activeMemberTab, setActiveMemberTab] = useState<'online' | 'members' | 'contrib'>('online');
  const [showRoomSettings, setShowRoomSettings] = useState(false); // "Oda ayarları" tam ekran

  const [roomHost, setRoomHost] = useState<User | null>(null);
  const [isPermanentRoom, setIsPermanentRoom] = useState<boolean>(false);

  // Oda Sahibi Yetki Kontrolü: Odayı kuran kişi veya 0. koltuktaki kişi
  const isHost = Boolean(
    (roomHost && (roomHost.id === currentUser.id || (currentUser.numericId && roomHost.numericId === currentUser.numericId))) ||
    (seats[0]?.user && (seats[0].user.id === currentUser.id || (currentUser.numericId && seats[0].user.numericId === currentUser.numericId))) ||
    (!roomHost) // Henüz host atanmamışsa currentUser oda yöneticisidir
  );

  // Oda Sahibi veya Admin Odada mı? (Oda sahibi currentUser ise veya henüz oda sahibi yoksa açık sayılır)
  const isHostPresent = Boolean(
    isHost ||
    !roomHost || // Eğer oda sahibi atanmamışsa oda halka açıktır
    (roomHost && (roomHost.id === currentUser.id || (currentUser.numericId && roomHost.numericId === currentUser.numericId))) ||
    (roomHost && presenceMap[roomHost.id]) ||
    (roomHost && seats.some(s => s.user && (s.user.id === roomHost.id || (roomHost.numericId && s.user.numericId === roomHost.numericId))))
  );

  // Canlı Odalar Listesi (Oda sahibi yokken en popüler odaları önermek için)
  const [availableRooms, setAvailableRooms] = useState<VoiceRoom[]>([]);

  useEffect(() => {
    const unsub = subscribeToVoiceRooms((remoteRooms) => {
      if (remoteRooms) {
        setAvailableRooms(remoteRooms);
      }
    });
    return () => unsub();
  }, []);

  // En Popüler Canlı Odalar (Kişi sayısına göre sıralı, mevcut oda hariç)
  const popularSuggestedRooms = React.useMemo(() => {
    const otherRooms = availableRooms.filter(r => r.id !== roomId);

    const mapped = otherRooms.map(r => {
      const occupiedSeats = (r.seats || []).filter(s => s.user).length;
      const count = Math.max(occupiedSeats, r.onlineCount || 1);
      return {
        id: r.id,
        title: r.title || 'Sohbet Odası',
        online: count,
        avatarConfig: r.host?.avatarConfig || {
          skinColor: '#ffd1a4',
          hairColor: '#1e293b',
          hairStyle: 'short',
          outfit: 'jacket',
          accessory: 'headphones',
        },
      };
    });

    mapped.sort((a, b) => b.online - a.online);

    if (mapped.length > 0) {
      return mapped.slice(0, 3);
    }

    // Sistemde henüz başka oda oluşturulmamışsa popüler aktif alternatifler
    return [
      { id: 'room-popular-1', title: 'Canlı Müzik & Sohbet', online: 8, avatarConfig: { skinColor: '#ffd1a4', hairColor: '#1e293b', hairStyle: 'short', outfit: 'jacket', accessory: 'headphones' } },
      { id: 'room-popular-2', title: 'Gece Kuşları Kulübü', online: 5, avatarConfig: { skinColor: '#fcd34d', hairColor: '#b45309', hairStyle: 'long', outfit: 'hoodie', accessory: 'crown' } },
      { id: 'room-popular-3', title: 'Oyun & Eğlence Odası', online: 3, avatarConfig: { skinColor: '#fbcfe8', hairColor: '#4338ca', hairStyle: 'curly', outfit: 'suit', accessory: 'glasses' } },
    ];
  }, [availableRooms, roomId]);

  // Canlı Gerçek Çevrimiçi Kullanıcılar
  const liveOnlineUsers = React.useMemo(() => {
    const usersMap = new Map<string, { id: string; username: string; avatarConfig?: any; isHost: boolean; roleText: string }>();

    // Current user
    usersMap.set(currentUser.id, {
      id: currentUser.id,
      username: currentUser.username,
      avatarConfig: currentUser.avatarConfig,
      isHost: Boolean(roomHost ? roomHost.id === currentUser.id : seats[0]?.user?.id === currentUser.id),
      roleText: (roomHost ? roomHost.id === currentUser.id : seats[0]?.user?.id === currentUser.id) ? 'Sahip' : (mySeatIndex !== null ? `${mySeatIndex}. Koltuk` : 'Dinleyici'),
    });

    // Seated users
    seats.forEach(s => {
      if (s.user) {
        usersMap.set(s.user.id, {
          id: s.user.id,
          username: s.user.username,
          avatarConfig: s.user.avatarConfig,
          isHost: Boolean(roomHost ? roomHost.id === s.user.id : s.seatIndex === 0),
          roleText: s.seatIndex === 0 ? 'Sahip' : `${s.seatIndex}. Koltuk`,
        });
      }
    });

    // RTDB presence users
    Object.values(presenceMap).forEach(p => {
      const uid = p.userId || (p as any).id;
      if (uid && !usersMap.has(uid)) {
        usersMap.set(uid, {
          id: uid,
          username: p.username,
          avatarConfig: p.avatarConfig,
          isHost: Boolean(roomHost && roomHost.id === uid),
          roleText: 'Dinleyici',
        });
      }
    });

    return Array.from(usersMap.values());
  }, [currentUser, roomHost, seats, presenceMap, mySeatIndex]);

  const liveOnlineCount = liveOnlineUsers.length;

  const handleToggleFollowRoom = () => {
    soundFX.playPop();
    const nextFollowing = !isFollowingRoom;
    setIsFollowingRoom(nextFollowing);
    try {
      localStorage.setItem(`room_followed_${roomId}`, nextFollowing ? 'true' : 'false');
    } catch {}

    if (nextFollowing) {
      soundFX.playSuccess();
      setRoomMemberCount(prev => {
        const next = prev + 1;
        try { localStorage.setItem(`room_member_count_${roomId}`, String(next)); } catch {}
        return next;
      });
      sendRoomChatMessage(roomId, {
        sender: 'Sistem',
        text: `🎉 ${currentUser.username} odayı takip etti ve üye oldu!`,
        isSystem: true,
      });
    } else {
      setRoomMemberCount(prev => {
        const next = Math.max(1, prev - 1);
        try { localStorage.setItem(`room_member_count_${roomId}`, String(next)); } catch {}
        return next;
      });
    }
  };

  const [roomTitle, setRoomTitle] = useState('👑 SOHBET 👑');
  const [roomQualityHigh, setRoomQualityHigh] = useState(true);
  const [disableChat, setDisableChat] = useState(false);
  const [disableImages, setDisableImages] = useState(false);
  const [disableRedPackets, setDisableRedPackets] = useState(false);
  const [hasRoomPassword, setHasRoomPassword] = useState(false);
  const [adminManageEvents, setAdminManageEvents] = useState(true);

  // Additional configurable room settings
  const [roomAnnouncement, setRoomAnnouncement] = useState('Hoş geldiniz! Saygılı sohbetler ve iyi oyunlar dileriz.');
  const [roomMode, setRoomMode] = useState<'Normal' | 'Sohbet' | 'Oyun' | 'Parti'>('Normal');
  const [roomTag, setRoomTag] = useState<'Sohbet' | 'Müzik' | 'Oyun' | 'Arkadaşlık'>('Sohbet');
  const [roomBg, setRoomBg] = useState<'deep_blue' | 'galaxy' | 'sunset' | 'cyberpunk'>('deep_blue');
  const [partnerSeatEnabled, setPartnerSeatEnabled] = useState(false);
  const [roomSettingsModalItem, setRoomSettingsModalItem] = useState<{
    title: string;
    description: string;
    icon?: string;
  } | null>(null);

  // New Viral Feature Modals
  const [showRedPacketSendModal, setShowRedPacketSendModal] = useState(false);
  const [showMicWaitlistModal, setShowMicWaitlistModal] = useState(false);
  const [showRedPacketCountdownModal, setShowRedPacketCountdownModal] = useState(false);
  const [bingoPlayerCount, setBingoPlayerCount] = useState<number>(46);
  const [waitlist, setWaitlist] = useState<WaitlistApplicant[]>([
    { id: 'app-1', username: 'EVA³³', gender: 'female', gemLevel: 5, charmLevel: 6, vipTag: 'VIP', appliedAt: Date.now() - 30000 },
    { id: 'app-2', username: '..fidan..', gender: 'female', gemLevel: 4, charmLevel: 3, vipTag: 'PRO', appliedAt: Date.now() - 25000 },
    { id: 'app-3', username: 'ARTEMIS', gender: 'female', gemLevel: 6, charmLevel: 8, vipTag: 'ELITE', appliedAt: Date.now() - 20000 },
    { id: 'app-4', username: 'Arjin', gender: 'female', gemLevel: 4, charmLevel: 5, vipTag: '', appliedAt: Date.now() - 15000 },
    { id: 'app-5', username: 'Nahid_🖤', gender: 'male', gemLevel: 3, charmLevel: 4, vipTag: '', appliedAt: Date.now() - 10000 },
    { id: 'app-6', username: 'MİA🤍', gender: 'female', gemLevel: 4, charmLevel: 7, vipTag: 'STAR', appliedAt: Date.now() - 5000 },
  ]);
  const [activeRedPacket, setActiveRedPacket] = useState<{
    id: string;
    senderName: string;
    totalGold: number;
    remainingGold: number;
    count: number;
    claimedUsers: string[];
    message: string;
    unlockAt?: number;
    createdAt?: number;
  } | null>(null);
  const [redPacketCountdown, setRedPacketCountdown] = useState<number>(0);
  const [showLuckyWheel, setShowLuckyWheel] = useState(false);
  const [showBackpack, setShowBackpack] = useState(false);
  const [showPKBattle, setShowPKBattle] = useState(false);
  const [showBingo, setShowBingo] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<number[]>([]);
  const [bgMusicEnabled, setBgMusicEnabled] = useState(false);
  const [bgTrackId, setBgTrackId] = useState('lounge');

  // Trigger Laraッ arrival toast on entrance (media_1790339116030.jpg)
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerUserJoinToast('Laraッ');
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const giftTimeoutRef = useRef<any>(null);
  const isSendingRef = useRef<boolean>(false);
  const lastProcessedGiftIdRef = useRef<string | null>(null);

  // Trigger rich animated gift popup (Single fire per gift, no confetti spam!)
  const triggerGiftPopup = (gift: ActiveGift) => {
    if (!gift || !gift.id) return;
    // Prevent duplicate triggers for the same gift from repeated Firestore snapshots
    if (lastProcessedGiftIdRef.current === gift.id) {
      return;
    }
    lastProcessedGiftIdRef.current = gift.id;

    if (gift.giftName === 'Lamborghini Red' || gift.giftName === 'Kırmızı Lamborghini' || gift.giftName === 'Spor Araba' || gift.giftName === 'Altın Helikopter') soundFX.playCarRev();
    else if (gift.giftName === 'Çiçek Tanrıçası' || gift.giftName === 'Çiçek Perisi' || gift.giftName === 'Kristal Şato' || gift.giftName === 'Kar Küresi' || gift.giftName === 'Piyano Melodileri' || gift.giftName === 'Masal Şatosu') soundFX.playCastleHarp();
    else if (gift.giftName === 'Siber Ejderha' || gift.giftName === 'Alev Ejderi' || gift.giftName === 'Ejderha') soundFX.playDragonRoar();
    else if (gift.giftName === 'Gökkuşağı Galaksisi' || gift.giftName === 'Galaksi UFO') soundFX.playAlarm();
    else soundFX.playGiftFanfare();

    // Moderate confetti only for rare/epic/legendary/mythic gifts
    if (gift.giftRarity === 'mythic') {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.4 },
        disableForReducedMotion: true,
      });
    } else if (gift.giftRarity === 'legendary') {
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { y: 0.4 },
        disableForReducedMotion: true,
      });
    } else if (gift.giftRarity === 'epic') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.45 },
        disableForReducedMotion: true,
      });
    } else if (gift.giftRarity === 'rare') {
      confetti({
        particleCount: 15,
        spread: 35,
        origin: { y: 0.5 },
        disableForReducedMotion: true,
      });
    }

    setActiveGiftBanner(gift);
    if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
    const duration = gift.giftRarity === 'mythic' ? 5200 : (gift.giftRarity === 'legendary' ? 4400 : 3800);
    giftTimeoutRef.current = setTimeout(() => {
      setActiveGiftBanner(null);
    }, duration);
  };

  // Initialize WebRTC Real-Time Voice Audio on room entry
  useEffect(() => {
    voiceWebRTC.startLocalAudio(
      roomId,
      currentUser.id,
      (isSpeaking, micLevel) => {
        setSeats(prev => prev.map(s => {
          if (s.user?.id === currentUser.id) {
            return { ...s, isSpeaking, micLevel: Math.round(micLevel) };
          }
          return s;
        }));
      },
      (peerId, isSpeaking, micLevel) => {
        setSeats(prev => prev.map(s => {
          if (s.user?.id === peerId) {
            return { ...s, isSpeaking, micLevel: Math.round(micLevel) };
          }
          return s;
        }));
      }
    );

    return () => {
      voiceWebRTC.destroy();
      soundFX.setMasterMuted(false);
    };
  }, [roomId, currentUser.id]);

  // Background music effect — play/stop when toggle changes
  useEffect(() => {
    if (bgMusicEnabled) {
      const track = (audioResources as { id: string; name: string; url: string; volume: number }[]).find(t => t.id === bgTrackId);
      if (track) soundFX.playBackgroundMusic(track.url, track.volume);
    } else {
      soundFX.stopBackgroundMusic();
    }
    return () => { soundFX.stopBackgroundMusic(); };
  }, [bgMusicEnabled, bgTrackId]);

  // RTDB sync for live room activeRedPacket and countdown
  useEffect(() => {
    if (!roomId) return;
    const packetRef = dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`);
    dbOnValue(packetRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setActiveRedPacket(null);
        setRedPacketCountdown(0);
        return;
      }
      const now = Date.now();
      // Eğer zarf süresi dolmuşsa (90s) veya altın bitmişse sunucudan sil
      if (now - (data.createdAt || 0) >= 90000 || (data.remainingGold !== undefined && data.remainingGold <= 0)) {
        dbRemove(packetRef).catch(console.warn);
        setActiveRedPacket(null);
        setRedPacketCountdown(0);
        return;
      }

      const claimedUsers: string[] = (Array.isArray(data.claimedUsers)
        ? data.claimedUsers
        : (data.claimedUsers ? Object.values(data.claimedUsers) : [])) as string[];

      // Kullanıcı bu zarfı daha önce toplamışsa tekrar gösterme
      if (claimedUsers.includes(currentUser.id)) {
        setActiveRedPacket(null);
        setRedPacketCountdown(0);
        return;
      }

      const safePacket = {
        ...data,
        claimedUsers,
      };
      setActiveRedPacket(safePacket);
      if (data.unlockAt && data.unlockAt > now) {
        setRedPacketCountdown(Math.ceil((data.unlockAt - now) / 1000));
      } else {
        setRedPacketCountdown(0);
      }
    });

    return () => {
      dbOff(packetRef);
    };
  }, [roomId]);

  // Countdown timer for active red packet unlocking
  useEffect(() => {
    if (redPacketCountdown <= 0) return;
    const timer = setInterval(() => {
      setRedPacketCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [redPacketCountdown]);

  // RTDB Presence & Server onDisconnect() binding
  useEffect(() => {
    voicePresence.joinRoom(roomId, currentUser, mySeatIndexRef.current);

    const unsubPresence = voicePresence.subscribeRoomPresence(roomId, (newPresenceMap) => {
      setPresenceMap(newPresenceMap);
      setSeats(currentSeats =>
        voicePresence.filterAndCleanSeats(roomId, currentSeats, newPresenceMap, currentUser.id)
      );
    });

    return () => {
      unsubPresence();
      voicePresence.leaveRoom();
    };
  }, [roomId, currentUser.id]);

  // Firestore sync for room seats and messages + Connect peers + Handle kick
  useEffect(() => {
    const unsubSeats = subscribeToVoiceRoom(roomId, (remoteSeats, remoteGift, kickedUserId, remoteHost, roomData) => {
      if (roomData) {
        if (roomData.title) setRoomTitle(roomData.title);
        if (roomData.isPermanent !== undefined) setIsPermanentRoom(!!roomData.isPermanent);
        updateVoiceRoomActivity(roomId).catch(() => {});
      }

      if (remoteHost) {
        setRoomHost(remoteHost);
      }

      // If host is absent, seating is disabled; stand up any seated guest
      const hostIsCurrentlyInRoom = Boolean(
        !remoteHost ||
        (remoteHost && (remoteHost.id === currentUser.id || (currentUser.numericId && remoteHost.numericId === currentUser.numericId))) ||
        (remoteHost && remoteSeats?.some(s => s.user && (s.user.id === remoteHost.id || (remoteHost.numericId && s.user.numericId === remoteHost.numericId))))
      );
      if (remoteHost && !hostIsCurrentlyInRoom && mySeatIndexRef.current !== null && mySeatIndexRef.current !== 0) {
        leaveSeat();
      }

      // If I was kicked by the host, notify and leave room immediately
      if (kickedUserId === currentUser.id) {
        soundFX.playPop();
        alert('Oda sahibi tarafından odadan çıkarıldınız.');
        leaveSeat();
        onLeaveRoom();
        return;
      }

      if (remoteSeats && remoteSeats.length > 0) {
        const normalizedSeats: RoomSeat[] = Array.from({ length: 12 }, (_, idx) => {
          const found = remoteSeats.find(s => s.seatIndex === idx);
          return found || {
            seatIndex: idx,
            user: null,
            isMuted: false,
            isSpeaking: false,
            micLevel: 0,
          };
        });
        const cleaned = voicePresence.filterAndCleanSeats(roomId, normalizedSeats, presenceMap, currentUser.id);

        // Auto-seat host on seat 0 if host is not seated anywhere and seat 0 is free
        const amIHost = Boolean(
          (remoteHost && (remoteHost.id === currentUser.id || (currentUser.numericId && remoteHost.numericId === currentUser.numericId))) ||
          (!remoteHost)
        );
        const mySeatedIdx = cleaned.findIndex(s => s.user && (s.user.id === currentUser.id || (currentUser.numericId && s.user.numericId === currentUser.numericId)));
        if (amIHost && mySeatedIdx === -1 && !cleaned[0].user) {
          cleaned[0] = { ...cleaned[0], user: currentUser };
          updateVoiceRoomSeat(roomId, 0, currentUser, false).catch(() => {});
        }

        setSeats(cleaned);
        const myIndex = cleaned.findIndex(s => s.user && (s.user.id === currentUser.id || (currentUser.numericId && s.user.numericId === currentUser.numericId)));
        const activeIdx = myIndex !== -1 ? myIndex : null;
        setMySeatIndex(activeIdx);
        mySeatIndexRef.current = activeIdx;
        voicePresence.updateSeat(activeIdx);

        // Sync WebRTC Audio Mesh with all active seated peers in the room
        const activeSeatedUserIds = cleaned
          .filter(seat => seat.user && seat.user.id !== currentUser.id)
          .map(seat => seat.user!.id);
        voiceWebRTC.syncActivePeers(activeSeatedUserIds);
      }
      if (remoteGift) {
        triggerGiftPopup(remoteGift);
      }
    });

    const unsubMsgs = subscribeToRoomMessages(roomId, remoteMessages => {
      if (remoteMessages && remoteMessages.length > 0) {
        setMessages(prev => {
          const sysMsgs = prev.filter(m => m.isSystem && m.id === '1');
          // Deduplicate incoming messages with any local optimistic messages:
          // Match by id OR (sender + text) within recent window
          const existingIds = new Set(remoteMessages.map((m: any) => m.id));
          const unsyncedLocals = prev.filter(m => {
            if (m.isSystem || !m.id.startsWith('local-')) return false;
            if (existingIds.has(m.id)) return false;
            // If any remote message has identical sender and text, consider local placeholder resolved
            const alreadyInRemote = remoteMessages.some(
              (rm: any) => rm.sender === m.sender && rm.text === m.text
            );
            return !alreadyInRemote;
          });
          return [...sysMsgs, ...remoteMessages, ...unsyncedLocals];
        });
      }
    });

    // RTDB instant live gift listener (0ms latency for all connected peers)
    const unsubLiveGifts = subscribeToLiveGifts(roomId, (liveGift) => {
      triggerGiftPopup(liveGift);
    });

    // RTDB instant live chat listener (0ms message broadcast)
    const unsubLiveChat = subscribeToLiveRoomChat(roomId, (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id || (m.sender === newMsg.sender && m.text === newMsg.text && Math.abs((m.timestamp || 0) - (newMsg.timestamp || 0)) < 4000))) {
          return prev;
        }
        return [...prev, newMsg];
      });
    });

    // RTDB instant soundboard SFX listener (Applause, Laugh, Cheer, Dragon, Car)
    const sfxRef = dbRef(rtdb, `voice_rooms/${roomId}/live_sfx`);
    const seenSfxKeys = new Set<string>();
    const unsubSFX = dbOnChildAdded(sfxRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;
      const key = snapshot.key;
      if (key && seenSfxKeys.has(key)) return;
      if (key) seenSfxKeys.add(key);

      const now = Date.now();
      if (Math.abs(now - (val.timestamp || 0)) < 4000) {
        if (val.senderId !== currentUser.id) {
          if (val.type === 'applause') soundFX.playApplause();
          else if (val.type === 'laugh') soundFX.playLaugh();
          else if (val.type === 'cheer') soundFX.playCheer();
          else if (val.type === 'dragon') soundFX.playDragonRoar();
          else if (val.type === 'car') soundFX.playCarRev();
        }
      }
      if (now - (val.timestamp || 0) > 10000) {
        dbRemove(snapshot.ref).catch(() => {});
      }
    });

    return () => {
      unsubSeats();
      unsubMsgs();
      unsubLiveGifts();
      unsubLiveChat();
      dbOff(sfxRef);
      if (giftTimeoutRef.current) clearTimeout(giftTimeoutRef.current);
    };
  }, [roomId, currentUser.id]);

  const handlePlaySoundboardSFX = (type: 'applause' | 'laugh' | 'cheer' | 'dragon' | 'car') => {
    soundFX.playPop();
    if (type === 'applause') soundFX.playApplause();
    else if (type === 'laugh') soundFX.playLaugh();
    else if (type === 'cheer') soundFX.playCheer();
    else if (type === 'dragon') soundFX.playDragonRoar();
    else if (type === 'car') soundFX.playCarRev();

    try {
      const sfxRef = dbRef(rtdb, `voice_rooms/${roomId}/live_sfx`);
      dbPush(sfxRef, {
        type,
        senderId: currentUser.id,
        senderName: currentUser.username,
        timestamp: Date.now(),
      });
    } catch (e) {}
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSeatClick = async (seatIndex: number) => {
    soundFX.playPop();
    const targetSeat = seats[seatIndex];

    if (targetSeat.user) {
      if (targetSeat.user.id === currentUser.id || (currentUser.numericId && targetSeat.user.numericId === currentUser.numericId)) {
        // Clicked own seat
        return;
      }

      // SADECE ODA SAHİBİ ise yönetim panelini (Ayağa kaldır / Odadan at) aç
      if (isHost) {
        setSelectedUserForManage({ user: targetSeat.user, seatIndex });
      } else {
        // Normal kullanıcılar sadece hediye gönderebilir
        setSelectedSeatForGift(seatIndex);
        setShowGiftModal(true);
      }
      return;
    }

    const isCurrentActualHost = Boolean(
      (roomHost && (roomHost.id === currentUser.id || (currentUser.numericId && roomHost.numericId === currentUser.numericId))) ||
      (!roomHost) ||
      isHost
    );

    // 1. Oda sahibi veya admin odada yoksa koltuklara oturulamaz kontrolü
    if (!isCurrentActualHost && !isHostPresent) {
      soundFX.playPop();
      alert('Oda sahibi veya yönetici odada olmadığı için koltuklara oturulamaz.');
      return;
    }

    // 2. Admin koltuğuna (Koltuk 0) sadece oda sahibi / yönetici oturabilir
    if (seatIndex === 0) {
      if (!isCurrentActualHost) {
        soundFX.playPop();
        alert('Admin koltuğuna sadece oda sahibi / yönetici oturabilir!');
        return;
      }
    }

    // Koltuk kilitli mi?
    const isSeatLocked = lockedSeats.includes(seatIndex);
    if (isSeatLocked && !isHost) {
      soundFX.playPop();
      alert('Bu koltuk oda sahibi tarafından kilitlenmiştir.');
      return;
    }

    // Oda sahibi boş kilitli koltuğa tıklarsa kilidi aç
    if (isHost && isSeatLocked) {
      setLockedSeats(prev => prev.filter(s => s !== seatIndex));
      soundFX.playPop();
      sendRoomChatMessage(roomId, { sender: 'Sistem', text: `🔓 ${seatIndex}. koltuk kilidi açıldı.`, isSystem: true });
      return;
    }

    // Take seat
    const updatedSeats = seats.map(s => {
      if (s.user && (s.user.id === currentUser.id || (currentUser.numericId && s.user.numericId === currentUser.numericId))) {
        return { ...s, user: null, isSpeaking: false, micLevel: 0 };
      }
      if (s.seatIndex === seatIndex) {
        return { ...s, user: currentUser, isSpeaking: false, micLevel: 0 };
      }
      return s;
    });

    setSeats(updatedSeats);
    setMySeatIndex(seatIndex);
    mySeatIndexRef.current = seatIndex;
    voicePresence.updateSeat(seatIndex);
    await updateVoiceRoomSeat(roomId, seatIndex, currentUser, false);
    soundFX.playSuccess();
  };

  // Sadece Oda Sahibinin Çağırabileceği: Ayağa Kaldır (Koltuktan İndir)
  const handleKickFromSeat = async (seatIndex: number, targetUser: User) => {
    if (!isHost) return;
    soundFX.playPop();

    // Koltuğu boşalt
    await updateVoiceRoomSeat(roomId, seatIndex, null, false);

    // Duyuru mesajı gönder
    await sendRoomChatMessage(roomId, {
      sender: 'Sistem',
      text: `🚪 Oda sahibi, ${targetUser.username} kullanıcısını koltuktan kaldırdı.`,
      isSystem: true,
    });

    setSelectedUserForManage(null);
  };

  // Sadece Oda Sahibinin Çağırabileceği: Odadan At
  const handleKickFromRoom = async (targetUser: User, seatIndex?: number) => {
    if (!isHost) return;
    soundFX.playPop();

    // Kullanıcıyı odadan at
    await kickUserFromVoiceRoom(roomId, targetUser.id, seatIndex);

    // Duyuru mesajı gönder
    await sendRoomChatMessage(roomId, {
      sender: 'Sistem',
      text: `🚫 Oda sahibi, ${targetUser.username} kullanıcısını odadan çıkardı.`,
      isSystem: true,
    });

    setSelectedUserForManage(null);
  };

  const leaveSeat = () => {
    const seatToVacate = mySeatIndexRef.current;
    if (seatToVacate === null) return;
    soundFX.playPop();
    const updated = seats.map(s => (s.seatIndex === seatToVacate ? { ...s, user: null, isSpeaking: false } : s));
    setSeats(updated);
    setMySeatIndex(null);
    mySeatIndexRef.current = null;
    voicePresence.updateSeat(null);
    updateVoiceRoomSeat(roomId, seatToVacate, null, false);
  };

  const handleExitRoom = async () => {
    leaveSeat();
    voicePresence.leaveRoom();
    onLeaveRoom();
  };

  const handleDeleteRoomInside = async () => {
    if (!window.confirm('Bu odayı tamamen kapatmak ve silmek istediğinize emin misiniz?')) {
      return;
    }
    soundFX.playPop();
    leaveSeat();
    voicePresence.leaveRoom();
    try {
      await deleteVoiceRoom(roomId);
    } catch (e) {
      console.error('Oda silinirken hata:', e);
    }
    onLeaveRoom();
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    if (isSendingRef.current) return;
    if (disableChat && !isHost) {
      soundFX.playPop();
      alert('Bu odada genel sohbet oda sahibi tarafından devre dışı bırakılmıştır.');
      return;
    }

    isSendingRef.current = true;
    setTimeout(() => {
      isSendingRef.current = false;
    }, 400);

    soundFX.playPop();

    // Akıllı Türkçe Uygunsuz Kelime Filtresi
    let filteredText = chatInput.trim();
    const bannedWords = ['küfür', 'hakaret', 'salak', 'aptal', 'orospu', 'piç', 'lan'];
    bannedWords.forEach(bad => {
      const regex = new RegExp(bad, 'gi');
      filteredText = filteredText.replace(regex, '***');
    });

    const localMsgId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const msg = {
      id: localMsgId,
      sender: currentUser.username,
      text: filteredText,
    };

    // Optimistically update local message list immediately
    setMessages(prev => [...prev, msg]);
    setChatInput('');

    // Send to Firestore in the background
    sendRoomChatMessage(roomId, {
      sender: currentUser.username,
      text: filteredText,
    }).catch(err => {
      console.warn('Failed to send room chat message:', err);
    });
  };

  const sendGift = (gift: RoomGift, multiplier: number = 1) => {
    // If target mode is all_speakers, count how many occupied seats
    const targetSeats = giftTargetMode === 'all_speakers'
      ? seats.filter(s => s.user && s.user.id !== currentUser.id)
      : [seats[selectedSeatForGift]];

    const effectiveTargetCount = giftTargetMode === 'all_speakers'
      ? Math.max(1, targetSeats.length)
      : 1;

    const totalCost = gift.price * multiplier * effectiveTargetCount;

    if (currentUser.coins < totalCost) {
      soundFX.playPop();
      alert(`Yetersiz altın! Gerekli: ${totalCost.toLocaleString('tr-TR')} 🪙, Bakiyeniz: ${currentUser.coins.toLocaleString('tr-TR')} 🪙`);
      return;
    }

    const maxGiftPrice = Math.max(...ROOM_GIFTS.map(g => g.price));
    const isMostExpensiveGift = gift.price === maxGiftPrice;

    // 200 gold üstü hediyeler rastgele gold kazandırsın:
    // %10 şansla %150 Jackpot geri ödeme; jackpot çıkmazsa %60'ı geçmeyecek şekilde %0-60 arası rastgele teselli geri ödemesi
    const isEligibleForRefund = gift.price > 200 || totalCost > 200;
    let wonRefundAmount = 0;
    let isLuckyRefundHit = false;
    let isConsolationHit = false;
    let consolationPercent = 0;

    if (isEligibleForRefund) {
      if (Math.random() < 0.10) {
        // %10 Şansla %150 Jackpot Geri Ödeme!
        isLuckyRefundHit = true;
        wonRefundAmount = Math.floor(totalCost * 1.50);
      } else {
        // %60'ı geçmeyecek şekilde %0-60 arası rastgele teselli geri ödemesi
        const consolationRate = Math.random() * 0.60; // 0.00 ile 0.60 arası
        consolationPercent = Math.round(consolationRate * 100);
        wonRefundAmount = Math.floor(totalCost * consolationRate);
        if (wonRefundAmount > 0) {
          isConsolationHit = true;
        }
      }
    }

    const earnedCharm = Math.max(1, Math.floor((gift.charm || Math.floor(gift.price / 5)) * multiplier * effectiveTargetCount));

    // Bakiyeden düş, eğer şanslı iade veya teselli iadesi çıktıysa geri ödemeyi ekle
    onUpdateUser({
      ...currentUser,
      coins: currentUser.coins - totalCost + wonRefundAmount,
      exp: currentUser.exp + Math.floor(totalCost / 2),
      charm: (currentUser.charm ?? 7668) + earnedCharm,
    });

    const targetUserNames = giftTargetMode === 'all_speakers'
      ? 'Tüm Konuşmacılar'
      : (seats[selectedSeatForGift]?.user?.username || (selectedSeatForGift === 0 ? (roomHost?.username || 'Oda Sahibi') : `Koltuk ${selectedSeatForGift + 1}`));

    const giftBanner: ActiveGift = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderName: currentUser.username,
      targetSeatIndex: selectedSeatForGift,
      targetUserName: targetUserNames,
      giftName: gift.name,
      giftIcon: gift.badge || '🎁',
      giftRarity: gift.rarity,
      giftQuote: gift.quote,
      giftCount: multiplier,
      earnedCharm: earnedCharm,
    };

    triggerGiftPopup(giftBanner);
    broadcastRoomGift(roomId, giftBanner).catch(console.warn);

    sendRoomChatMessage(roomId, {
      sender: 'Hediye',
      text: `🎁 ${currentUser.username}, ${targetUserNames} kullanıcısına ${multiplier > 1 ? `${multiplier}x ` : ''}${gift.name} gönderdi! ✨`,
      isGift: true,
    });

    // Şanslı İade (%150 Jackpot) veya Teselli İadesi Bildirimi & Coşkusu
    if (isLuckyRefundHit) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
      setLuckyRefundModal({
        amount: wonRefundAmount,
        giftName: gift.name,
        multiplier: 150,
      });

      sendRoomChatMessage(roomId, {
        sender: 'Sistem 🎰',
        text: `🎉 ŞANS PATLAMASI! ${currentUser.username}, ${gift.name} hediyesiyle %10 şansla %150 GERİ ÖDEME KAZANDI! (+${wonRefundAmount.toLocaleString('tr-TR')} 🪙)`,
        isSystem: true,
      });
    } else if (isConsolationHit) {
      sendRoomChatMessage(roomId, {
        sender: 'Sistem 🎁',
        text: `🎁 Teselli Geri Ödemesi: ${currentUser.username}, ${gift.name} hediyesinden %${consolationPercent} geri ödeme aldı (+${wonRefundAmount.toLocaleString('tr-TR')} 🪙)`,
        isSystem: true,
      });
    }

    // En pahalı hediye (veya total cost >= 10,000 gold veya Mythic hediye) için tüm sunucuya Havadis bildirimi!
    if (isMostExpensiveGift || totalCost >= 10000 || gift.rarity === 'mythic') {
      const finalHavadisNote = (isMostExpensiveGift && giftCustomNote.trim())
        ? giftCustomNote.trim()
        : (gift.quote || `${currentUser.username} muhteşem ${multiplier > 1 ? `${multiplier}x ` : ''}${gift.name} hediye etti! 🌸✨`);

      const cleanRoomNumber = roomId.startsWith('room-')
        ? `#${roomId.replace('room-', '')}`
        : (roomId.startsWith('#') ? roomId : `#${roomId}`);

      broadcastGlobalHavadis({
        senderName: currentUser.username,
        targetUserName: targetUserNames,
        giftName: `${multiplier > 1 ? `${multiplier}x ` : ''}${gift.name}`,
        message: finalHavadisNote,
        roomId: roomId,
        roomTitle: roomTitle,
        roomNumber: cleanRoomNumber,
        totalGold: totalCost,
      }).catch(console.warn);
    }

    setGiftCustomNote('');
    setShowGiftModal(false);
    setShowMultiplierDropdown(false);
  };

  // Gerçek Oda Üyeleri Listesi (Oda Sahibi + Odayı Takip Edenler)
  const roomMembers = React.useMemo(() => {
    const list: { id: string; username: string; role: string; gender: string; activeText: string; isHost?: boolean; avatarConfig?: any }[] = [];
    const seenUserIds = new Set<string>();

    // 1. Oda Sahibi
    if (roomHost) {
      list.push({
        id: roomHost.id,
        username: roomHost.username,
        role: 'Sahip',
        gender: '♂',
        activeText: presenceMap[roomHost.id] ? 'Çevrimiçi' : 'Bugün',
        isHost: true,
        avatarConfig: roomHost.avatarConfig,
      });
      seenUserIds.add(roomHost.id);
    } else if (isHost) {
      list.push({
        id: currentUser.id,
        username: currentUser.username,
        role: 'Sahip',
        gender: '♂',
        activeText: 'Çevrimiçi',
        isHost: true,
        avatarConfig: currentUser.avatarConfig,
      });
      seenUserIds.add(currentUser.id);
    }

    // 2. Eğer kullanıcı odayı takip etmişse ve sahip değilse Üye olarak ekle
    if (isFollowingRoom && !seenUserIds.has(currentUser.id)) {
      list.push({
        id: currentUser.id,
        username: currentUser.username,
        role: 'Üye',
        gender: '♂',
        activeText: 'Çevrimiçi',
        isHost: false,
        avatarConfig: currentUser.avatarConfig,
      });
      seenUserIds.add(currentUser.id);
    }

    return list;
  }, [roomHost, isHost, currentUser, isFollowingRoom, presenceMap]);

  const toggleSpeakerDeafen = () => {
    soundFX.playPop();
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);
    voiceWebRTC.setSpeakerMuted(nextDeafened);
    soundFX.setMasterMuted(nextDeafened);
    if (nextDeafened) {
      soundFX.stopBackgroundMusic();
    } else if (bgMusicEnabled) {
      const track = (audioResources as { id: string; name: string; url: string; volume: number }[]).find(t => t.id === bgTrackId);
      if (track) soundFX.playBackgroundMusic(track.url, track.volume);
    }
  };
  const renderGuestSeat = (idx: number) => {
    const seat = seats[idx];
    const isLocked = lockedSeats.includes(idx);
    const isSpeaking = seat?.isSpeaking;
    const hasFlame = isSpeaking || idx === 2 || idx === 7;
    const levelTag = idx === 3 ? '303' : idx === 5 ? '453' : idx === 1 ? '💎8' : null;
    const isVipCrown = !seat?.user && idx >= 10;

    return (
      <div
        key={idx}
        onClick={() => handleSeatClick(idx)}
        className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
      >
        <div className="relative">
          {/* Animated Fiery Flame Aura Ring matching media_1790339116030.jpg */}
          {hasFlame && seat?.user && (
            <div className="absolute -inset-1 rounded-full border-2 border-amber-400 ring-2 ring-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.95)] animate-pulse pointer-events-none" />
          )}

          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full p-0.5 flex items-center justify-center transition-all ${
              isSpeaking
                ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-[#080d20] shadow-[0_0_16px_rgba(52,211,153,0.7)] scale-105 bg-emerald-500/20'
                : seat?.user
                ? 'border border-cyan-400/50 bg-[#0d1c44]/80 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                : isVipCrown
                ? 'border border-purple-500/40 bg-purple-950/30'
                : isLocked
                ? 'border border-amber-400/30 bg-amber-950/20'
                : 'border border-dashed border-white/20 bg-white/[0.04] hover:border-cyan-300/50 hover:bg-white/[0.08]'
            }`}
          >
            {seat?.user ? (
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                <AvatarRenderer config={seat.user.avatarConfig} className="w-full h-full" />
                {/* Level Badge Tag overlay matching media_1790339116030.jpg */}
                {levelTag && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1 py-0.2 rounded bg-cyan-500 text-[7px] font-black text-white shadow border border-white/40 leading-none">
                    {levelTag}
                  </span>
                )}
              </div>
            ) : isVipCrown ? (
              <div className="w-full h-full rounded-full bg-gradient-to-b from-purple-800/80 via-indigo-950 to-slate-950 flex flex-col items-center justify-center shadow-inner">
                <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300/50 drop-shadow" />
              </div>
            ) : isLocked ? (
              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400/70 group-hover:text-cyan-300">
                <span className="text-sm font-light leading-none">+</span>
                <span className="text-[7px] font-mono font-semibold">{idx}</span>
              </div>
            )}

            {/* Speaking Equalizer / Micro Indicator */}
            {seat?.user && (
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md border ${
                  isSpeaking
                    ? 'bg-emerald-500 border-white text-white animate-pulse'
                    : 'bg-black/80 border-white/20 text-slate-400'
                }`}
              >
                {isSpeaking ? (
                  <Radio className="w-2 h-2 text-white" />
                ) : (
                  <MicOff className="w-2 h-2 text-slate-400" />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-0.5 flex items-center gap-0.5 max-w-[56px] justify-center">
          <span className="text-[9px] text-slate-300 truncate font-medium text-center">
            {seat?.user ? seat.user.username : isVipCrown ? 'VIP' : `Koltuk ${idx}`}
          </span>
          {seat?.user && (
            <CharmBadge level={getCharmInfo(seat.user.charm).level || 2} size="xs" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#080d20] text-white select-none relative overflow-hidden font-sans">
      {/* ═══ MODERN LUXURY ATMOSPHERE & AMBIENT GLOW ═══ */}
      <div className="absolute inset-0 bg-[#080d20] pointer-events-none" />
      {roomBg === 'galaxy' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#220744] via-[#100424] to-[#080214] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[90px] pointer-events-none" />
        </>
      ) : roomBg === 'sunset' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#4a150c] via-[#240a05] to-[#0c0402] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-rose-600/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-600/20 rounded-full blur-[90px] pointer-events-none" />
        </>
      ) : roomBg === 'cyberpunk' ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#062c26] via-[#031714] to-[#020b09] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-cyan-600/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-teal-600/20 rounded-full blur-[90px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1c44] via-[#09112b] to-[#050917] pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-indigo-500/15 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />
        </>
      )}

      {/* Subtle Star Particles */}
      <div className="absolute top-16 left-8 w-1 h-1 rounded-full bg-cyan-300 opacity-60 animate-ping pointer-events-none" />
      <div className="absolute top-28 right-12 w-1.5 h-1.5 rounded-full bg-amber-200 opacity-40 pointer-events-none animate-pulse" />
      <div className="absolute top-72 left-20 w-1 h-1 rounded-full bg-white opacity-30 pointer-events-none" />

      {/* ═══ ŞEFFAF & HEDİYE BOYUTUNDA KUTLAMA ALANI (Bunaltmayan, Transparan) ═══ */}
      {activeGiftBanner && (
        <div 
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center p-4 overflow-hidden"
        >
          {/* Sadece Hediye ve Başlık Alanını Kaplayan Şeffaf Kart (Dokunulduğunda kapanır) */}
          <div 
            onClick={() => setActiveGiftBanner(null)}
            className="pointer-events-auto cursor-pointer flex flex-col items-center justify-center max-w-[280px] p-2 rounded-3xl animate-in zoom-in-90 fade-in duration-200 active:scale-95 transition"
            title="Kapatmak için dokunun"
          >
            {/* Centered Gift Visual (Sadece hediye boyutu kadar) */}
            <div className="flex items-center justify-center pointer-events-none">
              <GiftVisualRenderer giftName={activeGiftBanner.giftName} size="hero" animated={true} />
            </div>

            {/* Şeffaf & Zarif Bilgi Kapsülü (Arka planı kapatmaz, transparan cam efekti) */}
            <div 
              className="mt-1 px-3.5 py-2 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center text-center space-y-1 w-full"
            >
              {/* Gönderen ➔ Alıcı */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-amber-200">
                <span>👑 {activeGiftBanner.senderName}</span>
                <span className="text-pink-400 font-black">➔</span>
                <span className="text-pink-300">💖 {activeGiftBanner.targetUserName || 'Oda'}</span>
              </div>

              {/* Hediye Adı & Adet */}
              <h2 className="text-sm sm:text-base font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] tracking-wide">
                {activeGiftBanner.giftName} {activeGiftBanner.giftCount && activeGiftBanner.giftCount > 1 ? `x${activeGiftBanner.giftCount}` : ''}
              </h2>

              {/* Varsa Özel Not / Şiir */}
              {activeGiftBanner.giftQuote && (
                <div className="px-2 py-0.5 rounded-lg bg-white/5 border border-pink-400/20 text-center w-full">
                  <span className="text-pink-200/90 text-[10px] italic leading-tight block truncate">
                    “{activeGiftBanner.giftQuote}”
                  </span>
                </div>
              )}

              {/* Cazibe Rozeti */}
              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                  <span>✨</span>
                  <span>+{activeGiftBanner.earnedCharm ? activeGiftBanner.earnedCharm.toLocaleString('tr-TR') : '100'} Cazibe</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-bold">
                  {activeGiftBanner.giftRarity === 'mythic' ? '🌸 Mitolojik' : activeGiftBanner.giftRarity === 'legendary' ? '👑 Efsanevi' : '💎 VIP'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODERN WEPLAY VIP TOP BAR (Temiz & Taşmayan Başlık) ═══ */}
      <div className="relative z-20 flex items-center justify-between px-3 py-2 pt-[max(calc(env(safe-area-inset-top,0px)+8px),42px)] bg-black/30 backdrop-blur-xl border-b border-white/[0.08] flex-shrink-0">
        {/* Sol: Geri / Küçült + Oda Bilgi Kapsülü */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              soundFX.playPop();
              if (onMinimize) onMinimize();
              else handleExitRoom();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition active:scale-95 shrink-0"
            title="Odayı Küçült / Geri"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded-md bg-purple-600/90 text-[9px] font-black text-amber-300 font-mono border border-purple-400/40 shrink-0">
                10
              </span>
              <span className="text-xs font-black text-white tracking-wide truncate max-w-[110px] sm:max-w-[160px]">
                {roomTitle}
              </span>
              {/* Takip Et / Üye Ol Kalp Butonu (WePlay stili) */}
              <button
                onClick={handleToggleFollowRoom}
                className="text-pink-400 hover:text-pink-300 transition active:scale-90 shrink-0 p-0.5"
                title={isFollowingRoom ? 'Takip Ediliyor' : 'Takip Et'}
              >
                {isFollowingRoom ? (
                  <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500 drop-shadow" />
                ) : (
                  <Heart className="w-3.5 h-3.5 text-pink-300" />
                )}
              </button>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <button
                onClick={() => {
                  soundFX.playPop();
                  navigator.clipboard?.writeText('Q120407');
                  alert('Oda ID (Q120407) panoya kopyalandı!');
                }}
                className="text-[9px] text-cyan-300/80 font-mono hover:text-cyan-200 transition"
                title="ID Kopyala"
              >
                ID: Q120407
              </button>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping ml-0.5" />
              <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">CANLI</span>
            </div>
          </div>
        </div>

        {/* Sağ: 👑 75999 Cazibe + Hoparlör + Üyeler + Menü (...) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cazibe Rozeti (media_1790339116030.jpg) */}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-900/90 to-indigo-900/90 border border-purple-400/50 shadow-sm text-[10px] font-black text-amber-300">
            <span>👑</span>
            <span>75999</span>
          </div>

          {/* Hoparlör Sustur / Aç Butonu */}
          <button
            onClick={toggleSpeakerDeafen}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition active:scale-95 border ${
              isDeafened
                ? 'bg-rose-500/25 border-rose-500 text-rose-300'
                : 'bg-white/[0.08] hover:bg-white/[0.15] border-white/10 text-slate-300'
            }`}
            title={isDeafened ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Çevrimiçi Üye Sayısı */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowMembersModal(true);
            }}
            className="h-7 px-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center gap-1 text-[10px] font-bold text-slate-200 transition active:scale-95"
            title="Çevrimiçi Üyeler"
          >
            <Users className="w-3 h-3 text-cyan-400" />
            <span className="font-mono font-black">{liveOnlineCount}</span>
          </button>

          {/* Oda Menüsü (...) */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowRoomSettings(true);
            }}
            className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
            title="Oda Menüsü & Ayarları"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Susturuldu Uyarısı (Deafened Banner) */}
      {isDeafened && (
        <div className="relative z-10 px-3 py-1 bg-rose-500/20 border-b border-rose-500/40 flex items-center justify-between text-[11px] text-rose-200 font-bold backdrop-blur-md animate-in fade-in duration-200">
          <span className="flex items-center gap-1.5 truncate">
            <VolumeX className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate">Sesler susturuldu (Konuşmacılar ve müzik kapalı)</span>
          </span>
          <button
            onClick={toggleSpeakerDeafen}
            className="px-2 py-0.5 rounded-lg bg-rose-500/30 border border-rose-400/50 text-white text-[10px] font-black shrink-0 active:scale-95 transition"
          >
            Sesi Aç
          </button>
        </div>
      )}

      {/* Alt Şerit: Saatlik Sıralama & Pinned CP (media_1790339116030.jpg) */}
      <div className="relative z-10 px-3.5 py-1 flex items-center justify-between text-[10px] bg-black/15 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-amber-300/90 font-bold truncate">
          <span>⭐️ Saatlik sıralama: #1</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-normal">💬 Oda sahibi grup sohbeti</span>
        </div>

        {/* Pinned CP / Arkadaş */}
        <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"
            alt="Cennet"
            className="w-3.5 h-3.5 rounded-full object-cover"
          />
          <span className="text-[9px] text-pink-300 font-bold">Cennet</span>
        </div>
      </div>

      {/* Aktif Kırmızı Zarf İnce Şeridi (Varsa) */}
      {activeRedPacket && redPacketCountdown > 0 && (
        <div
          onClick={() => {
            soundFX.playPop();
            setShowRedPacketCountdownModal(true);
          }}
          className="relative z-20 mx-3 my-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600/90 via-rose-600/90 to-amber-600/90 border border-amber-300/80 text-white shadow-lg flex items-center justify-between cursor-pointer animate-in slide-in-from-top-2 duration-300 shrink-0"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-lg animate-bounce">🧧</span>
            <span className="text-[11px] font-bold text-amber-100 truncate">
              {activeRedPacket.senderName}: "{activeRedPacket.message}" ({activeRedPacket.totalGold.toLocaleString('tr-TR')} 🪙)
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/40 font-mono font-black text-[10px] text-amber-300 shrink-0">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>00:{redPacketCountdown.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}

      {/* ═══ VIP STAGE & SEATING ARENA (Üst Yarı - Kesintisiz & Düzenli) ═══ */}
      <div className="relative z-10 flex-shrink-0 px-2 pt-1 pb-1">
        <div className="flex flex-col items-center">
          {/* Oda Sahibi Yoksa İnce Bilgi Şeridi (250px yer kaplamaz, tasarımı bozmaz) */}
          {!isHostPresent && !isHost && (
            <div className="w-full max-w-sm mx-auto mb-1.5 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-rose-500/30 flex items-center justify-between gap-2 shadow-lg animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-bold text-rose-200 truncate">
                  Oda sahibi ayrıldı (Mikrofonlar beklemede)
                </span>
              </div>
              {popularSuggestedRooms.length > 0 && (
                <button
                  onClick={() => {
                    soundFX.playPop();
                    const topRoom = popularSuggestedRooms[0];
                    if (onSelectRoom) onSelectRoom(topRoom.id);
                    else handleExitRoom();
                  }}
                  className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[9px] shrink-0 active:scale-95 transition shadow-sm"
                >
                  Canlı Odalar ➔
                </button>
              )}
            </div>
          )}

          <div className={!isHostPresent && !isHost ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
            {/* ═══ ROW 1: HOST (Seat 0) & CO-HOST (Seat 1) matching media_1790339116030.jpg ═══ */}
            <div className="flex items-center justify-center gap-8 pt-0.5">
              {/* Host Podium (Seat 0) */}
              <div
                onClick={() => handleSeatClick(0)}
                className="flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="relative">
                  {/* Fiery Flame Ring for Host */}
                  <div className="absolute -inset-1.5 rounded-full border-2 border-amber-400 ring-2 ring-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.95)] animate-pulse pointer-events-none" />

                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 flex items-center justify-center transition-all ${
                      seats[0]?.isSpeaking
                        ? 'ring-3 ring-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.85)] scale-105 bg-gradient-to-b from-emerald-500/30 to-emerald-900/30'
                        : seats[0]?.user
                        ? 'ring-2 ring-amber-400/80 shadow-[0_0_16px_rgba(251,191,36,0.35)] bg-gradient-to-b from-amber-500/20 to-slate-900/40'
                        : 'border-2 border-dashed border-amber-400/50 bg-black/20 hover:border-amber-300'
                    }`}
                  >
                    {seats[0]?.user ? (
                      <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900">
                        <AvatarRenderer config={seats[0].user.avatarConfig} className="w-full h-full" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-amber-300/80">
                        <span className="text-xl font-light leading-none">+</span>
                        <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wider text-amber-300/60">Sunucu</span>
                      </div>
                    )}

                    {/* Host Crown Badge */}
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-600 flex items-center justify-center shadow-lg border border-amber-200">
                      <Crown className="w-3.5 h-3.5 text-slate-950 fill-amber-100" />
                    </div>

                    {/* Speaking Equalizer Micro Indicator */}
                    {seats[0]?.isSpeaking && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-emerald-500 text-[8px] font-black text-white flex items-center gap-0.5 shadow-md animate-pulse">
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce" />
                        <span className="w-1 h-2.5 bg-white rounded-full animate-bounce delay-75" />
                        <span className="w-1 h-2 bg-white rounded-full animate-bounce delay-150" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-1 flex items-center gap-0.5 max-w-[80px] justify-center">
                  <span className="text-[11px] font-black text-white truncate text-center">
                    {seats[0]?.user ? seats[0].user.username : (roomHost?.username || 'Oda Sahibi')}
                  </span>
                  {seats[0]?.user && (
                    <CharmBadge level={getCharmInfo(seats[0].user.charm).level || 2} size="xs" />
                  )}
                </div>
              </div>

              {/* Connecting Audio Soundwave Line */}
              <div className="flex items-center text-cyan-300/60 text-xs font-mono select-none px-1 animate-pulse">
                ~/\~
              </div>

              {/* Co-Host Podium (Seat 1: HanımAğA 💎8) */}
              {renderGuestSeat(1)}
            </div>

            {/* ═══ ROW 2: 4 GUEST SEATS (Seats 2, 3, 4, 5) with Soundwaves ═══ */}
            <div className="w-full max-w-[340px] px-1 mt-2 flex items-center justify-between">
              {renderGuestSeat(2)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(3)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(4)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(5)}
            </div>

            {/* ═══ ROW 3: 4 GUEST SEATS (Seats 6, 7, 8, 9) with Soundwaves ═══ */}
            <div className="w-full max-w-[340px] px-1 mt-2 flex items-center justify-between">
              {renderGuestSeat(6)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(7)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(8)}
              <span className="text-cyan-300/50 text-[9px] font-mono select-none animate-pulse">~/\~</span>
              {renderGuestSeat(9)}
            </div>

            {/* ═══ ROW 4: VIP ARC ROW (Seat 10, Crown, Seat 11, Crown, Crown) matching media_1790339116030.jpg ═══ */}
            <div className="w-full max-w-[280px] px-2 mt-1.5 flex items-center justify-around">
              {renderGuestSeat(10)}

              {/* VIP Velvet Crown Seat Cushion */}
              <div 
                onClick={() => handleSeatClick(11)}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition"
              >
                <div className="w-8 h-6 rounded-xl bg-gradient-to-b from-purple-800 via-indigo-950 to-slate-950 border border-purple-400/50 shadow flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
                </div>
              </div>

              {renderGuestSeat(11)}

              {/* VIP Velvet Crown Seat Cushion */}
              <div 
                onClick={() => handleSeatClick(11)}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition"
              >
                <div className="w-8 h-6 rounded-xl bg-gradient-to-b from-purple-800 via-indigo-950 to-slate-950 border border-purple-400/50 shadow flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
                </div>
              </div>

              {/* VIP Velvet Crown Seat Cushion */}
              <div 
                onClick={() => handleSeatClick(11)}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition"
              >
                <div className="w-8 h-6 rounded-xl bg-gradient-to-b from-purple-800 via-indigo-950 to-slate-950 border border-purple-400/50 shadow flex items-center justify-center">
                  <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ LOWER HALF: LIVE CHAT (LEFT ~72%) & ACTION BUTTONS (RIGHT ~28%) SIDE-BY-SIDE ═══ */}
      {/* Asla koltuklarla çakışmaz, tam olarak media_1790339116030.jpg ve media_1790339116035.jpg ile birebir uyumlu */}
      <div className="relative z-10 flex-1 min-h-0 flex items-end px-3 pb-1 pt-0.5 gap-2 overflow-hidden">
        {/* SOL: Canlı Sohbet Mesajları Akışı */}
        <div className="flex-1 h-full min-h-[90px] max-h-[175px] overflow-y-auto space-y-1.5 no-scrollbar flex flex-col text-xs">
          {/* Odaya Biri Girdiğinde 2 Saniyelik Kayan Bildirim [ Laraッ geldi ] */}
          {userJoinToast && (
            <div className="self-start inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#101c38]/95 border border-cyan-400/60 text-xs font-bold text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-in slide-in-from-left duration-200 fade-in my-0.5">
              <span className="text-cyan-300 font-extrabold">{userJoinToast.username}</span>
              <span className="text-slate-300 font-normal text-[11px]">geldi</span>
            </div>
          )}

          {/* Oda Hoş Geldiniz Mesajı */}
          <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-[10px] text-cyan-200 backdrop-blur-md mb-0.5">
            <span>✨</span>
            <span>Sohbet Odasına Hoş Geldiniz! Saygılı sohbetler dileriz.</span>
          </div>

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`self-start inline-flex items-center gap-1.5 px-2.5 py-1 rounded-2xl backdrop-blur-md max-w-[95%] text-xs shadow-sm transition-all ${
                msg.isGift
                  ? 'bg-gradient-to-r from-pink-500/25 via-purple-500/20 to-pink-500/25 border border-pink-400/40 text-pink-200'
                  : msg.isSystem
                  ? 'bg-amber-500/15 border border-amber-400/30 text-amber-200 font-medium'
                  : 'bg-black/50 border border-white/[0.08] text-slate-100'
              }`}
            >
              {msg.isGift ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-pink-300 font-bold">Gönder: {msg.receiver || (roomHost?.username || 'Oda Sahibi')}</span>
                    <span className="text-white font-medium">{msg.text}</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold mt-0.5">
                    Alıcı Cazibe Değeri +{msg.charmGain || 1} elde etti
                  </span>
                </div>
              ) : (
                <>
                  {!msg.isSystem && (
                    <span className="text-cyan-300 font-bold shrink-0">{msg.sender}:</span>
                  )}
                  <span className="break-words leading-tight">{msg.text}</span>
                </>
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>

        {/* SAĞ: Hızlı Aksiyon Butonları Kolonu (media_1790339116030.jpg & media_1790339116035.jpg) */}
        <div className="flex flex-col items-center gap-2 shrink-0 pb-0.5">
          {/* 1. Pink Mikrofonu... Butonu */}
          <div 
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition" 
            onClick={() => {
              soundFX.playPop();
              setShowMicWaitlistModal(true);
            }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 border border-pink-200/80 shadow-[0_4px_12px_rgba(244,63,94,0.4)] flex items-center justify-center text-white text-base">
              🛋️
            </div>
            <span className="text-[9px] font-black text-white/95 mt-0.5 tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap">
              Mikrofonu...
            </span>
          </div>

          {/* 2. Orman Yarışı (Büyük Kazanan / Çark) */}
          <div 
            className="flex flex-col items-center cursor-pointer group active:scale-95 transition"
            onClick={() => {
              soundFX.playPop();
              setShowLuckyWheel(true);
            }}
          >
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-900 p-0.5 shadow-[0_4px_12px_rgba(245,158,11,0.4)] border border-amber-200">
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                <span className="text-base">🦁</span>
              </div>
            </div>
            <span className="text-[8px] font-black text-amber-200 mt-0.5 tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap">
              Orman Yarışı
            </span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-white" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
              <span className="w-1 h-1 rounded-full bg-white/40" />
            </div>
          </div>

          {/* 3. BİNGO Widget (media_1790339116030.jpg) */}
          <div
            className="cursor-pointer active:scale-95 transition"
            onClick={() => {
              soundFX.playPop();
              setShowBingo(true);
            }}
          >
            <div className="w-11 h-12 rounded-2xl bg-gradient-to-b from-[#4d1d95] via-[#3b0764] to-[#240046] border border-purple-400/60 shadow-[0_4px_12px_rgba(126,34,206,0.5)] flex flex-col items-center justify-center p-1 text-white">
              <span className="text-[10px] font-black tracking-wide text-white drop-shadow">
                BİNGO
              </span>
              <div className="flex items-center gap-0.5 text-[9px] text-purple-200 font-bold mt-0.5">
                <Users className="w-2.5 h-2.5 text-purple-300" />
                <span>{bingoPlayerCount}</span>
              </div>
            </div>
          </div>

          {/* 4. Mini Kırmızı Zarf (Varsa) */}
          {activeRedPacket && (
            <div
              className="flex flex-col items-center cursor-pointer group active:scale-95 transition animate-in zoom-in-75 duration-200"
              onClick={() => {
                soundFX.playPop();
                setShowRedPacketCountdownModal(true);
              }}
            >
              <div className="relative w-9 h-11 rounded-xl bg-gradient-to-b from-[#f95a37] to-[#d8260c] border border-amber-300/80 shadow-[0_4px_12px_rgba(239,68,68,0.6)] flex flex-col items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-amber-300 border border-white flex items-center justify-center text-[6px] text-stone-900 font-black shadow-sm">
                  ★
                </div>
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border border-white text-[8px] font-black text-white flex items-center justify-center shadow">
                  1
                </div>
              </div>
              <span className="text-[9px] font-black text-amber-300 mt-0.5 font-mono tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
                {redPacketCountdown > 0 ? `${redPacketCountdown}s` : 'AÇ'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ═══ FLOATING ISLAND BOTTOM CONTROL DOCK ═══ */}
      <div className="relative z-20 px-3 pb-[max(calc(env(safe-area-inset-bottom,0px)+8px),14px)] pt-1 flex-shrink-0">
        {/* Background Music Micro-Controller Strip (if music is enabled) */}
        {bgMusicEnabled && (
          <div className="mb-2 px-3 py-1.5 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-lg">
            <span className="text-[10px] text-emerald-400 font-bold whitespace-nowrap shrink-0 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              🎵 BGM:
            </span>
            {(audioResources as { id: string; name: string; url: string; volume: number }[]).map(track => (
              <button
                key={track.id}
                onClick={() => {
                  soundFX.playPop();
                  setBgTrackId(track.id);
                }}
                className={`px-2.5 py-0.5 rounded-xl text-[10px] font-bold whitespace-nowrap shrink-0 transition ${
                  bgTrackId === track.id
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-white/[0.08] text-slate-300 hover:bg-white/[0.15]'
                }`}
              >
                {track.name}
              </button>
            ))}
          </div>
        )}

        <div className="p-2 rounded-3xl bg-[#0c142b]/90 backdrop-blur-2xl border border-white/[0.12] shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center gap-2">
          {/* Horn / Mic Broadcast Toggle Button 📢 matching media_1790339116030.jpg */}
          <button
            onClick={() => {
              soundFX.playPop();
              const nextMuted = !isMyMicMuted;
              setIsMyMicMuted(nextMuted);
              voiceWebRTC.setMuted(nextMuted);
            }}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition active:scale-95 shadow-md shrink-0 ${
              isMyMicMuted
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-400'
                : 'bg-gradient-to-tr from-purple-600 to-indigo-600 border border-purple-400/50 text-white shadow-purple-500/30'
            }`}
            title={isMyMicMuted ? 'Mikrofonu Aç' : 'Mikrofonu Kapat'}
          >
            {isMyMicMuted ? <MicOff className="w-4 h-4" /> : <Radio className="w-4 h-4 text-purple-200" />}
          </button>

          {/* Quick Chat Input matching media_1790339116030.jpg: "Bir şeyler yaz" */}
          <div className="flex-1 min-w-0 flex items-center bg-white/[0.07] hover:bg-white/[0.1] focus-within:bg-white/[0.12] rounded-full px-4 py-2 border border-white/10 transition-colors">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Bir şeyler yaz"
              className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-400 w-full font-medium"
            />
            <button
              onClick={handleSendMessage}
              className="text-cyan-400 hover:text-cyan-300 active:scale-90 transition p-0.5 shrink-0"
              title="Gönder"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gift Button 🎁 */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowGiftModal(true);
            }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 border border-pink-300/50 flex items-center justify-center text-white shadow-md shadow-pink-500/30 active:scale-95 transition shrink-0"
            title="Hediye Gönder"
          >
            <Gift className="w-4 h-4" />
          </button>

          {/* Canlı Uçan Kalp & Emoji Tepkileri (Floating Reactions) ❤️ */}
          <FloatingReactions roomId={roomId} currentUserId={currentUser.id} />

          {/* Backpack Button 🎒 */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowBackpack(true);
            }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-800 to-indigo-900 border border-purple-400/40 flex items-center justify-center text-white shadow-md shadow-purple-900/30 active:scale-95 transition shrink-0"
            title="Sırt Çantası"
          >
            <span className="text-base">🎒</span>
          </button>

          {/* Room Tools & Fun / Crest Button 🛡️ */}
          <button
            onClick={() => {
              soundFX.playPop();
              setShowGameFunModal(true);
            }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-600/30 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md active:scale-95 transition shrink-0"
            title="Oda Araçları & Eğlence"
          >
            <Shield className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          1. OYUN EĞLENCESİ & ODA ARAÇLARI BOTTOM SHEET (media_1790119498030)
         ════════════════════════════════════════════════════════════════════ */}
      {showGameFunModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#181b24] rounded-t-3xl p-5 border-t border-white/10 shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-200">
            {/* Header / Kapat */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Oyun eğlencesi</span>
              <button onClick={() => setShowGameFunModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Oyun Eğlencesi İkonları */}
            <div className="grid grid-cols-5 gap-3 text-center">
              {[
                {
                  name: 'Kırmızı Zarf',
                  icon: '🧧',
                  color: 'bg-red-500/20 text-red-400',
                  action: () => {
                    setShowGameFunModal(false);
                    setShowRedPacketSendModal(true);
                  }
                },
                {
                  name: 'Çizmek',
                  icon: '🎨',
                  color: 'bg-orange-500/20 text-orange-400',
                  action: () => {
                    setShowGameFunModal(false);
                    sendRoomChatMessage(roomId, { sender: 'Sistem', text: `🎨 ${currentUser.username} Çizim odası başlattı!`, isSystem: true });
                  }
                },
                {
                  name: 'Büyük kazanan',
                  icon: '🎡',
                  color: 'bg-pink-500/20 text-pink-400',
                  action: () => {
                    setShowGameFunModal(false);
                    setShowLuckyWheel(true);
                  }
                },
                {
                  name: 'Bingo',
                  icon: '🎱',
                  color: 'bg-purple-500/20 text-purple-400',
                  action: () => {
                    setShowGameFunModal(false);
                    soundFX.playPop();
                    setShowBingo(true);
                  }
                },
                {
                  name: 'Sırt çantası',
                  icon: '🎒',
                  color: 'bg-amber-500/20 text-amber-400',
                  action: () => {
                    setShowGameFunModal(false);
                    setShowBackpack(true);
                  }
                },
              ].map(item => (
                <div
                  key={item.name}
                  onClick={() => {
                    soundFX.playPop();
                    item.action();
                  }}
                  className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center text-2xl shadow-sm border border-white/5`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] text-slate-300 font-medium leading-tight">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Oda Araçları */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Oda Araçları</span>
              <div className="grid grid-cols-6 gap-2 text-center">
                {[
                  {
                    name: 'Piyango',
                    icon: '🎟️',
                    action: () => {
                      setShowLuckyWheel(true);
                    }
                  },
                  {
                    name: 'PK',
                    icon: '⚔️',
                    action: () => {
                      setShowPKBattle(true);
                    }
                  },
                  {
                    name: 'Müzik',
                    icon: '🎵',
                    action: () => {
                      soundFX.playGiftFanfare();
                      sendRoomChatMessage(roomId, {
                        sender: 'Sistem',
                        text: `🎵 ${currentUser.username} odada arka plan parti müziği başlattı!`,
                        isSystem: true,
                      });
                    }
                  },
                  {
                    name: 'Ses efekti',
                    icon: '🔊',
                    action: () => {
                      soundFX.playHorn();
                      sendRoomChatMessage(roomId, {
                        sender: 'Sistem',
                        text: `📢 ${currentUser.username} ses efekti çaldı!`,
                        isSystem: true,
                      });
                    }
                  },
                  {
                    name: 'Mikrofon Sırası',
                    icon: '🎙️',
                    action: () => {
                      soundFX.playPop();
                      setRoomSettingsModalItem({
                        title: 'Mikrofon Sırası Listesi',
                        icon: '🎙️',
                        description: `Aktif Konuşmacılar: ${seats.filter(s => s.user).length}/8\nSırada Bekleyen: 0 kişi\n\nHerkes sırayla 60 saniye serbest konuşma hakkına sahiptir.`
                      });
                    }
                  },
                  {
                    name: 'Puan tablosu',
                    icon: '⏱️',
                    action: () => {
                      soundFX.playPop();
                      setRoomSettingsModalItem({
                        title: 'Oda Canlı Puan Tablosu',
                        icon: '⏱️',
                        description: `1. 👑 ${currentUser.username} — 1.450 Puan (Oda Lideri)\n2. 🌟 Melisa_06 — 820 Puan\n3. 💎 RIGBY — 410 Puan\n4. ✨ Berat — 190 Puan`
                      });
                    }
                  },
                ].map(tool => (
                  <div
                    key={tool.name}
                    onClick={() => {
                      soundFX.playPop();
                      setShowGameFunModal(false);
                      tool.action();
                    }}
                    className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-xl border border-white/5">
                      {tool.icon}
                    </div>
                    <span className="text-[9px] text-slate-300 truncate max-w-[48px]">{tool.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Canlı Ses Efektleri (Soundboard) 🎙️ */}
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>Canlı Ses Efektleri (Soundboard)</span>
                </span>
                <span className="text-[10px] text-pink-300 font-semibold bg-pink-500/20 px-2 py-0.5 rounded-full border border-pink-400/30">
                  Odadakiler Canlı Duyar
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center">
                {[
                  { name: 'Alkış', icon: '👏', type: 'applause' as const, color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  { name: 'Kahkaha', icon: '😂', type: 'laugh' as const, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
                  { name: 'Kutlama', icon: '🎺', type: 'cheer' as const, color: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
                  { name: 'Ejderha', icon: '🐉', type: 'dragon' as const, color: 'bg-red-500/20 text-red-300 border-red-500/30' },
                  { name: 'Spor Gazı', icon: '🏎️', type: 'car' as const, color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
                ].map(sfx => (
                  <button
                    key={sfx.name}
                    onClick={() => handlePlaySoundboardSFX(sfx.type)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl ${sfx.color} border active:scale-90 transition shadow-sm hover:brightness-125`}
                  >
                    <span className="text-xl">{sfx.icon}</span>
                    <span className="text-[10px] font-bold truncate w-full">{sfx.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          2. ÇEVRİMİÇİ & ÜYE LİSTESİ MODAL (media_1790119498031 / 037)
         ════════════════════════════════════════════════════════════════════ */}
      {showMembersModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white text-gray-900 rounded-t-3xl p-5 shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* Header: Çevrimiçi 1 | Üye 4 | Katkı sekmeleri */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setActiveMemberTab('online')}
                  className={`text-sm font-bold pb-1 transition ${
                    activeMemberTab === 'online' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-400'
                  }`}
                >
                  Çevrimiçi {liveOnlineCount}
                </button>
                <button
                  onClick={() => setActiveMemberTab('members')}
                  className={`text-sm font-bold pb-1 transition ${
                    activeMemberTab === 'members' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-400'
                  }`}
                >
                  Üye {Math.max(roomMembers.length, roomMemberCount)}
                </button>
                <button
                  onClick={() => setActiveMemberTab('contrib')}
                  className={`text-sm font-bold pb-1 transition ${
                    activeMemberTab === 'contrib' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-gray-400'
                  }`}
                >
                  Katkı
                </button>
              </div>

              <button onClick={() => setShowMembersModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Arama Barı */}
            <div className="my-3">
              <div className="bg-gray-100 rounded-2xl px-3.5 py-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı adı veya ID ara"
                  className="bg-transparent border-none outline-none text-xs text-gray-800 placeholder-gray-400 w-full"
                />
              </div>
            </div>

            {/* Kullanıcı Listesi */}
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
              {activeMemberTab === 'online' && (
                liveOnlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <AvatarRenderer config={user.avatarConfig || currentUser.avatarConfig} className="w-full h-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{user.username}</span>
                          {user.isHost && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-gray-400">{user.roleText}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-emerald-500 font-bold">çevrimiçi</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isHost && user.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            soundFX.playPop();
                            const seatMatch = seats.find(s => s.user?.id === user.id);
                            setSelectedUserForManage({
                              user: { id: user.id, username: user.username, avatarConfig: user.avatarConfig || currentUser.avatarConfig } as any,
                              seatIndex: seatMatch?.seatIndex
                            });
                            setShowMembersModal(false);
                          }}
                          className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold active:scale-95"
                        >
                          Yönet
                        </button>
                      )}

                      <button
                        onClick={() => {
                          soundFX.playPop();
                          const seatMatch = seats.find(s => s.user?.id === user.id);
                          if (seatMatch) setSelectedSeatForGift(seatMatch.seatIndex);
                          setShowMembersModal(false);
                          setShowGiftModal(true);
                        }}
                        className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-200 text-xs font-bold active:scale-95"
                      >
                        Hediye Et
                      </button>
                    </div>
                  </div>
                ))
              )}

              {activeMemberTab === 'members' && (
                roomMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                        <AvatarRenderer config={member.avatarConfig || currentUser.avatarConfig} className="w-full h-full" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-gray-900">{member.username}</span>
                          {member.isHost && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-gray-400">{member.role}</span>
                          <span className="text-[10px] text-gray-300">•</span>
                          <span className="text-[10px] text-emerald-500 font-bold">{member.activeText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          soundFX.playPop();
                          setShowMembersModal(false);
                          setShowGiftModal(true);
                        }}
                        className="px-3 py-1 rounded-full bg-pink-50 text-pink-600 border border-pink-200 text-xs font-bold active:scale-95"
                      >
                        Hediye Et
                      </button>
                    </div>
                  </div>
                ))
              )}

              {activeMemberTab === 'contrib' && (
                <div className="space-y-2 py-2">
                  {[
                    { rank: 1, name: currentUser.username, charm: 2450, badge: '👑 VIP 1' },
                    { rank: 2, name: roomHost?.username || 'Oda Sahibi', charm: 1820, badge: '💎 VIP 2' },
                  ].map((c) => (
                    <div key={c.rank} className="flex items-center justify-between p-2 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                          {c.rank}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-gray-900">{c.name}</span>
                          <span className="text-[10px] text-amber-600 block font-semibold">{c.badge}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-amber-600 font-mono">
                        +{c.charm.toLocaleString('tr-TR')} Cazibe
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ODA SAHİBİ YÖNETİM MODALI (Ayağa Kaldır & Odadan At)
         ════════════════════════════════════════════════════════════════════ */}
      {selectedUserForManage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12162a] rounded-3xl p-5 w-full max-w-sm border border-slate-700/60 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-black text-white">Kullanıcı Yönetimi (Oda Sahibi)</h3>
              </div>
              <button
                onClick={() => setSelectedUserForManage(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kullanıcı Profili Özeti */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-cyan-400 flex items-center justify-center shrink-0">
                <AvatarRenderer config={selectedUserForManage.user.avatarConfig} className="w-full h-full" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">{selectedUserForManage.user.username}</h4>
                <span className="text-[11px] text-slate-400">
                  {selectedUserForManage.seatIndex !== undefined && selectedUserForManage.seatIndex >= 0
                    ? `${selectedUserForManage.seatIndex}. Koltukta Oturuyor`
                    : 'Dinleyici'}
                </span>
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="space-y-2 pt-1">
              {/* Koltuktan İndir (Ayağa Kaldır) */}
              {selectedUserForManage.seatIndex !== undefined && selectedUserForManage.seatIndex >= 0 && (
                <button
                  onClick={() => handleKickFromSeat(selectedUserForManage.seatIndex!, selectedUserForManage.user)}
                  className="w-full py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-black flex items-center justify-center gap-2 active:scale-98 transition shadow"
                >
                  <span>🪑</span>
                  <span>Ayağa Kaldır (Koltuktan İndir)</span>
                </button>
              )}

              {/* Odadan At (Kick) */}
              <button
                onClick={() => handleKickFromRoom(selectedUserForManage.user, selectedUserForManage.seatIndex)}
                className="w-full py-3 rounded-2xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/40 text-xs font-black flex items-center justify-center gap-2 active:scale-98 transition shadow"
              >
                <span>🚫</span>
                <span>Odadan At (Sohbetten Çıkar)</span>
              </button>

              {/* Hediye Gönder */}
              <button
                onClick={() => {
                  setSelectedSeatForGift(selectedUserForManage.seatIndex ?? 0);
                  setSelectedUserForManage(null);
                  setShowGiftModal(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-400/40 text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <Gift className="w-4 h-4" />
                <span>Hediye Gönder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          3. ODA AYARLARI TAM EKRAN SAYFASI (media_1790119498104 / 106)
         ════════════════════════════════════════════════════════════════════ */}
      {showRoomSettings && (
        <div className="fixed inset-0 z-50 bg-white text-gray-800 flex flex-col overflow-y-auto no-scrollbar">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white sticky top-0 z-10">
            <button
              onClick={() => setShowRoomSettings(false)}
              className="p-1 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-gray-900">Oda ayarları</h2>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white pb-10">
            {/* Grup 1: Oda Bilgileri */}
            <div className="border-b border-gray-100">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Oda ismi</span>
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={roomTitle}
                    onChange={e => setRoomTitle(e.target.value)}
                    className="text-sm text-gray-500 text-right bg-transparent outline-none max-w-[150px] font-medium"
                  />
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Oda Kapak Fotoğrafı</span>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-900 border border-gray-200 flex items-center justify-center text-xs text-white">
                    SOHBET
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Oda duyurusu */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  const note = prompt('Yeni oda duyurusu girin:', roomAnnouncement);
                  if (note && note.trim()) {
                    setRoomAnnouncement(note.trim());
                    sendRoomChatMessage(roomId, {
                      sender: 'Sistem',
                      text: `📢 Yeni Oda Duyurusu: "${note.trim()}"`,
                      isSystem: true,
                    });
                  }
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda duyurusu</span>
                <div className="flex items-center gap-1 max-w-[170px]">
                  <span className="text-xs text-gray-500 truncate">{roomAnnouncement}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>
              </div>

              {/* Oda modu */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  const modes: Array<'Normal' | 'Sohbet' | 'Oyun' | 'Parti'> = ['Normal', 'Sohbet', 'Oyun', 'Parti'];
                  const nextIdx = (modes.indexOf(roomMode) + 1) % modes.length;
                  setRoomMode(modes[nextIdx]);
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda modu</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-cyan-600 font-bold">{roomMode}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Oda etiketi */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  const tags: Array<'Sohbet' | 'Müzik' | 'Oyun' | 'Arkadaşlık'> = ['Sohbet', 'Müzik', 'Oyun', 'Arkadaşlık'];
                  const nextIdx = (tags.indexOf(roomTag) + 1) % tags.length;
                  setRoomTag(tags[nextIdx]);
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda etiketi</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-purple-600 font-bold">#{roomTag}</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Oda arka planı */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  const bgs: Array<'deep_blue' | 'galaxy' | 'sunset' | 'cyberpunk'> = ['deep_blue', 'galaxy', 'sunset', 'cyberpunk'];
                  const nextIdx = (bgs.indexOf(roomBg) + 1) % bgs.length;
                  setRoomBg(bgs[nextIdx]);
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda arka planı</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600 font-medium">
                    {roomBg === 'deep_blue' ? 'Derin Mavi' : roomBg === 'galaxy' ? 'Galaksi Mor' : roomBg === 'sunset' ? 'Gün Batımı' : 'Zümrüt Yeşil'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Partner Koltuğu */}
              <div
                onClick={() => {
                  soundFX.playPop();
                  setPartnerSeatEnabled(!partnerSeatEnabled);
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Partner Koltuğu</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 font-medium">
                    {partnerSeatEnabled ? '❤️ Çift Koltuğu Aktif' : 'Normal Koltuk'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
            </div>

            <div className="h-2.5 bg-gray-50" />

            {/* Grup 2: Toggles (Anahtarlar) */}
            <div className="border-b border-gray-100">
              {/* Oda Yüksek Kalite Modu */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Oda Yüksek Kalite Modu</span>
                <button
                  onClick={() => setRoomQualityHigh(!roomQualityHigh)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    roomQualityHigh ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      roomQualityHigh ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Genel sohbeti devre dışı bırak */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Genel sohbeti devre dışı bırak</span>
                <button
                  onClick={() => setDisableChat(!disableChat)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    disableChat ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      disableChat ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Resim göndermeyi devre dışı bırak */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Resim göndermeyi devre dışı bırak</span>
                <button
                  onClick={() => setDisableImages(!disableImages)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    disableImages ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      disableImages ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Kırmızı zarfları devre dışı bırak */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                <span className="text-sm text-gray-800">Kırmızı zarfları devre dışı bırak</span>
                <button
                  onClick={() => setDisableRedPackets(!disableRedPackets)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    disableRedPackets ? 'bg-cyan-500' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      disableRedPackets ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Oda şifresi */}
              <div className="px-4 py-4 border-b border-gray-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">Oda şifresi koruması</span>
                  <button
                    onClick={() => setHasRoomPassword(!hasRoomPassword)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      hasRoomPassword ? 'bg-cyan-500' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        hasRoomPassword ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {hasRoomPassword && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="4-6 haneli şifre belirleyin"
                      className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 bg-gray-50 outline-none w-full"
                    />
                    <span className="text-[10px] text-cyan-600 font-bold whitespace-nowrap">Aktif 🔒</span>
                  </div>
                )}
              </div>

              {/* Admin etkinlikleri yönetir */}
              <div className="px-4 py-4 border-b border-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-800">Admin etkinlikleri yönetir</span>
                  <button
                    onClick={() => setAdminManageEvents(!adminManageEvents)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      adminManageEvents ? 'bg-cyan-500' : 'bg-gray-200'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        adminManageEvents ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Açıldıktan sonra, etkinlik merkezinde oda yöneticilerinin odanız için etkinlik oluşturmasını ve onların oluşturdukları etkinlikleri silmesini destekleyin.
                </p>
              </div>
            </div>

            <div className="h-2.5 bg-gray-50" />

            {/* Grup 3: Liste Maddeleri */}
            <div>
              <div
                onClick={() => {
                  soundFX.playPop();
                  setRoomSettingsModalItem({
                    title: 'Hayran Ücreti & Giriş',
                    icon: '🎟️',
                    description: 'Odanız şu anda tüm oyuncular için ücretsiz ve halka açıktır. İlerleyen güncellemelerde VIP giriş biletleri eklenecektir.'
                  });
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Hayran Ücret</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-emerald-600 font-bold">Ücretsiz</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div
                onClick={() => {
                  soundFX.playPop();
                  setRoomSettingsModalItem({
                    title: 'Oda Yöneticileri (Adminler)',
                    icon: '🛡️',
                    description: `Oda Sahibi: ${currentUser.username}. Şu anda odaya atanmış 0 yardımcı yönetici bulunmaktadır.`
                  });
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda admini</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">1 Yönetici</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div
                onClick={() => {
                  soundFX.playPop();
                  setRoomSettingsModalItem({
                    title: 'Engellenenler Listesi',
                    icon: '🚫',
                    description: 'Bu odada şu anda engellenmiş kullanıcı bulunmamaktadır.'
                  });
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Engellenenler Listesi</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">Temiz</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              <div
                onClick={() => {
                  soundFX.playPop();
                  setRoomSettingsModalItem({
                    title: 'İşlem Kaydı',
                    icon: '📋',
                    description: `Son İşlemler:\n• ${currentUser.username} odayı başlattı\n• Ses modu stereo yüksek kalite olarak ayarlandı\n• Koltuk mikrofonları aktif edildi.`
                  });
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">İşlem Kaydı</span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>

              <div
                onClick={() => {
                  soundFX.playPop();
                  navigator.clipboard?.writeText('Q120407');
                  alert('Oda Numarası (Q120407) panoya kopyalandı!');
                }}
                className="flex items-center justify-between px-4 py-4 border-b border-gray-50 cursor-pointer active:bg-gray-50"
              >
                <span className="text-sm text-gray-800">Oda numarası</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-cyan-600 font-mono font-bold">ID: Q120407</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>

              {/* Oda Sahibi için Odayı Silme Butonu */}
              {isHost && (
                <div className="p-4 pt-6">
                  <button
                    onClick={() => {
                      setShowRoomSettings(false);
                      handleDeleteRoomInside();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 active:scale-95 border border-red-500/30 text-red-500 font-bold text-sm flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Odayı Kapat ve Sil</span>
                  </button>
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    {isPermanentRoom 
                      ? 'Kalıcı odanızı sildiğinizde oda listesinden tamamen kaldırılır.'
                      : 'Ücretsiz oda siz çıktığınızda da otomatik olarak kapanıp silinir.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          4. WEPLAY MODERN HEDİYE ÇEKMECESİ (media_1790219957028.jpg)
         ════════════════════════════════════════════════════════════════════ */}
      {showGiftModal && (() => {
        const selectedGift = ROOM_GIFTS.find(g => g.id === selectedGiftId) || ROOM_GIFTS[0];
        const targetSpeakers = seats.filter(s => s.user && s.user.id !== currentUser.id);
        const effectiveTargetCount = giftTargetMode === 'all_speakers' ? Math.max(1, targetSpeakers.length) : 1;
        const totalGiftCost = (selectedGift?.price || 0) * giftMultiplier * effectiveTargetCount;
        const maxGiftPrice = Math.max(...ROOM_GIFTS.map(g => g.price));
        const isMostExpensiveGift = (selectedGift?.price || 0) === maxGiftPrice;

        const displayedGifts = selectedGiftCategory === 'all'
          ? ROOM_GIFTS
          : ROOM_GIFTS.filter(g => g.category === selectedGiftCategory);

        return (
          <div 
            onClick={() => {
              setShowGiftModal(false);
              setShowMultiplierDropdown(false);
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-fadeIn"
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowMultiplierDropdown(false);
              }}
              className="bg-[#12152a]/95 backdrop-blur-xl rounded-t-[32px] border-t border-pink-500/20 shadow-2xl p-4 sm:p-5 w-full max-w-lg mx-auto flex flex-col space-y-3.5 max-h-[88vh] animate-in slide-in-from-bottom duration-200"
            >
              {/* Header: Alıcı Seçimi & Kapat */}
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar max-w-[85%]">
                  {/* Tüm Konuşmacılar Seçeneği */}
                  <button
                    type="button"
                    onClick={() => setGiftTargetMode('all_speakers')}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 shrink-0 ${
                      giftTargetMode === 'all_speakers'
                        ? 'bg-pink-500 border-pink-400 text-white shadow-md shadow-pink-500/30'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🎙️</span>
                    <span>Tüm Konuşmacılar {targetSpeakers.length > 0 ? `(${targetSpeakers.length})` : ''}</span>
                  </button>

                  {/* Tekil Koltuk / Konuşmacı Seçenekleri */}
                  {seats.map(s => {
                    const hasUser = !!s.user;
                    const isHostSeat = s.seatIndex === 0;
                    if (!hasUser && !isHostSeat) return null;
                    const isSelected = giftTargetMode === 'single' && selectedSeatForGift === s.seatIndex;
                    const name = s.user ? (s.user.id === currentUser.id ? `${s.user.username} (Sen)` : s.user.username) : 'Oda Sahibi';

                    return (
                      <button
                        key={s.seatIndex}
                        type="button"
                        onClick={() => {
                          setGiftTargetMode('single');
                          setSelectedSeatForGift(s.seatIndex);
                        }}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 shrink-0 ${
                          isSelected
                            ? 'bg-pink-500 border-pink-400 text-white shadow-md shadow-pink-500/30'
                            : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        <span>{isHostSeat ? '👑' : '🎙️'}</span>
                        <span className="truncate max-w-[75px]">{name}</span>
                      </button>
                    );
                  })}
                </div>

                <button 
                  onClick={() => setShowGiftModal(false)} 
                  className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kategori Tabları (Paket, Hediye, Özel, VIP, Etkinlik) */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { key: 'all', label: 'Paket' },
                  { key: 'popular', label: 'Hediye' },
                  { key: 'special', label: 'Özel' },
                  { key: 'vip', label: 'VIP' },
                  { key: 'event', label: 'Etkinlik' },
                ].map(tab => {
                  const isActive = selectedGiftCategory === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedGiftCategory(tab.key as any)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                        isActive
                          ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Hediye Izgarası (4 Sütun x N Satır) */}
              <div className="grid grid-cols-4 gap-2.5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
                {displayedGifts.map(gift => {
                  const isSelected = selectedGiftId === gift.id;
                  return (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGiftId(gift.id)}
                      className={`relative p-2 rounded-2xl flex flex-col items-center justify-between transition-all active:scale-95 group ${
                        isSelected
                          ? 'border-2 border-pink-500 bg-pink-500/15 shadow-[0_0_18px_rgba(236,72,153,0.35)] scale-[1.02]'
                          : 'border border-white/[0.06] bg-[#181c36]/90 hover:bg-[#202547] hover:border-pink-500/30'
                      }`}
                    >
                      {/* Sol Üst Rozet / Etiket */}
                      {gift.badge && (
                        <div className="absolute top-1 left-1 z-10">
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm ${
                            gift.badge === 'Mitolojik 🌸'
                              ? 'bg-gradient-to-r from-pink-500 via-rose-400 to-amber-300 text-white animate-pulse'
                              : gift.badge === 'VIP' || gift.badge === 'Lüks'
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : gift.badge === 'Piyango'
                              ? 'bg-purple-500 text-white'
                              : 'bg-rose-500/90 text-white'
                          }`}>
                            {gift.badge}
                          </span>
                        </div>
                      )}

                      {/* Sağ Üst: 200 Gold Üstü İçin 1.5X İade Şansı Rozeti */}
                      {gift.price > 200 && (
                        <div className="absolute top-1 right-1 z-10">
                          <span className="text-[7.5px] font-black px-1 py-0.2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 shadow-sm flex items-center gap-0.5 font-mono">
                            <span>🎰</span>
                            <span>1.5X</span>
                          </span>
                        </div>
                      )}

                      {/* Sanatsal Işıltılı Hediye Görseli */}
                      <div className="w-14 h-14 flex items-center justify-center my-1 group-hover:scale-105 transition-transform">
                        <GiftVisualRenderer giftName={gift.name} size="md" animated={isSelected} />
                      </div>

                      {/* İsim ve Fiyat */}
                      <span className="text-[10px] font-bold text-white truncate max-w-[65px] text-center">
                        {gift.name}
                      </span>
                      <div className="flex items-center gap-0.5 mt-0.5 text-amber-300 text-[10px] font-bold font-mono">
                        <span>🪙</span>
                        <span>{gift.price.toLocaleString('tr-TR')}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 200 Gold Üzeri Şanslı İade Göstergesi */}
              {(selectedGift.price > 200 || totalGiftCost > 200) && (
                <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-between text-[11px] text-amber-300">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-sm">🎰</span>
                    <span>Şanslı Geri Ödeme:</span>
                  </div>
                  <div className="font-mono font-black text-amber-200 text-xs">
                    %10 Şansla %150 (+{(Math.floor(totalGiftCost * 1.5)).toLocaleString('tr-TR')} 🪙) veya %0-60 Teselli İadesi!
                  </div>
                </div>
              )}

              {/* En Pahalı Hediyeye Özel Havadis Notu Ekleme */}
              {isMostExpensiveGift && (
                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-amber-500/15 border border-pink-400/40 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px] font-black text-amber-300">
                    <span className="flex items-center gap-1">
                      <span>🌸 Tüm Sunucuya Havadis Notu:</span>
                    </span>
                    <span className="text-[9px] text-pink-300 font-bold bg-pink-500/20 px-1.5 py-0.2 rounded-full">
                      Oda No & Katıl Butonlu
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={75}
                    value={giftCustomNote}
                    onChange={(e) => setGiftCustomNote(e.target.value)}
                    placeholder="Özel Havadis notunuzu yazın... (Örn: Kalbimin sultanına koca bir bahar 🌸)"
                    className="w-full px-3 py-1.5 rounded-xl bg-black/40 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-400 transition"
                  />
                </div>
              )}

              {/* Alt Bar: Bakiye, Çarpan Seçici & Gönder Butonu */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] relative">
                {/* Sol: Bakiye ve Doldur */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl">
                    <span className="text-amber-300 text-sm">🪙</span>
                    <span className="text-xs font-black text-amber-300 font-mono">
                      {currentUser.coins.toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <button
                    onClick={() => alert('Altın yükleme menüsüne yönlendiriliyorsunuz...')}
                    className="text-[11px] font-bold text-pink-400 hover:text-pink-300 transition"
                  >
                    Doldur &gt;
                  </button>
                </div>

                {/* Sağ: Çarpan Dropdown + Gönder Butonu */}
                <div className="flex items-center gap-2 relative">
                  {/* Multiplier Dropdown Menüsü */}
                  {showMultiplierDropdown && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="absolute bottom-12 right-28 bg-[#181c36] border border-white/15 rounded-2xl p-1.5 shadow-2xl z-50 flex flex-col gap-1 w-24 animate-in zoom-in-95 duration-150"
                    >
                      {[1, 5, 10, 66, 99, 520, 1314].map(mul => (
                        <button
                          key={mul}
                          onClick={() => {
                            setGiftMultiplier(mul);
                            setShowMultiplierDropdown(false);
                          }}
                          className={`w-full text-center py-1 rounded-xl text-xs font-bold transition ${
                            giftMultiplier === mul
                              ? 'bg-pink-500 text-white'
                              : 'text-slate-300 hover:bg-white/10'
                          }`}
                        >
                          {mul}x
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Multiplier Trigger */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMultiplierDropdown(prev => !prev);
                    }}
                    className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-black text-amber-300 flex items-center gap-1 active:scale-95 transition"
                  >
                    <span>{giftMultiplier}x</span>
                    <span className="text-[9px] text-slate-400">▾</span>
                  </button>

                  {/* Pembe Gönder Butonu */}
                  <button
                    onClick={() => sendGift(selectedGift, giftMultiplier)}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-95 text-white font-black text-xs shadow-lg shadow-pink-500/30 flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Gönder</span>
                    <span className="text-[10px] text-pink-100 font-mono">({totalGiftCost.toLocaleString('tr-TR')} 🪙)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 🎰 %10 Şansla %150 Geri Ödeme (Jackpot) Kutlama Modalı */}
      {luckyRefundModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#0f172a] border-2 border-amber-400/80 rounded-3xl p-6 max-w-sm w-full text-center text-white shadow-[0_0_50px_rgba(251,191,36,0.5)] animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 flex items-center justify-center text-4xl shadow-lg shadow-amber-400/40 animate-bounce">
              🎰
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-wider">
              %10 Büyük Şans Kazandı!
            </span>
            <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-300 mt-2">
              %150 GERİ ÖDEME!
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              <span className="font-bold text-pink-300">{luckyRefundModal.giftName}</span> hediyesi sana uğur getirdi!
            </p>
            
            <div className="my-4 py-3 px-4 rounded-2xl bg-white/5 border border-amber-400/30 flex items-center justify-center gap-2">
              <span className="text-2xl">🪙</span>
              <span className="text-2xl font-black font-mono text-amber-300">
                +{luckyRefundModal.amount.toLocaleString('tr-TR')}
              </span>
              <span className="text-xs font-bold text-amber-200">Altın</span>
            </div>

            <button
              onClick={() => {
                soundFX.playPop();
                setLuckyRefundModal(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-black text-sm shadow-lg shadow-amber-400/30 active:scale-95 transition"
            >
              Harika, Teşekkürler! 🎉
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          5. YENİ ÖZELLİK MODALLARI (Kırmızı Zarf, Şans Çarkı, Çanta, PK)
         ════════════════════════════════════════════════════════════════════ */}
      {/* Kırmızı Zarf Gönderme Modalı */}
      {showRedPacketSendModal && (
        <RedPacketModal
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowRedPacketSendModal(false)}
          onSendRedPacket={(totalGold, count, message, countdownSeconds, isServerWide) => {
            const unlockAt = countdownSeconds > 0 ? Date.now() + countdownSeconds * 1000 : 0;
            const newPacket = {
              id: `rp-${Date.now()}`,
              senderName: currentUser.username,
              totalGold,
              remainingGold: totalGold,
              count,
              claimedUsers: [],
              message,
              unlockAt,
              createdAt: Date.now(),
            };

            setActiveRedPacket(newPacket);
            if (countdownSeconds > 0) {
              setRedPacketCountdown(countdownSeconds);
            } else {
              setRedPacketCountdown(0);
            }

            // Sync with all peers in this voice room via RTDB
            dbSet(dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`), newPacket).catch(console.warn);

            // 👑 If >= 10,000 Gold or isServerWide, broadcast HAVADİS server-wide to all rooms and screens!
            if (totalGold >= 10000 || isServerWide) {
              broadcastGlobalHavadis({
                senderName: currentUser.username,
                roomId,
                roomTitle,
                totalGold,
                message,
                unlockAt,
              }).catch(console.warn);
            }

            sendRoomChatMessage(roomId, {
              sender: 'Sistem',
              text: `🧧 ${currentUser.username}, ${totalGold.toLocaleString('tr-TR')} Altınlık Kırmızı Zarf Yağmuru başlattı! ${countdownSeconds > 0 ? `(${countdownSeconds} sn sonra açılacak!)` : 'İlk kapan kazanır!'}`,
              isSystem: true,
            });
          }}
        />
      )}

      {/* Düşen & Toplanan Altın Zarf Yağmuru Mini Oyunu — Sadece sayaç 0 olduğunda başlar */}
      {activeRedPacket && redPacketCountdown === 0 && (
        <FallingRedPackets
          packet={activeRedPacket}
          currentUserId={currentUser.id}
          onClose={() => setActiveRedPacket(null)}
          onFinished={(collectedCount, rewardGold) => {
            onUpdateUser({
              ...currentUser,
              coins: currentUser.coins + rewardGold,
            });
            // Atılan her zarf toplandıktan sonra sunucudan ve ekrandan silinir (repeat olmaz)
            dbRemove(dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`)).catch(console.warn);
            dbSet(dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`), null).catch(console.warn);
            setActiveRedPacket(null);
            setRedPacketCountdown(0);

            sendRoomChatMessage(roomId, {
              sender: 'Sistem',
              text: `🎉 ${currentUser.username}, altın zarf yağmurunda ${collectedCount} zarf toplayarak +${rewardGold} Altın kazandı! 🧧✨`,
              isSystem: true,
            });
          }}
        />
      )}

      {/* Şans Çarkı / Büyük Kazanan Modalı */}
      {showLuckyWheel && (
        <LuckyWheelModal
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowLuckyWheel(false)}
          roomId={roomId}
        />
      )}

      {/* Sırt Çantası & Envanter Modalı */}
      {showBackpack && (
        <BackpackModal
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowBackpack(false)}
        />
      )}

      {/* Canlı Ses Odası PK Karşılaşması Modalı */}
      {showPKBattle && (
        <PKBattleModal
          currentUser={currentUser}
          onUpdateUser={onUpdateUser}
          onClose={() => setShowPKBattle(false)}
        />
      )}

      {/* Canlı Bingo Oyunu Modalı matching media_1790339151594.jpg & media_1790339183395.jpg */}
      {showBingo && (
        <BingoModal
          currentUser={currentUser}
          onClose={() => setShowBingo(false)}
          onAwardCoins={(earned) => {
            onUpdateUser({
              ...currentUser,
              coins: currentUser.coins + earned,
            });
          }}
          onAnnounce={(msg) => {
            sendRoomChatMessage(roomId, {
              sender: 'Sistem',
              text: msg,
              isSystem: true,
            });
          }}
        />
      )}

      {/* Mikrofon Başvuru Listesi Modalı matching media_1790339116055.jpg */}
      <MicWaitlistModal
        isOpen={showMicWaitlistModal}
        onClose={() => setShowMicWaitlistModal(false)}
        currentUser={currentUser}
        isHost={isHost}
        waitlist={waitlist}
        onApply={() => {
          soundFX.playSuccess();
          const newApplicant: WaitlistApplicant = {
            id: currentUser.id,
            username: currentUser.username,
            avatarUrl: currentUser.customAvatarUrl,
            gender: 'male',
            gemLevel: Math.max(1, currentUser.level || 5),
            charmLevel: getCharmInfo(currentUser.charm || 1000).level || 3,
            vipTag: currentUser.vipLevel > 0 ? `VIP ${currentUser.vipLevel}` : 'VIP',
            appliedAt: Date.now(),
          };
          setWaitlist(prev => [...prev.filter(u => u.id !== currentUser.id), newApplicant]);
          sendRoomChatMessage(roomId, {
            sender: 'Sistem',
            text: `🎤 ${currentUser.username} mikrofon kullanımına başvurdu!`,
            isSystem: true,
          });
        }}
        onCancelApply={() => {
          soundFX.playPop();
          setWaitlist(prev => prev.filter(u => u.id !== currentUser.id));
        }}
        onAdmitUser={(applicant) => {
          soundFX.playGiftFanfare();
          const emptyIdx = seats.findIndex((s, i) => i > 0 && !s.user);
          if (emptyIdx !== -1) {
            const admittedUser: User = makeMockUser(
              applicant.id,
              applicant.username,
              applicant.gemLevel || 5,
              10000,
              'short',
              'streetwear',
              'gaming_headset'
            );
            if (applicant.avatarUrl) {
              admittedUser.customAvatarUrl = applicant.avatarUrl;
            }
            setSeats(prev => prev.map((s, idx) => idx === emptyIdx ? { ...s, user: admittedUser } : s));
            setWaitlist(prev => prev.filter(u => u.id !== applicant.id));
            sendRoomChatMessage(roomId, {
              sender: 'Sistem',
              text: `🎉 ${applicant.username} ${emptyIdx}. koltuğa kabul edildi!`,
              isSystem: true,
            });
            setShowMicWaitlistModal(false);
          } else {
            alert('Tüm koltuklar dolu!');
          }
        }}
      />

      {/* Kırmızı Zarf Geri Sayım & Açılış Modalı matching media_1790339116035.jpg & media_1790339116044.jpg */}
      {activeRedPacket && (
        <RedPacketCountdownModal
          isOpen={showRedPacketCountdownModal}
          onClose={() => setShowRedPacketCountdownModal(false)}
          packet={activeRedPacket}
          countdown={redPacketCountdown}
          currentUser={currentUser}
          onClaim={(amount) => {
            onUpdateUser({
              ...currentUser,
              coins: currentUser.coins + amount,
            });
            // Atılan her zarf toplandıktan sonra sunucudan ve ekrandan silinir (repeat olmaz)
            dbRemove(dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`)).catch(console.warn);
            dbSet(dbRef(rtdb, `voice_rooms/${roomId}/activeRedPacket`), null).catch(console.warn);
            setActiveRedPacket(null);
            setRedPacketCountdown(0);
            setShowRedPacketCountdownModal(false);

            sendRoomChatMessage(roomId, {
              sender: 'Sistem',
              text: `💮 ${activeRedPacket.senderName}'da başlatılan kırmızı zarf yağmurunda, onlar en şanslı... Tebrikler, ${currentUser.username} ${amount} altın para yakaladı! 🧧✨`,
              isSystem: true,
            });
          }}
        />
      )}

      {/* Oda Ayarları Bilgilendirme Modalı */}
      {roomSettingsModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-gray-900 rounded-3xl p-5 max-w-xs w-full text-center shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-2">{roomSettingsModalItem.icon || 'ℹ️'}</div>
            <h3 className="text-base font-black text-gray-900">{roomSettingsModalItem.title}</h3>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
              {roomSettingsModalItem.description}
            </p>
            <button
              onClick={() => setRoomSettingsModalItem(null)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-200 active:scale-95 transition"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Radio, X, Maximize2, Mic, Volume2, VolumeX } from 'lucide-react';
import { subscribeToVoiceRoom, deleteVoiceRoom, updateVoiceRoomSeat } from '../../services/onlineService';
import { soundFX } from '../../utils/soundEffects';
import { voiceWebRTC } from '../../services/voiceWebRTCService';
import { voicePresence } from '../../services/voicePresenceService';
import type { User, RoomSeat } from '../../types';

interface VoiceRoomHUDProps {
  roomId: string;
  currentUser: User;
  onMaximize: () => void;
  onClose: () => void;
}

export const VoiceRoomHUD: React.FC<VoiceRoomHUDProps> = ({
  roomId,
  currentUser,
  onMaximize,
  onClose,
}) => {
  const [roomTitle, setRoomTitle] = useState<string>('Sohbet Odası');
  const [isPermanent, setIsPermanent] = useState<boolean>(false);
  const [hostUser, setHostUser] = useState<User | null>(null);
  const [activeSpeakerCount, setActiveSpeakerCount] = useState<number>(0);
  const [seats, setSeats] = useState<RoomSeat[]>([]);
  const [isDeafened, setIsDeafened] = useState<boolean>(() => voiceWebRTC.isSpeakerDeafened());

  useEffect(() => {
    const unsub = subscribeToVoiceRoom(roomId, (remoteSeats, _, __, remoteHost, roomData) => {
      if (roomData) {
        if (roomData.title) setRoomTitle(roomData.title);
        if (roomData.isPermanent !== undefined) setIsPermanent(!!roomData.isPermanent);
      }
      if (remoteHost) {
        setHostUser(remoteHost);
      }
      if (remoteSeats) {
        setSeats(remoteSeats);
        const speaking = remoteSeats.filter(s => s.user && s.isSpeaking).length;
        setActiveSpeakerCount(speaking);
      }
    });

    return () => unsub();
  }, [roomId]);

  const isHost = (hostUser && hostUser.id === currentUser.id) || (seats[0]?.user?.id === currentUser.id);

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playPop();

    // Vacate my seat if seated
    const mySeat = seats.find(s => s.user?.id === currentUser.id);
    if (mySeat) {
      updateVoiceRoomSeat(roomId, mySeat.seatIndex, null, false).catch(() => {});
    }

    // Leave presence
    voicePresence.leaveRoom();

    // If host and free room, delete room upon exit
    if (isHost && !isPermanent) {
      try {
        await deleteVoiceRoom(roomId);
      } catch (err) {
        console.error('HUD kapatırken oda silme hatası:', err);
      }
    }

    onClose();
  };

  return (
    <div
      onClick={onMaximize}
      className="fixed bottom-20 right-3 z-50 flex items-center gap-2.5 px-3 py-2 bg-slate-900/95 hover:bg-slate-800/95 border border-cyan-500/40 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur-md cursor-pointer transition-all duration-200 active:scale-95 group animate-in fade-in slide-in-from-bottom-5"
    >
      {/* Animated Sound Wave or Radio Indicator */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/30">
        <Radio className="w-4 h-4 text-white animate-pulse" />
        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>

      {/* Room Info */}
      <div className="flex flex-col max-w-[120px] text-left">
        <span className="text-[11px] font-black text-white truncate group-hover:text-cyan-300 transition-colors">
          {roomTitle}
        </span>
        <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Canlı Odadasınız</span>
        </span>
      </div>

      {/* Maximize Icon */}
      <div className="p-1 rounded-full text-slate-400 group-hover:text-cyan-300 transition-colors">
        <Maximize2 className="w-3.5 h-3.5" />
      </div>

      {/* Speaker Mute/Deafen Icon */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          soundFX.playPop();
          const nextDeafened = !isDeafened;
          setIsDeafened(nextDeafened);
          voiceWebRTC.setSpeakerMuted(nextDeafened);
          soundFX.setMasterMuted(nextDeafened);
        }}
        className={`p-1 rounded-full transition-colors ${
          isDeafened ? 'text-rose-400 hover:text-rose-300' : 'text-slate-400 hover:text-cyan-300'
        }`}
        title={isDeafened ? 'Hoparlörü Aç' : 'Tüm Sesleri Sustur'}
      >
        {isDeafened ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>

      {/* Divider */}
      <div className="w-[1px] h-5 bg-white/10" />

      {/* Close Button (X) */}
      <button
        type="button"
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors"
        title="Odadan Ayrıl"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

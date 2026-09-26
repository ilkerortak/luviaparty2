import { ref, push, onChildAdded, remove, set, onValue, off } from 'firebase/database';
import { rtdb } from '../firebase/config';

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { urls: 'stun:stun.services.mozilla.com' },
  ],
  iceCandidatePoolSize: 10,
};

export class VoiceWebRTCService {
  private roomId: string = '';
  private currentUserId: string = '';
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private remoteAudioElements: Map<string, HTMLAudioElement> = new Map();
  private pendingCandidates: Map<string, RTCIceCandidateInit[]> = new Map();
  private activePeers: Set<string> = new Set();
  private isSpeakerMuted: boolean = false;
  private isMicMuted: boolean = false;
  private audioContainer: HTMLDivElement | null = null;
  private signalUnsubRef: any = null;
  private speakingUnsubRef: any = null;
  private onSpeakingChange?: (isSpeaking: boolean, level: number) => void;
  private onRemoteSpeakingChange?: (userId: string, isSpeaking: boolean, level: number) => void;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private lastSpeakingBroadcast: number = 0;
  private unlockListener: (() => void) | null = null;

  // Setup global touch/click listener to unlock AudioContext & autoplay on mobile devices
  private setupAudioUnlock() {
    if (this.unlockListener) return;

    this.unlockListener = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      this.remoteAudioElements.forEach(audio => {
        if (!this.isSpeakerMuted && audio.paused) {
          audio.play().catch(() => {});
        }
      });
    };

    window.addEventListener('touchstart', this.unlockListener, { passive: true });
    window.addEventListener('click', this.unlockListener, { passive: true });
  }

  // Initialize and get user microphone
  async startLocalAudio(
    roomId: string,
    userId: string,
    onSpeakingChange?: (isSpeaking: boolean, level: number) => void,
    onRemoteSpeakingChange?: (userId: string, isSpeaking: boolean, level: number) => void
  ): Promise<MediaStream | null> {
    this.roomId = roomId;
    this.currentUserId = userId;
    this.onSpeakingChange = onSpeakingChange;
    this.onRemoteSpeakingChange = onRemoteSpeakingChange;

    this.setupAudioUnlock();
    this.listenForSignals();
    this.listenForRemoteSpeaking();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('[WebRTC] mediaDevices.getUserMedia not supported in this environment');
        return null;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (err) {
        console.warn('[WebRTC] Advanced audio constraints failed, falling back to basic audio:true', err);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      this.localStream = stream;

      // Start audio analysis for local speaking detection
      this.initAudioAnalyzer(stream);

      // Attach tracks to any already-created peer connections
      this.peerConnections.forEach((pc) => {
        const senders = pc.getSenders();
        stream.getAudioTracks().forEach(track => {
          if (!senders.some(s => s.track?.id === track.id)) {
            try {
              pc.addTrack(track, stream);
            } catch (e) {
              console.warn('[WebRTC] addTrack error:', e);
            }
          }
        });
      });

      // Connect to any active peers where we are the initiator
      for (const peerId of this.activePeers) {
        if (this.currentUserId < peerId && !this.peerConnections.has(peerId)) {
          this.connectToPeer(peerId);
        }
      }

      return stream;
    } catch (err) {
      console.warn('[WebRTC] Microphone permission denied or getUserMedia error:', err);
      return null;
    }
  }

  // Mute / Unmute microphone track
  setMuted(isMuted: boolean) {
    this.isMicMuted = isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }

    if (this.roomId && this.currentUserId && isMuted) {
      set(ref(rtdb, `voice_speaking/${this.roomId}/${this.currentUserId}`), {
        isSpeaking: false,
        micLevel: 0,
        updatedAt: Date.now(),
      }).catch(() => {});
    }
  }

  // Hoparlör Susturma / Açma (Tüm sesleri kapatma)
  setSpeakerMuted(isMuted: boolean) {
    this.isSpeakerMuted = isMuted;
    this.remoteAudioElements.forEach(audio => {
      audio.muted = isMuted;
      audio.volume = isMuted ? 0 : 1;
      if (!isMuted) {
        audio.play().catch(() => {});
      }
    });
  }

  isSpeakerDeafened(): boolean {
    return this.isSpeakerMuted;
  }

  // Sync active seated peer list
  syncActivePeers(peerIds: string[]) {
    const currentSet = new Set(peerIds.filter(id => id && id !== this.currentUserId));
    this.activePeers = currentSet;

    // 1. Remove disconnected peers
    this.peerConnections.forEach((pc, peerId) => {
      if (!currentSet.has(peerId)) {
        pc.close();
        this.peerConnections.delete(peerId);
        const audio = this.remoteAudioElements.get(peerId);
        if (audio) {
          audio.pause();
          audio.srcObject = null;
          audio.remove();
          this.remoteAudioElements.delete(peerId);
        }
        this.pendingCandidates.delete(peerId);
      }
    });

    // 2. Connect to new peers where currentUserId < peerId (deterministic initiator)
    currentSet.forEach(peerId => {
      if (!this.peerConnections.has(peerId)) {
        if (this.currentUserId < peerId) {
          this.connectToPeer(peerId);
        }
      }
    });
  }

  // Connect with a specific peer
  async connectToPeer(targetUserId: string) {
    if (!this.roomId || !this.currentUserId || targetUserId === this.currentUserId) return;
    this.activePeers.add(targetUserId);

    let pc = this.peerConnections.get(targetUserId);
    if (!pc) {
      pc = this.createPeerConnection(targetUserId);
    }

    // Attach local tracks if stream is ready
    if (this.localStream) {
      const senders = pc.getSenders();
      this.localStream.getAudioTracks().forEach(track => {
        const alreadyAdded = senders.some(s => s.track?.id === track.id);
        if (!alreadyAdded) {
          try {
            pc!.addTrack(track, this.localStream!);
          } catch (e) {
            console.warn('[WebRTC] addTrack error:', e);
          }
        }
      });
    }

    // Initiator creates offer
    if (this.currentUserId < targetUserId) {
      try {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: false,
        });
        await pc.setLocalDescription(offer);
        await this.sendSignal(targetUserId, {
          type: 'offer',
          sdp: offer.sdp,
        });
      } catch (err) {
        console.warn('[WebRTC] Offer creation error:', err);
      }
    }
  }

  private createPeerConnection(targetUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.peerConnections.set(targetUserId, pc);

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        this.playRemoteAudio(targetUserId, event.streams[0]);
      } else if (event.track) {
        const newStream = new MediaStream([event.track]);
        this.playRemoteAudio(targetUserId, newStream);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal(targetUserId, {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        if (this.currentUserId < targetUserId && pc.restartIce) {
          pc.restartIce();
        }
      }
    };

    return pc;
  }

  private async sendSignal(targetId: string, signal: any) {
    if (!this.roomId || !this.currentUserId || !targetId) return;
    try {
      const targetSignalRef = ref(rtdb, `voice_signals/${this.roomId}/${targetId}`);
      await push(targetSignalRef, {
        fromId: this.currentUserId,
        signal,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn('[WebRTC] sendSignal RTDB error:', err);
    }
  }

  private listenForSignals() {
    if (!this.roomId || !this.currentUserId) return;

    const mySignalsRef = ref(rtdb, `voice_signals/${this.roomId}/${this.currentUserId}`);
    this.signalUnsubRef = onChildAdded(mySignalsRef, async (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      // Remove signal after reading
      remove(snapshot.ref).catch(() => {});

      const { fromId, signal } = val;
      if (!fromId || fromId === this.currentUserId || !signal) return;

      await this.handleIncomingSignal(fromId, signal);
    });
  }

  private async handleIncomingSignal(fromId: string, signal: any) {
    let pc = this.peerConnections.get(fromId);
    if (!pc) {
      pc = this.createPeerConnection(fromId);
    }

    if (this.localStream) {
      const senders = pc.getSenders();
      this.localStream.getAudioTracks().forEach(track => {
        if (!senders.some(s => s.track?.id === track.id)) {
          try {
            pc!.addTrack(track, this.localStream!);
          } catch (e) {
            console.warn('[WebRTC] addTrack error:', e);
          }
        }
      });
    }

    if (signal.type === 'offer') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription({ type: 'offer', sdp: signal.sdp }));

        const queued = this.pendingCandidates.get(fromId) || [];
        for (const cand of queued) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn('[WebRTC] Drain candidate error:', e);
          }
        }
        this.pendingCandidates.delete(fromId);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await this.sendSignal(fromId, {
          type: 'answer',
          sdp: answer.sdp,
        });
      } catch (err) {
        console.warn('[WebRTC] Error handling offer:', err);
      }
    } else if (signal.type === 'answer') {
      try {
        if (pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: 'answer', sdp: signal.sdp }));

          const queued = this.pendingCandidates.get(fromId) || [];
          for (const cand of queued) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('[WebRTC] Drain candidate error:', e);
            }
          }
          this.pendingCandidates.delete(fromId);
        }
      } catch (err) {
        console.warn('[WebRTC] Error handling answer:', err);
      }
    } else if (signal.type === 'candidate' && signal.candidate) {
      try {
        if (pc.remoteDescription && pc.remoteDescription.type) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        } else {
          if (!this.pendingCandidates.has(fromId)) {
            this.pendingCandidates.set(fromId, []);
          }
          this.pendingCandidates.get(fromId)!.push(signal.candidate);
        }
      } catch (err) {
        console.warn('[WebRTC] Error adding candidate:', err);
      }
    }
  }

  private playRemoteAudio(userId: string, stream: MediaStream) {
    let audio = this.remoteAudioElements.get(userId);
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = `remote-audio-${userId}`;
      audio.autoplay = true;
      audio.setAttribute('playsinline', 'true');
      (audio as any).webkitPlaysInline = true;

      if (!this.audioContainer) {
        this.audioContainer = document.getElementById('webrtc-audio-container') as HTMLDivElement;
        if (!this.audioContainer) {
          this.audioContainer = document.createElement('div');
          this.audioContainer.id = 'webrtc-audio-container';
          this.audioContainer.style.position = 'fixed';
          this.audioContainer.style.pointerEvents = 'none';
          this.audioContainer.style.opacity = '0';
          this.audioContainer.style.width = '0';
          this.audioContainer.style.height = '0';
          document.body.appendChild(this.audioContainer);
        }
      }
      this.audioContainer.appendChild(audio);
      this.remoteAudioElements.set(userId, audio);
    }

    audio.srcObject = stream;
    audio.muted = this.isSpeakerMuted;
    audio.volume = this.isSpeakerMuted ? 0 : 1;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(err => {
        console.warn(`[WebRTC] Audio play blocked for peer ${userId}, will play on user interaction:`, err);
      });
    }
  }

  private initAudioAnalyzer(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        const isSpeaking = !this.isMicMuted && average > 18;
        if (this.onSpeakingChange) {
          this.onSpeakingChange(isSpeaking, average);
        }

        // Broadcast to RTDB with throttle
        const now = Date.now();
        if (now - this.lastSpeakingBroadcast > 300) {
          this.lastSpeakingBroadcast = now;
          if (this.roomId && this.currentUserId) {
            set(ref(rtdb, `voice_speaking/${this.roomId}/${this.currentUserId}`), {
              isSpeaking,
              micLevel: Math.round(average),
              updatedAt: now,
            }).catch(() => {});
          }
        }

        this.animFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('[WebRTC] Audio analyzer error:', err);
    }
  }

  private listenForRemoteSpeaking() {
    if (!this.roomId) return;
    const speakingRef = ref(rtdb, `voice_speaking/${this.roomId}`);
    this.speakingUnsubRef = onValue(speakingRef, (snap) => {
      const data = snap.val();
      if (data && this.onRemoteSpeakingChange) {
        const now = Date.now();
        Object.entries(data).forEach(([userId, val]: [string, any]) => {
          if (userId !== this.currentUserId && val) {
            const isFresh = now - (val.updatedAt || 0) < 3000;
            this.onRemoteSpeakingChange!(
              userId,
              isFresh ? !!val.isSpeaking : false,
              isFresh ? (val.micLevel || 0) : 0
            );
          }
        });
      }
    });
  }

  // Cleanup all connections on room exit
  destroy() {
    if (this.signalUnsubRef) {
      off(ref(rtdb, `voice_signals/${this.roomId}/${this.currentUserId}`));
      this.signalUnsubRef = null;
    }

    if (this.speakingUnsubRef) {
      off(ref(rtdb, `voice_speaking/${this.roomId}`));
      this.speakingUnsubRef = null;
    }

    if (this.unlockListener) {
      window.removeEventListener('touchstart', this.unlockListener);
      window.removeEventListener('click', this.unlockListener);
      this.unlockListener = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    this.remoteAudioElements.forEach(audio => {
      audio.pause();
      audio.srcObject = null;
      audio.remove();
    });
    this.remoteAudioElements.clear();
    this.pendingCandidates.clear();
    this.activePeers.clear();

    if (this.audioContainer) {
      this.audioContainer.remove();
      this.audioContainer = null;
    }

    if (this.roomId && this.currentUserId) {
      remove(ref(rtdb, `voice_speaking/${this.roomId}/${this.currentUserId}`)).catch(() => {});
    }
  }
}

export const voiceWebRTC = new VoiceWebRTCService();

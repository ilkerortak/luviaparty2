import React, { useState, useEffect, useRef, Suspense } from 'react';
import { App as CapApp } from '@capacitor/app';
import type { User, AvatarConfig } from './types';
import { getNumericId } from './types';
import { auth, signOut } from './firebase/config';
import { syncUserProfile, getUserProfile } from './services/onlineService';
import { onAuthStateChanged } from 'firebase/auth';
import { syncUserLevel } from './utils/levelSystem';
import { soundFX } from './utils/soundEffects';
import confetti from 'canvas-confetti';

// Navigation & Auth
import { TopBar } from './components/navigation/TopBar';
import { BottomNav, type TabType } from './components/navigation/BottomNav';
import { LoginScreen } from './components/auth/LoginScreen';

// Core Screens
import { GameLobby } from './components/lobby/GameLobby';
import { VoiceRoomsLobby } from './components/voice-room/VoiceRoomsLobby';
const VoiceRoomComponent = React.lazy(() => import('./components/voice-room/VoiceRoom').then(m => ({ default: m.VoiceRoomComponent })));
import { VoiceRoomHUD } from './components/voice-room/VoiceRoomHUD';
import { MomentsFeed } from './components/moments/MomentsFeed';
import { DirectMessages } from './components/chat/DirectMessages';
import { UserProfile } from './components/profile/UserProfile';
const AvatarCustomizer = React.lazy(() => import('./components/avatar/AvatarCustomizer').then(m => ({ default: m.AvatarCustomizer })));
const ShopModal = React.lazy(() => import('./components/shop/ShopModal').then(m => ({ default: m.ShopModal })));
import { SplashScreen } from './components/splash/SplashScreen';

// Social & Rewards Modals (Lazy Loaded on Demand)
const FamilyModal = React.lazy(() => import('./components/social/FamilyModal').then(m => ({ default: m.FamilyModal })));
const CPModal = React.lazy(() => import('./components/social/CPModal').then(m => ({ default: m.CPModal })));
const DailyCheckInModal = React.lazy(() => import('./components/rewards/DailyCheckInModal').then(m => ({ default: m.DailyCheckInModal })));
const LeaderboardModal = React.lazy(() => import('./components/leaderboard/LeaderboardModal').then(m => ({ default: m.LeaderboardModal })));

// Games (Code-split for instant initial launch & low memory footprint)
const WerewolfGame = React.lazy(() => import('./games/werewolf/WerewolfGame').then(m => ({ default: m.WerewolfGame })));
const DrawAndGuess = React.lazy(() => import('./games/draw-and-guess/DrawAndGuess').then(m => ({ default: m.DrawAndGuess })));
const SpyGame = React.lazy(() => import('./games/who-is-the-spy/SpyGame').then(m => ({ default: m.SpyGame })));
const LudoGame = React.lazy(() => import('./games/ludo/LudoGame').then(m => ({ default: m.LudoGame })));
const MicGrabGame = React.lazy(() => import('./games/mic-grab/MicGrabGame').then(m => ({ default: m.MicGrabGame })));
const JackarooGame = React.lazy(() => import('./games/jackaroo/JackarooGame').then(m => ({ default: m.JackarooGame })));
const UnoGame = React.lazy(() => import('./games/uno/UnoGame').then(m => ({ default: m.UnoGame })));
const TriviaGame = React.lazy(() => import('./games/trivia/TriviaGame').then(m => ({ default: m.TriviaGame })));

// Loading spinner fallback for games
const GameLoadingFallback: React.FC = () => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-[#090b16] text-white">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-0.5 animate-spin">
      <div className="w-full h-full bg-[#090b16] rounded-2xl flex items-center justify-center">
        <span className="text-sm">🎮</span>
      </div>
    </div>
    <span className="text-xs font-bold text-slate-300 mt-3 font-mono animate-pulse">Oyun Yükleniyor...</span>
  </div>
);

import { GameMatchHub, type GameType } from './components/lobby/GameMatchHub';
import { GameRoomLobby } from './components/lobby/GameRoomLobby';
import { GlobalHavadisBanner } from './components/common/GlobalHavadisBanner';
import { AutoGameViewport } from './components/common/AutoGameViewport';
import { voicePresence } from './services/voicePresenceService';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('luvia_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.numericId) parsed.numericId = getNumericId(parsed);
        if (parsed.charm === undefined) parsed.charm = 7668;
        const { user: synced } = syncUserLevel(parsed, null);
        return synced;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('lobby');
  const [activeMatchHubGame, setActiveMatchHubGame] = useState<GameType | null>(null);
  const [activeGame, setActiveGame] = useState<GameType | null>(null);
  const [activeRoomLobbyGame, setActiveRoomLobbyGame] = useState<GameType | null>(null);
  const [activeMultiplayerRoomId, setActiveMultiplayerRoomId] = useState<string | null>(null);
  const [activeVoiceRoomId, setActiveVoiceRoomId] = useState<string | null>(null);
  const [isVoiceRoomMinimized, setIsVoiceRoomMinimized] = useState<boolean>(false);
  const [isAvatarStudioOpen, setIsAvatarStudioOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFamilyOpen, setIsFamilyOpen] = useState(false);
  const [isCPOpen, setIsCPOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);

  // Monitor network online/offline status with tactile feedback
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      soundFX.haptic('success');
      setTimeout(() => setShowReconnectedBanner(false), 3200);
    };
    const handleOffline = () => {
      setIsOnline(false);
      soundFX.haptic('error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to Firebase Auth state with failsafe timeout
  useEffect(() => {
    // If Firebase Auth does not resolve within 1.5 seconds, unblock UI immediately
    const timeoutTimer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 1500);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutTimer);
      if (firebaseUser) {
        try {
          const cloudUser = await getUserProfile(firebaseUser.uid);
          if (cloudUser) {
            const userWithNumId = { ...cloudUser, numericId: getNumericId(cloudUser) };
            const { user: synced } = syncUserLevel(userWithNumId, user);
            setUser(synced);
          } else if (!user) {
            const freshUser: User = {
              id: firebaseUser.uid,
              numericId: getNumericId({ id: firebaseUser.uid }),
              username: firebaseUser.displayName || 'Luvia_Player',
              level: 1,
              exp: 100,
              maxExp: 500,
              coins: 3000,
              diamonds: 50,
              charm: 7668,
              vipLevel: 1,
              avatarConfig: {
                skinColor: '#FFDCB1',
                hairStyle: 'kpop',
                hairColor: '#3b2219',
                eyeStyle: 'sparkle',
                mouthStyle: 'smile',
                outfit: 'hoodie',
                outfitColor: '#ec4899',
                accessory: 'gaming_headset',
                frame: 'gold_vip',
                customPhotoUrl: '/luvia-avatar.png',
              },
              customAvatarUrl: '/luvia-avatar.png',
              statusMessage: 'Luvia Party dünyasına katıldım! 🎮✨',
              followersCount: 12,
              followingCount: 5,
              gamesPlayed: 0,
              gamesWon: 0,
            };
            const { user: synced } = syncUserLevel(freshUser, null);
            setUser(synced);
            syncUserProfile(synced);
          }
        } catch (e) {
          console.warn('Profile fetch error:', e);
        }
      }
      setIsAuthChecking(false);
    });

    return () => {
      clearTimeout(timeoutTimer);
      unsub();
    };
  }, []);

  // Save user changes to localStorage and Firestore
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('luvia_user', JSON.stringify(user));
        syncUserProfile(user);
      } catch (e) {
        console.warn('Failed to save user', e);
      }
    }
  }, [user]);

  const updateUser = (updated: User) => {
    const { user: synced, didLevelUp } = syncUserLevel(updated, user);
    if (didLevelUp) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 160, spread: 90, origin: { y: 0.5 } });
    }
    setUser(synced);
  };

  // Keep a ref of all current navigation states to prevent stale closure in back button handler
  const navStateRef = useRef({
    isAvatarStudioOpen,
    isShopOpen,
    isFamilyOpen,
    isCPOpen,
    isCheckInOpen,
    isLeaderboardOpen,
    activeMatchHubGame,
    activeGame,
    activeVoiceRoomId,
    isVoiceRoomMinimized,
    activeTab,
  });

  useEffect(() => {
    navStateRef.current = {
      isAvatarStudioOpen,
      isShopOpen,
      isFamilyOpen,
      isCPOpen,
      isCheckInOpen,
      isLeaderboardOpen,
      activeMatchHubGame,
      activeGame,
      activeVoiceRoomId,
      isVoiceRoomMinimized,
      activeTab,
    };
  }, [
    isAvatarStudioOpen,
    isShopOpen,
    isFamilyOpen,
    isCPOpen,
    isCheckInOpen,
    isLeaderboardOpen,
    activeMatchHubGame,
    activeGame,
    activeVoiceRoomId,
    isVoiceRoomMinimized,
    activeTab,
  ]);

  // Global Back Gesture / Hardware Back Button Handler
  useEffect(() => {
    let lastBackPressTime = 0;

    const handleBackAction = () => {
      const state = navStateRef.current;

      // 1. Modals priority
      if (state.isAvatarStudioOpen) {
        setIsAvatarStudioOpen(false);
        return true;
      }
      if (state.isShopOpen) {
        setIsShopOpen(false);
        return true;
      }
      if (state.isFamilyOpen) {
        setIsFamilyOpen(false);
        return true;
      }
      if (state.isCPOpen) {
        setIsCPOpen(false);
        return true;
      }
      if (state.isCheckInOpen) {
        setIsCheckInOpen(false);
        return true;
      }
      if (state.isLeaderboardOpen) {
        setIsLeaderboardOpen(false);
        return true;
      }

      // 2. Game Match Hub (Hazırlık Odası)
      if (state.activeMatchHubGame) {
        setActiveMatchHubGame(null);
        return true;
      }

      // 3. Active Running Game
      if (state.activeGame) {
        setActiveGame(null);
        return true;
      }

      // 4. Voice Room: If currently open full screen, back press minimizes it to floating HUD
      if (state.activeVoiceRoomId && !state.isVoiceRoomMinimized) {
        setIsVoiceRoomMinimized(true);
        return true;
      }

      // 5. Non-lobby tabs -> Return to main Lobby
      if (state.activeTab !== 'lobby') {
        setActiveTab('lobby');
        return true;
      }

      // 6. At root lobby: Double back press within 2 seconds exits app
      const now = Date.now();
      if (now - lastBackPressTime < 2000) {
        voicePresence.leaveRoom();
        CapApp.exitApp();
        return false;
      } else {
        lastBackPressTime = now;
        return true;
      }
    };

    // Register Capacitor Hardware / Gesture Back Button listener
    const backListenerPromise = CapApp.addListener('backButton', () => {
      handleBackAction();
    });

    // Also handle web popstate if browser history back occurs
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleBackAction();
      window.history.pushState(null, '', window.location.pathname);
    };
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      backListenerPromise.then(handle => handle.remove()).catch(() => {});
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleLoginSuccess = (newUser: User) => {
    setUser(newUser);
    syncUserProfile(newUser);
  };

  const handleSignOut = async () => {
    voicePresence.leaveRoom();
    try {
      await signOut(auth);
    } catch (e) {
      console.warn(e);
    }
    localStorage.removeItem('luvia_user');
    setUser(null);
  };

  const handleSaveAvatar = (newAvatar: AvatarConfig) => {
    if (!user) return;
    const updated = {
      ...user,
      avatarConfig: newAvatar,
    };
    setUser(updated);
    syncUserProfile(updated);
    setIsAvatarStudioOpen(false);
  };

  const handleJoinVoiceRoomFromHavadis = (roomId: string) => {
    if (activeVoiceRoomId && activeVoiceRoomId !== roomId) {
      voicePresence.leaveRoom();
    }

    setActiveGame(null);
    setActiveMultiplayerRoomId(null);
    setActiveRoomLobbyGame(null);
    setActiveMatchHubGame(null);
    setIsShopOpen(false);
    setIsAvatarStudioOpen(false);
    setIsFamilyOpen(false);
    setIsCPOpen(false);
    setIsCheckInOpen(false);
    setIsLeaderboardOpen(false);

    setActiveVoiceRoomId(roomId);
    setIsVoiceRoomMinimized(false);
  };

  const renderContent = () => {
    if (!user) return null;

    // Fullscreen Game Views (Auto-scaled by root AutoGameViewport, Lazy Loaded)
    if (activeGame) {
      return (
        <Suspense fallback={<GameLoadingFallback />}>
          {activeGame === 'werewolf' && (
            <WerewolfGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'draw_guess' && (
            <DrawAndGuess
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'spy' && (
            <SpyGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'ludo' && (
            <LudoGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'mic_grab' && (
            <MicGrabGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'jackaroo' && (
            <JackarooGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'uno' && (
            <UnoGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
          {activeGame === 'trivia' && (
            <TriviaGame
              currentUser={user}
              onUpdateUser={updateUser}
              onExitGame={() => { setActiveGame(null); setActiveMultiplayerRoomId(null); }}
              roomId={activeMultiplayerRoomId ?? undefined}
            />
          )}
        </Suspense>
      );
    }

    // Fullscreen Voice Room View (when not minimized)
    if (activeVoiceRoomId && !isVoiceRoomMinimized) {
      return (
        <div className="w-full h-full max-w-full bg-[#090b16] flex flex-col overflow-hidden">
          <Suspense fallback={<GameLoadingFallback />}>
            <VoiceRoomComponent
              roomId={activeVoiceRoomId}
              currentUser={user}
              onUpdateUser={updateUser}
              onMinimize={() => setIsVoiceRoomMinimized(true)}
              onLeaveRoom={() => {
                setActiveVoiceRoomId(null);
                setIsVoiceRoomMinimized(false);
              }}
              onSelectRoom={(newRoomId) => {
                setActiveVoiceRoomId(newRoomId);
              }}
            />
          </Suspense>
        </div>
      );
    }

    // Avatar Customizer Fullscreen View
    if (isAvatarStudioOpen) {
      return (
        <div className="w-full h-full max-w-full bg-[#090b16] flex flex-col overflow-hidden">
          <Suspense fallback={<GameLoadingFallback />}>
            <AvatarCustomizer
              initialConfig={user.avatarConfig}
              onSave={handleSaveAvatar}
              onClose={() => setIsAvatarStudioOpen(false)}
            />
          </Suspense>
        </div>
      );
    }

    return (
      <div className="w-full h-full max-w-full bg-[#f6f7fb] flex flex-col overflow-hidden relative">
        {/* Network Status Live Indicator Alert Pills */}
        {!isOnline && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] px-4 py-1.5 rounded-full bg-red-600/95 text-white text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 border border-red-300/40 animate-pulse pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>İnternet bağlantısı kesildi</span>
          </div>
        )}
        {showReconnectedBanner && (
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] px-4 py-1.5 rounded-full bg-emerald-600/95 text-white text-xs font-bold shadow-xl backdrop-blur-md flex items-center gap-2 border border-emerald-300/40 animate-fadeIn pointer-events-none">
            <span>🟢 Yeniden bağlandı!</span>
          </div>
        )}

        {/* Top Header */}
        <TopBar
          currentUser={user}
          onOpenProfile={() => setActiveTab('profile')}
          onOpenShop={() => setIsShopOpen(true)}
        />

      {/* Main Tab Content with Subtle Tab Transition */}
      <main className="flex-1 overflow-hidden relative">
        <div key={activeTab} className="w-full h-full animate-tab-enter">
          {activeTab === 'lobby' && (
            <GameLobby
              currentUser={user}
              onLaunchGame={gameId => setActiveMatchHubGame(gameId)}
              onOpenVoiceRoom={() => setActiveTab('voice_lobby')}
              onNavigateToTab={tab => setActiveTab(tab)}
              onOpenFamily={() => setIsFamilyOpen(true)}
              onOpenCP={() => setIsCPOpen(true)}
              onOpenCheckIn={() => setIsCheckInOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            />
          )}

          {activeTab === 'voice_lobby' && (
            <VoiceRoomsLobby
              currentUser={user}
              onSelectRoom={roomId => {
                setActiveVoiceRoomId(roomId);
                setIsVoiceRoomMinimized(false);
              }}
              onUpdateUser={updateUser}
            />
          )}

          {activeTab === 'moments' && (
            <MomentsFeed
              currentUser={user}
              onOpenCP={() => setIsCPOpen(true)}
              onOpenFamily={() => setIsFamilyOpen(true)}
            />
          )}

          {activeTab === 'messages' && (
            <DirectMessages
              currentUser={user}
              onLaunchGame={gameId => setActiveMatchHubGame(gameId)}
            />
          )}

          {activeTab === 'profile' && (
            <UserProfile
              currentUser={user}
              onOpenAvatarStudio={() => setIsAvatarStudioOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenFamily={() => setIsFamilyOpen(true)}
              onOpenCP={() => setIsCPOpen(true)}
              onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
              onSignOut={handleSignOut}
              onNavigateToTab={tab => setActiveTab(tab)}
            />
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={tab => setActiveTab(tab)}
      />

      {/* Lazy Loaded Social & Rewards Modals */}
      <Suspense fallback={null}>
        {/* Shop & Lucky Wheel Modal */}
        {isShopOpen && (
          <ShopModal
            currentUser={user}
            onUpdateUser={updateUser}
            onClose={() => setIsShopOpen(false)}
          />
        )}

        {/* Family / Clan Modal */}
        {isFamilyOpen && (
          <FamilyModal
            currentUser={user}
            onUpdateUser={updateUser}
            onClose={() => setIsFamilyOpen(false)}
            onOpenVoiceRoom={() => {
              setIsFamilyOpen(false);
              setActiveVoiceRoomId('room-1');
            }}
          />
        )}

        {/* CP (Couple / Bestie) Modal */}
        {isCPOpen && (
          <CPModal
            currentUser={user}
            onUpdateUser={updateUser}
            onClose={() => setIsCPOpen(false)}
            onOpenVoiceRoom={() => {
              setIsCPOpen(false);
              setActiveVoiceRoomId('room-1');
            }}
          />
        )}

        {/* 7-Day Check-in Streak Modal */}
        {isCheckInOpen && (
          <DailyCheckInModal
            currentUser={user}
            onUpdateUser={updateUser}
            onClose={() => setIsCheckInOpen(false)}
          />
        )}

        {/* Leaderboard Modal */}
        {isLeaderboardOpen && (
          <LeaderboardModal
            isOpen={isLeaderboardOpen}
            onClose={() => setIsLeaderboardOpen(false)}
          />
        )}
      </Suspense>

      {/* 🎮 Real-time Multiplayer Lobby (replaces GameMatchHub) */}
      {activeRoomLobbyGame && user && (
        <GameRoomLobby
          gameType={activeRoomLobbyGame}
          currentUser={user}
          onUpdateUser={updateUser}
          onGameStart={(rid) => {
            const g = activeRoomLobbyGame;
            setActiveRoomLobbyGame(null);
            setActiveMultiplayerRoomId(rid);
            setActiveGame(g);
          }}
          onClose={() => setActiveRoomLobbyGame(null)}
        />
      )}

      {/* Legacy single-player lobby (kept for reference, now opens real-time lobby instead) */}
      {activeMatchHubGame && user && (
        <GameRoomLobby
          gameType={activeMatchHubGame}
          currentUser={user}
          onUpdateUser={updateUser}
          onGameStart={(rid) => {
            const g = activeMatchHubGame;
            setActiveMatchHubGame(null);
            setActiveMultiplayerRoomId(rid);
            setActiveGame(g);
          }}
          onClose={() => setActiveMatchHubGame(null)}
        />
      )}

      {/* Floating Mini HUD for Voice Room */}
      {activeVoiceRoomId && isVoiceRoomMinimized && user && (
        <VoiceRoomHUD
          roomId={activeVoiceRoomId}
          currentUser={user}
          onMaximize={() => setIsVoiceRoomMinimized(false)}
          onClose={() => {
            setActiveVoiceRoomId(null);
            setIsVoiceRoomMinimized(false);
          }}
        />
      )}
    </div>
    );
  };

  const renderAppBody = () => {
    // 1. Initial 2.5s Brand Splash Screen (Shown on every app launch)
    if (showSplashScreen) {
      return <SplashScreen onFinish={() => setShowSplashScreen(false)} />;
    }

    // 2. If user is not logged in, show the LoginScreen
    if (!user && !isAuthChecking) {
      return (
        <div className="w-full h-full max-w-full bg-[#090b16] flex flex-col overflow-hidden">
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        </div>
      );
    }

    // 3. Loading indicator while checking initial auth
    if (isAuthChecking && !user) {
      return (
        <div className="w-full h-full max-w-full bg-[#090b16] flex flex-col items-center justify-center p-6 select-none gap-3">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-pink-500/20 border border-pink-500/30 animate-pulse">
            <img src="/luvia-logo.png" alt="Luvia" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-1">
              <span>Luvia</span>
              <span className="text-pink-500 text-lg">♥</span>
            </h1>
            <p className="text-[11px] font-extrabold text-pink-400 uppercase tracking-widest mt-0.5">
              Play. Connect. Vibe.
            </p>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-pink-500 animate-spin mt-2" />
        </div>
      );
    }

    if (!user) return null;

    return (
      <>
        <GlobalHavadisBanner
          onJoinRoom={handleJoinVoiceRoomFromHavadis}
          currentRoomId={activeVoiceRoomId}
          isInGame={Boolean(activeGame)}
        />
        {renderContent()}
      </>
    );
  };

  return (
    <AutoGameViewport>
      {renderAppBody()}
    </AutoGameViewport>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import type { User } from '../../types';
import { soundFX } from '../../utils/soundEffects';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Flame,
  Users,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateLeaderboard } from '../../services/leaderboardService';
import { useMultiplayerGame } from '../../utils/useMultiplayerGame';

interface TriviaGameProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onExitGame: () => void;
  roomId?: string;
}

interface Question {
  id: number;
  category: string;
  categoryEmoji: string;
  question: string;
  options: string[];
  correctIndex: number;
}

const QUESTION_BANK: Question[] = [
  {
    id: 1,
    category: 'Genel Kültür',
    categoryEmoji: '🌱',
    question: 'Türkiye’de erozyonla mücadele amacıyla kurulan vakfın kısa adı nedir?',
    options: ['TEMA', 'ÇEVKO', 'AKUT', 'LÖSEV'],
    correctIndex: 0,
  },
  {
    id: 2,
    category: 'Coğrafya',
    categoryEmoji: '🌍',
    question: 'Gece ve gündüz eşitliği (ekinoks) bir yılda kaç kez gerçekleşir?',
    options: ['1', '2', '3', '4'],
    correctIndex: 1,
  },
  {
    id: 3,
    category: 'Genel Kültür',
    categoryEmoji: '🏅',
    question: 'Nobel Barış Ödülü hariç diğer Nobel ödülleri hangi ülkede verilmektedir?',
    options: ['Norveç', 'İsveç', 'İsviçre', 'Danimarka'],
    correctIndex: 1,
  },
  {
    id: 4,
    category: 'Mimarlık & Tarih',
    categoryEmoji: '🕌',
    question: 'Mimar Sinan\'ın "Ustalık Eserim" dediği Edirne\'deki ünlü yapıtı hangisidir?',
    options: ['Süleymaniye Camii', 'Selimiye Camii', 'Şehzade Camii', 'Mihrimah Sultan Camii'],
    correctIndex: 1,
  },
  {
    id: 5,
    category: 'Genel Kültür',
    categoryEmoji: '📞',
    question: 'Türkiye’nin uluslararası telefon alan kodu kaçtır?',
    options: ['+90', '+44', '+49', '+33'],
    correctIndex: 0,
  },
  {
    id: 6,
    category: 'Tarih',
    categoryEmoji: '🏹',
    question: 'Tarihte "Türk" adıyla kurulan ilk Türk devleti hangisidir?',
    options: ['Büyük Hun Devleti', 'Göktürk Kağanlığı', 'Uygur Devleti', 'Selçuklu Devleti'],
    correctIndex: 1,
  },
  {
    id: 7,
    category: 'Sinema & Kültür',
    categoryEmoji: '🌴',
    question: 'Türkiye\'de Altın Portakal Film Festivali hangi şehrimizde düzenlenmektedir?',
    options: ['İzmir', 'İstanbul', 'Antalya', 'Adana'],
    correctIndex: 2,
  },
  {
    id: 8,
    category: 'Coğrafya',
    categoryEmoji: '🚢',
    question: 'Kuzey ve Güney Amerika kıtalarını ayıran ve Pasifik ile Atlas okyanusunu bağlayan su geçidi nedir?',
    options: ['Süveyş Kanalı', 'Panama Kanalı', 'Cebelitarık Boğazı', 'Bering Boğazı'],
    correctIndex: 1,
  },
  {
    id: 9,
    category: 'Denizcilik & Tarih',
    categoryEmoji: '🗺️',
    question: '1513 yılında ilk dünya haritalarından birini çizen ünlü Osmanlı denizcisi kimdir?',
    options: ['Barbaros Hayrettin Paşa', 'Piri Reis', 'Turgut Reis', 'Seydi Ali Reis'],
    correctIndex: 1,
  },
  {
    id: 10,
    category: 'Spor',
    categoryEmoji: '🏆',
    question: '2000 yılında UEFA Kupasını müzesine götüren ilk ve tek Türk futbol takımı hangisidir?',
    options: ['Fenerbahçe', 'Galatasaray', 'Beşiktaş', 'Trabzonspor'],
    correctIndex: 1,
  },
  {
    id: 11,
    category: 'Tarih',
    categoryEmoji: '📰',
    question: 'Atatürk\'ün 4 Eylül 1919 Sivas Kongresi\'nde çıkarttığı gazetenin adı nedir?',
    options: ['İrade-i Milliye', 'Hâkimiyet-i Milliye', 'Tasvir-i Efkâr', 'Tercüman-ı Ahvâl'],
    correctIndex: 0,
  },
  {
    id: 12,
    category: 'Tarih',
    categoryEmoji: '👥',
    question: 'Osmanlı Devleti\'nde ilk resmi nüfus sayımı hangi padişah döneminde yapılmıştır?',
    options: ['Fatih Sultan Mehmet', 'Kanuni Sultan Süleyman', 'II. Mahmut', 'II. Abdülhamid'],
    correctIndex: 2,
  },
  {
    id: 13,
    category: 'Sinema & Sanat',
    categoryEmoji: '🎬',
    question: 'Dünyaca ünlü "Altın Palmiye" (Palme d\'Or) ödülü hangi festivalde verilmektedir?',
    options: ['Venedik Film Festivali', 'Berlin Film Festivali', 'Cannes Film Festivali', 'Sundance Film Festivali'],
    correctIndex: 2,
  },
  {
    id: 14,
    category: 'Bilim & İcat',
    categoryEmoji: '💥',
    question: 'Dinamiti icat eden ve mirasıyla Nobel Ödülleri kurulan İsveçli kimyager kimdir?',
    options: ['Alfred Nobel', 'Alexander Fleming', 'Thomas Edison', 'Nikola Tesla'],
    correctIndex: 0,
  },
  {
    id: 15,
    category: 'Spor',
    categoryEmoji: '🏔️',
    question: 'Dünyanın en yüksek zirvesi Everest\'e tırmanan ilk Türk dağcı kimdir?',
    options: ['Nasuh Mahruki', 'Ali Nasuh', 'Tunç Fındık', 'Erdek Fındıkoğlu'],
    correctIndex: 0,
  },
  {
    id: 16,
    category: 'Edebiyat',
    categoryEmoji: '📖',
    question: 'Kaşgarlı Mahmud tarafından yazılan ilk Türkçe sözlük hangisidir?',
    options: ['Divan-ı Hikmet', 'Kutadgu Bilig', 'Divanü Lûgati\'t-Türk', 'Atabetü\'l-Hakayık'],
    correctIndex: 2,
  },
  {
    id: 17,
    category: 'Coğrafya & Bilim',
    categoryEmoji: '🌊',
    question: 'Bir akarsuyun belirli bir kesitinden birim zamanda geçen su miktarına ne ad verilir?',
    options: ['Rejim', 'Debi', 'Döküntü', 'Menderes'],
    correctIndex: 1,
  },
  {
    id: 18,
    category: 'Coğrafya',
    categoryEmoji: '🧭',
    question: 'Pusula kadranında "N" harfi hangi ana yönü gösterir?',
    options: ['Güney', 'Doğu', 'Kuzey', 'Batı'],
    correctIndex: 2,
  },
  {
    id: 19,
    category: 'Genel Kültür',
    categoryEmoji: '🎈',
    question: 'Dünya Çocuk Hakları Günü her yıl hangi tarihte kutlanmaktadır?',
    options: ['23 Nisan', '20 Kasım', '1 Haziran', '29 Ekim'],
    correctIndex: 1,
  },
  {
    id: 20,
    category: 'Müzik',
    categoryEmoji: '🎼',
    question: 'Müzik notasyonunda susma/duraklama işareti hangisidir?',
    options: ['Bemol', 'Diyez', 'Es', 'Porte'],
    correctIndex: 2,
  },
  {
    id: 21,
    category: 'Dil & Kültür',
    categoryEmoji: '🗣️',
    question: 'Türkçe dili dil aileleri sınıflandırmasında hangi gruba girmektedir?',
    options: ['Hint-Avrupa', 'Hami-Sami', 'Ural-Altay', 'Çin-Tibet'],
    correctIndex: 2,
  },
  {
    id: 22,
    category: 'Genel Kültür',
    categoryEmoji: '🇪🇺',
    question: 'Avrupa Birliği ve NATO\'nun idari merkezi kabul edilen başkent neresidir?',
    options: ['Paris', 'Brüksel', 'Cenevre', 'Berlin'],
    correctIndex: 1,
  },
  {
    id: 23,
    category: 'Tarih & Müzik',
    categoryEmoji: '🇹🇷',
    question: 'İstiklal Marşımızın günümüzdeki bestecisi kimdir?',
    options: ['Osman Zeki Üngör', 'Mehmet Akif Ersoy', 'Zeki Müren', 'Hacı Arif Bey'],
    correctIndex: 0,
  },
  {
    id: 24,
    category: 'İcatlar',
    categoryEmoji: '☎️',
    question: '1876 yılında telefonu icat eden İskoç asıllı bilim insanı kimdir?',
    options: ['Thomas Edison', 'Alexander Graham Bell', 'Guglielmo Marconi', 'Samuel Morse'],
    correctIndex: 1,
  },
  {
    id: 25,
    category: 'Coğrafya',
    categoryEmoji: '🗻',
    question: '5.137 metre yüksekliğiyle Türkiye\'nin en yüksek dağı hangisidir?',
    options: ['Süphan Dağı', 'Erciyes Dağı', 'Ağrı Dağı', 'Kaçkar Dağı'],
    correctIndex: 2,
  },
  {
    id: 26,
    category: 'Genel Kültür',
    categoryEmoji: '🇪🇺',
    question: 'Halk oylaması (referandum) sonucu Avrupa Birliği üyeliğini iki kez reddeden İskandinav ülkesi hangisidir?',
    options: ['İsveç', 'Finlandiya', 'Norveç', 'İzlanda'],
    correctIndex: 2,
  },
  {
    id: 27,
    category: 'Genel Kültür',
    categoryEmoji: '👶',
    question: 'Birleşmiş Milletler Çocuklara Yardım Fonu\'nun uluslararası kısaltması nedir?',
    options: ['UNESCO', 'UNICEF', 'WHO', 'UNHCR'],
    correctIndex: 1,
  },
  {
    id: 28,
    category: 'Anayasa & Hukuk',
    categoryEmoji: '⚖️',
    question: '"Türkiye Devleti bir Cumhuriyettir." hükmü Anayasamızın kaçıncı maddesidir?',
    options: ['1. Madde', '2. Madde', '3. Madde', '4. Madde'],
    correctIndex: 0,
  },
  {
    id: 29,
    category: 'Teknoloji',
    categoryEmoji: '🔍',
    question: 'Dünyada internet üzerinde en çok tercih edilen arama motoru hangisidir?',
    options: ['Yahoo', 'Bing', 'Google', 'Yandex'],
    correctIndex: 2,
  },
  {
    id: 30,
    category: 'Tarih & Toplum',
    categoryEmoji: '🗳️',
    question: 'Türkiye\'de kadınlara milletvekili seçme ve seçilme hakkı hangi yılda tanınmıştır?',
    options: ['1923', '1930', '1934', '1938'],
    correctIndex: 2,
  },
];

interface PlayerScore {
  id: string;
  name: string;
  avatarConfig?: any;
  score: number;
  streak: number;
  selectedOption: number | null;
  lastPoints?: number;
  lastAnswerCorrect?: boolean;
}

export const TriviaGame: React.FC<TriviaGameProps> = ({ currentUser, onUpdateUser, onExitGame, roomId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  const [gameState, setGameState] = useState<'playing' | 'game_over'>('playing');

  // Jokers state
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [usedFiftyFifty, setUsedFiftyFifty] = useState<boolean>(false);
  const [usedAudience, setUsedAudience] = useState<boolean>(false);
  const [showAudienceModal, setShowAudienceModal] = useState<boolean>(false);
  const [audienceVotes, setAudienceVotes] = useState<number[]>([25, 25, 25, 25]);

  const { isMultiplayer, isHost: isRoomHost, players: rtdbPlayers, remoteState, pushState, rewardWinner, prizePool } = useMultiplayerGame({ roomId, currentUserId: currentUser.id });

  const [players, setPlayers] = useState<PlayerScore[]>(() => [
    { id: currentUser.id, name: `${currentUser.username} (Sen)`, score: 0, streak: 0, selectedOption: null, avatarConfig: currentUser.avatarConfig }
  ]);

  // Host initializes 10 questions and players purely from real users
  useEffect(() => {
    if (!isMultiplayer || isRoomHost) {
      const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 10);
      setQuestions(shuffled);
      setCurrentQIndex(0);
      setTimeLeft(12);

      const sourcePlayers = (isMultiplayer && rtdbPlayers.length > 0 ? rtdbPlayers : [
        { userId: currentUser.id, username: currentUser.username, avatarConfig: currentUser.avatarConfig }
      ]);

      const initialPlayerScores: PlayerScore[] = sourcePlayers.map(rp => ({
        id: rp.userId,
        name: rp.userId === currentUser.id ? `${rp.username} (Sen)` : rp.username,
        avatarConfig: rp.avatarConfig,
        score: 0,
        streak: 0,
        selectedOption: null,
      }));

      setPlayers(initialPlayerScores);

      if (isMultiplayer) {
        pushState({
          questions: shuffled,
          currentQIndex: 0,
          players: initialPlayerScores,
          gameState: 'playing',
          actionSeq: Date.now(),
        }).catch(console.warn);
      }
    }
  }, [isMultiplayer, isRoomHost, rtdbPlayers.length]);

  // Sync state from RTDB in multiplayer
  useEffect(() => {
    if (!isMultiplayer || !remoteState || !remoteState.actionSeq) return;
    if (remoteState.questions) setQuestions(remoteState.questions);
    if (remoteState.currentQIndex !== undefined) {
      if (remoteState.currentQIndex !== currentQIndex) {
        setSelectedOption(null);
        setIsLockedIn(false);
        setIsAnswerRevealed(false);
        setTimeLeft(12);
        setEliminatedOptions([]);
      }
      setCurrentQIndex(remoteState.currentQIndex);
    }
    if (remoteState.players) setPlayers(remoteState.players);
    if (remoteState.gameState) setGameState(remoteState.gameState);
    if (remoteState.isAnswerRevealed !== undefined) setIsAnswerRevealed(remoteState.isAnswerRevealed);
  }, [remoteState, isMultiplayer]);

  const currentQ = questions[currentQIndex];

  // 12-second countdown per question (Host drives timer in multiplayer)
  useEffect(() => {
    if (gameState !== 'playing' || isLockedIn || isAnswerRevealed) return;
    if (isMultiplayer && !isRoomHost) return;

    if (timeLeft <= 0) {
      handleLockIn();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const nextTime = prev - 1;
        if (isMultiplayer && nextTime % 4 === 0) {
          pushState({ timeLeft: nextTime, actionSeq: Date.now() }).catch(console.warn);
        }
        return nextTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, isLockedIn, isAnswerRevealed, isMultiplayer, isRoomHost]);

  // Handle user selecting an option
  const handleSelectOption = (idx: number) => {
    if (isLockedIn || isAnswerRevealed || eliminatedOptions.includes(idx)) return;
    soundFX.playStageBuzzer();
    setSelectedOption(idx);
    setIsLockedIn(true);

    if (isMultiplayer) {
      pushState({
        [`choice_${currentUser.id}`]: idx,
        [`reaction_${currentUser.id}`]: timeLeft,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }

    if (!isMultiplayer) {
      handleLockIn(idx);
    }
  };

  // Lock-in suspense sequence
  const handleLockIn = (userChoice: number | null = selectedOption) => {
    setIsLockedIn(true);
    soundFX.playPop();

    // Assign choices for real players
    if (currentQ) {
      setPlayers(prev =>
        prev.map(p => {
          const remoteChoice = isMultiplayer && remoteState ? remoteState[`choice_${p.id}`] : null;
          return {
            ...p,
            selectedOption: remoteChoice !== undefined && remoteChoice !== null ? remoteChoice : (p.id === currentUser.id ? userChoice : null)
          };
        })
      );
    }

    // Suspense delay: wait 1.6s then reveal!
    setTimeout(() => {
      revealAnswer(userChoice);
    }, 1600);
  };

  // Reveal correct answer and calculate scores
  const revealAnswer = (userChoice: number | null) => {
    if (!currentQ) return;
    setIsAnswerRevealed(true);

    const effectiveChoice = selectedOption !== null ? selectedOption : userChoice;
    const isUserCorrect = effectiveChoice === currentQ.correctIndex;

    if (isUserCorrect) {
      soundFX.playSuccess();
    } else {
      soundFX.playBuzzer();
    }

    // Update scores with speed bonus and streak multiplier
    const nextPlayers = players.map(p => {
      const choice = isMultiplayer && remoteState && remoteState[`choice_${p.id}`] !== undefined
        ? remoteState[`choice_${p.id}`]
        : (p.id === currentUser.id ? effectiveChoice : p.selectedOption);

      const isCorrect = choice === currentQ.correctIndex;

      if (!isCorrect) {
        return {
          ...p,
          streak: 0,
          lastPoints: 0,
          lastAnswerCorrect: false,
        };
      }

      const streakBonus = p.streak >= 3 ? 2.0 : p.streak >= 1 ? 1.5 : 1.0;
      const remainingTime = isMultiplayer && remoteState && remoteState[`reaction_${p.id}`] !== undefined
        ? remoteState[`reaction_${p.id}`]
        : timeLeft;
      const points = Math.round((100 + (remainingTime || 0) * 15) * streakBonus);

      return {
        ...p,
        score: p.score + points,
        streak: p.streak + 1,
        lastPoints: points,
        lastAnswerCorrect: true,
      };
    });

    setPlayers(nextPlayers);

    if (isMultiplayer) {
      pushState({
        players: nextPlayers,
        isAnswerRevealed: true,
        actionSeq: Date.now(),
      }).catch(console.warn);
    }

    // After 3.2s, advance to next question or end game
    setTimeout(() => {
      if (currentQIndex + 1 < questions.length) {
        const nextQ = currentQIndex + 1;
        setCurrentQIndex(nextQ);
        setSelectedOption(null);
        setIsLockedIn(false);
        setIsAnswerRevealed(false);
        setTimeLeft(12);
        setEliminatedOptions([]);
        setShowAudienceModal(false);
        const resetPlayers = nextPlayers.map(p => ({ ...p, selectedOption: null, lastPoints: undefined }));
        setPlayers(resetPlayers);

        if (isMultiplayer) {
          pushState({
            currentQIndex: nextQ,
            players: resetPlayers,
            isAnswerRevealed: false,
            actionSeq: Date.now(),
          }).catch(console.warn);
        }
      } else {
        handleEndGame(nextPlayers);
      }
    }, 3200);
  };

  // Joker 1: 50% Eleme (Eliminate 2 wrong options)
  const handleFiftyFifty = () => {
    if (usedFiftyFifty || isLockedIn || isAnswerRevealed || !currentQ) return;
    soundFX.playCastleHarp();
    setUsedFiftyFifty(true);

    const wrongIndexes = [0, 1, 2, 3].filter(idx => idx !== currentQ.correctIndex);
    const toEliminate = wrongIndexes.sort(() => Math.random() - 0.5).slice(0, 2);
    setEliminatedOptions(toEliminate);
  };

  // Joker 2: Seyirci Jokeri (Audience Poll)
  const handleAudienceJoker = () => {
    if (usedAudience || isLockedIn || isAnswerRevealed || !currentQ) return;
    soundFX.playApplause();
    setUsedAudience(true);

    // Audience favors the correct answer with 55-75% of votes
    const correctIdx = currentQ.correctIndex;
    const correctPercent = Math.floor(Math.random() * 20) + 55;
    const remaining = 100 - correctPercent;

    const p1 = Math.floor(Math.random() * (remaining - 10)) + 3;
    const p2 = Math.floor(Math.random() * (remaining - p1 - 5)) + 2;
    const p3 = remaining - p1 - p2;

    const distribution = [0, 0, 0, 0];
    distribution[correctIdx] = correctPercent;

    let otherIdx = 0;
    const otherPercents = [p1, p2, p3];
    for (let i = 0; i < 4; i++) {
      if (i !== correctIdx) {
        distribution[i] = otherPercents[otherIdx++];
      }
    }

    setAudienceVotes(distribution);
    setShowAudienceModal(true);
  };

  // Game End
  const handleEndGame = (finalPlayers: PlayerScore[] = players) => {
    setGameState('game_over');
    const sorted = [...finalPlayers].sort((a, b) => b.score - a.score);
    const isWinner = sorted[0]?.id === currentUser.id;

    const coinsReward = isMultiplayer
      ? (isWinner ? Math.floor(prizePool * 0.9) : 90)
      : (isWinner ? 350 : 90);

    if (isWinner) {
      soundFX.playGiftFanfare();
      confetti({ particleCount: 150, spread: 85, origin: { y: 0.5 } });
      const updatedUser: User = {
        ...currentUser,
        coins: currentUser.coins + coinsReward,
        exp: currentUser.exp + 250,
        gamesPlayed: (currentUser.gamesPlayed || 0) + 1,
        gamesWon: (currentUser.gamesWon || 0) + 1,
      };
      onUpdateUser(updatedUser);
      if (isMultiplayer) rewardWinner(currentUser.id).catch(console.warn);
      updateLeaderboard('trivia', currentUser.id, currentUser.username, sorted[0].score);
    } else {
      soundFX.playPop();
      const updatedUser: User = {
        ...currentUser,
        coins: currentUser.coins + 90,
        exp: currentUser.exp + 90,
        gamesPlayed: (currentUser.gamesPlayed || 0) + 1,
      };
      onUpdateUser(updatedUser);
    }

    if (isMultiplayer) {
      pushState({ gameState: 'game_over', actionSeq: Date.now() }).catch(console.warn);
    }
  };

  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);
  const userStreak = players.find(p => p.id === currentUser.id)?.streak || 0;

  return (
    <div className="flex flex-col h-full bg-[#080b16] text-white select-none relative overflow-hidden">
      {/* Quiz Studio Spotlights Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/60 via-[#0a0e1c] to-[#060810] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/15 rounded-full blur-[110px] pointer-events-none" />

      {/* ── TOP HEADER ── */}
      <div className="relative z-20 px-4 pb-2.5 pt-[max(calc(env(safe-area-inset-top,0px)+14px),54px)] bg-slate-950/90 backdrop-blur-md border-b border-indigo-500/20 flex items-center justify-between flex-shrink-0 shadow-md">
        <button
          onClick={onExitGame}
          className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center font-black text-sm text-slate-950 shadow-md">
            🧠
          </div>
          <div>
            <span className="font-black text-sm bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 bg-clip-text text-transparent block leading-tight">
              BİLGİ YARIŞMASI
            </span>
            <span className="text-[9px] text-indigo-300 font-bold tracking-wider uppercase block">
              Stüdyo Arenası
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Combo streak flame */}
          {userStreak > 1 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/50 text-orange-400 text-xs font-black animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>x{userStreak >= 3 ? '2.0' : '1.5'}</span>
            </div>
          )}

          <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-black text-amber-300">
            {currentQIndex + 1}/{questions.length}
          </div>
        </div>
      </div>

      {/* ── LIVE CONNECTED PLAYERS STRIP ── */}
      <div className="relative z-20 px-3 py-2 bg-indigo-950/30 border-b border-indigo-500/10 grid grid-cols-4 gap-2">
        {players.map(p => {
          const isUser = p.id === currentUser.id;
          return (
            <div
              key={p.id}
              className={`p-2 rounded-2xl border text-center transition-all ${
                isUser
                  ? 'bg-amber-500/15 border-amber-400/50 ring-1 ring-amber-400/30 shadow-md'
                  : 'bg-slate-900/60 border-slate-800/80'
              }`}
            >
              <div className="text-[10px] font-black truncate text-white">
                {isUser ? `${p.name} (Sen)` : p.name}
              </div>
              <div className="text-xs font-black text-amber-400 mt-0.5">{p.score} P</div>

              {isAnswerRevealed ? (
                <div className="text-[9px] mt-0.5 font-bold flex flex-col items-center">
                  <span>{p.lastAnswerCorrect ? '✅ Doğru' : '❌ Yanlış'}</span>
                  {p.lastAnswerCorrect && p.lastPoints !== undefined && (
                    <span className="text-emerald-400 font-black animate-pulse">
                      +{p.lastPoints}P
                    </span>
                  )}
                </div>
              ) : isLockedIn ? (
                <div className="text-[9px] mt-0.5 text-amber-300 font-bold animate-pulse">
                  {p.selectedOption !== null ? `Seçti (${String.fromCharCode(65 + p.selectedOption)})` : 'Bekliyor...'}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* ── MAIN QUIZ STAGE ── */}
      {currentQ && gameState === 'playing' && (
        <div className="relative z-10 flex-1 flex flex-col justify-between p-4 overflow-y-auto no-scrollbar max-w-md mx-auto w-full">

          {/* Question Box */}
          <div className="space-y-3">
            {/* Category & Timer Bar */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold flex items-center space-x-1.5">
                <span>{currentQ.categoryEmoji}</span>
                <span>{currentQ.category}</span>
              </span>

              {/* Suspense Timer Pill */}
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full font-black text-xs border transition ${
                isLockedIn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                  : timeLeft <= 3
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500 animate-pulse'
                  : 'bg-white/10 text-white border-white/20'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>{isLockedIn ? 'Kilitlendi...' : `${timeLeft}s`}</span>
              </div>
            </div>

            {/* Question Spotlight Box (3D Megascreen) */}
            <div
              style={{ transform: 'perspective(900px) rotateX(4deg)' }}
              className="p-5 rounded-3xl bg-gradient-to-br from-slate-900/95 via-indigo-950/70 to-slate-900/95 border border-indigo-500/40 shadow-[0_12px_0_#1e1b4b,0_18px_28px_rgba(0,0,0,0.8)] text-center min-h-[120px] flex items-center justify-center relative overflow-hidden backdrop-blur-md transition-transform"
            >
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
              <h2 className="text-base sm:text-lg font-black text-white leading-relaxed">
                {currentQ.question}
              </h2>
            </div>
          </div>

          {/* Answer Options (A, B, C, D - 3D Buzzers) */}
          <div className="space-y-2.5 my-3">
            {currentQ.options.map((option, idx) => {
              const isEliminated = eliminatedOptions.includes(idx);
              const isUserChoice = selectedOption === idx;
              const isCorrect = isAnswerRevealed && idx === currentQ.correctIndex;
              const isWrong = isAnswerRevealed && isUserChoice && idx !== currentQ.correctIndex;

              // Which players picked this option?
              const pickingPlayers = players.filter(p => isLockedIn && p.selectedOption === idx);

              let style = 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800/90 text-white shadow-[0_5px_0_#334155,0_8px_14px_rgba(0,0,0,0.4)] active:translate-y-1 active:shadow-[0_1px_0_#334155]';

              if (isEliminated) {
                style = 'opacity-25 pointer-events-none bg-black/30 border-white/5 text-slate-500 line-through';
              } else if (isCorrect) {
                style = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/80 shadow-[0_6px_0_#065f46,0_12px_24px_rgba(16,185,129,0.5)] animate-bounce';
              } else if (isWrong) {
                style = 'bg-rose-500/30 border-rose-400 text-rose-200 ring-2 ring-rose-400/80 shadow-[0_6px_0_#9f1239,0_12px_24px_rgba(244,63,94,0.5)]';
              } else if (isUserChoice && isLockedIn) {
                style = 'bg-amber-500/30 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-[0_6px_0_#b45309,0_12px_24px_rgba(245,158,11,0.5)] animate-pulse';
              }

              return (
                <button
                  key={idx}
                  disabled={isLockedIn || isAnswerRevealed || isEliminated}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left font-bold text-xs sm:text-sm flex items-center justify-between transition-all active:scale-[0.99] relative overflow-hidden ${style}`}
                >
                  <div className="flex items-center space-x-3 z-10">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      isCorrect
                        ? 'bg-emerald-500 text-white shadow'
                        : isWrong
                        ? 'bg-rose-500 text-white shadow'
                        : isUserChoice
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-white/10 text-white'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{option}</span>
                  </div>

                  {/* Right side indicators */}
                  <div className="flex items-center space-x-2 z-10">
                    {isLockedIn && pickingPlayers.length > 0 && (
                      <div className="flex items-center -space-x-1.5">
                        {pickingPlayers.map(p => (
                          <div
                            key={p.id}
                            className="w-5 h-5 rounded-full bg-slate-800 border border-white/40 flex items-center justify-center text-[9px] font-black text-amber-300"
                            title={`${p.name} bunu seçti`}
                          >
                            {p.name.slice(0, 1)}
                          </div>
                        ))}
                      </div>
                    )}

                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    {isWrong && <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── JOKER TOOLBAR ── */}
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-indigo-500/20 backdrop-blur flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-300 flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Jokerlerin:</span>
            </span>

            <div className="flex items-center space-x-2">
              {/* Joker 1: 50% Eleme */}
              <button
                disabled={usedFiftyFifty || isLockedIn || isAnswerRevealed}
                onClick={handleFiftyFifty}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${
                  usedFiftyFifty
                    ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed line-through'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30'
                }`}
              >
                🎯 %50 Eleme
              </button>

              {/* Joker 2: Seyirci Jokeri */}
              <button
                disabled={usedAudience || isLockedIn || isAnswerRevealed}
                onClick={handleAudienceJoker}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 flex items-center space-x-1 ${
                  usedAudience
                    ? 'bg-white/5 text-slate-500 border-white/5 cursor-not-allowed line-through'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Seyirci</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── SEYİRCİ JOKERİ POLL MODAL ── */}
      {showAudienceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#12162a] rounded-3xl p-6 border border-cyan-500/40 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-2xl mx-auto shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              👥
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Seyirci Oylaması</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Stüdyodaki 100 seyircinin verdiği oylar:
              </p>
            </div>

            {/* Bar Charts for A, B, C, D */}
            <div className="space-y-2.5 py-2">
              {['A', 'B', 'C', 'D'].map((letter, i) => (
                <div key={letter} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold px-1">
                    <span className="text-white">{letter} Şıkkı</span>
                    <span className="text-cyan-400 font-black">%{audienceVotes[i]}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                    <div
                      style={{ width: `${audienceVotes[i]}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAudienceModal(false)}
              className="w-full py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs transition active:scale-95 shadow-lg shadow-cyan-600/30"
            >
              Anladım, Seçimimi Yapacağım
            </button>
          </div>
        </div>
      )}

      {/* ── GAME OVER PODIUM MODAL ── */}
      {gameState === 'game_over' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#101426] rounded-3xl p-6 border border-amber-500/40 max-w-sm w-full text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-28 h-28 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-3xl mx-auto shadow-[0_0_30px_rgba(251,191,36,0.4)] animate-bounce">
              🏆
            </div>

            <div>
              <h2 className="text-xl font-black text-white">Yarışma Tamamlandı!</h2>
              <p className="text-xs text-slate-300 mt-1">
                {sortedLeaderboard[0]?.id === currentUser.id
                  ? 'Muazzam! En yüksek puanı toplayarak Stüdyo Şampiyonu oldun!'
                  : `1. Sırayı ${sortedLeaderboard[0]?.name || 'Kazanan'} kazandı.`}
              </p>
            </div>

            {/* Ranking List */}
            <div className="space-y-2 py-1">
              {sortedLeaderboard.map((player, rank) => (
                <div
                  key={player.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition ${
                    player.id === currentUser.id
                      ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 ring-1 ring-amber-400/40'
                      : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-black">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '4'}
                    </span>
                    <span>{player.name} {player.id === currentUser.id ? '(Sen)' : ''}</span>
                  </div>
                  <span className="text-amber-400 font-black">{player.score} Puan</span>
                </div>
              ))}
            </div>

            {/* Reward Box */}
            <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-around">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Altın</span>
                <span className="font-black text-yellow-400 text-xs">
                  +{sortedLeaderboard[0]?.id === currentUser.id ? '350' : '90'}
                </span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">XP</span>
                <span className="font-black text-cyan-400 text-xs">
                  +{sortedLeaderboard[0]?.id === currentUser.id ? '250' : '90'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => {
                  const shuffled = [...QUESTION_BANK].sort(() => Math.random() - 0.5).slice(0, 10);
                  setQuestions(shuffled);
                  setCurrentQIndex(0);
                  setTimeLeft(12);
                  setGameState('playing');
                  setSelectedOption(null);
                  setIsLockedIn(false);
                  setIsAnswerRevealed(false);
                  setUsedFiftyFifty(false);
                  setUsedAudience(false);
                  setShowAudienceModal(false);
                  setEliminatedOptions([]);
                  const resetScores = players.map(p => ({ ...p, score: 0, streak: 0, selectedOption: null }));
                  setPlayers(resetScores);
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs active:scale-95 transition shadow-lg shadow-amber-500/30"
              >
                Tekrar Oyna
              </button>
              <button
                onClick={onExitGame}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs active:scale-95 transition"
              >
                Lobiye Dön
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

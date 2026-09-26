export interface AvatarConfig {
  skinColor: string;
  hairStyle: 'messy' | 'kpop' | 'curly' | 'ponytail' | 'short' | 'anime';
  hairColor: string;
  eyeStyle: 'sparkle' | 'cool' | 'wink' | 'cute' | 'determined';
  mouthStyle: 'smile' | 'laugh' | 'smirk' | 'neutral' | 'bubblegum';
  outfit: 'hoodie' | 'streetwear' | 'cyberpunk' | 'suit' | 'party_dress' | 'space_suit';
  outfitColor: string;
  accessory: 'none' | 'cat_ears' | 'gaming_headset' | 'glasses' | 'angel_wings' | 'crown';
  frame: 'none' | 'gold_vip' | 'neon_fire' | 'sakura' | 'cyber_glow';
  customPhotoUrl?: string; // Custom uploaded image URL or default Luvia logo
}

export interface User {
  id: string;
  numericId?: string; // 7-digit purely numeric ID (e.g. "8492015")
  username: string;
  level: number;
  exp: number;
  maxExp: number;
  totalExp?: number;
  coins: number;
  diamonds?: number;
  charm?: number; // Cazibe Değeri (WePlay Charm System: 5 coins gift = 1 charm)
  vipLevel: number;
  avatarConfig: AvatarConfig;
  customAvatarUrl?: string; // Direct custom profile photo URL
  statusMessage: string;
  followersCount: number;
  followingCount: number;
  gamesPlayed: number;
  gamesWon: number;
  cpPartner?: {
    name: string;
    intimacyLevel: number;
  };
}

/**
 * Returns a 7-digit purely numeric ID for any user
 */
export function getNumericId(user?: { id?: string; numericId?: string } | null): string {
  if (user?.numericId && /^\d+$/.test(user.numericId)) {
    return user.numericId;
  }
  if (!user?.id) return '1000000';
  let hash = 0;
  for (let i = 0; i < user.id.length; i++) {
    hash = ((hash << 5) - hash + user.id.charCodeAt(i)) >>> 0;
  }
  const num = 1000000 + (hash % 9000000);
  return num.toString();
}

export type GameType = 'werewolf' | 'draw_guess' | 'spy' | 'ludo' | 'mic_grab' | 'jackaroo' | 'uno' | 'trivia';

export interface RoomSeat {
  seatIndex: number;
  user: User | null;
  isMuted: boolean;
  isSpeaking: boolean;
  micLevel: number; // 0 to 100
  isLocked?: boolean;
}

export interface RoomChatMessage {
  id: string;
  sender: User;
  text: string;
  timestamp: string;
  type?: 'chat' | 'system' | 'gift';
}

export interface ActiveGift {
  id: string;
  senderName: string;
  targetSeatIndex: number;
  targetUserName?: string;
  giftName: string;
  giftIcon: string;
  giftRarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  giftQuote?: string;
  giftCount?: number;
  earnedCharm?: number;
}

export interface VoiceRoom {
  id: string;
  title: string;
  tag: string;
  host: User;
  bgTheme: 'neon_night' | 'cyber_bar' | 'cozy_cafe' | 'space_lounge' | 'sakura_garden';
  seats: RoomSeat[];
  messages: RoomChatMessage[];
  activeGift: ActiveGift | null;
  onlineCount: number;
  roomType?: 'free' | 'premium'; // 'free': closes when host leaves | 'premium' (2000 gold): permanent until 1 yr inactivity
  isPermanent?: boolean;
  createdAt?: number;
  lastActiveAt?: number;
  price?: number;
}

export interface MomentComment {
  id: string;
  userName: string;
  userAvatar: AvatarConfig;
  text: string;
  timeAgo: string;
}

export interface MomentPost {
  id: string;
  author: User;
  timeAgo: string;
  content: string;
  tag: string;
  image?: string;
  likes: number;
  hasLiked: boolean;
  comments: MomentComment[];
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'frame' | 'outfit' | 'accessory' | 'vip' | 'currency';
  price: number;
  currency: 'coins' | 'diamonds';
  icon: string;
  description: string;
  itemData?: any;
}

// ─── Real-time Multiplayer Game Types ───────────────────────────────────────

export interface GamePlayer {
  userId: string;
  username: string;
  avatarConfig: AvatarConfig;
  isReady: boolean;
  isBot: boolean;
  paidFee: boolean;
  joinedAt: number;
  score?: number;
}

export interface GameRoomMeta {
  gameType: GameType;
  status: 'waiting' | 'countdown' | 'playing' | 'finished';
  entryFee: number;        // cost in coins to join
  prizePool: number;       // accumulated entry fees
  minPlayers: number;
  maxPlayers: number;
  hostId: string;
  roomCode: string;        // 6-digit shareable code
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
  winnerId?: string;       // single winner
  winnerIds?: string[];    // team games
}

export interface GameRoom {
  id: string;
  meta: GameRoomMeta;
  players: Record<string, GamePlayer>;
  state: Record<string, any>;  // game-specific state blob
}

export const GAME_ENTRY_FEES: Record<GameType, number> = {
  ludo: 50,
  uno: 30,
  draw_guess: 20,
  werewolf: 40,
  spy: 30,
  mic_grab: 25,
  jackaroo: 50,
  trivia: 35,
};

export const GAME_MIN_PLAYERS: Record<GameType, number> = {
  ludo: 2,
  uno: 2,
  draw_guess: 2,
  werewolf: 4,
  spy: 3,
  mic_grab: 2,
  jackaroo: 2,
  trivia: 2,
};

export const GAME_MAX_PLAYERS: Record<GameType, number> = {
  ludo: 4,
  uno: 6,
  draw_guess: 6,
  werewolf: 6,
  spy: 6,
  mic_grab: 8,
  jackaroo: 4,
  trivia: 6,
};

export const PLATFORM_CUT = 0.10; // 10% platform fee


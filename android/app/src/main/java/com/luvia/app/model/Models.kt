package com.luvia.app.model

data class AvatarConfig(
    val skinColor: String = "#FFDCB1",
    val hairStyle: String = "kpop", // messy, kpop, curly, ponytail, short, anime
    val hairColor: String = "#3b2219",
    val eyeStyle: String = "sparkle", // sparkle, cool, wink, cute, determined
    val mouthStyle: String = "smile", // smile, laugh, smirk, neutral, bubblegum
    val outfit: String = "hoodie", // hoodie, streetwear, cyberpunk, suit, party_dress, space_suit
    val outfitColor: String = "#ec4899",
    val accessory: String = "gaming_headset", // none, cat_ears, gaming_headset, glasses, angel_wings, crown
    val frame: String = "gold_vip", // none, gold_vip, neon_fire, sakura, cyber_glow
    val customPhotoUrl: String? = null
)

data class CPPartner(
    val name: String = "LuviaPrensesi",
    val intimacyLevel: Int = 12,
    val ringType: String = "Elmas Aşk Yüzüğü",
    val daysTogether: Int = 45
)

data class User(
    val id: String = "user_main",
    val numericId: String = "8492015",
    val username: String = "Luvia_Star",
    val level: Int = 8,
    val exp: Int = 320,
    val maxExp: Int = 550,
    val totalExp: Int = 2100,
    val coins: Int = 15400,
    val diamonds: Int = 380,
    val charm: Int = 8940,
    val vipLevel: Int = 2,
    val avatarConfig: AvatarConfig = AvatarConfig(),
    val statusMessage: String = "Luvia Party dünyasına hoş geldiniz! 🎮✨",
    val followersCount: Int = 128,
    val followingCount: Int = 45,
    val gamesPlayed: Int = 64,
    val gamesWon: Int = 38,
    val cpPartner: CPPartner? = CPPartner()
)

enum class GameType(val id: String, val title: String, val turkishTitle: String, val minPlayers: Int, val maxPlayers: Int, val entryFee: Int, val iconEmoji: String) {
    WEREWOLF("werewolf", "Werewolf", "Uzay Vampiri / Kurtadam", 4, 6, 40, "🐺"),
    DRAW_GUESS("draw_guess", "Draw & Guess", "Çiz & Tahmin Et", 2, 6, 20, "🎨"),
    SPY("spy", "Who is the Spy?", "Casus Kim?", 3, 6, 30, "🕵️"),
    LUDO("ludo", "Ludo Party", "Kızma Birader", 2, 4, 50, "🎲"),
    MIC_GRAB("mic_grab", "Mic Grab", "Mikrofon Kapmaca", 2, 8, 25, "🎤"),
    UNO("uno", "Uno Party", "Renkli Kartlar", 2, 6, 30, "🃏"),
    JACKAROO("jackaroo", "Jackaroo", "Jackaroo Star", 2, 4, 50, "🎯"),
    TRIVIA("trivia", "Trivia Quiz", "Bilgi Yarışması", 2, 6, 35, "🧠")
}

data class RoomSeat(
    val seatIndex: Int,
    val user: User? = null,
    val isMuted: Boolean = false,
    val isSpeaking: Boolean = false,
    val micLevel: Int = 0,
    val isLocked: Boolean = false
)

data class RoomChatMessage(
    val id: String,
    val senderName: String,
    val text: String,
    val timestamp: String,
    val isSystem: Boolean = false,
    val isGift: Boolean = false,
    val senderVipLevel: Int = 1
)

data class ActiveGiftAnimation(
    val id: String,
    val senderName: String,
    val targetSeatIndex: Int,
    val targetUserName: String,
    val giftName: String,
    val giftEmoji: String,
    val quote: String,
    val charm: Int
)

data class VoiceRoom(
    val id: String,
    val title: String,
    val tag: String,
    val host: User,
    val bgTheme: String = "neon_night", // neon_night, cyber_bar, cozy_cafe, space_lounge, sakura_garden
    val seats: List<RoomSeat> = emptyList(),
    val onlineCount: Int = 24,
    val isPermanent: Boolean = false,
    val pkActive: Boolean = false,
    val pkRedScore: Int = 1250,
    val pkBlueScore: Int = 980
)

data class MomentComment(
    val id: String,
    val authorName: String,
    val text: String,
    val timeAgo: String
)

data class MomentPost(
    val id: String,
    val author: User,
    val timeAgo: String,
    val content: String,
    val tag: String,
    val likes: Int,
    val hasLiked: Boolean = false,
    val comments: List<MomentComment> = emptyList(),
    val mediaGradient: List<Long> = listOf(0xFF8B5CF6, 0xFFEC4899)
)

data class DirectMessage(
    val id: String,
    val senderId: String,
    val text: String,
    val timestamp: String,
    val isFromMe: Boolean,
    val isSticker: Boolean = false
)

data class ChatConversation(
    val id: String,
    val otherUser: User,
    val lastMessage: String,
    val timestamp: String,
    val unreadCount: Int = 0,
    val isOnline: Boolean = true
)

data class RoomGift(
    val id: String,
    val name: String,
    val price: Int,
    val category: String, // popular, special, vip, event
    val badge: String,
    val rarity: String, // common, rare, epic, legendary, mythic
    val description: String,
    val quote: String,
    val charm: Int,
    val emoji: String
)

data class FamilyMember(
    val user: User,
    val role: String, // Başkan, Yardımcı, Kıdemli, Üye
    val contribution: Int
)

data class Family(
    val id: String = "fam_1",
    val name: String = "⚔️ Gölge Savaşçıları",
    val tag: String = "[GÖLGE]",
    val level: Int = 5,
    val memberCount: Int = 28,
    val maxMembers: Int = 40,
    val announcement: String = "Akşam saat 21:00'de Oda PK'mız var! Herkesi bekliyoruz. 👑✨",
    val totalCharm: Int = 184500
)

data class VisitorEntry(
    val id: String,
    val visitor: User,
    val visitedTimeAgo: String,
    val charmGifted: Int = 0
)

package com.luvia.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.data.GiftsRepository
import com.luvia.app.model.*
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.modals.*
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun VoiceRoomDetailScreen(
    room: VoiceRoom,
    currentUser: User,
    onMinimize: () -> Unit,
    onLeaveRoom: () -> Unit,
    onSendGiftAction: (gift: RoomGift, targetSeatIndex: Int, targetUserName: String) -> Unit,
    onWinGameReward: (coins: Int, diamonds: Int, label: String) -> Unit
) {
    var isMicMuted by remember { mutableStateOf(false) }
    var chatInput by remember { mutableStateOf("") }
    var activeGiftAnim by remember { mutableStateOf<ActiveGiftAnimation?>(null) }

    // Modals in Room
    var showGiftSheet by remember { mutableStateOf(false) }
    var showLuckyWheel by remember { mutableStateOf(false) }
    var showPKBattle by remember { mutableStateOf(false) }
    var showRedPacket by remember { mutableStateOf(false) }
    var showBingo by remember { mutableStateOf(false) }
    var showMicWaitlist by remember { mutableStateOf(false) }

    val seats = remember {
        mutableStateListOf<RoomSeat>().apply {
            if (room.seats.isNotEmpty()) {
                addAll(room.seats)
            } else {
                for (i in 0..7) {
                    if (i == 0) add(RoomSeat(0, room.host, isSpeaking = true))
                    else if (i == 1) add(RoomSeat(1, User(username = "SiberKedi", avatarConfig = AvatarConfig(hairStyle = "anime", accessory = "cat_ears"))))
                    else if (i == 2) add(RoomSeat(2, User(username = "Prenses_Ada", avatarConfig = AvatarConfig(hairStyle = "curly", frame = "neon_fire"))))
                    else add(RoomSeat(i, null))
                }
            }
        }
    }

    val messages = remember {
        mutableStateListOf(
            RoomChatMessage("m1", "Sistem", "Odaya hoş geldiniz! Küfür ve hakaret yasaktır. 🎙️✨", "12:00", isSystem = true),
            RoomChatMessage("m2", room.host.username, "Hoş geldiniz arkadaşlar! Kimler burada? 🔥", "12:01", senderVipLevel = 2)
        )
    }

    // Gift animation timeout
    LaunchedEffect(activeGiftAnim) {
        if (activeGiftAnim != null) {
            delay(3500)
            activeGiftAnim = null
        }
    }

    Scaffold(
        containerColor = LuviaBgDark,
        topBar = {
            Surface(
                color = LuviaSurfaceDark.copy(alpha = 0.95f),
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onMinimize, modifier = Modifier.size(34.dp)) {
                            Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Küçült", tint = Color.White)
                        }

                        AvatarView(config = room.host.avatarConfig, size = 34.dp)

                        Spacer(modifier = Modifier.width(8.dp))

                        Column {
                            Text(room.title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            Text("ID: #${room.id.takeLast(5)} • 🟢 ${room.onlineCount} Dinleyici", color = TextSecondary, fontSize = 10.sp)
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = onLeaveRoom,
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(LuviaRed.copy(alpha = 0.2f))
                        ) {
                            Icon(Icons.Default.Close, contentDescription = "Ayrıl", tint = LuviaRed, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                // Room Activity Buttons Bar (PK, Lucky Wheel, Red Packet, Bingo, Waitlist)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf(
                        "wheel" to ("🎡 Çark" to { showLuckyWheel = true }),
                        "pk" to ("⚔️ PK" to { showPKBattle = true }),
                        "packet" to ("🧧 Zarf" to { showRedPacket = true }),
                        "bingo" to ("🎱 Tombala" to { showBingo = true }),
                        "waitlist" to ("🎙️ Sıra" to { showMicWaitlist = true })
                    ).forEach { (_, pair) ->
                        val (label, action) = pair
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(LuviaCardDark)
                                .border(1.dp, Color(0xFF334155), RoundedCornerShape(10.dp))
                                .clickable { action() }
                                .padding(horizontal = 8.dp, vertical = 5.dp)
                        ) {
                            Text(label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 8 Mic Seats Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(4),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(seats) { seat ->
                        val hasUser = seat.user != null
                        val isMe = seat.user?.id == currentUser.id

                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (hasUser) LuviaCardDark else LuviaCardDarker)
                                .border(1.dp, if (seat.isSpeaking) LuviaGreen else Color(0xFF334155), RoundedCornerShape(16.dp))
                                .clickable {
                                    if (!hasUser) {
                                        // Take seat
                                        seats[seat.seatIndex] = seat.copy(user = currentUser, isSpeaking = true)
                                        messages.add(
                                            RoomChatMessage(
                                                id = "m_${System.currentTimeMillis()}",
                                                senderName = "Sistem",
                                                text = "${currentUser.username} ${seat.seatIndex + 1}. Koltuğa Oturdu 🎙️",
                                                timestamp = "12:05",
                                                isSystem = true
                                            )
                                        )
                                    } else if (isMe) {
                                        // Leave seat
                                        seats[seat.seatIndex] = seat.copy(user = null, isSpeaking = false)
                                    }
                                }
                                .padding(vertical = 8.dp, horizontal = 4.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                if (hasUser) {
                                    AvatarView(
                                        config = seat.user!!.avatarConfig,
                                        size = 42.dp,
                                        isSpeaking = seat.isSpeaking
                                    )
                                    if (seat.seatIndex == 0) {
                                        Text("👑", fontSize = 12.sp, modifier = Modifier.align(Alignment.TopCenter).offset(y = (-8).dp))
                                    }
                                } else {
                                    Box(
                                        modifier = Modifier
                                            .size(42.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF1E293B)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(Icons.Default.Mic, contentDescription = null, tint = TextMuted, modifier = Modifier.size(20.dp))
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = if (hasUser) seat.user!!.username else "${seat.seatIndex + 1}. Koltuk",
                                color = if (hasUser) Color.White else TextMuted,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Chat Messages Feed
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .background(LuviaCardDarker)
                        .padding(8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    items(messages) { msg ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (msg.isGift) LuviaPink.copy(alpha = 0.15f) else Color.Transparent)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            if (!msg.isSystem) {
                                Text(
                                    text = "${msg.senderName}: ",
                                    color = if (msg.senderVipLevel > 1) LuviaGoldLight else LuviaCyanLight,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            Text(
                                text = msg.text,
                                color = if (msg.isSystem) LuviaGoldLight else if (msg.isGift) LuviaPinkLight else Color.White,
                                fontSize = 11.sp
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Bottom Chat & Gift Action Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Chat input
                    TextField(
                        value = chatInput,
                        onValueChange = { chatInput = it },
                        placeholder = { Text("Sohbete katıl...", color = TextMuted, fontSize = 11.sp) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = LuviaCardDark,
                            unfocusedContainerColor = LuviaCardDark,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.weight(1f)
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    // Send Chat Button
                    IconButton(
                        onClick = {
                            if (chatInput.isNotBlank()) {
                                messages.add(
                                    RoomChatMessage(
                                        id = "msg_${System.currentTimeMillis()}",
                                        senderName = currentUser.username,
                                        text = chatInput,
                                        timestamp = "12:06",
                                        senderVipLevel = currentUser.vipLevel
                                    )
                                )
                                chatInput = ""
                            }
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(LuviaPurple)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Gönder", tint = Color.White, modifier = Modifier.size(16.dp))
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    // Gift Button (Glowing Pink)
                    IconButton(
                        onClick = { showGiftSheet = true },
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Brush.radialGradient(listOf(LuviaPink, Color(0xFF9D174D))))
                            .border(1.5.dp, Color.White, CircleShape)
                            .testTag("room_gift_button")
                    ) {
                        Text("🎁", fontSize = 20.sp)
                    }
                }
            }

            // Big Screen-Wide Gift Animation Overlay
            activeGiftAnim?.let { giftAnim ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.6f)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(giftAnim.giftEmoji, fontSize = 84.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        Text(
                            text = "${giftAnim.senderName} ➔ ${giftAnim.targetUserName}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "${giftAnim.giftName} (+${giftAnim.charm} Cazibe) 💎",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            color = LuviaGoldLight
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "\"${giftAnim.quote}\"",
                            fontSize = 13.sp,
                            color = LuviaPinkLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }

    // Modals rendering
    if (showGiftSheet) {
        GiftSheetDialog(
            currentUser = currentUser,
            seats = seats,
            onDismiss = { showGiftSheet = false },
            onSendGift = { gift, targetIndex, targetName ->
                onSendGiftAction(gift, targetIndex, targetName)
                activeGiftAnim = ActiveGiftAnimation(
                    id = "anim_${System.currentTimeMillis()}",
                    senderName = currentUser.username,
                    targetSeatIndex = targetIndex,
                    targetUserName = targetName,
                    giftName = gift.name,
                    giftEmoji = gift.emoji,
                    quote = gift.quote,
                    charm = gift.charm
                )
                messages.add(
                    RoomChatMessage(
                        id = "gift_${System.currentTimeMillis()}",
                        senderName = currentUser.username,
                        text = "$targetName kullanıcısına ${gift.emoji} ${gift.name} hediye etti! (+${gift.charm} Cazibe) ✨",
                        timestamp = "12:07",
                        isGift = true
                    )
                )
            }
        )
    }

    if (showLuckyWheel) {
        LuckyWheelDialog(
            currentUser = currentUser,
            onDismiss = { showLuckyWheel = false },
            onWinReward = { coins, diamonds, label ->
                onWinGameReward(coins, diamonds, label)
            }
        )
    }

    if (showPKBattle) {
        PKBattleDialog(
            redScore = room.pkRedScore,
            blueScore = room.pkBlueScore,
            onDismiss = { showPKBattle = false },
            onBoostTeam = { isRed ->
                messages.add(
                    RoomChatMessage(
                        id = "pk_${System.currentTimeMillis()}",
                        senderName = currentUser.username,
                        text = if (isRed) "❤️ Kırmızı Takıma 100 Puan Destek Gönderdi!" else "💙 Mavi Takıma 100 Puan Destek Gönderdi!",
                        timestamp = "12:08",
                        isSystem = true
                    )
                )
            }
        )
    }

    if (showRedPacket) {
        RedPacketDialog(
            currentUser = currentUser,
            onDismiss = { showRedPacket = false },
            onSendPacket = { totalCoins, count ->
                messages.add(
                    RoomChatMessage(
                        id = "redpack_${System.currentTimeMillis()}",
                        senderName = currentUser.username,
                        text = "🧧 Odaya 🪙 $totalCoins Altın değerinde $count kişilik Kırmızı Kese attı! Hemen kapın!",
                        timestamp = "12:09",
                        isGift = true
                    )
                )
            },
            onGrabPacket = { coinsWon ->
                onWinGameReward(coinsWon, 0, "Kırmızı Kese")
            }
        )
    }

    if (showBingo) {
        BingoDialog(
            onDismiss = { showBingo = false },
            onBingoWin = { reward ->
                onWinGameReward(reward, 0, "Bingo Galibiyeti")
            }
        )
    }

    if (showMicWaitlist) {
        MicWaitlistDialog(
            onDismiss = { showMicWaitlist = false },
            onAcceptUser = { user ->
                val emptySeatIdx = seats.indexOfFirst { it.user == null }
                if (emptySeatIdx != -1) {
                    seats[emptySeatIdx] = RoomSeat(emptySeatIdx, user, isSpeaking = true)
                }
                showMicWaitlist = false
            }
        )
    }
}

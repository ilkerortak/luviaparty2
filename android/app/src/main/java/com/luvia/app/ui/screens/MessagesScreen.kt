package com.luvia.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.ChatConversation
import com.luvia.app.model.DirectMessage
import com.luvia.app.model.User
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

@Composable
fun MessagesScreen(
    currentUser: User
) {
    var activeConversation by remember { mutableStateOf<ChatConversation?>(null) }
    var chatInputText by remember { mutableStateOf("") }
    var showStickerKeyboard by remember { mutableStateOf(false) }

    val conversations = remember {
        mutableStateListOf(
            ChatConversation(
                id = "c1",
                otherUser = User(username = "Prenses_Ada", avatarConfig = AvatarConfig(hairStyle = "curly", frame = "neon_fire"), statusMessage = "Partideyiz!"),
                lastMessage = "Akşam Kurtadam oyununda beraber oynayalım mı? 🐺✨",
                timestamp = "14:20",
                unreadCount = 2,
                isOnline = true
            ),
            ChatConversation(
                id = "c2",
                otherUser = User(username = "Kral_Luvia", avatarConfig = AvatarConfig(hairStyle = "kpop", frame = "gold_vip"), statusMessage = "VIP Oda Sahibi"),
                lastMessage = "Odaya attığın hediye için çok teşekkürler! 🎁👑",
                timestamp = "Dün",
                unreadCount = 0,
                isOnline = true
            ),
            ChatConversation(
                id = "c3",
                otherUser = User(username = "SiberKedi", avatarConfig = AvatarConfig(hairStyle = "anime", accessory = "cat_ears")),
                lastMessage = "Çizim oyununda harika çizdin cidden! 🎨",
                timestamp = "2 gün önce",
                unreadCount = 0,
                isOnline = false
            )
        )
    }

    val directMessages = remember {
        mutableStateListOf(
            DirectMessage("m1", "other", "Selam! Luvia Party'ye hoş geldin 🎉", "14:18", isFromMe = false),
            DirectMessage("m2", "me", "Selamlar! Çok teşekkürler ✨", "14:19", isFromMe = true),
            DirectMessage("m3", "other", "Akşam Kurtadam oyununda beraber oynayalım mı? 🐺✨", "14:20", isFromMe = false)
        )
    }

    val partyStickers = listOf("💖", "🎉", "🔥", "👑", "🌹", "🧸", "🏎️", "🐉", "🍰", "💎", "✨", "🚀")

    if (activeConversation == null) {
        // Conversation List Screen
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(LuviaBgDark)
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            Text("💬 Sohbetler (Mesajlar)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Text("Arkadaşlarınla birebir özel mesajlaş", fontSize = 11.sp, color = TextSecondary)

            Spacer(modifier = Modifier.height(14.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(conversations) { conv ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(18.dp))
                            .background(LuviaCardDark)
                            .clickable {
                                activeConversation = conv
                                val idx = conversations.indexOf(conv)
                                if (idx != -1) conversations[idx] = conv.copy(unreadCount = 0)
                            }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(contentAlignment = Alignment.BottomEnd) {
                            AvatarView(config = conv.otherUser.avatarConfig, size = 46.dp)
                            if (conv.isOnline) {
                                Box(
                                    modifier = Modifier
                                        .size(12.dp)
                                        .clip(CircleShape)
                                        .background(LuviaGreen)
                                        .border(2.dp, LuviaCardDark, CircleShape)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(conv.otherUser.username, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text(conv.timestamp, color = TextMuted, fontSize = 10.sp)
                            }

                            Spacer(modifier = Modifier.height(3.dp))

                            Text(
                                text = conv.lastMessage,
                                color = if (conv.unreadCount > 0) Color.White else TextSecondary,
                                fontSize = 11.sp,
                                maxLines = 1,
                                fontWeight = if (conv.unreadCount > 0) FontWeight.Bold else FontWeight.Normal
                            )
                        }

                        if (conv.unreadCount > 0) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .size(18.dp)
                                    .clip(CircleShape)
                                    .background(LuviaPink),
                                contentAlignment = Alignment.Center
                            ) {
                                Text("${conv.unreadCount}", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    } else {
        // 1-on-1 Chat Detail Screen
        val conv = activeConversation!!
        Scaffold(
            containerColor = LuviaBgDark,
            topBar = {
                Surface(
                    color = LuviaSurfaceDark,
                    modifier = Modifier
                        .fillMaxWidth()
                        .statusBarsPadding()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { activeConversation = null }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                        }

                        AvatarView(config = conv.otherUser.avatarConfig, size = 36.dp)

                        Spacer(modifier = Modifier.width(8.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(conv.otherUser.username, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text(if (conv.isOnline) "🟢 Çevrimiçi" else "⚪ Son görülme yakınlarda", color = if (conv.isOnline) LuviaGreen else TextMuted, fontSize = 10.sp)
                        }
                    }
                }
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(10.dp)
            ) {
                // Messages List
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(directMessages) { msg ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = if (msg.isFromMe) Arrangement.End else Arrangement.Start
                        ) {
                            Box(
                                modifier = Modifier
                                    .widthIn(max = 260.dp)
                                    .clip(
                                        RoundedCornerShape(
                                            topStart = 16.dp,
                                            topEnd = 16.dp,
                                            bottomStart = if (msg.isFromMe) 16.dp else 4.dp,
                                            bottomEnd = if (msg.isFromMe) 4.dp else 16.dp
                                        )
                                    )
                                    .background(if (msg.isFromMe) LuviaPink else LuviaCardDark)
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = msg.text,
                                    color = Color.White,
                                    fontSize = if (msg.isSticker) 32.sp else 13.sp
                                )
                            }
                        }
                    }
                }

                // Quick Stickers Row
                if (showStickerKeyboard) {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(LuviaCardDark)
                            .padding(8.dp)
                    ) {
                        items(partyStickers) { sticker ->
                            Text(
                                text = sticker,
                                fontSize = 24.sp,
                                modifier = Modifier
                                    .clickable {
                                        directMessages.add(
                                            DirectMessage(
                                                id = "dm_${System.currentTimeMillis()}",
                                                senderId = currentUser.id,
                                                text = sticker,
                                                timestamp = "14:21",
                                                isFromMe = true,
                                                isSticker = true
                                            )
                                        )
                                    }
                                    .padding(4.dp)
                            )
                        }
                    }
                }

                // Input Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { showStickerKeyboard = !showStickerKeyboard },
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(LuviaCardDark)
                    ) {
                        Text("😊", fontSize = 16.sp)
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    TextField(
                        value = chatInputText,
                        onValueChange = { chatInputText = it },
                        placeholder = { Text("Mesaj yaz...", color = TextMuted, fontSize = 12.sp) },
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

                    IconButton(
                        onClick = {
                            if (chatInputText.isNotBlank()) {
                                directMessages.add(
                                    DirectMessage(
                                        id = "dm_${System.currentTimeMillis()}",
                                        senderId = currentUser.id,
                                        text = chatInputText,
                                        timestamp = "14:22",
                                        isFromMe = true
                                    )
                                )
                                chatInputText = ""
                            }
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShape)
                            .background(LuviaPink)
                    ) {
                        Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Gönder", tint = Color.White, modifier = Modifier.size(16.dp))
                    }
                }
            }
        }
    }
}

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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Lock
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
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.RoomSeat
import com.luvia.app.model.User
import com.luvia.app.model.VoiceRoom
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

@Composable
fun VoiceRoomsScreen(
    currentUser: User,
    onJoinRoom: (VoiceRoom) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("all") }
    var showCreateDialog by remember { mutableStateOf(false) }
    var newRoomTitle by remember { mutableStateOf("") }
    var newRoomTag by remember { mutableStateOf("Sohbet") }

    val initialRooms = remember {
        listOf(
            VoiceRoom(
                id = "room_1",
                title = "🌙 Gece Kuşları & Müzik Dinletisi",
                tag = "Müzik",
                host = User(username = "Kral_Luvia", avatarConfig = AvatarConfig(hairStyle = "kpop", frame = "gold_vip")),
                onlineCount = 42,
                seats = List(8) { idx ->
                    if (idx == 0) RoomSeat(idx, User(username = "Kral_Luvia", avatarConfig = AvatarConfig(hairStyle = "kpop", frame = "gold_vip")), isSpeaking = true)
                    else if (idx == 1) RoomSeat(idx, User(username = "GeceMeleği", avatarConfig = AvatarConfig(hairStyle = "ponytail", frame = "sakura")))
                    else RoomSeat(idx, null)
                },
                pkActive = true
            ),
            VoiceRoom(
                id = "room_2",
                title = "🔥 Kurtadam & Casus Kim Turnuva Odası",
                tag = "Oyun",
                host = User(username = "SiberKedi", avatarConfig = AvatarConfig(hairStyle = "anime", accessory = "cat_ears")),
                onlineCount = 28,
                seats = List(8) { idx ->
                    if (idx < 4) RoomSeat(idx, User(username = "Oyuncu_${idx+1}"), isSpeaking = idx == 2)
                    else RoomSeat(idx, null)
                }
            ),
            VoiceRoom(
                id = "room_3",
                title = "💖 Romantik CP & Tanışma Köşesi",
                tag = "Aşk & CP",
                host = User(username = "Prenses_Ada", avatarConfig = AvatarConfig(hairStyle = "curly", frame = "neon_fire")),
                onlineCount = 35,
                seats = List(8) { idx -> RoomSeat(idx, null) }
            ),
            VoiceRoom(
                id = "room_4",
                title = "👑 VIP Şampiyonlar & Hediye Yağmuru",
                tag = "VIP",
                host = User(username = "Milyoner_Efe", avatarConfig = AvatarConfig(hairStyle = "short", frame = "gold_vip", accessory = "crown")),
                onlineCount = 64,
                seats = List(8) { idx -> RoomSeat(idx, null) }
            )
        )
    }

    val rooms = remember { mutableStateListOf(*initialRooms.toTypedArray()) }

    val filteredRooms = rooms.filter {
        selectedCategory == "all" || it.tag == selectedCategory
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LuviaBgDark)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        // Top Action Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("🎙️ Sesli Parti Odaları", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Canlı sohbet et, şarkı söyle, hediyeleş!", fontSize = 11.sp, color = TextSecondary)
            }

            Button(
                onClick = { showCreateDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                shape = RoundedCornerShape(14.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.testTag("create_room_button")
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Oda Aç", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // Categories
        val categories = listOf("all" to "Tümü", "Sohbet" to "Sohbet", "Oyun" to "Oyun", "Müzik" to "Müzik", "Aşk & CP" to "Aşk & CP", "VIP" to "VIP")
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(categories) { (id, label) ->
                val isSel = selectedCategory == id
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSel) LuviaPurple else LuviaCardDark)
                        .border(1.dp, if (isSel) LuviaPink else Color.Transparent, RoundedCornerShape(12.dp))
                        .clickable { selectedCategory = id }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(label, color = if (isSel) Color.White else TextSecondary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Room Cards List
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(filteredRooms) { room ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(18.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(18.dp))
                        .clickable { onJoinRoom(room) }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    AvatarView(config = room.host.avatarConfig, size = 50.dp)

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = room.title,
                                color = Color.White,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                modifier = Modifier.weight(1f)
                            )
                            if (room.pkActive) {
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(LuviaRed)
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                ) {
                                    Text("PK Düello 🔥", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0xFF312E81))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("#${room.tag}", color = LuviaCyanLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Sahibi: ${room.host.username}", color = TextMuted, fontSize = 10.sp)
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Column(horizontalAlignment = Alignment.End) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(LuviaGreen.copy(alpha = 0.2f))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text("🟢 ${room.onlineCount}", color = LuviaGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    if (showCreateDialog) {
        AlertDialog(
            onDismissRequest = { showCreateDialog = false },
            title = { Text("🎙️ Yeni Sesli Oda Aç", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    TextField(
                        value = newRoomTitle,
                        onValueChange = { newRoomTitle = it },
                        placeholder = { Text("Oda Başlığı (örn: Sohbet & Müzik)", color = TextMuted) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = LuviaCardDark,
                            unfocusedContainerColor = LuviaCardDark,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newRoomTitle.isNotBlank()) {
                            val newRoom = VoiceRoom(
                                id = "room_${System.currentTimeMillis()}",
                                title = newRoomTitle,
                                tag = newRoomTag,
                                host = currentUser,
                                onlineCount = 1,
                                seats = List(8) { idx ->
                                    if (idx == 0) RoomSeat(idx, currentUser, isSpeaking = true)
                                    else RoomSeat(idx, null)
                                }
                            )
                            rooms.add(0, newRoom)
                            showCreateDialog = false
                            onJoinRoom(newRoom)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink)
                ) {
                    Text("Odayı Oluştur", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showCreateDialog = false }) {
                    Text("İptal", color = TextSecondary)
                }
            },
            containerColor = LuviaSurfaceDark
        )
    }
}

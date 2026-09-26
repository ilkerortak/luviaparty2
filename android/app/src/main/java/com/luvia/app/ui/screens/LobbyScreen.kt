package com.luvia.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.luvia.app.model.GameType
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

@Composable
fun LobbyScreen(
    currentUser: User,
    onSelectGame: (GameType) -> Unit,
    onOpenRoomLobby: (GameType) -> Unit
) {
    var quickMatchGame by remember { mutableStateOf<GameType?>(null) }
    var isMatching by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LuviaBgDark)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        // Hero Party Games Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(22.dp))
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFF831843),
                            Color(0xFF4C1D95),
                            Color(0xFF0F172A)
                        )
                    )
                )
                .border(1.dp, LuviaPink.copy(alpha = 0.5f), RoundedCornerShape(22.dp))
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🎮 ÇOK OYUNCULU PARTİ",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = LuviaPinkLight
                        )
                        Text(
                            text = "Arkadaşlarınla Oyna!",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(Brush.horizontalGradient(VipGoldGradient))
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = "🔥 4,290 Oyuncu Online",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Sesli odalarda arkadaşlarınla toplan, Kurtadam, Ludo, Çiz & Tahmin Et ve daha birçok oyunda altın kazan!",
                    fontSize = 11.sp,
                    color = TextSecondary,
                    lineHeight = 15.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text(
            text = "Popüler Parti Oyunları",
            fontSize = 16.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Games Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(GameType.values()) { game ->
                Column(
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(18.dp))
                        .clickable { onSelectGame(game) }
                        .padding(12.dp)
                        .testTag("game_card_${game.id}"),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(game.iconEmoji, fontSize = 36.sp)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = game.turkishTitle,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    Text(
                        text = "${game.minPlayers}-${game.maxPlayers} Oyuncu • 🪙 ${game.entryFee}",
                        color = LuviaGoldLight,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = { onSelectGame(game) },
                        colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(34.dp)
                    ) {
                        Text("Oyna ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }
            }
        }
    }
}

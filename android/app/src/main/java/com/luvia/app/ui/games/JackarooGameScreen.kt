package com.luvia.app.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

data class JackarooCard(
    val suit: String, // ♠, ♥, ♦, ♣
    val rank: String, // A, K, Q, J, 10, 7, 5, 4
    val specialRule: String
)

@Composable
fun JackarooGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    var playerMarblePosition by remember { mutableStateOf(0) }
    var gameLog by remember { mutableStateOf("Kartını seç ve bilyeni ilerlet!") }

    val handCards = remember {
        mutableStateListOf(
            JackarooCard("♠", "K", "Bilyeyi üsten piste çıkar veya 13 adım ilerlet"),
            JackarooCard("♥", "J", "Herhangi iki bilyenin yerini takas et (Swap)"),
            JackarooCard("♦", "7", "7 adımı iki bilye arasında bölüştür"),
            JackarooCard("♣", "4", "4 adım geri git")
        )
    }

    Scaffold(
        containerColor = LuviaBgDark,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = onExitGame) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                }
                Text("🎯 Jackaroo Star", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(LuviaPurple)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("Konum: $playerMarblePosition/16 📍", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Jackaroo Wooden Board Simulator
            Box(
                modifier = Modifier
                    .size(260.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF3F200A))
                    .border(4.dp, Color(0xFFB45309), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                // Circular Marble Slots
                val totalSlots = 16
                for (i in 0 until totalSlots) {
                    val angle = (i.toDouble() / totalSlots) * 2 * Math.PI
                    val radius = 100.0
                    val x = (Math.cos(angle) * radius).toInt()
                    val y = (Math.sin(angle) * radius).toInt()

                    val isPlayerHere = playerMarblePosition == i

                    Box(
                        modifier = Modifier
                            .offset(x = x.dp, y = y.dp)
                            .size(if (isPlayerHere) 26.dp else 18.dp)
                            .clip(CircleShape)
                            .background(if (isPlayerHere) LuviaPink else Color(0xFF1E293B))
                            .border(1.5.dp, if (isPlayerHere) Color.White else Color(0xFF78350F), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isPlayerHere) {
                            Text("🔮", fontSize = 11.sp)
                        }
                    }
                }

                // Board Center Crest
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("JACKAROO", color = LuviaGoldLight, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    Text("TAKIM OYUNU", color = TextSecondary, fontSize = 9.sp)
                }
            }

            Text(gameLog, color = LuviaGoldLight, fontSize = 13.sp, fontWeight = FontWeight.Bold)

            // Cards Hand
            Column(modifier = Modifier.fillMaxWidth()) {
                Text("Elinizdeki Taktik Kartlar:", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(handCards) { card ->
                        Column(
                            modifier = Modifier
                                .size(width = 85.dp, height = 120.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.White)
                                .clickable {
                                    val advance = when (card.rank) {
                                        "K" -> 13
                                        "J" -> 6
                                        "7" -> 7
                                        "4" -> -4
                                        else -> 5
                                    }
                                    playerMarblePosition = (playerMarblePosition + advance + 16) % 16
                                    gameLog = "${card.rank}${card.suit} oynadın: ${card.specialRule} 🎯"
                                    handCards.remove(card)
                                    if (playerMarblePosition == 0 && handCards.size < 3) {
                                        onGameWon(200, 300)
                                    }
                                }
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(card.rank, fontWeight = FontWeight.Black, fontSize = 14.sp, color = if (card.suit in listOf("♥", "♦")) Color.Red else Color.Black)
                                Text(card.suit, fontSize = 14.sp, color = if (card.suit in listOf("♥", "♦")) Color.Red else Color.Black)
                            }
                            Text(card.specialRule, fontSize = 8.sp, color = Color(0xFF334155), maxLines = 3, lineHeight = 10.sp)
                        }
                    }
                }
            }
        }
    }
}

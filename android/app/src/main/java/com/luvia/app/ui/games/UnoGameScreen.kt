package com.luvia.app.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import kotlin.random.Random

data class UnoCard(
    val color: Color,
    val colorName: String, // Red, Blue, Green, Yellow, Wild
    val value: String // "0".."9", "+2", "Skip", "Reverse", "+4", "Wild"
)

@Composable
fun UnoGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    var topCard by remember { mutableStateOf(UnoCard(Color(0xFFEF4444), "Red", "7")) }
    var calledUno by remember { mutableStateOf(false) }
    var gameLog by remember { mutableStateOf("Sıra sende! Uygun kartı at veya desteden çek.") }

    val myHand = remember {
        mutableStateListOf(
            UnoCard(Color(0xFFEF4444), "Red", "3"),
            UnoCard(Color(0xFF3B82F6), "Blue", "7"),
            UnoCard(Color(0xFF10B981), "Green", "+2"),
            UnoCard(Color(0xFFF59E0B), "Yellow", "5"),
            UnoCard(Color(0xFF8B5CF6), "Wild", "+4")
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
                Text("🃏 Uno Party (Renkli Kartlar)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Button(
                    onClick = {
                        calledUno = true
                        gameLog = "UNO DEDİN! 📣"
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaGold),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("UNO!", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 11.sp)
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
            // Opponents Hand Ticker
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                listOf("SiberKedi (3)", "OdaKralı (4)", "Prenses (2)").forEach { opp ->
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(LuviaCardDark)
                            .padding(horizontal = 10.dp, vertical = 6.dp)
                    ) {
                        Text(opp, color = TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Table Center: Draw Pile & Top Card
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                // Draw Deck Pile
                Box(
                    modifier = Modifier
                        .size(width = 75.dp, height = 110.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF1E293B))
                        .border(2.dp, Color(0xFF64748B), RoundedCornerShape(12.dp))
                        .clickable {
                            val colors = listOf(Color(0xFFEF4444) to "Red", Color(0xFF3B82F6) to "Blue", Color(0xFF10B981) to "Green", Color(0xFFF59E0B) to "Yellow")
                            val chosen = colors.random()
                            val newCard = UnoCard(chosen.first, chosen.second, "${Random.nextInt(0, 10)}")
                            myHand.add(newCard)
                            gameLog = "Desteden kart çektin: ${chosen.second} ${newCard.value} 🃏"
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text("DESTE\n➕", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                // Discard Top Card
                Box(
                    modifier = Modifier
                        .size(width = 85.dp, height = 125.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(topCard.color)
                        .border(3.dp, Color.White, RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = topCard.value,
                        color = Color.White,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black
                    )
                }
            }

            // Status message
            Text(gameLog, color = LuviaGoldLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)

            // Player's Card Hand
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Elinizdeki Kartlar (${myHand.size})", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(myHand) { card ->
                        val canPlay = card.colorName == topCard.colorName || card.value == topCard.value || card.colorName == "Wild"
                        Box(
                            modifier = Modifier
                                .size(width = 65.dp, height = 95.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(card.color)
                                .border(if (canPlay) 2.dp else 1.dp, if (canPlay) Color.White else Color.Transparent, RoundedCornerShape(10.dp))
                                .clickable(enabled = canPlay) {
                                    topCard = card
                                    myHand.remove(card)
                                    gameLog = "${card.colorName} ${card.value} oynadın! 🎴"
                                    if (myHand.isEmpty()) {
                                        gameLog = "🎉 TEBRİKLER! TÜM KARTLARI BİTİRDİN!"
                                        onGameWon(220, 300)
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = card.value,
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black
                            )
                        }
                    }
                }
            }
        }
    }
}

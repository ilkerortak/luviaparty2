package com.luvia.app.ui.games

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.random.Random

data class LudoToken(
    val id: Int,
    val playerIndex: Int, // 0: Red (Me), 1: Blue, 2: Green, 3: Yellow
    val stepPosition: Int = -1, // -1: Base, 0..51: Track, 52..57: Home stretch, 58: Finished
    val color: Color
)

@Composable
fun LudoGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var currentTurn by remember { mutableStateOf(0) } // 0: Player (Red), 1: Blue Bot, 2: Green Bot, 3: Yellow Bot
    var diceValue by remember { mutableStateOf(1) }
    var isRolling by remember { mutableStateOf(false) }
    var hasRolled by remember { mutableStateOf(false) }
    val diceRotation = remember { Animatable(0f) }
    var gameLog by remember { mutableStateOf("Sıra sende! Zarı at 🎲") }

    val tokens = remember {
        mutableStateListOf(
            LudoToken(0, 0, -1, Color(0xFFEF4444)),
            LudoToken(1, 0, -1, Color(0xFFEF4444)),
            LudoToken(2, 1, -1, Color(0xFF3B82F6)),
            LudoToken(3, 2, -1, Color(0xFF10B981)),
            LudoToken(4, 3, -1, Color(0xFFF59E0B))
        )
    }

    // Bot turns
    LaunchedEffect(currentTurn) {
        if (currentTurn != 0) {
            delay(1200)
            val botRoll = Random.nextInt(1, 7)
            diceValue = botRoll
            gameLog = "Oyuncu ${currentTurn + 1} zar attı: $botRoll 🎲"
            delay(1000)
            // Move bot token if 6 or in play
            val botTokenIndex = tokens.indexOfFirst { it.playerIndex == currentTurn }
            if (botTokenIndex != -1) {
                val tok = tokens[botTokenIndex]
                if (tok.stepPosition == -1 && botRoll == 6) {
                    tokens[botTokenIndex] = tok.copy(stepPosition = 0)
                } else if (tok.stepPosition >= 0) {
                    tokens[botTokenIndex] = tok.copy(stepPosition = (tok.stepPosition + botRoll).coerceAtMost(58))
                }
            }
            currentTurn = (currentTurn + 1) % 4
            if (currentTurn == 0) {
                gameLog = "Sıra tekrar sende! Zarı salla 🎯"
                hasRolled = false
            }
        }
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
                Text("🎲 Kızma Birader (Ludo Party)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (currentTurn == 0) LuviaGreen else LuviaCardDark)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = if (currentTurn == 0) "Senin Sıran 🟢" else "Bekleniyor ⏳",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (currentTurn == 0) Color.Black else TextSecondary
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Ludo Board Grid View
            Box(
                modifier = Modifier
                    .size(290.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(LuviaCardDark)
                    .border(2.dp, LuviaPink.copy(alpha = 0.5f), RoundedCornerShape(20.dp)),
                contentAlignment = Alignment.Center
            ) {
                // 4 Base corners
                Column(modifier = Modifier.fillMaxSize()) {
                    Row(modifier = Modifier.weight(1f)) {
                        // Red Base (Me)
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(Color(0xFFEF4444).copy(alpha = 0.35f))
                                .border(1.dp, Color(0xFFEF4444)),
                            contentAlignment = Alignment.Center
                        ) {
                            val myTokens = tokens.filter { it.playerIndex == 0 }
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                myTokens.forEach { tok ->
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFFEF4444))
                                            .border(2.dp, Color.White, CircleShape)
                                            .clickable(enabled = hasRolled && currentTurn == 0) {
                                                if (tok.stepPosition == -1 && diceValue == 6) {
                                                    val idx = tokens.indexOf(tok)
                                                    tokens[idx] = tok.copy(stepPosition = 0)
                                                    gameLog = "Piyon piste çıktı! 🚀"
                                                } else if (tok.stepPosition >= 0) {
                                                    val idx = tokens.indexOf(tok)
                                                    val nextPos = tok.stepPosition + diceValue
                                                    tokens[idx] = tok.copy(stepPosition = nextPos)
                                                    if (nextPos >= 58) {
                                                        gameLog = "Piyon eve ulaştı! Zafer! 🏆"
                                                        onGameWon(250, 350)
                                                    }
                                                }
                                                currentTurn = 1
                                                hasRolled = false
                                            },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(if (tok.stepPosition == -1) "🏠" else "${tok.stepPosition}", fontSize = 10.sp)
                                    }
                                }
                            }
                        }

                        // Green Base
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(Color(0xFF10B981).copy(alpha = 0.35f))
                                .border(1.dp, Color(0xFF10B981)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Yeşil Ev 🏠", color = Color.White, fontSize = 11.sp)
                        }
                    }

                    Row(modifier = Modifier.weight(1f)) {
                        // Blue Base
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(Color(0xFF3B82F6).copy(alpha = 0.35f))
                                .border(1.dp, Color(0xFF3B82F6)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Mavi Ev 🏠", color = Color.White, fontSize = 11.sp)
                        }

                        // Yellow Base
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .background(Color(0xFFF59E0B).copy(alpha = 0.35f))
                                .border(1.dp, Color(0xFFF59E0B)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("Sarı Ev 🏠", color = Color.White, fontSize = 11.sp)
                        }
                    }
                }

                // Center Finish Area
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Brush.radialGradient(listOf(LuviaGold, Color.Black))),
                    contentAlignment = Alignment.Center
                ) {
                    Text("👑\nHEDEF", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color.White)
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Game Log
            Text(gameLog, color = LuviaGoldLight, fontSize = 13.sp, fontWeight = FontWeight.Bold)

            Spacer(modifier = Modifier.height(16.dp))

            // Interactive 3D Dice Roller
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .rotate(diceRotation.value)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.White)
                    .border(3.dp, LuviaPink, RoundedCornerShape(16.dp))
                    .clickable(enabled = currentTurn == 0 && !hasRolled && !isRolling) {
                        isRolling = true
                        coroutineScope.launch {
                            diceRotation.animateTo(
                                targetValue = diceRotation.value + 720f,
                                animationSpec = tween(600, easing = LinearEasing)
                            )
                            val roll = Random.nextInt(1, 7)
                            diceValue = roll
                            isRolling = false
                            hasRolled = true
                            gameLog = if (roll == 6) "Zar: 6! 🎉 Piyonunu çıkar veya ilerlet!" else "Zar: $roll! İlerletmek için piyonuna dokun."
                        }
                    },
                contentAlignment = Alignment.Center
            ) {
                val diceEmoji = when (diceValue) {
                    1 -> "⚀"
                    2 -> "⚁"
                    3 -> "⚂"
                    4 -> "⚃"
                    5 -> "⚄"
                    else -> "⚅"
                }
                Text(diceEmoji, fontSize = 48.sp, color = Color(0xFF0F172A))
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = if (currentTurn == 0 && !hasRolled) "Zar atmak için tıkla! 🎲" else "Zar Değeri: $diceValue",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

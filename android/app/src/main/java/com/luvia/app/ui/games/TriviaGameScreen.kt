package com.luvia.app.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.data.GameDataRepository
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun TriviaGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    val questions = remember { GameDataRepository.TRIVIA_QUESTIONS }
    var currentIndex by remember { mutableStateOf(0) }
    var timer by remember { mutableStateOf(10) }
    var selectedOptionIndex by remember { mutableStateOf<Int?>(null) }
    var userScore by remember { mutableStateOf(0) }
    var streak by remember { mutableStateOf(0) }

    val currentQ = questions[currentIndex % questions.size]

    LaunchedEffect(currentIndex, selectedOptionIndex) {
        if (selectedOptionIndex == null) {
            timer = 10
            while (timer > 0) {
                delay(1000)
                timer--
            }
            if (selectedOptionIndex == null) {
                selectedOptionIndex = -1 // Timed out
                streak = 0
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
                Text("🧠 Bilgi Yarışması (Trivia)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(LuviaGold)
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text("Puan: $userScore ⭐", color = Color.Black, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Category & Timer Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Kategori: ${currentQ.category} 📚", color = LuviaCyanLight, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("⏱️ $timer s", color = if (timer < 4) LuviaRed else LuviaPinkLight, fontSize = 14.sp, fontWeight = FontWeight.Black)
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Question Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF312E81).copy(alpha = 0.6f), Color(0xFF1E1B4B).copy(alpha = 0.6f))
                        )
                    )
                    .border(1.5.dp, LuviaPurple, RoundedCornerShape(20.dp))
                    .padding(20.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = currentQ.question,
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 22.sp
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 4 Options
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                currentQ.options.forEachIndexed { index, option ->
                    val isChosen = selectedOptionIndex == index
                    val isCorrect = index == currentQ.correctIndex
                    val hasAnswered = selectedOptionIndex != null

                    Button(
                        onClick = {
                            if (!hasAnswered) {
                                selectedOptionIndex = index
                                if (isCorrect) {
                                    streak++
                                    val points = 100 + streak * 20
                                    userScore += points
                                    onGameWon(points, points)
                                } else {
                                    streak = 0
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = when {
                                hasAnswered && isCorrect -> LuviaGreen
                                hasAnswered && isChosen && !isCorrect -> LuviaRed
                                else -> LuviaCardDark
                            }
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        Text(
                            text = option,
                            color = if (hasAnswered && (isCorrect || isChosen)) Color.White else Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            if (selectedOptionIndex != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = currentQ.explanation,
                    color = LuviaGoldLight,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = {
                        currentIndex++
                        selectedOptionIndex = null
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text("Sonraki Soru ➔", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

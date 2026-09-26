package com.luvia.app.ui.games

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
fun MicGrabGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    val songs = remember { GameDataRepository.MIC_GRAB_SONGS }
    var currentSongIndex by remember { mutableStateOf(0) }
    var userScore by remember { mutableStateOf(0) }
    var hasGrabbedMic by remember { mutableStateOf(false) }
    var grabCountdown by remember { mutableStateOf(10) }
    var answeredResult by remember { mutableStateOf<Boolean?>(null) }
    var answerTimeout by remember { mutableStateOf(5) }

    val currentSong = songs[currentSongIndex % songs.size]

    LaunchedEffect(currentSongIndex, hasGrabbedMic) {
        if (!hasGrabbedMic) {
            grabCountdown = 8
            while (grabCountdown > 0) {
                delay(1000)
                grabCountdown--
            }
        } else {
            answerTimeout = 5
            while (answerTimeout > 0) {
                delay(1000)
                answerTimeout--
            }
            if (answeredResult == null) {
                // Time's up
                answeredResult = false
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
                Text("🎤 Mikrofon Kapmaca", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(LuviaPink)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text("Puan: $userScore ⭐", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
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
            // Song Info Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        Brush.linearGradient(
                            listOf(Color(0xFF831843).copy(alpha = 0.6f), Color(0xFF4C1D95).copy(alpha = 0.6f))
                        )
                    )
                    .border(1.5.dp, LuviaPink, RoundedCornerShape(20.dp))
                    .padding(18.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎵 ${currentSong.artist} — ${currentSong.title}", color = LuviaCyanLight, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text(
                        text = "\"${currentSong.lyricSnippet}\"",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 24.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (!hasGrabbedMic) {
                // Big Grab Mic Buzzer
                Box(
                    modifier = Modifier
                        .size(130.dp)
                        .clip(CircleShape)
                        .background(Brush.radialGradient(listOf(LuviaPink, Color(0xFF9D174D))))
                        .border(4.dp, Color.White, CircleShape)
                        .clickable {
                            hasGrabbedMic = true
                            answeredResult = null
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("🎤", fontSize = 38.sp)
                        Text("KAP!", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Black)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "Mikrofonu kapmak için butona bas! ($grabCountdown s)",
                    color = LuviaGoldLight,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            } else {
                // Answer Options
                Text(
                    text = "Boşluğa gelecek kelimeyi seç! (${answerTimeout}s ⏱️)",
                    color = LuviaCyanLight,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    currentSong.options.forEach { option ->
                        val isCorrect = option == currentSong.missingWord
                        val isChosen = answeredResult != null

                        Button(
                            onClick = {
                                if (answeredResult == null) {
                                    val win = option == currentSong.missingWord
                                    answeredResult = win
                                    if (win) {
                                        userScore += 100
                                        onGameWon(100, 150)
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isChosen) {
                                    if (isCorrect) LuviaGreen else Color(0xFF334155)
                                } else LuviaCardDark
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                        ) {
                            Text(
                                text = option,
                                color = if (isChosen && isCorrect) Color.Black else Color.White,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                if (answeredResult != null) {
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = if (answeredResult == true) "🎉 Tebrikler! Doğru Cevap! (+100 Puan)" else "❌ Yanlış veya Süre Doldu!",
                        color = if (answeredResult == true) LuviaGreen else LuviaRed,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            currentSongIndex++
                            hasGrabbedMic = false
                            answeredResult = null
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Sonraki Şarkı ➔", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

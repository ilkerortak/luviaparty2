package com.luvia.app.ui.games

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay

data class DrawPathSegment(
    val start: Offset,
    val end: Offset,
    val color: Color,
    val strokeWidth: Float
)

data class GuessMessage(
    val sender: String,
    val text: String,
    val isCorrect: Boolean = false
)

@Composable
fun DrawAndGuessScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    var secretWord by remember { mutableStateOf("KEDİ") }
    var isDrawer by remember { mutableStateOf(true) }
    var brushColor by remember { mutableStateOf(Color.White) }
    var brushWidth by remember { mutableStateOf(8f) }
    val paths = remember { mutableStateListOf<DrawPathSegment>() }
    var lastPoint by remember { mutableStateOf<Offset?>(null) }
    var guessInput by remember { mutableStateOf("") }
    var timeLeft by remember { mutableStateOf(60) }
    var hasSolved by remember { mutableStateOf(false) }

    val messages = remember {
        mutableStateListOf(
            GuessMessage("Sistem", "Oyun başladı! Gizli kelimeyi çiz veya tahmin et 🎨"),
            GuessMessage("SiberKedi", "Köpek mi?"),
            GuessMessage("OdaKralı", "Aslan?")
        )
    }

    val availableColors = listOf(
        Color.White, Color(0xFFEF4444), Color(0xFF3B82F6),
        Color(0xFF10B981), Color(0xFFF59E0B), Color(0xFF8B5CF6), Color(0xFF06B6D4)
    )

    LaunchedEffect(Unit) {
        while (timeLeft > 0) {
            delay(1000)
            timeLeft--
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
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🎨 Çiz & Tahmin Et", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(
                        text = if (isDrawer) "Gizli Kelime: $secretWord 💡" else "Kelime: _ _ _ _ (${secretWord.length} Harf)",
                        fontSize = 12.sp,
                        color = LuviaGoldLight,
                        fontWeight = FontWeight.Bold
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (timeLeft < 15) LuviaRed else LuviaPurple)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text("⏱️ $timeLeft s", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            // Interactive Drawing Canvas
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF13172B))
                    .border(2.dp, LuviaPink.copy(alpha = 0.5f), RoundedCornerShape(20.dp))
                    .pointerInput(Unit) {
                        detectDragGestures(
                            onDragStart = { offset -> lastPoint = offset },
                            onDragEnd = { lastPoint = null },
                            onDragCancel = { lastPoint = null },
                            onDrag = { change, _ ->
                                lastPoint?.let { prev ->
                                    val current = change.position
                                    paths.add(DrawPathSegment(prev, current, brushColor, brushWidth))
                                    lastPoint = current
                                }
                            }
                        )
                    }
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    paths.forEach { segment ->
                        drawLine(
                            color = segment.color,
                            start = segment.start,
                            end = segment.end,
                            strokeWidth = segment.strokeWidth,
                            cap = StrokeCap.Round
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Brush Palette & Clear Toolbar
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(availableColors) { col ->
                        val isSel = brushColor == col
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(col)
                                .border(2.dp, if (isSel) LuviaCyan else Color.Transparent, CircleShape)
                                .clickable { brushColor = col }
                        )
                    }
                }

                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(
                        onClick = { paths.clear() },
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(LuviaCardDark)
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = "Temizle", tint = LuviaRed, modifier = Modifier.size(18.dp))
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Live Guess Chat List
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(LuviaCardDark)
                    .padding(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(messages) { msg ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (msg.isCorrect) LuviaGreen.copy(alpha = 0.2f) else Color.Transparent)
                            .padding(horizontal = 6.dp, vertical = 3.dp)
                    ) {
                        Text(
                            text = "${msg.sender}: ",
                            fontWeight = FontWeight.Bold,
                            color = if (msg.isCorrect) LuviaGreen else LuviaPinkLight,
                            fontSize = 12.sp
                        )
                        Text(
                            text = msg.text,
                            color = if (msg.isCorrect) LuviaGreen else Color.White,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Guess Input Box
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextField(
                    value = guessInput,
                    onValueChange = { guessInput = it },
                    placeholder = { Text("Tahminini buraya yaz...", color = TextMuted, fontSize = 12.sp) },
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

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = {
                        if (guessInput.isNotBlank()) {
                            val isCorrect = guessInput.trim().equals(secretWord, ignoreCase = true)
                            messages.add(
                                GuessMessage(
                                    currentUser.username,
                                    if (isCorrect) "Tebrikler! Doğru Tahmin Etti: $secretWord 🎉" else guessInput,
                                    isCorrect
                                )
                            )
                            if (isCorrect && !hasSolved) {
                                hasSolved = true
                                onGameWon(150, 200)
                            }
                            guessInput = ""
                        }
                    },
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(LuviaPink)
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Gönder", tint = Color.White, modifier = Modifier.size(18.dp))
                }
            }
        }
    }
}

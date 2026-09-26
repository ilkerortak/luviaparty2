package com.luvia.app.ui.modals

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.launch
import kotlin.random.Random

data class WheelPrize(
    val label: String,
    val emoji: String,
    val color: Color,
    val coinReward: Int = 0,
    val diamondReward: Int = 0
)

@Composable
fun LuckyWheelDialog(
    currentUser: User,
    onDismiss: () -> Unit,
    onWinReward: (coins: Int, diamonds: Int, prizeName: String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var isSpinning by remember { mutableStateOf(false) }
    var winResult by remember { mutableStateOf<String?>(null) }
    val rotationAngle = remember { Animatable(0f) }

    val prizes = listOf(
        WheelPrize("500 Altın", "🪙", Color(0xFFEC4899), coinReward = 500),
        WheelPrize("20 Elmas", "💎", Color(0xFF8B5CF6), diamondReward = 20),
        WheelPrize("1000 Altın", "🪙", Color(0xFF06B6D4), coinReward = 1000),
        WheelPrize("50 Elmas", "💎", Color(0xFFF59E0B), diamondReward = 50),
        WheelPrize("2500 Altın", "💰", Color(0xFF10B981), coinReward = 2500),
        WheelPrize("Aşk Mektubu", "💌", Color(0xFFEF4444), coinReward = 300),
        WheelPrize("5000 Altın", "👑", Color(0xFFFFD700), coinReward = 5000),
        WheelPrize("100 Elmas", "✨", Color(0xFF6366F1), diamondReward = 100)
    )

    val spinCost = 100 // 100 coins

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaGold.copy(alpha = 0.6f), RoundedCornerShape(28.dp)),
            color = LuviaSurfaceDark
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("🎡 Şans Çarkı (Lucky Wheel)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Wheel Canvas
                Box(
                    modifier = Modifier.size(220.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Canvas(
                        modifier = Modifier
                            .fillMaxSize()
                            .rotate(rotationAngle.value)
                    ) {
                        val sliceAngle = 360f / prizes.size
                        prizes.forEachIndexed { index, prize ->
                            drawArc(
                                color = prize.color,
                                startAngle = index * sliceAngle,
                                sweepAngle = sliceAngle,
                                useCenter = true,
                                size = size
                            )
                        }
                    }

                    // Pointer Indicator at top
                    Text(
                        text = "🔻",
                        fontSize = 28.sp,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .offset(y = (-14).dp)
                    )

                    // Center Hub Button
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(Brush.radialGradient(VipGoldGradient))
                            .border(2.dp, Color.White, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("SPIN\n🎯", fontSize = 11.sp, fontWeight = FontWeight.Black, color = Color.Black)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (winResult != null) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(LuviaGreen.copy(alpha = 0.2f))
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("🎉 Kazandınız: $winResult", color = LuviaGreen, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.height(10.dp))
                }

                // Spin Action Button
                val canSpin = currentUser.coins >= spinCost && !isSpinning
                Button(
                    onClick = {
                        if (canSpin) {
                            isSpinning = true
                            winResult = null
                            coroutineScope.launch {
                                val prizeIndex = Random.nextInt(prizes.size)
                                val winningPrize = prizes[prizeIndex]
                                val fullSpins = 5 * 360f
                                val targetAngle = fullSpins + (360f - (prizeIndex * (360f / prizes.size) + (360f / prizes.size / 2f)))
                                rotationAngle.animateTo(
                                    targetValue = rotationAngle.value + targetAngle,
                                    animationSpec = tween(3500, easing = FastOutSlowInEasing)
                                )
                                isSpinning = false
                                winResult = winningPrize.label
                                onWinReward(winningPrize.coinReward, winningPrize.diamondReward, winningPrize.label)
                            }
                        }
                    },
                    enabled = canSpin,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LuviaGold,
                        disabledContainerColor = Color(0xFF334155)
                    ),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(46.dp)
                ) {
                    Text(
                        text = if (isSpinning) "Çark Dönüyor... 🌀" else "Çarkı Çevir (🪙 $spinCost Altın)",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (canSpin) Color.Black else TextSecondary
                    )
                }
            }
        }
    }
}

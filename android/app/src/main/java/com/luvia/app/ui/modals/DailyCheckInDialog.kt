package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.ui.theme.*

data class CheckInDayReward(
    val day: Int,
    val coins: Int,
    val diamonds: Int,
    val exp: Int,
    val specialItem: String? = null
)

@Composable
fun DailyCheckInDialog(
    currentStreak: Int = 3,
    hasClaimedToday: Boolean = false,
    onDismiss: () -> Unit,
    onClaimReward: (CheckInDayReward) -> Unit
) {
    var claimed by remember { mutableStateOf(hasClaimedToday) }
    var streak by remember { mutableStateOf(currentStreak) }

    val rewards = listOf(
        CheckInDayReward(1, 200, 5, 50),
        CheckInDayReward(2, 400, 10, 80),
        CheckInDayReward(3, 600, 15, 120),
        CheckInDayReward(4, 800, 20, 150),
        CheckInDayReward(5, 1200, 30, 200),
        CheckInDayReward(6, 1800, 40, 250),
        CheckInDayReward(7, 3000, 80, 500, "👑 1 Günlük Altın VIP")
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaPink.copy(alpha = 0.5f), RoundedCornerShape(28.dp)),
            color = LuviaSurfaceDark
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "🎁 Günlük Giriş Ödülleri",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Giriş serisi: $streak Gün 🔥",
                            fontSize = 12.sp,
                            color = LuviaGoldLight,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 7 Days Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(4),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    itemsIndexed(rewards) { index, reward ->
                        val isCurrent = index == streak && !claimed
                        val isPassed = index < streak

                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(
                                    when {
                                        isCurrent -> Brush.verticalGradient(listOf(LuviaPink.copy(alpha = 0.3f), LuviaSurfaceDark))
                                        isPassed -> Brush.verticalGradient(listOf(LuviaGreen.copy(alpha = 0.2f), LuviaCardDark))
                                        else -> Brush.verticalGradient(listOf(LuviaCardDark, LuviaCardDarker))
                                    }
                                )
                                .border(
                                    if (isCurrent) 1.5.dp else 1.dp,
                                    if (isCurrent) LuviaPink else if (isPassed) LuviaGreen else Color(0xFF334155),
                                    RoundedCornerShape(14.dp)
                                )
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Gün ${reward.day}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isCurrent) LuviaPinkLight else if (isPassed) LuviaGreen else TextSecondary
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = if (reward.specialItem != null) "👑" else if (reward.diamonds > 0) "💎" else "🪙",
                                fontSize = 20.sp
                            )

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = "+${reward.coins}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = LuviaGoldLight
                            )

                            if (isPassed) {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = null,
                                    tint = LuviaGreen,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Claim Button
                Button(
                    onClick = {
                        if (!claimed && streak < rewards.size) {
                            val rew = rewards[streak]
                            onClaimReward(rew)
                            claimed = true
                            streak += 1
                        }
                    },
                    enabled = !claimed,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LuviaPink,
                        disabledContainerColor = Color(0xFF334155)
                    ),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(
                        text = if (claimed) "Bugünkü Ödül Alındı ✨" else "Bugünkü Ödülü Al (${rewards.getOrNull(streak)?.coins ?: 500} Altın)",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

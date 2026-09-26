package com.luvia.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

@Composable
fun TopBar(
    user: User,
    isMuted: Boolean,
    onToggleMute: () -> Unit,
    onOpenShop: () -> Unit,
    onOpenCheckIn: () -> Unit,
    onOpenLeaderboard: () -> Unit,
    onProfileClick: () -> Unit
) {
    Surface(
        color = LuviaSurfaceDark.copy(alpha = 0.95f),
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // User Avatar & Level info
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .clickable { onProfileClick() }
                    .padding(4.dp)
            ) {
                AvatarView(
                    config = user.avatarConfig,
                    size = 38.dp
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = user.username,
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        // VIP badge
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Brush.horizontalGradient(VipGoldGradient))
                                .padding(horizontal = 4.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "VIP ${user.vipLevel}",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.Black
                            )
                        }
                    }

                    // Level & EXP Progress
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(top = 2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(LuviaPurple)
                                .padding(horizontal = 4.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "Lv.${user.level}",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(4.dp))
                        Box(
                            modifier = Modifier
                                .width(48.dp)
                                .height(5.dp)
                                .clip(RoundedCornerShape(3.dp))
                                .background(Color(0xFF334155))
                        ) {
                            val progress = if (user.maxExp > 0) user.exp.toFloat() / user.maxExp.toFloat() else 0f
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(progress.coerceIn(0f, 1f))
                                    .background(Brush.horizontalGradient(listOf(LuviaPink, LuviaCyan)))
                            )
                        }
                    }
                }
            }

            // Balances & Actions
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                // Gold Coins Pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, LuviaGold.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .clickable { onOpenShop() }
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                        .testTag("coins_pill")
                ) {
                    Text("🪙", fontSize = 11.sp)
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "${user.coins}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = LuviaGoldLight
                    )
                }

                // Diamonds Pill
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, LuviaCyan.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .clickable { onOpenShop() }
                        .padding(horizontal = 7.dp, vertical = 4.dp)
                        .testTag("diamonds_pill")
                ) {
                    Text("💎", fontSize = 11.sp)
                    Spacer(modifier = Modifier.width(3.dp))
                    Text(
                        text = "${user.diamonds}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = LuviaCyanLight
                    )
                }

                // Daily Check-in Button
                IconButton(
                    onClick = onOpenCheckIn,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(LuviaCardDark)
                        .testTag("checkin_button")
                ) {
                    Text("🎁", fontSize = 14.sp)
                }

                // Leaderboard Button
                IconButton(
                    onClick = onOpenLeaderboard,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(LuviaCardDark)
                        .testTag("leaderboard_button")
                ) {
                    Text("🏆", fontSize = 14.sp)
                }

                // Sound Toggle Button
                IconButton(
                    onClick = onToggleMute,
                    modifier = Modifier
                        .size(34.dp)
                        .clip(CircleShape)
                        .background(if (isMuted) Color(0xFF334155) else LuviaPink.copy(alpha = 0.2f))
                        .border(1.dp, if (isMuted) Color.Transparent else LuviaPink.copy(alpha = 0.5f), CircleShape)
                        .testTag("sound_toggle")
                ) {
                    Text(if (isMuted) "🔇" else "🔊", fontSize = 13.sp)
                }
            }
        }
    }
}

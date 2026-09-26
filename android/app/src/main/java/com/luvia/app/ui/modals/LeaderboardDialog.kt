package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
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
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.User
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

data class LeaderboardUser(
    val rank: Int,
    val name: String,
    val scoreText: String,
    val subText: String,
    val avatarConfig: AvatarConfig,
    val vipLevel: Int = 1
)

@Composable
fun LeaderboardDialog(
    currentUser: User,
    onDismiss: () -> Unit
) {
    var selectedTab by remember { mutableStateOf("charm") } // charm, wealth, wins

    val charmLeaders = listOf(
        LeaderboardUser(1, "Kral_Luvia", "148,920 Cazibe", "99+ Hediye", AvatarConfig(hairStyle = "kpop", frame = "gold_vip"), 5),
        LeaderboardUser(2, "GeceMeleği", "112,450 Cazibe", "84 Hediye", AvatarConfig(hairStyle = "ponytail", frame = "sakura", accessory = "angel_wings"), 4),
        LeaderboardUser(3, "SiberLord", "94,100 Cazibe", "62 Hediye", AvatarConfig(hairStyle = "anime", frame = "cyber_glow", accessory = "gaming_headset"), 3),
        LeaderboardUser(4, "Prenses_Ada", "78,300 Cazibe", "48 Hediye", AvatarConfig(hairStyle = "curly", frame = "neon_fire"), 2),
        LeaderboardUser(5, currentUser.username, "${currentUser.charm} Cazibe", "Sen", currentUser.avatarConfig, currentUser.vipLevel)
    )

    val wealthLeaders = listOf(
        LeaderboardUser(1, "Milyoner_Efe", "2,450,000 Altın", "VIP 6", AvatarConfig(hairStyle = "short", frame = "gold_vip", accessory = "crown"), 6),
        LeaderboardUser(2, "KriptoKraliçe", "1,890,000 Altın", "VIP 5", AvatarConfig(hairStyle = "kpop", frame = "cyber_glow"), 5),
        LeaderboardUser(3, "Gölge_Avcı", "1,120,000 Altın", "VIP 4", AvatarConfig(hairStyle = "messy", frame = "neon_fire"), 4),
        LeaderboardUser(4, currentUser.username, "${currentUser.coins} Altın", "Sen", currentUser.avatarConfig, currentUser.vipLevel)
    )

    val winLeaders = listOf(
        LeaderboardUser(1, "Kurtadam_Ustadı", "412 Zafer", "%78 Kazanma", AvatarConfig(hairStyle = "messy", frame = "neon_fire"), 4),
        LeaderboardUser(2, "Ludo_Kralı", "365 Zafer", "%72 Kazanma", AvatarConfig(hairStyle = "kpop", frame = "gold_vip"), 3),
        LeaderboardUser(3, "ÇizimDahisi", "298 Zafer", "%68 Kazanma", AvatarConfig(hairStyle = "anime", frame = "sakura"), 2),
        LeaderboardUser(4, currentUser.username, "${currentUser.gamesWon} Zafer", "Sen (${currentUser.gamesPlayed} Oyun)", currentUser.avatarConfig, currentUser.vipLevel)
    )

    val activeList = when (selectedTab) {
        "wealth" -> wealthLeaders
        "wins" -> winLeaders
        else -> charmLeaders
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaGold.copy(alpha = 0.5f), RoundedCornerShape(28.dp)),
            color = LuviaSurfaceDark
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🏆 Luvia Sıralaması",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Tabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf(
                        "charm" to "✨ Cazibe Kralı",
                        "wealth" to "💰 Zenginler",
                        "wins" to "🎮 Şampiyonlar"
                    ).forEach { (id, label) ->
                        val isSel = selectedTab == id
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSel) Brush.horizontalGradient(VipGoldGradient) else Brush.horizontalGradient(listOf(LuviaCardDark, LuviaCardDark)))
                                .clickable { selectedTab = id }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSel) Color.Black else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Top 3 Podium
                if (activeList.size >= 3) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.Bottom
                    ) {
                        // 2nd Place
                        val second = activeList[1]
                        PodiumColumn(second, 2, 70.dp, Color(0xFF94A3B8))

                        // 1st Place
                        val first = activeList[0]
                        PodiumColumn(first, 1, 90.dp, LuviaGold)

                        // 3rd Place
                        val third = activeList[2]
                        PodiumColumn(third, 3, 60.dp, Color(0xFFCD7F32))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // List
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(activeList) { index, item ->
                        val isMe = item.name == currentUser.username
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isMe) LuviaPink.copy(alpha = 0.15f) else LuviaCardDark)
                                .border(1.dp, if (isMe) LuviaPink else Color(0xFF334155), RoundedCornerShape(14.dp))
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "#${item.rank}",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                color = when (item.rank) {
                                    1 -> LuviaGold
                                    2 -> Color(0xFF94A3B8)
                                    3 -> Color(0xFFCD7F32)
                                    else -> TextSecondary
                                },
                                modifier = Modifier.width(30.dp)
                            )

                            AvatarView(config = item.avatarConfig, size = 36.dp)

                            Spacer(modifier = Modifier.width(8.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(item.name, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(Brush.horizontalGradient(VipGoldGradient))
                                            .padding(horizontal = 4.dp, vertical = 1.dp)
                                    ) {
                                        Text("VIP ${item.vipLevel}", fontSize = 8.sp, fontWeight = FontWeight.Black, color = Color.Black)
                                    }
                                }
                                Text(item.subText, color = TextMuted, fontSize = 10.sp)
                            }

                            Text(
                                text = item.scoreText,
                                color = LuviaGoldLight,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PodiumColumn(user: LeaderboardUser, rank: Int, podiumHeight: androidx.compose.ui.unit.Dp, color: Color) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(contentAlignment = Alignment.Center) {
            AvatarView(config = user.avatarConfig, size = if (rank == 1) 48.dp else 40.dp)
            Text(
                text = when (rank) {
                    1 -> "👑"
                    2 -> "🥈"
                    else -> "🥉"
                },
                fontSize = 16.sp,
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .offset(y = (-10).dp)
            )
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(user.name, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
        Text(user.scoreText, color = LuviaGoldLight, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)

        Spacer(modifier = Modifier.height(4.dp))

        Box(
            modifier = Modifier
                .width(70.dp)
                .height(podiumHeight)
                .clip(RoundedCornerShape(topStart = 10.dp, topEnd = 10.dp))
                .background(Brush.verticalGradient(listOf(color.copy(alpha = 0.8f), color.copy(alpha = 0.3f)))),
            contentAlignment = Alignment.Center
        ) {
            Text("$rank", fontSize = 22.sp, fontWeight = FontWeight.Black, color = Color.White)
        }
    }
}

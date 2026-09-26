package com.luvia.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
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
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

data class ProfileShortcut(
    val title: String,
    val iconEmoji: String,
    val subtitle: String,
    val onClick: () -> Unit
)

@Composable
fun ProfileScreen(
    currentUser: User,
    onOpenAvatarStudio: () -> Unit,
    onOpenShop: () -> Unit,
    onOpenCP: () -> Unit,
    onOpenFamily: () -> Unit,
    onOpenGiftWall: () -> Unit,
    onOpenVisitorBook: () -> Unit,
    onOpenLeaderboard: () -> Unit
) {
    val shortcuts = listOf(
        ProfileShortcut("Avatar Stüdyosu", "✨", "Görünüşünü Özelleştir", onOpenAvatarStudio),
        ProfileShortcut("Luvia Mağaza", "🛍️", "Çerçeve, Kıyafet, VIP", onOpenShop),
        ProfileShortcut("Aşk Bağı (CP)", "💍", "Partner & Samimiyet", onOpenCP),
        ProfileShortcut("Aile & Lonca", "🛡️", "Lonca Kulübü & Quests", onOpenFamily),
        ProfileShortcut("Hediye Duvarı", "🎁", "Kazanılan Cazibe & Hediyeler", onOpenGiftWall),
        ProfileShortcut("Ziyaretçi Defteri", "📖", "Profilini Gezenler", onOpenVisitorBook),
        ProfileShortcut("Lider Tablosu", "🏆", "Cazibe & Zenginlik Sırası", onOpenLeaderboard)
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LuviaBgDark)
            .padding(horizontal = 14.dp, vertical = 8.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Profile Header Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.linearGradient(
                        listOf(
                            Color(0xFF831843).copy(alpha = 0.5f),
                            Color(0xFF4C1D95).copy(alpha = 0.5f),
                            LuviaSurfaceDark
                        )
                    )
                )
                .border(1.5.dp, LuviaPink.copy(alpha = 0.4f), RoundedCornerShape(24.dp))
                .padding(16.dp)
        ) {
            Column {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(contentAlignment = Alignment.BottomEnd) {
                        AvatarView(config = currentUser.avatarConfig, size = 68.dp)
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .clip(CircleShape)
                                .background(LuviaPink)
                                .clickable { onOpenAvatarStudio() },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Edit, contentDescription = "Düzenle", tint = Color.White, modifier = Modifier.size(12.dp))
                        }
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = currentUser.username,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Brush.horizontalGradient(VipGoldGradient))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("VIP ${currentUser.vipLevel}", fontSize = 9.sp, fontWeight = FontWeight.Black, color = Color.Black)
                            }
                        }

                        Text("ID: ${currentUser.numericId}", fontSize = 11.sp, color = TextMuted)
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(currentUser.statusMessage, fontSize = 11.sp, color = TextSecondary, maxLines = 1)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Stats Bar (Level, EXP, Charm, CP)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(LuviaCardDark)
                        .padding(10.dp),
                    horizontalArrangement = Arrangement.SpaceAround
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("SEVİYE", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text("Lv.${currentUser.level}", color = LuviaPurple, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("CAZİBE", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text("✨ ${currentUser.charm}", color = LuviaGoldLight, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("TAKİPÇİ", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text("${currentUser.followersCount}", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("ZAFER", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        Text("🏆 ${currentUser.gamesWon}", color = LuviaCyanLight, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        Text("Hızlı İşlemler & Kulüpler", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)

        Spacer(modifier = Modifier.height(10.dp))

        // Shortcuts Grid
        Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            shortcuts.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
                        .clickable { item.onClick() }
                        .padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(item.iconEmoji, fontSize = 24.sp)
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(item.title, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(item.subtitle, color = TextMuted, fontSize = 11.sp)
                    }
                    Text("➔", color = TextSecondary, fontSize = 14.sp)
                }
            }
        }
    }
}

package com.luvia.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.ui.theme.*

enum class AppTab(val id: String, val title: String, val iconEmoji: String) {
    LOBBY("lobby", "Oyunlar", "🎮"),
    PARTY("party", "Odalar", "🎙️"),
    MOMENTS("moments", "Keşfet", "✨"),
    MESSAGES("messages", "Sohbet", "💬"),
    PROFILE("profile", "Profil", "👤")
}

@Composable
fun BottomNav(
    currentTab: AppTab,
    onTabSelected: (AppTab) -> Unit,
    unreadMessagesCount: Int = 2
) {
    Surface(
        color = LuviaSurfaceDark.copy(alpha = 0.98f),
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        shadowElevation = 8.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            AppTab.values().forEach { tab ->
                val isSelected = currentTab == tab
                val animColor by animateColorAsState(
                    targetValue = if (isSelected) LuviaPink else TextMuted,
                    animationSpec = tween(250),
                    label = "tab_color"
                )

                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onTabSelected(tab) }
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                        .testTag("tab_${tab.id}")
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        // Icon
                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(
                                        Brush.radialGradient(
                                            listOf(LuviaPink.copy(alpha = 0.35f), Color.Transparent)
                                        )
                                    )
                            )
                        }

                        Text(
                            text = tab.iconEmoji,
                            fontSize = if (isSelected) 20.sp else 18.sp
                        )

                        // Unread badge for messages
                        if (tab == AppTab.MESSAGES && unreadMessagesCount > 0) {
                            Box(
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .offset(x = 6.dp, y = (-2).dp)
                                    .size(14.dp)
                                    .clip(CircleShape)
                                    .background(LuviaRed),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "$unreadMessagesCount",
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = tab.title,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = animColor
                    )

                    // Active bar indicator
                    if (isSelected) {
                        Box(
                            modifier = Modifier
                                .padding(top = 2.dp)
                                .width(12.dp)
                                .height(2.dp)
                                .clip(RoundedCornerShape(1.dp))
                                .background(LuviaPink)
                        )
                    } else {
                        Spacer(modifier = Modifier.height(4.dp))
                    }
                }
            }
        }
    }
}

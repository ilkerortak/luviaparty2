package com.luvia.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.VoiceRoom
import com.luvia.app.ui.theme.*

@Composable
fun VoiceRoomHUD(
    room: VoiceRoom,
    isMicMuted: Boolean,
    onToggleMic: () -> Unit,
    onExpandRoom: () -> Unit,
    onLeaveRoom: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "hud_eq")
    val wave1 by infiniteTransition.animateFloat(
        initialValue = 4f,
        targetValue = 16f,
        animationSpec = infiniteRepeatable(tween(500, easing = LinearEasing), RepeatMode.Reverse),
        label = "w1"
    )
    val wave2 by infiniteTransition.animateFloat(
        initialValue = 14f,
        targetValue = 6f,
        animationSpec = infiniteRepeatable(tween(600, easing = LinearEasing), RepeatMode.Reverse),
        label = "w2"
    )

    Surface(
        color = LuviaSurfaceDark.copy(alpha = 0.96f),
        shape = RoundedCornerShape(24.dp),
        shadowElevation = 10.dp,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 14.dp, vertical = 4.dp)
            .border(1.dp, LuviaPink.copy(alpha = 0.4f), RoundedCornerShape(24.dp))
            .clickable { onExpandRoom() }
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            // Equalizer animation & room info
            Row(verticalAlignment = Alignment.CenterVertically) {
                // Animated wave indicator
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(2.dp),
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(LuviaPink.copy(alpha = 0.2f))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .width(2.5.dp)
                            .height(wave1.dp)
                            .background(LuviaPink, CircleShape)
                    )
                    Box(
                        modifier = Modifier
                            .width(2.5.dp)
                            .height(wave2.dp)
                            .background(LuviaCyan, CircleShape)
                    )
                    Box(
                        modifier = Modifier
                            .width(2.5.dp)
                            .height(wave1.dp)
                            .background(LuviaPurple, CircleShape)
                    )
                }

                Spacer(modifier = Modifier.width(8.dp))

                Column {
                    Text(
                        text = room.title,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1
                    )
                    Text(
                        text = "Oda Sahibi: ${room.host.username} • ${room.onlineCount} Kişi",
                        color = TextSecondary,
                        fontSize = 10.sp
                    )
                }
            }

            // Quick actions (Mic Mute + Close/Leave)
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                    onClick = onToggleMic,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(if (isMicMuted) Color(0xFF334155) else LuviaGreen)
                ) {
                    Icon(
                        imageVector = if (isMicMuted) Icons.Default.MicOff else Icons.Default.Mic,
                        contentDescription = "Mikrofon",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }

                Spacer(modifier = Modifier.width(6.dp))

                IconButton(
                    onClick = onLeaveRoom,
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(LuviaRed.copy(alpha = 0.2f))
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Odadan Ayrıl",
                        tint = LuviaRed,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

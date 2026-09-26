package com.luvia.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.AvatarConfig
import com.luvia.app.ui.theme.*

@Composable
fun AvatarView(
    config: AvatarConfig,
    modifier: Modifier = Modifier,
    size: Dp = 48.dp,
    showFrame: Boolean = true,
    isSpeaking: Boolean = false
) {
    val infiniteTransition = rememberInfiniteTransition(label = "avatar_anim")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.15f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "speaking_pulse"
    )

    val frameRotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(4000, easing = LinearEasing)
        ),
        label = "frame_rot"
    )

    val skinColor = try {
        Color(android.graphics.Color.parseColor(config.skinColor))
    } catch (e: Exception) {
        Color(0xFFFFDCB1)
    }

    val outfitColor = try {
        Color(android.graphics.Color.parseColor(config.outfitColor))
    } catch (e: Exception) {
        LuviaPink
    }

    val hairColor = try {
        Color(android.graphics.Color.parseColor(config.hairColor))
    } catch (e: Exception) {
        Color(0xFF3B2219)
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(size)
    ) {
        // Speaking sound waves ring
        if (isSpeaking) {
            Box(
                modifier = Modifier
                    .size(size * pulseScale)
                    .clip(CircleShape)
                    .background(LuviaGreen.copy(alpha = 0.25f))
                    .border(2.dp, LuviaGreen, CircleShape)
            )
        }

        // Frame Glow / Border
        if (showFrame && config.frame != "none") {
            val frameBrush = when (config.frame) {
                "gold_vip" -> Brush.sweepGradient(listOf(Color(0xFFFFD700), Color(0xFFFFA500), Color(0xFFFFD700)))
                "neon_fire" -> Brush.sweepGradient(listOf(Color(0xFFFF4500), Color(0xFFFFD700), Color(0xFFFF1493), Color(0xFFFF4500)))
                "sakura" -> Brush.sweepGradient(listOf(Color(0xFFFFB6C1), Color(0xFFFF69B4), Color(0xFFFFC0CB), Color(0xFFFFB6C1)))
                "cyber_glow" -> Brush.sweepGradient(listOf(Color(0xFF00FFFF), Color(0xFF8A2BE2), Color(0xFFFF007F), Color(0xFF00FFFF)))
                else -> Brush.linearGradient(listOf(LuviaPink, LuviaCyan))
            }

            Box(
                modifier = Modifier
                    .size(size + 6.dp)
                    .clip(CircleShape)
                    .border(2.5.dp, frameBrush, CircleShape)
            )
        }

        // Avatar Core Circle
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(size)
                .clip(CircleShape)
                .background(LuviaSurfaceDark)
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = this.size.width
                val canvasHeight = this.size.height
                val center = Offset(canvasWidth / 2, canvasHeight / 2)

                // Background gradient inside avatar
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(skinColor.copy(alpha = 0.3f), LuviaSurfaceDark),
                        center = center,
                        radius = canvasWidth / 2
                    )
                )

                // Head Base
                val headRadius = canvasWidth * 0.32f
                val headCenter = Offset(center.x, center.y - canvasHeight * 0.05f)
                drawCircle(
                    color = skinColor,
                    radius = headRadius,
                    center = headCenter
                )

                // Hair Base (Back/Top)
                when (config.hairStyle) {
                    "kpop", "anime" -> {
                        drawCircle(
                            color = hairColor,
                            radius = headRadius * 1.05f,
                            center = Offset(headCenter.x, headCenter.y - headRadius * 0.4f)
                        )
                    }
                    "curly" -> {
                        drawCircle(
                            color = hairColor,
                            radius = headRadius * 1.15f,
                            center = Offset(headCenter.x, headCenter.y - headRadius * 0.2f)
                        )
                    }
                    "messy" -> {
                        drawCircle(
                            color = hairColor,
                            radius = headRadius * 1.08f,
                            center = Offset(headCenter.x - 4f, headCenter.y - headRadius * 0.3f)
                        )
                    }
                    else -> {
                        drawCircle(
                            color = hairColor,
                            radius = headRadius,
                            center = Offset(headCenter.x, headCenter.y - headRadius * 0.35f)
                        )
                    }
                }

                // Eyes
                val eyeOffsetY = headCenter.y - headRadius * 0.05f
                val leftEyeX = headCenter.x - headRadius * 0.38f
                val rightEyeX = headCenter.x + headRadius * 0.38f
                val eyeRadius = headRadius * 0.14f

                when (config.eyeStyle) {
                    "sparkle" -> {
                        drawCircle(Color(0xFF1E293B), eyeRadius, Offset(leftEyeX, eyeOffsetY))
                        drawCircle(Color(0xFF1E293B), eyeRadius, Offset(rightEyeX, eyeOffsetY))
                        drawCircle(Color.White, eyeRadius * 0.45f, Offset(leftEyeX - 1.5f, eyeOffsetY - 1.5f))
                        drawCircle(Color.White, eyeRadius * 0.45f, Offset(rightEyeX - 1.5f, eyeOffsetY - 1.5f))
                    }
                    "wink" -> {
                        drawCircle(Color(0xFF1E293B), eyeRadius, Offset(leftEyeX, eyeOffsetY))
                        drawCircle(Color.White, eyeRadius * 0.45f, Offset(leftEyeX - 1.5f, eyeOffsetY - 1.5f))
                        drawLine(
                            Color(0xFF1E293B),
                            start = Offset(rightEyeX - eyeRadius, eyeOffsetY),
                            end = Offset(rightEyeX + eyeRadius, eyeOffsetY),
                            strokeWidth = 3f
                        )
                    }
                    else -> {
                        drawCircle(Color(0xFF1E293B), eyeRadius, Offset(leftEyeX, eyeOffsetY))
                        drawCircle(Color(0xFF1E293B), eyeRadius, Offset(rightEyeX, eyeOffsetY))
                    }
                }

                // Mouth
                val mouthY = headCenter.y + headRadius * 0.45f
                when (config.mouthStyle) {
                    "smile", "laugh" -> {
                        drawArc(
                            color = Color(0xFFEF4444),
                            startAngle = 0f,
                            sweepAngle = 180f,
                            useCenter = true,
                            topLeft = Offset(headCenter.x - headRadius * 0.22f, mouthY - headRadius * 0.1f),
                            size = androidx.compose.ui.geometry.Size(headRadius * 0.44f, headRadius * 0.25f)
                        )
                    }
                    else -> {
                        drawLine(
                            color = Color(0xFF475569),
                            start = Offset(headCenter.x - headRadius * 0.18f, mouthY),
                            end = Offset(headCenter.x + headRadius * 0.18f, mouthY),
                            strokeWidth = 2.5f
                        )
                    }
                }

                // Outfit (Body bottom)
                val bodyY = headCenter.y + headRadius * 0.85f
                drawArc(
                    color = outfitColor,
                    startAngle = 180f,
                    sweepAngle = 180f,
                    useCenter = true,
                    topLeft = Offset(center.x - canvasWidth * 0.42f, bodyY),
                    size = androidx.compose.ui.geometry.Size(canvasWidth * 0.84f, canvasHeight * 0.6f)
                )
            }

            // Accessory Overlay Icon
            when (config.accessory) {
                "gaming_headset" -> {
                    Text("🎧", fontSize = (size.value * 0.35f).sp, modifier = Modifier.align(Alignment.TopCenter))
                }
                "crown" -> {
                    Text("👑", fontSize = (size.value * 0.35f).sp, modifier = Modifier.align(Alignment.TopCenter))
                }
                "cat_ears" -> {
                    Text("🐱", fontSize = (size.value * 0.35f).sp, modifier = Modifier.align(Alignment.TopCenter))
                }
                "glasses" -> {
                    Text("🕶️", fontSize = (size.value * 0.3f).sp, modifier = Modifier.align(Alignment.Center))
                }
                "angel_wings" -> {
                    Text("🪽", fontSize = (size.value * 0.35f).sp, modifier = Modifier.align(Alignment.TopEnd))
                }
            }
        }
    }
}

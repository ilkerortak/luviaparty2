package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.model.AvatarConfig
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

@Composable
fun AvatarCustomizerDialog(
    initialConfig: AvatarConfig,
    onDismiss: () -> Unit,
    onSave: (AvatarConfig) -> Unit
) {
    var config by remember { mutableStateOf(initialConfig) }
    var selectedCategory by remember { mutableStateOf("hair") } // skin, hair, eyes, mouth, outfit, accessory, frame

    val skinColors = listOf("#FFDCB1", "#FEE3D4", "#E8B688", "#C68642", "#8D5524", "#FFDFC4")
    val hairStyles = listOf("kpop", "anime", "messy", "curly", "ponytail", "short")
    val hairColors = listOf("#3b2219", "#06b6d4", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#ffffff", "#000000")
    val eyeStyles = listOf("sparkle", "cool", "wink", "cute", "determined")
    val mouthStyles = listOf("smile", "laugh", "smirk", "neutral", "bubblegum")
    val outfits = listOf("hoodie", "streetwear", "cyberpunk", "suit", "party_dress", "space_suit")
    val outfitColors = listOf("#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#1e293b")
    val accessories = listOf("none", "gaming_headset", "crown", "cat_ears", "glasses", "angel_wings")
    val frames = listOf("none", "gold_vip", "neon_fire", "sakura", "cyber_glow")

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.88f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaPink.copy(alpha = 0.5f), RoundedCornerShape(28.dp)),
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
                        text = "✨ Avatar Stüdyosu",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                // Avatar Live Preview
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(130.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            Brush.radialGradient(
                                listOf(LuviaPurple.copy(alpha = 0.35f), LuviaCardDark)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    AvatarView(
                        config = config,
                        size = 80.dp,
                        showFrame = true
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Category Tabs
                val categories = listOf(
                    "hair" to "Saç",
                    "skin" to "Ten",
                    "eyes" to "Göz",
                    "mouth" to "Ağız",
                    "outfit" to "Kıyafet",
                    "accessory" to "Aksesuar",
                    "frame" to "Çerçeve"
                )

                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(categories) { (id, label) ->
                        val isSelected = selectedCategory == id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSelected) LuviaPink else LuviaCardDark)
                                .clickable { selectedCategory = id }
                                .padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Options Area
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                ) {
                    when (selectedCategory) {
                        "skin" -> {
                            Text("Ten Rengi Seç:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(skinColors) { hex ->
                                    Box(
                                        modifier = Modifier
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(Color(android.graphics.Color.parseColor(hex)))
                                            .border(
                                                if (config.skinColor == hex) 3.dp else 1.dp,
                                                if (config.skinColor == hex) LuviaCyan else Color.Transparent,
                                                CircleShape
                                            )
                                            .clickable { config = config.copy(skinColor = hex) }
                                    )
                                }
                            }
                        }

                        "hair" -> {
                            Text("Saç Modeli:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(hairStyles) { style ->
                                    val isSel = config.hairStyle == style
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(hairStyle = style) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(style.replaceFirstChar { it.uppercase() }, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Saç Rengi:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(hairColors) { hex ->
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(Color(android.graphics.Color.parseColor(hex)))
                                            .border(
                                                if (config.hairColor == hex) 3.dp else 1.dp,
                                                if (config.hairColor == hex) LuviaPink else Color.Transparent,
                                                CircleShape
                                            )
                                            .clickable { config = config.copy(hairColor = hex) }
                                    )
                                }
                            }
                        }

                        "eyes" -> {
                            Text("Göz İfadesi:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                eyeStyles.forEach { style ->
                                    val isSel = config.eyeStyle == style
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(eyeStyle = style) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(style, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                        }

                        "mouth" -> {
                            Text("Ağız İfadesi:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                mouthStyles.forEach { style ->
                                    val isSel = config.mouthStyle == style
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(mouthStyle = style) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(style, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                        }

                        "outfit" -> {
                            Text("Kıyafet Tarzı:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(outfits) { style ->
                                    val isSel = config.outfit == style
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(outfit = style) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(style, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text("Kıyafet Rengi:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(outfitColors) { hex ->
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(Color(android.graphics.Color.parseColor(hex)))
                                            .border(
                                                if (config.outfitColor == hex) 3.dp else 1.dp,
                                                if (config.outfitColor == hex) LuviaPink else Color.Transparent,
                                                CircleShape
                                            )
                                            .clickable { config = config.copy(outfitColor = hex) }
                                    )
                                }
                            }
                        }

                        "accessory" -> {
                            Text("Aksesuar:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(accessories) { acc ->
                                    val isSel = config.accessory == acc
                                    val emoji = when (acc) {
                                        "gaming_headset" -> "🎧 Kulaklık"
                                        "crown" -> "👑 Taç"
                                        "cat_ears" -> "🐱 Kedi Kulak"
                                        "glasses" -> "🕶️ Gözlük"
                                        "angel_wings" -> "🪽 Melek"
                                        else -> "Yok"
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(accessory = acc) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(emoji, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                        }

                        "frame" -> {
                            Text("Profil Çerçevesi:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                items(frames) { frm ->
                                    val isSel = config.frame == frm
                                    val label = when (frm) {
                                        "gold_vip" -> "👑 Altın VIP"
                                        "neon_fire" -> "🔥 Neon Alev"
                                        "sakura" -> "🌸 Sakura"
                                        "cyber_glow" -> "⚡ Siber Işık"
                                        else -> "Çerçevesiz"
                                    }
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(12.dp))
                                            .background(if (isSel) LuviaPurple else LuviaCardDark)
                                            .clickable { config = config.copy(frame = frm) }
                                            .padding(horizontal = 12.dp, vertical = 8.dp)
                                    ) {
                                        Text(label, color = Color.White, fontSize = 12.sp)
                                    }
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Save Button
                Button(
                    onClick = {
                        onSave(config)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("save_avatar_button")
                ) {
                    Icon(Icons.Default.Check, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Avatarı Kaydet",
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

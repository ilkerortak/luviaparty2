package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Favorite
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

@Composable
fun CPDialog(
    currentUser: User,
    onDismiss: () -> Unit,
    onSendLoveMessage: () -> Unit = {}
) {
    var intimacyPoints by remember { mutableStateOf(currentUser.cpPartner?.intimacyLevel ?: 12) }
    var actionMessage by remember { mutableStateOf<String?>(null) }

    val partnerConfig = AvatarConfig(
        skinColor = "#FEE3D4",
        hairStyle = "ponytail",
        hairColor = "#ec4899",
        eyeStyle = "sparkle",
        mouthStyle = "smile",
        outfit = "party_dress",
        outfitColor = "#ec4899",
        accessory = "angel_wings",
        frame = "sakura"
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
                .border(1.dp, LuviaPink.copy(alpha = 0.6f), RoundedCornerShape(28.dp)),
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
                    Text("💍 CP (Aşk Bağı) Alanı", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Couple Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFF831843).copy(alpha = 0.5f), Color(0xFF4C1D95).copy(alpha = 0.5f))
                            )
                        )
                        .border(1.dp, LuviaPink.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                        .padding(16.dp)
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            // User 1
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                AvatarView(config = currentUser.avatarConfig, size = 56.dp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(currentUser.username, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            // Heart Connection
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            ) {
                                Text("💖", fontSize = 28.sp)
                                Spacer(modifier = Modifier.height(2.dp))
                                Text("Lv.$intimacyPoints", color = LuviaPinkLight, fontSize = 12.sp, fontWeight = FontWeight.Black)
                            }

                            // User 2 (Partner)
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                AvatarView(config = partnerConfig, size = 56.dp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(currentUser.cpPartner?.name ?: "LuviaPrensesi", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // Intimacy Progress
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Samimiyet Derecesi: $intimacyPoints/100", color = TextSecondary, fontSize = 11.sp)
                                Text("Birlikte: ${currentUser.cpPartner?.daysTogether ?: 45} Gün 💞", color = LuviaPinkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(Color(0xFF334155))
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxHeight()
                                        .fillMaxWidth(intimacyPoints / 100f)
                                        .background(Brush.horizontalGradient(listOf(LuviaPink, LuviaPurple)))
                                )
                            }
                        }
                    }
                }

                if (actionMessage != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(actionMessage!!, color = LuviaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Couple Tasks / Actions
                Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(LuviaCardDark)
                            .clickable {
                                intimacyPoints += 1
                                actionMessage = "Partnerine Günaydın Öpücüğü gönderildi! (+1 Samimiyet) 💋"
                                onSendLoveMessage()
                            }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("💌", fontSize = 20.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Aşk Mesajı Gönder", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("Partnerine sevgi dolu mesaj bırak", color = TextMuted, fontSize = 10.sp)
                        }
                        Text("+1 Puan", color = LuviaPinkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(LuviaCardDark)
                            .clickable {
                                intimacyPoints += 5
                                actionMessage = "Birlikte romantik sesli odaya katıldınız! (+5 Samimiyet) 🎙️✨"
                            }
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("🎙️", fontSize = 20.sp)
                        Spacer(modifier = Modifier.width(10.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text("Birlikte Odaya Katıl", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            Text("CP odasında 10 dakika vakit geçir", color = TextMuted, fontSize = 10.sp)
                        }
                        Text("+5 Puan", color = LuviaPinkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

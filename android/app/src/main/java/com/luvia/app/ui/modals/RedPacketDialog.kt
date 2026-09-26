package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*
import kotlin.random.Random

@Composable
fun RedPacketDialog(
    currentUser: User,
    onDismiss: () -> Unit,
    onSendPacket: (totalCoins: Int, packetCount: Int) -> Unit,
    onGrabPacket: (coinsWon: Int) -> Unit
) {
    var mode by remember { mutableStateOf("grab") } // "grab" or "send"
    var sendAmount by remember { mutableStateOf(1000) }
    var sendPackets by remember { mutableStateOf(5) }
    var hasGrabbed by remember { mutableStateOf(false) }
    var grabbedAmount by remember { mutableStateOf(0) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .clip(RoundedCornerShape(28.dp))
                .border(1.5.dp, Color(0xFFEF4444), RoundedCornerShape(28.dp)),
            color = Color(0xFF7F1D1D)
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
                    Text("🧧 Kırmızı Kese (Zarf)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = Color.White.copy(alpha = 0.7f))
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Toggle Grab / Send
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF991B1B))
                        .padding(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (mode == "grab") Color(0xFFDC2626) else Color.Transparent)
                            .clickable { mode = "grab" }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("Zarfı Aç 🎁", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (mode == "send") Color(0xFFDC2626) else Color.Transparent)
                            .clickable { mode = "send" }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("Zarf At (Dağıt) 🧧", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (mode == "grab") {
                    // Grab Mode UI
                    Box(
                        modifier = Modifier
                            .size(110.dp)
                            .clip(CircleShape)
                            .background(Brush.radialGradient(listOf(Color(0xFFFFD700), Color(0xFFB45309))))
                            .border(3.dp, Color.White, CircleShape)
                            .clickable(enabled = !hasGrabbed) {
                                val won = Random.nextInt(80, 450)
                                grabbedAmount = won
                                hasGrabbed = true
                                onGrabPacket(won)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(if (hasGrabbed) "AÇILDI ✨" else "AÇ\n🧧", fontSize = 20.sp, fontWeight = FontWeight.Black, color = Color(0xFF7F1D1D))
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    if (hasGrabbed) {
                        Text(
                            text = "🎉 Tebrikler! 🪙 $grabbedAmount Altın Kazandın!",
                            color = Color(0xFFFFD700),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    } else {
                        Text(
                            text = "Oda sahibinin attığı kırmızı zarfı hemen kap!",
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 12.sp
                        )
                    }
                } else {
                    // Send Mode UI
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Text("Dağıtılacak Altın Miktarı:", color = Color.White, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(500, 1000, 2500, 5000).forEach { amt ->
                                val isSel = sendAmount == amt
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSel) Color(0xFFFFD700) else Color(0xFF991B1B))
                                        .clickable { sendAmount = amt }
                                        .padding(horizontal = 10.dp, vertical = 6.dp)
                                ) {
                                    Text("🪙 $amt", color = if (isSel) Color.Black else Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text("Kaç Kişi Paylaşacak?", color = Color.White, fontSize = 12.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(3, 5, 8, 10).forEach { cnt ->
                                val isSel = sendPackets == cnt
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(if (isSel) Color(0xFFFFD700) else Color(0xFF991B1B))
                                        .clickable { sendPackets = cnt }
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text("$cnt Kişi", color = if (isSel) Color.Black else Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        val canSend = currentUser.coins >= sendAmount
                        Button(
                            onClick = {
                                if (canSend) {
                                    onSendPacket(sendAmount, sendPackets)
                                    onDismiss()
                                }
                            },
                            enabled = canSend,
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFD700)),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(46.dp)
                        ) {
                            Text(
                                text = if (canSend) "Odaya Kırmızı Zarf Yağdır 🧧" else "Yetersiz Bakiye",
                                color = Color(0xFF7F1D1D),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

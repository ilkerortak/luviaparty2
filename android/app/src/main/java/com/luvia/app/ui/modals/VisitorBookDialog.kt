package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.User
import com.luvia.app.model.VisitorEntry
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

@Composable
fun VisitorBookDialog(
    onDismiss: () -> Unit
) {
    val visitors = listOf(
        VisitorEntry("v1", User(username = "Prenses_Ada", avatarConfig = AvatarConfig(hairStyle = "curly", frame = "neon_fire")), "5 dakika önce", 20),
        VisitorEntry("v2", User(username = "Kral_Luvia", avatarConfig = AvatarConfig(hairStyle = "kpop", frame = "gold_vip")), "1 saat önce", 100),
        VisitorEntry("v3", User(username = "SiberKedi", avatarConfig = AvatarConfig(hairStyle = "anime", accessory = "cat_ears")), "3 saat önce", 0),
        VisitorEntry("v4", User(username = "GeceMeleği", avatarConfig = AvatarConfig(hairStyle = "ponytail", frame = "sakura")), "Dün", 50)
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.82f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaCyan.copy(alpha = 0.5f), RoundedCornerShape(28.dp)),
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
                    Column {
                        Text("📖 Ziyaretçi Defteri", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Son 24 saatte profilinizi ziyaret edenler", fontSize = 11.sp, color = TextSecondary)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(visitors) { item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(LuviaCardDark)
                                .padding(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            AvatarView(config = item.visitor.avatarConfig, size = 40.dp)
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(item.visitor.username, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Text("🕒 ${item.visitedTimeAgo}", color = TextMuted, fontSize = 10.sp)
                            }
                            if (item.charmGifted > 0) {
                                Text("🎁 +${item.charmGifted} Cazibe", color = LuviaPinkLight, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

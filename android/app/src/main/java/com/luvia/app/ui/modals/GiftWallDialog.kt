package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.luvia.app.data.GiftsRepository
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

data class GiftWallEntry(
    val giftId: String,
    val count: Int
)

@Composable
fun GiftWallDialog(
    currentUser: User,
    onDismiss: () -> Unit
) {
    val receivedGifts = listOf(
        GiftWallEntry("love_letter", 42),
        GiftWallEntry("golden_rose", 18),
        GiftWallEntry("diamond_ring", 8),
        GiftWallEntry("magic_bear", 15),
        GiftWallEntry("royal_crown", 3),
        GiftWallEntry("lamborghini_red", 1),
        GiftWallEntry("flower_goddess", 1)
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
                    Column {
                        Text("🎁 Hediye Duvarı", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text("Toplam Cazibe: ${currentUser.charm} ✨", fontSize = 12.sp, color = LuviaGoldLight, fontWeight = FontWeight.SemiBold)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(receivedGifts) { entry ->
                        val gift = GiftsRepository.ALL_GIFTS.find { it.id == entry.giftId } ?: GiftsRepository.ALL_GIFTS.first()
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(LuviaCardDark)
                                .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
                                .padding(10.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(gift.emoji, fontSize = 32.sp)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(gift.name, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                            Text("x${entry.count}", color = LuviaPinkLight, fontSize = 12.sp, fontWeight = FontWeight.Black)
                            Text("+${gift.charm * entry.count} Cazibe", color = LuviaGoldLight, fontSize = 9.sp)
                        }
                    }
                }
            }
        }
    }
}

package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
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
import com.luvia.app.data.GiftsRepository
import com.luvia.app.model.RoomGift
import com.luvia.app.model.RoomSeat
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

@Composable
fun GiftSheetDialog(
    currentUser: User,
    seats: List<RoomSeat>,
    onDismiss: () -> Unit,
    onSendGift: (gift: RoomGift, targetSeatIndex: Int, targetUserName: String) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("all") }
    var selectedSeatIndex by remember { mutableStateOf<Int?>(seats.firstOrNull { it.user != null && it.user.id != currentUser.id }?.seatIndex ?: 0) }
    var selectedGift by remember { mutableStateOf<RoomGift?>(GiftsRepository.ALL_GIFTS.firstOrNull()) }

    val filteredGifts = GiftsRepository.ALL_GIFTS.filter {
        selectedCategory == "all" || it.category == selectedCategory
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.96f)
                .fillMaxHeight(0.85f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaPink.copy(alpha = 0.6f), RoundedCornerShape(28.dp)),
            color = LuviaSurfaceDark
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(14.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("🎁 Hediye Gönder", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🪙 ${currentUser.coins}", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = LuviaGoldLight)
                        Spacer(modifier = Modifier.width(6.dp))
                        IconButton(onClick = onDismiss, modifier = Modifier.size(30.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                        }
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Target Seat Selector (Kimlere Gönderilecek?)
                Text("Kime Gönderilecek:", color = TextSecondary, fontSize = 11.sp)
                Spacer(modifier = Modifier.height(4.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(seats.filter { it.user != null }) { seat ->
                        val isSel = selectedSeatIndex == seat.seatIndex
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isSel) LuviaPurple else LuviaCardDark)
                                .border(1.dp, if (isSel) LuviaPink else Color(0xFF334155), RoundedCornerShape(12.dp))
                                .clickable { selectedSeatIndex = seat.seatIndex }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${seat.seatIndex + 1}. ${seat.user?.username ?: "Koltuk"}",
                                fontSize = 11.sp,
                                color = if (isSel) Color.White else TextSecondary,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Category Tabs
                val categories = listOf(
                    "all" to "Tümü",
                    "popular" to "Popüler",
                    "special" to "Özel",
                    "vip" to "VIP",
                    "event" to "Efsanevi"
                )
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(categories) { (id, title) ->
                        val isSel = selectedCategory == id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSel) LuviaPink else LuviaCardDark)
                                .clickable { selectedCategory = id }
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = title,
                                fontSize = 11.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSel) Color.White else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Gifts Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(filteredGifts) { gift ->
                        val isSel = selectedGift?.id == gift.id
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isSel) LuviaPink.copy(alpha = 0.25f) else LuviaCardDark)
                                .border(1.5.dp, if (isSel) LuviaPink else Color.Transparent, RoundedCornerShape(14.dp))
                                .clickable { selectedGift = gift }
                                .padding(8.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(gift.emoji, fontSize = 28.sp)
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = gift.name,
                                color = Color.White,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                            Text(
                                text = "🪙 ${gift.price}",
                                color = LuviaGoldLight,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                // Selected Gift Quote & Send Button
                selectedGift?.let { gift ->
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(LuviaCardDark)
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "💬 \"${gift.quote}\"",
                            color = LuviaPinkLight,
                            fontSize = 11.sp,
                            maxLines = 2
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    val canAfford = currentUser.coins >= gift.price
                    val targetUser = seats.find { it.seatIndex == selectedSeatIndex }?.user?.username ?: "Oda"

                    Button(
                        onClick = {
                            if (canAfford) {
                                onSendGift(gift, selectedSeatIndex ?: 0, targetUser)
                                onDismiss()
                            }
                        },
                        enabled = canAfford,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = LuviaPink,
                            disabledContainerColor = Color(0xFF334155)
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp)
                    ) {
                        Text(
                            text = if (canAfford) "Gönder (🪙 ${gift.price} Altın • +${gift.charm} Cazibe)" else "Yetersiz Altın Bakiyesi",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}

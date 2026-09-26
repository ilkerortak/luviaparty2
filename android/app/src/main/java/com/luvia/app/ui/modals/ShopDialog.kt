package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.luvia.app.data.GameDataRepository
import com.luvia.app.data.ShopItem
import com.luvia.app.model.User
import com.luvia.app.ui.theme.*

@Composable
fun ShopDialog(
    user: User,
    onDismiss: () -> Unit,
    onBuyItem: (ShopItem) -> Unit
) {
    var selectedCategory by remember { mutableStateOf("all") }
    var buySuccessMessage by remember { mutableStateOf<String?>(null) }

    val items = GameDataRepository.SHOP_ITEMS.filter {
        selectedCategory == "all" || it.category == selectedCategory
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.88f)
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaGold.copy(alpha = 0.5f), RoundedCornerShape(28.dp)),
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("🛍️ Luvia Mağaza", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        // Current Coins
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .background(LuviaCardDark)
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                        ) {
                            Text("🪙 ${user.coins}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = LuviaGoldLight)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("💎 ${user.diamonds}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = LuviaCyanLight)
                        }

                        Spacer(modifier = Modifier.width(6.dp))

                        IconButton(onClick = onDismiss) {
                            Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                        }
                    }
                }

                if (buySuccessMessage != null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(LuviaGreen.copy(alpha = 0.2f))
                            .border(1.dp, LuviaGreen, RoundedCornerShape(12.dp))
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(buySuccessMessage!!, color = LuviaGreen, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Categories
                val categories = listOf(
                    "all" to "Tümü",
                    "frame" to "Çerçeveler",
                    "accessory" to "Aksesuar",
                    "vip" to "VIP",
                    "currency" to "Altın & Elmas"
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    categories.forEach { (catId, catName) ->
                        val isSel = selectedCategory == catId
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSel) LuviaGold else LuviaCardDark)
                                .clickable { selectedCategory = catId }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = catName,
                                fontSize = 11.sp,
                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSel) Color.Black else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Items Grid
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(items) { item ->
                        val canAfford = if (item.currency == "coins") user.coins >= item.price else user.diamonds >= item.price
                        Column(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .background(LuviaCardDark)
                                .border(1.dp, Color(0xFF334155), RoundedCornerShape(16.dp))
                                .padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(item.emoji, fontSize = 36.sp)
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = item.name,
                                color = Color.White,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1
                            )
                            Text(
                                text = item.description,
                                color = TextMuted,
                                fontSize = 10.sp,
                                maxLines = 2,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                            Spacer(modifier = Modifier.height(4.dp))

                            Button(
                                onClick = {
                                    if (canAfford) {
                                        onBuyItem(item)
                                        buySuccessMessage = "${item.name} başarıyla satın alındı! 🎉"
                                    } else {
                                        buySuccessMessage = "Yetersiz bakiye!"
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (canAfford) (if (item.currency == "coins") LuviaGold else LuviaCyan) else Color(0xFF334155)
                                ),
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(36.dp)
                            ) {
                                Text(
                                    text = if (item.currency == "coins") "🪙 ${item.price}" else "💎 ${item.price}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (canAfford) Color.Black else TextSecondary
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

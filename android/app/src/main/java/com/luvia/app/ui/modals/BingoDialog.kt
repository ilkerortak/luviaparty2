package com.luvia.app.ui.modals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.luvia.app.ui.theme.*
import kotlin.random.Random

@Composable
fun BingoDialog(
    onDismiss: () -> Unit,
    onBingoWin: (rewardCoins: Int) -> Unit
) {
    val initialBoard = remember {
        val numbers = (1..30).shuffled().take(9)
        numbers
    }

    var markedIndices by remember { mutableStateOf(setOf<Int>()) }
    var currentCalledBall by remember { mutableStateOf(Random.nextInt(1, 30)) }
    var isBingo by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(4000)
            currentCalledBall = Random.nextInt(1, 30)
        }
    }

    // Check 3 in a row
    fun checkBingo(marked: Set<Int>): Boolean {
        val winCombos = listOf(
            listOf(0, 1, 2), listOf(3, 4, 5), listOf(6, 7, 8),
            listOf(0, 3, 6), listOf(1, 4, 7), listOf(2, 5, 8),
            listOf(0, 4, 8), listOf(2, 4, 6)
        )
        return winCombos.any { combo -> combo.all { it in marked } }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
                .clip(RoundedCornerShape(28.dp))
                .border(1.dp, LuviaCyan.copy(alpha = 0.6f), RoundedCornerShape(28.dp)),
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
                    Text("🎱 Parti Tombala (Bingo)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Kapat", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Called Ball Display
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(LuviaCardDark)
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                ) {
                    Text("Çekilen Top: ", color = TextSecondary, fontSize = 12.sp)
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(LuviaPink),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("$currentCalledBall", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Black)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // 3x3 Card
                LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.size(200.dp)
                ) {
                    itemsIndexed(initialBoard) { index, num ->
                        val isMarked = index in markedIndices
                        Box(
                            modifier = Modifier
                                .size(60.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(if (isMarked) LuviaGreen else LuviaCardDark)
                                .border(1.dp, if (isMarked) LuviaGreen else Color(0xFF334155), RoundedCornerShape(12.dp))
                                .clickable {
                                    val nextMarked = markedIndices + index
                                    markedIndices = nextMarked
                                    if (checkBingo(nextMarked)) {
                                        isBingo = true
                                        onBingoWin(1500)
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$num",
                                color = if (isMarked) Color.Black else Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                if (isBingo) {
                    Text("🎉 BİNGO! 1,500 Altın Kazandın!", color = LuviaGoldLight, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                } else {
                    Text("3'lü sıra tamamlayarak BİNGO yap!", color = TextMuted, fontSize = 11.sp)
                }
            }
        }
    }
}

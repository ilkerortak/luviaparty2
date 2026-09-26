package com.luvia.app.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
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
import com.luvia.app.data.GameDataRepository
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.User
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay

data class SpyPlayer(
    val id: String,
    val name: String,
    val isSpy: Boolean,
    val word: String,
    val avatarConfig: AvatarConfig,
    val isEliminated: Boolean = false,
    val clueGiven: String = ""
)

@Composable
fun SpyGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    val wordPair = remember { GameDataRepository.SPY_WORD_PAIRS.random() }
    var phase by remember { mutableStateOf("word_reveal") } // word_reveal, clue_phase, voting_phase, finished
    var timer by remember { mutableStateOf(6) }
    var selectedVoteId by remember { mutableStateOf<String?>(null) }
    var myClue by remember { mutableStateOf("") }
    var winnerText by remember { mutableStateOf<String?>(null) }

    val players = remember {
        mutableStateListOf(
            SpyPlayer(currentUser.id, "${currentUser.username} (Sen)", false, wordPair.civilianWord, currentUser.avatarConfig, clueGiven = "Sıcak yenince çok lezzetli oluyor! 🍕"),
            SpyPlayer("p2", "SiberKedi", true, wordPair.spyWord, AvatarConfig(hairStyle = "anime", accessory = "cat_ears"), clueGiven = "Fırından yeni çıkınca kokusu harika."),
            SpyPlayer("p3", "OdaKralı", false, wordPair.civilianWord, AvatarConfig(hairStyle = "kpop", frame = "gold_vip"), clueGiven = "Arkadaşlarla toplanınca sipariş ederiz."),
            SpyPlayer("p4", "GeceYıldızı", false, wordPair.civilianWord, AvatarConfig(hairStyle = "curly"), clueGiven = "İtalyan tarzı veya hamurlu.")
        )
    }

    val myPlayer = players.find { it.id == currentUser.id }

    LaunchedEffect(phase) {
        when (phase) {
            "word_reveal" -> {
                timer = 5
                while (timer > 0) {
                    delay(1000)
                    timer--
                }
                phase = "clue_phase"
            }
            "clue_phase" -> {
                timer = 15
                while (timer > 0) {
                    delay(1000)
                    timer--
                }
                phase = "voting_phase"
            }
            "voting_phase" -> {
                timer = 10
                while (timer > 0) {
                    delay(1000)
                    timer--
                }
                // Resolve vote: if selected spy, civilians win
                val spyPlayer = players.find { it.isSpy }
                if (selectedVoteId == spyPlayer?.id) {
                    winnerText = "Sivil Halk Kazandı! Casus yakalandı: ${spyPlayer?.name} (${wordPair.spyWord}) 🎉"
                    onGameWon(180, 250)
                } else {
                    winnerText = "Casus Kazandı! Yakalanmadan aranızda gizlendi 🕵️ (${spyPlayer?.name})"
                }
                phase = "finished"
            }
        }
    }

    Scaffold(
        containerColor = LuviaBgDark,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = onExitGame) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Geri", tint = Color.White)
                }
                Text("🕵️ Casus Kim? (Who is the Spy)", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(LuviaPurple)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text("⏱️ $timer s", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Secret Word Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Brush.horizontalGradient(listOf(Color(0xFF431407), Color(0xFF1E293B))))
                    .border(1.5.dp, LuviaGold, RoundedCornerShape(20.dp))
                    .padding(16.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Kategori: ${wordPair.category}", color = TextSecondary, fontSize = 11.sp)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Gizli Kelimen: \"${myPlayer?.word}\"",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = LuviaGoldLight
                    )
                    Text(
                        text = "Kelimen hakkında çok açık ipucu vermeden şüphe çekmemeye çalış!",
                        color = TextMuted,
                        fontSize = 10.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Players Grid & Clues
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(players) { player ->
                    val isSel = selectedVoteId == player.id
                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isSel) LuviaPink.copy(alpha = 0.3f) else LuviaCardDark)
                            .border(1.5.dp, if (isSel) LuviaPink else Color(0xFF334155), RoundedCornerShape(16.dp))
                            .clickable(enabled = phase == "voting_phase" && player.id != currentUser.id) {
                                selectedVoteId = if (isSel) null else player.id
                            }
                            .padding(10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        AvatarView(config = player.avatarConfig, size = 46.dp)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(player.name, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                        Spacer(modifier = Modifier.height(4.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0F172A))
                                .padding(6.dp)
                        ) {
                            Text(
                                text = "💬 \"${player.clueGiven}\"",
                                color = LuviaCyanLight,
                                fontSize = 10.sp,
                                maxLines = 2
                            )
                        }
                    }
                }
            }

            if (phase == "finished") {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = onExitGame,
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text(winnerText ?: "Oyun Bitti", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

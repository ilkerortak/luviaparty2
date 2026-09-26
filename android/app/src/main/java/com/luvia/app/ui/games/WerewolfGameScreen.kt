package com.luvia.app.ui.games

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
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
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.User
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*
import kotlinx.coroutines.delay

enum class WerewolfRole(val title: String, val desc: String, val iconEmoji: String, val color: Color) {
    WEREWOLF("UZAY VAMPİRİ 🐺", "Geceleri gizlice avlan. Mürettebata yakalanmadan hepsini ortadan kaldır!", "🐺", Color(0xFFEF4444)),
    SEER("GÖZCÜ (KAHİN) 🔮", "Geceleri bir oyuncunun gerçek rolünü gör ve masumları koru.", "🔮", Color(0xFF8B5CF6)),
    DOCTOR("DOKTOR 💉", "Geceleri bir oyuncuyu koruma altına alarak hayatta kalmasını sağla.", "💉", Color(0xFF10B981)),
    CREWMATE("MÜRETTEBAT 🛠️", "Gündüz tartışmalarında vampiri bul ve oylamada uzaya fırlat!", "🛠️", Color(0xFF06B6D4))
}

data class WerewolfPlayer(
    val id: String,
    val name: String,
    val role: WerewolfRole,
    val isAlive: Boolean = true,
    val avatarConfig: AvatarConfig,
    val votesReceived: Int = 0
)

@Composable
fun WerewolfGameScreen(
    currentUser: User,
    onExitGame: () -> Unit,
    onGameWon: (rewardExp: Int, rewardCoins: Int) -> Unit
) {
    var phase by remember { mutableStateOf("role_reveal") } // role_reveal, night, day_discussion, voting, game_over
    var timerSeconds by remember { mutableStateOf(5) }
    var myRole by remember { mutableStateOf(WerewolfRole.WEREWOLF) }
    var selectedTargetId by remember { mutableStateOf<String?>(null) }
    var seerInspectResult by remember { mutableStateOf<String?>(null) }
    var gameLog by remember { mutableStateOf("Uzay gemisi hareket halinde. Roller dağıtıldı!") }
    var winnerTeam by remember { mutableStateOf<String?>(null) }

    var players by remember {
        mutableStateOf(
            listOf(
                WerewolfPlayer(currentUser.id, "${currentUser.username} (Sen)", WerewolfRole.WEREWOLF, true, currentUser.avatarConfig),
                WerewolfPlayer("p2", "SiberKedi", WerewolfRole.SEER, true, AvatarConfig(hairStyle = "anime", accessory = "cat_ears")),
                WerewolfPlayer("p3", "Doktor_Efe", WerewolfRole.DOCTOR, true, AvatarConfig(hairStyle = "kpop", frame = "cyber_glow")),
                WerewolfPlayer("p4", "UzayGezgini", WerewolfRole.CREWMATE, true, AvatarConfig(hairStyle = "curly", frame = "none"))
            )
        )
    }

    // Timer countdown loop
    LaunchedEffect(phase) {
        when (phase) {
            "role_reveal" -> {
                timerSeconds = 4
                while (timerSeconds > 0) {
                    delay(1000)
                    timerSeconds--
                }
                phase = "night"
                gameLog = "🌙 Gece çöktü! Uzay Vampirleri avlanıyor, Kahin kimlik inceliyor."
            }
            "night" -> {
                timerSeconds = 10
                while (timerSeconds > 0) {
                    delay(1000)
                    timerSeconds--
                }
                // Night resolution: if target chosen, eliminate
                selectedTargetId?.let { targetId ->
                    players = players.map {
                        if (it.id == targetId) it.copy(isAlive = false) else it
                    }
                    val victim = players.find { it.id == targetId }?.name ?: "Biri"
                    gameLog = "☀️ Gündüz oldu! Dün gece $victim uzay boşluğuna atıldı!"
                } ?: run {
                    gameLog = "☀️ Gündüz oldu! Bu gece kimse zarar görmedi."
                }
                selectedTargetId = null
                phase = "day_discussion"
            }
            "day_discussion" -> {
                timerSeconds = 12
                while (timerSeconds > 0) {
                    delay(1000)
                    timerSeconds--
                }
                phase = "voting"
                gameLog = "🗳️ Oylama başladı! Kimi uzay boşluğuna fırlatacaksınız?"
            }
            "voting" -> {
                timerSeconds = 8
                while (timerSeconds > 0) {
                    delay(1000)
                    timerSeconds--
                }
                // Resolve vote
                selectedTargetId?.let { targetId ->
                    players = players.map {
                        if (it.id == targetId) it.copy(isAlive = false) else it
                    }
                    val eliminated = players.find { it.id == targetId }
                    gameLog = "⚖️ Oy birliğiyle ${eliminated?.name} uzay gemisinden atıldı!"
                }
                // Check win condition
                val wolvesAlive = players.count { it.isAlive && it.role == WerewolfRole.WEREWOLF }
                val crewAlive = players.count { it.isAlive && it.role != WerewolfRole.WEREWOLF }
                if (wolvesAlive == 0) {
                    winnerTeam = "Mürettebat (Masumlar)"
                    phase = "game_over"
                    onGameWon(200, 300)
                } else if (wolvesAlive >= crewAlive) {
                    winnerTeam = "Uzay Vampirleri 🐺"
                    phase = "game_over"
                    onGameWon(250, 400)
                } else {
                    phase = "night"
                    gameLog = "🌙 Yeniden gece oldu..."
                }
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
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Çıkış", tint = Color.White)
                }
                Text(
                    text = "🐺 Kurtadam / Uzay Vampiri",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (phase == "night") LuviaPurple else LuviaGold)
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "⏱️ $timerSeconds s",
                        color = if (phase == "night") Color.White else Color.Black,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
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
            // Phase Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(
                        if (phase == "night")
                            Brush.horizontalGradient(listOf(Color(0xFF311042), Color(0xFF0F172A)))
                        else
                            Brush.horizontalGradient(listOf(Color(0xFF854D0E).copy(alpha = 0.6f), LuviaCardDark))
                    )
                    .border(1.dp, if (phase == "night") LuviaPurple else LuviaGold, RoundedCornerShape(16.dp))
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = when (phase) {
                            "role_reveal" -> "🎭 Rolün: ${myRole.title}"
                            "night" -> "🌙 GECE EVRESİ (Avlanma / Koruma)"
                            "day_discussion" -> "☀️ GÜNDÜZ TARTIŞMASI"
                            "voting" -> "🗳️ OYLAMA ZAMANI"
                            else -> "🏆 OYUN BİTTİ"
                        },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = gameLog,
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Players Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.weight(1f)
            ) {
                items(players) { player ->
                    val isSelected = selectedTargetId == player.id
                    val isMe = player.id == currentUser.id

                    Column(
                        modifier = Modifier
                            .clip(RoundedCornerShape(18.dp))
                            .background(
                                when {
                                    !player.isAlive -> Color(0xFF1E1E2E).copy(alpha = 0.5f)
                                    isSelected -> LuviaPink.copy(alpha = 0.3f)
                                    else -> LuviaCardDark
                                }
                            )
                            .border(
                                1.5.dp,
                                if (isSelected) LuviaPink else if (!player.isAlive) Color(0xFF475569) else Color(0xFF334155),
                                RoundedCornerShape(18.dp)
                            )
                            .clickable(enabled = player.isAlive && !isMe && (phase == "night" || phase == "voting")) {
                                selectedTargetId = if (isSelected) null else player.id
                                if (phase == "night" && myRole == WerewolfRole.SEER) {
                                    seerInspectResult = "${player.name} -> Rolü: ${player.role.title}"
                                }
                            }
                            .padding(12.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            AvatarView(config = player.avatarConfig, size = 52.dp)
                            if (!player.isAlive) {
                                Text("💀", fontSize = 28.sp)
                            }
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = player.name,
                            color = if (player.isAlive) Color.White else TextMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1
                        )

                        Text(
                            text = if (!player.isAlive) "ELENDİ 💀" else if (isMe) myRole.title else "Canlı ✅",
                            color = if (!player.isAlive) LuviaRed else if (isMe) LuviaCyanLight else LuviaGreen,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            // Action Info / Seer result
            seerInspectResult?.let {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(LuviaPurple.copy(alpha = 0.3f))
                        .border(1.dp, LuviaPurple, RoundedCornerShape(12.dp))
                        .padding(8.dp)
                ) {
                    Text(it, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(10.dp))
            }

            if (phase == "game_over") {
                Button(
                    onClick = onExitGame,
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text("Kazanan: $winnerTeam 🎉 • Lobiye Dön", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

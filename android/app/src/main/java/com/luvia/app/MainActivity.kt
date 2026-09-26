package com.luvia.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.luvia.app.model.GameType
import com.luvia.app.ui.components.*
import com.luvia.app.ui.games.*
import com.luvia.app.ui.modals.*
import com.luvia.app.ui.screens.*
import com.luvia.app.ui.theme.LuviaBgDark
import com.luvia.app.ui.theme.LuviaTheme
import com.luvia.app.viewmodel.AppViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            LuviaTheme {
                LuviaApp(viewModel = viewModel)
            }
        }
    }
}

@Composable
fun LuviaApp(viewModel: AppViewModel) {
    val currentUser by viewModel.currentUser.collectAsState()
    val currentTab by viewModel.currentTab.collectAsState()
    val activeGame by viewModel.activeGame.collectAsState()
    val activeVoiceRoom by viewModel.activeVoiceRoom.collectAsState()
    val isVoiceRoomMinimized by viewModel.isVoiceRoomMinimized.collectAsState()
    val isMuted by viewModel.isMuted.collectAsState()

    // Modals
    val isAvatarStudioOpen by viewModel.isAvatarStudioOpen.collectAsState()
    val isShopOpen by viewModel.isShopOpen.collectAsState()
    val isDailyCheckInOpen by viewModel.isDailyCheckInOpen.collectAsState()
    val isLeaderboardOpen by viewModel.isLeaderboardOpen.collectAsState()
    val isCPOpen by viewModel.isCPOpen.collectAsState()
    val isFamilyOpen by viewModel.isFamilyOpen.collectAsState()
    val isGiftWallOpen by viewModel.isGiftWallOpen.collectAsState()
    val isVisitorBookOpen by viewModel.isVisitorBookOpen.collectAsState()

    // Back handling
    if (activeGame != null) {
        BackHandler {
            viewModel.exitGame()
        }
    } else if (activeVoiceRoom != null && !isVoiceRoomMinimized) {
        BackHandler {
            viewModel.minimizeVoiceRoom()
        }
    }

    Scaffold(
        containerColor = LuviaBgDark,
        topBar = {
            if (activeGame == null && (activeVoiceRoom == null || isVoiceRoomMinimized)) {
                TopBar(
                    user = currentUser,
                    isMuted = isMuted,
                    onToggleMute = { viewModel.toggleMute() },
                    onOpenShop = { viewModel.setShopOpen(true) },
                    onOpenCheckIn = { viewModel.setDailyCheckInOpen(true) },
                    onOpenLeaderboard = { viewModel.setLeaderboardOpen(true) },
                    onProfileClick = { viewModel.selectTab(AppTab.PROFILE) }
                )
            }
        },
        bottomBar = {
            if (activeGame == null && (activeVoiceRoom == null || isVoiceRoomMinimized)) {
                Column {
                    // Floating Voice Room HUD when minimized
                    if (activeVoiceRoom != null && isVoiceRoomMinimized) {
                        VoiceRoomHUD(
                            room = activeVoiceRoom!!,
                            isMicMuted = isMuted,
                            onToggleMic = { viewModel.toggleMute() },
                            onExpandRoom = { viewModel.expandVoiceRoom() },
                            onLeaveRoom = { viewModel.leaveVoiceRoom() }
                        )
                    }

                    BottomNav(
                        currentTab = currentTab,
                        onTabSelected = { tab -> viewModel.selectTab(tab) }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when {
                // Active Game Screen
                activeGame != null -> {
                    when (activeGame!!) {
                        GameType.WEREWOLF -> WerewolfGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.DRAW_GUESS -> DrawAndGuessScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.SPY -> SpyGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.LUDO -> LudoGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.MIC_GRAB -> MicGrabGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.UNO -> UnoGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.JACKAROO -> JackarooGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                        GameType.TRIVIA -> TriviaGameScreen(
                            currentUser = currentUser,
                            onExitGame = { viewModel.exitGame() },
                            onGameWon = { exp, coins -> viewModel.handleGameWon(exp, coins) }
                        )
                    }
                }

                // Expanded Voice Room Screen
                activeVoiceRoom != null && !isVoiceRoomMinimized -> {
                    VoiceRoomDetailScreen(
                        room = activeVoiceRoom!!,
                        currentUser = currentUser,
                        onMinimize = { viewModel.minimizeVoiceRoom() },
                        onLeaveRoom = { viewModel.leaveVoiceRoom() },
                        onSendGiftAction = { gift, targetIndex, targetName ->
                            viewModel.sendGift(gift, targetIndex, targetName)
                        },
                        onWinGameReward = { coins, diamonds, label ->
                            viewModel.handleWinReward(coins, diamonds, label)
                        }
                    )
                }

                // Main Tab Views
                else -> {
                    Column(modifier = Modifier.fillMaxSize()) {
                        GlobalHavadisBanner()

                        when (currentTab) {
                            AppTab.LOBBY -> LobbyScreen(
                                currentUser = currentUser,
                                onSelectGame = { game -> viewModel.openGame(game) },
                                onOpenRoomLobby = { game -> viewModel.openGame(game) }
                            )
                            AppTab.PARTY -> VoiceRoomsScreen(
                                currentUser = currentUser,
                                onJoinRoom = { room -> viewModel.joinVoiceRoom(room) }
                            )
                            AppTab.MOMENTS -> MomentsScreen(
                                currentUser = currentUser
                            )
                            AppTab.MESSAGES -> MessagesScreen(
                                currentUser = currentUser
                            )
                            AppTab.PROFILE -> ProfileScreen(
                                currentUser = currentUser,
                                onOpenAvatarStudio = { viewModel.setAvatarStudioOpen(true) },
                                onOpenShop = { viewModel.setShopOpen(true) },
                                onOpenCP = { viewModel.setCPOpen(true) },
                                onOpenFamily = { viewModel.setFamilyOpen(true) },
                                onOpenGiftWall = { viewModel.setGiftWallOpen(true) },
                                onOpenVisitorBook = { viewModel.setVisitorBookOpen(true) },
                                onOpenLeaderboard = { viewModel.setLeaderboardOpen(true) }
                            )
                        }
                    }
                }
            }

            // Global Dialog Modals
            if (isAvatarStudioOpen) {
                AvatarCustomizerDialog(
                    initialConfig = currentUser.avatarConfig,
                    onDismiss = { viewModel.setAvatarStudioOpen(false) },
                    onSave = { updated -> viewModel.updateAvatarConfig(updated) }
                )
            }

            if (isShopOpen) {
                ShopDialog(
                    user = currentUser,
                    onDismiss = { viewModel.setShopOpen(false) },
                    onBuyItem = { item -> viewModel.buyShopItem(item) }
                )
            }

            if (isDailyCheckInOpen) {
                DailyCheckInDialog(
                    onDismiss = { viewModel.setDailyCheckInOpen(false) },
                    onClaimReward = { reward -> viewModel.claimCheckInReward(reward) }
                )
            }

            if (isLeaderboardOpen) {
                LeaderboardDialog(
                    currentUser = currentUser,
                    onDismiss = { viewModel.setLeaderboardOpen(false) }
                )
            }

            if (isCPOpen) {
                CPDialog(
                    currentUser = currentUser,
                    onDismiss = { viewModel.setCPOpen(false) }
                )
            }

            if (isFamilyOpen) {
                FamilyDialog(
                    currentUser = currentUser,
                    onDismiss = { viewModel.setFamilyOpen(false) }
                )
            }

            if (isGiftWallOpen) {
                GiftWallDialog(
                    currentUser = currentUser,
                    onDismiss = { viewModel.setGiftWallOpen(false) }
                )
            }

            if (isVisitorBookOpen) {
                VisitorBookDialog(
                    onDismiss = { viewModel.setVisitorBookOpen(false) }
                )
            }
        }
    }
}

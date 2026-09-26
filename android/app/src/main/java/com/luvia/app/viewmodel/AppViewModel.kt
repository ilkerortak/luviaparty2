package com.luvia.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.luvia.app.audio.SoundManager
import com.luvia.app.data.ShopItem
import com.luvia.app.model.*
import com.luvia.app.ui.components.AppTab
import com.luvia.app.ui.modals.CheckInDayReward
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class AppViewModel(application: Application) : AndroidViewModel(application) {
    private val soundManager = SoundManager.getInstance(application)

    private val _currentUser = MutableStateFlow(User())
    val currentUser: StateFlow<User> = _currentUser.asStateFlow()

    private val _currentTab = MutableStateFlow(AppTab.LOBBY)
    val currentTab: StateFlow<AppTab> = _currentTab.asStateFlow()

    private val _activeGame = MutableStateFlow<GameType?>(null)
    val activeGame: StateFlow<GameType?> = _activeGame.asStateFlow()

    private val _activeVoiceRoom = MutableStateFlow<VoiceRoom?>(null)
    val activeVoiceRoom: StateFlow<VoiceRoom?> = _activeVoiceRoom.asStateFlow()

    private val _isVoiceRoomMinimized = MutableStateFlow(false)
    val isVoiceRoomMinimized: StateFlow<Boolean> = _isVoiceRoomMinimized.asStateFlow()

    private val _isMuted = MutableStateFlow(false)
    val isMuted: StateFlow<Boolean> = _isMuted.asStateFlow()

    // Modals
    private val _isAvatarStudioOpen = MutableStateFlow(false)
    val isAvatarStudioOpen: StateFlow<Boolean> = _isAvatarStudioOpen.asStateFlow()

    private val _isShopOpen = MutableStateFlow(false)
    val isShopOpen: StateFlow<Boolean> = _isShopOpen.asStateFlow()

    private val _isDailyCheckInOpen = MutableStateFlow(false)
    val isDailyCheckInOpen: StateFlow<Boolean> = _isDailyCheckInOpen.asStateFlow()

    private val _isLeaderboardOpen = MutableStateFlow(false)
    val isLeaderboardOpen: StateFlow<Boolean> = _isLeaderboardOpen.asStateFlow()

    private val _isCPOpen = MutableStateFlow(false)
    val isCPOpen: StateFlow<Boolean> = _isCPOpen.asStateFlow()

    private val _isFamilyOpen = MutableStateFlow(false)
    val isFamilyOpen: StateFlow<Boolean> = _isFamilyOpen.asStateFlow()

    private val _isGiftWallOpen = MutableStateFlow(false)
    val isGiftWallOpen: StateFlow<Boolean> = _isGiftWallOpen.asStateFlow()

    private val _isVisitorBookOpen = MutableStateFlow(false)
    val isVisitorBookOpen: StateFlow<Boolean> = _isVisitorBookOpen.asStateFlow()

    fun selectTab(tab: AppTab) {
        soundManager.playClick()
        _currentTab.value = tab
    }

    fun openGame(game: GameType) {
        soundManager.playDice()
        _activeGame.value = game
    }

    fun exitGame() {
        soundManager.playClick()
        _activeGame.value = null
    }

    fun joinVoiceRoom(room: VoiceRoom) {
        soundManager.playApplause()
        _activeVoiceRoom.value = room
        _isVoiceRoomMinimized.value = false
    }

    fun minimizeVoiceRoom() {
        soundManager.playClick()
        _isVoiceRoomMinimized.value = true
    }

    fun expandVoiceRoom() {
        soundManager.playClick()
        _isVoiceRoomMinimized.value = false
    }

    fun leaveVoiceRoom() {
        soundManager.playClick()
        _activeVoiceRoom.value = null
        _isVoiceRoomMinimized.value = false
    }

    fun toggleMute() {
        val next = !_isMuted.value
        _isMuted.value = next
        soundManager.setMuted(next)
    }

    fun sendGift(gift: RoomGift, targetSeatIndex: Int, targetUserName: String) {
        val user = _currentUser.value
        if (user.coins >= gift.price) {
            val updatedCoins = user.coins - gift.price
            val updatedCharm = user.charm + gift.charm
            val updatedExp = user.exp + (gift.charm * 2)
            _currentUser.value = user.copy(
                coins = updatedCoins,
                charm = updatedCharm,
                exp = updatedExp
            )
            soundManager.playGift(gift.id)
        }
    }

    fun handleGameWon(rewardExp: Int, rewardCoins: Int) {
        val user = _currentUser.value
        val updatedCoins = user.coins + rewardCoins
        val updatedExp = user.exp + rewardExp
        val updatedWon = user.gamesWon + 1
        val updatedPlayed = user.gamesPlayed + 1
        _currentUser.value = user.copy(
            coins = updatedCoins,
            exp = updatedExp,
            gamesWon = updatedWon,
            gamesPlayed = updatedPlayed
        )
        soundManager.playVictory()
    }

    fun handleWinReward(coins: Int, diamonds: Int, label: String) {
        val user = _currentUser.value
        _currentUser.value = user.copy(
            coins = user.coins + coins,
            diamonds = user.diamonds + diamonds
        )
        soundManager.playVictory()
    }

    fun buyShopItem(item: ShopItem) {
        val user = _currentUser.value
        if (item.currency == "coins" && user.coins >= item.price) {
            _currentUser.value = user.copy(coins = user.coins - item.price)
            soundManager.playApplause()
        } else if (item.currency == "diamonds" && user.diamonds >= item.price) {
            _currentUser.value = user.copy(diamonds = user.diamonds - item.price)
            soundManager.playApplause()
        }
    }

    fun claimCheckInReward(reward: CheckInDayReward) {
        val user = _currentUser.value
        _currentUser.value = user.copy(
            coins = user.coins + reward.coins,
            diamonds = user.diamonds + reward.diamonds,
            exp = user.exp + reward.exp
        )
        soundManager.playVictory()
    }

    fun updateAvatarConfig(config: AvatarConfig) {
        _currentUser.value = _currentUser.value.copy(avatarConfig = config)
        soundManager.playApplause()
    }

    // Modal toggles
    fun setAvatarStudioOpen(open: Boolean) { _isAvatarStudioOpen.value = open }
    fun setShopOpen(open: Boolean) { _isShopOpen.value = open }
    fun setDailyCheckInOpen(open: Boolean) { _isDailyCheckInOpen.value = open }
    fun setLeaderboardOpen(open: Boolean) { _isLeaderboardOpen.value = open }
    fun setCPOpen(open: Boolean) { _isCPOpen.value = open }
    fun setFamilyOpen(open: Boolean) { _isFamilyOpen.value = open }
    fun setGiftWallOpen(open: Boolean) { _isGiftWallOpen.value = open }
    fun setVisitorBookOpen(open: Boolean) { _isVisitorBookOpen.value = open }
}

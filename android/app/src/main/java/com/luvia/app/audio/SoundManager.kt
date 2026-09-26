package com.luvia.app.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.luvia.app.R

class SoundManager private constructor(context: Context) {
    private val appContext = context.applicationContext
    private var soundPool: SoundPool? = null
    private var isMuted: Boolean = false

    private var soundDice: Int = 0
    private var soundApplause: Int = 0
    private var soundVictory: Int = 0
    private var soundCarRev: Int = 0
    private var soundDragon: Int = 0
    private var soundCastle: Int = 0
    private var soundAlarm: Int = 0

    init {
        try {
            val audioAttributes = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_GAME)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            soundPool = SoundPool.Builder()
                .setMaxStreams(6)
                .setAudioAttributes(audioAttributes)
                .build()

            soundDice = soundPool?.load(appContext, R.raw.sfx_dice, 1) ?: 0
            soundApplause = soundPool?.load(appContext, R.raw.sfx_applause, 1) ?: 0
            soundVictory = soundPool?.load(appContext, R.raw.sfx_victory, 1) ?: 0
            soundCarRev = soundPool?.load(appContext, R.raw.sfx_car_rev, 1) ?: 0
            soundDragon = soundPool?.load(appContext, R.raw.sfx_dragon_roar, 1) ?: 0
            soundCastle = soundPool?.load(appContext, R.raw.sfx_castle_harp, 1) ?: 0
            soundAlarm = soundPool?.load(appContext, R.raw.sfx_alarm, 1) ?: 0
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setMuted(muted: Boolean) {
        isMuted = muted
    }

    fun isMuted(): Boolean = isMuted

    fun playDice() {
        if (!isMuted && soundDice != 0) soundPool?.play(soundDice, 0.8f, 0.8f, 1, 0, 1.0f)
        vibrate(30)
    }

    fun playApplause() {
        if (!isMuted && soundApplause != 0) soundPool?.play(soundApplause, 0.9f, 0.9f, 1, 0, 1.0f)
        vibrate(50)
    }

    fun playVictory() {
        if (!isMuted && soundVictory != 0) soundPool?.play(soundVictory, 1.0f, 1.0f, 1, 0, 1.0f)
        vibratePattern()
    }

    fun playCarRev() {
        if (!isMuted && soundCarRev != 0) soundPool?.play(soundCarRev, 0.9f, 0.9f, 1, 0, 1.0f)
        vibrate(60)
    }

    fun playDragon() {
        if (!isMuted && soundDragon != 0) soundPool?.play(soundDragon, 1.0f, 1.0f, 1, 0, 1.0f)
        vibratePattern()
    }

    fun playCastle() {
        if (!isMuted && soundCastle != 0) soundPool?.play(soundCastle, 0.9f, 0.9f, 1, 0, 1.0f)
        vibrate(40)
    }

    fun playAlarm() {
        if (!isMuted && soundAlarm != 0) soundPool?.play(soundAlarm, 0.8f, 0.8f, 1, 0, 1.0f)
        vibrate(40)
    }

    fun playClick() {
        vibrate(15)
    }

    fun playGift(giftId: String) {
        when {
            giftId.contains("dragon") -> playDragon()
            giftId.contains("lamborghini") || giftId.contains("helicopter") || giftId.contains("yacht") -> playCarRev()
            giftId.contains("castle") || giftId.contains("flower") || giftId.contains("galaxy") -> playCastle()
            else -> playApplause()
        }
    }

    private fun vibrate(durationMs: Long) {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = appContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                appContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            vibrator?.let {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    it.vibrate(VibrationEffect.createOneShot(durationMs, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    it.vibrate(durationMs)
                }
            }
        } catch (ignored: Exception) {}
    }

    private fun vibratePattern() {
        try {
            val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = appContext.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                appContext.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            vibrator?.let {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    val timings = longArrayOf(0, 40, 50, 60, 50, 100)
                    val amplitudes = intArrayOf(0, 150, 0, 200, 0, 255)
                    it.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                }
            }
        } catch (ignored: Exception) {}
    }

    companion object {
        @Volatile private var instance: SoundManager? = null

        fun getInstance(context: Context): SoundManager {
            return instance ?: synchronized(this) {
                instance ?: SoundManager(context).also { instance = it }
            }
        }
    }
}

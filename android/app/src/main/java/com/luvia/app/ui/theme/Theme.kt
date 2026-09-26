package com.luvia.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = LuviaPink,
    onPrimary = Color.White,
    primaryContainer = LuviaPurple,
    onPrimaryContainer = Color.White,
    secondary = LuviaCyan,
    onSecondary = Color.Black,
    secondaryContainer = LuviaSurfaceDark,
    onSecondaryContainer = Color.White,
    tertiary = LuviaGold,
    background = LuviaBgDark,
    onBackground = TextPrimary,
    surface = LuviaSurfaceDark,
    onSurface = TextPrimary,
    surfaceVariant = LuviaCardDark,
    onSurfaceVariant = TextSecondary,
    error = LuviaRed,
    onError = Color.White
)

@Composable
fun LuviaTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        typography = Typography,
        content = content
    )
}

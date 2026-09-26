package com.luvia.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.ui.theme.*

data class GlobalAnnouncement(
    val senderName: String,
    val targetName: String,
    val giftName: String,
    val giftEmoji: String,
    val roomTitle: String
)

@Composable
fun GlobalHavadisBanner(
    announcement: GlobalAnnouncement? = null,
    onClick: () -> Unit = {}
) {
    var defaultTextIndex by remember { mutableStateOf(0) }
    val defaultAnnouncements = remember {
        listOf(
            GlobalAnnouncement("Kral_Luvia", "Prenses_Ada", "Kristal Şato 🏰", "🏰", "Gece Kuşları"),
            GlobalAnnouncement("Ejderha_Reis", "Mavi_Gece", "Siber Ejderha 🐉", "🐉", "Sohbet Meydanı"),
            GlobalAnnouncement("Vip_Emir", "Gül_Bahçesi", "Lamborghini Red 🏎️", "🏎️", "Aşk Odası"),
            GlobalAnnouncement("Luvia_Star", "Oda Halkı", "Kırmızı Kese Yağmuru 🧧", "🧧", "VIP Eğlence")
        )
    }

    LaunchedEffect(Unit) {
        while (true) {
            kotlinx.coroutines.delay(6000)
            defaultTextIndex = (defaultTextIndex + 1) % defaultAnnouncements.size
        }
    }

    val item = announcement ?: defaultAnnouncements[defaultTextIndex]

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 3.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        Color(0xFF831843).copy(alpha = 0.85f),
                        Color(0xFF4C1D95).copy(alpha = 0.85f),
                        Color(0xFF0C4A6E).copy(alpha = 0.85f)
                    )
                )
            )
            .clickable { onClick() }
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Tag icon
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(8.dp))
                .background(Brush.horizontalGradient(VipGoldGradient))
                .padding(horizontal = 5.dp, vertical = 2.dp)
        ) {
            Text(
                text = "HAVADİS 📢",
                fontSize = 9.sp,
                fontWeight = FontWeight.Black,
                color = Color.Black
            )
        }

        Spacer(modifier = Modifier.width(6.dp))

        Text(
            text = "${item.senderName} ➔ ${item.targetName} 'na ${item.giftName} gönderdi!",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.White,
            maxLines = 1,
            modifier = Modifier.weight(1f)
        )

        Spacer(modifier = Modifier.width(4.dp))

        Text(
            text = "Odaya Git ➔",
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            color = LuviaCyanLight
        )
    }
}

package com.luvia.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.luvia.app.model.AvatarConfig
import com.luvia.app.model.MomentComment
import com.luvia.app.model.MomentPost
import com.luvia.app.model.User
import com.luvia.app.ui.components.AvatarView
import com.luvia.app.ui.theme.*

@Composable
fun MomentsScreen(
    currentUser: User
) {
    var showNewPostDialog by remember { mutableStateOf(false) }
    var newPostContent by remember { mutableStateOf("") }
    var newPostTag by remember { mutableStateOf("#LuviaParty") }

    val initialPosts = remember {
        listOf(
            MomentPost(
                id = "post_1",
                author = User(username = "Kral_Luvia", avatarConfig = AvatarConfig(hairStyle = "kpop", frame = "gold_vip"), vipLevel = 4),
                timeAgo = "15 dk önce",
                content = "Akşam saat 21:00'de düzenleyeceğimiz 10.000 Altın ödüllü Kurtadam turnuvasına tüm ailemiz davetlidir! 🐺🏆🔥",
                tag = "#Turnuva",
                likes = 34,
                hasLiked = false,
                comments = listOf(
                    MomentComment("c1", "Prenses_Ada", "Orada olacağım! 👑", "10 dk önce"),
                    MomentComment("c2", "SiberKedi", "Kurtadamı ben avlayacağım 🐺", "5 dk önce")
                ),
                mediaGradient = listOf(0xFF831843, 0xFF4C1D95)
            ),
            MomentPost(
                id = "post_2",
                author = User(username = "GeceMeleği", avatarConfig = AvatarConfig(hairStyle = "ponytail", frame = "sakura", accessory = "angel_wings"), vipLevel = 3),
                timeAgo = "1 saat önce",
                content = "Bugün Şans Çarkı'ndan Kristal Şato hediyesi kazandım! İnanılmaz bir gün! 🎡🏰✨",
                tag = "#ŞansÇarkı",
                likes = 52,
                hasLiked = true,
                comments = listOf(
                    MomentComment("c3", "Milyoner_Efe", "Tebrikler harika şans! 💎", "30 dk önce")
                ),
                mediaGradient = listOf(0xFF065F46, 0xFF064E3B)
            )
        )
    }

    val posts = remember { mutableStateListOf(*initialPosts.toTypedArray()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LuviaBgDark)
            .padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("✨ Keşfet & Anlar (Moments)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text("Topluluk paylaşımları ve etkinlik duyuruları", fontSize = 11.sp, color = TextSecondary)
            }

            Button(
                onClick = { showNewPostDialog = true },
                colors = ButtonDefaults.buttonColors(containerColor = LuviaPink),
                shape = RoundedCornerShape(14.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                modifier = Modifier.testTag("create_post_button")
            ) {
                Icon(Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text("Paylaş", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Posts Feed
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(posts) { post ->
                val postIdx = posts.indexOf(post)
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(20.dp))
                        .background(LuviaCardDark)
                        .border(1.dp, Color(0xFF334155), RoundedCornerShape(20.dp))
                        .padding(14.dp)
                ) {
                    // Author Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        AvatarView(config = post.author.avatarConfig, size = 42.dp)

                        Spacer(modifier = Modifier.width(10.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(post.author.username, color = Color.White, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(Brush.horizontalGradient(VipGoldGradient))
                                        .padding(horizontal = 4.dp, vertical = 1.dp)
                                ) {
                                    Text("VIP ${post.author.vipLevel}", fontSize = 8.sp, fontWeight = FontWeight.Black, color = Color.Black)
                                }
                            }
                            Text(post.timeAgo, color = TextMuted, fontSize = 10.sp)
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF312E81))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(post.tag, color = LuviaCyanLight, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = post.content,
                        color = Color.White,
                        fontSize = 13.sp,
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Media Card Banner
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(110.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(
                                Brush.linearGradient(
                                    post.mediaGradient.map { Color(it) }
                                )
                            )
                            .padding(12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("🎮 Luvia Moments Star ✨", color = Color.White, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Likes & Comments Count Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .clickable {
                                    if (postIdx != -1) {
                                        val newLiked = !post.hasLiked
                                        val newLikes = if (newLiked) post.likes + 1 else post.likes - 1
                                        posts[postIdx] = post.copy(hasLiked = newLiked, likes = newLikes)
                                    }
                                }
                                .padding(horizontal = 6.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                imageVector = if (post.hasLiked) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Beğen",
                                tint = if (post.hasLiked) LuviaRed else TextSecondary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("${post.likes} Beğeni", color = if (post.hasLiked) LuviaRed else TextSecondary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        Text("💬 ${post.comments.size} Yorum", color = TextSecondary, fontSize = 11.sp)
                    }
                }
            }
        }
    }

    if (showNewPostDialog) {
        AlertDialog(
            onDismissRequest = { showNewPostDialog = false },
            title = { Text("✨ Yeni An Paylaş", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column {
                    TextField(
                        value = newPostContent,
                        onValueChange = { newPostContent = it },
                        placeholder = { Text("Neler düşünüyorsun?", color = TextMuted) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = LuviaCardDark,
                            unfocusedContainerColor = LuviaCardDark,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        ),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp)
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newPostContent.isNotBlank()) {
                            posts.add(
                                0,
                                MomentPost(
                                    id = "post_${System.currentTimeMillis()}",
                                    author = currentUser,
                                    timeAgo = "Az önce",
                                    content = newPostContent,
                                    tag = newPostTag,
                                    likes = 1,
                                    hasLiked = true,
                                    comments = emptyList()
                                )
                            )
                            newPostContent = ""
                            showNewPostDialog = false
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LuviaPink)
                ) {
                    Text("Paylaş", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showNewPostDialog = false }) {
                    Text("İptal", color = TextSecondary)
                }
            },
            containerColor = LuviaSurfaceDark
        )
    }
}

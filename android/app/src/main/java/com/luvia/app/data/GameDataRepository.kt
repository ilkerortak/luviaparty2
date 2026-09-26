package com.luvia.app.data

data class TriviaQuestion(
    val category: String,
    val question: String,
    val options: List<String>,
    val correctIndex: Int,
    val explanation: String
)

data class MicGrabSong(
    val title: String,
    val artist: String,
    val lyricSnippet: String, // with [___] blank
    val missingWord: String,
    val options: List<String>
)

data class SpyWordPair(
    val civilianWord: String,
    val spyWord: String,
    val category: String
)

data class ShopItem(
    val id: String,
    val name: String,
    val category: String, // frame, outfit, accessory, vip, currency
    val price: Int,
    val currency: String, // coins or diamonds
    val emoji: String,
    val description: String
)

object GameDataRepository {

    val SPY_WORD_PAIRS = listOf(
        SpyWordPair("Pizza", "Lahmacun", "Yemekler"),
        SpyWordPair("Futbol", "Basketbol", "Spor"),
        SpyWordPair("İstanbul", "İzmir", "Şehirler"),
        SpyWordPair("Çay", "Kahve", "İçecekler"),
        SpyWordPair("Sinema", "Tiyatro", "Kültür"),
        SpyWordPair("Kedi", "Köpek", "Hayvanlar"),
        SpyWordPair("Akıllı Telefon", "Tablet", "Teknoloji"),
        SpyWordPair("Gitar", "Bağlama", "Müzik"),
        SpyWordPair("Yaz Tatili", "Kış Tatili", "Tatil"),
        SpyWordPair("Güneş Gözlüğü", "Şapka", "Aksesuar")
    )

    val TRIVIA_QUESTIONS = listOf(
        TriviaQuestion(
            category = "Genel Kültür",
            question = "Dünyanın en derin noktası olan Mariana Çukuru hangi okyanustadır?",
            options = listOf("Büyük Okyanus (Pasifik)", "Atlas Okyanusu", "Hint Okyanusu", "Arktik Okyanusu"),
            correctIndex = 0,
            explanation = "Mariana Çukuru Pasifik Okyanusu'nda yaklaşık 11.000 metre derinliğe sahiptir."
        ),
        TriviaQuestion(
            category = "Müzik & Sanat",
            question = "Hangisi ünlü ressam Leonardo da Vinci'nin başyapıtlarından biridir?",
            options = listOf("Yıldızlı Gece", "Mona Lisa", "Çığlık", "Belleğin Azmi"),
            correctIndex = 1,
            explanation = "Mona Lisa, Leonardo da Vinci tarafından 16. yüzyıl başında resmedilmiştir."
        ),
        TriviaQuestion(
            category = "Spor",
            question = "Futbolda Dünya Kupası'nı en çok kazanan ülke hangisidir?",
            options = listOf("Almanya", "İtalya", "Brezilya", "Arjantin"),
            correctIndex = 2,
            explanation = "Brezilya, 5 kez Dünya Kupası şampiyonu olmuştur."
        ),
        TriviaQuestion(
            category = "Bilim & Uzay",
            question = "Güneş Sistemi'mizin en büyük gezegeni hangisidir?",
            options = listOf("Mars", "Satürn", "Jüpiter", "Neptün"),
            correctIndex = 2,
            explanation = "Jüpiter, Güneş Sistemi'nin kütle ve hacimce en büyük gaz devidir."
        ),
        TriviaQuestion(
            category = "Tarih",
            question = "Cumhuriyetimiz kaç yılında ilan edilmiştir?",
            options = listOf("1919", "1920", "1923", "1924"),
            correctIndex = 2,
            explanation = "Türkiye Cumhuriyeti 29 Ekim 1923 tarihinde ilan edilmiştir."
        ),
        TriviaQuestion(
            category = "Sinema",
            question = "Yüzüklerin Efendisi serisinde Tek Yüzük hangi dağın alevlerinde yok edilmiştir?",
            options = listOf("Hüküm Dağı (Mount Doom)", "Dumanlı Dağlar", "Yalnız Dağ", "Erebor"),
            correctIndex = 0,
            explanation = "Tek Yüzük, Mordor'daki Hüküm Dağı'nın alevlerinde dövülmüş ve orada yok edilmiştir."
        )
    )

    val MIC_GRAB_SONGS = listOf(
        MicGrabSong(
            title = "Şımarık",
            artist = "Tarkan",
            lyricSnippet = "Yakalarsam [___] seni, kıvır kıvır oynatırım!",
            missingWord = "öperim",
            options = listOf("öperim", "severim", "tutarım", "yakalarım")
        ),
        MicGrabSong(
            title = "Aşk Kaç Beden Giyer",
            artist = "Hadise",
            lyricSnippet = "Gözlerin gözlerime [___], kalbim yerinden fırlıyor!",
            missingWord = "değince",
            options = listOf("değince", "bakınca", "gülünce", "gelince")
        ),
        MicGrabSong(
            title = "Antidepresan",
            artist = "Mert Demir & Mabel Matiz",
            lyricSnippet = "Kafamda binbir türlü [___], bu dertler bitmek bilmiyor!",
            missingWord = "tilki",
            options = listOf("tilki", "soru", "fikir", "şüphe")
        ),
        MicGrabSong(
            title = "Dudu",
            artist = "Tarkan",
            lyricSnippet = "Ağlama değmez hayat, bu [___] için!",
            missingWord = "gözyaşlarına",
            options = listOf("gözyaşlarına", "ayrılık", "hasret", "keder")
        ),
        MicGrabSong(
            title = "Ele Güne Karşı",
            artist = "MFÖ",
            lyricSnippet = "Ele güne karşı yapayalnız, böyle de [___] ki!",
            missingWord = "olmaz",
            options = listOf("olmaz", "bitmez", "geçmez", "gitmez")
        )
    )

    val SHOP_ITEMS = listOf(
        ShopItem("frame_fire", "Alevli Ejder Çerçevesi", "frame", 1500, "coins", "🔥", "Profilinizde parıldayan neon alev animasyonlu çerçeve."),
        ShopItem("frame_sakura", "Sakura Baharı Çerçevesi", "frame", 2000, "coins", "🌸", "Düşen pembe sakura yaprakları ile büyülü çerçeve."),
        ShopItem("frame_cyber", "Siber Neon Glow", "frame", 3500, "coins", "⚡", "Fütüristik mavi-mor neon ışıklarıyla öne çıkın."),
        ShopItem("vip_gold", "VIP 1 Aylık Kartı", "vip", 300, "diamonds", "👑", "Tüm odalarda altın giriş efekti, %20 daha fazla EXP ve VIP rozeti."),
        ShopItem("acc_angel", "Melek Kanatları", "accessory", 1200, "coins", "🪽", "Avatarınıza eklenecek bembeyaz ışıltılı melek kanatları."),
        ShopItem("acc_crown", "İmparator Tacı", "accessory", 2500, "coins", "👑", "Luvia krallarına ve kraliçelerine yakışan altın taç."),
        ShopItem("coins_pack_1", "10,000 Altın Paketi", "currency", 50, "diamonds", "💰", "Oyunlarda ve odalarda hediye göndermek için altın paketi."),
        ShopItem("coins_pack_2", "50,000 Altın Mega Paket", "currency", 200, "diamonds", "💎", "Mega indirimli 50.000 altın rezervi.")
    )
}

package com.luvia.app.data

import com.luvia.app.model.RoomGift

object GiftsRepository {
    val ALL_GIFTS = listOf(
        RoomGift(
            id = "love_letter",
            name = "Aşk Mektubu",
            price = 50,
            category = "popular",
            badge = "Aşk",
            rarity = "common",
            description = "Kanatlı mühürlü masum aşk ve selam mektubu",
            quote = "En samimi duygular satırlara sığmaz ama kalpte yankılanır! 💌",
            charm = 10,
            emoji = "💌"
        ),
        RoomGift(
            id = "golden_rose",
            name = "Altın Gül",
            price = 100,
            category = "popular",
            badge = "Etkinlik",
            rarity = "common",
            description = "24K saf altından parıldayan ebedi aşk gülü",
            quote = "Solmayan bir sevgi, altın gibi parıldayan bir dostluk için! 🌹",
            charm = 20,
            emoji = "🌹"
        ),
        RoomGift(
            id = "magic_bear",
            name = "Sihirli Ayıcık",
            price = 150,
            category = "popular",
            badge = "Sevgi",
            rarity = "common",
            description = "Kırmızı kalp tutan sevimli pamuk ayıcık",
            quote = "Sana sıcacık, tatlı ve kocaman bir sarılma gönderiyorum! 🧸💖",
            charm = 30,
            emoji = "🧸"
        ),
        RoomGift(
            id = "golden_key",
            name = "Altın Anahtar",
            price = 200,
            category = "popular",
            badge = "Piyango",
            rarity = "common",
            description = "Ametist taşlı efsanevi şans ve bereket anahtarı",
            quote = "Şans ve bereketin kapılarını sonuna kadar arala! 🗝️✨",
            charm = 40,
            emoji = "🗝️"
        ),
        RoomGift(
            id = "diamond_ring",
            name = "Pırlanta Yüzük",
            price = 300,
            category = "popular",
            badge = "Lüks",
            rarity = "rare",
            description = "Kusursuz elmas kesim tektaş pırlanta yüzük",
            quote = "Işıltınla tüm odayı ve kalpleri büyülüyorsun! 💍💎",
            charm = 60,
            emoji = "💍"
        ),
        RoomGift(
            id = "rose_bouquet",
            name = "Gül Buketi",
            price = 500,
            category = "popular",
            badge = "Aşk",
            rarity = "rare",
            description = "99 kırmızı kadife gül ve altın saten kurdele",
            quote = "Binlerce kelimeye bedel, sana özel 99 taze gül! 💐❤️",
            charm = 100,
            emoji = "💐"
        ),
        RoomGift(
            id = "night_fragrance",
            name = "Gece Parfümü",
            price = 200,
            category = "special",
            badge = "Etkinlik",
            rarity = "common",
            description = "Büyülü lavanta esansı ve yıldız tozu iksiri",
            quote = "Gecenin büyüsü ve zarafeti daima seninle olsun! 🔮✨",
            charm = 40,
            emoji = "✨"
        ),
        RoomGift(
            id = "golden_trophy",
            name = "Altın Kupa",
            price = 400,
            category = "special",
            badge = "Şampiyon",
            rarity = "rare",
            description = "1 Numaralı altın zafer ve şampiyonluk kupası",
            quote = "Odanın ve kalplerin tartışmasız 1 numaralı şampiyonu! 🏆🥇",
            charm = 80,
            emoji = "🏆"
        ),
        RoomGift(
            id = "piano_melodies",
            name = "Piyano Melodileri",
            price = 600,
            category = "special",
            badge = "Müzik",
            rarity = "rare",
            description = "Gökyüzüne yükselen altın notalar ve melodi",
            quote = "En tatlı melodiler kalbinin ritminde çalsın! 🎹🎶",
            charm = 120,
            emoji = "🎹"
        ),
        RoomGift(
            id = "fireworks_show",
            name = "Havai Fişek",
            price = 800,
            category = "special",
            badge = "Parti",
            rarity = "rare",
            description = "Gökyüzünü rengarenk aydınlatan muhteşem kutlama",
            quote = "Bu gece senin şerefine gökyüzü alev alev parıldıyor! 🎆🎉",
            charm = 160,
            emoji = "🎆"
        ),
        RoomGift(
            id = "snow_globe",
            name = "Kar Küresi",
            price = 1200,
            category = "special",
            badge = "Büyülü",
            rarity = "epic",
            description = "İçinde peri masalı şatosu olan parıltılı kristal küre",
            quote = "Masalsı diyarların en masum ve büyüleyici anısı! 🔮❄️",
            charm = 240,
            emoji = "🔮"
        ),
        RoomGift(
            id = "royal_crown",
            name = "Kraliyet Tacı",
            price = 3500,
            category = "vip",
            badge = "Kraliyet",
            rarity = "epic",
            description = "Yakut ve safir taşlı 24K saf altın imparatorluk tacı",
            quote = "Asaletin taç giyme vakti geldi, krallara layıksın! 👑✨",
            charm = 700,
            emoji = "👑"
        ),
        RoomGift(
            id = "golden_helicopter",
            name = "Altın Helikopter",
            price = 5000,
            category = "vip",
            badge = "VIP Uçuş",
            rarity = "legendary",
            description = "VIP iniş takımlı altın kaplama özel helikopter",
            quote = "Göklerin hakimi gibi odanın zirvesine iniş yapıyoruz! 🚁⭐",
            charm = 1000,
            emoji = "🚁"
        ),
        RoomGift(
            id = "luxury_yacht",
            name = "Lüks Yat",
            price = 7500,
            category = "vip",
            badge = "Mega Lüks",
            rarity = "legendary",
            description = "Turkuaz sularda süzülen 3 katlı lüks mega yat",
            quote = "Engin denizlerde lüksün ve özgürlüğün tadını çıkar! 🛥️🌊",
            charm = 1500,
            emoji = "🛥️"
        ),
        RoomGift(
            id = "lamborghini_red",
            name = "Lamborghini Red",
            price = 9999,
            category = "vip",
            badge = "Süper Spor",
            rarity = "legendary",
            description = "Alev kusan lazer farlı süper spor canavar",
            quote = "Yolları ve kalpleri alev alev yakan hız tutkusu! 🏎️🔥",
            charm = 2000,
            emoji = "🏎️"
        ),
        RoomGift(
            id = "cyber_dragon",
            name = "Siber Ejderha",
            price = 12000,
            category = "event",
            badge = "Efsanevi",
            rarity = "legendary",
            description = "Neon zırhlı siber mekanik gök ejderhası",
            quote = "Gökleri yaran kükremeyle odanın tek efendisi sensin! 🐉⚡",
            charm = 2500,
            emoji = "🐉"
        ),
        RoomGift(
            id = "flower_goddess",
            name = "Çiçek Tanrıçası",
            price = 15000,
            category = "event",
            badge = "Mitolojik 🌸",
            rarity = "mythic",
            description = "Çiçek salıncağında süzülen bahar ve doğa perisi",
            quote = "Doğa ananın en güzel lütfusun bana! 🌸🧚‍♀️",
            charm = 7999,
            emoji = "🌸"
        ),
        RoomGift(
            id = "crystal_castle",
            name = "Kristal Şato",
            price = 30000,
            category = "event",
            badge = "İmparatorluk 🏰",
            rarity = "mythic",
            description = "Bulutların üstünde yükselen masalsı buz ve kristal saray",
            quote = "Hayallerinin ötesinde bir krallık kurduk senin için! 🏰💎✨",
            charm = 6000,
            emoji = "🏰"
        )
    )
}

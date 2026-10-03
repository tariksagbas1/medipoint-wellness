# Medipoint Wellness — menü sitesi

`medipointwellness.com` için QR menü ve yönetim paneli.

- **Ön yüz:** sade HTML/CSS/JS (build adımı yok), GitHub Pages'te yayınlanır.
- **Arka uç:** Supabase (Postgres + RLS, Auth, Storage, bir Edge Function).
- **Sayfalar:** `/` menü, `/admin` yönetim paneli (Supabase girişi gerekir).

```
index.html                 Menü
admin/index.html           Yönetim paneli
assets/css/                base · menu · admin stilleri
assets/js/config.js        Supabase URL + publishable key  ← ayarlanacak
assets/js/menu.js          Menü: veri, arama, kategori takibi, ürün detayı
assets/js/admin.js         Panel: giriş, ürün/kategori/ayar düzenleme, foto yükleme
supabase/migrations/       Şema, depolama, eski menüden seed (163 ürün, 23 kategori)
supabase/functions/        import-external-images (harici fotoğrafları depoya kopyalar)
scripts/csv_to_seed.py     Google Sheets CSV'sinden seed migration üretir
```

## Kurulum

### 1. Proje URL'sini girin

`assets/js/config.js` içindeki `SUPABASE_URL` değerini kendi proje adresinizle değiştirin
(Supabase → Project Settings → Data API → Project URL). Publishable key zaten ekli.

### 2. Migration'ları uygulayın

Supabase CLI ile:

```bash
supabase link --project-ref <project-ref>
```

```bash
supabase db push
```

CLI kullanmıyorsanız `supabase/migrations/` altındaki üç dosyayı sırasıyla SQL Editor'da çalıştırın:

| Dosya | İçerik |
| --- | --- |
| `…01_menu_schema.sql` | `admins`, `categories`, `menu_items`, `site_settings` tabloları, `is_admin()` ve RLS kuralları |
| `…02_storage_menu_items_bucket.sql` | Herkese açık `menu-items` bucket'ı (5 MB, sadece görsel) ve yalnızca yöneticilerin yazabildiği politikalar |
| `…03_seed_menu.sql` | Eski menü (CSV) — tablo boşsa çalışır, tekrar çalıştırmak güvenli |

### 3. Yönetici hesabı

1. Authentication → Users → **Add user** ile e-posta + şifre oluşturun ("Auto confirm" işaretli).
2. SQL Editor'da e-postayı yönetici listesine ekleyin:

   ```sql
   insert into public.admins (email) values ('siz@ornek.com');
   ```

3. Önerilen: Authentication → Sign In / Providers → Email altında **Allow new users to sign up** seçeneğini kapatın.
   (Kapatmasanız da yönetici listesinde olmayan hesaplar hiçbir şeyi değiştiremez.)

### 4. Edge Function

```bash
supabase functions deploy import-external-images --no-verify-jwt
```

Fonksiyon oturumu ve yönetici yetkisini kendi içinde kontrol eder (`--no-verify-jwt` bu yüzden güvenli,
yeni publishable/secret anahtarlarla da çalışır). `SUPABASE_URL` ve `SUPABASE_SERVICE_ROLE_KEY`
Supabase tarafından otomatik sağlanır.

Deploy ettikten sonra `/admin` → **Ayarlar** → **Fotoğrafları depoya taşı** ile eski menüdeki
Cloudinary/Yemeksepeti fotoğraflarını `menu-items` bucket'ına kopyalayabilirsiniz.

## Yönetim paneli

- **Ürünler:** arama, kategori/durum filtresi, tek tıkla menüde göster/gizle, yan panelde düzenleme.
  Fotoğraflar tarayıcıda 1600 px'e küçültülüp WebP'ye çevrilir ve
  `menu-items/items/<ürün-id>/…` yoluna yüklenir. Fotoğraf değişince ya da ürün silinince eski dosya da silinir.
- **Kategoriler:** ekle, yeniden adlandır, alt başlık, sırala, gizle. İçinde ürün olan kategori silinemez.
- **Ayarlar:** fiyat notu ve tarihi, Google yorum bağlantısı, Instagram, telefon, adres.

## Yerelde çalıştırma

```bash
python3 -m http.server 5173
```

Sonra `http://localhost:5173` ve `http://localhost:5173/admin/`.

## Seed'i yeniden üretmek

```bash
python3 scripts/csv_to_seed.py "Menu - Sayfa1.csv" > supabase/migrations/20261003000003_seed_menu.sql
```

Açıklamalardaki `(400 kcal)`, `(Süt ürünleri içerir. Alerjendir.)` ve çölyak uyarıları ayrı
alanlara (`calories`, `allergens`, `not_celiac_safe`) ayrıştırılır.

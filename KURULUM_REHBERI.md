# 🚀 Sıfırdan Adım Adım Kurulum Rehberi (Tam Kılavuz)

Bu rehber, projenizin Firebase tarafındaki kurulumundan, GitHub Pages'de yayınlanmasına kadar yapmanız gereken HER ŞEYİ sırasıyla anlatır. Hiçbir adımı atlamayın.

---

## 1. BÖLÜM: Firebase Kurulumu (Console Tarafı)

Bu adımlar [console.firebase.google.com](https://console.firebase.google.com) adresinde yapılacaktır.

### 1.1. Proje Oluşturma
1.  **"Add project"** butonuna tıklayın.
2.  Projeye bir isim verin (ör: `site-yonetim-sistemi`).
3.  Google Analytics'i bu proje için **kapatabilirsiniz** (zorunlu değil).
4.  **"Create project"** diyerek projeyi oluşturun.

### 1.2. Web Uygulaması Ekleme
1.  Proje ana sayfasında **`</>` (Web)** simgesine tıklayın.
2.  Uygulama takma adı girin (ör: `Site Yonetim`).
3.  **"Also set up Firebase Hosting"** seçeneğini **İŞARETLEMEYİN** (Biz GitHub Pages kullanacağız).
4.  **"Register app"** butonuna tıklayın.
5.  Karşınıza gelen **`const firebaseConfig = { ... }`** kodunu bir yere kopyalayın. Bu bilgiler birazdan lazım olacak!
6.  "Continue to console" diyerek bitirin.

### 1.3. Authentication (Üyelik Sistemi) Açma
1.  Sol menüden **"Build"** -> **"Authentication"** seçin.
2.  **"Get started"** butonuna tıklayın.
3.  **"Sign-in method"** sekmesinde **"Email/Password"** seçeneğine tıklayın.
4.  **"Enable"** anahtarını açın ve **"Save"** deyin.

### 1.4. Firestore Database (Veritabanı) Oluşturma
1.  Sol menüden **"Build"** -> **"Firestore Database"** seçin.
2.  **"Create database"** butonuna tıklayın.
3.  Konum (Location) olarak size en yakın yeri seçin (ör: `eur3` europe-west).
4.  Güvenlik kuralları adımında **"Start in test mode"** seçin (Geliştirme süreci için).
5.  **"Create"** diyerek oluşturun.

### 1.5. Storage (Dosya Depolama) Açma
1.  Sol menüden **"Build"** -> **"Storage"** seçin.
2.  **"Get started"** butonuna tıklayın.
3.  **"Start in test mode"** seçerek devam edin ve oluşturun.

---

## 2. BÖLÜM: Proje Ayarları (Bilgisayarınızda)

### 2.1. Çevre Değişkenlerini Ayarlama
1.  Proje klasöründe `.env.example` dosyasını bulun.
2.  Bu dosyanın bir kopyasını oluşturun ve adını `.env` yapın:
    ```bash
    cp .env.example .env
    ```
3.  `.env` dosyasını açın ve **1.2. adımda** kopyaladığınız Firebase bilgilerini buraya yapıştırın. Örnek:
    ```
    VITE_FIREBASE_API_KEY=AIzaSyD...
    VITE_FIREBASE_AUTH_DOMAIN=site-yonetim...
    ...
    ```
4.  Dosyayı kaydedin.

### 2.2. Yerel Test
1.  Terminalde proje bağımlılıklarını yükleyin (Bu adım İLK DEFA kurarken zorunludur):
    ```bash
    npm install
    ```
2.  Projeyi çalıştırın:
    ```bash
    npm run dev
    ```
3.  Tarayıcıda açılan sayfada (genelde `http://localhost:3000`) sitenin açıldığını ve giriş yapılabildiğini (veya en azından hata vermediğini) teyit edin.

---

## 3. BÖLÜM: GitHub Ayarları (Deployment)

### 3.1. GitHub Secrets Ekleme (Kritik Adım 🔒)
Sitenin GitHub üzerinde derlenebilmesi için şifrelerinizi GitHub'a tanıtmanız lazım.

1.  GitHub projenize gidin.
2.  Yukarıdan **"Settings"** sekmesine tıklayın.
3.  Sol menüden **"Secrets and variables"** -> **"Actions"** seçin.
4.  **"New repository secret"** butonuna tıklayın.
5.  `.env` dosyanızdaki **HER BİR SATIR** için tek tek secret oluşturun.
    *   **Name:** `VITE_FIREBASE_API_KEY`
    *   **Secret:** (Sizin .env dosyanızdaki `AIzaSyD...` değeri)
    *   ... Diğer 5 anahtar için de aynısını yapın.

### 3.2. Değişiklikleri Gönderme
Her şey hazır! Şimdi ayarlarımızı GitHub'a gönderelim.

Terminalde şu komutları çalıştırın:

```bash
# Tüm değişiklikleri ekle
git add .

# Değişiklikleri onayla
git commit -m "Kurulum tamamlandı: Firebase ve GitHub Secrets ayarları"

# GitHub'a gönder
git push origin main
```

---

## 4. BÖLÜM: Sonuç

`git push` komutundan sonra:

1.  GitHub repository'nizde **"Actions"** sekmesine gidin.
2.  **"Deploy to GitHub Pages"** isimli işlemin çalıştığını (sarı dönen daire) göreceksiniz.
3.  Yaklaşık 1-2 dakika bekleyin.
4.  İşlem yeşil olduğunda (✅), siteniz `https://yusakru.github.io/site-yonetim-sistemi/` adresinde yayında olacaktır!

🎉 **Tebrikler! Kurulum tamamlandı.**

---

## 5. BÖLÜM: İlk Yönetici (Admin) Hesabını Oluşturma

> [!WARNING]
> **⚠️ GÜVENLİK UYARISI:**
> Sisteme entegre edilen **Hibrit Simülasyon (Mock Mode)**, varsayılan test e-postaları (`admin@site.com` vb.) ve `123456` şifresiyle giriş yapıldığında Firebase'i bypass ederek doğrudan giriş yapmaktadır.
> 
> Canlı ortamda (production) gerçek kullanıcıların güvenliği için ilk yöneticinizi oluşturduktan sonra [authService.js](src/services/authService.js) dosyasındaki `MOCK_USERS` nesnesini boşaltmayı veya silmeyi unutmayın!

Sistem boş olduğu için henüz giriş yapacak bir kullanıcınız yok. İlk yöneticiyi manuel oluşturacağız:

### 5.1. Kullanıcıyı Oluştur (Authentication)
1.  Firebase Console'da **Authentication** -> **Users** sekmesine gidin.
2.  **"Add user"** butonuna tıklayın.
3.  Bir e-posta ve şifre belirleyin (Ör: `admin@site.com` / `123456`).
4.  **"Add user"** diyerek kullanıcıyı oluşturun.
5.  Oluşan kullanıcının satırındaki **"User UID"** sütunundaki kodu kopyalayın (Ör: `k7s8d6f8...`). Bu kod çok önemli!

### 5.2. Yetki Ver (Firestore Database)
Kullanıcı oluşturuldu ama henüz "Yönetici" yetkisi yok. Bunu veritabanına elle ekleyeceğiz.

1.  Firebase Console'da **Firestore Database** sekmesine gidin.
2.  **"Start collection"** butonuna tıklayın.
3.  **Collection ID**: `users` yazın ve Next deyin.
4.  **Document ID**: Az önce kopyaladığınız **User UID**'yi buraya yapıştırın.
5.  Aşağıdaki alanları ekleyin:
    *   **Field:** `email`, **Type:** `string`, **Value:** `admin@site.com`
    *   **Field:** `role`, **Type:** `string`, **Value:** `admin`  (⚠️ Bu çok önemli, küçük harfle 'admin' yazın)
    *   **Field:** `full_name`, **Type:** `string`, **Value:** `Site Yöneticisi`
6.  **"Save"** butonuna tıklayın.

✅ Artık bu emaili ve şifreyi kullanarak sisteme giriş yapabilirsiniz!

---

### 5.3. Diğer Rolleri Oluşturma (Opsiyonel)
Sistemde **Admin (Yönetici)** dışında **Personel** ve **Site Sakini** rolleri de mevcuttur. Bu rolleri test etmek veya kullanmak için aşağıdaki adımları izleyerek yeni kullanıcılar oluşturabilirsiniz:

**Personel (Staff) İçin:**
1.  **Authentication** sekmesinden yeni bir kullanıcı oluşturun (Ör: `staff@site.com`).
2.  **Firestore Database** > `users` koleksiyonuna gidin.
3.  **"Add document"** diyerek yeni kullanıcının **UID**'sini girin.
4.  Aşağıdaki alanları ekleyin:
    *   **Field:** `email`, **Type:** `string`, **Value:** `staff@site.com`
    *   **Field:** `role`, **Type:** `string`, **Value:** `staff`
    *   **Field:** `full_name`, **Type:** `string`, **Value:** `Örnek Personel`

**Site Sakini (Resident) İçin:**
1.  **Authentication** sekmesinden yeni bir kullanıcı oluşturun (Ör: `resident@site.com`).
2.  **Firestore Database** > `users` koleksiyonuna gidin.
3.  **"Add document"** diyerek yeni kullanıcının **UID**'sini girin.
4.  Aşağıdaki alanları ekleyin:
    *   **Field:** `email`, **Type:** `string`, **Value:** `resident@site.com`
    *   **Field:** `role`, **Type:** `string`, **Value:** `resident`
    *   **Field:** `full_name`, **Type:** `string`, **Value:** `Örnek Sakin`

⚠️ **Not:** `role` alanını doğru yazmak (küçük harflerle: `admin`, `staff`, `resident`) sistemin doğru arayüzü göstermesi için kritiktir.


---

## 6. BÖLÜM: Bu Projeyi Başka Bir Hesaba Kopyalama (Fork & Deploy)

Bu projeyi beğenip kendi GitHub hesabınızda yayınlamak istiyorsanız, basit bir "Fork" işlemi yeterli değildir. Çünkü veritabanı şifreleri ve URL ayarları size özel olmalıdır.

Kendi versiyonunuzu yayınlamak için şu sırayı takip edin:

### 6.1. Projeyi Kopyalayın (Fork)
1.  GitHub sayfasının sağ üst köşesindeki **"Fork"** butonuna tıklayın.
2.  Kendi hesabınızı seçin ve projeyi kopyalayın.

### 6.2. Kendi Firebase Projenizi Oluşturun
Proje orijinal haliyle çalışmaz çünkü benim veritabanıma erişim şifrelerine (Secrets) sahip değilsiniz.
*   **1. BÖLÜM**'deki adımları uygulayarak **kendinize ait yeni bir Firebase projesi** oluşturun ve kendi API anahtarlarınızı alın.

### 6.3. Secret'ları Ekleyin
*   **3.1. ADIM**'daki gibi, GitHub repo ayarlarınıza gidip **kendi Firebase bilgilerinizi** `Secrets` olarak ekleyin.

### 6.4. URL Ayarını Yapın (Kritik Adım ⚠️)
Eğer GitHub kullanıcı adınız veya repo isminiz değiştiyse, site adresi de değişecektir. Bunu projeye tanıtmalısınız:

1.  `vite.config.js` dosyasını açın.
2.  `base:` satırını bulun ve kendi repo isminize göre güncelleyin:
    ```javascript
    // Örnek: Kullanıcı adınız 'ahmet', repo adınız 'site-yonetim' ise:
    base: '/site-yonetim/',
    ```
3.  Eğer repo adınız orijinaliyle aynı (`site-yonetim-sistemi`) ise `.env` veya config değişikliğine gerek yoktur.

### 6.5. Gönderin
Yaptığınız bu küçük değişiklikleri commit edip push'ladığınızda, GitHub Actions otomatik olarak çalışacak ve siteniz **sizin hesabınız üzerinden** yayınlanacaktır.


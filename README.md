# Alumni Tracking System (Mezun Takip Sistemi)

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717.svg)](https://github.com/ceydasenemyigit/alumni)

---

## 📌 Proje Hakkında (About the Project)

**Alumni Tracking System (Mezun Takip Sistemi)**, üniversite mezunlarının kariyer ve iletişim bilgilerini güncel tutmalarını, üniversite yönetimi ve diğer mezunlar ile güçlü bir bağ kurmalarını sağlamak amacıyla geliştirilmektedir. İstanbul Üniversitesi Web Programlama dersi kapsamında adım adım geliştirilen bir web uygulamasıdır.

This project is an Alumni Tracking System developed to manage alumni records, support communication, and track career developments between alumni and the university.

---

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

- **Backend:** [Node.js](https://nodejs.org/) (Express.js / RESTful API)
- **Veritabanı (Database):** [PostgreSQL](https://www.postgresql.org/)
- **Konteynerizasyon (Containerization):** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Sürüm Kontrolü & İş Birliği:** [Git](https://git-scm.com/) & [GitHub](https://github.com/)

---

## 🚀 Temel Özellikler (Core Features)

- [x] **Mezun Profili Yönetimi:** Kişisel bilgiler, mezuniyet yılı, bölüm, iş deneyimleri ve iletişim kanalları.
- [x] **Arama ve Filtreleme:** Mezunları mezuniyet yılı, şirket, unvan veya şehre göre arayabilme.
- [x] **Kimlik Doğrulama & Yetkilendirme:** JWT tabanlı güvenli kullanıcı girişi ve rol yönetimi (Admin, Mezun vb.).
- [x] **Duyuru ve Etkinlikler:** Mezunlar için etkinlik, iş ilanı ve üniversite duyurularının paylaşımı.
- [x] **Docker Desteği:** Tek komutla backend ve veritabanı servislerini ayağa kaldırma imkanı.

---

## 📂 Planlanan Proje Yapısı (Project Structure)

```text
alumni/
├── docker-compose.yml       # Docker Compose servis tanımları (Node.js & PostgreSQL)
├── Dockerfile               # Backend için Docker imajı
├── README.md                # Proje dokümantasyonu
├── .env.example             # Örnek çevre değişkenleri
├── .gitignore               # Git tarafından yok sayılacak dosyalar
├── src/
│   ├── config/              # Veritabanı ve ortam konfigürasyonları
│   ├── controllers/         # İstek yönlendirici iş mantığı (Controllers)
│   ├── models/              # PostgreSQL veri modelleri / şemaları
│   ├── routes/              # Express API rotaları
│   ├── middlewares/         # Yetkilendirme ve hata yakalama ara yazılımları
│   └── app.js               # Uygulama başlangıç noktası (Entry point)
└── package.json             # Bağımlılıklar ve npm scriptleri
```

---

## ⚙️ Kurulum ve Çalıştırma (Getting Started)

### Ön Koşullar (Prerequisites)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/)
- *(Opsiyonel)* [Node.js](https://nodejs.org/) (v18 veya üzeri)

### 1. Depoyu Klonlayın (Clone Repository)
```bash
git clone https://github.com/ceydasenemyigit/alumni.git
cd alumni
```

### 2. Çevre Değişkenlerini Ayarlayın (Environment Setup)
`.env.example` dosyasını referans alarak bir `.env` dosyası oluşturun:
```env
PORT=5000
NODE_ENV=development

# PostgreSQL Bağlantı Bilgileri
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=alumni_db

# JWT Gizli Anahtarı
JWT_SECRET=supersecretkey
```

### 3. Docker ile Çalıştırma (Run with Docker)
Tüm servisleri (Node.js backend ve PostgreSQL) Docker Compose ile tek adımda başlatın:

```bash
docker compose up --build -d
```

Servisleri durdurmak için:
```bash
docker compose down
```

---

## 🧪 Geliştirme Süreci (Development)

Proje dönem boyunca adım adım geliştirilmeye devam edecektir:
1. Veritabanı modellemesi ve PostgreSQL tablolarının oluşturulması
2. Node.js backend RESTful API uçlarının (endpoints) kodlanması
3. Kimlik doğrulama (JWT) mekanizmasının entegrasyonu
4. Docker Compose yapılandırmasının tamamlanması ve testler

---

## 👥 Katkıda Bulunanlar (Contributors)

- **Geliştirici:** [@ceydasenemyigit](https://github.com/ceydasenemyigit) & [@bseyma](https://github.com/bseyma)

---

## 📄 Lisans (License)

Bu proje eğitim amaçlı geliştirilmiş olup MIT Lisansı kapsamında paylaşılabilir.
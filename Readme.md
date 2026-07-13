# Gacha Games

aplikasi web dengan backend **Express.js** dan frontend **Next.js**.
Fitur Yang Tersedia Diantaranya Mencangkup

## 1. Role Users
 - ADMINISTRATOR
 - USER

## 2. Page Login
 - Form Login
 - Form Register

## 3. Dashboard Admin
   - Events => untuk mengelola event yang akan diselenggarakan
   - Item Database => untuk mengelola item yang akan di gacha
   - Global History => untuk melihat history gacha secara keseluruhan
   - Settings => untuk mendaftarkan akun ADMIMNISTRATOR

## 4 Dashboard User
   - Gacha => untuk melakukan gacha
   - History => untuk melihat history gacha
   - inventory => untuk melihat item yang di dapatkan

## 5 Struktur Database
    - users => untuk menyimpan data users
    - items => untuk menyimpan data items
    - events => untuk menyimpan data events
    - gacha_log => untuk menyimpan data gacha history
    - inventory => untuk menyimpan data inventory

## 6 Struktur Proyek
project-root/
├── backend/          # Express.js API server
│   ├── src/
│   │    ├── Assets/
│   │    ├── config/
│   │    ├── libs/
│   │    ├── src/
│   │    ├── middleware/
│   │    ├── modules/
│   ├── package.json
│   └── .env
├── frontend/          # Next.js client
│   ├── app/ (atau pages/)
│   ├── package.json
│   └── .env.example
├── DB/
├── ERD/
└── README.md

## Panduan Instalasi
- Node.js V20 atau lebih baru
- npm
- Postgresql

## Clone Repository
```bash
git clone https://github.com/maulanadiki/GachaSystem.git
cd nama-proyek
```

## Setup Backend (Express.js)
```bash
cd backend
npm install
cp  .env
```
isi File `.env` sesuai kebutuhan
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=gatcha_game

JWT_SECRET=TestGachaGame

PORT=5002
NODE_ENV=development
```
### Cara Menjalankan Backend
```bash
cd backend
npm run dev
```
## Setup Frontend (Next.js)
```bash
cd gachagames
npm install
npm run dev
```
## Dokumentasi API
```json
Response format Login
{
    "result": true,
    "message": "Logged in",
    "username": "xxxx",
    "users": {
        "user": "xxxx",
        "email": "xxxx@xxxx.com",
        "coins": 0,
        "role": "xxxx",
        "rarity": "xxxx",
        "drop_rate": "xxxx"
    }
}
```
sisanya semua response umum (sukses)
```json
{
    "result": true,
    "message": "Fetching data successfully",
    "data": []
}
```
**Format response umum (error):**
 
```json
{
  "error": "string",
  "detail": "string (opsional, hanya muncul pada error 500)"
}
```


**Header**
Secara Keseluruhan untuk Header Wajib Menggunakan Format Dibawah Ini, kecuali login, dan register
| Key              |  Value            |
|------------------|-------------------|
| X-Access-Sha     | [SHA256 String]   |
| Authorization    | Bearer `<token>`  |
| Content-Type     | application/json  |

**Format response umum (sukses):**
 
```json
{
  "result": true,
  "message": "string",
  "data": {}
}
```
 
**Format response umum (error):**
 
```json
{
  "error": "string",
  "detail": "string (opsional, hanya muncul pada error 500)"
}
```

## 1. `POST /authencation/login`
 Melakukan Login Masuk ke sistem 
 **Request Body**
 ```json
    {
        "username":"xxxx",
        "password":"xxxx"
    }
```

## 2. `POST /authencation/register`
 Melakukan Register Ke sistem 
 **Request Body**
 ```json
    {
        "email":"xxxxx",
        "password":"xxxxx",
        "username":"xxxxx"
    }
```

## 3. `POST /authencation/logout`
 Melakukan Logout Ke sistem 



Base URL: `http://localhost:<PORT>`
 
Semua endpoint di bawah ini dilindungi middleware `core.protect(resource)`, artinya request **wajib menyertakan token/session valid** dengan permission sesuai resource (`events`, `items`, atau `gacha`).

## Daftar Endpoint Event
 
| Method        | Endpoint          | Deskripsi                     | Protect        |
|---------------|-------------------|-------------------------------|----------------|
| POST          | `/Events`         | Membuat event baru            | `events`       |
| GET           | `/Events`         | Mengambil semua event         | `events`       |
| PATCH         | `/Events`         | Mengubah status aktif event   | `events`       |
| PATCH         | `/Events/:id`     | Update data event             | `events`       |
| POST          | `/Items`          | Menambah item gacha           | `items`        |
| GET           | `/Items`          | Mengambil semua item gacha    | `items`        |
| PATCH         | `/items`          | Update item gacha             | `items`        |
| POST          | `/items/gacha`    | Melakukan roll gacha          | `gacha`        |
| DELETE        | `/items/:id`      | Menghapus item gacha          | `items`        |
 
---
## 1. `POST /Events`
 
Membuat event baru beserta gambar-gambarnya (disimpan dalam format `.webp`).
 
### Request Body
 
```json
{
  "event_name": "Summer Festival",
  "description": "Event musim panas dengan hadiah spesial",
  "start_date": "2026-07-01",
  "end_date": "2026-07-31",
  "images": "[\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...\", \"data:image/png;base64,...\"]"
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| event_name | string | Ya | Nama event, dipakai juga untuk nama file gambar (di-sanitize) |
| description | string | Ya | Deskripsi event |
| start_date | string (date) | Ya | Tanggal mulai |
| end_date | string (date) | Ya | Tanggal selesai |
| images | string (JSON array of base64) | Tidak | Array gambar dalam bentuk **string JSON**, tiap elemen adalah base64 image. Akan dikonversi ke `.webp` dan disimpan di server |
 
> ⚠️ `images` harus dikirim sebagai **string hasil `JSON.stringify(array)`**, bukan array asli, karena controller melakukan `JSON.parse(images)`.
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Insert Data successfully",
  "data": {
    "id": 12,
    "event_name": "Summer Festival",
    "description": "Event musim panas dengan hadiah spesial",
    "start_date": "2026-07-01",
    "end_date": "2026-07-31",
    "images": "[\"summer-festival-0.webp\",\"summer-festival-1.webp\"]"
  }
}
```
 
### Response Error
 
**400 — payload images tidak valid**
```json
{ "error": "Invalid images payload" }
```
 
**500 — server error**
```json
{ "error": "Something wrong", "detail": "pesan error internal" }
```
 
---
 
## 2. `GET /Events`
 
Mengambil seluruh daftar event beserta rekap drop rate item per rarity.
 
### Request
 
Tidak ada body atau query parameter.
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Fetching data successfully",
  "data": [
    {
      "id": 12,
      "event_name": "Summer Festival",
      "description": "Event musim panas dengan hadiah spesial",
      "start": "01 Jul 2026",
      "end": "31 Jul 2026",
      "images": "[\"summer-festival-0.webp\"]",
      "active": true,
      "drop_rate": 1,
      "legendaris": 0.05,
      "langka": 0.25,
      "biasa": 0.70
    }
  ]
}
```
 
| Field | Keterangan |
|---|---|
| start / end | Tanggal sudah diformat (`DD Mon YYYY`) |
| drop_rate | Total drop rate semua item pada event tersebut |
| legendaris / langka / biasa | Total drop rate per kategori rarity |
 
---
 
## 3. `PATCH /Events`
 
Mengubah status aktif suatu event. **Hanya boleh ada 1 event aktif** — jika `active: true` dikirim, seluruh event lain otomatis di-nonaktifkan (dilakukan dalam 1 transaksi database).
 
### Request Body
 
```json
{
  "id": 12,
  "active": true
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | number | Ya | ID event yang ingin diubah statusnya |
| active | boolean | Ya | `true` untuk mengaktifkan (akan menonaktifkan event lain), `false` untuk menonaktifkan |
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Fetching data successfully",
  "data": [
    { "id": 12, "event_name": "Summer Festival", "active": true, "...": "..." }
  ]
}
```
 
### Response Error (500)
 
```json
{ "error": "Something wrong", "detail": "pesan error internal" }
```
 
---
 
## 4. `PATCH /Events/:id`
 
Update data event, termasuk penggantian gambar. Mendukung mempertahankan gambar lama sambil menambah gambar baru.
 
### Path Parameter
 
| Parameter | Tipe | Keterangan |
|---|---|---|
| id | number | ID event yang diupdate |
 
### Request Body
 
```json
{
  "event_name": "Summer Festival Extended",
  "description": "Diperpanjang hingga Agustus",
  "start_date": "2026-07-01",
  "end_date": "2026-08-15",
  "images": "[\"data:image/png;base64,iVBORw0KGgoAAAANS...\"]",
  "existing_images": "[\"summer-festival-0.webp\"]"
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| event_name | string | Ya | Nama event |
| description | string | Ya | Deskripsi |
| start_date | string | Ya | Tanggal mulai |
| end_date | string | Ya | Tanggal selesai |
| images | string (JSON array base64) | Tidak | Gambar **baru** yang diupload (base64), akan disimpan sebagai file baru |
| existing_images | string (JSON array filename) | Tidak | Gambar lama yang ingin **dipertahankan** (nama file, bukan base64) |
 
> Hasil akhir `images` di database = `existing_images` (yang dipertahankan) + gambar baru yang berhasil diupload.
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Update Data successfully",
  "data": { "id": 12, "event_name": "Summer Festival Extended", "...": "..." }
}
```
 
### Response Error
 
**400**
```json
{ "error": "Invalid images payload" }
```
atau
```json
{ "error": "Invalid existing_images payload" }
```
 
**500**
```json
{ "error": "Something wrong", "detail": "pesan error internal" }
```
 
---
 
## 5. `POST /Items`
 
Menambahkan item gacha baru ke dalam sebuah event.
 
### Request Body
 
```json
{
  "event_id": 12,
  "item_name": "Pedang Naga",
  "rarity": "Legendaris",
  "drop_rate": 0.05,
  "images": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "description": "Senjata legendaris dengan efek api"
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| event_id | number | Ya | ID event tempat item ini berada |
| item_name | string | Ya | Nama item |
| rarity | string | Ya | Contoh: `Legendaris`, `Langka`, `Biasa` |
| drop_rate | number | Ya | Peluang drop item (misal `0.05` = 5%) |
| images | string (base64, **bukan array**) | Ya | Satu gambar item dalam base64. Wajib diisi |
| description | string | Ya | Deskripsi item |
 
> Berbeda dengan endpoint Events, `images` di sini adalah **satu string base64 langsung**, bukan array JSON.
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Insert Data successfully",
  "data": {
    "id": 5,
    "event_id": 12,
    "item_name": "Pedang Naga",
    "rarity": "Legendaris",
    "drop_rate": 0.05,
    "images": "pedang-naga-1.webp",
    "description": "Senjata legendaris dengan efek api"
  }
}
```
 
### Response Error
 
**400 — gambar tidak dikirim**
```json
{ "error": "Invalid images payload" }
```
 
**500**
```json
{ "error": "Something wrong", "detail": "pesan error internal" }
```
 
---
 
## 6. `GET /items`
 
Mengambil seluruh item gacha beserta nama event terkait.
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Fetching data successfully",
  "data": [
    {
      "id": 5,
      "event_id": 12,
      "event_name": "Summer Festival",
      "item_name": "Pedang Naga",
      "rarity": "Legendaris",
      "drop_rate": 0.05,
      "images": "pedang-naga-1.webp",
      "description": "Senjata legendaris dengan efek api"
    }
  ]
}
```
 
---
 
## 7. `PATCH /items`
 
Mengupdate item gacha. Gambar bersifat opsional — jika tidak dikirim, gambar lama tetap dipakai.
 
### Request Body
 
```json
{
  "id": 5,
  "event_id": 12,
  "item_name": "Pedang Naga+",
  "rarity": "Legendaris",
  "drop_rate": 0.07,
  "images": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "description": "Versi upgrade dari Pedang Naga"
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | number | Ya | ID item yang diupdate |
| event_id | number | Ya | ID event terkait |
| item_name | string | Ya | Nama item |
| rarity | string | Ya | Rarity item |
| drop_rate | number | Ya | Peluang drop |
| images | string (base64) | Tidak | Jika dikirim, gambar lama akan diganti dengan yang baru |
| description | string | Ya | Deskripsi item |
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Update Data successfully",
  "data": { "id": 5, "item_name": "Pedang Naga+", "...": "..." }
}
```
 
### Response Error
 
**400 — id tidak dikirim**
```json
{ "error": "id is required" }
```
 
**500**
```json
{ "error": "Something wrong", "detail": "pesan error internal" }
```
 
---
 
## 8. `POST /items/gacha`
 
Melakukan roll gacha untuk user. Endpoint ini memotong koin user, memilih item secara acak berbobot (weighted random) berdasarkan `drop_rate`, mencatat riwayat, dan mengupdate inventory user secara atomik (transaksi database + row lock + advisory lock anti race-condition). Endpoint ini juga dibatasi oleh rate limiter (`gachaRollLimiter`).
 
> ⚠️ **Catatan keamanan:** saat ini `username` diambil langsung dari `req.body`. Idealnya diambil dari token/session yang sudah terverifikasi (`req.user.username`), bukan dari body request, agar user tidak bisa melakukan roll atas nama user lain.
 
### Request Body
 
```json
{
  "username": "zenox21",
  "times": 10
}
```
 
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| username | string | Ya | Username user yang melakukan roll |
| times | number | Ya | Jumlah roll, harus bilangan bulat positif, maksimal **10 per request** |
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Roll Successfully",
  "data": {
    "rolls": [
      {
        "event_name": "Summer Festival",
        "item_name": "Pedang Naga",
        "rarity": "Legendaris",
        "drop_rate": 0.05,
        "images": "pedang-naga-1.webp",
        "description": "Senjata legendaris dengan efek api"
      },
      {
        "event_name": "Summer Festival",
        "item_name": "Perisai Kayu",
        "rarity": "Biasa",
        "drop_rate": 0.70,
        "images": "perisai-kayu-1.webp",
        "description": "Perisai dasar"
      }
    ],
    "total_cost": 100,
    "remaining_coins": 50
  }
}
```
 
| Field | Keterangan |
|---|---|
| rolls | Daftar item yang didapat dari hasil roll (sejumlah `times`) |
| total_cost | Total koin yang terpakai (`10 coin × times`) |
| remaining_coins | Sisa koin user setelah roll |
 
Selain response HTTP, hasil roll juga dikirim lewat **WebSocket** ke room `user:<username>` dengan event name `gacha_result`:
 
```json
{
  "remaining_coins": 50,
  "rolls": [ /* sama seperti di atas */ ]
}
```
 
### Response Error
 
| Status | Kondisi | Body |
|---|---|---|
| 401 | `username` tidak dikirim / tidak terautentikasi | `{ "error": "Unauthorized" }` |
| 400 | `times` bukan bilangan bulat positif | `{ "error": "times must be a positive integer" }` |
| 400 | `times` melebihi batas maksimal (10) | `{ "error": "times cannot exceed 10 per request" }` |
| 402 | Koin user tidak mencukupi | `{ "error": "Coin not enough for draw" }` |
| 404 | User tidak ditemukan | `{ "error": "User not found" }` |
| 404 | Tidak ada event aktif / item untuk di-roll | `{ "error": "No active items available to roll" }` |
| 500 | Error server lainnya | `{ "error": "Something wrong", "detail": "..." }` |
 
---
 
## 9. `DELETE /items/:id`
 
Menghapus item gacha berdasarkan ID.
 
### Path Parameter
 
| Parameter | Tipe | Keterangan |
|---|---|---|
| id | number | ID item yang ingin dihapus |
 
### Response Sukses (200)
 
```json
{
  "result": true,
  "message": "Fetching data successfully",
  "data": {
    "id": 5,
    "item_name": "Pedang Naga",
    "rarity": "Legendaris",
    "drop_rate": 0.05,
    "images": "pedang-naga-1.webp",
    "description": "Senjata legendaris dengan efek api"
  }
}
```

## 10 `GET /inventory`
 
Mengambil seluruh data inventory user yang login
 
### Response Sukses (200)
 
```json
{
    "result": true,
    "message": "Fetching data successfully",
    "data": [
        {
            "username": "zenox21",
            "item_name": "Astral Wing Set",
            "rarity": "Langka",
            "drop_rate": "4.97",
            "qty": 15,
            "images": "astral-wing-set-1-1783924525535.webp"
        },
        {
            "username": "zenox21",
            "item_name": "Iron Clad Guard",
            "rarity": "Biasa",
            "drop_rate": "40.00",
            "qty": 82,
            "images": "iron-clad-guard-1-1783924738224.webp"
        }
    ]
}
```
 
## 11 `GET /history`
 
Mengambil seluruh data history gacha berdasarkan usersname
 
### Response Sukses (200)
 
```json
{
    "result": true,
    "message": "Fetching data successfully",
    "data": [
        {
            "username": "zenox21",
            "event_name": "Hallowen",
            "gacha_date": "13 Jul 2026 03:54:21",
            "total_rolls": 1,
            "result_gacha": "[{\"images\": \"iron-clad-guard-1-1783924738224.webp\", \"rarity\": \"Biasa\", \"item_id\": \"17\", \"drop_rate\": \"40.00\", \"item_name\": \"Iron Clad Guard\", \"description\": \"Addition Deffence 5+\"}]"
        },
        {
            "username": "zenox21",
            "event_name": "Hallowen",
            "gacha_date": "13 Jul 2026 02:29:11",
            "total_rolls": 1,
            "result_gacha": "[{\"images\": \"iron-clad-guard-1-1783924738224.webp\", \"rarity\": \"Biasa\", \"item_id\": \"17\", \"drop_rate\": \"40.00\", \"item_name\": \"Iron Clad Guard\", \"description\": \"Addition Deffence 5+\"}]"
        },
        {
            "username": "zenox21",
            "event_name": "Hallowen",
            "gacha_date": "13 Jul 2026 02:28:19",
            "total_rolls": 1,
            "result_gacha": "[{\"images\": \"iron-clad-guard-1-1783924738224.webp\", \"rarity\": \"Biasa\", \"item_id\": \"17\", \"drop_rate\": \"40.00\", \"item_name\": \"Iron Clad Guard\", \"description\": \"Addition Deffence 5+\"}]"
        },
    ]
}
```

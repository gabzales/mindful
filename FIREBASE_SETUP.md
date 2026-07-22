# Firebase Setup Guide

## 1. Buat Project Firebase

1. Buka https://console.firebase.google.com
2. Klik **Create a project** (atau pilih existing)
3. Masukkan nama project (misal: `eap-portal`)
4. Matikan **Google Analytics** (opsional)
5. Klik **Create project**

## 2. Enable Authentication

1. Di sidebar kiri, klik **Authentication** → **Get started**
2. Tab **Sign-in method** → klik **Email/Password**
3. Klik enable → **Save**
4. Klik **Google**
5. Pilih project support email → **Save**

## 3. Dapatkan Konfigurasi Firebase

1. Di dashboard utama, klik ikon **Settings** (gear) → **Project settings**
2. Scroll ke **Your apps** → klik **Web** (ikon `</>`)
3. Register app (nama bebas, misal `eap-portal-web`)
4. Copy 6 nilai dari `firebaseConfig`:

```js
apiKey: "AIzaSyA...",
authDomain: "eap-portal-xxxxx.firebaseapp.com",
projectId: "eap-portal-xxxxx",
storageBucket: "eap-portal-xxxxx.appspot.com",
messagingSenderId: "123456789",
appId: "1:123456789:web:abc123def456"
```

## 4. Set Env Vars di Vercel

1. Buka https://vercel.com → project kamu
2. **Settings** → **Environment Variables**
3. Tambah 6 variable:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyA...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `eap-portal-xxxxx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `eap-portal-xxxxx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `eap-portal-xxxxx.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abc123def456` |

4. Centang **Production** + **Preview** + **Development**
5. Klik **Save**

## 5. Set Email Verification Template

1. Firebase Console → **Authentication** → **Templates**
2. Tab **Email verification** → klik **Edit**
3. Di field **Custom action URL**:
   ```
   https://domain-vercel-kamu.vercel.app/verify
   ```
4. Klik **Save**

## 6. Tambah Authorized Domain

1. Firebase Console → **Authentication** → **Settings**
2. Tab **Authorized domains** → klik **Add domain**
3. Tambah:
   - `domain-vercel-kamu.vercel.app`
   - `domain-vercel-kamu.vercel.app` (preview)

## 7. Deploy Ulang

1. Push ulang ke GitHub → Vercel auto redeploy
2. Atau di Vercel dashboard → **Deployments** → **Redeploy**

## 8. Buat Aturan Firestore (untuk users collection)

1. Firebase Console → **Firestore Database** → **Create database**
2. Pilih **Start in test mode** (untuk development)
3. Pilih region (sesuai Vercel)
4. Klik **Enable**

## Selesai

Setelah semua step di atas:
- Google Sign-In ✅
- Email/Password Register + Verifikasi ✅
- Halaman verify custom ✅
- Landing page, dashboard, dll ✅

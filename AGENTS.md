# AGENTS.md — EAP Portal

## Project

Ruang Kerja — Employee Wellbeing Portal (demo prototype). Indonesian-language UI (`lang="id"`).
Stack: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Firebase Auth + Firestore.

**Auth**: Google Sign-In + email/password + email verification via Firebase.
**Database**: Firestore (users collection, auto-create on sign-up).
**Demo fallback**: `lib/data.ts` for mock data (dashboard/HR/admin/admedika views).

## Roles & Access Control

6 roles defined in `lib/roles.ts`:

| Role | Route | Guard |
|---|---|---|
| `super_admin` | `/super-admin` | `RoleGuard` — super_admin only |
| `mi_admin` | `/admin` | `RoleGuard` — mi_admin + super_admin |
| `hr_client` | `/hr` | `RoleGuard` — hr_client + mi_admin + super_admin |
| `employee` | `/dashboard` | Auth guard + role check in layout |
| `psychologist` | `/psychologist` | `RoleGuard` — psychologist + mi_admin + super_admin |
| `admedika` | `/admedika` | `RoleGuard` — admedika + super_admin |

All admin/role pages support `demo` mode: if no Firebase user, mock data renders without auth.

## Firestore Collections

```
users/{uid}
  ├ uid, email, name, department, jobLevel, gender, age, company
  ├ role: "super_admin" | "mi_admin" | "hr_client" | "employee" | "psychologist" | "admedika"
  ├ emailVerified: boolean
  └ createdAt: timestamp
```

Role assignment: set `role` field manually in Firebase Console → Firestore → users/{uid}. Default on registration is `"employee"`.

## Env Variables (Vercel)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Firebase Console Setup

1. Authentication → Sign-in methods → Enable **Google** + **Email/Password**
2. Authentication → Templates → Email verification → set redirect URL to `https://domain/verify`
3. Authentication → Settings → Authorized domains → add Vercel domain

## Commands

```sh
npm install
npm run dev         # localhost:3000
npm run build       # production build
npm run lint        # eslint
```

## Structure

```
app/
  login/                  # Login with Google
  register/               # Email/password registration
  verify/                 # Email verification handler (oobCode from Firebase)
  dashboard/              # Employee portal (requires auth)
  hr/                     # HR aggregate dashboard (mock)
  admin/                  # MI Admin dashboard (mock)
  admedika/              # AdMedika partner dashboard (mock)
components/
  FirebaseProvider.tsx    # Auth context provider + config error guard
  Sidebar.tsx             # Responsive sidebar with hamburger mobile menu
  WaveGauge.tsx           # Animated wave chart + PulseHero SVG
  Skeleton.tsx            # Skeleton loading components
lib/
  firebase/
    config.ts             # Firebase init + env var validation
    auth.ts               # Auth hooks + signIn/signOut functions
  data.ts                 # Mock data layer (used by dashboard, HR, admin, admedika)
```

## Key Conventions

- Path alias: `@/*` → project root
- Mock data in `lib/data.ts`. Single mock user: `currentUser` (Andi Pratama, Finance).
- Dimensions: stress, burnout, emotional, sleep, worklife, resilience. Levels: Low/Medium/High.

## Gotchas

- FirebaseProvider wraps root layout. If env vars are missing, shows config error page.
- Dashboard layout is "use client" — uses `useAuthContext()` for auth guard.
- `next.config.ts` is empty (no custom config needed for Vercel).
- No `.env.local` — set vars in Vercel dashboard.

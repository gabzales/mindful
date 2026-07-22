# Ruang Kerja — EAP Employee Wellbeing Portal (Demo)

Prototype for the Employee Assistance Program platform described in the PRD
(`dig.docx`), styled after the calm, wellbeing-focused tone of satupersen.net.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Drizzle ORM, wired for Neon Postgres (`lib/db/schema.ts`)
- lucide-react icons

## Current state
The UI is fully clickable and reads from **mock data** in `lib/data.ts` so it
runs standalone with no database. This is intentional for a fast, deployable
demo — every flow (login, register, assessment scoring, counseling booking,
webinar registration, HR/MI/AdMedika dashboards) works end to end on mock data.

`lib/db/schema.ts` already defines the real Postgres schema matching the PRD
(companies, users, assessments, counseling_sessions, webinars, learning
content, etc). To move off mock data:

1. Create a Neon project at neon.tech, copy the connection string.
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
3. `npx drizzle-kit push` to create the tables.
4. Swap the mock functions in `lib/data.ts` for queries against `lib/db/index.ts`
   (`db.select().from(schema.users)...`) page by page.

## Routes
| Route | Role |
|---|---|
| `/` | Landing page |
| `/login`, `/register` | Auth (OTP → password → biodata flow per PRD) |
| `/dashboard` | Employee home |
| `/dashboard/assessment` → `/dashboard/assessment/[slug]` | Assessment + auto-scoring + recommendation |
| `/dashboard/counseling` | Psychologist booking flow |
| `/dashboard/webinar` | Webinar registration |
| `/dashboard/learning` | Learning Center |
| `/hr` | HR aggregate dashboard |
| `/admin` | MI Admin dashboard |
| `/admedika` | AdMedika partner dashboard |

## Run locally
```bash
npm install
npm run dev
```

## Deploy
Push to GitHub and import into Vercel. Add `DATABASE_URL` in Vercel's env
settings once you're ready to connect Neon — the mock data works fine without
it for demoing.

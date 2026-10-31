# Primeresearch Management System

A private, cloud-based system for **Primeresearch Consultants** to run and track its corporate and academic research work. Use it to record assignments, track progress, measure performance, report, and keep an attendance record, with an administrator dashboard and office-only sign-in for employees.

*Every decision deserves evidence.* This app uses the same brand colours, fonts and logo as the Primeresearch website.

## Contents

1. [What it does](#1-what-it-does)
2. [Set up Firebase](#2-set-up-firebase)
3. [Put it online (Firebase App Hosting)](#3-put-it-online-firebase-app-hosting)
4. [First day: create your account, your staff and the office computers](#4-first-day-accounts-and-office-computers)
5. [How office-only sign-in works](#5-how-office-only-sign-in-works)
6. [Everyday use](#6-everyday-use)
7. [Run it on your own computer (with test data)](#7-run-it-on-your-own-computer)
8. [Security, privacy and limits](#8-security-privacy-and-limits)
9. [Settings reference](#9-settings-reference)
10. [For developers](#10-for-developers)

---

## 1. What it does

**Two kinds of account**

| | Administrator (you) | Employee |
| --- | --- | --- |
| Sign in from | Anywhere | Only from the office (see section 5) |
| Assignments | Create, edit, assign, approve, rate, set fees and payments, delete | See and work on their own: start, update progress, tick milestones, comment, upload files, submit for review |
| Time and reports | See everyone's, review and rate work reports | Log their own hours, submit daily, weekly or monthly reports |
| Performance | Scorecards and comparison for the whole team | Their own scorecard |
| Attendance | Register for the whole team | Their own record |
| Clients, team, reports and analytics, office access, settings | Full control | No access |

**Features**

- **Dashboard.** For the administrator: key figures with trends (active, due soon, overdue, completed, on-time delivery, hours, revenue, unpaid fees), delivery and workload charts, work by category, team hours, a card per employee with their performance score and today's attendance, the review queue, upcoming deadlines, security alerts, announcements and recent activity. Employees get their own version: their work, deadlines, hours against target, score, feedback and reminders.
- **Assignments.** Every piece of work has a reference (for example `PR-2026-0042`) and is categorised by **track** (corporate research or academic research), **service category** (seeded from the Primeresearch service lines, such as market research, monitoring and evaluation, statistical analysis, or proposal and ethics support), academic level, client, priority and tags. It also holds milestones, a progress meter, a full activity timeline, comments, files stored in Firebase Storage, logged hours, fees and payment status. Each assignment moves through a clear workflow: *Not started, In progress, Under review, Needs revision, On hold, Completed, Cancelled*. View assignments as a filterable table or a board.
- **Progress tracking.** Progress follows milestones automatically. Employees post progress notes. Every change is recorded with who and when.
- **Review and quality.** Employees submit work for review. The administrator approves it with a 1 to 5 quality rating or sends it back with notes.
- **Timesheet.** Employees log hours by day against their assignments, with weekly totals measured against their target.
- **Work reports.** Daily, weekly or monthly reports (summary, accomplishments, challenges, next steps). The administrator replies with feedback and a rating.
- **Performance.** A score from 0 to 100 for each employee over any period. It combines on-time delivery (35%), quality ratings (30%), output against their monthly target (20%) and work-report coverage (15%). Any part with no data yet is left out and the rest are re-weighted.
- **Attendance.** Recorded automatically when employees sign in at the office and while they work: first sign-in, last seen, sign-out, computer used.
- **Reports and analytics.** A printable management report for any period (also saves as PDF), plus CSV exports of assignments, time, reports, attendance and performance.
- **Clients.** Records of corporate and academic clients with their assignments, fees and balances.
- **Team.** You create every login and set every password. Each employee has a full profile: job title, staff number, contact details, qualifications, specialisations, emergency contact and targets. You can also reset passwords, suspend accounts and sign people out.
- **Notifications and calendar.** In-app notifications (new assignment, review decisions, comments, feedback, new computer requests) and a deadline calendar.
- **Audit trail.** Every important action is logged with who did it and when.

## 2. Set up Firebase

Everything is stored in your own Firebase project. You need a Google account.

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Create a project**. Name it, for example, `primeresearch-pms`. Google Analytics is not needed.
2. **Upgrade to the Blaze plan** (bottom left, *Upgrade*). File storage and App Hosting require it. A team of three stays well inside the free monthly allowances, but set a budget alert (for example USD 5) under *Usage and billing* for peace of mind.
3. **Authentication:** *Build > Authentication > Get started > Sign-in method > Email/Password > Enable*. Leave *Email link* off. If your project shows *Settings > User actions*, untick **Enable create (sign-up)**. Either way, only accounts you create on the Team page have a staff profile, and any other login is refused.
4. **Firestore:** *Build > Firestore Database > Create database*. Choose **production mode** and the location **`africa-south1` (Johannesburg)**, which is the closest to Lusaka. The location cannot be changed later.
5. **Storage:** *Build > Storage > Get started*, production mode, same location.
6. **Web app and API key:** *Project settings (gear icon) > General > Your apps > Add app > Web*. Name it `PMS`. You only need the **apiKey** value shown in the config.
7. **Security rules:** the rules in this folder deny all direct browser access, because the app reads and writes only from its server. Publish them from a terminal in this folder:

   ```bash
   npx firebase-tools login
   npx firebase-tools use --add          # choose your project
   npx firebase-tools deploy --only firestore,storage
   ```

## 3. Put it online (Firebase App Hosting)

App Hosting builds and runs the app straight from GitHub, so the system is always online and updates when you push changes.

1. Generate two random secrets and store them in your project (a terminal in this folder):

   ```bash
   npx firebase-tools apphosting:secrets:set session-secret
   # paste a random value of 32+ characters, e.g. from:
   # node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

   npx firebase-tools apphosting:secrets:set setup-key
   # any 12+ character phrase you will type once at /setup
   ```

   When asked, allow App Hosting to access the secrets.
2. In the Firebase console open **Build > App Hosting > Get started**:
   - connect your GitHub account and choose the repository that contains this folder;
   - set the **root directory** to `management-system`;
   - choose the live branch (for example `main`) and turn on automatic rollouts;
   - pick the same region as Firestore if offered, then **Finish and deploy**.
3. App Hosting gives you an address such as `https://pms--primeresearch-pms.us-central1.hosted.app`. You can connect your own domain later (for example `pms.primeresearch.co.zm`) under *App Hosting > Settings > Domains*.

App Hosting provides the Firebase project details automatically. The `apphosting.yaml` file in this folder lists the secrets the app reads.

> **Other hosting.** Any Node.js 22 host works, for example Vercel (set the root directory to `management-system`) or a VPS. Outside Google Cloud, add the variables from `.env.example`, including `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_STORAGE_BUCKET` and a service account in `FIREBASE_SERVICE_ACCOUNT` (Project settings > Service accounts > Generate new private key). On Vercel keep `CLIENT_IP_SOURCE=auto`.

## 4. First day: accounts and office computers

1. **Create your administrator account.** Open `https://<your address>/setup`, enter the setup key from step 3.1, your name, email and a strong password. This page only works while no administrator exists. (Developers can use `npm run create-admin -- --email you@example.com --name "Your Name"` instead.)
2. **Add your two employees.** Sign in, open **Team > Add employee**, and enter each person's name, email, a starting password (the *Generate* button makes a strong one), job title, staff number and other details. Give each person their email and password.
3. **Choose how office computers are recognised** under **Office access**:
   - *Lock each employee to the computer they first sign in on* (default). Sit with each employee at their office computer and sign in with their details once. From then on, that account only works on that computer. If you sign in for them, enter the details yourself on the office computer.
   - *Only computers the administrator has approved.* On each office computer, sign in as the administrator, open **Office access** and click **Register this computer** (for example "Office PC 1", optionally limited to one employee). If an employee tries another computer, you get a notification to approve or block it.
4. **Lock it to the office network (recommended).** While at the office, open **Office access**. The page shows the *detected address of this computer*. Click **Add this address**, switch on **Office network** and save. Employees can then only sign in, and stay signed in, while connected to the office internet.
5. **Test it.** On a phone using mobile data, try an employee login. It should be refused with "You can only sign in from the Primeresearch office network."

Optional extra checks on the same page: **office hours** (for example Monday to Friday, 07:30 to 18:00) and **office location** (the browser shares its location at sign-in). Use location only if your office computers report an accurate position; desktop computers often do not.

## 5. How office-only sign-in works

When an employee signs in, the system checks, in order:

1. **Password**, checked by Firebase Authentication.
2. **Account status.** Suspended accounts are refused.
3. **Office network** (if on). The visitor's internet address must match one you listed.
4. **Office hours** (if on).
5. **Office location** (if on). The browser must share a position inside the office radius.
6. **Computer** (if on). Every browser gets a private, signed computer ID the first time it opens the system. The ID must belong to an approved office computer that this employee may use. The system records the computer's details (browser, operating system, screen, time zone, last address and last user), which you see under **Office access > Computers**.

The network, hours and computer checks run again **on every page** the employee opens, not just at sign-in. Leaving the office network, or copying the session to another computer, ends the session. Every attempt, successful or refused, is listed with its reason under **Office access > Sign-in attempts**, and refused computers raise a notification.

The administrator account is never restricted, so you can manage the system from anywhere.

**If something changes**

- *New or replaced office computer, or a browser that was reset:* in *Team > (employee) > Security* click **Unlock computer binding** (first-sign-in mode), or approve the new computer under *Office access* (registered mode).
- *The office internet address changes* (some providers change it occasionally): employees will be refused with the network message. At the office, open *Office access* and add the new detected address.
- *Someone leaves:* suspend their account (they are signed out at once). If you later delete it, their name stays on past work, time and reports, and they are taken off any open assignments (you are told if one is left with nobody assigned). A suspended or deleted login is answered like a wrong password, so nobody can use the sign-in page to find out which accounts exist.
- *Computer blocked by mistake:* unblock it under *Office access > Computers*. Blocking never frees an employee's computer slot; use **Unlock computer binding** for that.

## 6. Everyday use

**Employees**: sign in at the office; the dashboard shows what is due. Open an assignment to start work, update progress, tick milestones, upload drafts and deliverables, and **Submit for review** when done. Log hours in **Timesheet** daily and send a **Work report** at the end of each week.

**Administrator**: create assignments (choose the track and category, assign people, set the due date, fee and milestones), keep an eye on the dashboard, approve or return work under review with a quality rating, give feedback on work reports, and use **Reports and analytics** for the monthly management report (print or save as PDF, or export CSV).

## 7. Run it on your own computer

You need Node.js 22 and Java 21 (for the Firebase emulators).

```bash
cd management-system
npm install
npm run emulators            # terminal 1: local Firebase (Auth, Firestore, Storage)
npm run seed:demo            # terminal 2: demo staff, clients, assignments, hours, reports
npm run dev:emulators        # terminal 2: the app at http://localhost:3000
```

Demo logins (password `Prime2026!demo`): `admin@primeresearch.test`, `chanda@primeresearch.test`, `mutale@primeresearch.test`. The emulator dashboard is at http://localhost:4000. The seed script refuses to run against a real project.

To use your real Firebase project locally instead, copy `.env.example` to `.env.local`, fill it in, and run `npm run dev`.

## 8. Security, privacy and limits

- All reads and writes go through the app's server, using the Firebase Admin SDK, after the session and office checks. Firestore and Storage rules deny all direct browser access.
- Passwords are handled only by Firebase Authentication. Sessions are server records, so you can end them (on suspension, password reset or from Office access). Session cookies are signed, `HttpOnly`, and expire after the configured hours.
- Sign-in attempts are rate limited per email and address, so someone elsewhere cannot lock your account out. Every action is written to the audit log.
- Completed and cancelled work is read-only for employees (no file changes or time entries) until you reopen it, and files cannot be swapped while work is under review.
- Files are only served to the administrator and the people assigned to that assignment.
- **Limits, plainly stated.** The computer check relies on a signed browser cookie. A determined person with access to an office computer could copy its browser profile to another machine. The office network check stops that copy working outside the office. Turn on both checks for the strongest protection. The network check depends on the hosting platform reporting the visitor's real address: confirm under *Office access* that the detected address matches your office's public address (search "what is my IP" on an office computer). Location checks depend on the browser and can be imprecise on desktops.
- Personal data stays in your own Firebase project. Handle it in line with Zambia's Data Protection Act No. 3 of 2021 (for example: tell staff what is recorded, including attendance, and keep it only as long as needed).

## 9. Settings reference

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Required in production. Random, 32+ characters. Signs session and computer cookies. Changing it signs everyone out and resets every computer ID. |
| `SETUP_KEY` | 12+ characters. Needed only to create the first administrator at `/setup`. |
| `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_STORAGE_BUCKET` | Firebase project details. Automatic on App Hosting. |
| `FIREBASE_SERVICE_ACCOUNT` | Service account JSON (or base64 of it). Only needed outside Google Cloud. |
| `CLIENT_IP_SOURCE` | How to read the visitor's address. `auto` (default) uses the address that Firebase App Hosting or Vercel reports. Behind your own reverse proxy (nginx, Caddy) that appends the visitor's address, use `x-forwarded-for:1`. Behind Cloudflare, use `cf-connecting-ip`. Never point it at a header visitors can set themselves. When the address cannot be read it shows as "unknown" and the office network rule refuses everyone. |

## 10. For developers

Next.js 16 (App Router, server actions, `proxy.ts`), React 19, TypeScript, Tailwind CSS 4, Firebase Admin SDK, zod.

```bash
npm run verify       # dash check, lint, typecheck, unit tests
npm run build        # production build
npm run test:e2e     # browser tests against the emulators (starts them, seeds, builds and serves on port 3100)
```

```
src/
  app/
    login/, setup/           Sign-in and first-run setup (public)
    (app)/                   Signed-in pages: dashboard, assignments, calendar, timesheet, work-reports,
                             performance, attendance, reports, clients, team, profile, notifications, settings
    api/                     Files, avatars and CSV exports (each checks the session)
  components/                UI kit, charts, layout and feature components
  lib/
    auth/                    Sessions, sign-in, office checks on every request
    access/policy.ts         IP ranges, geofence and office hours (unit tested)
    data/                    All Firestore access, with the permission rules
    metrics.ts               Performance and dashboard figures (unit tested)
  proxy.ts                   Quick redirect to /login when there is no session cookie
firestore.rules, storage.rules, firestore.indexes.json, apphosting.yaml, firebase.json
scripts/                     Demo seed, create-admin, copy check
tests/unit, tests/e2e
```

House style matches the website: British English, sentence case, no em or en dashes (`npm run check:copy`).

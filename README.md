# Primeresearch Consultants website

The website for **Primeresearch Consultants**, a Zambian research and advisory firm. *Every decision deserves evidence.*

It is a full-stack Next.js application: a fast, accessible marketing site built on the Primeresearch brand kit, with working forms, a database, email notifications and a private admin dashboard for managing enquiries, subscribers and articles.

## What is included

**Public website**

- Home page with an animated "insight engine", services explorer, study finder, research-levels explorer, scroll-linked process timeline, interactive map of Zambia's ten provinces and a sample size calculator teaser
- Eight service pages, sectors, approach (method, quality protocol, ethics and data protection), about, training catalogue, careers and field network, contact
- Insights hub with search, topic filters, article pages with reading progress, contents list and share links
- Free sample size and margin of error calculator with shareable links and a live chart
- "Request a proposal" wizard: five steps, saves a draft on the visitor's device, pre-filled from the study finder or a service page
- Printable capability statement for procurement teams (`/capability-statement`, "Download as PDF")
- Privacy notice written around Zambia's Data Protection Act No. 3 of 2021, and terms of use
- SEO: per-page metadata, generated social images, sitemap, robots, structured data (organisation, services, articles, FAQs, breadcrumbs)

**Backend**

- Database (SQLite file by default, Turso/libSQL supported) with automatic, lock-safe migrations and seeded articles
- Form APIs for enquiries, proposals, training, field network applications and the newsletter, all validated with the same rules in the browser and on the server
- Spam protection: hidden honeypot field, minimum fill time and per-IP rate limiting
- Branded email notifications to your team and acknowledgements to visitors (when SMTP is configured)
- Health check at `/api/health`

**Admin dashboard** (`/admin`)

- Secure sign-in with a signed, expiring session cookie and login rate limiting
- Overview with key figures and charts, submissions inbox with search, filters, status workflow and internal notes, CSV export
- Newsletter subscriber management and export
- Insights editor: write in Markdown, preview exactly as published, save drafts, publish, feature or delete articles

## Run it on your computer

You need **Node.js 20.9 or newer**. If you do not have it, install the LTS version (22 is recommended) from https://nodejs.org, then open a new terminal window.

1. Unzip the project (or clone it) and open a terminal in its folder:
   - **Windows:** open the folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - **Mac:** open Terminal, type `cd ` (with a space after it), drag the folder onto the window and press Return.
2. Install the dependencies. This is needed once and takes about a minute:
   ```bash
   npm install
   ```
3. Start the website:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000 in your browser. To stop the website, press `Ctrl` + `C` in the terminal.

The admin dashboard is at http://localhost:3000/admin. Until you set your own admin details, sign in with `admin@primeresearch.local` and the password `change-me-now`. These defaults only work in development.

The database file is created automatically in `./data` on first use, with the six launch articles already published. Without email settings, form submissions are still saved and listed in the dashboard; the emails are skipped and a note is printed in the terminal.

### Full-speed preview

`npm run dev` prepares each page the first time you open it, so first visits are slow. To run the site the way it will run in production:

```bash
npm run setup     # once: creates .env.local with your own admin password
npm run preview   # builds the site, then serves it at http://localhost:3000
```

`npm run setup` prints the admin email and password it created. It never overwrites an existing `.env.local`; edit that file to change any setting (see [Environment variables](#environment-variables)). Once `.env.local` contains an admin password, use that password in development too.

### If something goes wrong

- **"npm is not recognized" or "command not found":** Node.js is not installed yet, or the terminal was opened before installing it. Install Node.js, then open a new terminal.
- **Port 3000 is busy:** `npm run dev` moves to the next free port by itself and prints the address to open. For the preview, choose a port yourself with `npm run preview -- -p 3001` and open http://localhost:3001.
- **"Admin login is not configured":** in a production build the development defaults are switched off. Run `npm run setup`, then start the site again.
- **Start again with an empty database:** stop the site and delete the `data` folder. It is recreated with the launch articles on the next start.

## Editing the content

| What | Where |
| --- | --- |
| Contact details, address, social links, PACRA and TPIN numbers | `src/config/site.ts` |
| Taglines, aim, mission and vision | `src/config/site.ts` |
| Services, sectors, method, quality and ethics content | `src/content/*.ts` |
| Training courses and careers content | `src/content/training.ts`, `src/content/careers.ts` |
| Privacy notice and terms of use | `src/content/legal.ts` |
| Insights articles | Admin dashboard, Insights section |
| Logos, favicons and fonts | `public/brand`, `src/app/icon.svg`, `src/app/fonts`, `assets/` |

House style: British English, sentence case headings, and **no em dashes or en dashes** anywhere in the copy. `npm run check:copy` checks the source and fails if a dash slips in.

### Brand rules applied

The site follows the Primeresearch brand guidelines: the supplied logo files are placed, never redrawn; Prime Navy leads, Research Blue and Slate support, Prime Gold is a single accent per layout, and Insight Teal appears only in data. The "Prime arc" (a faint ring with a gold segment, cropped by the layout edge) is the only decorative device, and content never sits on the gold. Headings use Plus Jakarta Sans and body text uses Inter, both self-hosted.

## Environment variables

See `.env.example` for a ready-to-copy template.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public address used in links, emails, the sitemap and social cards |
| `DATABASE_URL` | `file:./data/primeresearch.db` (default) or a `libsql://` Turso address |
| `DATABASE_AUTH_TOKEN` | Turso token, if you use Turso |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Dashboard sign-in. The password must be 12 or more characters in production |
| `SESSION_SECRET` | Random string of 32 or more characters used to sign admin sessions |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | Outgoing email. For Hostinger mail: `smtp.hostinger.com`, `465`, `true` |
| `MAIL_FROM` | Sender, for example `Primeresearch Consultants <info@primeresearch.co.zm>` |
| `MAIL_TO` | Inbox that receives new submission notifications |

## Deployment

The site needs a Node.js server. Choose one of these options.

### Option 1: Hostinger Node.js hosting or any VPS

1. Upload the project (or connect the Git repository) and set the environment variables above.
2. Build and start:

   ```bash
   npm ci
   npm run build
   npm start          # listens on port 3000, or $PORT
   ```

3. Make sure the `data/` folder is on persistent storage and is included in your backups.
4. Point your domain at the app and enable HTTPS.

### Option 2: Docker

```bash
docker build -t primeresearch-website .
docker run -d --name primeresearch -p 3000:3000 \
  -v primeresearch-data:/app/data \
  --env-file .env.production \
  primeresearch-website
```

The image uses Next.js standalone output, runs as a non-root user, keeps the database on the `/app/data` volume and includes a health check.

### Option 3: Vercel with Turso

Serverless platforms have no persistent disk, so use a hosted libSQL database:

1. Create a database at turso.tech and copy its URL and token.
2. Set `DATABASE_URL=libsql://...` and `DATABASE_AUTH_TOKEN=...` with the other variables.
3. Deploy. Migrations and seed articles run automatically on first use.

Note that rate limiting is held in memory per server instance, which is strongest on a single server.

## Quality checks

```bash
npm run verify       # copy check, lint, typecheck and unit tests
npm run build        # production build
npm run test:e2e     # end-to-end tests in a real browser (builds and starts the app)
```

The end-to-end suite covers every page, the forms and wizard, the calculator, the admin sign-in and workflow, and checks that no rendered page contains an em or en dash. Pages are checked on desktop, on a standard phone and on a 320px small phone, where nothing may scroll sideways. It uses Playwright: run `npx playwright install chromium` once, or set `PW_CHROMIUM_PATH` to an existing Chromium binary.

## Before launch

- [ ] Replace the placeholder email, phone number and address in `src/config/site.ts` (the brand kit's details are placeholders, including the domain)
- [ ] Add your PACRA registration, TPIN and data protection registration numbers in `src/config/site.ts`
- [ ] Register with the Office of the Data Protection Commissioner if you have not already, and ask a legal adviser to review `src/content/legal.ts`
- [ ] Set `ADMIN_EMAIL`, a strong `ADMIN_PASSWORD` and `SESSION_SECRET` on the server
- [ ] Configure SMTP so the team receives notifications, then send a test enquiry
- [ ] Add your LinkedIn and Facebook page addresses, and a WhatsApp number if you use one
- [ ] Review the course durations, typical timelines and commitments so they match how you work
- [ ] Optionally add real photographs of your team and fieldwork, following the brand photography guidance
- [ ] Submit `https://your-domain/sitemap.xml` to Google Search Console

## Project structure

```
src/
  app/
    (site)/          Public pages (shared header and footer)
    admin/           Dashboard, sign-in, server actions, CSV export
    api/             Form, newsletter and health endpoints
    capability-statement/  Printable A4 capability statement
  components/        Brand, layout, sections, forms, charts and admin UI
  config/site.ts     Contact details and site-wide settings
  content/           All website copy and structured content
  lib/               Database, validation, email, auth, statistics and helpers
  proxy.ts           Optimistic redirect for the admin area
assets/              Fonts and logo used to generate social images
public/brand/        Logo files from the brand kit
tests/               Unit and end-to-end tests
```

---

Primeresearch Consultants is registered in Zambia. Principal activity: ISIC 7320, Market research and public opinion polling.

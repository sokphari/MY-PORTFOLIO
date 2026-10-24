# Nat Sokphary — Portfolio V2 (CV edition)

Responsive, seven-section React + Vite portfolio. Modern Blue theme with light and dark modes.

## Run

```bash
npm install
npm run dev
```

## Edit the portfolio

- Edit the CV-based details in `src/data/portfolio.js`.
- Replace `public/profile.png` with a higher-resolution portrait if desired.
- Optionally place the original PDF CV in `public/` and set `cvUrl`.
- Add project repository/demo URLs when verified. No false or placeholder public links are displayed.

## Connect Supabase

The site reads one public JSON record from `public.portfolio_content` and falls back to `src/data/portfolio.js` if Supabase is not configured or the record is missing.

1. In the Supabase SQL Editor, run `supabase/migrations/20261019000000_create_portfolio_content.sql`, then run `supabase/seed.sql` to load the current portfolio content.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and publishable key from the Supabase project settings.
3. Restart the Vite dev server after changing environment variables. Edit the `content` JSON value in the Table Editor to update the site.

Only the publishable key belongs in this browser app. Do not put a database password, secret key, or service-role key in a `VITE_` variable. Public portfolio content is readable by visitors; edits are made through the Supabase dashboard.

## Portfolio admin dashboard

The admin page is at `/admin`. It uses Supabase email/password sign-in and provides separate modules for profile, contact links, skills, projects, education, and experience. Changes are saved together to the portfolio content record. Project cards can use a public image URL or an uploaded image; uploaded images are compressed in the browser and embedded in the project JSON.

1. In Supabase **Authentication → Users**, create your admin account with your email and a strong password. Keep public sign-up disabled.
2. Copy that user's UUID from the Users page. Set `VITE_SUPABASE_ADMIN_USER_ID` to the UUID in `.env.local`.
3. In the Supabase SQL Editor, run `supabase/migrations/20261019001000_restrict_portfolio_updates_to_admin.sql` after replacing both zero UUIDs in its policy with the admin user's UUID.
4. Restart the dev server, then open `/admin`, sign in with the email/password, and manage content from the sidebar modules. In Projects, paste an image URL/path or add a JPG, PNG, or WebP file, then save the portfolio changes.

The SQL policy is the actual database security boundary. The admin UUID check in the page only controls the interface; the policy also prevents other signed-in users from writing.

## Content notes

The wording is adapted from the CV screenshot provided in the conversation.
Projects in the CV: E-Commerce System and SMS System. Professional experience: Programming Instructor at ETEC Center, July 2025–Present. Degree expected 2027.

The screenshot's professional reference and their personal contact details were intentionally excluded from the public portfolio.
The CV's SMS entry lists PostgreSQL in its technology stack but mentions SQL Server in the deployment bullet; confirm the database in use before publishing a detailed technology-specific claim.

## Deploy

`npm run build` creates `dist/` for static hosting (after installing dependencies).

# Deal Drills

M&A interview practice: timed deal-math drills, an interview question bank, games, leaderboards and a tracker for
German M&A, banking, corporate and Big Four applications.

Plain HTML, CSS and JavaScript. No build step and no Node needed. Supabase handles accounts and data; Cloudflare Pages
serves the files.

```
index.html, drills.html, …   one HTML file per page (all share css/site.css and js/core.js)
js/config.js                 your Supabase URL and anon key (step 2)
js/core.js                   helpers, sign-in, progress sync, header and footer
js/gen.js                    the 15 deal-math generators
js/qbank.js                  interview questions with model answers
js/data/firms.js             firm tracker data and interview pages
supabase/schema.sql          tables, row-level security, leaderboard functions, seed data
tools/check.js               smoke test (syntax + 300 runs of every generator)
tools/mkpage.py              creates a new page from tools/page.tpl
```

## 1. Run it on your Mac

Without Supabase keys the site runs in guest mode: everything works, progress stays in the browser, and
leaderboards and accounts are switched off.

```bash
cd ~/Projects/deal-drills
python3 -m http.server 8000
```

Open http://localhost:8000. Opening `index.html` directly also works, but sign-in links need the local server.

Smoke test before every deploy:

```bash
cd ~/Projects/deal-drills
osascript -l JavaScript tools/check.js
```

## 2. Create the Supabase project

1. Sign up at https://supabase.com and click **New project**. Region: **Central EU (Frankfurt)**. Save the database
   password in your password manager (you will rarely need it).
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, click **Run**. You should see
   "Success. No rows returned". The file can be run again after changes.
3. Open **Project Settings → API Keys** (older projects: **Project Settings → API**). Copy the **Project URL** and the
   **anon** key (or the **publishable** key, starting `sb_publishable_`) into `js/config.js`.
   These two values are public by design. Never put the `service_role` / secret key anywhere in this project.
4. Reload http://localhost:8000. The header now shows **Sign in**.

## 3. Switch on sign-in (username + password)

1. **SQL**: if you ran `schema.sql` before usernames existed, also run `supabase/002_usernames.sql` once.
2. **Authentication → Sign In / Providers → Email**: keep Email enabled and switch **off "Confirm email"**.
   Accounts without an email use a placeholder address (`username@users.dealdrills.app`) that is never mailed.
3. **Authentication → URL Configuration**: Site URL `http://localhost:8000` for now (your live address after
   step 4); add `http://localhost:8000/**` and later `https://YOUR-DOMAIN/**` to the redirect URLs. These matter
   only for password-reset links.
4. **Updates**: if you ran `schema.sql` before these files existed, run the numbered files in
   `supabase/` (002, 003, 004, 005) once each, in order (safe to repeat).
   **Feedback** from the 💬 button lands in **Table Editor → feedback** (kind: bug / missing / idea; set `status` to
   `seen` or `done` as you work through it).
5. **Forgotten passwords.** Users sign in with their username; an optional recovery email is stored privately
   (table `recovery_emails`). "Forgot your password?" with a username creates a row in `reset_requests`.
   Until an automatic reset email is set up, handle requests in the SQL editor:
   ```sql
   -- open requests with the user's recovery email
   select r.id, p.username, e.email, r.created_at from reset_requests r
     join profiles p on p.id = r.user_id left join recovery_emails e on e.user_id = r.user_id
    where not r.handled order by r.created_at;
   -- set a temporary password (pick a random one), then email it to the recovery address and mark it handled
   update auth.users set encrypted_password = extensions.crypt('TEMPORARY-PASSWORD', extensions.gen_salt('bf'))
    where id = (select id from profiles where username = 'USERNAME');
   update reset_requests set handled = true where id = REQUEST_ID;
   ```
   Only reset accounts that have a recovery email, and only send the password to that address. The user should
   change it under Profile → Change password. Automating this needs an email service (e.g. Resend) and a small
   Supabase Edge Function.

Test: http://localhost:8000/login.html → Create account → you land on your profile. Run Balance the Books Easy
test 1 and check the leaderboard.

## 4. Deploy on Cloudflare (Workers with static assets)

1. Push the repository to GitHub (private is fine).
2. On https://dash.cloudflare.com: **Workers & Pages → Create → Import a repository** and pick it. Leave the build command empty;
   the deploy command is `npx wrangler deploy`.
3. `wrangler.jsonc` publishes the folder as a static site. `.assetsignore` keeps `docs/`, `supabase/`, `tools/`, README, TODO and
   palettes.html off the site. Security headers are in `_headers`.
4. Copy the `*.workers.dev` address (or add your own domain under **Settings → Domains & Routes**), then in Supabase set
   **Authentication → URL Configuration → Site URL** to it and add `https://…/**` to the redirect URLs.
5. Every push to the main branch deploys again automatically.

## 5. Before you share the link

- Delete the five demo accounts (they feed made-up data into the tracker averages): run
  `supabase/cleanup_demo_users.sql` in the SQL editor. Their passwords are in `.demo-accounts.json` (not in git).

- Fill in the `[brackets]` in `js/about.js` (name, contact, Impressum, hosting region). A German website run by an
  individual for a public audience generally needs an Impressum and a privacy notice; have them checked if unsure.
- Set up custom SMTP (step 3), otherwise strangers cannot sign in.
- In Supabase **Advisors → Security Advisor**, confirm there are no errors.

## How the leaderboards resist cheating

There is no server of our own, so the rules live in Postgres (`supabase/schema.sql`, section 3):

- The browser cannot write to `scores` at all. Only two database functions can: `start_run(board)` stamps the
  start time on the server; `submit_run(run, score)` stamps the end.
- Each board has a plausible duration window (a 3-minute run must last about 3 minutes), a score range, and a
  minimum time per point (a 10/10 sprint cannot take less than 25 seconds).
- The sprint tiebreak uses the server-measured time, not the browser's.
- Balance the Books has 20 fixed tests per level (Easy / Medium / Hard), identical for every user, each with its
  own board (`game_ledger_easy_1` … `game_ledger_hard_10`). The browser only reports how many answers were wrong;
  the database computes the score as its own measured run time plus 15 seconds per mistake.
- One row per user per board for all time and one per ISO week (Berlin time); only improvements overwrite.
- At most 120 runs per user per hour.

Someone can still answer with a calculator or a script that plays at human speed; that needs real server-side
question generation and is out of scope for a static site. Suspicious rows can be deleted in Supabase
**Table Editor → scores**.

Ranked runs: Deal Math sprint and 3-minute modes with all 15 topics selected, and every game.

Friends: every profile has a private friend code (Profile → Friends). Adding a code makes two players friends
both ways; they then see each other on the leaderboard's Friends tab and in the comparison after each Balance the
Books round, next to the site average.

## Editing content

- **Questions**: `js/qbank.js`, one line per question: `[id, topic, 'b' or 'a', question, model answer]`.
- **Drills**: `js/gen.js`. Run the smoke test after changes.
- **Balance the Books**: transactions in `js/ledger.js`. The fixed tests are generated from these with a seeded
  random generator, so editing a transaction changes the tests. If you do, raise `LEDGER_VERSION` in `js/ledger.js`
  and clear the old test results (Supabase SQL editor: `delete from scores where board like 'game_ledger_%';`).
  Questions per test (`LEDGER_ROUND`, 5), pass mark (`LEDGER_PASS`, 4) and number of tests (`LEDGER_TESTS`, 10) are set there too.
- **Firms**: edit `js/data/firms.js` (one line per firm: slug, name, group, German offices, careers link). Keep
  slugs stable: saved applications point to them. Users' applications are stored in their synced progress, so no
  database change is needed. (The `firms` and `applications` tables in `schema.sql` are unused for now; they are
  there for a future version that shows founders aggregate stats, e.g. how many users applied to a partner firm.)
- **Colour palettes**: `palettes.html` shows the site in each palette side by side; `?palette=bordeaux` or
  `?palette=ocean` on any page tries one out (`?palette=default` resets). To adopt one, copy its values into the
  `:root` block at the top of `css/site.css`.
- **New page**: `python3 tools/mkpage.py NAME "Title · Deal Drills" "Description" js/your-script.js`.

## Third-party files (self-hosted for GDPR)

No request leaves the site except to Supabase.

- `js/vendor/supabase.js`: supabase-js 2.117.0 UMD (MIT), SRI sha384-xPW3QHswsICVC2mW6BFNwMbhpLkbZ133fKOhxNx3QGGgAOJfL3O9t8r2aWn1aez6. To update, download the new `dist/umd/supabase.js` from npm and replace the file.
- `fonts/` + `css/fonts.css`: Archivo, Figtree, JetBrains Mono (SIL Open Font License), latin and latin-ext subsets from Google Fonts.

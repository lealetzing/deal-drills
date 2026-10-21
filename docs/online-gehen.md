# Deal Drills online stellen – Schritt für Schritt

> **Keine Rechtsberatung.** Die Anleitung fasst `docs/launch-recherche.md` zusammen und zeigt den Weg mit möglichst wenig Haftungsrisiko. Für die rechtlichen Schritte (Teil B) lohnt sich eine Stunde Erstberatung bei einer Anwältin oder einem Anwalt für IT-Recht (ca. 150–400 €). Eine Haftung ganz ausschließen kann man als Betreiberin nicht, nur klein halten.

---

## Teil A – Grundentscheidung: klein und kostenlos starten

Das senkt das Risiko am stärksten:

1. **Erst ohne Einnahmen starten.** Keine Werbung, kein Sponsoring, keine Affiliate-Links. Damit brauchst du kein Gewerbe, und das Abmahnrisiko ist geringer. (Cloudflare Pages erlaubt auch später kommerzielle Nutzung im kostenlosen Tarif.)
2. **So wenig Daten wie möglich.** Kein Google Analytics, keine Tracking-Cookies, keine eingebetteten Videos oder Social-Media-Buttons. Dann brauchst du auch kein Cookie-Banner. Schriften und Supabase-Bibliothek liegen schon auf der eigenen Seite.
3. **Erst ein Soft Launch.** Teile den Link zuerst mit 20–50 Freund:innen und Kommiliton:innen, sammle Feedback und gehe dann öffentlich.

---

## Teil B – Rechtliches (vor dem öffentlichen Link)

### B1 · Impressum (§ 5 DDG)
- Inhalt: Name, **ladungsfähige Anschrift** (kein Postfach), E-Mail und ein zweiter schneller Kontaktweg (das Feedback-Formular reicht meist).
- Wohnst du gerade in den USA: Kläre, welche Adresse du angibst. Möglich sind eine Anschrift in Deutschland, unter der du erreichbar bist, oder ein Impressums-Service. Das gehört in die Erstberatung.
- Generator: e-recht24.de (kostenlos) oder IT-Recht-Kanzlei (Premium).
- Platz: Seite `about.html` (Footer-Link „Über uns & Datenschutz“), Platzhalter ersetzen.

### B2 · Datenschutzerklärung (DSGVO)
Die Seite verarbeitet **personenbezogene Daten**, sie ist nicht anonym:
- Benutzername, Passwort (nur als Hash bei Supabase), optionale Recovery-E-Mail
- Fortschritt, Bewerbungen im Tracker, Freundeslisten, Interview-Beiträge, Feedback
- IP-Adressen in den Server-Logs von Cloudflare und Supabase
- Spracheinstellung im Browser (localStorage)

To-dos:
1. **Supabase:** im Dashboard prüfen, dass das Projekt in einer **EU-Region** liegt (z. B. Frankfurt). Die **DPA (Auftragsverarbeitungsvertrag)** ist automatisch Teil der Supabase-Nutzungsbedingungen (supabase.com/legal/dpa), nichts zu unterschreiben.
2. **Cloudflare:** Der Auftragsverarbeitungsvertrag (DPA) gilt automatisch für alle Kund:innen, auch im kostenlosen Tarif. Nichts zu tun.
3. Datenschutzerklärung mit Generator erstellen (e-recht24, datenschutz-generator.de) und auf diese Liste anpassen. **Ich kann dir einen Entwurf schreiben, der genau zu dieser Seite passt.**
4. Löschen ermöglichen: Das Konto-Löschen gibt es schon im Profil. Datenauskunft auf Anfrage per E-Mail reicht.
5. Mindestalter 16 in die Nutzungsbedingungen.

### B3 · Nutzungsbedingungen
Kurz und klar, Inhalt:
- Zweck, kostenlos, kein Anspruch auf Verfügbarkeit oder Interview-Erfolg
- Konto: ab 16, ein Konto pro Person, Löschung jederzeit
- **Regeln für Beiträge:** keine vertraulichen Case-Unterlagen oder NDA-Inhalte, keine Namen von Interviewer:innen, nichts Beleidigendes, nichts aus Büchern oder Guides kopiert
- Nutzungsrecht an Beiträgen (einfach, für die Anzeige auf der Seite)
- Moderation: Beiträge können gelöscht und Konten gesperrt werden
- Haftung: nur so weit beschränkbar, wie das Gesetz es erlaubt (Vorsatz, grobe Fahrlässigkeit und Gesundheit nie). Deshalb lieber Generator oder Anwalt nutzen und nicht selbst formulieren.

### B4 · Beiträge von Nutzer:innen (Interview-Seite)
Als Host haftest du für fremde Beiträge erst, **wenn du davon weißt und nicht handelst**. Deshalb:
- „Melden“-Knopf gibt es schon. Ab 3 Meldungen wird ein Beitrag automatisch ausgeblendet.
- Prüfe gemeldete Beiträge zeitnah (Ziel: innerhalb von 48 h) und lösche Rechtswidriges. Als Host kannst du jeden Beitrag löschen.
- Kontaktstelle nach DSA: die E-Mail im Impressum nennen.

### B5 · Inhalte, die du selbst veröffentlichst
- Nur **eigene Formulierungen**: nichts aus „400 Questions“-Guides, WSO, Büchern oder Kursen kopieren. Ideen und Fakten sind frei, Texte nicht.
- Firmen nur mit Fakten nennen (Name, Standort, Link zur Karriereseite). **Keine Logos**, keine erfundenen Fristen oder Zitate.
- Hinweis „Keine Verbindung zu den genannten Firmen“ (steht schon im Tracker).
- Trackr und Emergers nur verlinken, nichts übernehmen (so umgesetzt).

### B6 · Name und Marke
1. Selbst suchen (30 Minuten): DPMA (dpma.de → DPMAregister), EUIPO (euipo.europa.eu → eSearch), USPTO (tmsearch.uspto.gov). Suchbegriff „Deal Drills“ und ähnliche Schreibweisen in den Klassen 41 (Ausbildung) und 9/42 (Software).
2. Bei Treffern: Namen wechseln, **bevor** du Marketing machst.
3. Domain sichern (ca. 10–20 €/Jahr), z. B. bei INWX, Namecheap oder direkt über Cloudflare (Cloudflare Registrar, zum Einkaufspreis).
4. Eine eigene Marke anzumelden (DPMA ca. 290 €) kann warten, bis die Seite Nutzer:innen hat.

### B7 · Haftung als Person
- Als Privatperson haftest du persönlich, solange es keine GmbH oder UG gibt. Für eine kostenlose Lernseite ist das üblich und das Risiko gering, wenn B1 bis B5 sauber sind.
- Sobald Geld fließt (Sponsoring, Werbung): Gewerbe anmelden (20–65 €), Finanzamt-Fragebogen über ELSTER, ggf. Kleinunternehmerregelung. Dann über eine **UG (haftungsbeschränkt)** und eine **Haftpflicht- oder Cyber-Versicherung** nachdenken.

---

## Teil C – Seite aufräumen

1. **Demo-Nutzer löschen:** Im Supabase SQL Editor `supabase/cleanup_demo_users.sql` ausführen.
2. **Test-Feedback löschen:** die zwei Einträge „TEST by Claude“ in der Tabelle `feedback`.
3. **Offene SQL-Dateien ausführen**, falls noch nicht geschehen: `010_accuracy_compare.sql`, `011_levels_and_process.sql`, `012_more_games.sql`.
4. Platzhalter auf der About-Seite füllen ([Name] usw.).
5. Inhalte einmal über `review.html` durchsehen.

---

## Teil D – Technisch online gehen (ohne Programmieren)

### D1 · Code auf GitHub
1. Auf github.com einloggen → **New repository** → Name `deal-drills` → **Private** → Create.
2. Im Terminal im Projektordner (ich kann das für dich machen):
   ```bash
   cd ~/Projects/deal-drills
   git add -A && git commit -m "Deal Drills launch"
   git branch -M main
   git remote add origin https://github.com/DEIN-NAME/deal-drills.git
   git push -u origin main
   ```
   `.gitignore` hält Testpasswörter und lokale Einstellungen schon heraus. Im Code steht nur der öffentliche Supabase-Schlüssel (publishable key), das ist so vorgesehen.

### D2 · Cloudflare Pages
1. dash.cloudflare.com → kostenloses Konto anlegen.
2. **Workers & Pages → Create → Pages → Connect to Git** → GitHub verbinden → `deal-drills` auswählen.
3. Einstellungen: Framework preset **None**, Build command `sh tools/build.sh`, Build output directory `dist` → **Save and Deploy**.
   Das Skript veröffentlicht nur die Seite selbst; `docs/`, SQL-Dateien und Notizen bleiben privat.
4. Du bekommst eine Adresse wie `deal-drills.pages.dev`. Teste dort Login, ein Spiel und den Tracker.
5. Eigene Domain: im Projekt **Custom domains → Set up a domain**. Am einfachsten kaufst du die Domain direkt bei Cloudflare.
6. Jede Änderung, die ich auf GitHub hochlade, geht automatisch online.

### D3 · Supabase einstellen
1. **Authentication → URL Configuration:** Site URL = deine Domain (z. B. `https://dealdrills.de`), dieselbe Domain bei Redirect URLs.
2. **Authentication → Providers → Email:** „Confirm email“ bleibt aus (Login per Benutzername).
3. **Free-Tarif:** pausiert nach 7 Tagen ohne Aktivität und macht keine automatischen Backups. Für den öffentlichen Start lohnt sich Pro (ca. 25 $/Monat), oder du exportierst die Daten regelmäßig selbst (ich kann dir dafür einen Befehl vorbereiten).
4. Rate Limits unter *Authentication → Rate Limits* auf den Standardwerten lassen.

### D4 · Soft Launch, dann öffentlich
1. Link an Freund:innen schicken. Wenn die Seite bis dahin nicht bei Google auftauchen soll, sag Bescheid, dann setze ich vorübergehend „noindex“.
2. Feedback abarbeiten (Supabase-Tabelle `feedback`).
3. Öffentlich gehen: „noindex“ entfernen, Google Search Console einrichten, Sitemap einreichen (siehe Teil 3 in `launch-recherche.md`), Marketing nach `marketing-monetarisierung.md` starten.

---

## Checkliste zum Abhaken

- [ ] Name in DPMA/EUIPO/USPTO geprüft, Domain gekauft
- [ ] Impressum mit Anschrift
- [ ] Datenschutzerklärung (passend zur Liste in B2)
- [ ] Nutzungsbedingungen mit Regeln für Beiträge
- [ ] Supabase in EU-Region, DPA unterschrieben
- [ ] Erstberatung IT-Recht (empfohlen)
- [ ] Demo-Nutzer und Test-Feedback gelöscht, SQL 010–012 ausgeführt
- [ ] About-Platzhalter gefüllt, Inhalte über review.html geprüft
- [ ] GitHub (privat) → Cloudflare Pages → Domain
- [ ] Supabase Site URL gesetzt, Backup-Plan
- [ ] Soft Launch mit Freund:innen
- [ ] Öffentlich: Search Console, Marketing

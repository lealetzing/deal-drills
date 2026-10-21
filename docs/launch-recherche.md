# Deal Drills – Launch-Recherche (Stand 20.10.2026)

> **Keine Rechtsberatung.** Zusammenfassung aus Websuche (überwiegend Sekundärquellen) + Blick in den Code. ⚠️ = unsicher / selbst prüfen. Vor dem Launch ggf. 1 Stunde Erstberatung (Anwalt für IT-Recht oder Verbraucherzentrale/IHK) – lohnt sich bei UGC + Firmennamen.

## TL;DR – Top 8 vor dem Launch
1. **Google Fonts + cdn.jsdelivr.net lokal hosten** (Code lädt beides extern → IP-Übertragung an Dritte, DSGVO-Abmahnrisiko; LG München I, 20.01.2022, 3 O 17493/20 ⚠️ Aktenzeichen aus dem Gedächtnis).
2. **Impressum** (§ 5 DDG) mit ladungsfähiger Anschrift + E-Mail.
3. **Datenschutzerklärung** + AVV mit Supabase & Vercel; Supabase-Projekt in **EU-Region**.
4. **Nutzungsbedingungen** + **Melde-Button** für Beiträge (DSA Art. 16) + Löschprozess.
5. Nur **eigene Formulierungen** für Fragen (nichts aus „400 Questions“ o. Ä.).
6. **Name prüfen** (DPMA/EUIPO/USPTO, 30 Min) – bisher kein Treffer gefunden, aber nicht verifiziert.
7. Vercel **Hobby = nur nicht-kommerziell** ⚠️ → bei Sponsoring/Werbung auf Pro.
8. SEO: öffentliche, serverseitig vorhandene HTML-Inhaltsseiten + Sitemap + Search Console.

---

## 1. Recht (DE/EU)

### 1.1 Impressum (§ 5 DDG, früher TMG)
- Pflicht für „geschäftsmäßige“ Telemedien – **kostenlos ≠ befreit**; entscheidend: dauerhaft + wirtschaftliches Interesse. Werbung, Sponsoring, Affiliate triggern es sicher; rein private Seiten sind befreit. Im Zweifel: Impressum. [IHK München](https://www.ihk-muenchen.de/ratgeber/recht/internetrecht/impressum/), [e-recht24](https://www.e-recht24.de/impressum/13095-impressum-fuer-die-private-homepage.html), [Gesetz](https://www.gesetze-im-internet.de/ddg/__5.html)
- Deal Drills hat Monetarisierungspläne (TODO) und Karriereziel → **Impressum einplanen**.
- Inhalt: Name, **ladungsfähige Anschrift** (kein reines Postfach), E-Mail + zweiter schneller Kontaktweg (Formular reicht meist). ⚠️ Wohnsitz in den USA (MBA): Anschrift im Ausland ist rechtlich heikel; Alternative: Anschrift in DE (Familie) oder Impressums-Adressdienst – vorab klären.
- Bußgeld theoretisch bis 50 000 €, praktisch Abmahnungen von Wettbewerbern.

### 1.2 Datenschutz (DSGVO)
- **Datenschutzerklärung** (Art. 13): Verantwortliche, Zwecke/Rechtsgrundlagen (Art. 6(1)(b) Konto/Tracker, (f) Hosting/Logs), Empfänger (Supabase, Vercel), Drittlandtransfer, Speicherdauer, Betroffenenrechte, Beschwerderecht (Aufsichtsbehörde). Generator: e-recht24 / Datenschutz-Generator.de als Startpunkt, dann auf Realität anpassen.
- **Supabase**: DPA mit SCCs (Modul 2), Vertragspartner Supabase Pte. Ltd., irisches Recht; **muss aktiv unterzeichnet werden** (PandaDoc über Legal Hub). [Supabase DPA](https://supabase.com/legal/dpa), [Residency-FAQ](https://supabase.com/legal/privacy-resources/data-residency-and-transfers-faq). ⚠️ DPF-Zertifizierung von Supabase nicht gefunden → SCCs verlassen. Projekt-Region im Dashboard auf **EU (z. B. Frankfurt)** prüfen; Region lässt sich später nicht ändern.
- **Vercel**: DPA mit SCCs + EU-US-DPF-zertifiziert; DPA gilt laut Text für **Pro/Enterprise**, nicht sicher für Hobby ⚠️. [Vercel DPA](https://vercel.com/legal/dpa), [Compliance](https://vercel.com/docs/security/compliance). Request-Logs/IP landen bei Vercel (z. T. als eigener Verantwortlicher).
- **Externe Ressourcen**: Fonts/CDN-Skripte selbst hosten (Befund im Code: `fonts.googleapis.com`, `cdn.jsdelivr.net`).
- Betroffenenrechte technisch: Konto + Daten **löschen**, Export auf Anfrage (Mail genügt). Mindestalter (16 in DE für Einwilligung; bei Vertrag Art. 6(1)(b) unkritischer, in ToS „ab 16“ ⚠️).
- Bewerbungs-Tracker enthält Informationen über Bewerbungen → keine „besonderen Kategorien“, aber vertraulich: RLS-Policies testen, kein Admin-Zugriff ohne Grund.
- Kein Analytics zum Start (oder cookieloses, EU-gehostetes wie Plausible/Umami selbst gehostet) → vermeidet Banner.

### 1.3 Cookies / localStorage (§ 25 TDDDG)
- § 25 gilt **auch für localStorage**; Einwilligung nötig, außer „unbedingt erforderlich“ für einen ausdrücklich gewünschten Dienst (Abs. 2 Nr. 2). [Gesetz](https://www.gesetze-im-internet.de/ttdsg/__25.html), [e-recht24 TDDDG](https://www.e-recht24.de/datenschutz/12834-tdddg.html)
- Im Code: `dd-lang` (Sprache), `dd-palette` (Design) + Supabase-Session-Token. Session/Login = erforderlich ✔. Sprach-/Designwahl: **vertretbar als Nutzerwunsch-Funktion** (vom Nutzer aktiv gesetzt) ⚠️ umstritten, aber geringes Risiko; in DSE erwähnen.
- **Kein Banner nötig**, solange kein Tracking/Marketing/Drittanbieter-Embeds. Sobald Analytics/Werbung → Banner (Opt-in, „Ablehnen“ gleichwertig).

### 1.4 Nutzungsbedingungen
Inhalt: Zweck/kostenlos, Konto (Alter, ein Konto, Löschung), **erlaubte Inhalte** (keine Rechtsverletzungen, keine Firmengeheimnisse/NDA-Inhalte, keine Diffamierung, keine kopierten Fragen), **Rechteeinräumung** an Nutzerbeiträgen (einfaches Nutzungsrecht, weltweit, für Anzeige auf der Plattform), Moderation/Sperrung, Haftungsbeschränkung (nur eingeschränkt zulässig, Vorsatz/grobe Fahrlässigkeit/Leben/Körper nie ausschließbar), **kein Anspruch auf Interview-Erfolg**, Änderungsvorbehalt, Gerichtsstand/anwendbares Recht (Verbraucher bleiben bei Heimatrecht). Als Start: IT-Recht-Kanzlei/Mustertexte, auf die Plattform zuschneiden.

### 1.5 User-generated Content: DSA & Haftung
- Öffentlich sichtbare Nutzerfragen = **Hosting-Dienst mit Verbreitung an die Öffentlichkeit** (vermutlich „Online-Plattform“). Haftung erst **ab Kenntnis** (DSA Art. 6, früher § 10 TMG), keine Vorab-Prüfpflicht – BGH-Linie: bei konkretem Hinweis prüfen und ggf. schnell entfernen. [BGH VI ZR 34/15](https://lexetius.com/2016,670), [Otto Schmidt](https://www.otto-schmidt.de/blog/it-recht-blog/bgh-storerhaftung-auf-dem-weg-zu-notice-and-takedown-ITBLOG0000704.html)
- **Kleinstunternehmen (<10 MA, <2 Mio €)** sind von den Zusatzpflichten für Plattformen (Art. 19–28: internes Beschwerdesystem, Trusted Flaggers usw.) befreit – **aber nicht von** Kontaktstelle (Art. 11/12), AGB-Pflichten (Art. 14), **Notice-and-Action (Art. 16)** und **Begründung bei Löschung (Art. 17)**. [DSA-Text](https://eur-lex.europa.eu/eli/reg/2022/2065/oj), [Überblick](https://trust.doctena.com/dsa). ⚠️ Ob eine Privatperson als „Anbieter“ unter die Befreiung fällt: nach Wortlaut der Empfehlung 2003/361 Unternehmensbegriff – sicherheitshalber alle Pflichten light umsetzen.
- **Umsetzung (klein halten):** „Melden“-Button pro Beitrag → Tabelle `reports` (Grund, Link, Meldername/Mail) → Admin-Ansicht → Löschen + Mail mit kurzer Begründung; Eingangsbestätigung; Doku. Dazu: Moderations-Queue oder zumindest Admin-Delete (Migration 009 existiert), Limit/Rate-Limit gegen Spam, Verbot von Links in Beiträgen.
- **Beiträge mit Firmennamen:** Tatsachenbehauptungen über Firmen („Bank X fragt Y im Interview“) sind meist zulässig, **unwahre/ehrverletzende Behauptungen nicht**; Unternehmen haben Persönlichkeitsrecht ([OLG Dresden-Bsp.](https://www.ra-plutte.de/stoererhaftung-von-mikroblogs-bei-rechtsverletzungen-ihrer-user/amp/)). → ToS-Regel: nur eigene, sachliche Erfahrung; **keine vertraulichen/NDA-Informationen**, keine Namen von Interviewern; Beiträge anonym zur Öffentlichkeit, Meldeweg für Firmen.
- US-Nutzer ⚠️: Section 230 schützt US-Plattformen weitgehend; für Urheberrechtsmeldungen DMCA-Safe-Harbor setzt registrierten „Designated Agent“ voraus (Gebühr ca. 6 $) – optional, erst bei US-Traction.

### 1.6 Urheberrecht für Interviewfragen
- **Frei:** Themen, Fachwissen, Ideen, Formeln, Lösungswege, Fakten (§ 2 UrhG schützt nur persönliche geistige Schöpfungen/Form). Eine einzelne kurze Frage ist meist nicht schutzfähig, aber **Auswahl und Anordnung einer Sammlung** können schutzfähig sein (BGH 27.02.1981 – I ZR 20/79 „Fragensammlung“ ⚠️ Fundstelle: [Link](https://www.anwalt24.de/urteile/bgh/1981-02-27/i-zr-20_79)), ebenso Lösungstexte/Erklärungen.
- **Nicht tun:** Fragen 1:1 oder leicht umformuliert aus „400 IB Questions“, Breaking Into Wall Street, WSO-Guides etc. übernehmen; deren Reihenfolge/Struktur nachbauen; Antworten paraphrasieren.
- **Sicher:** Thema aus Lehrbuch/Standard ableiten → **eigene Frage + eigene Antwort + eigenes Zahlenbeispiel**; Kontrolle: Quelle zuklappen, aus dem Kopf schreiben. Zahlen/Beispiele selbst erfinden.
- **Zitat § 51 UrhG:** nur zum Zweck des Zitats (Beleg/Auseinandersetzung), Umfang durch Zweck gerechtfertigt, Quelle nennen; **kein Zitat als Füllmaterial** und keine ganzen Fragenblöcke. [Uni Göttingen](https://uni-goettingen.de/de/126523.html), [IT-Recht-Kanzlei](https://www.it-recht-kanzlei.de/zitat-urheberrecht.html).
- **Nutzerbeiträge:** ToS-Pflicht „eigene Formulierung“; Meldeweg für Rechteinhaber; bei Verdacht löschen.
- Häufige Fragen von Banken (z. B. „Walk me through a DCF“) sind Allgemeingut – aber die eigene Antwort schreiben.

### 1.7 Firmennamen/-links im Tracker
- Nennen von Firmennamen zur Identifikation ist erlaubt (Benennung/§ 23 MarkenG, **keine Logos** ohne Lizenz; keine Suggestion einer Partnerschaft). Disclaimer im Footer: „Deal Drills ist nicht mit den genannten Unternehmen verbunden; Angaben ohne Gewähr.“
- Links zu Karriereseiten/Trackr: ok (Hyperlink auf offizielle Seiten); externer Link-Hinweis + Disclaimer (bereits vorhanden). Keine Ausgabe von Fremd-Datenbanken (Scraping) ohne Prüfung der AGB.
- Vermeiden: Gehaltsangaben/„Erfolgschancen“ als Tatsache; stattdessen „Nutzerangaben, ohne Gewähr“. Kein Anspruch auf Vollständigkeit, kein Anlage- oder Karriereversprechen (keine Finanzberatung).

### 1.8 Privatperson oder Gewerbe?
- **Kostenlos, ohne Einnahmen:** kein Gewerbe nötig (keine Gewinnerzielungsabsicht) – Impressum trotzdem sicherheitshalber.
- **Sobald Werbung/Sponsoring/Affiliate/Recruiting-Fees:** i. d. R. **Gewerbeanmeldung** (20–65 € je Kommune), Finanzamt-Fragebogen (ELSTER), ggf. Kleinunternehmerregelung (⚠️ Grenzen 25 000 €/100 000 € prüfen), Krankenkasse/Studentenstatus klären. [Tide](https://www.tide.co/de-DE/blog/unternehmensgruendung/nebengewerbe-anmelden/), [Händlerbund](https://www.haendlerbund.de/de/ratgeber/recht/4216-online-shop-gewerbeanmeldung)
- **Steuerlich ⚠️ US-Wohnsitz/F‑1/J‑1:** Einnahmen aus Online-Geschäft können US-Steuer-/Visa-Fragen auslösen → mit Steuerberater/International Office klären, bevor Geld fließt.
- Firma (UG/GmbH) nicht nötig; Haftung bei UGC/Datenschutz dann nur theoretisch begrenzt – später evaluieren, wenn Sponsoring real wird.

### 1.9 Grobe Kosten
| Posten | Kosten |
|---|---|
| Domain (.de/.com) | ca. 10–20 €/Jahr |
| Impressum/DSE/ToS (Generator) | 0–150 € einmalig (Premium-Generator); Anwalt-Check 150–400 € |
| Vercel Hobby / Pro | 0 € / ca. 20 $ pro Monat ⚠️ Hobby nur nicht-kommerziell |
| Supabase Free / Pro | 0 € / ca. 25 $ pro Monat ⚠️ Free pausiert bei Inaktivität, keine Backups |
| Marke DPMA (Wortmarke, 3 Klassen) | ca. 290 € ⚠️ aktuell prüfen; EUIPO ca. 850 € ⚠️; USPTO ca. 350 $/Klasse ⚠️ |
| Gewerbeanmeldung | 20–65 € |
| Vorab-Recherche Marke durch Anwalt | ca. 100–300 € ⚠️ |

---

## 2. Name & Logo

### 2.1 „Deal Drills“ – Befund
- **Websuche:** kein Unternehmen/Produkt „Deal Drills“ im M&A-Kontext gefunden (zwei Suchen). Ergebnis ≠ Entwarnung (kleine Marken werden oft nicht indexiert).
- **Domains** (WHOIS/DNS, 20.10.2026): `dealdrills.de` **frei**; `dealdrills.com` kein Eintrag (WHOIS „No match“) ; `.io`, `.co`, `.org` „not found“; `.app` ⚠️ unklar. → Beim Registrar (INWX/Namecheap/Cloudflare) verifizieren, **bald sichern** (.de + .com).
- **Marken-Datenbanken können nicht automatisiert abgefragt werden – selbst prüfen (30 Min):**
  - DPMA: <https://register.dpma.de/DPMAregister/marke/einsteiger>
  - EUIPO eSearch: <https://euipo.europa.eu/eSearch/> · TMview: <https://www.tmdn.org/tmview/>
  - USPTO: <https://tmsearch.uspto.gov/>
  - Suche: „DEAL DRILLS“, „DEAL DRILL“, „DEALDRILLS“, „DEAL DRILLING“ in Klassen **41 (Bildung/Training), 9 (Software), 42 (SaaS), 35**; zusätzlich Phonetik („Dealdrill“). „Drill“ in Kl. 7/8 (Bohrer) ist keine Verwechslungsgefahr zu Bildung, aber „Deal“ + „Drill(s)“ in 41/9/42 prüfen.
- **Schwäche:** beschreibender Anklang (Deal = Branche, Drills = Übungen) → als Marke eher schwach/schwer eintragbar, aber auch wenig kollisionsanfällig. Logo (Bild-/Wort-Bildmarke) ist leichter schutzfähig.
- Logo: selbst gestalten oder KI-generiert – keine fremden Icons/Fonts ohne Lizenz; Lizenzen dokumentieren; Favicon (vorhanden: `favicon.svg`).

### 2.2 Fünf Alternativen (alle ungeprüft in den Registern ⚠️; Domainstatus via DNS)
| Name | Idee | Quick-Check |
|---|---|---|
| **DealReps** | „Reps“ = Wiederholungen + Deal | `dealreps.com` hat Nameserver (Afternic → evtl. **zum Verkauf**), `.io` kein NS. „Reps & Warranties“ ist M&A-Begriff → guter Doppelsinn, aber beschreibend. |
| **DealGym** | Training-Metapher | `dealgym.com` **vergeben** (GoDaddy-NS), `.io` frei(?) – Marken „Gym“ in Kl. 41 prüfen, viele Fitness-Marken. |
| **Bookbuild** | M&A/ECM-Begriff (Bookbuilding) | `bookbuild.io` vergeben (Cloudflare). Gebräuchlicher Fachbegriff → schwer schützbar. |
| **PitchDrill** | Pitch + Drill | `pitchdrill.com` vergeben/zum Verkauf (Afternic). Klingt Richtung Pitch-Decks statt Interviews. |
| **Closing Drills** | Deal-Closing + Üben | `closingdrill.com` ohne NS (evtl. frei ⚠️). Nahe an „Closing“ (viele Marken). |

Weitere Kandidaten ungeprüft: *DealCraft*, *Term Sheet Trainer* (Term Sheet = Fortune-Newsletter → meiden), *Pitchbook* (großer Marktteilnehmer → nicht), *Dealflow*/*Dealroom* (bestehende Firmen → nicht).
**Empfehlung:** „Deal Drills“ **behalten**, .de + .com sichern, DPMA/EUIPO-Recherche, dann entscheiden. Wechsel lohnt nur bei Treffer in Kl. 41/9/42.

---

## 3. Sichtbarkeit: Google & KI-Assistenten

**Kernaussage:** Es gibt keinen „KI-Trick“. Google erklärt, dass für AI Overviews weder spezielle Markup-Tags noch `llms.txt` nötig sind ([Google: AI-Funktionen](https://developers.google.com/search/docs/appearance/ai-features)); KI-Assistenten (ChatGPT-Search, Perplexity, Claude-Websuche) zitieren, was **gut indexierbar, klar und verlinkt** ist. Sekundärquellen: [llms.txt-Einordnung](https://www.texta.ai/blog/do-ai-crawlers-read-llms-txt), [Schema/FAQ 2026](https://seocrawl.ai/blog/faq-structured-data-google-2026) ⚠️ (Blogs, nicht verifiziert).

### Prioritäten-Checkliste
**P0 – vor/zum Launch (alles Pflicht für Auffindbarkeit)**
- [ ] **Öffentliche, ohne Login lesbare Inhaltsseiten** mit statischem HTML (nicht erst per JS nachgeladen): z. B. `/m-and-a-interview-fragen`, `/ib-interview-vorbereitung`, je Thema (DCF, Accretion/Dilution, LBO, IFRS…) eine URL mit Frage + Antwort-Ausschnitt. Prüfen, ob `questions.html`/`topics.html` Inhalte clientseitig laden → dann **Build-Schritt zum Vorrendern** (Script, das JSON → HTML erzeugt).
- [ ] Pro Seite: eindeutiger `<title>` (≤60 Z.), `<meta description>`, ein `<h1>`, saubere `<h2>`, `<link rel="canonical">`, `lang`, Open-Graph.
- [ ] `robots.txt` + `sitemap.xml` (Vercel: statische Dateien); **Google Search Console** + **Bing Webmaster Tools** einreichen (Bing speist u. a. ChatGPT-Search/Copilot ⚠️), IndexNow optional.
- [ ] Mobile/Speed: Fonts lokal, kleine Bilder, Core Web Vitals (Lighthouse).
- [ ] KI-Crawler **nicht blocken** (OAI-SearchBot, PerplexityBot, Claude-SearchBot/ClaudeBot) – Training vs. Suche getrennt in robots.txt entscheiden ⚠️ Doku der Anbieter prüfen.
- [ ] Nutzerbeiträge zunächst **`noindex`** (Spam/Diffamierungsrisiko), nur kuratierte Inhalte indexieren.

**P1 – erste 4 Wochen**
- [ ] Zweisprachig (de/en) mit `hreflang`; Seiten getrennt nach Sprache (DE-Keywords: „IB Interview Vorbereitung“, „M&A Interview Fragen“, „Investmentbanking Praktikum Bewerbung“; EN: „M&A interview questions“, „investment banking technical questions“).
- [ ] Strukturierte Daten (JSON-LD): `WebSite`, `Organization`/`Person` (Autorin, E-E-A-T), `BreadcrumbList`, `Course`/`LearningResource` ⚠️; **FAQPage nur dort, wo Frage+Antwort sichtbar vom Betreiber stammen** (Rich-Results für FAQ ohnehin stark eingeschränkt ⚠️); nutzergenerierte Q&A → `QAPage`.
- [ ] Autorenseite „Über“ (Lea, NYU Stern, DE-Hintergrund) – Glaubwürdigkeit/E-E-A-T; About-Platzhalter füllen (TODO).
- [ ] Interne Verlinkung Themen ↔ Fragen ↔ Spiele; Beschreibungstext mit klarem Satz „Was ist Deal Drills?“ (wird von KI zitiert).

**P2 – laufend / Backlinks (wichtigster Hebel)**
- [ ] Uni-/Finance-Clubs: Verlinkung/Ressourcenseite bei NYU Stern Finance Club, WHU, Frankfurt School, Mannheim, ESMT, LMU/TUM Finance-Clubs, Target-School-Clubs (US: Wharton, Columbia etc.) anschreiben; Kooperation: gemeinsames Mock-Interview-Event.
- [ ] Verlinkung aus LinkedIn-Profil, GitHub-Repo/README (falls öffentlich), Product Hunt, Hacker-News „Show HN“, Reddit (r/FinancialCareers, r/investmentbanking – Selbstwerbung-Regeln beachten), Wall Street Oasis/Student-Foren (Regeln beachten), Substack/Medium-Gastartikel.
- [ ] TikTok/Instagram/LinkedIn-Content mit Link zu je einer Themenseite (Marketingplan).
- [ ] Erwähnungen in Listen: „Best IB interview prep resources“-Artikel (Outreach).

**P3 – optional**
- [ ] `llms.txt` (10 Min, kurze Beschreibung + Links zu Kernseiten) – **geringer Nutzen**, kein großer Anbieter bestätigt Nutzung ⚠️; schadet nicht.
- [ ] Monatliche Prompt-Tests („Wo kann ich M&A-Interviews üben?“ in ChatGPT/Claude/Perplexity) als Messung.

---

## Offene Entscheidungen für Lea
1. Monetarisierung ja/nein zum Start? (bestimmt Gewerbe, Vercel-Plan, Impressum-Pflicht)
2. Impressum-Adresse (DE-Anschrift vorhanden?)
3. Soll nutzergenerierte Fragen-Liste öffentlich/indexierbar sein oder nur nach Login?
4. Name behalten nach Markenrecherche?

## Quellen (Auswahl)
IHK München Impressum · e-recht24 · gesetze-im-internet.de (DDG, TDDDG) · EUR-Lex DSA 2022/2065 · Supabase/Vercel DPA-Seiten · BGH VI ZR 34/15 · Uni Göttingen § 51 UrhG · Google Search Central (AI features) – Links siehe oben.

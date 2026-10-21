/* About, rules for posts, privacy policy (Datenschutzerklärung) and Impressum.
   Lea: fill in OWNER.mail before going public; everything below uses it.
   Draft written for this site's actual data flows; not legal advice. */
var OWNER={
  name:'Lea Letzing',
  street:'Auf der Trat 4',
  city:'82393 Iffeldorf',
  country:'Deutschland',
  mail:'dealdrills@gmail.com'
};
var UPDATED='20.10.2026';
var MAIL='<a href="mailto:'+OWNER.mail+'">'+OWNER.mail+'</a>';
var ADDR=OWNER.name+'<br>'+OWNER.street+'<br>'+OWNER.city+'<br>'+OWNER.country;
function h3(id,t){return '<h3 id="'+id+'" style="margin:30px 0 10px">'+t+'</h3>';}
function h4(t){return '<h4 style="margin:18px 0 6px">'+t+'</h4>';}

$('#view').innerHTML='<div class="eyebrow">'+L('About','Über uns')+'</div><h2 style="margin:8px 0 12px">Deal Drills</h2>'+
'<p class="muted" style="margin:0 0 14px"><a href="#rules">'+L('Rules for posts','Regeln für Beiträge')+'</a> · <a href="#privacy">'+L('Privacy policy','Datenschutzerklärung')+'</a> · <a href="#impressum">Impressum</a></p>'+
L('<p>Free practice for M&amp;A and investment banking interviews: drills, technical questions, games, case stories and an application tracker. Built by '+OWNER.name+'.</p>'+
  '<p>Numbers in drills are generated at random and companies in drills and cases are invented. The tracker lists firms by name with links to their official careers pages. Deal Drills is not affiliated with or endorsed by any firm listed, nor by Trackr or Emergers.</p>',
  '<p>Kostenlose Vorbereitung auf M&amp;A- und Investment-Banking-Interviews: Drills, technische Fragen, Spiele, Fallgeschichten und ein Bewerbungs-Tracker. Entwickelt von '+OWNER.name+'.</p>'+
  '<p>Zahlen in den Übungen sind zufällig erzeugt, Unternehmen in Übungen und Fällen sind erfunden. Der Tracker nennt Firmen mit Namen und verlinkt ihre offiziellen Karriereseiten. Deal Drills ist mit keiner der genannten Firmen verbunden und wird von ihnen nicht unterstützt, ebenso wenig von Trackr oder Emergers.</p>')+

h3('rules',L('Rules for posts','Regeln für Beiträge'))+
L('<p>Share questions you were asked in an interview. Not allowed: confidential materials or anything you have to keep secret, names of people, insults or untrue claims, text copied from books, guides or courses, and advertising.</p>'+
  '<p>By posting you allow us to show your post on Deal Drills and confirm that you wrote it yourself. Posts reflect the experience of users and are not checked by us or by the firms. We may remove posts and suspend accounts at any time.</p>'+
  '<p>Report breaches with the “Report” button or to '+MAIL+'; we review reports promptly.</p>',
  '<p>Teile Fragen, die dir in einem Interview gestellt wurden. Nicht erlaubt sind: vertrauliche Unterlagen oder Inhalte, die du geheim halten musst, Namen von Personen, Beleidigungen oder unwahre Behauptungen, kopierte Texte aus Büchern, Guides oder Kursen sowie Werbung.</p>'+
  '<p>Mit dem Posten erlaubst du uns, deinen Beitrag auf Deal Drills anzuzeigen, und bestätigst, dass du ihn selbst verfasst hast. Beiträge geben die Erfahrung der Nutzer:innen wieder und werden weder von uns noch von den Firmen geprüft. Wir können Beiträge jederzeit entfernen und Konten sperren.</p>'+
  '<p>Verstöße meldest du über „Melden“ oder an '+MAIL+'; wir prüfen Meldungen zeitnah.</p>')+

h3('privacy',L('Privacy policy','Datenschutzerklärung'))+
L('<p class="muted">Last updated: '+UPDATED+'</p>','<p class="muted">Stand: '+UPDATED+'</p>')+
h4(L('1. Who is responsible','1. Verantwortliche'))+
'<p>'+ADDR+'<br>'+MAIL+'</p>'+
L('<p>Deal Drills is a free, non-commercial project run by a private individual. There is no data protection officer, as none is required.</p>',
  '<p>Deal Drills ist ein kostenloses, nicht kommerzielles Projekt einer Privatperson. Ein Datenschutzbeauftragter ist nicht bestellt, da keine Pflicht dazu besteht.</p>')+

h4(L('2. Visiting the site (hosting and server logs)','2. Aufruf der Seite (Hosting und Server-Logs)'))+
L('<p>The site is hosted on <b>Cloudflare Pages</b>, a service of Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. When you open a page, Cloudflare automatically processes technical data: IP address, date and time, page requested, browser and operating system, and the referring page. This is needed to deliver the site quickly and protect it against attacks. Legal basis: Art. 6(1)(f) GDPR (legitimate interest in a secure, working website). Cloudflare keeps this data only briefly according to its policies. Cloudflare is certified under the EU–US Data Privacy Framework; in addition, its data processing addendum with standard contractual clauses applies.</p>',
  '<p>Die Seite wird über <b>Cloudflare Pages</b> bereitgestellt, einen Dienst der Cloudflare, Inc., 101 Townsend St., San Francisco, CA 94107, USA. Beim Aufruf verarbeitet Cloudflare automatisch technische Daten: IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Browser und Betriebssystem sowie die zuvor besuchte Seite. Das ist nötig, um die Seite schnell auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren, funktionierenden Website). Cloudflare speichert diese Daten nach eigenen Vorgaben nur kurz. Cloudflare ist unter dem EU-US Data Privacy Framework zertifiziert; zusätzlich gilt der Auftragsverarbeitungsvertrag mit Standardvertragsklauseln.</p>')+

h4(L('3. Using the site without an account','3. Nutzung ohne Konto'))+
L('<p>Your progress, settings and tracked applications are stored only in your browser (localStorage) and never sent to us. You can delete them at any time by clearing your browser data.</p>',
  '<p>Dein Fortschritt, deine Einstellungen und getrackte Bewerbungen werden nur in deinem Browser gespeichert (localStorage) und nicht an uns übertragen. Du kannst sie jederzeit löschen, indem du deine Browserdaten löschst.</p>')+

h4(L('4. Account','4. Konto'))+
L('<p>An account is voluntary. If you create one, we store: your <b>username</b> and a <b>password</b> (stored only as a hash), your <b>display name</b>, and optionally your <b>university</b>, <b>target role</b> and a <b>recovery email</b>. The recovery email is used only to help you if you forget your password and is visible only to you and to us. With an account we also store your <b>progress</b> (practice results, best times, tracked applications), <b>ranked results</b> and your <b>friends</b>. Purpose: to provide the service you signed up for. Legal basis: Art. 6(1)(b) GDPR.</p>'+
  '<p><b>Public:</b> your display name, university (if given) and ranked results appear on the leaderboards. <b>Not public:</b> your applications. The tracker shows only anonymous averages across at least 5 users.</p>',
  '<p>Ein Konto ist freiwillig. Legst du eines an, speichern wir: deinen <b>Benutzernamen</b> und ein <b>Passwort</b> (nur als Hash), deinen <b>Anzeigenamen</b> sowie freiwillig <b>Universität</b>, <b>Zielposition</b> und eine <b>Recovery-E-Mail</b>. Die Recovery-E-Mail nutzen wir nur, um dir zu helfen, wenn du dein Passwort vergisst; sie ist nur für dich und uns sichtbar. Mit Konto speichern wir außerdem deinen <b>Fortschritt</b> (Übungsergebnisse, Bestzeiten, getrackte Bewerbungen), <b>gewertete Ergebnisse</b> und deine <b>Freunde</b>. Zweck: Bereitstellung des Dienstes, für den du dich angemeldet hast. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>'+
  '<p><b>Öffentlich:</b> Anzeigename, Universität (falls angegeben) und gewertete Ergebnisse erscheinen in den Ranglisten. <b>Nicht öffentlich:</b> deine Bewerbungen. Der Tracker zeigt nur anonyme Durchschnitte über mindestens 5 Nutzer:innen.</p>')+

h4(L('5. Interview posts, votes and reports','5. Interview-Beiträge, Abstimmungen und Meldungen'))+
L('<p>If you post an interview question, it is shown publicly together with the firm, round, programme and year you choose, and with your display name unless you post anonymously. We store which account wrote it. “Asked too” votes and reports are stored with your account so each account counts once. Legal basis: Art. 6(1)(b) GDPR and, for moderation, Art. 6(1)(f) GDPR (keeping the site lawful and free of abuse). You can delete your own posts at any time.</p>',
  '<p>Postest du eine Interviewfrage, wird sie öffentlich angezeigt, zusammen mit Firma, Runde, Programm und Jahr, die du auswählst, und mit deinem Anzeigenamen, sofern du nicht anonym postest. Wir speichern, welches Konto den Beitrag verfasst hat. „Auch gefragt“-Stimmen und Meldungen speichern wir mit deinem Konto, damit jedes Konto nur einmal zählt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO und für die Moderation Art. 6 Abs. 1 lit. f DSGVO (rechtmäßiger, missbrauchsfreier Betrieb). Eigene Beiträge kannst du jederzeit löschen.</p>')+

h4(L('6. Feedback and password help','6. Feedback und Hilfe beim Passwort'))+
L('<p>If you send feedback, we store your message, the page you were on, your language and, if you give one, a contact email, plus your account if you are signed in. If you ask for help with a forgotten password, we store the request with your username. We use this only to answer you and improve the site. Feedback is deleted automatically after 180 days, password requests after 30 days. Legal basis: Art. 6(1)(b) and (f) GDPR.</p>',
  '<p>Sendest du Feedback, speichern wir deine Nachricht, die Seite, auf der du warst, deine Sprache und, falls angegeben, eine Kontakt-E-Mail sowie dein Konto, wenn du angemeldet bist. Bittest du um Hilfe bei einem vergessenen Passwort, speichern wir die Anfrage mit deinem Benutzernamen. Wir nutzen das nur, um dir zu antworten und die Seite zu verbessern. Feedback wird nach 180 Tagen automatisch gelöscht, Passwort-Anfragen nach 30 Tagen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b und f DSGVO.</p>')+

h4(L('7. Database provider','7. Datenbank-Anbieter'))+
L('<p>Accounts and the data in sections 4–6 are stored with <b>Supabase</b> (database and login service) on servers in the EU (Ireland). Supabase (Supabase Pte. Ltd.) processes the data on our behalf under its data processing addendum (Art. 28 GDPR), which is part of its terms of service. Where data may be accessed from outside the EU (for example for support), standard contractual clauses apply. Supabase also processes your IP address when you sign in, to protect accounts against abuse.</p>',
  '<p>Konten und die Daten aus Abschnitt 4–6 speichern wir bei <b>Supabase</b> (Datenbank und Login-Dienst) auf Servern in der EU (Irland). Supabase (Supabase Pte. Ltd.) verarbeitet die Daten in unserem Auftrag auf Grundlage seines Auftragsverarbeitungsvertrags (Art. 28 DSGVO), der Teil der Nutzungsbedingungen ist. Soweit ein Zugriff von außerhalb der EU möglich ist (etwa für Support), gelten Standardvertragsklauseln. Supabase verarbeitet beim Anmelden auch deine IP-Adresse, um Konten vor Missbrauch zu schützen.</p>')+

h4(L('8. Browser storage, no tracking','8. Speicherung im Browser, kein Tracking'))+
L('<p>We use your browser’s local storage only for things the site needs or you choose: your login session, your language, your progress and settings. No cookies for advertising or analytics, no tracking tools, no social media plugins. Fonts and scripts are served from our own site, so no third-party font or script services see your visit. Legal basis: § 25(2) no. 2 TDDDG (strictly necessary for a service you requested) and Art. 6(1)(b) GDPR.</p>',
  '<p>Den lokalen Speicher deines Browsers nutzen wir nur für das, was die Seite braucht oder du auswählst: deine Anmeldung, deine Sprache, deinen Fortschritt und Einstellungen. Keine Cookies für Werbung oder Analyse, keine Tracking-Tools, keine Social-Media-Plugins. Schriften und Skripte liefern wir selbst aus; Dritte erfahren über sie nichts von deinem Besuch. Rechtsgrundlage: § 25 Abs. 2 Nr. 2 TDDDG (unbedingt erforderlich für einen von dir gewünschten Dienst) und Art. 6 Abs. 1 lit. b DSGVO.</p>')+

h4(L('9. Links to other sites','9. Links zu anderen Seiten'))+
L('<p>The tracker links to careers pages of firms and to Trackr and Emergers. When you click a link, the other site’s privacy policy applies.</p>',
  '<p>Der Tracker verlinkt Karriereseiten von Firmen sowie Trackr und Emergers. Klickst du einen Link, gilt die Datenschutzerklärung der anderen Seite.</p>')+

h4(L('10. How long we keep data','10. Speicherdauer'))+
L('<p>Account data until you delete your account; you can do this yourself on your profile page, and everything linked to the account is deleted with it. Posts until you or we delete them. Feedback: 180 days. Password requests: 30 days. Technical records of ranked runs: 90 days (your best results stay on the leaderboards). Reports on posts: 365 days. These deletions run automatically every night. Server logs according to the providers’ policies.</p>',
  '<p>Kontodaten, bis du dein Konto löschst; das kannst du selbst auf deiner Profilseite tun, dabei werden alle verknüpften Daten mitgelöscht. Beiträge, bis du oder wir sie löschen. Feedback: 180 Tage. Passwort-Anfragen: 30 Tage. Technische Daten zu gewerteten Runden: 90 Tage (deine Bestwerte bleiben in den Ranglisten). Meldungen zu Beiträgen: 365 Tage. Diese Löschungen laufen jede Nacht automatisch. Server-Logs nach den Vorgaben der Anbieter.</p>')+

h4(L('11. Your rights','11. Deine Rechte'))+
L('<p>You have the right to access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction (Art. 18), data portability (Art. 20) and to object to processing based on legitimate interests (Art. 21). Write to '+MAIL+'. You can also complain to a data protection supervisory authority, for example the one where you live.</p>'+
  '<p>Providing data is voluntary; without an account you can use most of the site. There is no automated decision-making or profiling. The site is meant for users aged 16 and over.</p>',
  '<p>Du hast das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen aufgrund berechtigter Interessen (Art. 21). Schreib dafür an '+MAIL+'. Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren, etwa der an deinem Wohnort.</p>'+
  '<p>Die Angabe von Daten ist freiwillig; ohne Konto kannst du den Großteil der Seite nutzen. Es gibt keine automatisierte Entscheidungsfindung und kein Profiling. Die Seite richtet sich an Nutzer:innen ab 16 Jahren.</p>')+

h3('impressum','Impressum')+
L('<p><b>Information according to § 5 DDG</b></p>','<p><b>Angaben gemäß § 5 DDG</b></p>')+
'<p>'+ADDR+'</p>'+
L('<p><b>Contact</b><br>Email: '+MAIL+'<br>Or use the Feedback button on every page.</p>','<p><b>Kontakt</b><br>E-Mail: '+MAIL+'<br>Oder über den Feedback-Button auf jeder Seite.</p>')+
L('<p><b>Responsible for content according to § 18(2) MStV</b><br>','<p><b>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</b><br>')+ADDR+'</p>'+
L('<p><b>Liability for content and links</b><br>We create the content of this site with care but cannot guarantee that it is complete, correct and up to date. Practice questions and model answers are for learning only and are not professional, legal or investment advice. Posts by users are their own content; we remove unlawful posts as soon as we become aware of them. We are not responsible for the content of external sites we link to; at the time of linking, no unlawful content was apparent. If we learn of unlawful content, we remove the link.</p>',
  '<p><b>Haftung für Inhalte und Links</b><br>Wir erstellen die Inhalte dieser Seite mit Sorgfalt, übernehmen aber keine Gewähr für Vollständigkeit, Richtigkeit und Aktualität. Übungsfragen und Musterantworten dienen nur dem Lernen und sind keine Rechts-, Steuer- oder Anlageberatung. Beiträge von Nutzer:innen sind deren eigene Inhalte; rechtswidrige Beiträge entfernen wir, sobald wir davon erfahren. Für Inhalte externer Seiten, auf die wir verlinken, sind deren Betreiber verantwortlich; zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Erfahren wir von Rechtsverletzungen, entfernen wir den Link.</p>')+
L('<p><b>Beta</b><br>Deal Drills is a work in progress built by students, not by M&amp;A professionals. Content is created with care but may contain mistakes; please report them with the Feedback button.</p>',
  '<p><b>Beta</b><br>Deal Drills ist im Aufbau und wird von Studierenden entwickelt, nicht von M&amp;A-Profis. Die Inhalte werden sorgfältig erstellt, können aber Fehler enthalten; bitte melde sie über den Feedback-Button.</p>')+
L('<p><b>Copyright</b><br>Texts, questions, cases and games on this site were written for Deal Drills. Please do not copy them without permission.</p>',
  '<p><b>Urheberrecht</b><br>Texte, Fragen, Fälle und Spiele auf dieser Seite wurden für Deal Drills geschrieben. Bitte nicht ohne Erlaubnis kopieren.</p>');

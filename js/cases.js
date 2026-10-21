/* Case stories: a deal told chapter by chapter, with a decision or calculation in each chapter.
   Numbers follow the Muster AG example on the Topics page. Add more cases to CASES. */
var V=$('#view');
// Small balance sheet shown after each booking in the balance sheet case
function bilBS(cash,ppe,inv,ar,ap,loan,eq){
  function row(a,b){return '<tr><td>'+a[0]+'</td><td class="n">'+f(a[1],0)+'</td><td>'+(b?b[0]:'')+'</td><td class="n">'+(b?f(b[1],0):'')+'</td></tr>';}
  var A=[[L('PP&E','Sachanlagen'),ppe],[L('Inventory','Vorräte'),inv],[L('Receivables','Forderungen'),ar],[L('Cash','Kasse'),cash]];
  var P=[[L('Equity','Eigenkapital'),eq],[L('Bank loan','Bankdarlehen'),loan],[L('Trade payables','Verbindl. L+L'),ap]];
  return '<div class="dochead">'+L('Balance sheet (€k)','Bilanz (T€)')+'</div><div class="tw"><table><tr><th>'+L('Assets','Aktiva')+'</th><th></th><th>'+L('Liabilities & equity','Passiva')+'</th><th></th></tr>'+
    A.map(function(a,i){return row(a,P[i]);}).join('')+'<tr><td><b>'+L('Total','Summe')+'</b></td><td class="n"><b>'+f(cash+ppe+inv+ar,0)+'</b></td><td><b>'+L('Total','Summe')+'</b></td><td class="n"><b>'+f(eq+loan+ap,0)+'</b></td></tr></table></div>';
}

var CASES=[
 {id:'muster',title:L('Project Orion: a public takeover in Germany','Projekt Muster: eine Übernahme in Deutschland'),
  intro:L('Atlas SE, a listed industrial group, wants to buy Orion AG, a listed competitor. You are in Atlas SE’s corporate M&A team. Ten chapters, from the strategic case to the squeeze-out.','Die börsennotierte Industriegruppe Käufer SE will den börsennotierten Wettbewerber Muster AG übernehmen. Du bist im Corporate-M&A-Team von Käufer SE. Zehn Kapitel, vom strategischen Rational bis zum Squeeze-out.'),
  facts:L('Orion AG: revenue €500m · EBITDA 120 · net income 67.5 · debt 140 · cash 72.5 · 45m shares at €16.00. Atlas SE: net income 300 · 100m shares at €45 (P/E 15×) · tax rate 25%.','Muster AG: Umsatz 500 Mio. € · EBITDA 120 · Jahresüberschuss 67,5 · Schulden 140 · Kasse 72,5 · 45 Mio. Aktien zu 16,00 €. Käufer SE: Jahresüberschuss 300 · 100 Mio. Aktien zu 45 € (KGV 15×) · Steuersatz 25 %.'),
  chapters:[
   {t:L('Strategy','Strategie'),topic:'m5',type:'mc',
    story:L('The board asks why Orion AG. Both companies run plants in the same regions and buy from the same suppliers.','Der Vorstand fragt: Warum Muster AG? Beide betreiben Werke in denselben Regionen und kaufen bei denselben Lieferanten ein.'),
    q:L('Which argument carries the deal best?','Welches Argument trägt den Deal am besten?'),
    opts:[L('Cost synergies from overlapping plants and joint purchasing','Kostensynergien aus überlappenden Werken und gemeinsamem Einkauf'),L('Diversification for our shareholders','Diversifikation für unsere Aktionäre'),L('The deal raises our earnings per share','Der Deal erhöht unseren Gewinn je Aktie'),L('A bigger group is a safer group','Eine größere Gruppe ist eine sicherere Gruppe')],ans:0,
    explain:L('Value is created only if the two are worth more together. Cost synergies are concrete and believed by investors. Shareholders can diversify themselves for free, EPS accretion is arithmetic, not value, and size alone is empire building.','Wert entsteht nur, wenn beide zusammen mehr wert sind. Kostensynergien sind konkret und werden vom Markt geglaubt. Aktionäre können selbst diversifizieren, EPS-Accretion ist Arithmetik, kein Wert, und Größe allein ist Empire Building.')},
   {t:L('Valuation','Bewertung'),topic:'m3',type:'num',unit:'€',tol:0.15,ans:17.17,
    story:L('Listed peers trade at a median of 7.0× EV/EBITDA. Orion AG has EBITDA of 120 and net debt of 67.5 (debt 140 minus cash 72.5).','Börsennotierte Peers notieren im Median bei 7,0× EV/EBITDA. Muster AG hat ein EBITDA von 120 und eine Nettoverschuldung von 67,5 (Schulden 140 minus Kasse 72,5).'),
    q:L('What is Orion AG worth per share on trading comps?','Was ist Muster AG laut Trading Comps je Aktie wert?'),
    explain:L('EV = 7.0 × 120 = 840. Equity = 840 − 67.5 = 772.5. Per share = 772.5 ÷ 45m ≈ €17.17. This is a minority value without a control premium.','EV = 7,0 × 120 = 840. Equity = 840 − 67,5 = 772,5. Je Aktie = 772,5 ÷ 45 Mio. ≈ 17,17 €. Das ist ein Minderheitswert ohne Kontrollprämie.')},
   {t:L('The offer','Das Angebot'),topic:'m6',type:'num',unit:'%',tol:0.5,ans:25,
    story:L('The undisturbed share price is €16.00. The board approves an offer of €20.00 per share.','Der unbeeinflusste Aktienkurs liegt bei 16,00 €. Der Vorstand genehmigt ein Angebot von 20,00 € je Aktie.'),
    q:L('What premium does the offer pay?','Welche Prämie zahlt das Angebot?'),
    explain:L('20 ÷ 16 − 1 = 25%. Equity price 45m × €20 = 900; EV 900 + 140 − 72.5 = 967.5, about 8.1× EBITDA.','20 ÷ 16 − 1 = 25 %. Kaufpreis Equity 45 Mio. × 20 € = 900; EV 900 + 140 − 72,5 = 967,5, etwa 8,1× EBITDA.')},
   {t:L('Takeover law','Übernahmerecht'),topic:'m9',type:'mc',
    story:L('Atlas SE already holds 4.9% of Orion AG and wants control.','Käufer SE hält bereits 4,9 % an der Muster AG und will die Kontrolle.'),
    q:L('From which threshold must Atlas SE make an offer to all shareholders?','Ab welcher Schwelle muss Käufer SE allen Aktionären ein Angebot machen?'),
    opts:['25%','30%','50%','75%'],ans:1,
    explain:L('Under the WpÜG, control means 30% of the voting rights. Crossing it triggers a mandatory offer to all shareholders (§§ 29, 35 WpÜG). A voluntary takeover offer aimed at control follows the same price rules.','Nach dem WpÜG bedeutet Kontrolle 30 % der Stimmrechte. Wer sie überschreitet, muss allen Aktionären ein Pflichtangebot machen (§§ 29, 35 WpÜG). Ein freiwilliges Übernahmeangebot folgt denselben Preisregeln.')},
   {t:L('Minimum price','Mindestpreis'),topic:'m9',type:'num',unit:'€',tol:0.01,ans:17.5,
    story:L('The 3-month volume-weighted average price before announcement is €15.80. In the last 6 months Atlas SE bought shares on the market at up to €17.50.','Der volumengewichtete 3-Monats-Durchschnittskurs vor Ankündigung liegt bei 15,80 €. In den letzten 6 Monaten hat Käufer SE Aktien an der Börse zu höchstens 17,50 € gekauft.'),
    q:L('What is the legal minimum price per share for the offer?','Was ist der gesetzliche Mindestpreis je Aktie für das Angebot?'),
    explain:L('The offer must be at least the higher of the 3-month VWAP (€15.80) and the highest price the bidder paid in the prior 6 months (€17.50): €17.50. The €20 offer clears it.','Das Angebot muss mindestens dem höheren Wert aus 3-Monats-Durchschnittskurs (15,80 €) und höchstem vom Bieter in den 6 Monaten davor gezahlten Preis (17,50 €) entsprechen: 17,50 €. Das Angebot von 20 € liegt darüber.')},
   {t:L('Financing','Finanzierung'),topic:'m6',type:'mc',
    story:L('Atlas SE pays the 900 half in new shares (its P/E is 15×) and half with new debt at 6%. Tax rate 25%.','Käufer SE zahlt die 900 zur Hälfte in neuen Aktien (KGV 15×) und zur Hälfte mit neuen Schulden zu 6 %. Steuersatz 25 %.'),
    q:L('Before synergies, is the deal accretive or dilutive to Atlas SE’s EPS?','Ist der Deal vor Synergien accretive oder dilutive für das EPS von Käufer SE?'),
    opts:['Accretive','Dilutive',L('Exactly neutral','Genau neutral')],ans:0,
    explain:L('Target earnings yield at the price paid: 67.5 ÷ 900 = 7.5%. Cost of funds: 50% × 1/15 (6.67%) + 50% × 6% × 0.75 (4.5%) = 5.58%. Yield above cost → accretive.','Gewinnrendite des Targets zum Kaufpreis: 67,5 ÷ 900 = 7,5 %. Finanzierungskosten: 50 % × 1/15 (6,67 %) + 50 % × 6 % × 0,75 (4,5 %) = 5,58 %. Rendite über Kosten → accretive.')},
   {t:L('Pro forma EPS','Pro-forma-EPS'),topic:'m6',type:'num',unit:'€',tol:0.02,ans:3.157,
    story:L('Standalone EPS of Atlas SE is €3.00. New shares are issued at €45.','Das EPS von Käufer SE allein liegt bei 3,00 €. Neue Aktien werden zu 45 € ausgegeben.'),
    q:L('What is the pro forma EPS (before synergies)?','Wie hoch ist das Pro-forma-EPS (vor Synergien)?'),
    explain:L('New shares 450 ÷ 45 = 10m. After-tax interest 450 × 6% × 0.75 = 20.25. Net income 300 + 67.5 − 20.25 = 347.25 ÷ 110m = €3.16, about 5.2% accretive.','Neue Aktien 450 ÷ 45 = 10 Mio. Zinsen nach Steuern 450 × 6 % × 0,75 = 20,25. Jahresüberschuss 300 + 67,5 − 20,25 = 347,25 ÷ 110 Mio. = 3,16 €, etwa 5,2 % accretive.')},
   {t:L('Value created','Wertschaffung'),topic:'m5',type:'num',unit:L('€m','Mio. €'),tol:1.5,ans:101.25,
    story:L('Integration planning finds cost synergies of 30 a year before tax. Capitalise them as a perpetuity at 8%. The premium paid is 900 − 720 = 180.','Die Integrationsplanung findet Kostensynergien von 30 pro Jahr vor Steuern. Kapitalisiere sie als ewige Rente mit 8 %. Die gezahlte Prämie ist 900 − 720 = 180.'),
    q:L('How much value does the deal create for Atlas SE’s shareholders?','Wie viel Wert schafft der Deal für die Aktionäre von Käufer SE?'),
    explain:L('After-tax synergies 30 × 0.75 = 22.5 ÷ 8% ≈ 281. Minus the premium 180 = about 101. If only half the synergies arrive (≈141), the buyer destroys value although the deal is accretive.','Synergien nach Steuern 30 × 0,75 = 22,5 ÷ 8 % ≈ 281. Minus Prämie 180 = etwa 101. Kommen nur die halben Synergien (≈141), vernichtet der Käufer Wert, obwohl der Deal accretive ist.')},
   {t:L('Due diligence and contract','Due Diligence und Vertrag'),topic:'m8',type:'mc',
    story:L('Before signing an agreement with Orion AG’s anchor shareholder, due diligence finds a specific tax exposure of €15m from earlier years.','Vor der Vereinbarung mit dem Ankeraktionär der Muster AG findet die Due Diligence ein konkretes Steuerrisiko von 15 Mio. € aus Vorjahren.'),
    q:L('How do you protect Atlas SE against this known risk?','Wie schützt du Käufer SE gegen dieses bekannte Risiko?'),
    opts:[L('An indemnity (Freistellung) covering it euro for euro','Eine Freistellung, die es euro für euro abdeckt'),L('A general warranty (Garantie)','Eine allgemeine Garantie'),L('A MAC clause','Eine MAC-Klausel'),L('Nothing: it is in the price already','Nichts: es ist schon im Preis')],ans:0,
    explain:L('Warranties cover unknown problems and come with caps and baskets. A known, quantified risk is handled with a specific indemnity or a price cut. A MAC clause is for unforeseen events between signing and closing and is rarely enforced.','Garantien decken unbekannte Probleme ab und haben Caps und Freibeträge. Ein bekanntes, beziffertes Risiko löst man mit einer Freistellung oder einem Preisabschlag. Eine MAC-Klausel gilt für unvorhergesehene Ereignisse zwischen Signing und Closing und wird selten durchgesetzt.')},
   {t:L('Squeeze-out','Squeeze-out'),topic:'m9',type:'mc',
    story:L('After the acceptance periods Atlas SE holds 92% of Orion AG and wants 100% to delist and integrate.','Nach den Annahmefristen hält Käufer SE 92 % der Muster AG und will 100 %, um zu delisten und zu integrieren.'),
    q:L('Which route gets Atlas SE to 100%?','Welcher Weg bringt Käufer SE auf 100 %?'),
    opts:[L('Squeeze-out under stock corporation law (§ 327a AktG)','Aktienrechtlicher Squeeze-out (§ 327a AktG)'),L('Merger squeeze-out (§ 62 (5) UmwG) together with merging Orion AG into Atlas SE','Verschmelzungsrechtlicher Squeeze-out (§ 62 Abs. 5 UmwG) zusammen mit der Verschmelzung der Muster AG auf Käufer SE'),L('A domination agreement','Ein Beherrschungsvertrag'),L('A second mandatory offer','Ein zweites Pflichtangebot')],ans:1,
    explain:L('The stock-corporation squeeze-out needs 95%. From 90%, a parent AG or SE can squeeze out minorities in connection with a merger (§ 62 (5) UmwG). A domination agreement (from 75%) gives control, not 100%. Minorities can challenge the cash price in appraisal proceedings (Spruchverfahren), not the exit.','Der aktienrechtliche Squeeze-out braucht 95 %. Ab 90 % kann eine Mutter-AG oder -SE die Minderheit im Zusammenhang mit einer Verschmelzung ausschließen (§ 62 Abs. 5 UmwG). Ein Beherrschungsvertrag (ab 75 %) gibt Kontrolle, nicht 100 %. Minderheitsaktionäre können die Abfindung im Spruchverfahren prüfen lassen, nicht den Ausschluss.')}
  ]}
 ,
 {id:'falke',level:L('Hard','Schwer'),title:L('Project Falcon: a buy-side auction','Projekt Falke: eine Buy-side-Auktion'),
  intro:L('You work in the corporate M&A team of North Star Packaging AG. A sell-side adviser sends a teaser. Ten decisions from teaser to signing, with a CIM excerpt, adjusted EBITDA, leakage and merger control.','Du arbeitest im Corporate-M&A-Team der Nordstern Packaging AG. Ein Sell-side-Berater schickt einen Teaser. Zehn Entscheidungen vom Teaser bis zum Signing, mit CIM-Auszug, bereinigtem EBITDA, Leakage und Fusionskontrolle.'),
  facts:L('North Star Packaging AG (buyer): revenue €480m worldwide, €210m in Germany. Target: “Project Falcon”, a family-owned packaging maker in southern Germany. All companies are invented.','Nordstern Packaging AG (Käufer): Umsatz 480 Mio. € weltweit, 210 Mio. € in Deutschland. Target: „Projekt Falke“, ein familiengeführter Verpackungshersteller in Süddeutschland. Alle Firmen sind erfunden.'),
  chapters:[
   {t:L('The teaser','Der Teaser'),topic:'m8',type:'mc',
    story:L('A two-page teaser arrives from an M&A boutique.','Ein zweiseitiger Teaser einer M&A-Boutique kommt an.'),
    doc:'<div class="dochead">'+L('Teaser · strictly confidential','Teaser · streng vertraulich')+'</div><b>'+L('Project Falcon','Projekt Falke')+'</b><ul><li>'+L('Leading maker of sustainable industrial packaging in southern Germany','Führender Hersteller nachhaltiger Industrieverpackungen in Süddeutschland')+'</li><li>'+L('Revenue 2025: €142m · adjusted EBITDA: €30.0m · 650 employees','Umsatz 2025: 142 Mio. € · bereinigtes EBITDA: 30,0 Mio. € · 650 Mitarbeitende')+'</li><li>'+L('Owner family seeks a succession solution; 100% for sale','Inhaberfamilie sucht eine Nachfolgelösung; 100 % stehen zum Verkauf')+'</li><li>'+L('Limited auction; non-binding offers in six weeks','Beschränkte Auktion; indikative Angebote in sechs Wochen')+'</li></ul>',
    q:L('What do you do next?','Was machst du als Nächstes?'),
    opts:[L('Sign the NDA and request the information memorandum','NDA unterschreiben und das Informationsmemorandum anfordern'),L('Call the owner directly to skip the adviser','Den Inhaber direkt anrufen und den Berater umgehen'),L('Send a binding offer to get ahead of the others','Ein bindendes Angebot schicken, um vorne zu liegen'),L('Hire due diligence advisers straight away','Sofort Due-Diligence-Berater beauftragen')],ans:0,
    explain:L('The teaser is anonymous. You sign the NDA, get the name and the IM, and decide whether to bid. Going around the adviser usually breaches the process (and later the NDA), a binding offer without information is impossible, and paying advisers comes after round 1.','Der Teaser ist anonym. Du unterschreibst das NDA, bekommst Namen und IM und entscheidest dann, ob du bietest. Den Berater zu umgehen verletzt meist den Prozess (später auch das NDA), ein bindendes Angebot ohne Informationen ist unmöglich, und Berater kosten erst nach Runde 1 Geld.')},
   {t:L('Reading the CIM','Das CIM lesen'),topic:'m8',type:'num',unit:L('€m','Mio. €'),tol:0.05,ans:26,
    story:L('The CIM shows how the seller gets to €30.0m.','Das CIM zeigt, wie der Verkäufer auf 30,0 Mio. € kommt.'),
    doc:'<div class="dochead">'+L('Information memorandum · excerpt','Informationsmemorandum · Auszug')+'</div><div class="tw"><table><tr><th>€m</th><th class="n">2023</th><th class="n">2024</th><th class="n">2025</th></tr><tr><td>'+L('Reported EBITDA','EBITDA laut Abschluss')+'</td><td class="n">21.5</td><td class="n">22.8</td><td class="n">24.0</td></tr><tr><td>+ '+L('One-off settlement of a patent dispute','Einmaliger Vergleich in einem Patentstreit')+'</td><td class="n">–</td><td class="n">–</td><td class="n">2.0</td></tr><tr><td>+ '+L('Restructuring costs','Restrukturierungskosten')+'</td><td class="n">1.8</td><td class="n">2.1</td><td class="n">2.2</td></tr><tr><td>+ '+L('Full-year effect of price increase from Jan 2026','Ganzjahreseffekt der Preiserhöhung ab Jan. 2026')+'</td><td class="n">–</td><td class="n">–</td><td class="n">1.8</td></tr><tr><td><b>'+L('Adjusted EBITDA (seller)','Bereinigtes EBITDA (Verkäufer)')+'</b></td><td class="n">23.3</td><td class="n">24.9</td><td class="n"><b>30.0</b></td></tr></table></div>',
    q:L('Which 2025 EBITDA do you underwrite?','Mit welchem EBITDA 2025 rechnest du?'),
    explain:L('Accept only the genuine one-off: 24.0 + 2.0 = 26.0. “Restructuring” that appears every year is an operating cost. A price increase that has not happened yet is a forecast, not 2025 earnings. Quality of earnings is exactly this exercise.','Akzeptiere nur den echten Einmaleffekt: 24,0 + 2,0 = 26,0. „Restrukturierung“, die jedes Jahr auftaucht, ist laufender Aufwand. Eine Preiserhöhung, die noch nicht passiert ist, ist eine Prognose, kein Ergebnis 2025. Genau das ist eine Quality-of-Earnings-Analyse.')},
   {t:L('Indicative value','Indikativer Wert'),topic:'m2',type:'num',unit:L('€m','Mio. €'),tol:0.5,ans:175,
    story:L('Listed packaging peers trade at 8.0–9.0× EV/EBITDA. Falcon has financial debt of 55, cash of 15 and an unfunded pension obligation of 6.','Börsennotierte Verpackungs-Peers notieren bei 8,0–9,0× EV/EBITDA. Falke hat Finanzschulden von 55, Kasse von 15 und ungedeckte Pensionsverpflichtungen von 6.'),
    q:L('Equity value at the midpoint of 8.5× on your EBITDA?','Equity Value beim Mittelwert 8,5× auf dein EBITDA?'),
    explain:L('EV = 8.5 × 26.0 = 221. Net debt 55 − 15 = 40; pensions are debt-like: 221 − 40 − 6 = 175. On the seller’s 30.0 you would have offered 255 − 46 = 209: the add-backs were worth 34 to the seller.','EV = 8,5 × 26,0 = 221. Nettoverschuldung 55 − 15 = 40; Pensionen sind schuldenähnlich: 221 − 40 − 6 = 175. Auf die 30,0 des Verkäufers hättest du 255 − 46 = 209 geboten: die Bereinigungen waren dem Verkäufer 34 wert.')},
   {t:L('The non-binding offer','Das indikative Angebot'),topic:'m8',type:'mc',
    story:L('The process letter asks for non-binding offers in two weeks.','Der Process Letter verlangt indikative Angebote in zwei Wochen.'),
    q:L('What belongs in your non-binding offer?','Was gehört in dein indikatives Angebot?'),
    opts:[L('An EV range on a cash-free, debt-free basis, key assumptions, financing, approvals needed, due diligence scope','Eine EV-Spanne auf Cash-free-/Debt-free-Basis, wichtigste Annahmen, Finanzierung, nötige Freigaben, Due-Diligence-Umfang'),L('A full mark-up of the SPA','Ein vollständiges SPA-Markup'),L('A single fixed equity price without conditions','Ein fester Equity-Preis ohne Bedingungen'),L('Your full integration plan','Deinen vollständigen Integrationsplan')],ans:0,
    explain:L('Round 1 is about price indication and credibility: EV range, how you got there, how you pay, what approvals you need and what you still have to check. The SPA mark-up comes with the binding offer in round 2.','In Runde 1 geht es um Preisindikation und Glaubwürdigkeit: EV-Spanne, wie du darauf kommst, wie du zahlst, welche Freigaben du brauchst und was du noch prüfen musst. Das SPA-Markup kommt mit dem bindenden Angebot in Runde 2.')},
   {t:L('Data room finding','Fund im Datenraum'),topic:'m8',type:'mc',
    story:L('In round 2 you find that the largest customer brings 34% of revenue, and its contract lets it terminate on a change of control.','In Runde 2 findest du: Der größte Kunde bringt 34 % des Umsatzes, und sein Vertrag erlaubt eine Kündigung bei Kontrollwechsel.'),
    q:L('How do you deal with it?','Wie gehst du damit um?'),
    opts:[L('Walk away at once','Sofort aussteigen'),L('Ignore it: the relationship is decades old','Ignorieren: die Beziehung besteht seit Jahrzehnten'),L('Make the customer’s waiver a condition, or protect yourself through price or an earn-out','Den Verzicht des Kunden zur Bedingung machen oder dich über Preis oder Earn-out absichern'),L('Cut the price by 34%','Den Preis um 34 % senken')],ans:2,
    explain:L('A due diligence finding goes into price, contract protection or a walk-away. Here the usual answer is protection: the customer’s consent or waiver as a closing condition, or a structure that shares the risk. Walking away or a blanket 34% cut overreacts; ignoring it is negligent.','Ein Due-Diligence-Fund fließt in Preis, Vertragsschutz oder Abbruch. Üblich ist hier Schutz: Zustimmung oder Verzicht des Kunden als Vollzugsbedingung oder eine Struktur, die das Risiko teilt. Aussteigen oder pauschal 34 % weniger ist überzogen; ignorieren ist fahrlässig.')},
   {t:L('Locked box','Locked Box'),topic:'m8',type:'mc',
    story:L('The seller proposes a locked box as of 31 December 2025; closing is expected in July 2026. The draft SPA shows the owner charging Falcon a €1.5m “management fee” in March 2026.','Der Verkäufer schlägt eine Locked Box zum 31. Dezember 2025 vor; Closing ist für Juli 2026 geplant. Laut SPA-Entwurf stellt der Inhaber Falke im März 2026 eine „Management Fee“ von 1,5 Mio. € in Rechnung.'),
    q:L('What is the fee, and what happens to it?','Was ist die Gebühr, und was passiert damit?'),
    opts:[L('Leakage: unless agreed as permitted leakage, the seller repays it euro for euro','Leakage: wenn nicht als erlaubt vereinbart, zahlt der Verkäufer sie euro für euro zurück'),L('Normal business: nothing happens','Normales Geschäft: nichts passiert'),L('It is corrected through closing accounts','Sie wird über die Closing Accounts korrigiert'),L('It reduces the warranty cap','Sie senkt den Garantie-Cap')],ans:0,
    explain:L('In a locked box the price is fixed at the box date, so value flowing to the seller afterwards (dividends, fees, waived claims) is leakage. The SPA lists permitted leakage; anything else the seller pays back. Closing accounts are the alternative mechanism, not part of a locked box.','Bei einer Locked Box ist der Preis zum Stichtag fix; Wert, der danach an den Verkäufer fließt (Dividenden, Gebühren, erlassene Forderungen), ist Leakage. Der SPA listet erlaubtes Leakage; alles andere zahlt der Verkäufer zurück. Closing Accounts sind der alternative Mechanismus, nicht Teil der Locked Box.')},
   {t:L('Closing accounts instead','Stattdessen Closing Accounts'),topic:'m8',type:'num',unit:L('€m','Mio. €'),tol:0.5,ans:173,
    story:L('A rival bidder offers closing accounts, so you match it. Agreed EV 221. At closing: net debt 38, pension deficit 6, working capital 24 against an agreed normal level (peg) of 28.','Ein Konkurrent bietet Closing Accounts an, also ziehst du nach. Vereinbarter EV 221. Beim Closing: Nettoverschuldung 38, Pensionsdefizit 6, Working Capital 24 bei vereinbartem Normalwert (Peg) von 28.'),
    q:L('What equity price do you pay at closing?','Welchen Equity-Preis zahlst du beim Closing?'),
    explain:L('221 − 38 − 6 + (24 − 28) = 173. The working capital shortfall of 4 is deducted, so the seller gains nothing by squeezing working capital to show more cash.','221 − 38 − 6 + (24 − 28) = 173. Das fehlende Working Capital von 4 wird abgezogen; der Verkäufer gewinnt also nichts, wenn er Working Capital abbaut, um mehr Cash zu zeigen.')},
   {t:L('Merger control','Fusionskontrolle'),topic:'m9',type:'mc',
    story:L('North Star: revenue €480m worldwide, €210m in Germany. Falcon: €142m worldwide, €95m in Germany.','Nordstern: 480 Mio. € Umsatz weltweit, 210 Mio. € in Deutschland. Falke: 142 Mio. € weltweit, 95 Mio. € in Deutschland.'),
    q:L('Which filing do you need?','Welche Anmeldung brauchst du?'),
    opts:[L('None','Keine'),L('Bundeskartellamt (German merger control)','Bundeskartellamt (deutsche Fusionskontrolle)'),L('European Commission','EU-Kommission'),L('Only a foreign investment review','Nur eine Investitionsprüfung')],ans:1,
    explain:L('German thresholds: combined worldwide revenue above €500m (622), one party above €50m in Germany (210) and another above €17.5m (95). All met. EU thresholds (€5bn worldwide) are far away. A German buyer of a German target needs no foreign investment review.','Deutsche Schwellen: gemeinsamer Weltumsatz über 500 Mio. € (622), ein Beteiligter über 50 Mio. € in Deutschland (210) und ein anderer über 17,5 Mio. € (95). Alle erfüllt. Die EU-Schwellen (5 Mrd. € weltweit) sind weit weg. Ein deutscher Käufer eines deutschen Targets braucht keine Investitionsprüfung.')},
   {t:L('W&I insurance','W&I-Versicherung'),topic:'m8',type:'mc',
    story:L('The family wants a clean exit and offers only a €1 warranty cap, backed by W&I insurance.','Die Familie will einen sauberen Exit und bietet nur einen Garantie-Cap von 1 €, abgesichert durch eine W&I-Versicherung.'),
    q:L('What does the W&I policy cover?','Was deckt die W&I-Police ab?'),
    opts:[L('Unknown breaches of the warranties, paid by the insurer to the buyer','Unbekannte Garantieverletzungen, die der Versicherer dem Käufer zahlt'),L('Known risks found in due diligence','In der Due Diligence gefundene, bekannte Risiken'),L('A fall in EBITDA after closing','Einen EBITDA-Rückgang nach dem Closing'),L('The customer terminating on change of control','Die Kündigung des Kunden bei Kontrollwechsel')],ans:0,
    explain:L('W&I insures breaches of warranties that nobody knew about at signing. Known issues (such as the customer contract) are excluded and need indemnities, price or conditions. Business performance is never insured.','W&I versichert Garantieverletzungen, die beim Signing niemand kannte. Bekannte Themen (etwa der Kundenvertrag) sind ausgeschlossen und brauchen Freistellungen, Preis oder Bedingungen. Geschäftsentwicklung ist nie versichert.')},
   {t:L('Before the binding offer','Vor dem bindenden Angebot'),topic:'m12',type:'mc',
    story:L('Final bids are due on Friday.','Bindende Angebote sind am Freitag fällig.'),
    q:L('What must be in place before you submit?','Was muss vor der Abgabe stehen?'),
    opts:[L('Board approval of the maximum price and the financing','Gremienbeschluss über Maximalpreis und Finanzierung'),L('Merger control clearance','Die kartellrechtliche Freigabe'),L('The signed SPA','Der unterschriebene SPA'),L('Day-1 integration in place','Die Day-1-Integration steht')],ans:0,
    explain:L('A binding offer commits the company, so the board (and often the supervisory board) must approve the price ceiling and the financing first. Clearances come between signing and closing; integration starts after closing.','Ein bindendes Angebot verpflichtet das Unternehmen, also müssen Vorstand (und oft Aufsichtsrat) vorher Preisobergrenze und Finanzierung genehmigen. Freigaben kommen zwischen Signing und Closing; die Integration beginnt nach dem Closing.')}
  ]},
 {id:'bilanz',level:L('Hard','Schwer'),title:L('Balance sheet marathon','Bilanz-Marathon'),
  intro:L('Nine bookings in one young company, from the first machine to impairment, supplier payments and loan repayment. At the end you rebuild the balance sheet from memory.','Neun Buchungen in einem jungen Unternehmen, von der ersten Maschine über Wertminderung und Lieferantenzahlungen bis zur Tilgung. Am Ende baust du die Bilanz aus dem Kopf auf.'),
  facts:L('NewCo GmbH starts with €100k cash paid in by the founder (equity 100). Amounts in €k. Ignore taxes. Keep track yourself: the balance sheet is only shown after each answer.','Die Neu GmbH startet mit 100 T€ Bareinlage der Gründerin (Eigenkapital 100). Beträge in T€. Steuern ignorieren. Führe selbst Buch: die Bilanz erscheint nur nach jeder Antwort.'),
  chapters:[
   {t:L('1 · The machine','1 · Die Maschine'),topic:'m6',type:'mc',
    story:L('NewCo GmbH buys a machine for 60, paid in cash.','Die Neu GmbH kauft eine Maschine für 60, bar bezahlt.'),
    q:L('What happens to the balance sheet?','Was passiert mit der Bilanz?'),
    opts:[L('Asset swap: cash −60, PP&E +60, total unchanged','Aktivtausch: Kasse −60, Sachanlagen +60, Summe unverändert'),L('Balance sheet extension: total +60','Bilanzverlängerung: Summe +60'),L('Equity −60 because of the expense','Eigenkapital −60 wegen des Aufwands'),L('Balance sheet contraction: total −60','Bilanzverkürzung: Summe −60')],ans:0,
    explain:L('Capex is not an expense. One asset (cash) becomes another (machine); the income statement is untouched until depreciation.','Capex ist kein Aufwand. Ein Aktivum (Kasse) wird zu einem anderen (Maschine); die GuV bleibt bis zur Abschreibung unberührt.'),
    after:bilBS(40,60,0,0,0,0,100)},
   {t:L('2 · The loan','2 · Der Kredit'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:80,
    story:L('The bank lends 40.','Die Bank gibt einen Kredit über 40.'),
    q:L('Cash now?','Kasse jetzt?'),
    explain:L('40 + 40 = 80. Cash up, debt up: balance sheet extension, no income statement effect.','40 + 40 = 80. Kasse hoch, Schulden hoch: Bilanzverlängerung, keine GuV-Wirkung.'),
    after:bilBS(80,60,0,0,0,40,100)},
   {t:L('3 · Inventory on credit','3 · Ware auf Ziel'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:170,
    story:L('It buys inventory for 30 from a supplier, payable in 60 days.','Sie kauft Ware für 30 bei einem Lieferanten, zahlbar in 60 Tagen.'),
    q:L('Total assets now?','Bilanzsumme jetzt?'),
    explain:L('140 + 30 = 170. Inventory +30, trade payables +30; no cash moves.','140 + 30 = 170. Vorräte +30, Verbindlichkeiten aus L+L +30; kein Cash fließt.'),
    after:bilBS(80,60,30,0,30,40,100)},
   {t:L('4 · The first sale','4 · Der erste Verkauf'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:20,
    story:L('All the inventory is sold for 50, on 30-day terms.','Die gesamte Ware wird für 50 verkauft, Zahlungsziel 30 Tage.'),
    q:L('Net income from this sale?','Jahresüberschuss aus diesem Verkauf?'),
    explain:L('Revenue 50 − cost of goods sold 30 = 20. Receivables +50, inventory −30, equity +20. Cash: still 80.','Umsatz 50 − Materialaufwand 30 = 20. Forderungen +50, Vorräte −30, Eigenkapital +20. Kasse: immer noch 80.'),
    after:bilBS(80,60,0,50,30,40,120)},
   {t:L('5 · Depreciation','5 · Abschreibung'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:48,
    story:L('Year-end. The machine has a useful life of 5 years, straight-line, no residual value.','Jahresende. Die Maschine hat eine Nutzungsdauer von 5 Jahren, linear, kein Restwert.'),
    q:L('Book value of the machine?','Buchwert der Maschine?'),
    explain:L('60 / 5 = 12 depreciation; 60 − 12 = 48. Equity falls by 12 to 108; cash does not move.','60 / 5 = 12 Abschreibung; 60 − 12 = 48. Das Eigenkapital sinkt um 12 auf 108; die Kasse bewegt sich nicht.'),
    after:bilBS(80,48,0,50,30,40,108)},
   {t:L('6 · Impairment','6 · Wertminderung'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:90,
    story:L('A new technology makes the machine less useful. Its recoverable amount is now 30.','Eine neue Technologie macht die Maschine weniger nützlich. Ihr erzielbarer Betrag liegt jetzt bei 30.'),
    q:L('Equity after the impairment?','Eigenkapital nach der Wertminderung?'),
    explain:L('Write-down 48 − 30 = 18, an expense: equity 108 − 18 = 90. Non-cash, so it is added back in the cash flow statement.','Abschreibung auf 48 − 30 = 18, ein Aufwand: Eigenkapital 108 − 18 = 90. Nicht zahlungswirksam, also in der Kapitalflussrechnung wieder addiert.'),
    after:bilBS(80,30,0,50,30,40,90)},
   {t:L('7 · Paying the supplier','7 · Lieferant bezahlen'),topic:'m6',type:'mc',
    story:L('The supplier invoice of 30 is paid.','Die Lieferantenrechnung über 30 wird bezahlt.'),
    q:L('Which statement is right?','Welche Aussage stimmt?'),
    opts:[L('Expenses rise by 30','Der Aufwand steigt um 30'),L('Cash −30, payables −30; operating cash flow −30, no income statement effect','Kasse −30, Verbindlichkeiten −30; operativer Cashflow −30, keine GuV-Wirkung'),L('Cash −30, equity −30','Kasse −30, Eigenkapital −30'),L('Nothing changes: it was already booked','Nichts ändert sich: es war schon gebucht')],ans:1,
    explain:L('The expense was booked when the goods were sold. Paying now is a balance sheet contraction and an operating cash outflow (working capital).','Der Aufwand wurde beim Verkauf gebucht. Die Zahlung ist eine Bilanzverkürzung und ein operativer Mittelabfluss (Working Capital).'),
    after:bilBS(50,30,0,50,0,40,90)},
   {t:L('8 · The customer pays','8 · Der Kunde zahlt'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:0,
    story:L('The customer pays the 50 it owes.','Der Kunde zahlt die offenen 50.'),
    q:L('By how much does net income change?','Um wie viel ändert sich der Jahresüberschuss?'),
    explain:L('Zero. The revenue was booked at the sale. Cash +50, receivables −50: an asset swap. Cash is now 100.','Null. Der Umsatz wurde beim Verkauf gebucht. Kasse +50, Forderungen −50: ein Aktivtausch. Die Kasse steht jetzt bei 100.'),
    after:bilBS(100,30,0,0,0,40,90)},
   {t:L('9 · Interest and repayment','9 · Zinsen und Tilgung'),topic:'m6',type:'num',unit:L('€k','T€'),tol:0.01,ans:88,
    story:L('NewCo GmbH pays 2 interest and repays 10 of the loan.','Die Neu GmbH zahlt 2 Zinsen und tilgt 10 des Kredits.'),
    q:L('Cash now?','Kasse jetzt?'),
    explain:L('100 − 2 − 10 = 88. Interest is an expense (equity −2); repayment only reduces the loan (financing cash flow).','100 − 2 − 10 = 88. Zinsen sind Aufwand (Eigenkapital −2); die Tilgung senkt nur den Kredit (Finanzierungs-Cashflow).')},
   {t:L('10 · The final balance sheet','10 · Die Schlussbilanz'),topic:'m6',type:'multi',tol:0.01,
    story:L('No more peeking. Rebuild the balance sheet after all nine bookings.','Kein Spicken mehr. Baue die Bilanz nach allen neun Buchungen auf.'),
    q:L('Enter every line item (€k; 0 if empty).','Gib jeden Bilanzposten an (T€; 0 wenn leer).'),
    fields:[[L('Cash','Kasse'),88],[L('PP&E (machine)','Sachanlagen (Maschine)'),30],[L('Inventory','Vorräte'),0],[L('Receivables','Forderungen'),0],[L('Trade payables','Verbindlichkeiten L+L'),0],[L('Bank loan','Bankdarlehen'),30],[L('Equity','Eigenkapital'),88]],
    explain:L('Assets 88 + 30 = 118 = loan 30 + equity 88. Net income for the year: 20 − 12 − 18 − 2 = −12, so equity 100 − 12 = 88. A profitable sale, but impairment turned the year into a loss, while cash ended above where it started after the machine purchase.','Aktiva 88 + 30 = 118 = Kredit 30 + Eigenkapital 88. Jahresergebnis: 20 − 12 − 18 − 2 = −12, also Eigenkapital 100 − 12 = 88. Ein profitabler Verkauf, aber die Wertminderung macht das Jahr zum Verlust, während die Kasse höher steht als direkt nach dem Maschinenkauf.'),
    after:bilBS(88,30,0,0,0,30,88)}
  ]}

];

function caseState(id){S.cases=S.cases||{};return S.cases[id]||null;}
function renderList(){
  history.replaceState(null,'','cases.html');
  V.innerHTML='<div class="eyebrow">'+L('Case stories','Fallgeschichten')+'</div><h2 style="margin:8px 0 6px">'+L('Play through a deal.','Spiel einen Deal durch.')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('A story in chapters. Each chapter asks for a decision or a calculation, then explains the answer.','Eine Geschichte in Kapiteln. Jedes Kapitel verlangt eine Entscheidung oder Rechnung und erklärt dann die Lösung.')+'</p>'+
   '<div class="grid g2" style="margin-top:18px">'+CASES.map(function(c){var st=caseState(c.id);
     return '<div class="panel sec"><span class="num">'+(c.level?esc(c.level)+' · ':'')+c.chapters.length+L(' chapters',' Kapitel')+(st?' · '+L('Best ','Bestwert ')+st.best+' / '+c.chapters.length:'')+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.intro)+'</p><div class="row" style="margin-top:auto;padding-top:10px"><button class="btn" data-c="'+c.id+'">'+(st?L('Play again','Nochmal spielen'):L('Start','Starten'))+'</button></div></div>';}).join('')+
   '<div class="panel sec" style="border-style:dashed"><span class="num">'+L('Coming next','Als Nächstes')+'</span><h3>'+L('Private equity buyout · carve-out · distressed sale','Private-Equity-Buyout · Carve-out · Distressed Sale')+'</h3><p>'+L('Tell us which case you want first with the Feedback button.','Sag uns über den Feedback-Button, welcher Fall zuerst kommen soll.')+'</p></div></div>';
  $$('[data-c]',V).forEach(function(b){b.onclick=function(){play(b.dataset.c);};});
}
function play(id){
  var c=CASES.filter(function(x){return x.id===id;})[0],st={i:0,score:0,log:[]};
  history.replaceState(null,'','cases.html?c='+id);
  var chapter=function(){var ch=c.chapters[st.i];
    V.innerHTML='<div class="term"><div class="termhead"><span>'+esc(c.title)+'</span><span>'+L('Chapter ','Kapitel ')+(st.i+1)+' / '+c.chapters.length+' · '+st.score+L(' points',' Punkte')+'</span><button class="btn ghost small" id="cq">'+L('Leave','Verlassen')+'</button></div>'+
     '<div class="bar2" style="margin-bottom:12px"><i style="width:'+(st.i/c.chapters.length*100)+'%"></i></div>'+
     (st.i===0?'<div class="notice" style="margin-bottom:12px">'+esc(c.facts)+'</div>':'')+
     '<div class="qcard" id="gc"><div class="qtopic">'+esc(ch.t)+'</div><p class="casestory">'+esc(ch.story)+'</p>'+(ch.doc?'<div class="casedoc">'+ch.doc+'</div>':'')+'<p class="qtext" style="font-weight:600;margin-bottom:14px">'+esc(ch.q)+'</p>'+
     (ch.type==='multi'?'<form id="cf" class="casemulti" autocomplete="off">'+ch.fields.map(function(fd,i){return '<label class="lf"><span>'+esc(fd[0])+'</span><input data-k="'+i+'" inputmode="decimal" placeholder="0"></label>';}).join('')+'<button class="btn" type="submit">'+L('Check','Prüfen')+'</button></form>':
     ch.type==='mc'?'<div class="caseopts">'+ch.opts.map(function(o,i){return '<button class="procbtn" data-o="'+i+'">'+esc(o)+'</button>';}).join('')+'</div>'
       :'<form class="ans" id="cf" autocomplete="off"><input id="cin" inputmode="decimal" aria-label="'+L('Your answer','Deine Antwort')+'" placeholder="'+L('Answer','Antwort')+'"><span class="unit">'+esc(ch.unit||'')+'</span><button class="btn" type="submit">'+L('Check','Prüfen')+'</button></form>')+
     '<div id="cout"></div></div>'+
     (st.i===0?'':'<details class="adrule"><summary class="muted">'+L('Case facts','Fakten zum Fall')+'</summary><p>'+esc(c.facts)+'</p></details>')+'</div>';
    $('#cq').onclick=renderList;
    var answer=function(ok,given){if($('#gc').dataset.done)return;$('#gc').dataset.done='1';if(ok)st.score++;
      var ansTxt=ch.type==='mc'?ch.opts[ch.ans]:ch.type==='multi'?ch.fields.map(function(fd){return fd[0]+' '+f(fd[1],2);}).join(' · '):f(ch.ans,2)+' '+(ch.unit||'');
      st.log.push({ok:ok,txt:esc(ch.t)+': '+esc(ch.q),you:given,ans:ansTxt,why:ch.explain});
      $('#cout').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?L('Correct.','Richtig.'):L('Not quite.','Nicht ganz.'))+'</b> '+(ch.type==='num'?L('Answer: ','Antwort: ')+'<b class="mono">'+f(ch.ans,2)+' '+esc(ch.unit||'')+'</b> · ':ch.type==='multi'?L('Answer: ','Antwort: ')+'<b class="mono">'+esc(ansTxt)+'</b><br>':'')+esc(ch.explain)+(ch.after?'<div class="casedoc" style="margin-top:10px">'+ch.after+'</div>':'')+
        '<div class="row" style="margin-top:10px"><button class="btn" id="cnext">'+(st.i+1<c.chapters.length?L('Next chapter','Nächstes Kapitel'):L('See result','Ergebnis ansehen'))+'</button><a class="btn ghost small" href="topics.html#'+ch.topic+'">'+L('Read the topic','Thema nachlesen')+' ('+ch.topic.toUpperCase()+')</a></div></div>';
      flash(ok);$('#cnext').focus();$('#cnext').onclick=function(){st.i++;if(st.i<c.chapters.length)chapter();else done();};};
    if(ch.type==='mc')$$('[data-o]',V).forEach(function(b){b.onclick=function(){var i=+b.dataset.o,ok=i===ch.ans;
      $$('[data-o]',V).forEach(function(x){x.disabled=true;if(+x.dataset.o===ch.ans)x.classList.add('good');else if(x===b)x.classList.add('bad');});answer(ok,ch.opts[i]);};});
    else if(ch.type==='multi'){$('#cf input').focus();$('#cf').onsubmit=function(e){e.preventDefault();var ok=true,given=[];
      $$('#cf input').forEach(function(inp){var fd=ch.fields[+inp.dataset.k],v=inp.value.trim()===''?[0]:parseNum(inp.value),good=v.some(function(x){return Math.abs(x-fd[1])<=(ch.tol||0.01);});
        if(!good)ok=false;inp.readOnly=true;inp.classList.add(good?'good':'bad');given.push(fd[0]+' '+(inp.value||'0'));});
      answer(ok,given.join(' · '));};}
    else{$('#cin').focus();$('#cf').onsubmit=function(e){e.preventDefault();var v=parseNum($('#cin').value);if(!v.length)return;
      var ok=v.some(function(x){return Math.abs(x-ch.ans)<=ch.tol;});$('#cin').readOnly=true;answer(ok,$('#cin').value+' '+(ch.unit||''));};}
  };
  var done=function(){
    var prev=caseState(c.id);S.cases[c.id]={best:Math.max(st.score,prev?prev.best:0),plays:(prev?prev.plays:0)+1};touchDay();save();
    var right=st.score,n=c.chapters.length;
    V.innerHTML='<div class="term"><div class="eyebrow">'+esc(c.title)+'</div><h2 style="margin:8px 0 8px">'+right+' / '+n+'</h2><p class="lead" style="margin-top:0">'+
      (right===n?L('Deal closed. Flawless.','Deal abgeschlossen. Fehlerfrei.'):right>=n*0.7?L('Deal closed. A few points to revisit.','Deal abgeschlossen. Ein paar Punkte zum Wiederholen.'):L('The deal needs more work. Read the topics behind the red chapters.','Der Deal braucht noch Arbeit. Lies die Themen hinter den roten Kapiteln nach.'))+'</p>'+
      '<div class="row" style="margin-top:14px"><button class="btn" id="cagain">'+L('Play again','Nochmal spielen')+'</button><button class="btn ghost" id="call">'+L('All cases','Alle Fälle')+'</button></div>'+callReview(st.log)+'</div>';
    $('#cagain').onclick=function(){play(c.id);};$('#call').onclick=renderList;
    if(right===n)celebrate(L('Flawless deal: every chapter right.','Fehlerfreier Deal: jedes Kapitel richtig.'));
  };
  chapter();
}
function callReview(log){
  var right=log.filter(function(x){return x.ok;}).length;
  return '<h3 style="margin:22px 0 10px">'+L('Your answers ','Deine Antworten ')+'<span class="muted" style="font-weight:500">'+right+L(' correct · ',' richtig · ')+(log.length-right)+L(' wrong',' falsch')+'</span></h3><div class="rvlist">'+
    log.map(function(x,i){return '<div class="rv '+(x.ok?'ok':'no')+' rvrow"><b>'+(x.ok?'✓':'✗')+' '+(i+1)+'.</b><span class="rvt">'+x.txt+'</span><span>'+(x.ok?esc(x.ans):L('You: ','Du: ')+esc(x.you)+' · <b>'+esc(x.ans)+'</b>')+'</span><span class="muted rvw">'+esc(x.why)+'</span></div>';}).join('')+'</div>';
}
function flash(ok){var gc=$('#gc');if(!gc)return;gc.classList.remove('flash-ok','flash-no');void gc.offsetWidth;gc.classList.add(ok?'flash-ok':'flash-no');}
var start=qs('c');
DD.ready.then(function(){if(document.body.getAttribute('data-page')!=='cases')return;if(start&&CASES.some(function(c){return c.id===start;}))play(start);else renderList();});

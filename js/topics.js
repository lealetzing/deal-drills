/* Topics page (Deal Map): accretion calculator, WACC calculator, glossary. Ported from the Deal Map artifact. */
(function(){
  function v(id){ return parseFloat(document.getElementById(id).value)||0; }
  function fx(x,d){ return isFinite(x)?x.toFixed(d):'–'; }
  function calc(){
    var bni=v('c-bni'), bsh=v('c-bsh'), bp=v('c-bp'), tni=v('c-tni'), pp=v('c-pp'), s=Math.min(100,Math.max(0,v('c-st')))/100, r=v('c-r')/100, t=v('c-t')/100, syn=v('c-syn');
    var newSh=bp>0? pp*s/bp : 0, debt=pp*(1-s), intAT=debt*r*(1-t);
    var ni=bni+tni-intAT+syn*(1-t), sh=bsh+newSh, eps0=bsh>0?bni/bsh:0, eps1=sh>0?ni/sh:0, acc=eps0?(eps1/eps0-1)*100:0;
    var need=eps0*sh-(bni+tni-intAT), be=need>0&&t<1? need/(1-t) : 0;
    var yld=pp>0? tni/pp*100 : 0, cost=(s*(bp>0&&bni>0? bni/bsh/bp : 0)+(1-s)*r*(1-t))*100;
    var col=acc>=0?'var(--ok)':'var(--trap)';
    document.getElementById('c-out').innerHTML=
      '<div><b>'+fx(eps0,2)+' → '+fx(eps1,2)+'</b><span>EPS standalone → pro forma</span></div>'+
      '<div><b style="color:'+col+'">'+(acc>=0?'+':'')+fx(acc,1)+'%</b><span>'+(acc>=0?'Accretive':'Dilutive')+'</span></div>'+
      '<div><b>'+fx(newSh,1)+'m</b><span>New shares · target holders own '+fx(sh?newSh/sh*100:0,1)+'%</span></div>'+
      '<div><b>'+fx(yld,1)+'% vs '+fx(cost,1)+'%</b><span>Target earnings yield vs blended after-tax cost</span></div>'+
      '<div><b>'+fx(be,1)+'</b><span>Pre-tax synergies needed to break even</span></div>';
  }
  document.querySelectorAll('.calc:not(.wcalc) input').forEach(function(i){ i.addEventListener('input',calc); });
  calc();

  var wIds=['rf','mrp','bu','dw','dp','t'], wDef={rf:3.0,mrp:5.5,bu:1.05,dw:40,dp:1.9,t:28};
  function wg(i){ return parseFloat(document.getElementById('w-'+i).value); }
  function wpc(x){ return x.toFixed(2).replace('.',',')+' %'; }
  function wset(i,s){ document.getElementById('w-'+i).textContent=s; }
  function wupd(){
    var rf=wg('rf'),mrp=wg('mrp'),bu=wg('bu'),dw=wg('dw')/100,dp=wg('dp'),t=wg('t')/100;
    var de=dw<1?dw/(1-dw):0, bl=bu*(1+(1-t)*de), crp=bl*mrp, ce=rf+crp, cd=(rf+dp)*(1-t), w=(1-dw)*ce+dw*cd;
    wset('vrf',wpc(rf)); wset('vmrp',wpc(mrp)); wset('vbu',bu.toFixed(2).replace('.',','));
    wset('vdw',Math.round(dw*100)+' %'); wset('vdp',wpc(dp)); wset('vt',Math.round(t*100)+' %');
    wset('obl',bl.toFixed(2).replace('.',',')); wset('ocrp',wpc(crp)); wset('oce',wpc(ce)); wset('ocd',wpc(cd)); wset('ow',wpc(w));
  }
  wIds.forEach(function(i){ document.getElementById('w-'+i).addEventListener('input',wupd); });
  document.getElementById('w-reset').addEventListener('click',function(){ wIds.forEach(function(i){ document.getElementById('w-'+i).value=wDef[i]; }); wupd(); });
  wupd();

  var G=[
  ['Mergers & acquisitions','Fusionen und Übernahmen / Unternehmenskäufe','Buying, selling and combining companies'],
  ['Income statement','Gewinn- und Verlustrechnung (GuV)','Revenue to net income for a period'],
  ['Balance sheet','Bilanz','Assets (Aktiva) vs. liabilities and equity (Passiva)'],
  ['Cash flow statement','Kapitalflussrechnung','Operating, investing, financing cash flows'],
  ['Revenue','Umsatzerlöse','Top line'],
  ['Net income','Jahresüberschuss / Konzernergebnis','Bottom line'],
  ['Depreciation & amortisation','Abschreibungen','Non-cash; on tangible (Sachanlagen) and intangible assets'],
  ['Impairment','Wertminderung / außerplanmäßige Abschreibung','Write-down when value falls below book'],
  ['Provisions','Rückstellungen','Uncertain obligations; pensions are debt-like'],
  ['Trade payables','Verbindlichkeiten aus Lieferungen und Leistungen','Working capital, not debt'],
  ['Receivables','Forderungen','Money customers owe'],
  ['Inventory','Vorräte','Raw materials to finished goods'],
  ['Net working capital','Nettoumlaufvermögen','Receivables + inventory − payables'],
  ['Retained earnings','Gewinnrücklagen','Accumulated profits not paid out'],
  ['Deferred taxes','Latente Steuern','Timing differences between book and tax'],
  ['Goodwill','Geschäfts- oder Firmenwert','Price paid above fair value of net assets'],
  ['Equity value','Eigenkapitalwert / Marktkapitalisierung','Value for shareholders'],
  ['Enterprise value','Unternehmenswert (Gesamtkapitalwert)','Value of operations for all investors'],
  ['Net debt','Nettoverschuldung','Financial debt minus cash'],
  ['Minority interest','Minderheitenanteile','Part of a consolidated subsidiary owned by others'],
  ['Dilution','Verwässerung','More shares, smaller slice each'],
  ['Valuation','Unternehmensbewertung','Estimating what a company is worth'],
  ['Multiple','Multiplikator','Price relative to an earnings figure'],
  ['Price/earnings ratio','Kurs-Gewinn-Verhältnis (KGV)','Share price ÷ EPS'],
  ['Comparable companies','Vergleichsunternehmen / Peer Group','Listed peers used for multiples'],
  ['Precedent transactions','Vergleichstransaktionen','Prices paid in past deals'],
  ['Discount rate','Diskontierungszins / Kapitalisierungszins','Return investors require'],
  ['Cost of equity / debt','Eigenkapitalkosten / Fremdkapitalkosten','Inputs to WACC'],
  ['Risk-free rate','Risikoloser Zins / Basiszins','Government bond yield'],
  ['Market risk premium','Marktrisikoprämie','Extra return for holding equities'],
  ['Terminal value','Endwert / Fortführungswert','Value beyond the forecast; ewige Rente = perpetuity'],
  ['Present value / NPV','Barwert / Kapitalwert','Future cash discounted to today'],
  ['Internal rate of return','Interner Zinsfuß','Discount rate at which NPV is zero'],
  ['Income approach (IDW S1)','Ertragswertverfahren','German standard valuation method'],
  ['Synergies','Synergien','Cost (Kostensynergien) and revenue (Umsatzsynergien)'],
  ['Control premium','Kontrollprämie / Übernahmeprämie','Paid above market price for control'],
  ['Accretive / dilutive','Gewinn je Aktie steigernd / verwässernd','Effect of a deal on the buyer\'s EPS'],
  ['Earnings per share','Ergebnis je Aktie','Net income ÷ shares'],
  ['Exchange ratio','Umtauschverhältnis','Buyer shares per target share'],
  ['Purchase price allocation','Kaufpreisallokation','Spreading the price over acquired assets'],
  ['Share deal / asset deal','Anteilskauf / Kauf von Vermögensgegenständen','Buy the entity or pick its assets'],
  ['Cash offer / exchange offer','Barangebot / Tauschangebot','Paying in cash or in shares'],
  ['Capital increase','Kapitalerhöhung','Issuing new shares'],
  ['Break fee','Break-up Fee / Vertragsstrafe bei Abbruch','Paid if the deal is terminated'],
  ['Merger arbitrage','Fusionsarbitrage','Trading the spread to the offer price'],
  ['Auction','Bieterverfahren','Structured sale to several bidders'],
  ['Confidentiality agreement','Vertraulichkeitsvereinbarung (NDA)','Signed before detailed information is shared'],
  ['Information memorandum','Informationsmemorandum','Detailed sale document'],
  ['Letter of intent','Absichtserklärung','Non-binding agreement on key terms'],
  ['Non-binding / binding offer','Indikatives / bindendes Angebot','Round 1 and round 2 bids'],
  ['Due diligence','Sorgfaltsprüfung','Checking the target before buying'],
  ['Data room','Datenraum','Where diligence documents are kept'],
  ['Share purchase agreement','Unternehmenskaufvertrag','The contract; in Germany GmbH shares need a notary'],
  ['Reps & warranties','Garantien','Seller\'s promises about the business'],
  ['Indemnity','Freistellung','Full compensation for a specific known risk'],
  ['Purchase price adjustment','Kaufpreisanpassung','Via closing accounts (Stichtagsbilanz)'],
  ['Vendor loan','Verkäuferdarlehen','Seller finances part of the price'],
  ['Signing / closing','Unterzeichnung / Vollzug','Contract signed / deal completed'],
  ['Closing conditions','Vollzugsbedingungen','Clearances needed before closing'],
  ['Material adverse change','Wesentliche nachteilige Änderung','Buyer\'s right to walk away'],
  ['Carve-out / spin-off','Ausgliederung / Abspaltung','Separating a division'],
  ['Post-merger integration','Integration nach dem Zusammenschluss','Where value is won or lost'],
  ['Takeover offer','Übernahmeangebot','Public offer aimed at control (30%)'],
  ['Mandatory offer','Pflichtangebot','Required after reaching 30%'],
  ['Hostile takeover','Feindliche Übernahme','Against the will of management'],
  ['Offer document','Angebotsunterlage','Reviewed by BaFin'],
  ['Reasoned statement','Begründete Stellungnahme','Target boards\' view on the offer'],
  ['Management board / supervisory board','Vorstand / Aufsichtsrat','German two-tier board'],
  ['General meeting','Hauptversammlung','Shareholders\' meeting'],
  ['Domination and profit transfer agreement','Beherrschungs- und Gewinnabführungsvertrag','Possible from 75%'],
  ['Squeeze-out','Ausschluss von Minderheitsaktionären','From 90% or 95%'],
  ['Appraisal proceedings','Spruchverfahren','Court review of the squeeze-out price'],
  ['Delisting','Börsenrückzug','Leaving the stock exchange'],
  ['Merger control','Fusionskontrolle','Antitrust review; Bundeskartellamt, EU Commission'],
  ['Clearance','Freigabe','Antitrust approval'],
  ['Foreign investment review','Investitionsprüfung','Under the Außenwirtschaftsverordnung'],
  ['Poison pill / white knight','Giftpille / Weißer Ritter','US defences; pill not available in Germany'],
  ['Leveraged buyout','Fremdfinanzierte Übernahme','Purchase funded mainly with debt'],
  ['Private equity','Beteiligungsgesellschaft / Finanzinvestor','Financial buyer'],
  ['Strategic buyer','Strategischer Käufer / Stratege','Buyer from the industry'],
  ['Leverage','Verschuldungsgrad','Net debt ÷ EBITDA'],
  ['Covenants','Kreditauflagen','Conditions in loan agreements'],
  ['Bond','Anleihe','Tradable debt'],
  ['Insolvency / restructuring','Insolvenz / Restrukturierung (Sanierung)','Distressed situations'],
  ['Shareholder','Aktionär / Gesellschafter','Owner of an AG / of a GmbH'],
  ['Subsidiary / holding','Tochtergesellschaft / Beteiligung','Controlled company / stake'],
  ['Fairness opinion','Fairness Opinion / Angemessenheitsgutachten','Independent view that the price is fair']
  ];
  var tb=document.querySelector('#gl tbody');
  
  function draw(q){ q=(q||'').toLowerCase(); var h='';
    G.forEach(function(g){ if(!q||g.join(' ').toLowerCase().indexOf(q)>-1) h+='<tr><td>'+esc(g[0])+'</td><td><span class="de" style="white-space:normal">'+esc(g[1])+'</span></td><td>'+esc(g[2])+'</td></tr>'; });
    tb.innerHTML=h||'<tr><td colspan="3">No term matches. Try a shorter word.</td></tr>'; }
  document.getElementById('gl-filter').addEventListener('input',function(e){ draw(e.target.value); });
  draw('');
})();

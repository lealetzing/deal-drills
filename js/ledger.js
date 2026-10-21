/* Balance the Books: transactions for the three-statement game, in English and German (L()).
   Each generator returns the transaction text, the change in every line item (d), and a walk-through per statement.
   Totals (net income, cash, assets, liabilities, equity) are derived from the line items, and tools/check.js
   verifies the identities for every transaction type. L() never consumes randomness, so the fixed tests are the
   same questions in both languages.
   Conventions: taxes are paid in cash in the same period, at the rate shown. Expense lines are shown as expenses
   (an increase in depreciation is +10; a lower tax expense is negative). Gain on sale is negative for a loss. */
var POS={
  is:[['rev',L('Revenue','Umsatz')],['cogs',L('COGS','Herstellungskosten (COGS)')],['opex',L('Operating expenses','Betriebliche Aufwendungen')],['da',L('Depreciation','Abschreibungen')],['imp',L('Impairments & write-downs','Wertminderungen')],['int',L('Interest expense','Zinsaufwand')],['gain',L('Gain on asset sale','Gewinn aus Anlagenverkauf')],['tax',L('Income tax expense','Ertragsteueraufwand')],['ni',L('Net income','Jahresüberschuss')]],
  cf:[['cfo',L('Operating cash flow','Operativer Cashflow')],['cfi',L('Investing cash flow','Cashflow aus Investitionstätigkeit')],['cff',L('Financing cash flow','Cashflow aus Finanzierungstätigkeit')]],
  bs:[['cash',L('Cash','Kasse')],['ar',L('Receivables','Forderungen')],['inv',L('Inventory','Vorräte')],['ppe',L('PP&E','Sachanlagen')],['gw','Goodwill'],['ap',L('Payables','Lieferantenverbindlichkeiten')],['accr',L('Accrued liabilities','Abgegrenzte Verbindlichkeiten')],['defrev',L('Deferred revenue','Erhaltene Anzahlungen')],['debt',L('Debt','Finanzschulden')],['dtl',L('Deferred tax liability','Passive latente Steuern')],['cap',L('Paid-in capital','Eingezahltes Kapital')],['re',L('Retained earnings','Gewinnrücklagen')]]
};
var ST_NAME={is:L('income statement','GuV'),cf:L('cash flow statement','Kapitalflussrechnung'),bs:L('balance sheet','Bilanz')};
var POS_NAME={};['is','cf','bs'].forEach(function(s){POS[s].forEach(function(p){POS_NAME[p[0]]=p[1];});});
var LEDGER_FIELDS=[['ni',L('Net income','Jahresüberschuss'),L('Income statement','GuV')],['cash',L('Change in cash','Veränderung der Kasse'),L('Cash flow statement','Kapitalflussrechnung')],['a',L('Total assets','Summe Aktiva'),L('Balance sheet','Bilanz')],['l',L('Total liabilities','Summe Verbindlichkeiten'),L('Balance sheet','Bilanz')],['e',L('Equity','Eigenkapital'),L('Balance sheet','Bilanz')]];
function lx(){return r(1,15)*20;}
function lt(){return pick([20,25,30]);}
function ln(x){return x>0?'+'+f(x,2):x<0?'−'+f(-x,2):'0';}
function tr(t){return L('Tax rate <b>'+t+'%</b>','Steuersatz <b>'+t+' %</b>');}
/* Fill in zeros and derived totals. */
function mk(o){
  var d=o.d;['is','cf','bs'].forEach(function(s){POS[s].forEach(function(p){if(!d[p[0]])d[p[0]]=0;});});
  o.ni=d.ni;o.cash=d.cash;o.a=d.cash+d.ar+d.inv+d.ppe+d.gw;o.l=d.ap+d.accr+d.defrev+d.debt+d.dtl;o.e=d.cap+d.re;
  return o;
}
var NO_EFFECT=L('No effect.','Keine Wirkung.');
var LEDGER={
 dep:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('Depreciation of <b>'+X+'</b> is recorded. ','Es werden Abschreibungen von <b>'+X+'</b> gebucht. ')+tr(t)+'.',d:{da:X,tax:-tx,ni:ni,cfo:tx,cash:tx,ppe:-X,re:ni},
   is:L('Depreciation −'+X+' → pre-tax income −'+X+', tax '+ln(tx)+' saved → net income '+ln(ni),'Abschreibungen −'+X+' → Ergebnis vor Steuern −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' + depreciation add-back '+X+' = '+ln(tx)+' (the tax shield)','Operativ: Jahresüberschuss '+ln(ni)+' + Abschreibungen '+X+' = '+ln(tx)+' (Steuerschild)'),
   bs:L('PP&E −'+X+', cash '+ln(tx)+' → assets '+ln(-X+tx)+'; retained earnings '+ln(ni)+'. Balances.','Sachanlagen −'+X+', Kasse '+ln(tx)+' → Aktiva '+ln(-X+tx)+'; Gewinnrücklagen '+ln(ni)+'. Geht auf.')});},
 capexCash:function(){var X=lx();
  return mk({txt:L('The company buys machinery for <b>'+X+'</b> in cash.','Das Unternehmen kauft Maschinen für <b>'+X+'</b> in bar.'),d:{cfi:-X,cash:-X,ppe:X},
   is:L('No effect: CapEx is not an expense (depreciation comes later).','Keine Wirkung: Investitionen sind kein Aufwand (die Abschreibungen kommen später).'),cf:L('CFI: CapEx −'+X,'Investitionstätigkeit: Investitionen −'+X),
   bs:L('PP&E +'+X+', cash −'+X+' → total assets unchanged.','Sachanlagen +'+X+', Kasse −'+X+' → Summe Aktiva unverändert.')});},
 capexDebt:function(){var X=lx();
  return mk({txt:L('The company buys machinery for <b>'+X+'</b>, financed entirely with a new bank loan paid directly to the seller.','Das Unternehmen kauft Maschinen für <b>'+X+'</b>, voll finanziert über einen neuen Bankkredit, der direkt an den Verkäufer ausgezahlt wird.'),d:{ppe:X,debt:X},
   is:NO_EFFECT,cf:L('No cash moved (non-cash investing and financing, shown in the notes).','Kein Zahlungsfluss (nicht zahlungswirksame Investition und Finanzierung, im Anhang angegeben).'),bs:L('PP&E +'+X+', debt +'+X+'.','Sachanlagen +'+X+', Finanzschulden +'+X+'.')});},
 issue:function(){var X=lx();
  return mk({txt:L('The company issues new shares for <b>'+X+'</b> in cash.','Das Unternehmen gibt neue Aktien für <b>'+X+'</b> gegen Bareinlage aus.'),d:{cff:X,cash:X,cap:X},
   is:NO_EFFECT,cf:L('CFF: equity issued +'+X,'Finanzierungstätigkeit: Kapitalerhöhung +'+X),bs:L('Cash +'+X+', paid-in capital +'+X+'.','Kasse +'+X+', eingezahltes Kapital +'+X+'.')});},
 borrow:function(){var X=lx();
  return mk({txt:L('The company draws a new term loan of <b>'+X+'</b>.','Das Unternehmen nimmt ein neues Darlehen über <b>'+X+'</b> auf.'),d:{cff:X,cash:X,debt:X},
   is:L('No effect (interest comes later).','Keine Wirkung (Zinsen kommen später).'),cf:L('CFF: debt raised +'+X,'Finanzierungstätigkeit: Kreditaufnahme +'+X),bs:L('Cash +'+X+', debt +'+X+'.','Kasse +'+X+', Finanzschulden +'+X+'.')});},
 repay:function(){var X=lx();
  return mk({txt:L('The company repays <b>'+X+'</b> of debt principal.','Das Unternehmen tilgt <b>'+X+'</b> Kredit.'),d:{cff:-X,cash:-X,debt:-X},
   is:L('No effect: principal repayment is not an expense.','Keine Wirkung: Tilgung ist kein Aufwand.'),cf:L('CFF: debt repaid −'+X,'Finanzierungstätigkeit: Tilgung −'+X),bs:L('Cash −'+X+', debt −'+X+'.','Kasse −'+X+', Finanzschulden −'+X+'.')});},
 dividend:function(){var X=lx();
  return mk({txt:L('The company pays a cash dividend of <b>'+X+'</b>.','Das Unternehmen zahlt eine Bardividende von <b>'+X+'</b>.'),d:{cff:-X,cash:-X,re:-X},
   is:L('No effect: dividends are a distribution, not an expense.','Keine Wirkung: Dividenden sind eine Ausschüttung, kein Aufwand.'),cf:L('CFF: dividends −'+X,'Finanzierungstätigkeit: Dividenden −'+X),bs:L('Cash −'+X+', retained earnings −'+X+'.','Kasse −'+X+', Gewinnrücklagen −'+X+'.')});},
 interest:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('The company pays <b>'+X+'</b> of interest in cash. ','Das Unternehmen zahlt <b>'+X+'</b> Zinsen in bar. ')+tr(t)+'.',d:{int:X,tax:-tx,ni:ni,cfo:ni,cash:ni,re:ni},
   is:L('Interest expense −'+X+', tax saved '+ln(tx)+' → net income '+ln(ni),'Zinsaufwand −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: starts with net income '+ln(ni)+'; nothing to add back → cash '+ln(ni),'Operativ: beginnt beim Jahresüberschuss '+ln(ni)+'; nichts hinzuzurechnen → Kasse '+ln(ni)),
   bs:L('Cash '+ln(ni)+', retained earnings '+ln(ni)+'.','Kasse '+ln(ni)+', Gewinnrücklagen '+ln(ni)+'.')});},
 invCredit:function(){var X=lx();
  return mk({txt:L('The company buys inventory for <b>'+X+'</b> on credit from a supplier.','Das Unternehmen kauft Vorräte für <b>'+X+'</b> auf Ziel bei einem Lieferanten.'),d:{inv:X,ap:X},
   is:L('No effect until the inventory is sold.','Keine Wirkung, bis die Vorräte verkauft werden.'),cf:L('CFO: inventory increase −'+X+', payables increase +'+X+' → net 0','Operativ: Anstieg Vorräte −'+X+', Anstieg Lieferantenverbindlichkeiten +'+X+' → netto 0'),
   bs:L('Inventory +'+X+', payables +'+X+'.','Vorräte +'+X+', Lieferantenverbindlichkeiten +'+X+'.')});},
 invCash:function(){var X=lx();
  return mk({txt:L('The company buys inventory for <b>'+X+'</b> in cash.','Das Unternehmen kauft Vorräte für <b>'+X+'</b> in bar.'),d:{cfo:-X,cash:-X,inv:X},
   is:L('No effect until the inventory is sold.','Keine Wirkung, bis die Vorräte verkauft werden.'),cf:L('CFO: inventory increase −'+X,'Operativ: Anstieg Vorräte −'+X),bs:L('Inventory +'+X+', cash −'+X+' → total assets unchanged.','Vorräte +'+X+', Kasse −'+X+' → Summe Aktiva unverändert.')});},
 sellInv:function(){var C=lx(),P=C+r(1,10)*20,t=lt(),g=P-C,tx=g*t/100,ni=g-tx,cash=P-tx;
  return mk({txt:L('Inventory that cost <b>'+C+'</b> is sold for <b>'+P+'</b> in cash. ','Vorräte mit Anschaffungskosten von <b>'+C+'</b> werden für <b>'+P+'</b> bar verkauft. ')+tr(t)+'.',d:{rev:P,cogs:C,tax:tx,ni:ni,cfo:cash,cash:cash,inv:-C,re:ni},
   is:L('Revenue +'+P+', COGS −'+C+' → pre-tax +'+g+', tax −'+f(tx,2)+' → net income '+ln(ni),'Umsatz +'+P+', COGS −'+C+' → vor Steuern +'+g+', Steuer −'+f(tx,2)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' + inventory decrease +'+C+' = '+ln(cash),'Operativ: Jahresüberschuss '+ln(ni)+' + Abbau Vorräte +'+C+' = '+ln(cash)),
   bs:L('Cash '+ln(cash)+', inventory −'+C+' → assets '+ln(ni)+'; retained earnings '+ln(ni)+'.','Kasse '+ln(cash)+', Vorräte −'+C+' → Aktiva '+ln(ni)+'; Gewinnrücklagen '+ln(ni)+'.')});},
 saleCredit:function(){var X=lx(),t=lt(),tx=X*t/100,ni=X-tx;
  return mk({txt:L('The company delivers a service and invoices the customer <b>'+X+'</b>, payable in 60 days. ','Das Unternehmen erbringt eine Leistung und stellt dem Kunden <b>'+X+'</b> in Rechnung, zahlbar in 60 Tagen. ')+tr(t)+'.',d:{rev:X,tax:tx,ni:ni,cfo:-tx,cash:-tx,ar:X,re:ni},
   is:L('Revenue +'+X+', tax −'+f(tx,2)+' → net income '+ln(ni),'Umsatz +'+X+', Steuer −'+f(tx,2)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' − receivables increase '+X+' = '+ln(-tx)+' (only the tax left the company)','Operativ: Jahresüberschuss '+ln(ni)+' − Anstieg Forderungen '+X+' = '+ln(-tx)+' (nur die Steuer ist abgeflossen)'),
   bs:L('Receivables +'+X+', cash '+ln(-tx)+' → assets '+ln(ni)+'; retained earnings '+ln(ni)+'.','Forderungen +'+X+', Kasse '+ln(-tx)+' → Aktiva '+ln(ni)+'; Gewinnrücklagen '+ln(ni)+'.')});},
 collect:function(){var X=lx();
  return mk({txt:L('A customer pays an outstanding invoice of <b>'+X+'</b>.','Ein Kunde begleicht eine offene Rechnung über <b>'+X+'</b>.'),d:{cfo:X,cash:X,ar:-X},
   is:L('No effect: the revenue was recognised when invoiced.','Keine Wirkung: der Umsatz wurde bei Rechnungsstellung gebucht.'),cf:L('CFO: receivables decrease +'+X,'Operativ: Abbau Forderungen +'+X),bs:L('Cash +'+X+', receivables −'+X+' → total assets unchanged.','Kasse +'+X+', Forderungen −'+X+' → Summe Aktiva unverändert.')});},
 payAP:function(){var X=lx();
  return mk({txt:L('The company pays a supplier invoice of <b>'+X+'</b>.','Das Unternehmen bezahlt eine Lieferantenrechnung über <b>'+X+'</b>.'),d:{cfo:-X,cash:-X,ap:-X},
   is:NO_EFFECT,cf:L('CFO: payables decrease −'+X,'Operativ: Abbau Lieferantenverbindlichkeiten −'+X),bs:L('Cash −'+X+', payables −'+X+'.','Kasse −'+X+', Lieferantenverbindlichkeiten −'+X+'.')});},
 goodwill:function(){var X=lx();
  return mk({txt:L('Goodwill is impaired by <b>'+X+'</b>. The charge is not tax-deductible.','Der Goodwill wird um <b>'+X+'</b> wertgemindert. Der Aufwand ist steuerlich nicht abzugsfähig.'),d:{imp:X,ni:-X,gw:-X,re:-X},
   is:L('Impairment −'+X+', no tax effect → net income −'+X,'Wertminderung −'+X+', kein Steuereffekt → Jahresüberschuss −'+X),cf:L('CFO: net income −'+X+' + non-cash add-back +'+X+' = 0','Operativ: Jahresüberschuss −'+X+' + nicht zahlungswirksam +'+X+' = 0'),
   bs:L('Goodwill −'+X+', retained earnings −'+X+'.','Goodwill −'+X+', Gewinnrücklagen −'+X+'.')});},
 writeDown:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('Obsolete inventory of <b>'+X+'</b> is written off. The loss is tax-deductible; ','Veraltete Vorräte von <b>'+X+'</b> werden abgeschrieben. Der Verlust ist steuerlich abzugsfähig; ')+tr(t).replace(/^T/,'t')+'.',d:{imp:X,tax:-tx,ni:ni,cfo:tx,cash:tx,inv:-X,re:ni},
   is:L('Write-down −'+X+', tax saved '+ln(tx)+' → net income '+ln(ni),'Abwertung −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),cf:L('CFO: net income '+ln(ni)+' + non-cash write-down +'+X+' = '+ln(tx),'Operativ: Jahresüberschuss '+ln(ni)+' + nicht zahlungswirksame Abwertung +'+X+' = '+ln(tx)),
   bs:L('Inventory −'+X+', cash '+ln(tx)+' → assets '+ln(-X+tx)+'; retained earnings '+ln(ni)+'.','Vorräte −'+X+', Kasse '+ln(tx)+' → Aktiva '+ln(-X+tx)+'; Gewinnrücklagen '+ln(ni)+'.')});},
 prepay:function(){var X=lx();
  return mk({txt:L('A customer pays <b>'+X+'</b> upfront for a service the company will deliver next year. (Ignore tax.)','Ein Kunde zahlt <b>'+X+'</b> im Voraus für eine Leistung, die das Unternehmen nächstes Jahr erbringt. (Steuern ignorieren.)'),d:{cfo:X,cash:X,defrev:X},
   is:L('No effect: revenue is recognised when the service is delivered.','Keine Wirkung: der Umsatz wird bei Leistungserbringung gebucht.'),cf:L('CFO: deferred revenue increase +'+X,'Operativ: Anstieg erhaltene Anzahlungen +'+X),bs:L('Cash +'+X+', deferred revenue (a liability) +'+X+'.','Kasse +'+X+', erhaltene Anzahlungen (eine Verbindlichkeit) +'+X+'.')});},
 accrual:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('Employee bonuses of <b>'+X+'</b> are expensed this year but paid next year. ','Mitarbeiterboni von <b>'+X+'</b> werden dieses Jahr als Aufwand gebucht, aber erst nächstes Jahr gezahlt. ')+tr(t)+L('; the expense is deductible now.','; der Aufwand ist sofort abzugsfähig.'),d:{opex:X,tax:-tx,ni:ni,cfo:tx,cash:tx,accr:X,re:ni},
   is:L('Bonus expense −'+X+', tax saved '+ln(tx)+' → net income '+ln(ni),'Bonusaufwand −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),cf:L('CFO: net income '+ln(ni)+' + accrued liabilities increase +'+X+' = '+ln(tx),'Operativ: Jahresüberschuss '+ln(ni)+' + Anstieg abgegrenzte Verbindlichkeiten +'+X+' = '+ln(tx)),
   bs:L('Cash '+ln(tx)+'; accrued liabilities +'+X+'; retained earnings '+ln(ni)+'. Assets '+ln(tx)+' = liabilities +'+X+' + equity '+ln(ni)+'.','Kasse '+ln(tx)+'; abgegrenzte Verbindlichkeiten +'+X+'; Gewinnrücklagen '+ln(ni)+'. Aktiva '+ln(tx)+' = Verbindlichkeiten +'+X+' + Eigenkapital '+ln(ni)+'.')});},
 sbc:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('The company grants stock-based compensation worth <b>'+X+'</b>, expensed this year and tax-deductible. ','Das Unternehmen gewährt aktienbasierte Vergütung im Wert von <b>'+X+'</b>, dieses Jahr als Aufwand gebucht und abzugsfähig. ')+tr(t)+'.',d:{opex:X,tax:-tx,ni:ni,cfo:tx,cash:tx,cap:X,re:ni},
   is:L('SBC expense −'+X+', tax saved '+ln(tx)+' → net income '+ln(ni),'Aufwand aktienbasierte Vergütung −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),cf:L('CFO: net income '+ln(ni)+' + non-cash SBC +'+X+' = '+ln(tx),'Operativ: Jahresüberschuss '+ln(ni)+' + nicht zahlungswirksame Vergütung +'+X+' = '+ln(tx)),
   bs:L('Cash '+ln(tx)+'; equity: paid-in capital +'+X+', retained earnings '+ln(ni)+' → equity '+ln(tx)+'.','Kasse '+ln(tx)+'; Eigenkapital: eingezahltes Kapital +'+X+', Gewinnrücklagen '+ln(ni)+' → Eigenkapital '+ln(tx)+'.')});},
 sellPPE:function(){var B=lx(),P=Math.max(20,B+r(-4,6)*20),t=lt(),g=P-B,tx=g*t/100,ni=g-tx,cash=P-tx;
  return mk({txt:L('A building with a book value of <b>'+B+'</b> is sold for <b>'+P+'</b> in cash. Tax rate <b>'+t+'%</b> applies to the '+(g>=0?'gain':'loss')+'.','Ein Gebäude mit Buchwert <b>'+B+'</b> wird für <b>'+P+'</b> bar verkauft. Auf den '+(g>=0?'Gewinn':'Verlust')+' gilt ein Steuersatz von <b>'+t+' %</b>.'),d:{gain:g,tax:tx,ni:ni,cfo:-tx,cfi:P,cash:cash,ppe:-B,re:ni},
   is:(g===0?L('No gain or loss → net income 0','Weder Gewinn noch Verlust → Jahresüberschuss 0'):(g>0?L('Gain +'+g+', tax −'+f(tx,2),'Gewinn +'+g+', Steuer −'+f(tx,2)):L('Loss −'+(-g)+', tax saved +'+f(-tx,2),'Verlust −'+(-g)+', Steuerersparnis +'+f(-tx,2)))+L(' → net income ',' → Jahresüberschuss ')+ln(ni)),
   cf:L('CFO: net income '+ln(ni),'Operativ: Jahresüberschuss '+ln(ni))+(g?' '+(g>0?'− ':'+ ')+L(g>0?'gain ':'loss ',g>0?'Gewinn ':'Verlust ')+Math.abs(g)+L(' (reclassified to investing)',' (in Investitionstätigkeit umgegliedert)'):'')+' = '+ln(-tx)+L('; CFI: sale proceeds +','; Investitionstätigkeit: Verkaufserlös +')+P+L(' → cash ',' → Kasse ')+ln(cash),
   bs:L('PP&E −'+B+', cash '+ln(cash)+' → assets '+ln(ni)+'; retained earnings '+ln(ni)+'.','Sachanlagen −'+B+', Kasse '+ln(cash)+' → Aktiva '+ln(ni)+'; Gewinnrücklagen '+ln(ni)+'.')});},
 mixedCapex:function(){var C=lx(),D=lx(),X=C+D;
  return mk({txt:L('The company buys a warehouse for <b>'+X+'</b>: <b>'+C+'</b> paid in cash, the rest with a new mortgage loan.','Das Unternehmen kauft ein Lager für <b>'+X+'</b>: <b>'+C+'</b> bar, den Rest über ein neues Hypothekendarlehen.'),d:{cfi:-C,cash:-C,ppe:X,debt:D},
   is:NO_EFFECT,cf:L('CFI: CapEx −'+C+' (the loan-financed part is non-cash)','Investitionstätigkeit: Investitionen −'+C+' (der kreditfinanzierte Teil ist nicht zahlungswirksam)'),
   bs:L('PP&E +'+X+', cash −'+C+' → assets +'+D+'; debt +'+D+'.','Sachanlagen +'+X+', Kasse −'+C+' → Aktiva +'+D+'; Finanzschulden +'+D+'.')});},
 debtToEquity:function(){var X=lx();
  return mk({txt:L('Bondholders convert <b>'+X+'</b> of bonds into new shares.','Anleihegläubiger wandeln Anleihen über <b>'+X+'</b> in neue Aktien.'),d:{debt:-X,cap:X},
   is:NO_EFFECT,cf:L('No cash moved.','Kein Zahlungsfluss.'),bs:L('Debt −'+X+', paid-in capital +'+X+'. Assets unchanged.','Finanzschulden −'+X+', eingezahltes Kapital +'+X+'. Aktiva unverändert.')});},
 sellInvCredit:function(){var C=lx(),P=C+r(1,10)*20,t=lt(),g=P-C,tx=g*t/100,ni=g-tx;
  return mk({txt:L('Inventory that cost <b>'+C+'</b> is sold for <b>'+P+'</b> on credit (payable in 30 days). ','Vorräte mit Anschaffungskosten von <b>'+C+'</b> werden für <b>'+P+'</b> auf Ziel verkauft (zahlbar in 30 Tagen). ')+tr(t)+'.',d:{rev:P,cogs:C,tax:tx,ni:ni,cfo:-tx,cash:-tx,ar:P,inv:-C,re:ni},
   is:L('Revenue +'+P+', COGS −'+C+' → pre-tax +'+g+', tax −'+f(tx,2)+' → net income '+ln(ni),'Umsatz +'+P+', COGS −'+C+' → vor Steuern +'+g+', Steuer −'+f(tx,2)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' + inventory decrease +'+C+' − receivables increase '+P+' = '+ln(-tx),'Operativ: Jahresüberschuss '+ln(ni)+' + Abbau Vorräte +'+C+' − Anstieg Forderungen '+P+' = '+ln(-tx)),
   bs:L('Receivables +'+P+', inventory −'+C+', cash '+ln(-tx)+' → assets '+ln(ni)+'; retained earnings '+ln(ni)+'.','Forderungen +'+P+', Vorräte −'+C+', Kasse '+ln(-tx)+' → Aktiva '+ln(ni)+'; Gewinnrücklagen '+ln(ni)+'.')});},
 dtl:function(){var X=lx(),Y=lx(),t=lt(),ni=-X*(1-t/100),ct=(X+Y)*t/100,dtl=Y*t/100;
  return mk({txt:L('Book depreciation is <b>'+X+'</b>, but tax depreciation is accelerated: <b>'+(X+Y)+'</b>. ','Die bilanzielle Abschreibung beträgt <b>'+X+'</b>, steuerlich wird beschleunigt abgeschrieben: <b>'+(X+Y)+'</b>. ')+tr(t)+L('; cash taxes follow the tax books.','; die gezahlten Steuern folgen der Steuerbilanz.'),d:{da:X,tax:-X*t/100,ni:ni,cfo:ct,cash:ct,ppe:-X,dtl:dtl,re:ni},
   is:L('Depreciation −'+X+'; tax expense falls by '+f(X*t/100,2)+' → net income '+ln(ni),'Abschreibungen −'+X+'; Steueraufwand sinkt um '+f(X*t/100,2)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' + depreciation +'+X+' + deferred tax +'+f(dtl,2)+' = '+ln(ct),'Operativ: Jahresüberschuss '+ln(ni)+' + Abschreibungen +'+X+' + latente Steuern +'+f(dtl,2)+' = '+ln(ct)),
   bs:L('PP&E −'+X+', cash '+ln(ct)+' → assets '+ln(-X+ct)+'; deferred tax liability +'+f(dtl,2)+' (tax paid later on the '+Y+' timing difference); retained earnings '+ln(ni)+'.','Sachanlagen −'+X+', Kasse '+ln(ct)+' → Aktiva '+ln(-X+ct)+'; passive latente Steuern +'+f(dtl,2)+' (Steuer auf die zeitliche Differenz von '+Y+' wird später gezahlt); Gewinnrücklagen '+ln(ni)+'.')});},
 pik:function(){var X=lx(),t=lt(),tx=X*t/100,ni=-X+tx;
  return mk({txt:L('Interest of <b>'+X+'</b> on a PIK note is added to the loan instead of being paid. It is tax-deductible; ','Zinsen von <b>'+X+'</b> auf ein PIK-Darlehen werden dem Darlehen zugeschlagen statt gezahlt. Sie sind steuerlich abzugsfähig; ')+tr(t).replace(/^T/,'t')+'.',d:{int:X,tax:-tx,ni:ni,cfo:tx,cash:tx,debt:X,re:ni},
   is:L('Interest expense −'+X+', tax saved '+ln(tx)+' → net income '+ln(ni),'Zinsaufwand −'+X+', Steuerersparnis '+ln(tx)+' → Jahresüberschuss '+ln(ni)),
   cf:L('CFO: net income '+ln(ni)+' + non-cash PIK interest +'+X+' = '+ln(tx),'Operativ: Jahresüberschuss '+ln(ni)+' + nicht zahlungswirksame PIK-Zinsen +'+X+' = '+ln(tx)),
   bs:L('Cash '+ln(tx)+'; debt +'+X+'; retained earnings '+ln(ni)+'.','Kasse '+ln(tx)+'; Finanzschulden +'+X+'; Gewinnrücklagen '+ln(ni)+'.')});},
 payBonus:function(){var X=lx();
  return mk({txt:L('Last year’s accrued employee bonuses of <b>'+X+'</b> are paid out in cash.','Die im Vorjahr abgegrenzten Mitarbeiterboni von <b>'+X+'</b> werden ausgezahlt.'),d:{cfo:-X,cash:-X,accr:-X},
   is:L('No effect: the expense was recorded last year.','Keine Wirkung: der Aufwand wurde im Vorjahr gebucht.'),cf:L('CFO: accrued liabilities decrease −'+X,'Operativ: Abbau abgegrenzte Verbindlichkeiten −'+X),bs:L('Cash −'+X+', accrued liabilities −'+X+'.','Kasse −'+X+', abgegrenzte Verbindlichkeiten −'+X+'.')});}
};

/* Levels: easy has no tax and touches at most two balance-sheet lines; medium adds the tax effect; hard mixes
   non-cash items, timing differences and multi-line entries. */
var LEDGER_LEVELS={
  easy:{name:L('Easy','Leicht'),d:L('No tax. Cash, debt, equity, inventory and payables.','Ohne Steuern. Kasse, Schulden, Eigenkapital, Vorräte und Verbindlichkeiten.'),keys:['capexCash','capexDebt','issue','borrow','repay','dividend','invCredit','invCash','collect','payAP','prepay','payBonus']},
  medium:{name:L('Medium','Mittel'),d:L('Taxes enter: depreciation, interest, sales, impairments.','Mit Steuern: Abschreibungen, Zinsen, Verkäufe, Wertminderungen.'),keys:['dep','interest','goodwill','writeDown','sellInv','saleCredit','mixedCapex','debtToEquity']},
  hard:{name:L('Hard','Schwer'),d:L('Accruals, SBC, deferred tax, PIK interest, asset sales at a gain or loss.','Abgrenzungen, aktienbasierte Vergütung, latente Steuern, PIK-Zinsen, Anlagenverkäufe mit Gewinn oder Verlust.'),keys:['accrual','sbc','sellPPE','sellInvCredit','dtl','pik','saleCredit','writeDown']}
};
var LEDGER_ROUND=5, LEDGER_PENALTY=15000;

/* Misconceptions per transaction: [line, claimed change]. A number is a claimed amount, 'up'/'down' a claimed
   direction. These feed the hidden trick questions; tools/check.js verifies every one is actually false. */
var TRAPS={
 dividend:function(d){var X=-d.re;return [['ni',-X],['opex',X]];},
 repay:function(d){var X=-d.debt;return [['int',X],['ni',-X]];},
 capexCash:function(d){var X=d.ppe;return [['da',X],['cfo',-X],['ni',-X]];},
 capexDebt:function(d){var X=d.ppe;return [['cash',-X],['cfi',-X],['cff',X]];},
 issue:function(d){var X=d.cap;return [['ni',X],['rev',X]];},
 borrow:function(d){var X=d.debt;return [['cfo',X],['ni',X]];},
 invCredit:function(d){var X=d.inv;return [['cogs',X],['cash',-X],['cfo',-X]];},
 invCash:function(d){var X=d.inv;return [['cogs',X],['ni',-X],['cfi',-X]];},
 collect:function(d){var X=-d.ar;return [['rev',X],['ni',X]];},
 payAP:function(d){var X=-d.ap;return [['cogs',X],['ni',-X]];},
 prepay:function(d){var X=d.defrev;return [['rev',X],['ni',X]];},
 payBonus:function(d){var X=-d.accr;return [['opex',X],['ni',-X]];},
 dep:function(d){var X=d.da;return [['cash',-X],['cfo',-X],['ni',-X]];},
 interest:function(d){var X=d.int;return [['debt',-X],['ni',-X],['cash',-X]];},
 goodwill:function(d){return [['tax','down'],['cash','up'],['cfo','down']];},
 writeDown:function(d){var X=d.imp;return [['cash','down'],['ni',-X]];},
 sellInv:function(d){return [['cash',d.rev],['ni',d.rev-d.cogs]];},
 saleCredit:function(d){var X=d.rev;return [['cash',X],['cfo',X]];},
 mixedCapex:function(d){return [['cfi',-(d.ppe)],['cff',d.debt]];},
 debtToEquity:function(d){var X=d.cap;return [['cash',X],['cff',-X],['ni',X]];},
 accrual:function(d){var X=d.opex;return [['cash',-X],['cfo','down']];},
 sbc:function(d){var X=d.opex;return [['cash',-X],['cfo','down'],['cap','down']];},
 sellPPE:function(d){return [['cfo',d.cfi],['cfi',d.gain]].filter(function(t){return t[1]!==0;});},
 sellInvCredit:function(d){return [['cash',d.rev],['cfo',d.ni]];},
 dtl:function(d){return [['tax',-d.cash],['cash',-d.da],['dtl','down']];},
 pik:function(d){var X=d.int;return [['cash',-X],['cfo','down'],['cff','down']];}
};
function claimTrue(d,t){var v=d[t[0]];return t[1]==='up'?v>0:t[1]==='down'?v<0:Math.abs(v-t[1])<0.01;}
var PLURAL=LANG==='de'?{opex:1,da:1,imp:1,ar:1,inv:1,ppe:1,ap:1,accr:1,defrev:1,debt:1,dtl:1,re:1,cogs:1}:{opex:1,imp:1,ar:1,ap:1,accr:1,re:1};
function claimText(pos,val){var n=POS_NAME[pos],pl=PLURAL[pos];
  if(LANG==='de'){
    if(val==='up')return n+(pl?' steigen':' steigt');if(val==='down')return n+(pl?' sinken':' sinkt');
    if(Math.abs(val)<0.005)return n+(pl?' bleiben unverändert':' bleibt unverändert');
    return n+(val>0?(pl?' steigen um ':' steigt um '):(pl?' sinken um ':' sinkt um '))+f(Math.abs(val),2);}
  if(val==='up')return n+(pl?' increase':' increases');if(val==='down')return n+(pl?' decrease':' decreases');
  if(Math.abs(val)<0.005)return n+(pl?' do not change':' does not change');
  return n+(val>0?(pl?' increase by ':' increases by '):(pl?' decrease by ':' decreases by '))+f(Math.abs(val),2);}
function trapsFor(c){return (TRAPS[c.k]?TRAPS[c.k](c.d):[]).filter(function(t){return !claimTrue(c.d,t);});}

/* Question formats.
   book:   enter net income, change in cash, total assets, liabilities and equity (must balance);
   which:  tick every line that changes on one statement (mostly a statement where something moves);
   single: the change in one line; about 1 in 8 asks about a misconception line that does not move (answer 0);
   claim:  true or false about one line; half are false, built from misconceptions or a plausible wrong amount. */
var ALL_POS=POS.is.concat(POS.cf,POS.bs).map(function(p){return p[0];});
function ledgerQuestion(c){
  var u=Math.random(),moving=ALL_POS.filter(function(k){return c.d[k]!==0&&k!=='gain';}),traps=trapsFor(c);
  if(u<0.28)return {type:'book'};
  if(u<0.50){var st=pick(['is','cf','bs','bs']);
    if(!changed(c,st).length&&Math.random()<0.75)st=pick(['is','cf','bs'].filter(function(x){return changed(c,x).length;}));
    return {type:'which',st:st};}
  if(u<0.72){var zeroTraps=traps.filter(function(t){return c.d[t[0]]===0;});
    if(zeroTraps.length&&Math.random()<0.12)return {type:'single',pos:pick(zeroTraps)[0]};
    return {type:'single',pos:pick(moving)};}
  /* claim */
  if(Math.random()<0.5){
    var r2=Math.random(),zeroT=traps.filter(function(t){return c.d[t[0]]===0;});
    if(r2<0.25&&zeroT.length){var z=pick(zeroT)[0];return {type:'claim',pos:z,val:0};}
    var p=pick(moving);return {type:'claim',pos:p,val:r2<0.4?(c.d[p]>0?'up':'down'):c.d[p]};
  }
  /* A plausible wrong amount: right line and direction, but another amount from the same transaction
     (typically the pre-tax figure, the tax, or the full price instead of the gain). */
  var wrongAmount=function(){
    var opts=[];
    moving.forEach(function(p){var v=c.d[p];ALL_POS.forEach(function(k){var a=Math.abs(c.d[k]);
      if(a>0&&Math.abs(a-Math.abs(v))>0.01&&!opts.some(function(o){return o[0]===p&&o[1]===(v>0?a:-a);}))opts.push([p,v>0?a:-a]);});});
    return opts.length?pick(opts):null;
  };
  var t=traps.length&&Math.random()<0.6?pick(traps):(wrongAmount()||(traps.length?pick(traps):null));
  if(!t){var p2=pick(moving);return {type:'claim',pos:p2,val:c.d[p2]};}
  return {type:'claim',pos:t[0],val:t[1]};
}
function changed(c,st){return POS[st].filter(function(p){return Math.abs(c.d[p[0]])>1e-9;}).map(function(p){return p[0];});}
function ledgerCard(level,prev,keys){keys=keys||LEDGER_LEVELS[level||'medium'].keys;var k;do{k=pick(keys);}while(k===prev&&keys.length>1);var c=LEDGER[k]();c.k=k;c.q=ledgerQuestion(c);return c;}

/* Fixed tests: every user gets the same 5 questions in Easy test 1, the same in Easy test 2, and so on.
   The questions come from the normal generators run with a seeded random number generator.
   Changing a generator changes the tests: bump LEDGER_VERSION (and reset the test leaderboards) when you do. */
var LEDGER_VERSION='v2', LEDGER_TESTS=20, LEDGER_PASS=4;
function seededRandom(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function hashStr(s){var h=2166136261;for(var i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),16777619);}return h>>>0;}
function testCards(level,n){
  var orig=Math.random;Math.random=seededRandom(hashStr('balance-the-books:'+LEDGER_VERSION+':'+level+':'+n));
  try{var cards=[],prev=null;for(var i=0;i<LEDGER_ROUND;i++){var c=ledgerCard(level,prev);cards.push(c);prev=c.k;}return cards;}
  finally{Math.random=orig;}
}
function testBoard(level,n){return 'game_ledger_'+level+'_'+n;}

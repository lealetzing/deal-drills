/* Games: Balance the Books (three statements), Accretive or Dilutive, Bridge Sort, Deal Process, Paper LBO Sprint.
   Signed-in players get ranked runs: the server times them (start_run) and validates the score (submit_run). */
var V=$('#view');
var G=null,TIMERS=[];
function stopTimers(){TIMERS.forEach(clearInterval);TIMERS=[];document.onkeydown=null;}
function flash(ok){var gc=$('#gc');if(!gc)return;gc.classList.remove('flash-ok','flash-no');void gc.offsetWidth;gc.classList.add(ok?'flash-ok':'flash-no');}
function fmtClock(left){var s=Math.ceil(left/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}

/* ---------- ranked plumbing ---------- */
function begin(board,start){
  if(DD.user){V.innerHTML='<div class="term"><p class="muted">'+L('Starting ranked run…','Gewertete Runde startet…')+'</p></div>';
    DD.startRun(board).then(function(id){if(!id)DD.toast(L('Could not start a ranked run. Playing unranked.','Gewertete Runde konnte nicht starten. Es wird ohne Wertung gespielt.'));start(id);});}
  else start(null);
}
function rankedResult(run,score,board){
  var out=$('#rankOut');if(!out)return;
  if(!run){out.innerHTML=DD.sb&&!DD.user?'<div class="notice">'+L('<a href="login.html">Sign in</a> and your games count for the leaderboard.','<a href="login.html">Melde dich an</a>, dann zählen deine Spiele für die Rangliste.')+'</div>':'';return;}
  out.innerHTML='<p class="muted">'+L('Submitting ranked result…','Ergebnis wird übermittelt…')+'</p>';
  DD.submitRun(run,score).then(function(res){
    out.innerHTML=res&&res.ok?'<div class="notice"><span class="ranked">'+L('Ranked','Gewertet')+'</span> '+L('Result recorded. ','Ergebnis gespeichert. ')+'<a href="leaderboard.html?b='+board+L('">See leaderboard →</a></div>','">Zur Rangliste →</a></div>')
      :'<div class="note">This run was not ranked'+(res&&res.reason?' ('+esc(res.reason)+')':'')+'.</div>';
  });
}
function gameShell(title,right,body){
  V.innerHTML='<div class="term"><div class="termhead"><span>'+title+(G&&G.run?' <span class="ranked">'+L('Ranked','Gewertet')+'</span>':'')+'</span><span>'+right+'</span><button class="btn ghost small" id="gQuit">'+L('Leave','Verlassen')+'</button></div>'+body+'</div>';
  $('#gQuit').onclick=function(){stopTimers();G=null;renderMenu();};
}
function endScreen(t,big,sub,again,extra){
  V.innerHTML='<div class="term"><div class="eyebrow">'+t+'</div><h2 style="margin:8px 0 8px">'+big+'</h2><p class="lead" style="margin-top:0">'+sub+'</p>'+
   '<div id="rankOut" style="margin-top:14px"></div>'+(extra||'')+
   '<div class="row" style="margin-top:18px"><button class="btn" id="gAgain">'+L('Play again','Nochmal')+'</button><button class="btn ghost" id="gBack">'+L('All games','Alle Spiele')+'</button></div></div>';
  $('#gAgain').onclick=again;$('#gBack').onclick=function(){G=null;renderMenu();};
}
function timer(ms,onEnd){
  var tick=function(){var left=Math.max(0,G.end-Date.now());var el=$('#tmr');if(el){el.textContent=fmtClock(left);el.classList.toggle('low',left<10000);}
    if(left<=0){stopTimers();G.over=true;onEnd();}};
  G.end=Date.now()+ms;TIMERS.push(setInterval(tick,200));setTimeout(tick,0);
}

/* ---------- menu ---------- */
function renderMenu(){
  stopTimers();G=null;
  history.replaceState(null,'','games.html');
  V.innerHTML='<div class="eyebrow">'+L('Games','Spiele')+'</div><h2 style="margin:8px 0 6px">'+L('Train the reflexes.','Trainiere die Reflexe.')+'</h2><p class="lead" style="margin-top:0">'+
   (DD.user?L('You are signed in: timed games count for the leaderboard.','Du bist angemeldet: Spiele auf Zeit zählen für die Rangliste.'):DD.sb?L('<a href="login.html">Sign in</a> to put your scores on the leaderboard.','<a href="login.html">Melde dich an</a>, damit deine Ergebnisse in die Rangliste kommen.'):L('Best scores are saved in this browser.','Bestwerte werden in diesem Browser gespeichert.'))+'</p>'+
   '<div class="grid g2" style="margin-top:18px">'+
   gameCard(L('Easy · Medium · Hard','Leicht · Mittel · Schwer'),'Balance the Books',L('A transaction appears. Book its effect on the three statements and spot the traps. Fixed tests against the clock, compared with your friends and the site average.','Ein Geschäftsvorfall erscheint. Buche seine Wirkung auf die drei Abschlüsse und erkenne die Fallen. Feste Tests gegen die Uhr, im Vergleich mit Freunden und dem Durchschnitt.'),(passedCount('easy')+passedCount('medium')+passedCount('hard'))+' of '+(3*LEDGER_TESTS)+L(' tests passed',' Tests bestanden'),'ledger')+
   gameCard(L('60 seconds','60 Sekunden'),L('Accretive or Dilutive?','Accretive oder Dilutive?'),L('Each card is a deal: P/E paid, premium, stock, debt or cash, mixes and synergies. It gets harder over the minute; the full calculation follows every call. Keys A and D.','Jede Karte ist ein Deal: bezahltes KGV, Prämie, Aktien, Schulden oder Cash, Mischungen und Synergien. Es wird im Lauf der Minute schwerer; nach jeder Antwort kommt die ganze Rechnung. Tasten A und D.'),L('Best ','Bestwert ')+S.games.ad,'ad')+
   gameCard(L('15 items · stopwatch','15 Posten · Stoppuhr'),'Bridge Sort',L('Equity value to EV, or EV to equity value: add, subtract or leave out? The direction changes every card. Each mistake adds 5 seconds. Keys 1, 2, 3.','Equity Value zu EV oder EV zu Equity Value: addieren, abziehen oder weglassen? Die Richtung wechselt bei jeder Karte. Jeder Fehler kostet 5 Sekunden. Tasten 1, 2, 3.'),S.games.bsBest?L('Best ','Bestzeit ')+fmtSw(S.games.bsBest):L('New','Neu'),'bs')+
   gameCard(L('3 processes · stopwatch','3 Prozesse · Stoppuhr'),L('Deal Process','Deal-Prozess ordnen'),L('Sell-side auction, buy-side deal or German public takeover: put the steps in order. Look-alike wrong steps are mixed in; each wrong tap adds 5 seconds.','Sell-side-Auktion, Buy-side-Deal oder deutsche Übernahme: bring die Schritte in Reihenfolge. Ähnlich klingende falsche Schritte sind dazwischen; jeder falsche Tipp kostet 5 Sekunden.'),['sell','buy','wpug'].filter(function(k){return procBest(k);}).length+' / 3 '+L('played','gespielt'),'proc')+
   ['market','excel','updown','mult','mental'].map(function(id){var C=QUIZ[id],b=quizBest(id);return gameCard(C.tag,esc(C.t),C.p,b?L('Best ','Bestzeit ')+fmtSw(b):L('New','Neu'),'q_'+id);}).join('')+
   gameCard(L('5 LBOs · stopwatch','5 LBOs · Stoppuhr'),'Paper LBO Sprint',L('Entry, debt, growth, exit: work out the money multiple and the IRR in your head. Each wrong answer adds 10 seconds.','Einstieg, Schulden, Wachstum, Exit: Money Multiple und IRR im Kopf rechnen. Jede falsche Antwort kostet 10 Sekunden.'),S.games.lboBest?L('Best ','Bestzeit ')+fmtSw(S.games.lboBest):L('New','Neu'),'lbo')+
   '<a class="panel sec" href="cases.html"><span class="num">'+L('Case stories','Fallgeschichten')+'</span><h3>'+L('Play through a deal','Einen Deal durchspielen')+'</h3><p>'+L('One acquisition, chapter by chapter: strategy, valuation, takeover law, financing, contract, squeeze-out. A decision or a calculation in every chapter.','Eine Übernahme, Kapitel für Kapitel: Strategie, Bewertung, Übernahmerecht, Finanzierung, Vertrag, Squeeze-out. In jedem Kapitel eine Entscheidung oder Rechnung.')+'</p><span class="go">'+L('Open →','Öffnen →')+'</span></a></div>';
  $$('[data-g]',V).forEach(function(b){b.onclick=function(){START[b.dataset.g]();};});
}
function gameCard(tag,t,p,best,k,extra){return '<div class="panel sec"><span class="num">'+esc(tag)+' · '+esc(best)+'</span><h3>'+t+'</h3><p>'+p+'</p><div class="row" style="margin-top:auto"><button class="btn" data-g="'+k+'" style="margin-top:10px">'+L('Play','Spielen')+'</button>'+(extra||'')+'</div></div>';}

/* ---------- Balance the Books ---------- */
var EXPENSE_LINES=['cogs','opex','da','imp','int','tax'];
function qPrompt(c){
  var q=c.q;
  if(q.type==='book')return L('Book it: enter the change in each total. The balance sheet must balance.','Buche: gib die Veränderung jeder Summe ein. Die Bilanz muss aufgehen.');
  if(q.type==='claim')return L('True or false? <b>','Richtig oder falsch? <b>')+esc(claimText(q.pos,q.val))+'.</b>';
  if(q.type==='which')return L('Which <b>','Welche Posten der <b>')+ST_NAME[q.st]+L('</b> positions change? Tick every one, or “Nothing changes”.','</b> verändern sich? Markiere alle, oder „Nichts ändert sich“.');
  return L('What is the change in <b>','Wie verändert sich <b>')+esc(POS_NAME[q.pos])+'</b>?'+(EXPENSE_LINES.indexOf(q.pos)>-1?' <span class="muted">'+L('(a higher expense is positive)','(höherer Aufwand ist positiv)')+'</span>':q.pos==='gain'?' <span class="muted">'+L('(a loss is negative)','(ein Verlust ist negativ)')+'</span>':'');
}
function numInput(id,label){return '<span class="lin"><input id="'+id+'" inputmode="decimal" autocomplete="off" placeholder="0" aria-label="'+esc(label)+'"><button type="button" class="pm" data-pm="'+id+'" aria-label="'+L('Flip sign of ','Vorzeichen umkehren: ')+esc(label)+'">±</button></span>';}
function qForm(c){
  var q=c.q,body,hint;
  if(q.type==='book'){
    var grp=function(title,keys){return '<div class="lg"><span class="label">'+title+'</span>'+keys.map(function(k){var fd=LEDGER_FIELDS.filter(function(x){return x[0]===k;})[0];
      return '<label class="lf"><span>'+fd[1]+'</span>'+numInput('lf-'+k,fd[1])+'</label>';}).join('')+'</div>';};
    body='<div class="lgrid">'+grp(L('Income statement','GuV'),['ni'])+grp(L('Cash flow statement','Kapitalflussrechnung'),['cash'])+grp(L('Balance sheet','Bilanz'),['a','l','e'])+'</div><div class="lbal" id="lbal"></div>';
    hint=L('Blank = 0 · Enter books · ± flips the sign','Leer = 0 · Enter bucht · ± dreht das Vorzeichen');
  }else if(q.type==='which'){
    body='<div class="chips lwhich">'+POS[q.st].map(function(p){return '<button type="button" class="chip" data-w="'+p[0]+'" aria-pressed="false">'+esc(p[1])+'</button>';}).join('')+
      '<button type="button" class="chip none" data-w="none" aria-pressed="false">'+L('Nothing changes','Nichts ändert sich')+'</button></div>';
    hint=L('Enter checks','Enter prüft');
  }else if(q.type==='claim'){
    return '<form id="lform" autocomplete="off"><div class="big2" style="margin-top:4px"><button type="button" class="bigbtn" data-tf="1">'+L('True','Richtig')+'<small>'+L('key T','Taste R')+'</small></button><button type="button" class="bigbtn" data-tf="0">'+L('False','Falsch')+'<small>'+L('key F','Taste F')+'</small></button></div>'+
     '<div class="row" style="margin-top:12px"><button type="submit" class="btn" id="lbook" hidden>'+L('Next','Weiter')+'</button><button class="btn ghost" type="button" id="lskip">'+L('Skip','Überspringen')+'</button></div></form>';
  }else{
    body='<div class="lsingle"><label class="lf"><span>'+esc(POS_NAME[q.pos])+'</span>'+numInput('lf-one',POS_NAME[q.pos])+'</label></div>';
    hint=L('Blank = 0 · Enter checks','Leer = 0 · Enter prüft');
  }
  return '<form id="lform" autocomplete="off">'+body+
   '<div class="row" style="margin-top:12px"><button class="btn" type="submit" id="lbook">'+(q.type==='book'?L('Book it','Buchen'):L('Check','Prüfen'))+'</button><button class="btn ghost" type="button" id="lskip">'+L('Skip','Überspringen')+'</button><span class="muted">'+hint+'</span></div></form>';
}
function readNum(el){var p=parseNum(el.value);return el.value.trim()===''?0:(p.length?p[0]:NaN);}
function readLedger(){var v={};LEDGER_FIELDS.forEach(function(x){v[x[0]]=readNum($('#lf-'+x[0]));});return v;}
function balanceLine(){
  var el=$('#lbal');if(!el)return null;var v=readLedger();
  if([v.a,v.l,v.e].some(function(x){return !isFinite(x);})){el.className='lbal no';el.textContent=L('Enter numbers only.','Nur Zahlen eingeben.');return v;}
  var d=v.a-(v.l+v.e);
  el.className='lbal '+(Math.abs(d)<0.005?'ok':'no');
  el.innerHTML=L('Assets ','Aktiva ')+ln(v.a)+' − (liabilities '+ln(v.l)+' + equity '+ln(v.e)+') = <b class="mono">'+ln(rd(d,2))+'</b> '+(Math.abs(d)<0.005?L('✓ balances','✓ geht auf'):L('✗ does not balance','✗ geht nicht auf'));
  return v;
}
/* Short correct answer for the feedback line. */
function qAnswer(c){
  var q=c.q;
  if(q.type==='book')return LEDGER_FIELDS.map(function(x){return x[1]+' '+ln(c[x[0]]);}).join(' · ');
  if(q.type==='which'){var ch=changed(c,q.st);return ch.length?ch.map(function(k){return POS_NAME[k];}).join(', '):L('nothing changes on the ','nichts ändert sich in der ')+ST_NAME[q.st];}
  if(q.type==='claim'){var tr=claimTrue(c.d,[q.pos,q.val]);return (tr?L('True','Richtig'):L('False','Falsch'))+(tr&&typeof q.val==='number'?'':'. '+claimText(q.pos,c.d[q.pos]));}
  return POS_NAME[q.pos]+' '+ln(c.d[q.pos])+(c.d[q.pos]===0?L(' (no change)','(keine Veränderung)'):'');
}
/* Full solution: every line that moves, per statement, then the walk-through. */
function qSolution(c){
  var col=function(st,title){var ch=changed(c,st);return '<div class="lg"><span class="label">'+title+'</span>'+(ch.length?ch.map(function(k){return '<div class="row" style="justify-content:space-between;flex-wrap:nowrap"><span>'+esc(POS_NAME[k])+'</span><b class="mono">'+ln(c.d[k])+'</b></div>';}).join(''):'<span class="muted">'+L('No change','Keine Veränderung')+'</span>')+'</div>';};
  return '<div class="lsol">'+col('is',L('Income statement <span class="tag">(expenses as +)</span>','GuV <span class="tag">(Aufwand als +)</span>'))+col('cf',L('Cash flow statement','Kapitalflussrechnung'))+col('bs',L('Balance sheet','Bilanz'))+'</div>'+
    '<div class="steps">'+L('Income statement: ','GuV:              ')+esc(c.is)+L('\nCash flow:        ','\nCashflow:         ')+esc(c.cf)+L('\nBalance sheet:    ','\nBilanz:           ')+esc(c.bs)+'</div>';
}
/* Wire the current form. onAnswer receives {ok, mark()}; mark() colours the inputs after the answer. */
function wireQ(c,onAnswer,onSkip){
  var q=c.q;document.onkeydown=null;
  $$('#lform [data-pm]').forEach(function(b){b.onclick=function(){var i=$('#'+b.dataset.pm);var s=i.value.trim();
    if(!s||s==='0'){i.value='-';}else if(/^[-−]/.test(s))i.value=s.replace(/^[-−]/,'');else i.value='-'+s;i.focus();balanceLine();};});
  $('#lskip').onclick=onSkip;
  if(q.type==='book'){
    $$('#lform input').forEach(function(i){i.oninput=balanceLine;});
    $('#lform').onsubmit=function(e){e.preventDefault();
      var v=balanceLine();
      if(LEDGER_FIELDS.some(function(x){return !isFinite(v[x[0]]);}))return;
      if(Math.abs(v.a-(v.l+v.e))>=0.005){var b=$('#lbal');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return;}
      var wrong=LEDGER_FIELDS.filter(function(x){return Math.abs(v[x[0]]-c[x[0]])>0.01;}).map(function(x){return x[0];});
      onAnswer({ok:!wrong.length,given:LEDGER_FIELDS.map(function(x){return x[1]+' '+ln(v[x[0]]);}).join(' \u00b7 '),mark:function(){LEDGER_FIELDS.forEach(function(x){$('#lf-'+x[0]).classList.add(wrong.indexOf(x[0])<0?'good':'bad');});}});};
    balanceLine();$('#lf-ni').focus();
  }else if(q.type==='which'){
    $$('#lform [data-w]').forEach(function(b){b.onclick=function(){
      var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);
      if(on&&b.dataset.w==='none')$$('#lform [data-w]').forEach(function(x){if(x!==b)x.setAttribute('aria-pressed','false');});
      if(on&&b.dataset.w!=='none')$('#lform [data-w="none"]').setAttribute('aria-pressed','false');};});
    $('#lform').onsubmit=function(e){e.preventDefault();
      var sel=$$('#lform [data-w][aria-pressed="true"]').map(function(b){return b.dataset.w;});
      if(!sel.length){DD.toast(L('Tick the positions that change, or “Nothing changes”.','Markiere die Posten, die sich ändern, oder „Nichts ändert sich“.'));return;}
      sel=sel.filter(function(k){return k!=='none';});
      var ch=changed(c,q.st),ok=sel.length===ch.length&&ch.every(function(k){return sel.indexOf(k)>-1;});
      onAnswer({ok:ok,given:sel.length?sel.map(function(k){return POS_NAME[k];}).join(', '):L('Nothing changes','Nichts ändert sich'),mark:function(){$$('#lform [data-w]').forEach(function(b){var k=b.dataset.w,should=k==='none'?!ch.length:ch.indexOf(k)>-1,picked=b.getAttribute('aria-pressed')==='true';
        b.disabled=true;if(should)b.classList.add(picked?'good':'missed');else if(picked)b.classList.add('bad');});}});};
    var first=$('#lform [data-w]');if(first)first.focus();
  }else if(q.type==='claim'){
    var tr=claimTrue(c.d,[q.pos,q.val]);
    var pickTF=function(v){if($('#lform').dataset.done)return;$('#lform').dataset.done='1';document.onkeydown=null;var ok=v===tr;
      onAnswer({ok:ok,given:v?L('True','Richtig'):L('False','Falsch'),mark:function(){$$('#lform [data-tf]').forEach(function(b){var bv=b.dataset.tf==='1';b.disabled=true;if(bv===tr)b.classList.add('good');else if(bv===v)b.classList.add('bad');});}});};
    $$('#lform [data-tf]').forEach(function(b){b.onclick=function(){pickTF(b.dataset.tf==='1');};});
    $('#lform').onsubmit=function(e){e.preventDefault();};
    document.onkeydown=function(e){if(e.target&&e.target.tagName==='INPUT')return;if(e.key==='t'||e.key==='T'||e.key==='r'||e.key==='R')pickTF(true);if(e.key==='f'||e.key==='F')pickTF(false);};
  }else{
    $('#lform').onsubmit=function(e){e.preventDefault();var v=readNum($('#lf-one'));if(!isFinite(v))return;
      var ok=Math.abs(v-c.d[q.pos])<=0.01;onAnswer({ok:ok,given:POS_NAME[q.pos]+' '+ln(v),mark:function(){$('#lf-one').classList.add(ok?'good':'bad');}});};
    $('#lf-one').focus();
  }
}
function fmtSw(ms){var s=ms/1000;return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0');}
/* ---------- test progress, unlocking, mistakes ---------- */
function testState(level,n){var lt=S.games.lt||{};return (lt[level]||{})[n]||null;}
function isUnlocked(level,n){if(n===1)return true;var p=testState(level,n-1);return !!(p&&p.pass);}
function passedCount(level){var c=0;for(var n=1;n<=LEDGER_TESTS;n++){var t=testState(level,n);if(t&&t.pass)c++;}return c;}
function mistakeId(c){return String(hashStr(c.txt+'|'+JSON.stringify(c.q)));}
function addMistake(c,from){
  S.mistakes=S.mistakes||[];var id=mistakeId(c);
  S.mistakes=S.mistakes.filter(function(m){return m.id!==id;});
  S.mistakes.push({id:id,from:from,c:JSON.parse(JSON.stringify(c))});
  if(S.mistakes.length>60)S.mistakes=S.mistakes.slice(-60);
}
function removeMistake(id){S.mistakes=(S.mistakes||[]).filter(function(m){return m.id!==id;});}

/* Games → Balance the Books: Easy / Medium / Hard / Mistakes. */
function ledgerMenu(){
  stopTimers();G=null;
  history.replaceState(null,'','games.html?g=ledger');
  var nm=(S.mistakes||[]).length;
  V.innerHTML='<div class="term wide"><div class="termhead"><span>Balance the Books</span><button class="btn ghost small" id="gQuit">'+L('All games','Alle Spiele')+'</button></div>'+
   L('<h2 style="margin:4px 0 6px">Book it. Make it balance. Beat the clock.</h2>','<h2 style="margin:4px 0 6px">Buchen. Ausgleichen. Die Uhr schlagen.</h2>')+
   '<p class="lead" style="margin-top:0">'+L('Ten fixed tests per level, the same questions for everyone, so times are directly comparable. Each test has ','Zehn feste Tests pro Level, für alle dieselben Fragen, damit Zeiten direkt vergleichbar sind. Jeder Test hat ')+LEDGER_ROUND+L(' transactions and four kinds of question: book the totals, tick which positions change, give the change in one line, or judge a statement true or false. Watch for traps. The clock counts up; every wrong answer adds ',' Geschäftsvorfälle und vier Fragetypen: Summen buchen, veränderte Posten markieren, die Veränderung eines Postens angeben oder eine Aussage als richtig oder falsch beurteilen. Achte auf Fallen. Die Uhr läuft vorwärts; jede falsche Antwort kostet ')+(LEDGER_PENALTY/1000)+L(' seconds. Score ',' Sekunden. Erreiche ')+LEDGER_PASS+' of '+LEDGER_ROUND+L(' to unlock the next test.</p>',' für den nächsten Test.</p>')+
   '<div class="grid lvlgrid" style="margin-top:18px">'+Object.keys(LEDGER_LEVELS).map(function(k){var LV=LEDGER_LEVELS[k],p=passedCount(k);
     return '<button class="panel sec lvlcard" data-lv="'+k+'"><span class="num">'+p+L(' of ',' von ')+LEDGER_TESTS+L(' tests passed</span><h3>',' Tests bestanden</span><h3>')+LV.name+'</h3><p>'+LV.d+'</p><span class="bar2" style="margin-top:auto"><i style="width:'+(p/LEDGER_TESTS*100)+'%"></i></span></button>';}).join('')+
   '<button class="panel sec lvlcard mistakes" data-mx="1"'+(nm?'':' disabled')+'><span class="num">'+nm+' '+(nm===1?L('question','Frage'):L('questions','Fragen'))+'</span><h3>'+L('Mistakes','Fehler')+'</h3><p>'+(nm?L('Every question you got wrong, from tests and practice. Answer one correctly and it leaves the list.','Jede Frage, die du in Tests und Übung falsch hattest. Beantworte sie richtig, dann verschwindet sie.'):L('Nothing here yet. Questions you get wrong collect here.','Noch leer. Hier sammeln sich Fragen, die du falsch beantwortest.'))+'</p></button>'+
   '</div></div>';
  $('#gQuit').onclick=renderMenu;
  $$('[data-lv]',V).forEach(function(b){b.onclick=function(){levelPage(b.dataset.lv);};});
  var mx=$('[data-mx]',V);if(mx&&nm)mx.onclick=startMistakes;
}

/* One level: tests 1–10 (locked until the previous one is passed), plus random practice. */
function levelPage(level){
  stopTimers();G=null;
  history.replaceState(null,'','games.html?g=ledger&lvl='+level);
  var LV=LEDGER_LEVELS[level];
  V.innerHTML='<div class="term wide"><div class="termhead"><span>Balance the Books · '+LV.name+'</span><button class="btn ghost small" id="gQuit">'+L('All levels','Alle Level')+'</button></div>'+
   '<h2 style="margin:4px 0 6px">'+LV.name+L(' tests',' – Tests')+'</h2><p class="muted" style="margin:0 0 16px">'+LV.d+L(' Score ',' Erreiche ')+LEDGER_PASS+'/'+LEDGER_ROUND+L(' to unlock the next test.</p>',' für den nächsten Test.</p>')+
   '<div class="tests">'+Array.apply(null,{length:LEDGER_TESTS}).map(function(_,i){var n=i+1,st=testState(level,n),open=isUnlocked(level,n);
     return '<button class="testtile'+(open?'':' locked')+(st&&st.pass?' passed':'')+'" data-t="'+n+'"'+(open?'':' disabled aria-label="Test '+n+', locked"')+'>'+
      '<span class="tn">'+(open?'':'🔒 ')+L('Test ','Test ')+n+'</span>'+
      (st?'<span class="tb mono">'+fmtSw(st.best)+'</span><span class="ts">Best '+st.bestCorrect+'/'+LEDGER_ROUND+(st.pass?' ✓':'')+'</span>'
         :'<span class="ts">'+(open?L('Not played','Nicht gespielt'):L('Pass test ','Bestehe Test ')+(n-1)+L(' to unlock',' zum Freischalten'))+'</span>')+'</button>';}).join('')+'</div>'+
   '<div class="row" style="margin-top:18px"><button class="btn ghost" id="lpr">'+L('Practice random '+LV.name.toLowerCase()+' questions','Zufällige Fragen üben ('+LV.name+')')+'</button><a class="btn ghost" href="leaderboard.html?b='+testBoard(level,1)+L('">Test leaderboards</a></div></div>','">Ranglisten der Tests</a></div></div>');
  $('#gQuit').onclick=ledgerMenu;
  $$('[data-t]',V).forEach(function(b){if(!b.disabled)b.onclick=function(){startLedger(level,+b.dataset.t);};});
  $('#lpr').onclick=function(){startLedgerPractice(level);};
}

function startLedger(level,n){
  stopTimers();
  if(!isUnlocked(level,n))return levelPage(level);
  var board=testBoard(level,n),cards=testCards(level,n),title='Balance the Books · '+LEDGER_LEVELS[level].name+' · Test '+n;
  history.replaceState(null,'','games.html?g=ledger&lvl='+level+'&test='+n);
  begin(board,function(run){
    G={k:'ledger',level:level,test:n,run:run,n:0,wrong:0,c:cards[0],log:[],last:'',t0:Date.now()};
    var total=function(){return Date.now()-G.t0+G.wrong*LEDGER_PENALTY;};
    var draw=function(){
      gameShell(title,'<span class="timer" id="tmr">'+fmtSw(total())+'</span>',
       '<div class="bar2" style="margin-bottom:12px"><i style="width:'+(G.n/LEDGER_ROUND*100)+'%"></i></div>'+
       '<div class="qcard" id="gc"><div class="qtopic">'+L('Question ','Frage ')+''+(G.n+1)+L(' of ',' von ')+LEDGER_ROUND+(G.wrong?' · <span style="color:var(--bad)">+'+(G.wrong*LEDGER_PENALTY/1000)+L('s penalty</span>',' s Strafzeit</span>'):'')+'</div><div class="qtext" id="gt">'+G.c.txt+'</div><p class="qask">'+qPrompt(G.c)+'</p>'+qForm(G.c)+
       '<div id="gl" class="muted" style="margin-top:12px;min-height:22px">'+G.last+'</div></div><p class="muted" style="margin-top:10px">'+L('Taxes are paid in cash at the rate shown. Net income flows to the top of the cash flow statement and into retained earnings; the change in cash flows into cash on the balance sheet.','Steuern werden zum angegebenen Satz sofort bar gezahlt. Der Jahresüberschuss fließt an den Anfang der Kapitalflussrechnung und in die Gewinnrücklagen; die Veränderung der Kasse fließt in die Kasse der Bilanz.')+'</p>');
      $('#gQuit').onclick=function(){stopTimers();G=null;levelPage(level);};
      wireQ(G.c,book,skip);
    };
    var next=function(ok,v,label){
      G.log.push({c:G.c,ok:ok,given:v});G.n++;if(!ok){G.wrong++;addMistake(G.c,LEDGER_LEVELS[level].name+' test '+n);}track('L:'+G.c.k,ok);
      G.last=label;
      if(G.n>=LEDGER_ROUND)return finish();
      G.c=cards[G.n];draw();flash(ok);
    };
    var book=function(res){if(!G||G.over)return;var ok=res.ok;
      next(ok,res.given,ok?L('✓ Correct.','✓ Richtig.'):'✗ +'+(LEDGER_PENALTY/1000)+L('s. Should be: ',' s. Richtig wäre: ')+esc(qAnswer(G.c)));};
    var skip=function(){if(!G||G.over)return;next(false,L('Skipped','Übersprungen'),L('Skipped, +','Übersprungen, +')+(LEDGER_PENALTY/1000)+L('s. Answer: ',' s. Antwort: ')+esc(qAnswer(G.c)));};
    var finish=function(){
      stopTimers();G.over=true;
      var ms=total(),right=LEDGER_ROUND-G.wrong,pass=right>=LEDGER_PASS;
      S.games.lt=S.games.lt||{};S.games.lt[level]=S.games.lt[level]||{};
      var prev=S.games.lt[level][n],wasPass=!!(prev&&prev.pass),best=!prev||ms<prev.best;
      S.games.lt[level][n]={best:best?ms:prev.best,bestCorrect:Math.max(right,prev?prev.bestCorrect:0),pass:wasPass||pass,plays:(prev?prev.plays:0)+1};
      touchDay();save();
      var miss=G.log.filter(function(x){return !x.ok;});
      var review='<h3 style="margin:22px 0 10px">'+L('Your answers ','Deine Antworten ')+'<span class="muted" style="font-weight:500">'+right+L(' correct · ',' richtig · ')+miss.length+''+L(' wrong',' falsch')+'</span></h3>'+G.log.map(function(x,i){
        return '<div class="rv '+(x.ok?'ok':'no')+'"><div class="rvh"><b>'+(x.ok?'✓':'✗')+' '+(i+1)+'. '+(x.ok?L('Correct','Richtig'):x.given===L('Skipped','Übersprungen')?L('Skipped','Übersprungen'):L('Wrong','Falsch'))+'</b></div>'+
          '<p>'+x.c.txt+'</p><p class="qask">'+qPrompt(x.c)+'</p>'+
          '<p class="rva">'+(x.ok?'':'<span class="rvyou">'+L('Your answer: ','Deine Antwort: ')+''+esc(x.given||'')+'</span><br>')+'<span class="rvok">'+L('Correct answer: ','Richtige Antwort: ')+''+esc(qAnswer(x.c))+'</span></p>'+
          '<details'+(x.ok?'':' open')+'><summary class="muted">'+L('Full solution','Vollständige Lösung')+'</summary>'+qSolution(x.c)+'</details></div>';}).join('');
      var status=pass?(!wasPass&&n<LEDGER_TESTS?'<div class="notice" style="margin-top:12px">'+L('✓ Passed. <b>Test ','✓ Bestanden. <b>Test ')+''+(n+1)+L(' is unlocked.</b></div>',' ist freigeschaltet.</b></div>'):'<div class="notice" style="margin-top:12px">'+L('✓ Passed.','✓ Bestanden.')+'</div>')
        :'<div class="note" style="margin-top:12px">'+right+'/'+LEDGER_ROUND+L(': you need ',': du brauchst ')+LEDGER_PASS+L(' to pass',' zum Bestehen')+(n<LEDGER_TESTS&&!wasPass?L(' and unlock test ',' und Test ')+(n+1):'')+'.'+(miss.length?L(' Your wrong answers are in <b>Mistakes</b>.',' Deine falschen Antworten sind unter <b>Fehler</b>.'):'')+'</div>';
      var run=G.run;
      endScreen(title,fmtSw(ms),right+L(' of ',' von ')+LEDGER_ROUND+L(' correct',' richtig')+(G.wrong?' · '+G.wrong+' × '+(LEDGER_PENALTY/1000)+L('s penalty included',' s Strafzeit enthalten'):'')+(best?L(' · new personal best',' · neue persönliche Bestzeit'):L(' · personal best ',' · persönliche Bestzeit ')+fmtSw(prev.best)),
        function(){startLedger(level,n);},status+revisionHint(G.log.map(function(x){return 'L:'+x.c.k;}))+'<div id="cmp" style="margin-top:16px"></div>'+review);
      $('#gAgain').textContent=L('Retry test ','Test wiederholen ')+n;
      $('#gBack').textContent=L('All ','Alle ')+LEDGER_LEVELS[level].name.toLowerCase()+' tests';$('#gBack').onclick=function(){levelPage(level);};
      if(n<LEDGER_TESTS&&isUnlocked(level,n+1)){var nb=document.createElement('button');nb.className='btn navy';nb.textContent=L('Next: test ','Weiter: Test ')+(n+1);nb.onclick=function(){startLedger(level,n+1);};$('#gAgain').parentNode.insertBefore(nb,$('#gBack'));}
      compare(board,ms,prev&&prev.best,run,miss.length,function(m){return (LEDGER_ROUND-m)/LEDGER_ROUND;});
    };
    draw();
    TIMERS.push(setInterval(function(){var el=$('#tmr');if(el&&G&&!G.over)el.textContent=fmtSw(total());},100));
  });
}

/* Result comparison: this run vs your best, your friends and the site average. */
/* acc(m) turns a number of mistakes into accuracy (0..1) for this game. */
function compare(board,ms,prevBest,run,mistakes,acc){
  var el=$('#cmp');if(!el)return;
  var pct=function(m){return m==null||!acc?null:Math.max(0,Math.min(1,acc(m)));};
  var draw=function(rows,note){
    var max=Math.max.apply(null,rows.map(function(x){return x.ms;}));
    var arows=rows.filter(function(x){return x.acc!=null;}).slice().sort(function(a,b){return b.acc-a.acc;});
    el.innerHTML='<div class="panel"><h3 style="margin-bottom:12px">'+L('How you compare','Dein Vergleich')+'</h3>'+
      '<div class="cmph">'+L('Time','Zeit')+' <span class="muted">('+L('incl. penalties','inkl. Strafzeit')+')</span></div><div class="cmp">'+rows.map(function(x){
      return '<div class="cmprow'+(x.me?' me':'')+'"><span class="cmpn">'+esc(x.name)+'</span><span class="cmpbar"><i style="width:'+Math.max(4,x.ms/max*100)+'%"></i></span><span class="mono">'+fmtSw(x.ms)+'</span></div>';}).join('')+'</div>'+
      (arows.length?'<div class="cmph" style="margin-top:14px">'+L('Accuracy','Genauigkeit')+'</div><div class="cmp acc">'+arows.map(function(x){
        return '<div class="cmprow'+(x.me?' me':'')+'"><span class="cmpn">'+esc(x.name)+'</span><span class="cmpbar"><i style="width:'+Math.max(4,x.acc*100)+'%"></i></span><span class="mono">'+f(x.acc*100,0)+' %</span></div>';}).join('')+'</div>':'')+
      (note?'<p class="muted" style="margin:12px 0 0">'+note+'</p>':'')+'</div>';
  };
  if(mistakes===0)celebrate();
  /* First finished run per board; with nobody else to compare against, a target 10% faster than it is shown. */
  S.games.first=S.games.first||{};if(!S.games.first[board]){S.games.first[board]=ms;save();}
  var target={name:L('Target time (10% faster than your first run)','Zielzeit (10 % schneller als dein erster Versuch)'),ms:Math.round(S.games.first[board]*0.9),acc:pct(0)};
  var base=[{name:L('This run','Diese Runde'),ms:ms,me:true,acc:pct(mistakes)}];
  if(prevBest)base.push({name:L('Your previous best','Deine bisherige Bestzeit'),ms:prevBest});
  var withTarget=function(rows){return rows.concat([target]).sort(function(a,b){return a.ms-b.ms;});};
  if(!DD.user){draw(withTarget(base),DD.sb?L('<a href="login.html">Sign in</a> to compare with your friends and the site average.','<a href="login.html">Melde dich an</a>, um dich mit Freunden und dem Durchschnitt zu vergleichen.'):L('Friends and site average appear once the site is connected to Supabase.','Freunde und Durchschnitt erscheinen, sobald die Seite mit Supabase verbunden ist.'));return;}
  if(!run){draw(withTarget(base),L('This run was not ranked, so there is no comparison with others.','Diese Runde wurde nicht gewertet, daher kein Vergleich mit anderen.'));return;}
  el.innerHTML='<p class="muted">'+L('Comparing with friends and the site…','Vergleich mit Freunden und der Seite…')+'</p>';
  DD.submitRun(run,mistakes).then(function(res){
    if(!res||!res.ok){draw(base,L('This run was not ranked','Diese Runde wurde nicht gewertet')+(res&&res.reason?' ('+esc(res.reason)+')':'')+'.');return;}
    DD.sb.rpc('board_compare',{p_board:board}).then(function(c){
      var d=c.data||{},rows=base.slice(0,1);
      rows[0].ms=res.score!=null?res.score:ms;
      if(d.avg_ms)rows.push({name:L('Site average (','Durchschnitt (')+d.players+' player'+(d.players===1?'':'s')+')',ms:Math.round(d.avg_ms),acc:pct(d.avg_mistakes==null?null:+d.avg_mistakes)});
      (d.friends||[]).forEach(function(fr){rows.push({name:fr.display_name,ms:fr.score,acc:pct(fr.mistakes)});});
      if(!(d.players>1)&&!(d.friends&&d.friends.length))rows.push(target);
      rows.sort(function(a,b){return a.ms-b.ms;});
      draw(rows,(d.friends&&d.friends.length?L('Friends show their best time. ','Freunde mit ihrer Bestzeit. '):L('No friends yet: add them by code on your <a href="profile.html#friends">profile</a>. ','Noch keine Freunde: füge sie per Code in deinem <a href="profile.html#friends">Profil</a> hinzu. '))+'<a href="leaderboard.html?b='+board+L('">Full leaderboard →</a>','">Ganze Rangliste →</a>'));
    });
  });
}

/* Untimed practice with a walk-through after every answer. opts: title, deal(prev) → card or null when finished,
   onResult(card, ok), back(), backLabel, done() → html when deal returns null. */
function runPractice(opts){
  stopTimers();
  G={k:'ledgerP',score:0,n:0,c:opts.deal(null)};
  if(!G.c)return opts.empty();
  var draw=function(){
    gameShell(opts.title,L('Score','Punkte')+' <b class="mono">'+G.score+' / '+G.n+'</b>',
     '<div class="qcard" id="gc"><div class="qtopic">'+(opts.label?opts.label(G.c):L('Question ','Frage ')+(G.n+1))+'</div><div class="qtext">'+G.c.txt+'</div><p class="qask">'+qPrompt(G.c)+'</p>'+qForm(G.c)+'<div id="lout"></div></div>'+
     '<p class="muted" style="margin-top:10px">'+L('Taxes are paid in cash at the rate shown. No clock: take your time and read the walk-through.','Steuern werden zum angegebenen Satz sofort bar gezahlt. Ohne Uhr: lass dir Zeit und lies die Lösung.')+'</p>');
    $('#gQuit').textContent=opts.backLabel;$('#gQuit').onclick=opts.back;
    wireQ(G.c,show,function(){show(null);});
  };
  var show=function(res){
    var ok=!!(res&&res.ok);
    G.n++;if(ok)G.score++;track('L:'+G.c.k,ok);opts.onResult(G.c,ok);touchDay();save();
    $$('#lform input').forEach(function(i){i.readOnly=true;});$$('#lform .pm').forEach(function(b){b.disabled=true;});
    if(res)res.mark();
    $('#lbook').textContent=L('Next','Weiter');$('#lbook').hidden=false;$('#lskip').remove();
    $('#lform').onsubmit=function(e){e.preventDefault();var c=opts.deal(G.c);if(!c)return opts.empty();G.c=c;draw();};
    $('#lout').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?L('Correct.','Richtig.'):res?L('Not quite.','Nicht ganz.'):L('Answer:','Antwort:'))+'</b> '+esc(qAnswer(G.c))+qSolution(G.c)+'</div>'+(opts.after?opts.after(G.c,ok):'');
    $('#lbook').focus();
    $('.termhead b').textContent=G.score+' / '+G.n;
    flash(ok);
  };
  draw();
}
function startLedgerPractice(level,focus){
  runPractice({
    title:'Balance the Books · '+(focus?L('focused practice','gezielte Übung'):LEDGER_LEVELS[level].name+L(' practice',' – Übung')),
    deal:function(prev){return ledgerCard(level,prev&&prev.k,focus);},
    onResult:function(c,ok){if(!ok)addMistake(c,(focus?L('Focused practice','Gezielte Übung'):LEDGER_LEVELS[level].name+L(' practice',' – Übung')));},
    after:function(c,ok){return ok||focus?'':revisionHint(['L:'+c.k]);},
    back:focus?ledgerMenu:function(){levelPage(level);},backLabel:focus?L('Levels','Level'):L('All tests','Alle Tests')
  });
}
/* Mistakes: replay every question answered wrongly; a correct answer removes it, a wrong one sends it to the back. */
function startMistakes(){
  var queue=(S.mistakes||[]).map(function(m){return m.id;}),cur=null;
  runPractice({
    title:'Balance the Books · '+L('Mistakes','Fehler'),
    label:function(c){var m=(S.mistakes||[]).filter(function(x){return x.id===cur;})[0];return (S.mistakes||[]).length+' left'+(m?' · from '+esc(m.from):'');},
    deal:function(prev){
      if(prev&&cur&&(S.mistakes||[]).some(function(m){return m.id===cur;}))queue.push(cur);
      while(queue.length){var id=queue.shift(),m=(S.mistakes||[]).filter(function(x){return x.id===id;})[0];if(m){cur=id;return JSON.parse(JSON.stringify(m.c));}}
      return null;},
    onResult:function(c,ok){if(ok)removeMistake(cur);},
    after:function(c,ok){return ok?'<p class="muted" style="margin-top:8px">'+L('Removed from your mistakes.','Aus deinen Fehlern entfernt.')+'</p>':'<p class="muted" style="margin-top:8px">'+L('It stays in your mistakes and comes back later.','Bleibt in deinen Fehlern und kommt später wieder.')+'</p>';},
    empty:function(){stopTimers();G=null;V.innerHTML='<div class="term"><div class="eyebrow">'+L('Mistakes','Fehler')+'</div><h2 style="margin:8px 0 8px">'+L('All cleared.','Alles erledigt.')+'</h2><p class="lead" style="margin-top:0">'+L('You answered every question in your mistakes list correctly.','Du hast alle Fragen aus deiner Fehlerliste richtig beantwortet.')+'</p><div class="row" style="margin-top:18px"><button class="btn" id="mxb">'+L('Back to levels','Zurück zu den Leveln')+'</button></div></div>';$('#mxb').onclick=ledgerMenu;},
    back:ledgerMenu,backLabel:L('Levels','Level')
  });
}

/* ---------- Accretive or Dilutive ----------
   Rule: accretive if the target's earnings yield at the price paid (plus after-tax synergies) beats the blended
   after-tax cost of the money used. Stock costs 1 ÷ buyer P/E; new debt costs rate × (1 − t); cash costs the
   interest it no longer earns × (1 − t). Cards get harder over the minute: premiums, mixes of two or three
   currencies, synergies, different tax rates. Every card stays at least 0.2 percentage points away from break-even. */
var AD_RULE=L('<b>Rule.</b> Accretive if <b>target yield &gt; cost of funds</b>.<br>Target yield = (1 + synergies after tax as % of target earnings) ÷ P/E paid; P/E paid = target P/E × (1 + premium).<br>Cost: stock = 1 ÷ buyer P/E · new debt = rate × (1 − t) · cash = forgone interest × (1 − t). Mixes: weight each by its share.<br>All-stock shortcut: buyer P/E above P/E paid → accretive. Usual ranking: cash cheapest, then debt, then stock, unless the buyer P/E is very high.',
 '<b>Regel.</b> Accretive, wenn <b>Gewinnrendite des Targets &gt; Finanzierungskosten</b>.<br>Gewinnrendite = (1 + Synergien nach Steuern in % des Target-Gewinns) ÷ bezahltes KGV; bezahltes KGV = Target-KGV × (1 + Prämie).<br>Kosten: Aktien = 1 ÷ KGV Käufer · neue Schulden = Zins × (1 − t) · Cash = entgangene Zinsen × (1 − t). Mischungen: nach Anteil gewichten.<br>Abkürzung bei reinem Aktiendeal: KGV Käufer über bezahltem KGV → accretive. Übliche Reihenfolge: Cash am günstigsten, dann Schulden, dann Aktien, außer das Käufer-KGV ist sehr hoch.');
function pct(x){return f(x*100,2)+(LANG==='de'?' %':'%');}
function adCard(n){
  n=n||0;
  var basic=['stock','debt','cash'],mid=basic.concat(['premium','mix','mix']),hard=mid.concat(['mix3','syn','syn','premium']);
  var kind=pick(n<4?basic:n<9?mid:hard),want=Math.random()<0.5;
  for(var tries=0;tries<400;tries++){
    var t=pick(n<4?[25]:[20,25,30])/100,pb=pick([8,10,12,14,15,16,18,20,22,25,30]);
    var pt=pick(kind==='cash'?[20,22,25,28,30,35,40]:[8,9,10,11,12,13,14,15,16,18,20,22,25,28,30]),prem=0,syn=0,w={stock:0,debt:0,cash:0};
    var rd=pick([3,4,5,6,7,8,9,10])/100,rc=pick([1,1.5,2,2.5,3,3.5,4,4.5,5])/100;
    if(kind==='stock'||kind==='debt'||kind==='cash')w[kind]=1;
    if(kind==='premium'){w[pick(['stock','debt'])]=1;prem=pick([.15,.2,.25,.3,.35,.4,.5]);}
    if(kind==='mix'){var pair=pick([['stock','debt'],['stock','cash'],['cash','debt']]),sh=pick([.25,.5,.75]);w[pair[0]]=sh;w[pair[1]]=1-sh;prem=pick([0,.2,.3]);}
    if(kind==='mix3'){var m=pick([[.4,.3,.3],[.5,.25,.25],[.2,.4,.4],[.6,.2,.2],[.3,.5,.2]]);w.stock=m[0];w.debt=m[1];w.cash=m[2];prem=pick([.2,.25,.3]);}
    if(kind==='syn'){var cur=pick(['stock','debt','mix']);if(cur==='mix'){w.stock=.5;w.debt=.5;}else w[cur]=1;prem=pick([.25,.3,.4,.5]);syn=pick([.1,.15,.2,.25,.3,.4]);}
    var paid=pt*(1+prem),yld=(1+syn*(1-t))/paid,cs=1/pb,cd=rd*(1-t),cc=rc*(1-t),cost=w.stock*cs+w.debt*cd+w.cash*cc;
    if(Math.abs(yld-cost)>=0.002&&(yld>cost)===want)break;
  }
  var row=function(k,v){return '<div><span>'+k+'</span><b>'+v+'</b></div>';};
  var fin=[];
  if(w.stock)fin.push((w.stock<1?pct(w.stock)+' ':'')+L('stock','Aktien'));
  if(w.debt)fin.push((w.debt<1?pct(w.debt)+' ':'')+L('new debt at ','neue Schulden zu ')+pct(rd));
  if(w.cash)fin.push((w.cash<1?pct(w.cash)+' ':'')+L('cash earning ','Cash, verzinst mit ')+pct(rc));
  var txt='<div class="adsheet">'+
    (w.stock?row(L('Buyer P/E','KGV Käufer'),f(pb,1)+'×'):'')+
    (prem?row(L('Target P/E','KGV Target'),f(pt,1)+'×')+row(L('Premium','Prämie'),pct(prem)):row(L('P/E paid','Bezahltes KGV'),f(pt,1)+'×'))+
    row(L('Paid with','Bezahlt mit'),fin.join(' · '))+
    ((w.debt||w.cash||syn)?row(L('Tax rate','Steuersatz'),pct(t)):'')+
    (syn?row(L('Synergies (pre-tax)','Synergien (vor Steuern)'),'+'+pct(syn)+L(' of target earnings',' des Target-Gewinns')):'')+'</div>';
  var parts=[];
  if(w.stock)parts.push((w.stock<1?pct(w.stock)+' × ':'')+'1 ÷ '+f(pb,1)+' = '+pct(w.stock*cs));
  if(w.debt)parts.push((w.debt<1?pct(w.debt)+' × ':'')+pct(rd)+' × (1 − '+pct(t)+') = '+pct(w.debt*cd));
  if(w.cash)parts.push((w.cash<1?pct(w.cash)+' × ':'')+pct(rc)+' × (1 − '+pct(t)+') = '+pct(w.cash*cc));
  var why=L('Target yield ','Rendite Target ')+(syn?'(1 + '+pct(syn)+' × (1 − '+pct(t)+')) ÷ ':'1 ÷ ')+(prem?'('+f(pt,1)+' × '+f(1+prem,2)+' = '+f(paid,2)+')':f(paid,1))+' = '+pct(yld)+
    ' '+(yld>cost?'>':'<')+' '+L('cost ','Kosten ')+parts.join(' + ')+(parts.length>1?' = '+pct(cost):'');
  var key=kind==='premium'?'prem':kind==='mix3'?'mix':kind;
  return {kind:key,txt:txt,acc:yld>cost,why:why,y:yld,c:cost,w:w,pb:pb,paid:paid,syn:syn,t:t,rd:rd,rc:rc};
}
function startAD(){
  stopTimers();
  begin('game_ad',function(run){
    G={k:'ad',run:run,score:0,n:0,c:adCard(0),last:'',lastOk:null,log:[]};
    gameShell(L('Accretive or Dilutive?','Accretive oder Dilutive?'),'<span class="timer" id="tmr">1:00</span>','<div class="qcard" id="gc"><div class="qtopic">'+L('Score','Punkte')+' <span class="mono" id="gs">0</span> · '+L('deal','Deal')+' <span class="mono" id="gn">1</span></div><div id="gt">'+G.c.txt+'</div><div class="big2"><button class="bigbtn" data-a="1">Accretive<small>'+L('key A','Taste A')+'</small></button><button class="bigbtn" data-a="0">Dilutive<small>'+L('key D','Taste D')+'</small></button></div><div id="gl" class="adwhy" hidden></div>'+
      '<details class="adrule"><summary class="muted">'+L('Show the rule','Regel anzeigen')+'</summary><p>'+AD_RULE+'</p></details></div>');
    var ans=function(v){if(!G||G.k!=='ad'||G.over)return;var ok=v===G.c.acc;G.n++;G.score+=ok?1:-1;track('AD:'+G.c.kind,ok);G.log.push({ok:ok,txt:G.c.txt.replace(/<\/div><div>/g,' · ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' '),you:v?'Accretive':'Dilutive',ans:G.c.acc?'Accretive':'Dilutive',why:G.c.why});
      var gl=$('#gl');gl.hidden=false;gl.className='adwhy '+(ok?'ok':'no');gl.innerHTML='<b>'+(ok?'✓ ':'✗ ')+(G.c.acc?'Accretive':'Dilutive')+'.</b> '+esc(G.c.why);
      G.c=adCard(G.n);$('#gs').textContent=G.score;$('#gn').textContent=G.n+1;$('#gt').innerHTML=G.c.txt;flash(ok);};
    $$('[data-a]',V).forEach(function(b){b.onclick=function(){ans(b.dataset.a==='1');};});
    timer(60000,function(){var best=G.score>S.games.ad;if(best)S.games.ad=G.score;touchDay();save();var run=G.run;if(G.n>=5&&G.score===G.n)celebrate(L(G.n+' deals, all called right.',G.n+' Deals, alle richtig bewertet.'));
      endScreen(L('Accretive or Dilutive?','Accretive oder Dilutive?'),G.score+L(' points',' Punkte'),G.n+L(' deals called',' Deals bewertet')+(best?L(' · new best',' · neuer Bestwert'):''),startAD,'<div class="adrule" style="margin-top:14px"><p>'+AD_RULE+'</p></div>'+revisionHint(['AD:stock','AD:debt','AD:cash','AD:prem','AD:mix','AD:syn'])+callReview(G.log));rankedResult(run,G.score,'game_ad');});
    document.onkeydown=function(e){if(G&&G.k==='ad'&&!G.over){if(e.key==='a'||e.key==='A'||e.key==='ArrowLeft')ans(true);if(e.key==='d'||e.key==='D'||e.key==='ArrowRight')ans(false);}};
  });
}

/* ---------- Bridge Sort ---------- */
var BRIDGE=[
 [L('Bank loan','Bankkredit'),'add'],[L('Bonds outstanding','Ausstehende Anleihen'),'add'],[L('Drawn revolving credit facility','Gezogene revolvierende Kreditlinie'),'add'],[L('Lease liabilities (IFRS 16)','Leasingverbindlichkeiten (IFRS 16)'),'add'],[L('Unfunded pension obligation','Ungedeckte Pensionsverpflichtung'),'add'],[L('Minority interest','Minderheitsanteile'),'add'],[L('Preferred stock','Vorzugsaktien'),'add'],[L('Out-of-the-money convertible bond','Wandelanleihe aus dem Geld'),'add'],[L('Dividend declared but not yet paid','Beschlossene, noch nicht gezahlte Dividende'),'add'],[L('Earn-out still owed from a past deal','Noch offener Earn-out aus einem früheren Deal'),'add'],[L('Overdue taxes payable','Überfällige Steuerschulden'),'add'],
 [L('Cash at bank','Bankguthaben'),'sub'],[L('Short-term marketable securities','Kurzfristige Wertpapiere'),'sub'],[L('30% stake in an associate','30 %-Beteiligung an einem assoziierten Unternehmen'),'sub'],[L('Non-operating real estate held for sale','Nicht betriebsnotwendige Immobilie zum Verkauf'),'sub'],[L('Loan granted to a third party','An Dritte vergebenes Darlehen'),'sub'],[L('Value of tax loss carry-forwards','Wert steuerlicher Verlustvorträge'),'sub'],
 [L('Trade payables','Lieferantenverbindlichkeiten'),'none'],[L('Trade receivables','Forderungen aus L+L'),'none'],['Inventory','none'],[L('Deferred revenue','Erhaltene Anzahlungen'),'none'],[L('Warranty provision','Gewährleistungsrückstellung'),'none'],[L('Accrued wages','Abgegrenzte Löhne'),'none'],[L('Prepaid expenses','Aktive Rechnungsabgrenzung'),'none'],['PP&E','none'],['Goodwill','none'],[L('Retained earnings','Gewinnrücklagen'),'none'],[L('In-the-money convertible (counted as shares)','Wandelanleihe im Geld (als Aktien gezählt)'),'none']];
var BLABEL={add:L('Add','Addieren'),sub:L('Subtract','Abziehen'),none:L('Not in bridge','Nicht in der Bridge')};
/* End-of-game list of every call, green if right, red if wrong. */
function callReview(log){
  if(!log.length)return '';
  var right=log.filter(function(x){return x.ok;}).length;
  return '<h3 style="margin:22px 0 10px">'+L('Your answers ','Deine Antworten ')+'<span class="muted" style="font-weight:500">'+right+L(' correct · ',' richtig · ')+(log.length-right)+''+L(' wrong',' falsch')+'</span></h3><div class="rvlist">'+
    log.map(function(x,i){return '<div class="rv '+(x.ok?'ok':'no')+' rvrow"><b>'+(x.ok?'\u2713':'\u2717')+' '+(i+1)+'.</b><span class="rvt">'+x.txt+'</span><span>'+(x.ok?esc(x.ans):L('You: ','Du: ')+esc(x.you)+' \u00b7 <b>'+esc(x.ans)+'</b>')+'</span><span class="muted rvw">'+esc(x.why)+'</span></div>';}).join('')+'</div>';
}
/* Each card has a direction: equity value → EV, or EV → equity value. Debt-like items are added on the way to EV
   and subtracted on the way back; cash-like items the opposite; operating items never move. */
var BS_N=15,BS_PEN=5000;
function bsAnswer(cat,dir){return cat==='none'?'none':dir==='e2v'?cat:(cat==='add'?'sub':'add');}
function bsWhy(item,cat){
  if(cat==='add')return item+L(' is debt-like: add it from equity to EV, subtract it from EV to equity.',' ist schuldenähnlich: von Equity zu EV addieren, von EV zu Equity abziehen.');
  if(cat==='sub')return item+L(' is cash-like or non-operating: subtract it from equity to EV, add it from EV to equity.',' ist cash-ähnlich oder nicht betriebsnotwendig: von Equity zu EV abziehen, von EV zu Equity addieren.');
  return item+L(' is an operating or equity item: it is never in the bridge.',' ist ein operativer oder Eigenkapital-Posten: nie in der Bridge.');
}
function bsDir(dir){return dir==='e2v'?L('Equity value → Enterprise value','Equity Value → Enterprise Value'):L('Enterprise value → Equity value','Enterprise Value → Equity Value');}
function startBS(){
  stopTimers();
  begin('game_bs',function(run){
    var deck=shuffle(BRIDGE.slice()).slice(0,BS_N).map(function(it){return {item:it[0],cat:it[1],dir:Math.random()<0.5?'e2v':'v2e'};});
    G={k:'bs',run:run,n:0,wrong:0,deck:deck,log:[],t0:Date.now()};
    var total=function(){return Date.now()-G.t0+G.wrong*BS_PEN;};
    gameShell('Bridge Sort','<span class="timer" id="tmr">0:00.0</span>','<div class="bar2" style="margin-bottom:12px"><i id="bsbar" style="width:0%"></i></div><div class="qcard" id="gc"><div class="qtopic"><span id="gs">1</span> / '+BS_N+'<span id="gpen"></span></div>'+
     '<div class="bsdir" id="gdir"></div><div class="qtext" id="gt" style="font-size:24px;font-weight:700;margin-top:8px"></div>'+
     '<div class="big3"><button class="bigbtn" data-b="add">'+L('+ Add','+ Addieren')+'<small>'+L('key 1','Taste 1')+'</small></button><button class="bigbtn" data-b="sub">'+L('− Subtract','− Abziehen')+'<small>'+L('key 2','Taste 2')+'</small></button><button class="bigbtn" data-b="none">'+L('Not in bridge','Nicht in der Bridge')+'<small>'+L('key 3','Taste 3')+'</small></button></div><div id="gl" class="adwhy" hidden></div></div>');
    var show=function(){var c=G.deck[G.n];$('#gdir').innerHTML=bsDir(c.dir);$('#gdir').className='bsdir '+c.dir;$('#gt').textContent=c.item;$('#gs').textContent=G.n+1;$('#bsbar').style.width=(G.n/BS_N*100)+'%';};
    var finish=function(){
      stopTimers();G.over=true;
      var ms=total(),prev=S.games.bsBest||null,best=!prev||ms<prev;if(best)S.games.bsBest=ms;touchDay();save();
      var run=G.run,right=BS_N-G.wrong;
      endScreen('Bridge Sort',fmtSw(ms),right+L(' of ',' von ')+BS_N+L(' correct',' richtig')+(G.wrong?' · '+G.wrong+' × '+(BS_PEN/1000)+L('s penalty included',' s Strafzeit enthalten'):'')+(best?L(' · new personal best',' · neue persönliche Bestzeit'):''),startBS,
        revisionHint(['BS:add','BS:sub','BS:none'])+'<div id="cmp" style="margin-top:16px"></div>'+callReview(G.log));
      compare('game_bs',ms,prev,run,G.wrong,function(m){return (BS_N-m)/BS_N;});
    };
    var ans=function(v){if(!G||G.k!=='bs'||G.over)return;var c=G.deck[G.n],right=bsAnswer(c.cat,c.dir),ok=v===right;
      if(!ok){G.wrong++;S.bsMiss=(S.bsMiss||[]).filter(function(x){return x!==c.item;}).concat([c.item]).slice(-8);}
      track('BS:'+c.cat,ok);
      G.log.push({ok:ok,txt:esc(c.item)+' <span class="muted">('+esc(bsDir(c.dir))+')</span>',you:BLABEL[v],ans:BLABEL[right],why:bsWhy(c.item,c.cat)});
      var gl=$('#gl');gl.hidden=false;gl.className='adwhy '+(ok?'ok':'no');gl.innerHTML='<b>'+(ok?'✓ ':'✗ +'+(BS_PEN/1000)+L('s · ',' s · '))+BLABEL[right]+'.</b> '+esc(bsWhy(c.item,c.cat));
      if(G.wrong)$('#gpen').innerHTML=' · <span style="color:var(--bad)">+'+(G.wrong*BS_PEN/1000)+L('s penalty',' s Strafzeit')+'</span>';
      G.n++;flash(ok);if(G.n>=BS_N)return finish();show();};
    $$('[data-b]',V).forEach(function(b){b.onclick=function(){ans(b.dataset.b);};});
    show();
    TIMERS.push(setInterval(function(){var el=$('#tmr');if(el&&G&&!G.over)el.textContent=fmtSw(total());},100));
    document.onkeydown=function(e){if(G&&G.k==='bs'&&!G.over){if(e.key==='1')ans('add');if(e.key==='2')ans('sub');if(e.key==='3')ans('none');}};
  });
}

/* ---------- Deal Process: three games (sell-side, buy-side, WpÜG). Tap the real steps in order; look-alike wrong steps
   are mixed in. A wrong tap (wrong order or a decoy) adds 5 seconds. ---------- */
var PROC_PEN=5000,PROC_DECOYS=3;
var PROC_ROUNDS=[
 {k:'sell',t:L('Sell-side auction','Sell-side-Auktion'),decoys:[
   [L('Binding offers before the data room opens','Bindende Angebote vor Öffnung des Datenraums'),L('Binding offers come after due diligence in the data room.','Bindende Angebote kommen erst nach der Due Diligence im Datenraum.')],
   [L('Information memorandum to all buyers before they sign an NDA','Informationsmemorandum an alle Käufer, bevor sie ein NDA unterschreiben'),L('The IM is confidential: NDA first, then IM.','Das IM ist vertraulich: erst NDA, dann IM.')],
   [L('Closing first, merger control filing afterwards','Erst Closing, danach Anmeldung zur Fusionskontrolle'),L('Closing before clearance is gun-jumping and can be fined.','Closing vor der Freigabe ist Gun-Jumping und kann Bußgelder auslösen.')],
   [L('Publish the decision to sell under § 10 WpÜG','Verkaufsentscheidung nach § 10 WpÜG veröffentlichen'),L('§ 10 WpÜG applies to bidders for listed companies, not to a private sale.','§ 10 WpÜG gilt für Bieter bei börsennotierten Gesellschaften, nicht für einen privaten Verkauf.')],
   [L('Exclusivity for one buyer before the teaser goes out','Exklusivität für einen Käufer, bevor der Teaser rausgeht'),L('An auction keeps competition alive; exclusivity comes at the very end, if at all.','Eine Auktion lebt vom Wettbewerb; Exklusivität kommt, wenn überhaupt, ganz am Ende.')]],steps:[
   L('Mandate and preparation: equity story, vendor due diligence, buyer list','Mandat und Vorbereitung: Equity Story, Vendor Due Diligence, Käuferliste'),
   L('Anonymous teaser to the short list','Anonymer Teaser an die Short List'),
   L('Buyers sign an NDA','Käufer unterschreiben ein NDA'),
   L('Information memorandum and process letter','Informationsmemorandum und Process Letter'),
   L('Non-binding offers (round 1)','Indikative Angebote (Runde 1)'),
   L('Data room, management presentation, due diligence','Datenraum, Management-Präsentation, Due Diligence'),
   L('Binding offers with SPA mark-up','Bindende Angebote mit SPA-Markup'),
   L('Signing','Signing'),
   L('Closing conditions: merger control, FDI','Vollzugsbedingungen: Fusionskontrolle, Investitionsprüfung'),
   L('Closing: shares and money change hands','Closing: Anteile und Geld wechseln den Besitzer')]},
 {k:'buy',t:L('Buy-side (corporate M&A)','Buy-side (Corporate M&A)'),decoys:[
   [L('Sign the SPA, then start due diligence','SPA unterschreiben, dann Due Diligence starten'),L('Due diligence comes before signing; afterwards you only have warranties.','Due Diligence kommt vor dem Signing; danach bleiben nur Garantien.')],
   [L('Integrate the target on the day of signing','Target am Tag des Signings integrieren'),L('Until closing the companies are separate; integrating early is gun-jumping.','Bis zum Closing sind die Firmen getrennt; früh zu integrieren ist Gun-Jumping.')],
   [L('Board approval after the SPA is signed','Gremienbeschluss nach Unterschrift des SPA'),L('The board approves before you sign and commit the company.','Das Gremium stimmt zu, bevor du unterschreibst und die Firma bindest.')],
   [L('Send a teaser to potential buyers','Teaser an potenzielle Käufer schicken'),L('That is the sell-side.','Das ist die Sell-side.')],
   [L('Binding offer before you have seen any numbers','Bindendes Angebot, bevor du Zahlen gesehen hast'),L('First an indicative valuation and LOI, binding only after due diligence.','Erst indikative Bewertung und LOI, bindend erst nach der Due Diligence.')]],steps:[
   L('Strategy and acquisition criteria','Strategie und Akquisitionskriterien'),
   L('Screening: long list, then short list','Screening: Long List, dann Short List'),
   L('Approach the target, sign an NDA','Target ansprechen, NDA unterschreiben'),
   L('First valuation and letter of intent','Erste Bewertung und Absichtserklärung (LOI)'),
   L('Due diligence with advisers','Due Diligence mit Beratern'),
   L('Final valuation, financing, board approval','Finale Bewertung, Finanzierung, Gremienvorlage'),
   L('Negotiate and sign the SPA','SPA verhandeln und unterschreiben'),
   L('Clearances and closing','Freigaben und Closing'),
   L('Post-merger integration','Post-Merger-Integration')]},
 {k:'wpug',t:L('German public takeover (WpÜG)','Öffentliche Übernahme in Deutschland (WpÜG)'),decoys:[
   [L('File the offer document with BaFin within 2 weeks','Angebotsunterlage bei der BaFin binnen 2 Wochen einreichen'),L('The deadline is 4 weeks after publishing the decision (§ 14).','Die Frist sind 4 Wochen nach Veröffentlichung der Entscheidung (§ 14).')],
   [L('Additional acceptance period of 4 weeks','Weitere Annahmefrist von 4 Wochen'),L('The additional period is 2 weeks (§ 16 (2)).','Die weitere Annahmefrist beträgt 2 Wochen (§ 16 Abs. 2).')],
   [L('Squeeze-out of minorities from 75%','Squeeze-out der Minderheitsaktionäre ab 75 %'),L('Squeeze-out needs 90% (merger squeeze-out) or 95%. 75% is the threshold for a domination agreement.','Squeeze-out braucht 90 % (verschmelzungsrechtlich) oder 95 %. 75 % ist die Schwelle für einen Beherrschungsvertrag.')],
   [L('Reasoned statement by the supervisory board only','Begründete Stellungnahme nur durch den Aufsichtsrat'),L('Both the management board and the supervisory board must comment (§ 27).','Vorstand und Aufsichtsrat müssen beide Stellung nehmen (§ 27).')],
   [L('Acceptance period starts when the decision is published (§ 10)','Annahmefrist beginnt mit Veröffentlichung der Entscheidung (§ 10)'),L('It starts when the approved offer document is published.','Sie beginnt mit Veröffentlichung der gestatteten Angebotsunterlage.')]],steps:[
   L('Publish the decision to make an offer (§ 10)','Entscheidung zur Abgabe eines Angebots veröffentlichen (§ 10)'),
   L('File the offer document with BaFin (within 4 weeks)','Angebotsunterlage bei der BaFin einreichen (binnen 4 Wochen)'),
   L('BaFin approves, offer document published: acceptance period starts','BaFin gestattet, Angebotsunterlage veröffentlicht: Annahmefrist beginnt'),
   L('Reasoned statement of management and supervisory board (§ 27)','Begründete Stellungnahme von Vorstand und Aufsichtsrat (§ 27)'),
   L('Acceptance period ends, results published','Annahmefrist endet, Ergebnis wird veröffentlicht'),
   L('Additional acceptance period of 2 weeks','Weitere Annahmefrist von 2 Wochen'),
   L('Settlement after regulatory clearances','Vollzug nach behördlichen Freigaben'),
   L('Squeeze-out of remaining minorities','Squeeze-out der verbleibenden Minderheitsaktionäre')]}
];
var PROC_BY={};PROC_ROUNDS.forEach(function(R){PROC_BY[R.k]=R;});
function procBest(k){return (S.games.procBest2||{})[k]||null;}
function procMenu(){
  stopTimers();G=null;history.replaceState(null,'','games.html?g=proc');
  V.innerHTML='<a class="ilink" href="games.html" id="pmBack">← '+L('All games','Alle Spiele')+'</a><h2 style="margin:10px 0 6px">'+L('Deal Process','Deal-Prozess ordnen')+'</h2><p class="lead" style="margin-top:0">'+L('Pick a process. Each has its own leaderboard.','Wähle einen Prozess. Jeder hat eine eigene Rangliste.')+'</p><div class="grid g2" style="margin-top:14px">'+
    ['sell','buy','wpug'].map(function(k){var R=PROC_BY[k],b=procBest(k);return gameCard(R.steps.length+L(' steps · ',' Schritte · ')+PROC_DECOYS+L(' traps',' Fallen'),esc(R.t),'',b?L('Best ','Bestzeit ')+fmtSw(b):L('New','Neu'),'proc_'+k);}).join('')+'</div>';
  $('#pmBack').onclick=function(e){e.preventDefault();renderMenu();};
  $$('[data-g]',V).forEach(function(b){b.onclick=function(){START[b.dataset.g]();};});
}
function startProc(k){
  var R=PROC_BY[k];if(!R){renderMenu();return;}
  stopTimers();
  begin('game_process_'+k,function(run){
    var dec=shuffle(R.decoys.slice()).slice(0,PROC_DECOYS);
    G={k:'proc',run:run,next:0,wrong:0,hit:{},t0:Date.now(),dec:dec};
    var total=function(){return Date.now()-G.t0+G.wrong*PROC_PEN;};
    var pool=shuffle(R.steps.map(function(x,i){return {t:x,i:i};}).concat(dec.map(function(d,j){return {t:d[0],d:j};})));
    gameShell(esc(R.t),'<span class="timer" id="tmr">'+fmtSw(total())+'</span>',
     '<div class="qcard" id="gc"><div class="qtopic">'+esc(R.t)+'<span id="gpen"></span></div>'+
     '<p class="muted" style="margin:6px 0 12px">'+L('Tap the steps in the order they happen. Careful: '+dec.length+' of the cards are wrong and do not belong in the process.','Tippe die Schritte in der Reihenfolge an, in der sie passieren. Vorsicht: '+dec.length+' Karten sind falsch und gehören nicht in den Prozess.')+'</p>'+
     '<ol class="procdone" id="pdone"></ol><div class="procpool" id="ppool">'+pool.map(function(x){return '<button class="procbtn" '+(x.d!=null?'data-d="'+x.d+'"':'data-i="'+x.i+'"')+'>'+esc(x.t)+'</button>';}).join('')+'</div></div>');
    $('#gQuit').onclick=function(){stopTimers();G=null;renderMenu();};
    var pen=function(){$('#gpen').innerHTML=' · <span style="color:var(--bad)">+'+(G.wrong*PROC_PEN/1000)+L('s penalty',' s Strafzeit')+'</span>';};
    var shake=function(b){b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake','bad');};
    $$('#ppool [data-i]').forEach(function(b){b.onclick=function(){if(!G||G.over)return;var i=+b.dataset.i;
      if(i===G.next){b.remove();$('#pdone').insertAdjacentHTML('beforeend','<li>'+esc(R.steps[i])+'</li>');G.next++;if(G.next>=R.steps.length)finish();}
      else{G.wrong++;shake(b);setTimeout(function(){b.classList.remove('bad');},500);pen();}};});
    $$('#ppool [data-d]').forEach(function(b){b.onclick=function(){if(!G||G.over)return;var j=+b.dataset.d;G.wrong++;G.hit[j]=1;shake(b);b.disabled=true;b.classList.add('decoy');
      b.innerHTML='<s>'+esc(dec[j][0])+'</s><small>'+esc(dec[j][1])+'</small>';pen();};});
    var finish=function(){
      stopTimers();G.over=true;var ms=total(),prev=procBest(k),best=!prev||ms<prev;if(best){S.games.procBest2=S.games.procBest2||{};S.games.procBest2[k]=ms;}touchDay();save();
      var review='<div class="rv ok"><div class="rvh"><b>'+L('The right order','Die richtige Reihenfolge')+'</b></div><ol class="procdone">'+R.steps.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ol></div>'+
        '<div class="rv no"><div class="rvh"><b>'+L('The traps','Die Fallen')+'</b></div>'+dec.map(function(d,j){return '<p style="margin:8px 0"><b>'+(G.hit[j]?'✗ ':'✓ ')+esc(d[0])+'</b><br><span class="muted">'+esc(d[1])+'</span></p>';}).join('')+'</div>';
      endScreen(esc(R.t),fmtSw(ms),(G.wrong?G.wrong+' × '+(PROC_PEN/1000)+L('s penalty included',' s Strafzeit enthalten'):L('No wrong taps','Kein falscher Tipp'))+(best?L(' · new personal best',' · neue persönliche Bestzeit'):''),function(){startProc(k);},
        '<div id="cmp" style="margin-top:16px"></div>'+review);
      compare('game_process_'+k,ms,prev,G.run,G.wrong,function(m){var n=R.steps.length;return n/(n+m);});
    };
    TIMERS.push(setInterval(function(){var el=$('#tmr');if(el&&G&&!G.over)el.textContent=fmtSw(total());},100));
  });
}

/* ---------- Quick-fire games (js/data/gamebank.js): Market Reaction, Excel, Up or Down, Multiples, Mental Maths.
   n cards drawn from a bank, stopwatch, each wrong answer adds pen ms. Wrong answers show the explanation first. ---------- */
var QUIZ={
 market:{board:'game_market',n:12,pen:5000,t:L('Market Reaction','Marktreaktion'),tag:L('12 cards · stopwatch','12 Karten · Stoppuhr'),
   p:L('How do target, acquirer and bondholders react? True or false and up or down, from the M&A research: cash vs stock, LBOs, arbitrage, bondholders.','Wie reagieren Target, Käufer und Anleihegläubiger? Wahr oder falsch und steigt oder sinkt, aus der M&A-Forschung: Cash vs. Aktien, LBOs, Arbitrage, Anleihen.'),
   bank:function(){return MARKET_BANK;}},
 excel:{board:'game_excel',n:12,pen:5000,t:L('Excel Sprint','Excel-Sprint'),tag:L('12 cards · stopwatch','12 Karten · Stoppuhr'),
   p:L('Shortcuts, model formulas and error spotting: absolute references, NPV pitfalls, revolver and cash sweep, lookups.','Shortcuts, Modellformeln und Fehlersuche: absolute Bezüge, NPV-Fallen, Revolver und Cash Sweep, Suchfunktionen.'),
   bank:function(){return EXCEL_BANK;},shuffle:true},
 updown:{board:'game_updown',n:15,pen:5000,t:L('Up or Down?','Steigt oder sinkt?'),tag:L('15 cards · stopwatch','15 Karten · Stoppuhr'),
   p:L('One driver changes. Does the value go up, down or stay? WACC, bridge, FCF, accretion, LBO, accounting. Keys 1, 2, 3.','Ein Treiber ändert sich. Steigt der Wert, sinkt er oder bleibt er? WACC, Bridge, FCF, Accretion, LBO, Accounting. Tasten 1, 2, 3.'),
   bank:function(){return UPDOWN_BANK;}},
 mult:{board:'game_multiples',n:10,pen:5000,t:L('Multiple Match','Multiple-Match'),tag:L('10 cards · stopwatch','10 Karten · Stoppuhr'),
   p:L('Banks, REITs, oil and gas, airlines, SaaS: which multiple fits, and which ones are inconsistent?','Banken, REITs, Öl und Gas, Airlines, SaaS: welches Multiple passt, und welche sind inkonsistent?'),
   bank:function(){return MULT_BANK;},shuffle:true},
 mental:{board:'game_mental',n:15,pen:5000,t:L('Mental Maths','Kopfrechnen'),tag:L('15 sums · stopwatch','15 Aufgaben · Stoppuhr'),
   p:L('Percentages, multiples, growth rates, fractions, after-tax values. No calculator, as in the interview.','Prozente, Multiples, Wachstumsraten, Brüche, Werte nach Steuern. Ohne Taschenrechner, wie im Interview.'),
   gen:mentalCard}
};
function quizBest(id){return (S.games.qbest||{})[id]||null;}
function startQuiz(id){
  var C=QUIZ[id];if(!C){renderMenu();return;}
  stopTimers();
  begin(C.board,function(run){
    var deck=C.gen?Array.apply(null,Array(C.n)).map(function(){return C.gen();}):shuffle(C.bank().slice()).slice(0,C.n);
    G={k:'quiz',id:id,run:run,i:0,wrong:0,log:[],t0:Date.now(),wait:false};
    var total=function(){return Date.now()-G.t0+G.wrong*C.pen;};
    var draw=function(){
      var c=deck[G.i],order=c.num!=null?null:(C.shuffle?shuffle(c.o.map(function(_,i){return i;})):c.o.map(function(_,i){return i;}));G.order=order;
      gameShell(esc(C.t),'<span class="timer" id="tmr">'+fmtSw(total())+'</span>',
       '<div class="bar2" style="margin-bottom:12px"><i style="width:'+(G.i/C.n*100)+'%"></i></div>'+
       '<div class="qcard" id="gc"><div class="qtopic">'+(G.i+1)+' / '+C.n+'<span id="gpen">'+(G.wrong?' · <span style="color:var(--bad)">+'+(G.wrong*C.pen/1000)+L('s penalty',' s Strafzeit')+'</span>':'')+'</span></div>'+
       '<div class="qtext">'+esc(c.q)+'</div>'+
       (c.num!=null?'<form class="ans" id="qf" autocomplete="off"><input id="qin" inputmode="decimal" placeholder="'+L('Answer','Antwort')+'"><button class="btn" type="submit">'+L('Check','Prüfen')+'</button></form>'
         :'<div class="qopts">'+order.map(function(oi,j){return '<button class="btn ghost qopt" data-o="'+oi+'"><span class="mono muted">'+(j+1)+'</span> '+esc(c.o[oi])+'</button>';}).join('')+'</div>')+
       '<div id="qfb"></div></div>');
      $('#gQuit').onclick=function(){stopTimers();G=null;renderMenu();};
      if(c.num!=null){$('#qin').focus();$('#qf').onsubmit=function(e){e.preventDefault();if(G.wait){next();return;}var v=parseNum($('#qin').value);if(!v.length)return;
        answer(v.some(function(x){return Math.abs(x-c.num)<=c.tol;}),$('#qin').value,f(c.num,2));};}
      else $$('[data-o]').forEach(function(b){b.onclick=function(){if(!G.wait)answer(+b.dataset.o===c.a,c.o[+b.dataset.o],c.o[c.a],b);};});
    };
    var answer=function(ok,you,right,btn){
      if(!G||G.over||G.wait)return;var c=deck[G.i];
      G.log.push({ok:ok,txt:esc(c.q),you:you,ans:right,why:c.w});
      if(!ok)G.wrong++;flash(ok);
      if(btn){btn.classList.add(ok?'good':'bad');if(!ok)$$('[data-o]').forEach(function(b){if(+b.dataset.o===c.a)b.classList.add('good');});}
      if(ok){G.wait=true;setTimeout(next,350);return;}
      G.wait=true;$('#qfb').innerHTML='<div class="fb no"><b>'+L('Not quite.','Nicht ganz.')+'</b> '+L('Answer: ','Antwort: ')+'<b>'+esc(right)+'</b><br>'+esc(c.w)+'<div class="row" style="margin-top:8px"><button class="btn small" id="qnext">'+L('Next','Weiter')+' ↵</button></div></div>';
      $('#qnext').onclick=next;$('#qnext').focus();
    };
    var next=function(){if(!G||G.over)return;G.wait=false;G.i++;if(G.i>=C.n)return finish();draw();};
    var finish=function(){
      stopTimers();G.over=true;var ms=total(),prev=quizBest(id),best=!prev||ms<prev;if(best){S.games.qbest=S.games.qbest||{};S.games.qbest[id]=ms;}touchDay();save();
      endScreen(esc(C.t),fmtSw(ms),(C.n-G.wrong)+L(' of ',' von ')+C.n+L(' correct',' richtig')+(G.wrong?' · '+G.wrong+' × '+(C.pen/1000)+L('s penalty included',' s Strafzeit enthalten'):'')+(best?L(' · new personal best',' · neue persönliche Bestzeit'):''),function(){startQuiz(id);},
        '<div id="cmp" style="margin-top:16px"></div>'+callReview(G.log));
      compare(C.board,ms,prev,G.run,G.wrong,function(m){return (C.n-m)/C.n;});
    };
    draw();
    document.onkeydown=function(e){if(!G||G.k!=='quiz'||G.over)return;if(G.wait&&(e.key==='Enter'||e.key===' ')&&$('#qnext')){e.preventDefault();next();return;}
      var n=+e.key;if(n>=1&&n<=4&&G.order&&!G.wait){var b=$$('[data-o]')[n-1];if(b)b.click();}};
    TIMERS.push(setInterval(function(){var el=$('#tmr');if(el&&G&&!G.over)el.textContent=fmtSw(total());},100));
  });
}

/* ---------- Paper LBO Sprint: money multiple and IRR in your head ---------- */
var LBO_N=5,LBO_PEN=10000;
function lboCase(){
  var e0=pick([50,60,80,100,120,150,200]),m=pick([6,7,8,9,10,11]),x=pick([3,4,5].filter(function(v){return v<=m-2;})),n=pick([3,4,5,5,6]);
  var g=pick([1.2,1.25,1.3,1.4,1.5,1.6]),e1=Math.round(e0*g),rep=pick([0,.25,.4,.5]),mx=m+pick([-1,0,0,1,2]);
  var ev=e0*m,debt=e0*x,eq=ev-debt,dl=Math.round(debt*(1-rep)),xev=e1*mx,xeq=xev-dl,mom=xeq/eq,irr=(Math.pow(mom,1/n)-1)*100;
  return {e0:e0,m:m,x:x,n:n,e1:e1,rep:rep,mx:mx,ev:ev,debt:debt,eq:eq,dl:dl,xev:xev,xeq:xeq,mom:mom,irr:irr};
}
function startLboSprint(){
  stopTimers();
  begin('game_lbo',function(run){
    var cases=[];while(cases.length<LBO_N){var c=lboCase();if(c.mom>1.1&&c.mom<6)cases.push(c);}
    G={k:'lbo',run:run,n:0,wrong:0,cases:cases,log:[],t0:Date.now()};
    var total=function(){return Date.now()-G.t0+G.wrong*LBO_PEN;};
    var draw=function(last){var c=G.cases[G.n];
      gameShell('Paper LBO Sprint','<span class="timer" id="tmr">'+fmtSw(total())+'</span>',
       '<div class="bar2" style="margin-bottom:12px"><i style="width:'+(G.n/LBO_N*100)+'%"></i></div><div class="qcard" id="gc"><div class="qtopic">LBO '+(G.n+1)+' / '+LBO_N+(G.wrong?' · <span style="color:var(--bad)">+'+(G.wrong*LBO_PEN/1000)+L('s penalty',' s Strafzeit')+'</span>':'')+'</div>'+
       '<div class="adsheet">'+[[L('Entry EBITDA','EBITDA Einstieg'),c.e0],[L('Entry multiple','Einstiegs-Multiple'),f(c.m,1)+'×'],[L('Debt','Schulden'),f(c.x,1)+'× EBITDA'],[L('Holding period','Haltedauer'),c.n+L(' years',' Jahre')],[L('Exit EBITDA','EBITDA Exit'),c.e1],[L('Debt repaid','Getilgt'),pct(c.rep)+L(' of entry debt',' der Einstiegsschulden')],[L('Exit multiple','Exit-Multiple'),f(c.mx,1)+'×']].map(function(r){return '<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>';}).join('')+'</div>'+
       '<form class="row" id="lf" autocomplete="off" style="margin-top:14px;gap:10px"><label class="lf"><span>'+L('Money multiple (×)','Money Multiple (×)')+'</span><input id="lm" inputmode="decimal" style="width:9em" placeholder="2,5"></label><label class="lf"><span>IRR (%)</span><input id="li" inputmode="decimal" style="width:7em" placeholder="20"></label><button class="btn" type="submit" style="align-self:flex-end">'+L('Check','Prüfen')+'</button></form>'+
       '<p class="muted" style="margin:8px 0 0;font-size:13px">'+L('Tolerance: multiple ±0.05×, IRR ±2 points. Anchors: 2× in 5y ≈ 15% · 2.5× ≈ 20% · 3× ≈ 25% · 2× in 3y ≈ 26%.','Toleranz: Multiple ±0,05×, IRR ±2 Punkte. Anker: 2× in 5 J. ≈ 15 % · 2,5× ≈ 20 % · 3× ≈ 25 % · 2× in 3 J. ≈ 26 %.')+'</p>'+
       (last?'<div class="adwhy '+(last.ok?'ok':'no')+'">'+last.html+'</div>':'')+'</div>');
      $('#gQuit').onclick=function(){stopTimers();G=null;renderMenu();};
      $('#lm').focus();
      $('#lf').onsubmit=function(e){e.preventDefault();var vm=parseNum($('#lm').value),vi=parseNum($('#li').value);if(!vm.length||!vi.length)return;
        var okm=vm.some(function(v){return Math.abs(v-c.mom)<=0.05;}),oki=vi.some(function(v){return Math.abs(v-c.irr)<=2;}),wrongs=(okm?0:1)+(oki?0:1);G.wrong+=wrongs;
        var html='<b>'+(wrongs?'✗ +'+(wrongs*LBO_PEN/1000)+L('s · ',' s · '):'✓ ')+'MoM '+f(c.mom,2)+'× · IRR '+f(c.irr,1)+'%</b><br>'+
          L('Entry EV ','Einstiegs-EV ')+c.e0+' × '+f(c.m,1)+' = '+c.ev+' · '+L('debt ','Schulden ')+c.debt+' · '+L('equity ','Eigenkapital ')+c.eq+'<br>'+
          L('Exit EV ','Exit-EV ')+c.e1+' × '+f(c.mx,1)+' = '+f(c.xev,0)+' − '+L('debt left ','Restschulden ')+c.dl+' = '+f(c.xeq,0)+' → '+f(c.xeq,0)+' ÷ '+c.eq+' = '+f(c.mom,2)+'×<br>IRR = '+f(c.mom,2)+'^(1/'+c.n+') − 1 = '+f(c.irr,1)+'%';
        G.log.push({ok:!wrongs,txt:'LBO '+(G.n+1),you:f(vm[0],2)+'× · '+f(vi[0],1)+'%',ans:f(c.mom,2)+'× · '+f(c.irr,1)+'%',why:html.replace(/<br>/g,' · ').replace(/<[^>]+>/g,'')});
        G.n++;flash(!wrongs);if(G.n>=LBO_N)return finish();draw({ok:!wrongs,html:html});};
    };
    var finish=function(){
      stopTimers();G.over=true;var ms=total(),prev=S.games.lboBest||null,best=!prev||ms<prev;if(best)S.games.lboBest=ms;touchDay();save();
      endScreen('Paper LBO Sprint',fmtSw(ms),(G.wrong?G.wrong+' × '+(LBO_PEN/1000)+L('s penalty included',' s Strafzeit enthalten'):L('All correct','Alles richtig'))+(best?L(' · new personal best',' · neue persönliche Bestzeit'):''),startLboSprint,
        revisionHint(['D:mom','D:irr'])+'<div id="cmp" style="margin-top:16px"></div>'+callReview(G.log));
      compare('game_lbo',ms,prev,G.run,G.wrong,function(m){return (2*LBO_N-m)/(2*LBO_N);});
    };
    draw(null);
    TIMERS.push(setInterval(function(){var el=$('#tmr');if(el&&G&&!G.over)el.textContent=fmtSw(total());},100));
  });
}

var START={ledger:function(){var lv=qs('lvl'),tn=+qs('test'),fo=(qs('practice')||'').split(',').filter(function(k){return LEDGER[k];});
  if(fo.length)startLedgerPractice('medium',fo);else if(qs('mistakes'))startMistakes();else if(LEDGER_LEVELS[lv]&&tn>=1&&tn<=LEDGER_TESTS)startLedger(lv,tn);else if(LEDGER_LEVELS[lv])levelPage(lv);else ledgerMenu();},ad:startAD,bs:startBS,proc:function(){if(PROC_BY[qs('p')])startProc(qs('p'));else procMenu();},proc_sell:function(){startProc('sell');},proc_buy:function(){startProc('buy');},proc_wpug:function(){startProc('wpug');},lbo:startLboSprint,q_market:function(){startQuiz('market');},q_excel:function(){startQuiz('excel');},q_updown:function(){startQuiz('updown');},q_mult:function(){startQuiz('mult');},q_mental:function(){startQuiz('mental');}};
DD.ready.then(function(){
  if(document.body.getAttribute('data-page')!=='games')return;
  var g=qs('g');
  if(g&&START[g])START[g]();else renderMenu();
  DD.on('auth',function(){if(!G)renderMenu();});
});

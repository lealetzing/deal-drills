/* Internal review page (not in the navigation, noindex): every piece of static content on one page so it can be
   checked. Drill and ledger questions are generated, so two samples per generator and level are shown. */
(function(){
  var box=document.createElement('div');box.id='review';box.className='review';
  var v=document.getElementById('view');v.hidden=true;v.parentNode.insertBefore(box,v.nextSibling);
  var H=[],toc=[];
  function sec(id,t){toc.push('<a href="#'+id+'">'+t+'</a>');H.push('<h2 id="'+id+'" class="rvsec">'+t+'</h2>');}
  function pre(t){return '<div class="steps">'+esc(t)+'</div>';}
  H.push('<div class="eyebrow">'+L('Internal','Intern')+'</div><h1 style="margin:8px 0 6px">'+L('Content review','Inhalte prüfen')+'</h1><p class="lead" style="margin-top:0">'+L('Everything the site asks, with answers. Not linked in the menu. Report errors with the Feedback button; the section and number help.','Alles, was die Seite fragt, mit Antworten. Nicht im Menü verlinkt. Fehler bitte über den Feedback-Button melden; Abschnitt und Nummer helfen.')+'</p><nav class="rvtoc" id="rvtoc"></nav>');

  sec('drills','Drills');
  ['easy','medium','hard'].forEach(function(lv){
    GEN_LV=lv;H.push('<h3>'+GEN_LEVELS[lv]+'</h3>');
    Object.keys(GEN).forEach(function(k){for(var i=0;i<2;i++){var q=GEN[k].f();
      H.push('<div class="panel rvitem"><div class="qtopic">'+esc(GEN[k].n)+' · '+GEN_LEVELS[lv]+' · '+k+'</div><div>'+q.q+'</div><p style="margin:6px 0 0"><b>'+L('Answer','Antwort')+': '+f(q.a,4)+' '+esc(q.u)+'</b></p>'+pre(q.s)+'</div>');}});
  });
  GEN_LV='medium';

  sec('ledger','Balance the Books');
  Object.keys(LEDGER).forEach(function(k){var c=LEDGER[k]();var tr=TRAPS[k]?TRAPS[k](c.d):[];
    H.push('<div class="panel rvitem"><div class="qtopic">'+k+'</div><div>'+c.txt+'</div>'+pre(L('Income statement: ','GuV: ')+c.is+'\n'+L('Cash flow: ','Cashflow: ')+c.cf+'\n'+L('Balance sheet: ','Bilanz: ')+c.bs)+
      (tr.length?'<p class="muted" style="margin:6px 0 0">'+L('Trap claims (must be false): ','Fallen-Aussagen (müssen falsch sein): ')+tr.map(function(t){return esc(claimText(t[0],t[1]));}).join(' · ')+'</p>':'')+'</div>');});

  sec('cases',L('Case stories','Fallgeschichten'));
  CASES.forEach(function(c){
    H.push('<h3>'+esc(c.title)+(c.level?' <span class="muted">· '+esc(c.level)+'</span>':'')+'</h3><p>'+esc(c.intro)+'</p><p class="muted">'+esc(c.facts)+'</p>');
    c.chapters.forEach(function(ch,i){var a=ch.type==='mc'?ch.opts.map(function(o,j){return (j===ch.ans?'✓ ':'✗ ')+o;}).join('\n'):ch.type==='num'?L('Answer: ','Antwort: ')+f(ch.ans,2)+' '+(ch.unit||''):ch.fields.map(function(fd){return fd[0]+': '+f(fd[1],2);}).join('\n');
      H.push('<div class="panel rvitem"><div class="qtopic">'+(i+1)+'. '+esc(ch.t)+' · '+ch.type+' · '+ch.topic+'</div><p>'+esc(ch.story)+'</p>'+(ch.doc?'<div class="casedoc">'+ch.doc+'</div>':'')+'<p><b>'+esc(ch.q)+'</b></p>'+pre(a)+'<p class="muted" style="margin:6px 0 0">'+esc(ch.explain)+'</p></div>');});
  });

  sec('process',L('Deal process games','Prozess-Spiele'));
  PROC_ROUNDS.forEach(function(R){
    H.push('<div class="panel rvitem"><div class="qtopic">'+esc(R.t)+'</div>'+pre(R.steps.map(function(x,i){return (i+1)+'. '+x;}).join('\n'))+
      '<p style="margin:8px 0 4px"><b>'+L('Traps','Fallen')+'</b></p>'+pre(R.decoys.map(function(d){return '✗ '+d[0]+'\n   → '+d[1];}).join('\n'))+'</div>');});

  sec('quick',L('Quick-fire games','Schnellspiele'));
  [['Market Reaction',MARKET_BANK],['Excel Sprint',EXCEL_BANK],['Up or Down',UPDOWN_BANK],['Multiple Match',MULT_BANK]].forEach(function(b){
    H.push('<h3>'+b[0]+' <span class="muted">· '+b[1].length+'</span></h3>');
    b[1].forEach(function(x,i){H.push('<div class="panel rvitem"><div class="qtopic">'+b[0]+' · '+(i+1)+'</div><p><b>'+esc(x.q)+'</b></p>'+pre(x.o.map(function(o,j){return (j===x.a?'✓ ':'✗ ')+o;}).join('\n'))+'<p class="muted" style="margin:6px 0 0">'+esc(x.w)+'</p></div>');});});
  H.push('<h3>'+L('Mental maths (samples)','Kopfrechnen (Beispiele)')+'</h3>');
  for(var mi=0;mi<12;mi++){var mc=mentalCard();H.push('<div class="panel rvitem"><b>'+esc(mc.q)+'</b> = '+f(mc.num,4)+' <span class="muted">('+esc(mc.w)+')</span></div>');}

  sec('technicals',L('Technical interview questions','Technische Interviewfragen'));
  QB.forEach(function(q){H.push('<div class="panel rvitem"><div class="qtopic">'+q[0]+' · '+esc(CATS[q[1]])+' · '+(q[2]==='b'?'basic':'advanced')+'</div><p><b>'+esc(q[3])+'</b></p><p class="muted" style="margin:0">'+esc(q[4])+'</p></div>');});

  box.innerHTML=H.join('');
  document.getElementById('rvtoc').innerHTML=toc.join(' · ');
})();

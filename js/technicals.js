/* Technical interview questions by topic (js/qbank.js). Model answers are written for this site and are in English,
   like most technical rounds. "Known" marks live in S.games.qk so the flashcard mode can skip them. */
var V=$('#view');
var TCAT_TOPIC={acc:'m1',ev:'m2',val:'m3',dcf:'m4',mm:'m6',pay:'m7',proc:'m8',law:'m9',lbo:'m10'};
var TCAT_ORDER=['acc','ev','val','dcf','mm','pay','proc','law','lbo'];
var TQ={cat:(location.hash||'').slice(1),lv:'all',open:{},deck:null};
if(!CATS[TQ.cat])TQ.cat='all';
function known(){if(!S.games.qk)S.games.qk={};return S.games.qk;}
function tlist(){return QB.filter(function(q){return (TQ.cat==='all'||q[1]===TQ.cat)&&(TQ.lv==='all'||q[2]===TQ.lv);});}
function lvName(l){return l==='b'?L('Basic','Basis'):L('Advanced','Fortgeschritten');}
function ans(t){return esc(t).replace(/\n/g,'<br>');}
function trender(){
  var qs_=tlist(),kn=known(),nk=qs_.filter(function(q){return kn[q[0]];}).length;
  V.innerHTML='<div class="eyebrow">Interview</div><h2 style="margin:8px 0 6px">'+L('Technical questions by topic','Technische Fragen nach Thema')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('Answer out loud first, then open the model answer.','Erst laut antworten, dann die Musterantwort aufklappen.')+(LANG==='de'?' <span class="muted">Fragen und Antworten sind auf Englisch, wie in den meisten Technical-Runden.</span>':'')+'</p>'+
   '<div class="chips" style="margin-top:14px">'+[['all',L('All topics','Alle Themen')]].concat(TCAT_ORDER.map(function(k){return [k,CATS[k]];})).map(function(c){var n=QB.filter(function(q){return c[0]==='all'||q[1]===c[0];}).length;return '<button class="chip" data-c="'+c[0]+'" aria-pressed="'+(TQ.cat===c[0])+'">'+esc(c[1])+' <span class="muted">'+n+'</span></button>';}).join('')+'</div>'+
   '<div class="row" style="margin-top:10px;gap:10px"><div class="chips">'+[['all',L('All levels','Alle Stufen')],['b',lvName('b')],['a',lvName('a')]].map(function(l){return '<button class="chip" data-l="'+l[0]+'" aria-pressed="'+(TQ.lv===l[0])+'">'+l[1]+'</button>';}).join('')+'</div>'+
   '<span class="muted">'+qs_.length+' '+L('questions','Fragen')+' · '+nk+' '+L('known','gewusst')+'</span>'+
   '<button class="btn small" id="tqCards" style="margin-left:auto">'+L('Practise as flashcards','Als Karteikarten üben')+'</button></div>'+
   (TQ.cat!=='all'&&TCAT_TOPIC[TQ.cat]?'<p style="margin:10px 0 0"><a href="topics.html#'+TCAT_TOPIC[TQ.cat]+'">'+L('Read the topic','Thema nachlesen')+' ('+TCAT_TOPIC[TQ.cat].toUpperCase()+') →</a></p>':'')+
   '<div class="tqlist">'+qs_.map(function(q){var o=TQ.open[q[0]];return '<div class="panel tq'+(kn[q[0]]?' known':'')+'" id="q-'+q[0]+'">'+
     '<div class="row tqh"><span class="pill b">'+esc(CATS[q[1]])+'</span><span class="pill">'+lvName(q[2])+'</span>'+(kn[q[0]]?'<span class="pill good">✓ '+L('known','gewusst')+'</span>':'')+'</div>'+
     '<p class="tqq">'+esc(q[3])+'</p>'+
     (o?'<div class="tqa">'+ans(q[4])+'</div><div class="row" style="gap:8px;margin-top:10px"><button class="btn small" data-k="'+q[0]+'">✓ '+L('I know it','Weiß ich')+'</button><button class="btn ghost small" data-r="'+q[0]+'">↻ '+L('Repeat','Wiederholen')+'</button></div>'
       :'<button class="btn ghost small" data-o="'+q[0]+'">'+L('Show model answer','Musterantwort zeigen')+'</button>')+'</div>';}).join('')+'</div>';
  $$('[data-c]',V).forEach(function(b){b.onclick=function(){TQ.cat=b.dataset.c;history.replaceState(null,'',TQ.cat==='all'?'technicals.html':'#'+TQ.cat);trender();};});
  $$('[data-l]',V).forEach(function(b){b.onclick=function(){TQ.lv=b.dataset.l;trender();};});
  $$('[data-o]',V).forEach(function(b){b.onclick=function(){TQ.open[b.dataset.o]=1;trender();};});
  $$('[data-k]',V).forEach(function(b){b.onclick=function(){known()[b.dataset.k]=1;delete TQ.open[b.dataset.k];save();trender();};});
  $$('[data-r]',V).forEach(function(b){b.onclick=function(){delete known()[b.dataset.r];delete TQ.open[b.dataset.r];save();trender();};});
  $('#tqCards').onclick=function(){var kn=known(),d=tlist().filter(function(q){return !kn[q[0]];});if(!d.length)d=tlist();TQ.deck={q:shuffle(d.slice()),n:d.length,k:0,show:false};tcard();};
}
function tcard(){
  var D=TQ.deck;if(!D.q.length)return tdone();
  var q=D.q[0];
  V.innerHTML='<div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="mono muted">'+esc(CATS[q[1]])+' · '+lvName(q[2])+'</span><span class="mono muted">'+D.k+' ✓ · '+D.q.length+' '+L('left','übrig')+'</span><button class="btn ghost small" id="tqStop">'+L('Stop','Beenden')+'</button></div>'+
   '<div class="bar2" style="margin-bottom:14px"><i style="width:'+Math.round(100*D.k/D.n)+'%"></i></div>'+
   '<div class="panel prcard"><p class="prq">'+esc(q[3])+'</p>'+
   (D.show?'<div class="tqa">'+ans(q[4])+'</div><div class="row prbtns"><button class="btn" id="tqK">✓ '+L('I know it','Weiß ich')+'</button><button class="btn ghost" id="tqR">↻ '+L('Repeat','Wiederholen')+'</button></div>'
     :'<p class="muted" style="margin:10px 0 0">'+L('Answer out loud first.','Erst laut antworten.')+'</p><div class="row prbtns"><button class="btn" id="tqShow">'+L('Show model answer','Musterantwort zeigen')+'</button></div>')+'</div>';
  $('#tqStop').onclick=tdone;
  if($('#tqShow'))$('#tqShow').onclick=function(){D.show=true;tcard();};
  if($('#tqK'))$('#tqK').onclick=function(){var c=D.q.shift();known()[c[0]]=1;save();D.k++;D.show=false;tcard();};
  if($('#tqR'))$('#tqR').onclick=function(){var c=D.q.shift();delete known()[c[0]];save();D.q.splice(Math.min(3,D.q.length),0,c);D.show=false;tcard();};
}
function tdone(){var D=TQ.deck;TQ.deck=null;
  V.innerHTML='<div class="panel" style="text-align:center"><h2 style="margin:0 0 6px">'+(D.q.length?L('Stopped.','Beendet.'):L('Deck done.','Stapel durch.'))+'</h2><p class="lead" style="margin:0">'+D.k+' / '+D.n+' '+L('known','gewusst')+'</p>'+
   '<div class="row" style="justify-content:center;margin-top:14px"><button class="btn" id="tqBack">'+L('Back to the list','Zurück zur Liste')+'</button></div></div>';
  $('#tqBack').onclick=trender;}
window.addEventListener('hashchange',function(){var c=location.hash.slice(1);if(CATS[c]&&!TQ.deck){TQ.cat=c;trender();}});
trender();
DD.on('progress',function(){if(!TQ.deck)trender();});

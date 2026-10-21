/* Revision page: weak spots first, then every revision note. */
var V=$('#view');
function keyStat(k){var s=S.stats[k];return s?f(s.c/s.a*100,0)+L('% of ','% von ')+s.a:L('not tried','noch nicht geübt');}
function noteCard(t,weak){
  var extra=t.id==='bridge'&&S.bsMiss&&S.bsMiss.length?'<p class="muted" style="margin-top:10px"><b>'+L('Items you missed recently:','Zuletzt falsch einsortiert:')+'</b> '+S.bsMiss.map(esc).join(', ')+'</p>':'';
  return '<article class="panel revnote'+(weak?' weak':'')+'" id="'+t.id+'"><div class="row" style="justify-content:space-between"><span class="eyebrow">'+esc(t.group)+'</span>'+(weak?'<span class="ranked">'+L('Weak spot','Schwachstelle')+'</span>':'')+'</div>'+
   '<h3 style="margin:6px 0 10px">'+esc(t.title)+'</h3><p class="rule">'+esc(t.rule)+'</p>'+t.note+
   '<pre class="steps revex">'+esc(t.ex)+'</pre>'+extra+
   '<details style="margin-top:10px"><summary class="muted">'+L('Your record','Deine Bilanz')+'</summary><table style="margin-top:6px">'+t.keys.map(function(k){return '<tr><td>'+esc(t.names[k]||k)+'</td><td class="n">'+keyStat(k)+'</td><td class="n">'+(keyWeakness(k)?'<span style="color:var(--bad)">'+recentLine(k)+'</span>':'')+'</td></tr>';}).join('')+'</table></details>'+
   '<div class="row" style="margin-top:14px"><a class="btn" href="'+t.practice+'">'+L('Practise this','Gezielt üben')+'</a>'+(t.practice2?'<a class="btn ghost" href="'+t.practice2+'">'+L('Drill it','Als Übung')+'</a>':'')+'</div></article>';
}
function render(){
  var w=weakTopics(),weakIds=w.map(function(x){return x.t.id;});
  var groups=[];REV.forEach(function(t){if(groups.indexOf(t.group)<0)groups.push(t.group);});
  V.innerHTML='<div class="eyebrow">'+L('Revision','Wiederholen')+'</div><h2 style="margin:8px 0 6px">'+L('Fix what keeps going wrong.','Behebe, was immer wieder schiefgeht.')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('Every game and drill records which concept each question tests. A concept becomes a weak spot when you missed at least 2 of your last 6 attempts.','Jedes Spiel und jede Übung merkt sich, welches Konzept eine Frage prüft. Ein Konzept wird zur Schwachstelle, wenn du mindestens 2 deiner letzten 6 Versuche falsch hattest.')+'</p>'+
   (w.length?'<h3 style="margin:24px 0 10px">'+L('Recommended for you','Für dich empfohlen')+'</h3><div class="grid g2">'+w.map(function(x){return noteCard(x.t,true);}).join('')+'</div>'
     :'<div class="notice" style="margin-top:18px">'+L('No weak spots yet. Play <a href="games.html?g=ledger">Balance the Books</a> or a <a href="drills.html">drill</a> and this page will point you to what needs work.','Noch keine Schwachstellen. Spiele <a href="games.html?g=ledger">Balance the Books</a> oder eine <a href="drills.html">Übung</a>, dann zeigt dir diese Seite, woran du arbeiten solltest.')+'</div>')+
   groups.map(function(g){var ts=REV.filter(function(t){return t.group===g&&weakIds.indexOf(t.id)<0;});if(!ts.length)return '';
     return '<h3 style="margin:28px 0 10px">'+esc(g)+'</h3><div class="grid g2">'+ts.map(function(t){return noteCard(t,false);}).join('')+'</div>';}).join('');
  if(location.hash){var el=document.getElementById(location.hash.slice(1));if(el)el.scrollIntoView();}
}
render();
DD.ready.then(function(){render();DD.on('progress',render);DD.on('auth',render);});

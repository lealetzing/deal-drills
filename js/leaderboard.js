/* Leaderboards: one board per ranked drill mode and game, all-time or this week (Europe/Berlin ISO week). */
var V=$('#view');
var BOARDS=[
  ['drill_sprint','Sprint',L('10 questions, all topics. Fastest time wins; each wrong answer adds 20s.','10 Fragen, alle Themen. Schnellste Zeit gewinnt; jede falsche Antwort kostet 20 s.'),'drills.html?t=all&mode=sprint',1],
  ['drill_timed',L('3 minutes','3 Minuten'),L('As many correct answers as possible in 3 minutes, all topics.','So viele richtige Antworten wie möglich in 3 Minuten, alle Themen.'),'drills.html?t=all&mode=timed'],
  ['books','Balance the Books',L('Fixed test: the same 5 questions for everyone. Fastest time wins; each mistake adds 15s.','Fester Test: für alle dieselben 5 Fragen. Schnellste Zeit gewinnt; jeder Fehler kostet 15 s.'),'',1],
  ['game_ad',L('Accretive or Dilutive','Accretive oder Dilutive'),L('60 seconds. +1 right, −1 wrong.','60 Sekunden. +1 richtig, −1 falsch.'),'games.html?g=ad'],
  ['game_bs','Bridge Sort',L('15 items, both directions. Fastest time wins; each mistake adds 5s.','15 Posten, beide Richtungen. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=bs',1],
  ['game_process_sell',L('Process: sell-side','Prozess: Sell-side'),L('Sell-side auction in order, with look-alike traps. Fastest time wins; each wrong tap adds 5s.','Sell-side-Auktion in Reihenfolge, mit ähnlich klingenden Fallen. Schnellste Zeit gewinnt; jeder falsche Tipp kostet 5 s.'),'games.html?g=proc_sell',1],
  ['game_process_buy',L('Process: buy-side','Prozess: Buy-side'),L('Corporate buy-side process in order, with traps. Fastest time wins; each wrong tap adds 5s.','Corporate-Buy-side-Prozess in Reihenfolge, mit Fallen. Schnellste Zeit gewinnt; jeder falsche Tipp kostet 5 s.'),'games.html?g=proc_buy',1],
  ['game_process_wpug',L('Process: WpÜG','Prozess: WpÜG'),L('German public takeover in order, with traps. Fastest time wins; each wrong tap adds 5s.','Deutsche Übernahme in Reihenfolge, mit Fallen. Schnellste Zeit gewinnt; jeder falsche Tipp kostet 5 s.'),'games.html?g=proc_wpug',1],
  ['game_market',L('Market Reaction','Marktreaktion'),L('12 cards. Fastest time wins; each mistake adds 5s.','12 Karten. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=q_market',1],
  ['game_excel',L('Excel Sprint','Excel-Sprint'),L('12 cards. Fastest time wins; each mistake adds 5s.','12 Karten. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=q_excel',1],
  ['game_updown',L('Up or Down?','Steigt oder sinkt?'),L('15 cards. Fastest time wins; each mistake adds 5s.','15 Karten. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=q_updown',1],
  ['game_multiples',L('Multiple Match','Multiple-Match'),L('10 cards. Fastest time wins; each mistake adds 5s.','10 Karten. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=q_mult',1],
  ['game_mental',L('Mental Maths','Kopfrechnen'),L('15 sums. Fastest time wins; each mistake adds 5s.','15 Aufgaben. Schnellste Zeit gewinnt; jeder Fehler kostet 5 s.'),'games.html?g=q_mental',1],
  ['game_lbo','Paper LBO Sprint',L('Five paper LBOs. Fastest time wins; each wrong answer adds 10s.','Fünf Paper LBOs. Schnellste Zeit gewinnt; jede falsche Antwort kostet 10 s.'),'games.html?g=lbo',1]
];
/* Stopwatch boards: penalty per mistake and mistakes → accuracy, so the table can show accuracy next to time. */
var ACC={books:[15000,function(m){return (5-m)/5;}],game_bs:[5000,function(m){return (15-m)/15;}],
  game_process_sell:[5000,function(m){return 10/(10+m);}],game_process_buy:[5000,function(m){return 9/(9+m);}],game_process_wpug:[5000,function(m){return 8/(8+m);}],
  game_market:[5000,function(m){return (12-m)/12;}],game_excel:[5000,function(m){return (12-m)/12;}],game_updown:[5000,function(m){return (15-m)/15;}],game_multiples:[5000,function(m){return (10-m)/10;}],game_mental:[5000,function(m){return (15-m)/15;}],
  drill_sprint:[20000,function(m){return (10-m)/10;}],game_lbo:[10000,function(m){return (10-m)/10;}]};
function accOf(x){var a=ACC[LB.b];if(!a||x.time_ms==null)return '';var m=Math.max(0,Math.round((x.score-x.time_ms)/a[0]));return f(Math.max(0,a[1](m))*100,0)+' %';}
var LEDGER_LEVEL_NAMES={easy:L('Easy','Leicht'),medium:L('Medium','Mittel'),hard:L('Hard','Schwer')};
var BK=(function(){var m=/^game_ledger_(easy|medium|hard)_(\d+)$/.exec(qs('b')||'');return m?{lv:m[1],t:+m[2]}:{lv:'easy',t:1};})();
function bookBoard(){return 'game_ledger_'+BK.lv+'_'+BK.t;}
/* Drill boards exist per level: drill_sprint (medium), drill_sprint_easy, drill_sprint_hard; same for drill_timed. */
var DL=(function(){var m=/^drill_(sprint|timed)_(easy|hard)$/.exec(qs('b')||'');return m?m[2]:'medium';})();
var LB={b:/^game_ledger_/.test(qs('b')||'')?'books':(qs('b')||'drill_sprint').replace(/_(easy|hard)$/,''),scope:['all','friends'].indexOf(qs('scope'))>-1?qs('scope'):'week'};
if(!BOARDS.some(function(x){return x[0]===LB.b;}))LB.b='drill_sprint';

function isDrill(){return LB.b==='drill_sprint'||LB.b==='drill_timed';}
function boardId(){return LB.b==='books'?bookBoard():isDrill()&&DL!=='medium'?LB.b+'_'+DL:LB.b;}
function render(){
  var bd=BOARDS.filter(function(x){return x[0]===LB.b;})[0];
  var play=LB.b==='books'?'games.html?g=ledger&lvl='+BK.lv+'&test='+BK.t:isDrill()?bd[3]+'&lv='+DL:bd[3];
  V.innerHTML='<div class="eyebrow">'+L('Leaderboard','Rangliste')+'</div><h2 style="margin:8px 0 6px">'+L('Who is fastest?','Wer ist am schnellsten?')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('Ranked runs are timed by the server. Your best result per board counts, once for all time and once for the current week (Monday to Sunday, Berlin time).','Gewertete Runden werden vom Server gestoppt. Dein bestes Ergebnis pro Rangliste zählt, einmal gesamt und einmal für die aktuelle Woche (Montag bis Sonntag, Berliner Zeit).')+'</p>'+
   '<span class="label" style="margin-top:18px">'+L('Board','Rangliste')+'</span><div class="chips">'+BOARDS.map(function(x){return '<button class="chip" data-b="'+x[0]+'" aria-pressed="'+(x[0]===LB.b)+'">'+x[1]+'</button>';}).join('')+'</div>'+
   '<div class="row" style="margin-top:14px"><div class="chips"><button class="chip" data-s="week" aria-pressed="'+(LB.scope==='week')+'">'+L('This week','Diese Woche')+'</button><button class="chip" data-s="all" aria-pressed="'+(LB.scope==='all')+'">'+L('All time','Gesamt')+'</button>'+(DD.user?'<button class="chip" data-s="friends" aria-pressed="'+(LB.scope==='friends')+'">'+L('Friends','Freunde')+'</button>':'')+'</div>'+
   '<span class="muted">'+esc(bd[2])+'</span><a class="btn small" href="'+play+'" style="margin-left:auto">'+L('Play','Spielen')+'</a></div>'+
   (isDrill()?'<div class="row" style="margin-top:12px"><div class="chips">'+['easy','medium','hard'].map(function(l){return '<button class="chip" data-dl="'+l+'" aria-pressed="'+(DL===l)+'">'+LEDGER_LEVEL_NAMES[l]+'</button>';}).join('')+'</div></div>':'')+
   (LB.b==='books'?'<div class="row" style="margin-top:12px"><div class="chips">'+['easy','medium','hard'].map(function(l){return '<button class="chip" data-lv="'+l+'" aria-pressed="'+(BK.lv===l)+'">'+LEDGER_LEVEL_NAMES[l]+'</button>';}).join('')+'</div>'+
     '<label class="muted" for="tsel">Test</label><select id="tsel">'+Array.apply(null,{length:20}).map(function(_,i){return i+1;}).map(function(n){return '<option'+(n===BK.t?' selected':'')+'>'+n+'</option>';}).join('')+'</select></div>':'')+
   '<div id="me" style="margin-top:16px"></div><div class="panel tw" id="tbl" style="margin-top:12px"><p class="muted">'+L('Loading…','Lädt…')+'</p></div>';
  $$('[data-b]',V).forEach(function(b){b.onclick=function(){LB.b=b.dataset.b;sync();render();};});
  $$('[data-s]',V).forEach(function(b){b.onclick=function(){LB.scope=b.dataset.s;sync();render();};});
  $$('[data-lv]',V).forEach(function(b){b.onclick=function(){BK.lv=b.dataset.lv;sync();render();};});
  $$('[data-dl]',V).forEach(function(b){b.onclick=function(){DL=b.dataset.dl;sync();render();};});
  if($('#tsel'))$('#tsel').onchange=function(){BK.t=+this.value;sync();render();};
  load();
}
function sync(){history.replaceState(null,'','?b='+boardId()+'&scope='+LB.scope);}
function fmtSw(ms){var s=ms/1000;return Math.floor(s/60)+':'+(s%60).toFixed(1).padStart(4,'0');}
function load(){
  var t=$('#tbl'),me=$('#me');
  if(!DD.sb){t.innerHTML='<p class="muted">'+L('Leaderboards appear once the site is connected to Supabase (see README).','Ranglisten erscheinen, sobald die Seite mit Supabase verbunden ist (siehe README).')+'</p>';return;}
  var bd=BOARDS.filter(function(x){return x[0]===LB.b;})[0],timeBoard=!!bd[4],tie=false;
  var friendsOnly=LB.scope==='friends'&&DD.user;
  var ids=friendsOnly?DD.sb.from('friends').select('friend_id').then(function(r){return (r.data||[]).map(function(x){return x.friend_id;}).concat([DD.user.id]);}):Promise.resolve(null);
  ids.then(function(ids){
    var q=DD.sb.from('leaderboard').select('user_id,display_name,university,score,time_ms').eq('board',boardId()).eq('scope',friendsOnly?'all':LB.scope);
    if(ids)q=q.in('user_id',ids);
    q=q.order('score',{ascending:timeBoard});
    if(tie)q=q.order('time_ms',{ascending:true,nullsFirst:false});
    return q.order('updated_at',{ascending:true}).limit(100);
  }).then(function(res){
    if(res.error){t.innerHTML='<p class="muted">'+L('Could not load the leaderboard: ','Rangliste konnte nicht geladen werden: ')+esc(res.error.message)+'</p>';return;}
    var rows=res.data||[];
    if(!rows.length){t.innerHTML='<p class="muted">'+(friendsOnly?L('No results from you or your friends yet. Add friends on your <a href="profile.html#friends">profile</a>.','Noch keine Ergebnisse von dir oder deinen Freunden. Füge Freunde in deinem <a href="profile.html#friends">Profil</a> hinzu.'):(LB.scope==='week'?L('No ranked results this week. Be the first.','Diese Woche noch keine Ergebnisse. Sei die oder der Erste.'):L('No ranked results yet. Be the first.','Noch keine Ergebnisse. Sei die oder der Erste.')))+'</p>';return;}
    var rank=0,prev=null;
    t.innerHTML='<table><tr><th class="n">#</th><th>Name</th><th>'+L('University','Universität')+'</th><th class="n">'+(timeBoard?L('Time','Zeit'):L('Score','Punkte'))+'</th>'+(tie?'<th class="n">'+L('Time','Zeit')+'</th>':'')+(ACC[LB.b]?'<th class="n">'+L('Accuracy','Genauigkeit')+'</th>':'')+'</tr>'+
      rows.map(function(x,i){var key=x.score+'|'+(tie?x.time_ms:'');if(key!==prev){rank=i+1;prev=key;}
        if(friendsOnly&&x.user_id===DD.user.id)me.innerHTML='<p>'+L('Your rank among friends: ','Dein Rang unter Freunden: ')+'<b class="mono">#'+rank+'</b>'+L(' of ',' von ')+rows.length+'</p>';
        return '<tr'+(DD.user&&x.user_id===DD.user.id?' class="me"':'')+'><td class="n">'+rank+'</td><td>'+esc(x.display_name)+'</td><td class="muted">'+esc(x.university||'')+'</td><td class="n">'+(timeBoard?fmtSw(x.score):f(x.score,0))+'</td>'+(tie?'<td class="n">'+fmtMs(x.time_ms)+'</td>':'')+(ACC[LB.b]?'<td class="n">'+accOf(x)+'</td>':'')+'</tr>';}).join('')+'</table>';
  });
  if(!DD.user){me.innerHTML=DD.sb?'<div class="notice">'+L('<a href="login.html">Sign in</a> to appear on the leaderboard and compare with friends.','<a href="login.html">Melde dich an</a>, um in der Rangliste zu erscheinen und dich mit Freunden zu vergleichen.')+'</div>':'';return;}
  if(friendsOnly){me.innerHTML='';return;}
  DD.sb.rpc('my_rank',{p_board:boardId(),p_scope:LB.scope}).then(function(res){
    if(res.error||res.data==null){me.innerHTML='<p class="muted">'+(LB.scope==='week'?L('You have no ranked result here this week.','Du hast hier diese Woche noch kein Ergebnis.'):L('You have no ranked result here yet.','Du hast hier noch kein Ergebnis.'))+'</p>';return;}
    me.innerHTML='<p>'+L('Your rank: ','Dein Rang: ')+'<b class="mono">#'+res.data+'</b></p>';
  });
}
DD.ready.then(function(){render();DD.on('auth',render);});

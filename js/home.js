/* Home: pitch, personal stats, section cards, recent sessions. */
var V=$('#view');
function sec(n,t,p,href){return '<a class="panel sec" href="'+href+'"><span class="num">'+n+'</span><h3>'+t+'</h3><p>'+p+'</p><span class="go">'+L('Open →','Öffnen →')+'</span></a>';}
function render(){
  var att=0,cor=0;for(var k in S.topic){att+=S.topic[k].a;cor+=S.topic[k].c;}
  var rec=S.sessions.slice(-6).reverse();
  var hi=DD.profile?L('Welcome back, ','Willkommen zurück, ')+esc(DD.profile.display_name)+'.':L('M&amp;A interview practice','Vorbereitung auf M&amp;A-Interviews');
  var w=weakTopics();
  V.innerHTML='<div class="eyebrow">'+hi+'</div><h1 style="margin-top:10px">'+L('Get fast at deal maths.','Werde schnell im Deal-Rechnen.')+'</h1>'+
  '<p class="lead">'+L('Timed drills on bridges, accretion and LBO returns, an interview question bank, games that train the instincts interviewers test, and a tracker for German M&amp;A, banking, corporate and Big Four applications.',
    'Übungen auf Zeit zu Bridges, Accretion und LBO-Renditen, ein Fragenkatalog für Interviews, Spiele für das Gespür, das Interviewer testen, und ein Tracker für Bewerbungen bei M&amp;A-Boutiquen, Banken, Corporate M&amp;A und Big Four in Deutschland.')+'</p>'+
  '<div class="row" style="margin:20px 0 30px"><a class="btn" href="games.html?g=ledger">'+L('Play Balance the Books','Balance the Books spielen')+'</a><a class="btn ghost" href="drills.html">'+L('Start a drill','Übung starten')+'</a>'+(DD.sb&&!DD.user?'<a class="btn ghost" href="login.html#signup">'+L('Create an account','Konto erstellen')+'</a>':'')+'</div>'+
  (w.length?'<div class="revhint" style="margin-bottom:22px"><b>'+L('Recommended revision','Empfohlene Wiederholung')+'</b><div class="row" style="flex-wrap:nowrap;margin-top:8px"><span style="flex:1;min-width:0">'+w.slice(0,3).map(function(x){return esc(x.t.title);}).join(' · ')+'</span><a class="btn small" href="revise.html#'+w[0].t.id+'">'+L('Revise','Wiederholen')+'</a></div></div>':'')+
  '<div class="grid g4">'+stat(f(att,0),L('drill questions answered','Übungsfragen beantwortet'))+stat(att?f(cor/att*100,0)+'%':'–',L('drill accuracy','Trefferquote'))+stat(streak()+' '+L(streak()===1?'day':'days',streak()===1?'Tag':'Tage'),L('practice streak','Serie'))+stat(S.sessions.length,L('sessions','Sitzungen'))+'</div>'+
  '<div class="grid g3" style="margin-top:22px">'+
   sec('01',L('Topics','Themen'),L('Nine topics from accounting to German takeover law, each with its drills, questions and games.','Neun Themen von Accounting bis Übernahmerecht, jeweils mit Übungen, Fragen und Spielen.'),'topics.html')+
   sec('02','Drills',L('Fifteen generators: EV bridge, diluted shares, WACC, terminal value, accretion, break-even synergies, paper LBO, IRR. Sprint, 3 minutes or practice.','Fünfzehn Aufgabentypen: EV-Bridge, verwässerte Aktien, WACC, Terminal Value, Accretion, Break-even-Synergien, Paper LBO, IRR. Sprint, 3 Minuten oder Übungsmodus.'),'drills.html')+
   sec('03','Interview',L('Interview questions by firm, posted by other candidates. Share yours, anonymously if you like.','Interviewfragen nach Firma, gepostet von anderen Bewerber:innen. Teile deine, auf Wunsch anonym.'),'questions.html')+
   sec('04',L('Games','Spiele'),L('Balance the Books, Accretive or Dilutive, Bridge Sort and a sealed-bid auction.','Balance the Books, Accretive or Dilutive, Bridge Sort und eine verdeckte Auktion.'),'games.html')+
   sec('05',L('Leaderboards','Ranglisten'),L('Ranked runs, timed by the server. Weekly, all-time and with friends.','Gewertete Runden, vom Server gestoppt. Wöchentlich, gesamt und mit Freunden.'),'leaderboard.html')+
   sec('06','Tracker',L('Boutiques, bulge brackets, corporate M&amp;A teams and Big Four in Germany. Save firms and track your applications.','Boutiquen, Bulge Brackets, Corporate-M&amp;A-Teams und Big Four in Deutschland. Firmen merken und Bewerbungen verfolgen.'),'firms.html')+
  '</div>'+
  (DD.sb?'<div class="panel fbhome"><div><h3>'+L('Found a bug? Missing something? Got an idea?','Fehler gefunden? Fehlt etwas? Eine Idee?')+'</h3><p class="muted" style="margin:4px 0 0">'+L('Deal Drills is new. Tell us what to fix or build next; every message is read.','Deal Drills ist neu. Sag uns, was wir reparieren oder als Nächstes bauen sollen; jede Nachricht wird gelesen.')+'</p></div>'+
   '<div class="fbhomebtns">'+FB_KINDS.map(function(k){return '<button class="bigbtn" data-fb="'+k[0]+'"><span aria-hidden="true">'+k[1]+'</span> '+k[2]+'</button>';}).join('')+'</div></div>':'')+
  (rec.length?'<h3 style="margin:30px 0 10px">'+L('Recent sessions','Letzte Sitzungen')+'</h3><div class="panel tw"><table><tr><th>'+L('Date','Datum')+'</th><th>'+L('Mode','Modus')+'</th><th>'+L('Topics','Themen')+'</th><th class="n">'+L('Score','Punkte')+'</th></tr>'+
   rec.map(function(s){return '<tr><td class="mono">'+esc(s.d)+'</td><td>'+esc(s.m)+'</td><td>'+esc(s.t)+'</td><td class="n">'+s.c+' / '+s.n+'</td></tr>';}).join('')+'</table></div>':'');
  $$('[data-fb]',V).forEach(function(b){b.onclick=function(){DD.feedback(b.dataset.fb);};});
}
render();
DD.ready.then(function(){render();DD.on('auth',render);DD.on('progress',render);});

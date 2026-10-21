/* Drills: pick generators and a level, sprint / 3-minute / practice. Runs with all 15 topics in sprint or timed mode are
   ranked per level: the server starts a timer (start_run) and validates the result (submit_run).
   Sprint boards rank by time: server time + 20 s per wrong answer. */
var V=$('#view');
var ALL=Object.keys(GEN);
var DSEL=['ev','ps','acc','mom'];var DMODE='sprint';var D=null;var TIMERS=[];var DLV='medium';var SPRINT_PEN=20000;
(function(){var t=qs('t'),m=qs('mode');
  if(t)DSEL=t==='all'?ALL.slice():t.split(',').filter(function(k){return GEN[k];});
  if(m&&['sprint','timed','practice'].indexOf(m)>-1)DMODE=m;
  var lv=qs('lv');if(GEN_LEVELS[lv])DLV=lv;})();
function stopTimers(){TIMERS.forEach(clearInterval);TIMERS=[];}
function isRanked(){return DMODE!=='practice'&&ALL.every(function(k){return DSEL.indexOf(k)>-1;});}
function board(){return (DMODE==='sprint'?'drill_sprint':'drill_timed')+(DLV==='medium'?'':'_'+DLV);}

function renderSetup(){
  var html='<div class="eyebrow">Drills</div><h2 style="margin:8px 0 6px">'+L('Pick topics, then race the clock.','Themen wählen, dann gegen die Uhr.')+'</h2><p class="lead" style="margin-top:0">'+L('Answers within a small tolerance count. Comma or point as decimal separator both work.','Antworten innerhalb einer kleinen Toleranz zählen. Komma oder Punkt als Dezimaltrennzeichen funktionieren beide.')+'</p>';
  GROUPS.forEach(function(g){
    html+='<span class="label" style="margin-top:18px">'+GROUP_NAME[g]+'</span><div class="chips">';
    for(var k in GEN)if(GEN[k].g===g){var st=S.topic[k];html+='<button class="chip" data-t="'+k+'" aria-pressed="'+(DSEL.indexOf(k)>-1)+'">'+GEN[k].n+(st&&st.a?' <span class="tag">'+f(st.c/st.a*100,0)+'%</span>':'')+'</button>';}
    html+='</div>';});
  html+='<div class="row" style="margin-top:16px"><button class="btn ghost small" id="selAll">'+L('Select all','Alle wählen')+'</button><button class="btn ghost small" id="selNone">'+L('Clear','Leeren')+'</button></div>'+
   '<span class="label" style="margin-top:22px">'+L('Level','Stufe')+'</span><div class="chips">'+['easy','medium','hard'].map(function(l){return '<button class="chip" data-lv="'+l+'" aria-pressed="'+(DLV===l)+'">'+GEN_LEVELS[l]+'</button>';}).join('')+'</div>'+
   '<p class="muted" style="margin:6px 0 0;font-size:13px">'+L('Easy: round numbers, few items. Medium: the standard interview version. Hard: extra items and two-step questions.','Leicht: runde Zahlen, wenige Posten. Mittel: die übliche Interview-Version. Schwer: zusätzliche Posten und Fragen mit zwei Schritten.')+'</p>'+
   '<span class="label" style="margin-top:22px">'+L('Mode','Modus')+'</span><div class="chips">'+
   [['sprint',L('Sprint · 10 questions','Sprint · 10 Fragen')],['timed',L('Timed · 3 minutes','Auf Zeit · 3 Minuten')],['practice',L('Practice · no clock','Übung · ohne Uhr')]].map(function(m){return '<button class="chip" data-m="'+m[0]+'" aria-pressed="'+(DMODE===m[0])+'">'+m[1]+'</button>';}).join('')+'</div>'+
   '<p class="muted" id="rankNote" style="margin-top:14px"></p>'+
   '<div class="row" style="margin-top:10px"><button class="btn" id="dStart">'+L('Start','Start')+'</button><button class="btn ghost" id="dRanked">'+L('Ranked run (all topics)','Gewertete Runde (alle Themen)')+'</button><span class="muted" id="dHint"></span></div>';
  V.innerHTML=html;
  $$('[data-t]',V).forEach(function(b){b.onclick=function(){var k=b.dataset.t,i=DSEL.indexOf(k);if(i>-1)DSEL.splice(i,1);else DSEL.push(k);b.setAttribute('aria-pressed',i<0);rankNote();};});
  $$('[data-lv]',V).forEach(function(b){b.onclick=function(){DLV=b.dataset.lv;$$('[data-lv]',V).forEach(function(x){x.setAttribute('aria-pressed',x===b);});rankNote();};});
  $$('[data-m]',V).forEach(function(b){b.onclick=function(){DMODE=b.dataset.m;$$('[data-m]',V).forEach(function(x){x.setAttribute('aria-pressed',x===b);});rankNote();};});
  $('#selAll').onclick=function(){DSEL=ALL.slice();renderSetup();};
  $('#selNone').onclick=function(){DSEL=[];renderSetup();};
  $('#dStart').onclick=function(){if(!DSEL.length){$('#dHint').textContent=L('Choose at least one topic.','Wähle mindestens ein Thema.');return;}startDrill();};
  $('#dRanked').onclick=function(){DSEL=ALL.slice();if(DMODE==='practice')DMODE='sprint';startDrill();};
  rankNote();
}
function rankNote(){
  var el=$('#rankNote');if(!el)return;
  if(isRanked())el.innerHTML='<span class="ranked">'+L('Ranked','Gewertet')+'</span> '+(DD.user?L('This run counts for the '+(DMODE==='sprint'?'Sprint':'3-minute')+' leaderboard ('+GEN_LEVELS[DLV]+').'+(DMODE==='sprint'?' Fastest time wins; each wrong answer adds 20s.':''),'Diese Runde zählt für die Rangliste '+(DMODE==='sprint'?'Sprint':'3 Minuten')+' ('+GEN_LEVELS[DLV]+').'+(DMODE==='sprint'?' Schnellste Zeit gewinnt; jede falsche Antwort kostet 20 s.':'')):DD.sb?L('<a href="login.html">Sign in</a> to put ranked runs on the leaderboard.','<a href="login.html">Melde dich an</a>, damit gewertete Runden in die Rangliste kommen.'):L('Leaderboards need the site to be connected to Supabase.','Ranglisten brauchen eine Verbindung zu Supabase.'));
  else el.textContent=L('Leaderboards count sprint and 3-minute runs with all 15 topics selected. Custom mixes are practice.','Für die Rangliste zählen Sprint- und 3-Minuten-Runden mit allen 15 Themen. Eigene Mischungen sind Übung.');
}
function startDrill(){
  var ranked=isRanked();
  GEN_LV=DLV;
  D={live:true,mode:DMODE,lv:DLV,topics:DSEL.slice(),i:0,c:0,n:0,per:{},q:null,done:false,ranked:ranked,run:null};
  var go=function(){if(!D)return;D.t0=Date.now();D.end=D.mode==='timed'?D.t0+180000:0;nextQ();};
  if(ranked&&DD.user){V.innerHTML='<div class="term"><p class="muted">'+L('Starting ranked run…','Gewertete Runde startet…')+'</p></div>';
    DD.startRun(board()).then(function(id){D.run=id;if(!id)DD.toast(L('Could not start a ranked run. Playing unranked.','Gewertete Runde konnte nicht starten. Es wird ohne Wertung gespielt.'));go();});}
  else go();
}
function nextQ(){var k=pick(D.topics);D.k=k;GEN_LV=D.lv;D.q=GEN[k].f();D.done=false;D.i++;drawQ();}
function drawQ(){
  var head=D.mode==='sprint'?L('Question ','Frage ')+D.i+L(' of 10',' von 10'):D.mode==='timed'?'<span class="timer" id="tmr"></span>':L('Practice · question ','Übung · Frage ')+D.i;
  V.innerHTML='<div class="term"><div class="termhead"><span>'+head+(D.run?' <span class="ranked">'+L('Ranked','Gewertet')+'</span>':'')+'</span><span>'+L('Score','Punkte')+' <b class="mono" id="sc">'+D.c+' / '+D.n+'</b></span><button class="btn ghost small" id="dQuit">'+L('End','Beenden')+'</button></div>'+
   (D.mode==='sprint'?'<div class="bar2" style="margin-bottom:12px"><i style="width:'+((D.i-1)*10)+'%"></i></div>':'')+
   '<div class="qcard" id="qc"><div class="qtopic">'+GEN[D.k].n+' · '+GEN_LEVELS[D.lv]+'</div><div class="qtext">'+D.q.q+'</div>'+
   '<form class="ans" id="af" autocomplete="off"><input id="ain" inputmode="decimal" aria-label="'+L('Your answer','Deine Antwort')+'" placeholder="'+L('Answer','Antwort')+'"><span class="unit">'+D.q.u+'</span><button class="btn" type="submit">'+L('Check','Prüfen')+'</button></form><div id="afb"></div></div>'+
   '<p class="muted" style="margin-top:10px">'+L('Enter to check, Enter again for the next question.','Enter zum Prüfen, nochmal Enter für die nächste Frage.')+'</p></div>';
  $('#ain').focus();
  $('#af').onsubmit=function(e){e.preventDefault();if(D.done){advance();return;}check();};
  $('#dQuit').onclick=function(){finishDrill(true);};
  if(D.mode==='timed'){var tick=function(){var left=Math.max(0,D.end-Date.now());var el=$('#tmr');if(el){el.textContent=Math.floor(left/60000)+':'+String(Math.floor(left/1000)%60).padStart(2,'0');el.classList.toggle('low',left<30000);}if(left<=0)finishDrill(false);};stopTimers();tick();TIMERS.push(setInterval(tick,250));}
}
function check(){
  var vals=parseNum($('#ain').value);if(!vals.length){$('#ain').focus();return;}
  var q=D.q,tol=Math.max(q.abs||0,(q.rel||0)*Math.abs(q.a));
  var ok=vals.some(function(v){return Math.abs(v-q.a)<=tol+1e-9;});
  D.n++;if(ok)D.c++;D.done=true;
  var t=S.topic[D.k]||{a:0,c:0};t.a++;if(ok)t.c++;S.topic[D.k]=t;
  var p=D.per[D.k]||{a:0,c:0};p.a++;if(ok)p.c++;D.per[D.k]=p;track('D:'+D.k,ok);
  touchDay();save();
  $('#qc').classList.add(ok?'flash-ok':'flash-no');
  $('#afb').innerHTML='<div class="fb '+(ok?'ok':'no')+'"><b>'+(ok?L('Correct.','Richtig.'):L('Not quite.','Nicht ganz.'))+'</b> '+L('Answer:','Antwort:')+' <b class="mono">'+f(q.a,q.a!==0&&Math.abs(q.a)<1?4:2)+' '+q.u+'</b><div class="steps">'+esc(q.s)+'</div></div>';
  $('#ain').readOnly=true;
  $('#sc').textContent=D.c+' / '+D.n;
  if(D.mode==='sprint'&&D.i>=10)$('#af button').textContent=L('Finish','Fertig');
  if(ok&&D.mode==='timed')setTimeout(function(){if(D&&D.live&&D.done)advance();},700);
}
function advance(){if(D.mode==='sprint'&&D.i>=10)return finishDrill(false);if(D.mode==='timed'&&Date.now()>=D.end)return finishDrill(false);nextQ();}
function finishDrill(quit){
  if(!D||!D.live)return;stopTimers();D.live=false;
  var secs=Math.round((Date.now()-D.t0)/1000);
  if(D.n){S.sessions.push({d:today(),m:(D.run?L('Ranked ','Gewertet '):'')+(D.mode==='sprint'?'Sprint':D.mode==='timed'?L('Timed','Auf Zeit'):L('Practice','Übung'))+' · '+GEN_LEVELS[D.lv],t:D.topics.length===ALL.length?L('All topics','Alle Themen'):D.topics.map(function(k){return GEN[k].n;}).join(', ').slice(0,90),c:D.c,n:D.n});if(S.sessions.length>60)S.sessions.shift();save();}
  var complete=D.mode==='sprint'?D.n===10:!quit;
  var rows='';for(var k in D.per)rows+='<tr><td>'+GEN[k].n+'</td><td class="n">'+D.per[k].c+' / '+D.per[k].a+'</td><td class="n">'+f(S.topic[k].c/S.topic[k].a*100,0)+'%</td></tr>';
  V.innerHTML='<div class="term"><div class="eyebrow">'+L('Session complete','Runde beendet')+'</div><h2 style="margin:8px 0 16px">'+D.c+L(' of ',' von ')+D.n+L(' correct',' richtig')+'</h2>'+
   '<div class="grid g4">'+stat(D.n?f(D.c/D.n*100,0)+'%':'–',L('accuracy','Trefferquote'))+stat(D.n?f(secs/D.n,0)+'s':'–',L('per question','pro Frage'))+stat(f(secs/60,1)+' min',L('total time','Gesamtzeit'))+'</div>'+
   '<div id="rankOut" style="margin-top:16px"></div>'+revisionHint(Object.keys(D.per).map(function(k){return 'D:'+k;}))+
   (rows?'<div class="panel tw" style="margin-top:16px"><table><tr><th>'+L('Topic','Thema')+'</th><th class="n">'+L('This session','Diese Runde')+'</th><th class="n">'+L('All-time','Gesamt')+'</th></tr>'+rows+'</table></div>':'')+
   '<div class="row" style="margin-top:20px"><button class="btn" id="dAgain">'+L('Same again','Nochmal')+'</button><button class="btn ghost" id="dSetup">'+L('Change topics','Themen ändern')+'</button></div></div>';
  if(D.n>=5&&D.c===D.n)celebrate(L(D.n+' of '+D.n+' correct.',D.n+' von '+D.n+' richtig.'));
  $('#dAgain').onclick=function(){DSEL=D.topics.slice();DMODE=D.mode;DLV=D.lv;startDrill();};
  $('#dSetup').onclick=function(){D=null;renderSetup();};
  var out=$('#rankOut');
  if(D.ranked&&D.run&&complete){
    out.innerHTML='<p class="muted">'+L('Submitting ranked result…','Ergebnis wird übermittelt…')+'</p>';
    DD.submitRun(D.run,D.mode==='sprint'?D.n-D.c:D.c).then(function(res){
      if(res&&res.ok)out.innerHTML='<div class="notice"><span class="ranked">'+L('Ranked','Gewertet')+'</span> '+L('Result recorded','Ergebnis gespeichert')+(D.mode==='sprint'?L(' · time ',' · Zeit ')+'<b class="mono">'+fmtMs(res.score)+'</b>'+(D.n-D.c?L(' incl. ',' inkl. ')+(D.n-D.c)+' × 20 s'+L(' penalty',' Strafzeit'):''):'')+L('. Your best counts on the all-time and weekly boards. ','. Dein Bestwert zählt in der Gesamt- und Wochenwertung. ')+'<a href="leaderboard.html?b='+board()+'">'+L('See leaderboard →','Zur Rangliste →')+'</a></div>';
      else out.innerHTML='<div class="note">'+L('This run was not ranked','Diese Runde wurde nicht gewertet')+(res&&res.reason?' ('+esc(res.reason)+')':'')+'.</div>';
    });
  }else if(D.ranked&&D.run)out.innerHTML='<div class="note">'+L('Ended early, so this ranked run does not count.','Vorzeitig beendet, daher zählt diese gewertete Runde nicht.')+'</div>';
  else if(D.ranked&&!DD.user&&DD.sb)out.innerHTML='<div class="notice">'+L('<a href="login.html">Sign in</a> and your ranked runs go on the leaderboard.','<a href="login.html">Melde dich an</a>, dann kommen gewertete Runden in die Rangliste.')+'</div>';
}
document.addEventListener('keydown',function(e){if(e.key==='Enter'&&D&&D.live&&D.done&&document.activeElement&&document.activeElement.id!=='ain'){e.preventDefault();advance();}});
DD.on('auth',function(){if(!D||!D.live)rankNote();});
DD.on('progress',function(){if(!D)renderSetup();});
renderSetup();

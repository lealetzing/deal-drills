/* Interview: every firm from js/data/firms.js with the interview questions candidates have posted.
   Reading is public; posting, "asked too", reporting and deleting need an account (functions in schema.sql, 4d). */
var V=$('#view');
var CITY_DE={Munich:'München',Nuremberg:'Nürnberg',Hanover:'Hannover',Cologne:'Köln'};
var ROUNDS=[['screening',L('Screening / phone','Screening / Telefon')],['first',L('First round','Erste Runde')],['second',L('Second round','Zweite Runde')],['final',L('Final round','Finale Runde')],['assessment',L('Assessment centre','Assessment Center')],['case',L('Case study','Case Study')],['other',L('Other','Sonstiges')]];
var PROGS=[['internship',L('Internship','Praktikum')],['working_student',L('Working student','Werkstudent')],['graduate',L('Graduate role','Direkteinstieg')],['other',L('Other','Sonstiges')]];
var IV={q:'',g:'all',onlyWith:false,open:qs('f')||null,counts:{}};
var BY_SLUG={};FIRMS.forEach(function(x){BY_SLUG[x.s]=x;});
function city(c){return LANG==='de'&&CITY_DE[c]?CITY_DE[c]:c;}
function fold(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function label(list,k){var x=list.filter(function(p){return p[0]===k;})[0];return x?x[1]:'';}
function errMsg(m){
  if(/Too many/.test(m))return L('Too many posts. Please try again later.','Zu viele Beiträge. Bitte versuch es später erneut.');
  if(/Sign in/.test(m))return L('Please sign in first.','Bitte melde dich zuerst an.');
  if(/Not allowed/.test(m))return L('You can only delete your own questions.','Du kannst nur deine eigenen Fragen löschen.');
  if(/too short/.test(m))return L('Please write the full question.','Bitte schreib die ganze Frage.');
  return L('That did not work. Please try again.','Das hat nicht geklappt. Bitte versuch es erneut.');}

function render(){
  V.innerHTML='<div class="eyebrow">Interview</div><h2 style="margin:8px 0 6px">'+L('What do they ask?','Was wird gefragt?')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('Interview questions by firm, shared by other candidates. Had an interview? Post your questions so the next person is ready.','Interviewfragen nach Firma, geteilt von anderen Bewerber:innen. Hattest du ein Interview? Poste deine Fragen, damit die oder der Nächste vorbereitet ist.')+'</p>'+
   '<div class="note" style="margin:14px 0 18px"><b>'+L('House rules','Regeln')+':</b> '+L('share the questions, not confidential case materials or anything you agreed to keep private; no names of interviewers; be fair. Posts are experiences of users, not verified by Deal Drills or the firms. Report anything that breaks the rules. <a href="about.html#rules">Full rules</a>','Teile die Fragen, aber keine vertraulichen Case-Unterlagen oder Dinge, die du vertraulich behandeln sollst; keine Namen von Interviewer:innen; bleib fair. Beiträge sind Erfahrungen von Nutzer:innen, nicht geprüft von Deal Drills oder den Firmen. Melde alles, was gegen die Regeln verstößt. <a href="about.html#rules">Alle Regeln</a>')+'</div>'+
   '<div class="panel ipractice"><div><b>'+L('Technical questions by topic','Technische Fragen nach Thema')+'</b><p class="muted" style="margin:4px 0 0">'+L('Accounting, EV, valuation, DCF, merger model, LBO, process and takeover law, with model answers.','Accounting, EV, Bewertung, DCF, Merger Model, LBO, Prozess und Übernahmerecht, mit Musterantworten.')+'</p></div><a class="btn ghost" href="technicals.html">'+L('Open','Öffnen')+' →</a></div>'+
   '<div class="panel ipractice"><div><b>'+L('Practise by firm','Nach Firma üben')+'</b><p class="muted" style="margin:4px 0 0">'+L('Pick firms and go through their questions one by one: “I know it” or “Repeat”.','Wähle Firmen und geh ihre Fragen einzeln durch: „Weiß ich“ oder „Wiederholen“.')+'</p></div><button class="btn" id="ipStart">'+L('Practise questions','Fragen üben')+'</button></div>'+
   '<div class="row" style="gap:12px;margin-bottom:12px"><input type="search" id="iq" value="'+esc(IV.q)+'" placeholder="'+L('Search firms','Firmen suchen')+'" aria-label="'+L('Search firms','Firmen suchen')+'" style="flex:1;min-width:200px">'+
   '<label class="muted" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="iw"'+(IV.onlyWith?' checked':'')+'> '+L('Only firms with questions','Nur Firmen mit Fragen')+'</label></div>'+
   '<div class="chips" style="margin-bottom:14px">'+[['all',L('All','Alle')]].concat(Object.keys(FIRM_GROUPS).map(function(k){return [k,FIRM_GROUPS[k]];})).map(function(g){return '<button class="chip" data-g="'+g[0]+'" aria-pressed="'+(IV.g===g[0])+'">'+esc(g[1])+'</button>';}).join('')+'</div>'+
   '<div id="ilist" class="ilist"></div>'+
   '<p class="muted" style="margin-top:12px">'+L('Firm missing? Tell us with the Feedback button.','Firma fehlt? Sag es uns über den Feedback-Button.')+'</p>';
  $('#ipStart').onclick=function(){history.replaceState(null,'','?practice=1');practiceSetup();};
  $('#iq').oninput=function(){IV.q=this.value;drawList();};
  $('#iw').onchange=function(){IV.onlyWith=this.checked;drawList();};
  $$('[data-g]',V).forEach(function(b){b.onclick=function(){IV.g=b.dataset.g;$$('[data-g]',V).forEach(function(x){x.setAttribute('aria-pressed',x===b);});drawList();};});
  drawList();
  var jump=function(){if(IV.open&&!IV.scrolled&&$('#f-'+IV.open)){IV.scrolled=true;$('#f-'+IV.open).scrollIntoView({block:'start'});}};
  if(DD.sb)DD.sb.rpc('interview_counts').then(function(r){IV.counts={};(r.data||[]).forEach(function(x){IV.counts[x.firm_slug]=+x.n;});drawList();jump();});else jump();
}
function drawList(){
  var q=fold(IV.q);
  var rows=FIRMS.filter(function(x){return (IV.g==='all'||x.g===IV.g)&&(!IV.onlyWith||IV.counts[x.s])&&(!q||fold(x.n+' '+x.c.join(' ')+' '+x.c.map(function(c){return CITY_DE[c]||'';}).join(' ')).indexOf(q)>-1);});
  rows.sort(function(a,b){return (IV.counts[b.s]||0)-(IV.counts[a.s]||0)||a.n.localeCompare(b.n,LANG);});
  $('#ilist').innerHTML=rows.length?rows.map(function(x){var n=IV.counts[x.s]||0,open=IV.open===x.s;
    return '<section class="ifirm'+(open?' open':'')+'" id="f-'+x.s+'"><button class="ifh" data-open="'+x.s+'" aria-expanded="'+open+'"><span><b>'+esc(x.n)+'</b><span class="muted"> · '+esc(FIRM_GROUPS[x.g])+(x.c.length?' · '+x.c.map(city).map(esc).join(', '):'')+'</span></span>'+
      '<span class="icount'+(n?'':' zero')+'">'+n+' '+(n===1?L('question','Frage'):L('questions','Fragen'))+'</span></button>'+(open?'<div class="ibody" id="ib-'+x.s+'"><p class="muted">'+L('Loading…','Lädt…')+'</p></div>':'')+'</section>';}).join('')
    :'<p class="muted">'+L('No firm matches.','Keine Firma gefunden.')+'</p>';
  $$('[data-open]').forEach(function(b){b.onclick=function(){IV.scrolled=true;IV.open=IV.open===b.dataset.open?null:b.dataset.open;history.replaceState(null,'',IV.open?'?f='+IV.open:'questions.html');drawList();};});
  if(IV.open&&$('#ib-'+IV.open))loadFirm(IV.open);
}
function loadFirm(slug){
  var el=$('#ib-'+slug),f=BY_SLUG[slug];
  if(!DD.sb){el.innerHTML='<p class="muted">'+L('Questions appear once the site is connected to Supabase.','Fragen erscheinen, sobald die Seite mit Supabase verbunden ist.')+'</p>';return;}
  DD.sb.rpc('interview_posts_for',{p_slug:slug}).then(function(r){
    if(r.error){el.innerHTML='<p class="muted">'+L('Questions could not be loaded. Please try again later.','Fragen konnten nicht geladen werden. Bitte versuch es später erneut.')+'</p>';return;}
    var posts=r.data||[];
    var form=DD.user?'<form class="ipost" id="ipf"><label class="label" for="iqText">'+L('Post a question you were asked at ','Poste eine Frage, die dir gestellt wurde, bei ')+esc(f.n)+'</label>'+
        '<textarea id="iqText" maxlength="1000" required placeholder="'+L('e.g. Walk me through a DCF. / Why corporate M&A and not banking?','z. B. Walk me through a DCF. / Warum Corporate M&A und nicht Banking?')+'"></textarea>'+
        '<div class="row" style="margin-top:8px;gap:8px"><select id="iqRound" aria-label="'+L('Round','Runde')+'"><option value="">'+L('Round (optional)','Runde (optional)')+'</option>'+ROUNDS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join('')+'</select>'+
        '<select id="iqProg" aria-label="'+L('Programme','Programm')+'"><option value="">'+L('Programme (optional)','Programm (optional)')+'</option>'+PROGS.map(function(x){return '<option value="'+x[0]+'">'+x[1]+'</option>';}).join('')+'</select>'+
        '<input type="number" id="iqYear" min="2015" max="2100" placeholder="'+L('Year','Jahr')+'" aria-label="'+L('Year','Jahr')+'" style="width:6.5em" value="'+new Date().getFullYear()+'">'+
        '<label class="muted" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="iqAnon" checked> '+L('Post anonymously','Anonym posten')+'</label>'+
        '<button class="btn small" type="submit" style="margin-left:auto">'+L('Post','Posten')+'</button></div><p class="muted" style="font-size:12.5px;margin:6px 0 0">'+L('By posting you accept the <a href="about.html#rules">rules for posts</a>: no confidential materials, no names, nothing copied. Posts can be removed.','Mit dem Posten akzeptierst du die <a href="about.html#rules">Regeln für Beiträge</a>: keine vertraulichen Unterlagen, keine Namen, nichts Kopiertes. Beiträge können entfernt werden.')+'</p><span class="muted" id="iqMsg" role="status"></span></form>'
      :'<p class="notice">'+(DD.sb?'<a href="login.html#signup">'+L('Create an account','Erstelle ein Konto')+'</a> '+L('or','oder')+' <a href="login.html">'+L('sign in','melde dich an')+'</a> '+L('to post questions you were asked.',', um Fragen aus deinem Interview zu posten.'):'')+'</p>';
    el.innerHTML=(posts.length?'<ol class="iposts">'+posts.map(postItem).join('')+'</ol>':'<p class="muted">'+L('No questions yet for ','Noch keine Fragen zu ')+esc(f.n)+L('. Be the first to share yours.','. Teile als Erste:r deine.')+'</p>')+form+
      '<p class="muted" style="font-size:13px;margin:10px 0 0">'+L('Shared by users, not verified. ','Von Nutzer:innen geteilt, nicht geprüft. ')+(f.u?'<a href="'+esc(f.u)+'" target="_blank" rel="noopener">'+L('Official careers page','Offizielle Karriereseite')+' ↗</a>':'')+'</p>';
    wirePosts(slug,el);
    if($('#ipf'))$('#ipf').onsubmit=function(e){e.preventDefault();
      var t=$('#iqText').value.trim();if(t.length<5){$('#iqMsg').textContent=errMsg('too short');return;}
      var y=parseInt($('#iqYear').value,10);
      $('#iqMsg').textContent=L('Posting…','Wird gepostet…');
      DD.sb.rpc('submit_interview_question',{p_slug:slug,p_question:t,p_round:$('#iqRound').value,p_programme:$('#iqProg').value,p_year:isFinite(y)&&y>=2015&&y<=2100?y:null,p_anonymous:$('#iqAnon').checked}).then(function(res){
        if(res.error){$('#iqMsg').textContent=errMsg(res.error.message);return;}
        IV.counts[slug]=(IV.counts[slug]||0)+1;DD.toast(L('Thank you for sharing!','Danke fürs Teilen!'));drawList();});};
  });
}
function postItem(p){
  var meta=[label(ROUNDS,p.round),label(PROGS,p.programme),p.year||''].filter(Boolean);
  return '<li class="ipostitem" data-id="'+p.id+'"><p class="iqtext">'+esc(p.question)+'</p>'+
   '<div class="row imeta">'+meta.map(function(m){return '<span class="pill b">'+esc(m)+'</span>';}).join('')+
   '<span class="muted">'+(p.author?esc(p.author):L('Anonymous','Anonym'))+' · '+new Date(p.created_at).toLocaleDateString(LANG==='de'?'de-DE':'en-GB')+'</span>'+
   '<span class="iacts"><button class="ivote'+(p.voted?' on':'')+'" data-vote="'+p.id+'" aria-pressed="'+!!p.voted+'" title="'+L('I was asked this too','Wurde ich auch gefragt')+'">👍 <span>'+p.votes+'</span> <small>'+L('asked too','auch gefragt')+'</small></button>'+
   (p.mine?'<button class="ilink" data-del="'+p.id+'">'+L('Delete','Löschen')+'</button>':'<button class="ilink" data-rep="'+p.id+'">'+L('Report','Melden')+'</button>')+'</span></div></li>';
}
function wirePosts(slug,el){
  $$('[data-vote]',el).forEach(function(b){b.onclick=function(){
    if(!DD.user){DD.toast(L('Sign in to vote.','Melde dich an, um abzustimmen.'));return;}
    DD.sb.rpc('toggle_interview_vote',{p_id:+b.dataset.vote}).then(function(r){if(r.error){DD.toast(errMsg(r.error.message));return;}
      var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on);b.classList.toggle('on',on);$('span',b).textContent=r.data;});};});
  $$('[data-rep]',el).forEach(function(b){b.onclick=function(){
    if(!DD.user){DD.toast(L('Sign in to report.','Melde dich an, um zu melden.'));return;}
    if(!b.dataset.sure){b.dataset.sure='1';b.textContent=L('Report this post?','Diesen Beitrag melden?');b.classList.add('warn');return;}
    b.disabled=true;
    DD.sb.rpc('report_interview_question',{p_id:+b.dataset.rep,p_reason:''}).then(function(r){DD.toast(r.error?errMsg(r.error.message):L('Thanks, we will take a look.','Danke, wir schauen es uns an.'));b.textContent=L('Reported','Gemeldet');});};});
  // Two-step buttons instead of confirm()/prompt(), which some browsers block
  $$('[data-del]',el).forEach(function(b){b.onclick=function(){
    if(!b.dataset.sure){b.dataset.sure='1';b.textContent=L('Really delete?','Wirklich löschen?');b.classList.add('warn');return;}
    b.disabled=true;
    DD.sb.rpc('delete_interview_question',{p_id:+b.dataset.del}).then(function(r){if(r.error){b.disabled=false;DD.toast(errMsg(r.error.message));return;}
      IV.counts[slug]=Math.max(0,(IV.counts[slug]||1)-1);DD.toast(L('Deleted.','Gelöscht.'));drawList();});};});
}

function boot(){if($('#prKnow'))return;if(qs('practice'))practiceSetup();else render();}

/* Practise by firm: flashcards from the posted questions. Users rate themselves ("I know it" / "Repeat");
   known question ids are kept in S.games.iq so they can be skipped next time. */
var PR={sel:{},q:'',onlyOpen:true,deck:[],i:0,known:0,again:0,total:0};
function iqKnown(){if(!S.games.iq)S.games.iq={};return S.games.iq;}
function practiceSetup(){
  var head='<a class="ilink" href="questions.html" id="prBack">← '+L('All firms','Alle Firmen')+'</a><h2 style="margin:10px 0 6px">'+L('Practise by firm','Nach Firma üben')+'</h2>';
  if(!DD.sb){V.innerHTML=head+'<p class="muted">'+L('Questions appear once the site is connected to Supabase.','Fragen erscheinen, sobald die Seite mit Supabase verbunden ist.')+'</p>';return;}
  V.innerHTML=head+'<p class="lead" style="margin-top:0">'+L('Choose one or more firms. There are no model answers: answer out loud, then rate yourself honestly.','Wähle eine oder mehrere Firmen. Musterlösungen gibt es nicht: antworte laut und bewerte dich dann ehrlich.')+'</p>'+
    '<div class="row" style="gap:12px;margin-bottom:10px"><input type="search" id="prq" value="'+esc(PR.q)+'" placeholder="'+L('Search firms','Firmen suchen')+'" style="flex:1;min-width:200px">'+
    '<label class="muted" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="prOpen"'+(PR.onlyOpen?' checked':'')+'> '+L('Skip questions I know','Gewusste Fragen überspringen')+'</label></div>'+
    '<div id="prFirms" class="chips prfirms"><p class="muted">'+L('Loading…','Lädt…')+'</p></div>'+
    '<div class="row" style="margin-top:16px;gap:10px"><button class="btn" id="prGo" disabled>'+L('Start','Starten')+'</button><span class="muted" id="prInfo"></span>'+
    '<button class="ilink" id="prReset" style="margin-left:auto">'+L('Reset “known”','„Gewusst“ zurücksetzen')+'</button></div>';
  $('#prBack').onclick=function(e){e.preventDefault();history.replaceState(null,'','questions.html');render();};
  $('#prq').oninput=function(){PR.q=this.value;drawFirms();};
  $('#prOpen').onchange=function(){PR.onlyOpen=this.checked;};
  $('#prReset').onclick=function(){S.games.iq={};save();DD.toast(L('Done: all questions count as open again.','Erledigt: alle Fragen gelten wieder als offen.'));};
  $('#prGo').onclick=startPractice;
  var drawFirms=function(){
    var q=fold(PR.q);
    var rows=FIRMS.filter(function(x){return IV.counts[x.s]&&(!q||fold(x.n).indexOf(q)>-1);});
    rows.sort(function(a,b){return (IV.counts[b.s]||0)-(IV.counts[a.s]||0)||a.n.localeCompare(b.n,LANG);});
    $('#prFirms').innerHTML=rows.length?rows.map(function(x){return '<button class="chip" data-pf="'+x.s+'" aria-pressed="'+!!PR.sel[x.s]+'">'+esc(x.n)+' <span class="muted">'+IV.counts[x.s]+'</span></button>';}).join('')
      :'<p class="muted">'+(Object.keys(IV.counts).length?L('No firm matches.','Keine Firma gefunden.'):L('No questions posted yet. Be the first: open a firm and post what you were asked.','Noch keine Fragen gepostet. Sei die oder der Erste: öffne eine Firma und poste, was du gefragt wurdest.'))+'</p>';
    $$('[data-pf]').forEach(function(b){b.onclick=function(){var k=b.dataset.pf;if(PR.sel[k])delete PR.sel[k];else PR.sel[k]=1;b.setAttribute('aria-pressed',!!PR.sel[k]);info();};});
    info();
  };
  var info=function(){var ks=Object.keys(PR.sel),n=ks.reduce(function(a,k){return a+(IV.counts[k]||0);},0);
    $('#prGo').disabled=!ks.length;$('#prInfo').textContent=ks.length?ks.length+' '+(ks.length===1?L('firm','Firma'):L('firms','Firmen'))+' · '+n+' '+L('questions','Fragen'):'';};
  DD.sb.rpc('interview_counts').then(function(r){IV.counts={};(r.data||[]).forEach(function(x){IV.counts[x.firm_slug]=+x.n;});drawFirms();});
}
function startPractice(){
  var ks=Object.keys(PR.sel);$('#prGo').disabled=true;$('#prInfo').textContent=L('Loading…','Lädt…');
  Promise.all(ks.map(function(k){return DD.sb.rpc('interview_posts_for',{p_slug:k}).then(function(r){return (r.data||[]).map(function(p){p.firm=k;return p;});});})).then(function(lists){
    var all=[].concat.apply([],lists),kn=iqKnown();
    var deck=PR.onlyOpen?all.filter(function(p){return !kn[p.id];}):all;
    if(!deck.length){$('#prGo').disabled=false;$('#prInfo').textContent=all.length?L('You know all of these. Untick “Skip questions I know” to go again.','Du weißt alle. Nimm den Haken bei „Gewusste Fragen überspringen“ raus, um sie nochmal zu üben.'):L('No questions found.','Keine Fragen gefunden.');return;}
    PR.deck=shuffle(deck);PR.i=0;PR.known=0;PR.again=0;PR.total=deck.length;PR.seen={};drawCard();
  });
}
function drawCard(){
  if(!PR.deck.length)return practiceDone();
  var p=PR.deck[0],f=BY_SLUG[p.firm]||{n:p.firm},meta=[label(ROUNDS,p.round),label(PROGS,p.programme),p.year||''].filter(Boolean);
  var done=PR.total-PR.deck.filter(function(x){return !PR.seen[x.id];}).length;
  V.innerHTML='<div class="row" style="justify-content:space-between;margin-bottom:8px"><span class="mono muted">'+L('Practise by firm','Nach Firma üben')+'</span><span class="mono muted">'+PR.known+' ✓ · '+PR.deck.length+' '+L('left','übrig')+'</span><button class="btn ghost small" id="prQuit">'+L('Stop','Beenden')+'</button></div>'+
    '<div class="bar2" style="margin-bottom:14px"><i style="width:'+Math.round(100*PR.known/PR.total)+'%"></i></div>'+
    '<div class="panel prcard"><div class="eyebrow">'+esc(f.n)+'</div><p class="prq">'+esc(p.question)+'</p>'+
    (meta.length?'<div class="row">'+meta.map(function(m){return '<span class="pill b">'+esc(m)+'</span>';}).join('')+'</div>':'')+
    (PR.seen[p.id]?'<p class="muted" style="margin:10px 0 0">'+L('Second look.','Zweiter Anlauf.')+'</p>':'')+
    '<p class="muted" style="margin:14px 0 0;font-size:13px">'+L('Answer out loud first. Then rate yourself.','Erst laut antworten. Dann bewerten.')+'</p>'+
    '<div class="row prbtns"><button class="btn" id="prKnow">✓ '+L('I know it','Weiß ich')+'</button><button class="btn ghost" id="prAgain">↻ '+L('Repeat','Wiederholen')+'</button></div></div>'+
    '<p class="muted" style="font-size:13px;margin-top:10px">'+L('Keys: K = I know it, R = Repeat.','Tasten: K = Weiß ich, W = Wiederholen.')+'</p>';
  var know=function(){var c=PR.deck.shift();iqKnown()[c.id]=1;save();PR.known++;drawCard();};
  var again=function(){var c=PR.deck.shift();PR.seen[c.id]=1;delete iqKnown()[c.id];save();PR.again++;PR.deck.splice(Math.min(3,PR.deck.length),0,c);drawCard();};
  $('#prKnow').onclick=know;$('#prAgain').onclick=again;
  $('#prQuit').onclick=practiceDone;
  document.onkeydown=function(e){if(!$('#prKnow'))return;var k=e.key.toLowerCase();if(k==='k')know();else if(k==='r'||k==='w')again();};
}
function practiceDone(){
  document.onkeydown=null;
  V.innerHTML='<div class="panel" style="text-align:center"><h2 style="margin:0 0 6px">'+(PR.deck.length?L('Stopped.','Beendet.'):L('Deck done.','Stapel durch.'))+'</h2>'+
    '<p class="lead" style="margin:0">'+PR.known+' / '+PR.total+' '+L('known','gewusst')+(PR.again?' · '+PR.again+'× '+L('repeated','wiederholt'):'')+'</p>'+
    '<div class="row" style="justify-content:center;margin-top:14px;gap:10px"><button class="btn" id="prMore">'+L('Practise again','Nochmal üben')+'</button><button class="btn ghost" id="prAll">'+L('All firms','Alle Firmen')+'</button></div></div>';
  $('#prMore').onclick=practiceSetup;
  $('#prAll').onclick=function(){history.replaceState(null,'','questions.html');render();};
}

boot();
DD.ready.then(function(){boot();DD.on('auth',boot);});

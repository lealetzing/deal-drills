/* Deal Drills core: helpers, Supabase client, auth, progress sync, shared header and footer.
   Plain script (no modules) so pages also open from file:// without a build step. */

/* ---------- language: English or German, chosen in the header, remembered per browser ---------- */
var LANG=(function(){try{var v=localStorage.getItem('dd-lang');if(v==='de'||v==='en')return v;}catch(e){}
  return /^de\b/i.test((typeof navigator!=='undefined'&&navigator.language)||'')?'de':'en';})();
/* L('English','Deutsch') returns the text for the current language. */
function L(en,de){return LANG==='de'?de:en;}
function setLang(l){try{localStorage.setItem('dd-lang',l);}catch(e){}location.reload();}
if(typeof document!=='undefined'&&document.documentElement)document.documentElement.lang=LANG;
/* Colour palette preview: ?palette=bordeaux|ocean|default. Remembered only when chosen in the top window. */
(function(){if(typeof document==='undefined'||!document.documentElement)return;
  var p=new URLSearchParams(location.search).get('palette'),top=window.top===window;
  try{if(p&&top){if(p==='default')localStorage.removeItem('dd-palette');else localStorage.setItem('dd-palette',p);}if(!p)p=localStorage.getItem('dd-palette');}catch(e){}
  if(p&&p!=='default')document.documentElement.setAttribute('data-palette',p);})();

/* ---------- helpers ---------- */
function r(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function rd(x,d){var m=Math.pow(10,d);return Math.round(x*m)/m;}
function f(x,d){if(!isFinite(x))return '–';return Number(rd(x,d)).toLocaleString(LANG==='de'?'de-DE':'en-US',{maximumFractionDigits:d,minimumFractionDigits:0});}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function $(s,el){return (el||document).querySelector(s);}
function $$(s,el){return Array.prototype.slice.call((el||document).querySelectorAll(s));}
function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function gauss(){var u=1-Math.random(),v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function ymd(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function today(){return ymd(new Date());}
function parseNum(s){
  s=String(s).trim().replace(/[\s€$%×x]/gi,'').replace(/−/g,'-');
  if(!s)return [];
  var out=[];
  if(s.indexOf(',')>-1&&s.indexOf('.')>-1){out.push(parseFloat(s.replace(/,/g,'')));}
  else if(s.indexOf(',')>-1){out.push(parseFloat(s.replace(',','.')));out.push(parseFloat(s.replace(/,/g,'')));}
  else out.push(parseFloat(s));
  return out.filter(function(v){return isFinite(v);});
}
function qs(name){return new URLSearchParams(location.search).get(name);}
function stat(b,s){return '<div class="panel stat"><b>'+b+'</b><span>'+s+'</span></div>';}
function fmtMs(ms){if(ms==null)return '–';var s=ms/1000;return s<60?f(s,1)+'s':Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');}

/* ---------- local state (mirrors the prototype; synced to Supabase when signed in) ---------- */
var DD=window.DD={cfg:window.DD_CONFIG||{},sb:null,user:null,profile:null,ready:null,listeners:[]};
var LK='deal-drills-v1';
/* "Well done" pop-up for a perfect round. Closes on click, Escape or after 3 seconds. */
function celebrate(sub){
  var o=document.createElement('div');o.className='celebrate';o.setAttribute('role','status');
  o.innerHTML='<div class="celebox"><div class="celeicon">🎉</div><b>'+L('Well done!','Gut gemacht!')+'</b><span>'+(sub||L('100% correct.','100 % richtig.'))+'</span></div>';
  var close=function(){if(o.parentNode)o.parentNode.removeChild(o);document.removeEventListener('keydown',esc_);};
  var esc_=function(e){if(e.key==='Escape')close();};
  o.onclick=close;document.addEventListener('keydown',esc_);document.body.appendChild(o);setTimeout(close,3000);
}
/* Two-step confirm inside the button (confirm() is blocked in some browsers). Returns true on the second click. */
function sure(b,txt){if(b.dataset.sure)return true;b.dataset.sure='1';var o=b.textContent;b.textContent=txt||L('Really?','Wirklich?');b.classList.add('warn');
  setTimeout(function(){if(b.dataset.sure){delete b.dataset.sure;b.textContent=o;b.classList.remove('warn');}},5000);return false;}
function defState(){return {v:1,ts:0,topic:{},sessions:[],cards:{},games:{ad:0,bs:0,au:null,lt:{}},stats:{},mistakes:[],apps:[],firms:[],owner:null,days:[],lang:'Deutsch'};}
function adopt(j){var d=defState();if(!j||j.v!==1)return d;for(var k in d){if(j[k]!==undefined)d[k]=j[k];}d.games=Object.assign(defState().games,j.games||{});return d;}
var S=defState();
try{S=adopt(JSON.parse(localStorage.getItem(LK)));}catch(e){}
var SYNC={timer:null};

function setSync(t){var el=$('#syncState');if(el)el.textContent=t;}
function save(){
  S.ts=Date.now();if(DD.user)S.owner=DD.user.id;
  try{localStorage.setItem(LK,JSON.stringify(S));}catch(e){}
  if(DD.sb&&DD.user){clearTimeout(SYNC.timer);SYNC.timer=setTimeout(pushProgress,1200);}
}
function pushProgress(){
  if(!DD.sb||!DD.user)return Promise.resolve();
  setSync(L('Saving…','Speichert…'));
  return DD.sb.from('progress').upsert({user_id:DD.user.id,state:S,updated_at:new Date().toISOString()})
    .then(function(res){setSync(res.error?L('Saved on this device','Auf diesem Gerät gespeichert'):L('Synced','Synchronisiert'));});
}
function pullProgress(){
  return DD.sb.from('progress').select('state').eq('user_id',DD.user.id).maybeSingle().then(function(res){
    if(res.error){setSync(L('Saved on this device','Auf diesem Gerät gespeichert'));return;}
    var rem=res.data&&res.data.state?adopt(res.data.state):null;
    if(rem&&(rem.ts||0)>(S.ts||0)){S=rem;S.owner=DD.user.id;try{localStorage.setItem(LK,JSON.stringify(S));}catch(e){}setSync(L('Synced','Synchronisiert'));emit('progress');}
    else if(S.ts&&(!rem||(rem.ts||0)<S.ts)){return pushProgress();}
    else setSync(L('Synced','Synchronisiert'));
  });
}
/* Per-concept history for the Revision page: attempts, correct, last 10 outcomes as '1'/'0'. */
/* Keys answered wrong since the last revision hint, so hints only follow actual mistakes in this round. */
var ROUND_WRONG={};
function track(key,ok){if(!ok)ROUND_WRONG[key]=1;var s=S.stats[key]||{a:0,c:0,h:''};s.a++;if(ok)s.c++;s.h=(s.h+(ok?'1':'0')).slice(-10);S.stats[key]=s;}
function touchDay(){var t=today();if(S.days.indexOf(t)<0){S.days.push(t);if(S.days.length>120)S.days.shift();}}
function streak(){
  var set={};S.days.forEach(function(d){set[d]=1;});var n=0;var d=new Date();
  if(!set[today()])d.setDate(d.getDate()-1);
  while(set[ymd(d)]){n++;d.setDate(d.getDate()-1);}
  return n;
}

/* ---------- events: pages subscribe to 'auth' and 'progress' ---------- */
DD.on=function(ev,cb){DD.listeners.push([ev,cb]);};
function emit(ev){DD.listeners.forEach(function(l){if(l[0]===ev){try{l[1]();}catch(e){console.error(e);}}});}

/* ---------- Supabase ---------- */
DD.configured=function(){var c=DD.cfg;return !!(c.SUPABASE_URL&&c.SUPABASE_ANON_KEY&&c.SUPABASE_URL.indexOf('YOUR_')<0&&c.SUPABASE_ANON_KEY.indexOf('YOUR_')<0&&window.supabase&&window.supabase.createClient);};
if(DD.configured()){
  try{DD.sb=window.supabase.createClient(DD.cfg.SUPABASE_URL,DD.cfg.SUPABASE_ANON_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});}
  catch(e){console.error('Supabase init failed',e);DD.sb=null;}
}
function loadProfile(){
  if(!DD.sb||!DD.user){DD.profile=null;return Promise.resolve();}
  return DD.sb.from('profiles').select('id,username,display_name,university,target_role').eq('id',DD.user.id).maybeSingle()
    .then(function(res){DD.profile=res.data||null;});
}
function setUser(u){
  var changed=(u&&u.id)!==(DD.user&&DD.user.id);
  DD.user=u||null;
  // Local data belongs to the account that saved it (S.owner). Nobody or someone else signed in: start clean.
  if(S.owner&&(!DD.user||S.owner!==DD.user.id)){clearTimeout(SYNC.timer);S=defState();try{localStorage.removeItem(LK);}catch(e){}emit('progress');}
  if(DD.user)S.owner=DD.user.id;
  if(!changed)return Promise.resolve();
  if(!DD.user){
    DD.profile=null;
    renderWho();emit('auth');return Promise.resolve();}
  return loadProfile().then(function(){renderWho();emit('auth');return pullProgress();});
}
DD.ready=new Promise(function(resolve){
  if(!DD.sb){resolve();return;}
  DD.sb.auth.getSession().then(function(res){
    var s=res&&res.data&&res.data.session;return setUser(s?s.user:null);
  }).catch(function(){}).then(resolve);
  // Supabase advises not to await other client calls inside this callback, so defer the work.
  DD.sb.auth.onAuthStateChange(function(event,session){setTimeout(function(){setUser(session?session.user:null);},0);});
});
DD.signOut=function(){
  if(!DD.sb)return Promise.resolve();
  clearTimeout(SYNC.timer);
  return DD.sb.auth.signOut().then(function(){
    // Shared computers: do not leave the previous user's progress behind.
    S=defState();try{localStorage.removeItem(LK);}catch(e){}
    location.href='index.html';
  });
};
DD.refreshProfile=function(){return loadProfile().then(renderWho);};

/* ---------- ranked runs: the server times the run and validates the score (see schema.sql) ---------- */
DD.startRun=function(board){
  if(!DD.sb||!DD.user)return Promise.resolve(null);
  return DD.sb.rpc('start_run',{p_board:board}).then(function(res){if(res.error){console.warn(res.error.message);return null;}return res.data;});
};
DD.submitRun=function(run,score){
  if(!DD.sb||!DD.user||!run)return Promise.resolve(null);
  return DD.sb.rpc('submit_run',{p_run:run,p_score:Math.round(score)}).then(function(res){
    if(res.error){console.warn(res.error.message);return {ok:false,reason:res.error.message};}return res.data;});
};

/* ---------- toast ---------- */
DD.toast=function(msg,ms){var t=document.createElement('div');t.className='toast';t.setAttribute('role','status');t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},ms||3200);};

/* ---------- header and footer ---------- */
var NAV=[['index',L('Home','Start')],['topics',L('Topics','Themen')],['drills','Drills'],['questions','Interview'],['games',L('Games','Spiele')],['revise',L('Revision','Wiederholen')],['leaderboard',L('Leaderboard','Rangliste')],['firms','Tracker'],['partners','Partner']];
var TITLES={index:L('M&A interview practice','Vorbereitung auf M&A-Interviews'),topics:L('Topics','Themen'),drills:'Drills',questions:L('Interview questions by firm','Interviewfragen nach Firma'),games:L('Games','Spiele'),revise:L('Revision','Wiederholen'),leaderboard:L('Leaderboard','Rangliste'),firms:L('Application tracker','Bewerbungs-Tracker'),partners:'Partner',formulas:L('Formula Sheet','Formelsammlung'),login:L('Sign in','Anmelden'),profile:L('Profile','Profil'),about:L('About','Über uns'),cases:L('Case stories','Fallgeschichten'),technicals:L('Technical questions','Technische Fragen')};
function renderHeader(){
  var page=document.body.getAttribute('data-page')||'';
  if(TITLES[page])document.title=page==='index'?'Deal Drills · '+TITLES[page]:TITLES[page]+' · Deal Drills';
  var h=document.createElement('header');h.className='bar';
  h.innerHTML='<div class="in"><a class="logo" href="index.html"><i></i>Deal Drills<span class="beta">Beta</span></a>'+
    '<nav class="tabs" aria-label="Sections">'+NAV.map(function(n){return '<a href="'+n[0]+'.html"'+(n[0]===page||(page==='technicals'&&n[0]==='questions')?' aria-current="page"':'')+'>'+n[1]+'</a>';}).join('')+'</nav>'+
    '<div class="who"><span id="who" class="who"></span><button class="langbtn" id="langBtn" title="'+L('Auf Deutsch umschalten','Switch to English')+'">'+L('DE','EN')+'</button></div></div>';
  document.body.insertBefore(h,document.body.firstChild);
  /* Work-in-progress notice: shown until dismissed (remembered per browser). */
  var wipOk=false;try{wipOk=localStorage.getItem('dd-wip-ok')==='1';}catch(e){}
  if(!wipOk){var w=document.createElement('div');w.className='wip';w.setAttribute('role','note');
    w.innerHTML='<div class="in"><span><b>'+L('Beta · work in progress.','Beta · noch im Aufbau.')+'</b> '+
      L('Deal Drills is built by students for interview practice, not by M&amp;A professionals. Content is checked with care but may contain mistakes, so there is no guarantee that it is correct and it is not professional advice. Found an error? Please tell us.',
        'Deal Drills wird von Studierenden für die Interviewvorbereitung gebaut, nicht von M&amp;A-Profis. Die Inhalte werden sorgfältig erstellt, können aber Fehler enthalten. Für ihre Richtigkeit gibt es daher keine Gewähr, und sie sind keine fachliche Beratung. Du hast einen Fehler gefunden? Sag uns gern Bescheid.')+
      '</span><span class="wipbtns"><button class="btn small ghost" id="wipReport">'+L('Report an error','Fehler melden')+'</button><button class="btn small" id="wipOk">'+L('Got it','Verstanden')+'</button></span></div>';
    h.insertAdjacentElement('afterend',w);
    $('#wipOk').onclick=function(){try{localStorage.setItem('dd-wip-ok','1');}catch(e){}w.remove();};
    $('#wipReport').onclick=function(){openFeedback('bug');};}
  var ft=document.createElement('footer');ft.className='foot';
  ft.innerHTML=L('Deal Drills · M&amp;A interview practice. Numbers in drills are generated at random and companies are invented. ','Deal Drills · Vorbereitung auf M&amp;A-Interviews. Zahlen in den Übungen sind zufällig erzeugt, Unternehmen erfunden. ')+
    '<a href="formulas.html">'+L('Formula sheet','Formelsammlung')+'</a> · <a href="partners.html">Partner</a> · <a href="about.html">'+L('About &amp; privacy','Über uns &amp; Datenschutz')+'</a>';
  document.body.appendChild(ft);
  $('#langBtn').onclick=function(){setLang(LANG==='de'?'en':'de');};
  renderFeedback();
  renderWho();
}
function renderWho(){
  var el=$('#who');if(!el)return;
  if(!DD.sb){el.innerHTML='<span class="sync">'+L('Guest · saved on this device','Gast · auf diesem Gerät gespeichert')+'</span>';return;}
  if(!DD.user){el.innerHTML='<span class="sync" id="syncState">'+L('Saved on this device','Auf diesem Gerät gespeichert')+'</span><a class="btn small" href="login.html">'+L('Sign in','Anmelden')+'</a>';return;}
  var name=DD.profile&&DD.profile.display_name||L('Profile','Profil');
  el.innerHTML='<span class="sync" id="syncState">'+L('Synced','Synchronisiert')+'</span><a href="profile.html">'+esc(name)+'</a>';
}
/* ---------- feedback: floating button on every page, stored via submit_feedback() (schema.sql) ---------- */
var FB_KINDS=[['bug','🐞',L('Report a bug','Fehler melden'),L('Something is wrong or broken','Etwas ist falsch oder kaputt')],
  ['missing','🧩',L('Something missing','Etwas fehlt'),L('A firm, topic, question or feature','Eine Firma, ein Thema, eine Frage oder Funktion')],
  ['idea','💡',L('A cool addition','Coole Idee'),L('What would make this better?','Was würde die Seite besser machen?')]];
function renderFeedback(){
  if(!DD.sb||$('#fbBtn'))return;
  var b=document.createElement('button');b.id='fbBtn';b.className='fbbtn';b.type='button';
  b.innerHTML='<span aria-hidden="true">💬</span> '+L('Feedback','Feedback');
  document.body.appendChild(b);
  var d=document.createElement('dialog');d.id='fbDlg';d.className='fbdlg';d.setAttribute('aria-labelledby','fbTitle');
  document.body.appendChild(d);
  b.onclick=function(){openFeedback();};
}
function openFeedback(kind){
  var d=$('#fbDlg'),sel=kind||'bug';
  d.innerHTML='<form method="dialog" id="fbForm"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 id="fbTitle">'+L('Help make Deal Drills better','Hilf mit, Deal Drills besser zu machen')+'</h3><button type="button" class="fbx" id="fbClose" aria-label="'+L('Close','Schließen')+'">×</button></div>'+
    '<p class="muted" style="margin:0 0 14px">'+L('Every message is read. Thank you!','Jede Nachricht wird gelesen. Danke!')+'</p>'+
    '<div class="fbkinds" role="radiogroup" aria-label="'+L('Type','Art')+'">'+FB_KINDS.map(function(k){return '<label class="fbkind"><input type="radio" name="fbk" value="'+k[0]+'"'+(k[0]===sel?' checked':'')+'><span><b>'+k[1]+' '+k[2]+'</b><small>'+k[3]+'</small></span></label>';}).join('')+'</div>'+
    '<label class="label" for="fbMsg" style="margin-top:14px">'+L('Your message','Deine Nachricht')+'</label><textarea id="fbMsg" maxlength="2000" required placeholder="'+L('What happened, or what would you like? On which page?','Was ist passiert oder was wünschst du dir? Auf welcher Seite?')+'"></textarea>'+
    (DD.user?'<p class="muted" style="margin:8px 0 0;font-size:13px">'+L('Sent with your username, so we can follow up.','Wird mit deinem Benutzernamen gesendet, damit wir nachfragen können.')+'</p>'
      :'<label class="label" for="fbMail" style="margin-top:12px">'+L('Email (optional, if you would like an answer)','E-Mail (optional, falls du eine Antwort möchtest)')+'</label><input type="email" id="fbMail" maxlength="254" style="width:100%">')+
    '<div class="row" style="margin-top:14px"><button class="btn" type="submit" id="fbSend">'+L('Send','Senden')+'</button><span class="muted" id="fbStatus" role="status"></span></div></form>';
  d.showModal();$('#fbMsg').focus();
  $('#fbClose').onclick=function(){d.close();};
  d.onclick=function(e){if(e.target===d)d.close();};
  $('#fbForm').onsubmit=function(e){e.preventDefault();
    var msg=$('#fbMsg').value.trim(),k=($('input[name=fbk]:checked',d)||{}).value||'bug';
    if(msg.length<3){$('#fbStatus').textContent=L('Please write a few words.','Bitte schreib ein paar Worte.');return;}
    $('#fbSend').disabled=true;$('#fbStatus').textContent=L('Sending…','Wird gesendet…');
    DD.sb.rpc('submit_feedback',{p_kind:k,p_message:msg,p_page:(location.pathname+location.search).slice(0,300),p_lang:LANG,p_contact:$('#fbMail')?$('#fbMail').value.trim():null}).then(function(r){
      if(r.error){$('#fbSend').disabled=false;$('#fbStatus').textContent=/Too many/.test(r.error.message)?L('Too many messages right now. Please try again in a minute.','Gerade zu viele Nachrichten. Bitte versuch es in einer Minute erneut.'):L('Could not send. Please try again.','Senden hat nicht geklappt. Bitte versuch es erneut.');return;}
      d.innerHTML='<div style="text-align:center;padding:10px 4px"><div style="font-size:34px" aria-hidden="true">🙏</div><h3 style="margin:8px 0">'+L('Thank you!','Danke!')+'</h3><p class="muted">'+L('Your message has been sent.','Deine Nachricht ist angekommen.')+'</p><button class="btn" id="fbOk" type="button">'+L('Close','Schließen')+'</button></div>';
      $('#fbOk').onclick=function(){d.close();};$('#fbOk').focus();
    });
  };
}
DD.feedback=openFeedback;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',renderHeader);else renderHeader();

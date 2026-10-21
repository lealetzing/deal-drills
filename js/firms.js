/* Firm tracker. Top: the user's applications (adding one means "applied", dated today and editable).
   Below: the directory of all firms (js/data/firms.js). Applications live in the synced progress state (S.apps),
   so they work for guests and follow signed-in users.
   An application: {id, slug|null, name, prog, period, notes, ev:[{t:'applied'|'round'|'rejected'|'offer', d:'YYYY-MM-DD'}], ts} */
var V=$('#view');
var CITY_DE={Munich:'München',Nuremberg:'Nürnberg',Hanover:'Hannover',Cologne:'Köln'};
var PROGS=[['internship',L('Internship','Praktikum')],['working_student',L('Working student','Werkstudent')],['graduate',L('Graduate role','Direkteinstieg')],['other',L('Other','Sonstiges')]];
var ORD_EN=['First','Second','Third','Fourth','Fifth','Sixth'],ORD_DE=['Erste','Zweite','Dritte','Vierte','Fünfte','Sechste'];
var FT={q:'',g:'all',sort:'n',dir:1};
var BY_SLUG={};
/* Firms a user added themselves live in S.firms ({s:'u-…', n, g, c:[city], u, mine:1}) and are also sent to us as feedback. */
function myFirms(){if(!S.firms)S.firms=[];return S.firms;}
function allFirms(){return FIRMS.concat(myFirms());}
function indexFirms(){BY_SLUG={};allFirms().forEach(function(x){BY_SLUG[x.s]=x;});}
indexFirms();
/* Similar names, so people pick an existing firm instead of adding a duplicate. Legal suffixes are ignored. */
var NAME_NOISE=/\b(gmbh|ag|se|kgaa|kg|co|cie|and|und|partners?|group|gruppe|capital|corporate|finance|advisory|international|holding|the|llp|llc|inc|ltd|sa)\b/g;
function core(n){return fold(n).replace(NAME_NOISE,' ').replace(/\s+/g,' ').trim();}
function lev(a,b){var m=a.length,n=b.length,d=[],i,j;for(i=0;i<=m;i++)d[i]=[i];for(j=1;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++)for(j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n];}
function similar(q){var c=core(q),f=fold(q);if(f.length<2)return [];
  return allFirms().map(function(x){var xc=core(x.n),xf=fold(x.n),sc=0;
      if(xf===f||(c&&xc===c))sc=3;
      else if(c&&xc&&(xc.indexOf(c)>-1||c.indexOf(xc)>-1)&&Math.min(c.length,xc.length)>=3)sc=2;
      else if(c&&xc&&1-lev(c,xc)/Math.max(c.length,xc.length)>=0.7)sc=1;
      else if(xf.replace(/ /g,'').indexOf(f.replace(/ /g,''))>-1)sc=1;
      return {x:x,sc:sc};})
    .filter(function(o){return o.sc;}).sort(function(a,b){return b.sc-a.sc||a.x.n.localeCompare(b.x.n);}).slice(0,5).map(function(o){return o.x;});}

/* Every application starts with an "applied" step; older entries without one get it, dated when they were added. */
// External application trackers
var EXTLINKS=[['Trackr','https://the-trackr.com/'],['Emergers','https://emergers.de/']];
function apps(){if(!S.apps)S.apps=[];S.apps.forEach(function(a){if(!a.ev.some(function(e){return e.t==='applied';}))a.ev.unshift({t:'applied',d:ymd(new Date(a.ts||Date.now()))});});return S.apps;}
function city(c){return LANG==='de'&&CITY_DE[c]?CITY_DE[c]:c;}
function fold(s){return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim();}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function rounds(a){return a.ev.filter(function(e){return e.t==='round';}).length;}
function has(a,t){return a.ev.some(function(e){return e.t===t;});}
function status(a){
  if(has(a,'offer'))return ['offer',L('Offer','Angebot')];
  if(has(a,'rejected'))return ['rejected',L('Rejected','Absage')];
  var n=rounds(a);if(n)return ['round',L('Round '+n,n+'. Runde')];
  return ['applied',L('Applied','Beworben')];
}
function evLabel(e,i,a){
  if(e.t==='applied')return L('Applied','Beworben');if(e.t==='rejected')return L('Rejected','Absage');if(e.t==='offer')return L('Offer','Angebot');
  var n=a.ev.slice(0,i+1).filter(function(x){return x.t==='round';}).length;return L('Round '+n,n+'. Runde');
}
function summary(){
  var A=apps();
  return {total:A.length,interviews:A.filter(function(a){return rounds(a)>0;}).length,
    offers:A.filter(function(a){return has(a,'offer');}).length,rejected:A.filter(function(a){return has(a,'rejected');}).length,
    open:A.filter(function(a){return !has(a,'offer')&&!has(a,'rejected');}).length};
}
function touch(a){a.ts=Date.now();save();}
function addApp(slug,name){var f=slug&&BY_SLUG[slug];var a={id:uid(),slug:slug||null,name:name,prog:'internship',period:'',loc:f&&f.c.length===1?city(f.c[0]):'',notes:'',ev:[{t:'applied',d:today()}],ts:Date.now()};apps().unshift(a);save();return a;}

/* ---------- page ---------- */
function render(){
  V.innerHTML='<div class="eyebrow">'+'Tracker'+'</div><h2 style="margin:8px 0 6px">'+L('Where are you applying?','Wo bewirbst du dich?')+'</h2>'+
   '<p class="lead" style="margin-top:0">'+L('Your applications on top, every firm below.','Oben deine Bewerbungen, unten alle Firmen.')+
   (DD.sb&&!DD.user?' <a href="login.html#signup">'+L('Create an account','Erstelle ein Konto')+'</a>'+L(' to keep your tracker on every device.',', damit dein Tracker auf jedem Gerät verfügbar ist.'):'')+'</p>'+
   '<div class="grid g5 sumgrid" id="sum"></div><div id="avg"></div>'+
   '<p class="muted extlinks">'+L('Looking for opening dates? ','Auf der Suche nach Öffnungsdaten? ')+EXTLINKS.map(function(x){return '<a href="'+x[1]+'" target="_blank" rel="noopener">'+x[0]+' ↗</a>';}).join(' · ')+
     '<br><small>'+L('External sites. No affiliation with Deal Drills; we do not endorse or check their content.','Externe Seiten. Keine Verbindung zu Deal Drills; wir übernehmen keine Gewähr für deren Inhalte.')+'</small></p>'+
   '<section style="margin-top:26px"><h3 style="margin-bottom:12px">'+L('My applications','Meine Bewerbungen')+'</h3>'+
   '<div class="panel addfirm"><label class="label" for="addIn">'+L('Add application','Bewerbung hinzufügen')+'</label>'+
   '<div class="acwrap"><input type="text" id="addIn" autocomplete="off" placeholder="'+L('Start typing a firm, e.g. LSJ or Siemens','Firma eintippen, z. B. LSJ oder Siemens')+'" role="combobox" aria-expanded="false" aria-autocomplete="list" aria-controls="acList"><ul id="acList" class="aclist" role="listbox" hidden></ul></div>'+
   '<p class="muted" style="margin:8px 0 0">'+L('Pick a suggestion, or press Enter to add a firm that is not in the list. It is saved as applied today; you can change the date.','Wähle einen Vorschlag oder drücke Enter für eine Firma, die nicht in der Liste ist. Sie wird als heute beworben gespeichert; das Datum kannst du ändern.')+'</p></div>'+
   '<div id="mine"></div></section>'+
   '<section style="margin-top:34px"><h3 style="margin-bottom:12px">'+L('All firms','Alle Firmen')+' <span class="tag">'+FIRMS.length+'</span></h3><div id="all"></div></section>';
  renderSummary();renderMine();renderAll();wireAutocomplete();renderAvg();
}
/* Anonymous site averages (tracker_stats in schema.sql): last 365 days, Berlin time, users with ≥1 application. */
function mine365(){var t=today(),from=new Date();from.setDate(from.getDate()-365);var f=ymd(from),c={applied_year:0,applied_today:0,offers_year:0,rejections_year:0};
  apps().forEach(function(a){a.ev.forEach(function(e){if(e.d<f||e.d>t)return;if(e.t==='applied'){c.applied_year++;if(e.d===t)c.applied_today++;}if(e.t==='offer')c.offers_year++;if(e.t==='rejected')c.rejections_year++;});});return c;}
function renderAvg(){
  var el=$('#avg');if(!el||!DD.sb)return;
  DD.sb.rpc('tracker_stats',{p_today:today()}).then(function(r){
    var d=r.data;if(r.error||!d){el.innerHTML='';return;}
    var me=mine365(),fmt=function(x){return f(+x,x<1&&x>0?2:1);};
    if(!d.enough){el.innerHTML='<div class="avgbox muted">'+L('The site average appears once at least 5 users track their applications','Der Durchschnitt der Seite erscheint, sobald mindestens 5 Nutzer:innen ihre Bewerbungen tracken')+' ('+L('now','aktuell')+' '+d.users+').</div>';return;}
    var cell=function(label,avg,mine){return '<div><span class="label">'+label+'</span><b class="mono">'+fmt(avg)+'</b><span class="muted">'+L('you','du')+': '+mine+'</span></div>';};
    el.innerHTML='<div class="avgbox"><p style="margin:0 0 10px"><b>'+L('The average user of this site','Die durchschnittliche Nutzerin bzw. der durchschnittliche Nutzer dieser Seite')+'</b> '+L('(last 365 days)','(letzte 365 Tage)')+'</p>'+
      '<div class="avggrid">'+cell(L('Applications','Bewerbungen'),d.applied_year,me.applied_year)+cell(L('Applied today','Heute beworben'),d.applied_today,me.applied_today)+
      cell(L('Offers','Angebote'),d.offers_year,me.offers_year)+cell(L('Rejections','Absagen'),d.rejections_year,me.rejections_year)+'</div>'+
      '<p class="muted" style="margin:10px 0 0;font-size:13px">'+L('Anonymous average over ','Anonymer Durchschnitt über ')+d.users+L(' users with at least one application in the last 365 days. Only signed-in users are counted.',' Nutzer:innen mit mindestens einer Bewerbung in den letzten 365 Tagen. Gezählt werden nur angemeldete Nutzer:innen.')+'</p></div>';
  });
}
function renderSummary(){var sm=summary();
  $('#sum').innerHTML=sumCard(sm.total,L('applications','Bewerbungen'),'')+sumCard(sm.interviews,L('with interviews','mit Interviews'),'gold')+
    sumCard(sm.offers,L('offers','Angebote'),'good')+sumCard(sm.rejected,L('rejections','Absagen'),'bad')+sumCard(sm.open,L('still open','noch offen'),'muted');}
function sumCard(n,label,tone){return '<div class="panel stat sum '+tone+'"><b>'+n+'</b><span>'+label+'</span></div>';}

/* ---------- my applications (list) ---------- */
function renderMine(){
  var A=apps();
  $('#mine').innerHTML=A.length?'<div class="applist">'+A.map(appRow).join('')+'</div>'
    :'<p class="muted" style="margin-top:12px">'+L('No applications yet. Add one above, or use “+ Applied” in the list of all firms below.','Noch keine Bewerbungen. Füge oben eine hinzu oder nutze „+ Beworben“ in der Liste aller Firmen unten.')+'</p>';
  $$('.app').forEach(wireRow);
}
function appRow(a){
  var st=status(a),f=a.slug&&BY_SLUG[a.slug],n=rounds(a),closed=has(a,'rejected')||has(a,'offer');
  return '<article class="app st-'+st[0]+'" data-id="'+a.id+'">'+
   '<div class="appname"><h4>'+esc(a.name)+'</h4><span class="muted">'+(f?esc(FIRM_GROUPS[f.g]):L('Added by you','Von dir hinzugefügt'))+(f&&f.u?' · <a href="'+esc(f.u)+'" target="_blank" rel="noopener">'+L('Careers','Karriere')+' ↗</a> · <a href="questions.html?f='+f.s+'">'+L('Interview questions','Interviewfragen')+'</a>':'')+'</span>'+
     '<span class="spill '+st[0]+'">'+st[1]+'</span></div>'+
   '<div class="appf"><label>'+L('Programme','Programm')+'<select data-f="prog">'+PROGS.map(function(p){return '<option value="'+p[0]+'"'+(a.prog===p[0]?' selected':'')+'>'+p[1]+'</option>';}).join('')+'</select></label>'+
     '<label>'+L('When','Zeitraum')+'<input type="text" data-f="period" maxlength="40" value="'+esc(a.period)+'" placeholder="'+L('e.g. Summer 2027','z. B. Sommer 2027')+'"></label>'+
     '<label>'+L('Location','Ort')+'<input type="text" data-f="loc" maxlength="60" value="'+esc(a.loc||'')+'" placeholder="'+L('e.g. Frankfurt','z. B. Frankfurt')+'" list="loc-'+a.id+'">'+
       (f&&f.c.length?'<datalist id="loc-'+a.id+'">'+f.c.map(function(c){return '<option value="'+esc(city(c))+'">';}).join('')+'</datalist>':'')+'</label></div>'+
   '<ol class="tl">'+a.ev.map(function(e,i){return '<li class="ev-'+e.t+'"><span>'+evLabel(e,i,a)+'</span><input type="date" data-ev="'+i+'" value="'+e.d+'" aria-label="'+esc(evLabel(e,i,a))+' '+L('date','Datum')+'">'+(e.t==='applied'?'':'<button class="evx" data-del="'+i+'" aria-label="'+L('Remove','Entfernen')+' '+esc(evLabel(e,i,a))+'">×</button>')+'</li>';}).join('')+'</ol>'+
   '<div class="appb">'+
     (closed?'':'<button class="btn small navy" data-add="round">'+(n<6?L(ORD_EN[n]+' round',ORD_DE[n]+' Runde'):L('Round '+(n+1),(n+1)+'. Runde'))+'</button>'+
       '<button class="btn small good" data-add="offer">'+L('Offer','Angebot')+'</button><button class="btn small bad" data-add="rejected">'+L('Rejected','Absage')+'</button>')+
     '<details class="appmore"><summary class="muted">'+L('Notes','Notizen')+(a.notes?' ✎':'')+'</summary><textarea data-f="notes" maxlength="1000" placeholder="'+L('Contacts, case study, what to prepare…','Kontakte, Case Study, Vorbereitung…')+'">'+esc(a.notes)+'</textarea></details>'+
     '<button class="appdel" data-rm="1" aria-label="'+L('Remove application','Bewerbung entfernen')+'" title="'+L('Remove','Entfernen')+'">🗑</button></div>'+
  '</article>';
}
function find(id){return apps().filter(function(a){return a.id===id;})[0];}
function refresh(){renderSummary();renderMine();renderAll();renderAvg();}
function wireRow(el){
  var a=find(el.dataset.id);if(!a)return;
  $$('[data-add]',el).forEach(function(b){b.onclick=function(){a.ev.push({t:b.dataset.add,d:today()});touch(a);refresh();};});
  $$('[data-del]',el).forEach(function(b){b.onclick=function(){a.ev.splice(+b.dataset.del,1);touch(a);refresh();};});
  $$('[data-ev]',el).forEach(function(i){i.onchange=function(){if(i.value){a.ev[+i.dataset.ev].d=i.value;touch(a);}};});
  $$('[data-f]',el).forEach(function(i){i.onchange=function(){a[i.dataset.f]=i.value;touch(a);};
    if(i.tagName!=='SELECT')i.oninput=function(){a[i.dataset.f]=i.value;a.ts=Date.now();clearTimeout(i._t);i._t=setTimeout(save,600);};});
  $('[data-rm]',el).onclick=function(){if(!sure(this,L('Really remove?','Wirklich entfernen?')))return;S.apps=apps().filter(function(x){return x.id!==a.id;});save();refresh();};
}

/* Suggestions: firms whose name (or a word in it) starts with the typed text, then other matches; accents ignored. */
function suggest(q){q=fold(q);if(!q)return [];
  var starts=[],contains=[];
  allFirms().forEach(function(x){var n=fold(x.n);if(n.indexOf(q)===0||(' '+n).indexOf(' '+q)>-1)starts.push(x);else if(n.replace(/ /g,'').indexOf(q.replace(/ /g,''))>-1)contains.push(x);});
  return starts.concat(contains).slice(0,8);}
function wireAutocomplete(){
  var inp=$('#addIn'),list=$('#acList'),items=[],act=-1;
  var open=function(v){list.hidden=!v;inp.setAttribute('aria-expanded',!!v);};
  var draw=function(){items=suggest(inp.value);act=items.length?0:-1;
    var q=inp.value.trim();
    if(!q){open(false);return;}
    list.innerHTML=items.map(function(x,i){return '<li role="option" data-i="'+i+'"><b>'+esc(x.n)+'</b><span class="muted">'+esc(FIRM_GROUPS[x.g])+'</span></li>';}).join('')+
      '<li role="option" data-custom="1" class="custom">'+L('Add “'+esc(q)+'” as a new firm','„'+esc(q)+'“ als neue Firma hinzufügen')+'</li>';
    open(true);mark();
    $$('li',list).forEach(function(li){li.onmousedown=function(e){e.preventDefault();choose(li.dataset.custom?null:items[+li.dataset.i]);};});
  };
  var mark=function(){$$('li',list).forEach(function(li,i){li.setAttribute('aria-selected',i===act||(act<0&&li.dataset.custom==='1'));});};
  var choose=function(x){var q=inp.value.trim();if(!x&&!q)return;
    var a=x?addApp(x.s,x.n):addApp(null,q);inp.value='';open(false);DD.toast(L('Added ','Hinzugefügt: ')+a.name);refresh();inp.focus();};
  inp.oninput=draw;
  inp.onkeydown=function(e){
    if(e.key==='ArrowDown'){e.preventDefault();act=act+1>=items.length?-1:act+1;mark();}
    else if(e.key==='ArrowUp'){e.preventDefault();act=act<0?items.length-1:act-1;mark();}
    else if(e.key==='Enter'){e.preventDefault();var q=fold(inp.value),exact=items.filter(function(x){return fold(x.n)===q;})[0];choose(act>=0?items[act]:exact||null);}
    else if(e.key==='Escape'){open(false);}
  };
  inp.onblur=function(){setTimeout(function(){open(false);},120);};
}

/* ---------- all firms (list) ---------- */
function renderAll(){
  indexFirms();
  var applied={};apps().forEach(function(a){if(a.slug)applied[a.slug]=1;});
  if(!$('#fq')){
    $('#all').innerHTML='<div class="row" style="gap:12px;margin-bottom:12px"><input type="search" id="fq" value="'+esc(FT.q)+'" placeholder="'+L('Search firms or cities','Firmen oder Städte suchen')+'" aria-label="'+L('Search firms','Firmen suchen')+'" style="flex:1;min-width:200px">'+
     '<div class="chips">'+[['all',L('All','Alle')]].concat(Object.keys(FIRM_GROUPS).map(function(k){return [k,FIRM_GROUPS[k]];})).map(function(g){return '<button class="chip" data-g="'+g[0]+'" aria-pressed="'+(FT.g===g[0])+'">'+esc(g[1])+'</button>';}).join('')+'</div></div>'+
     '<div class="row" style="margin:0 0 10px"><button class="btn ghost small" id="fAddBtn" aria-expanded="false">+ '+L('Add a firm to the list','Firma zur Liste hinzufügen')+'</button></div>'+
     '<form class="panel faddform" id="fAdd" hidden autocomplete="off"><div class="grid g2" style="gap:10px">'+
       '<label class="lf"><span>'+L('Firm name','Name der Firma')+'</span><input id="faN" required maxlength="80" placeholder="'+L('e.g. Pava Partners','z. B. Pava Partners')+'"></label>'+
       '<label class="lf"><span>'+L('Type','Art')+'</span><select id="faG">'+Object.keys(FIRM_GROUPS).map(function(k){return '<option value="'+k+'">'+esc(FIRM_GROUPS[k])+'</option>';}).join('')+'</select></label>'+
       '<label class="lf"><span>'+L('Office in Germany (optional)','Standort in Deutschland (optional)')+'</span><input id="faC" maxlength="40"></label>'+
       '<label class="lf"><span>'+L('Careers page (optional)','Karriereseite (optional)')+'</span><input id="faU" type="url" maxlength="300" placeholder="https://"></label></div>'+
       '<div id="faSim" class="fasim" role="status"></div>'+
       '<div class="row" style="margin-top:10px;gap:10px"><button class="btn small" type="submit">'+L('Add firm','Firma hinzufügen')+'</button><span class="muted" style="font-size:13px">'+L('It appears in your list right away; we check it and add it for everyone.','Sie erscheint sofort in deiner Liste; wir prüfen sie und nehmen sie für alle auf.')+'</span></div></form>'+
     '<div class="panel tw"><table class="firmtbl"><thead><tr id="fth"></tr></thead><tbody id="ftb"></tbody></table></div>'+
     '<p class="muted" style="margin-top:10px">'+L('Facts only: names, offices and links to official careers pages, checked on ','Nur Fakten: Namen, Standorte und Links zu offiziellen Karriereseiten, geprüft am ')+FIRMS_CHECKED+L('. Empty office or link = not verified yet. Application windows change every year, so check the careers page. Missing a firm? Use “Add a firm to the list”.','. Leerer Standort oder Link = noch nicht geprüft. Bewerbungszeiträume ändern sich jedes Jahr, schau deshalb auf die Karriereseite. Firma fehlt? Nutze „Firma zur Liste hinzufügen“.')+'</p>';
    $('#fq').oninput=function(){FT.q=this.value;renderAll();};
    wireAddFirm();
    $$('[data-g]',$('#all')).forEach(function(b){b.onclick=function(){FT.g=b.dataset.g;$$('[data-g]',$('#all')).forEach(function(x){x.setAttribute('aria-pressed',x===b);});renderAll();};});
  }
  $('#fth').innerHTML=[['n',L('Firm','Firma')],['g',L('Type','Art')],['c',L('Offices in Germany','Standorte in Deutschland')]].map(function(h){return '<th><button data-sort="'+h[0]+'">'+h[1]+(FT.sort===h[0]?(FT.dir>0?' ▲':' ▼'):'')+'</button></th>';}).join('')+'<th>'+L('Careers','Karriere')+'</th><th></th>';
  $$('[data-sort]',$('#fth')).forEach(function(b){b.onclick=function(){if(FT.sort===b.dataset.sort)FT.dir=-FT.dir;else{FT.sort=b.dataset.sort;FT.dir=1;}renderAll();};});
  var q=fold(FT.q),key=function(x){return FT.sort==='n'?x.n:FT.sort==='g'?FIRM_GROUPS[x.g]+x.n:(x.c[0]?city(x.c[0]):'~')+x.n;};
  var rows=allFirms().filter(function(x){return (FT.g==='all'||x.g===FT.g)&&(!q||fold(x.n+' '+x.c.join(' ')+' '+x.c.map(function(c){return CITY_DE[c]||'';}).join(' ')+' '+FIRM_GROUPS[x.g]).indexOf(q)>-1);});
  rows.sort(function(a,b){return key(a).localeCompare(key(b),LANG)*FT.dir;});
  $('#ftb').innerHTML=rows.length?rows.map(function(x){return '<tr><td><b>'+esc(x.n)+'</b>'+(x.mine?' <span class="pill b">'+L('added by you','von dir')+'</span>':'')+'</td><td class="muted">'+esc(FIRM_GROUPS[x.g])+'</td><td>'+(x.c.length?x.c.map(city).map(esc).join(', '):'<span class="muted">–</span>')+'</td>'+
    '<td>'+(x.u?'<a href="'+esc(x.u)+'" target="_blank" rel="noopener">'+L('Careers','Karriere')+' ↗</a>':'<span class="muted">–</span>')+'</td><td class="n">'+(applied[x.s]?'<span class="spill applied">'+L('Applied ✓','Beworben ✓')+'</span>':'<button class="btn small" data-apply="'+x.s+'">+ '+L('Applied','Beworben')+'</button>')+'</td></tr>';}).join('')
    :'<tr><td colspan="5" class="muted">'+L('No firm matches. Use “Add a firm to the list” above.','Keine Firma gefunden. Nutze oben „Firma zur Liste hinzufügen“.')+'</td></tr>';
  $$('[data-apply]').forEach(function(b){b.onclick=function(){var x=BY_SLUG[b.dataset.apply];addApp(x.s,x.n);DD.toast(L('Added ','Hinzugefügt: ')+x.n+L(' to your applications',' zu deinen Bewerbungen'));refresh();};});
}

function wireAddFirm(){
  var btn=$('#fAddBtn'),form=$('#fAdd'),inp=$('#faN'),sim=$('#faSim');
  btn.onclick=function(){form.hidden=!form.hidden;btn.setAttribute('aria-expanded',!form.hidden);if(!form.hidden){if(FT.q&&!inp.value)inp.value=FT.q;showSim();inp.focus();}};
  var showSim=function(){var list=similar(inp.value);
    sim.innerHTML=list.length?'<b>'+L('Already in the list?','Schon in der Liste?')+'</b>'+list.map(function(x){return '<div class="row fasimrow"><span><b>'+esc(x.n)+'</b> <span class="muted">· '+esc(FIRM_GROUPS[x.g])+(x.c.length?' · '+x.c.map(city).map(esc).join(', '):'')+'</span></span>'+
      '<button type="button" class="btn ghost small" data-pick="'+x.s+'">'+L('Show it','Anzeigen')+'</button></div>';}).join(''):'';
    $$('[data-pick]',sim).forEach(function(b){b.onclick=function(){var x=BY_SLUG[b.dataset.pick];FT.q=x.n;FT.g='all';$('#fq').value=x.n;
      $$('[data-g]',$('#all')).forEach(function(c){c.setAttribute('aria-pressed',c.dataset.g==='all');});form.hidden=true;btn.setAttribute('aria-expanded','false');inp.value='';sim.innerHTML='';renderAll();};});};
  inp.oninput=showSim;
  form.onsubmit=function(e){e.preventDefault();
    var n=inp.value.trim().replace(/\s+/g,' '),u=$('#faU').value.trim(),c=$('#faC').value.trim(),g=$('#faG').value;
    if(n.length<2)return;
    var dup=allFirms().filter(function(x){return fold(x.n)===fold(n)||(core(n)&&core(x.n)===core(n));})[0];
    if(dup){showSim();DD.toast(L('“'+dup.n+'” is already in the list.','„'+dup.n+'“ ist schon in der Liste.'));return;}
    if(u&&!/^https?:\/\//i.test(u))u='https://'+u;
    myFirms().push({s:'u-'+uid(),n:n,g:g,c:c?[c]:[],u:u,mine:1});save();
    if(DD.sb)DD.sb.rpc('submit_feedback',{p_kind:'missing',p_message:'Firm suggestion: '+n+' · '+g+(c?' · '+c:'')+(u?' · '+u:''),p_page:'firms.html',p_lang:LANG,p_contact:null}).then(function(){});
    form.reset();sim.innerHTML='';form.hidden=true;btn.setAttribute('aria-expanded','false');
    FT.q=n;$('#fq').value=n;renderAll();DD.toast(L('Added “'+n+'” to your list. Thanks!','„'+n+'“ zu deiner Liste hinzugefügt. Danke!'));};
}

render();
DD.ready.then(function(){render();DD.on('progress',render);DD.on('auth',render);});

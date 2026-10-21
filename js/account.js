/* Sign-in page (login.html) and profile page (profile.html). English/German via L(). */
var V=$('#view');
var ROLES=[['corporate_ma','Corporate M&A'],['ib','Investment Banking'],['pe','Private Equity'],['pc','Private Credit'],['ts','Transaction Services'],['other',L('Other','Sonstiges')]];
function baseUrl(){return location.origin+location.pathname.replace(/[^/]*$/,'');}
function notConfigured(){
  V.innerHTML='<div class="form"><div class="eyebrow">'+L('Account','Konto')+'</div><h2 style="margin:8px 0 12px">'+L('Accounts are not switched on yet.','Konten sind noch nicht aktiviert.')+'</h2>'+
   '<p>'+L('This copy of the site has no Supabase keys in <code>js/config.js</code>, so progress is saved in this browser only. Everything else works.','Diese Kopie der Seite hat keine Supabase-Schlüssel in <code>js/config.js</code>, daher wird der Fortschritt nur in diesem Browser gespeichert. Alles andere funktioniert.')+'</p></div>';
}
/* Messages raised by the database functions in schema.sql, shown in the user's language. */
function dbMsg(m){var map={
  'No player with that code':L('No player with that code.','Kein Spieler mit diesem Code.'),
  'That is your own code':L('That is your own code.','Das ist dein eigener Code.'),
  'Friend limit reached':L('Friend limit reached.','Maximale Anzahl an Freunden erreicht.'),
  'Not signed in':L('Please sign in again.','Bitte melde dich erneut an.')};
  for(var k in map)if(m&&m.indexOf(k)>-1)return map[k];return m;}

/* ---------- login: username + password, optional recovery email ----------
   Supabase identifies every account by an email address. Users who give no email get a placeholder address built
   from their username (never shown, never mailed); users who give one sign in with either. */
var USER_DOMAIN='users.dealdrills.app';
var UNAME=/^[a-z0-9_.-]{3,20}$/;
function authEmail(id){id=id.trim().toLowerCase();return id.indexOf('@')>-1?id:id+'@'+USER_DOMAIN;}
function isPlaceholder(email){return !email||email.slice(-USER_DOMAIN.length-1)==='@'+USER_DOMAIN;}
function authError(e){var m=(e&&e.message)||String(e);
  if(/invalid login credentials/i.test(m))return L('Wrong username or password.','Falscher Benutzername oder falsches Passwort.');
  if(/already registered|already exists/i.test(m))return L('That email address already has an account. Sign in instead.','Für diese E-Mail-Adresse gibt es schon ein Konto. Melde dich stattdessen an.');
  if(/email not confirmed/i.test(m))return L('Email not confirmed yet. (Site owner: switch off “Confirm email” in Supabase, see README.)','E-Mail noch nicht bestätigt. (Betreiberin: „Confirm email“ in Supabase ausschalten, siehe README.)');
  if(/rate limit/i.test(m))return L('Too many attempts. Wait a minute and try again.','Zu viele Versuche. Warte eine Minute und versuche es erneut.');
  if(/password/i.test(m)&&/(short|least|weak)/i.test(m))return L('That password is too weak. Use at least 8 characters.','Das Passwort ist zu schwach. Verwende mindestens 8 Zeichen.');
  return m;}
var UHINT=L('3–20 characters: lowercase letters, numbers, . _ -. Shown on leaderboards.','3–20 Zeichen: Kleinbuchstaben, Zahlen, . _ -. Erscheint in Ranglisten.');
function renderLogin(mode){
  if(!DD.sb)return notConfigured();
  if(DD.user){V.innerHTML='<div class="form"><div class="eyebrow">'+L('Account','Konto')+'</div><h2 style="margin:8px 0 12px">'+L('You are signed in.','Du bist angemeldet.')+'</h2><p>'+esc(DD.profile&&DD.profile.display_name||'')+'</p><div class="row"><a class="btn" href="profile.html">'+L('Your profile','Dein Profil')+'</a><a class="btn ghost" href="games.html">'+L('Play','Spielen')+'</a></div></div>';return;}
  mode=mode||(location.hash==='#signup'?'signup':'signin');
  var su=mode==='signup';
  V.innerHTML='<div class="form"><div class="eyebrow">'+(su?L('Create an account','Konto erstellen'):L('Welcome back','Willkommen zurück'))+'</div><h2 style="margin:8px 0 6px">'+(su?L('Save your progress, join the leaderboard.','Fortschritt speichern, in die Rangliste kommen.'):L('Sign in','Anmelden'))+'</h2>'+
   '<div class="chips" style="margin:14px 0 18px"><button class="chip" data-mode="signin" aria-pressed="'+!su+'">'+L('Sign in','Anmelden')+'</button><button class="chip" data-mode="signup" aria-pressed="'+su+'">'+L('Create account','Konto erstellen')+'</button></div>'+
   '<form id="af" novalidate>'+
   (su?'<div class="field"><label for="un">'+L('Username','Benutzername')+'</label><input type="text" id="un" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="20" required placeholder="'+L('e.g. ib_possible','z. B. ib_possible')+'"><span class="muted" id="unmsg">'+UHINT+'</span></div>'
      :'<div class="field"><label for="un">'+L('Username or email','Benutzername oder E-Mail')+'</label><input type="text" id="un" autocomplete="username" autocapitalize="none" spellcheck="false" required></div>')+
   '<div class="field"><label for="pw">'+L('Password','Passwort')+'</label><input type="password" id="pw" autocomplete="'+(su?'new-password':'current-password')+'" minlength="8" required>'+(su?'<span class="muted">'+L('At least 8 characters.','Mindestens 8 Zeichen.')+'</span>':'')+'</div>'+
   (su?'<div class="field"><label for="em">'+L('Email','E-Mail')+' <span class="muted">'+L('(optional, for password recovery)','(optional, zum Zurücksetzen des Passworts)')+'</span></label><input type="email" id="em" autocomplete="email" placeholder="'+L('you@university.edu','du@uni.de')+'"><span class="muted">'+L('Without an email, a forgotten password cannot be reset.','Ohne E-Mail kann ein vergessenes Passwort nicht zurückgesetzt werden.')+'</span></div>':'')+
   '<button class="btn" type="submit" style="width:100%">'+(su?L('Create account','Konto erstellen'):L('Sign in','Anmelden'))+'</button></form>'+
   '<p id="msg" class="muted" style="margin-top:12px" role="status"></p>'+
   (su?'':'<p class="muted" style="margin-top:6px"><a href="#" id="forgot">'+L('Forgot your password?','Passwort vergessen?')+'</a></p>')+
   '<p class="muted" style="margin-top:18px">'+L('Your username, display name and university appear on leaderboards.','Benutzername, Anzeigename und Universität erscheinen in Ranglisten.')+' <a href="about.html#privacy">'+L('Privacy','Datenschutz')+'</a></p></div>';
  $$('[data-mode]',V).forEach(function(b){b.onclick=function(){history.replaceState(null,'',b.dataset.mode==='signup'?'#signup':'#');renderLogin(b.dataset.mode);};});
  var msg=function(t){$('#msg').textContent=t;};
  if(su){var t=null;$('#un').oninput=function(){var v=this.value.trim().toLowerCase();clearTimeout(t);
    if(!UNAME.test(v)){$('#unmsg').textContent=UHINT;return;}
    t=setTimeout(function(){DD.sb.rpc('username_available',{p_username:v}).then(function(r){if($('#un')&&$('#un').value.trim().toLowerCase()===v)$('#unmsg').textContent=r.data?'✓ '+v+L(' is available',' ist frei'):'✗ '+v+L(' is taken',' ist vergeben');});},350);};}
  $('#af').onsubmit=function(e){e.preventDefault();
    var id=$('#un').value.trim().toLowerCase(),pw=$('#pw').value,b=$('#af button');
    if(!id||!pw){msg(L('Fill in both fields.','Fülle beide Felder aus.'));return;}
    if(su){
      var em=$('#em').value.trim().toLowerCase();
      if(!UNAME.test(id)){msg(L('Username: 3–20 characters, lowercase letters, numbers, . _ -','Benutzername: 3–20 Zeichen, Kleinbuchstaben, Zahlen, . _ -'));return;}
      if(pw.length<8){msg(L('Password: at least 8 characters.','Passwort: mindestens 8 Zeichen.'));return;}
      if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){msg(L('That email address does not look right.','Diese E-Mail-Adresse sieht nicht richtig aus.'));return;}
      b.disabled=true;msg(L('Creating your account…','Konto wird erstellt…'));
      DD.sb.rpc('username_available',{p_username:id}).then(function(r){
        if(!r.data){b.disabled=false;msg(L('That username is taken. Try another.','Dieser Benutzername ist vergeben. Versuche einen anderen.'));return;}
        return DD.sb.auth.signUp({email:authEmail(id),password:pw,options:{data:{username:id}}}).then(function(res){
          b.disabled=false;
          if(res.error){msg(authError(res.error));return;}
          if(!res.data.session){msg(L('Account created, but it still needs email confirmation. (Site owner: switch off “Confirm email” in Supabase.)','Konto erstellt, aber die E-Mail muss noch bestätigt werden. (Betreiberin: „Confirm email“ in Supabase ausschalten.)'));return;}
          var go=function(){location.href='profile.html';};
          if(em)DD.sb.from('recovery_emails').upsert({user_id:res.data.user.id,email:em,updated_at:new Date().toISOString()}).then(go,go);else go();
        });
      });
    }else{
      b.disabled=true;msg(L('Signing in…','Anmeldung…'));
      DD.sb.auth.signInWithPassword({email:authEmail(id),password:pw}).then(function(res){
        b.disabled=false;
        if(res.error){msg(authError(res.error));return;}
        location.href='profile.html';
      });
    }
  };
  if(!su)$('#forgot').onclick=function(e){e.preventDefault();
    var id=$('#un').value.trim().toLowerCase();
    if(!id){msg(L('Type your username in the first field, then click “Forgot your password?” again.','Gib im ersten Feld deinen Benutzernamen ein und klicke dann erneut auf „Passwort vergessen?“.'));return;}
    if(id.indexOf('@')>-1){DD.sb.auth.resetPasswordForEmail(id,{redirectTo:baseUrl()+'profile.html#password'}).then(function(res){msg(res.error?authError(res.error):L('If an account uses this email, a reset link is on its way.','Falls ein Konto diese E-Mail nutzt, ist ein Link unterwegs.'));});return;}
    DD.sb.rpc('request_password_reset',{p_username:id}).then(function(){
      msg(L('Request received. If this account has a recovery email, we will send a new password there, usually within a day. Without a recovery email we cannot verify that the account is yours.','Anfrage erhalten. Wenn das Konto eine Recovery-E-Mail hat, schicken wir dir dorthin ein neues Passwort, meist innerhalb eines Tages. Ohne Recovery-E-Mail können wir nicht prüfen, dass das Konto dir gehört.'));});
  };
  $('#un').focus();
}

/* ---------- profile ---------- */
function renderProfile(){
  if(!DD.sb)return notConfigured();
  if(!DD.user){V.innerHTML='<div class="form"><h2 style="margin-bottom:12px">'+L('Sign in to see your profile.','Melde dich an, um dein Profil zu sehen.')+'</h2><a class="btn" href="login.html">'+L('Sign in','Anmelden')+'</a></div>';return;}
  var p=DD.profile||{};
  var att=0,cor=0;for(var k in S.topic){att+=S.topic[k].a;cor+=S.topic[k].c;}
  V.innerHTML='<div class="eyebrow">'+L('Your profile','Dein Profil')+'</div><h2 style="margin:8px 0 18px">'+esc(p.display_name||L('Profile','Profil'))+'</h2>'+
   '<div class="grid g4" style="margin-bottom:24px">'+stat(f(att,0),L('drill questions answered','Übungsfragen beantwortet'))+stat(att?f(cor/att*100,0)+'%':'–',L('drill accuracy','Trefferquote'))+stat(streak()+' '+(streak()===1?L('day','Tag'):L('days','Tage')),L('practice streak','Serie'))+stat(S.sessions.length,L('sessions saved','gespeicherte Sitzungen'))+'</div>'+
   (function(){var A=S.apps||[],n=function(t){return A.filter(function(a){return a.ev.some(function(e){return e.t===t;});}).length;},ap=A.filter(function(a){return a.ev.length;}).length;
     return A.length?'<div class="notice" style="margin-bottom:18px">'+L('Applications','Bewerbungen')+' <b>'+ap+'</b> · '+L('interviews','Interviews')+' <b>'+A.filter(function(a){return a.ev.some(function(e){return e.t==='round';});}).length+'</b> · '+L('offers','Angebote')+' <b>'+n('offer')+'</b> · '+L('rejections','Absagen')+' <b>'+n('rejected')+'</b> · <a href="firms.html?mine=1">'+L('Open tracker →','Zum Tracker →')+'</a></div>':'';})()+
   '<div class="grid g2"><form class="panel" id="pf"><h3 style="margin-bottom:14px">'+L('Public profile','Öffentliches Profil')+'</h3>'+
   '<div class="field"><label for="dn">'+L('Display name','Anzeigename')+' <span class="muted">'+L('(shown on leaderboards)','(erscheint in Ranglisten)')+'</span></label><input type="text" id="dn" maxlength="30" minlength="2" required value="'+esc(p.display_name||'')+'"></div>'+
   '<div class="field"><label for="un">'+L('University','Universität')+' <span class="muted">'+L('(optional, shown on leaderboards)','(optional, erscheint in Ranglisten)')+'</span></label><input type="text" id="un" maxlength="80" value="'+esc(p.university||'')+'"></div>'+
   '<div class="field"><label for="tr">'+L('Target role','Zielposition')+'</label><select id="tr"><option value="">'+L('Choose…','Auswählen…')+'</option>'+ROLES.map(function(x){return '<option value="'+x[0]+'"'+(p.target_role===x[0]?' selected':'')+'>'+x[1]+'</option>';}).join('')+'</select></div>'+
   '<div class="row"><button class="btn" type="submit">'+L('Save','Speichern')+'</button><span class="muted" id="pmsg" role="status"></span></div></form>'+
   '<div class="panel"><h3 style="margin-bottom:10px">'+L('Account','Konto')+'</h3><p class="muted">'+L('Username','Benutzername')+' <b class="mono">'+esc(p.username||'–')+'</b></p>'+
   '<form id="ref" class="recbox" autocomplete="off"><label class="label" for="rem">'+L('Recovery email','Recovery-E-Mail')+'</label><p class="muted" id="recNow" style="margin:0 0 8px">…</p>'+
   '<div class="row"><input type="email" id="rem" maxlength="254" placeholder="'+L('you@university.edu','du@uni.de')+'" style="flex:1;min-width:12em"><button class="btn small" type="submit" id="recBtn">'+L('Add recovery email','Recovery-E-Mail hinzufügen')+'</button></div>'+
   '<span class="muted" id="recMsg" role="status"></span><p class="muted" style="margin:6px 0 0;font-size:13px">'+L('Only used to help you if you forget your password. Private; you still sign in with your username.','Nur für den Fall, dass du dein Passwort vergisst. Privat; du meldest dich weiter mit deinem Benutzernamen an.')+'</p></form>'+
   '<form id="pwf" class="row" style="margin-top:12px" autocomplete="off"><input type="password" id="npw" autocomplete="new-password" minlength="8" placeholder="'+L('New password','Neues Passwort')+'" aria-label="'+L('New password','Neues Passwort')+'" style="width:14em"><button class="btn ghost small" type="submit">'+L('Change password','Passwort ändern')+'</button><span class="muted" id="pwmsg" role="status"></span></form>'+
   '<div class="row" style="margin-top:12px"><a class="btn ghost" href="firms.html?mine=1">'+L('My applications','Meine Bewerbungen')+'</a><button class="btn ghost" id="so">'+L('Sign out','Abmelden')+'</button></div>'+
   '<details style="margin-top:22px"><summary class="muted">'+L('Delete account','Konto löschen')+'</summary><p class="muted" style="margin-top:8px">'+L('Deletes your profile, progress, leaderboard entries and saved applications. This cannot be undone.','Löscht dein Profil, deinen Fortschritt, deine Ranglisteneinträge und gespeicherten Bewerbungen. Das kann nicht rückgängig gemacht werden.')+'</p><button class="btn ghost" id="del" style="border-color:var(--bad);color:var(--bad)">'+L('Delete my account','Mein Konto löschen')+'</button></details></div></div>'+
   '<div class="panel" id="friends" style="margin-top:14px"><h3 style="margin-bottom:6px">'+L('Friends','Freunde')+'</h3>'+
   '<p class="muted">'+L('Share your code; when a friend adds it, you see each other’s times after every game and on the leaderboard’s Friends tab.','Teile deinen Code; wenn ein Freund ihn hinzufügt, seht ihr eure Zeiten nach jedem Spiel und im Reiter „Freunde“ der Rangliste.')+'</p>'+
   '<div class="row" style="margin:12px 0"><span>'+L('Your code','Dein Code')+'</span><b class="mono" id="fcode" style="font-size:20px;letter-spacing:.08em">…</b><button class="btn ghost small" id="fcopy">'+L('Copy','Kopieren')+'</button></div>'+
   '<form class="row" id="ff"><input type="text" id="fin" maxlength="12" placeholder="'+L('Friend’s code','Code deines Freundes')+'" aria-label="'+L('Friend’s code','Code deines Freundes')+'" style="text-transform:uppercase;width:12em"><button class="btn small" type="submit">'+L('Add friend','Freund hinzufügen')+'</button><span class="muted" id="fmsg" role="status"></span></form>'+
   '<div id="flist" style="margin-top:12px"></div></div>';
  $('#pf').onsubmit=function(e){e.preventDefault();
    var row={display_name:$('#dn').value.trim(),university:$('#un').value.trim()||null,target_role:$('#tr').value||null,updated_at:new Date().toISOString()};
    if(row.display_name.length<2){$('#pmsg').textContent=L('Display name needs at least 2 characters.','Der Anzeigename braucht mindestens 2 Zeichen.');return;}
    $('#pmsg').textContent=L('Saving…','Speichert…');
    DD.sb.from('profiles').update(row).eq('id',DD.user.id).then(function(res){
      if(res.error){$('#pmsg').textContent=res.error.message;return;}
      $('#pmsg').textContent=L('Saved.','Gespeichert.');DD.refreshProfile();
    });
  };
  $('#so').onclick=function(){DD.signOut();};
  $('#pwf').onsubmit=function(e){e.preventDefault();var np=$('#npw').value;if(np.length<8){$('#pwmsg').textContent=L('At least 8 characters.','Mindestens 8 Zeichen.');return;}
    $('#pwmsg').textContent=L('Saving…','Speichert…');DD.sb.auth.updateUser({password:np}).then(function(res){$('#pwmsg').textContent=res.error?authError(res.error):L('Password changed.','Passwort geändert.');if(!res.error)$('#npw').value='';});};
  if(location.hash==='#password'){$('#npw').focus();$('#pwmsg').textContent=L('Choose a new password.','Wähle ein neues Passwort.');}
  var recLoad=function(){DD.sb.from('recovery_emails').select('email').eq('user_id',DD.user.id).maybeSingle().then(function(r){
    var em=r.data&&r.data.email||(!isPlaceholder(DD.user.email)?DD.user.email:'');
    $('#recNow').innerHTML=em?L('Saved: ','Gespeichert: ')+'<b>'+esc(em)+'</b>'+(r.data?' · <a href="#" id="recDel">'+L('remove','entfernen')+'</a>':''):L('None yet. Without one, a forgotten password cannot be recovered.','Noch keine. Ohne sie kann ein vergessenes Passwort nicht wiederhergestellt werden.');
    $('#recBtn').textContent=r.data?L('Update','Ändern'):L('Add recovery email','Recovery-E-Mail hinzufügen');
    if($('#recDel'))$('#recDel').onclick=function(e){e.preventDefault();if(!sure(e.currentTarget,L('Really remove?','Wirklich entfernen?')))return;DD.sb.from('recovery_emails').delete().eq('user_id',DD.user.id).then(recLoad);};});};
  recLoad();
  $('#ref').onsubmit=function(e){e.preventDefault();var em=$('#rem').value.trim().toLowerCase();
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){$('#recMsg').textContent=L('That email address does not look right.','Diese E-Mail-Adresse sieht nicht richtig aus.');return;}
    $('#recMsg').textContent=L('Saving…','Speichert…');
    DD.sb.from('recovery_emails').upsert({user_id:DD.user.id,email:em,updated_at:new Date().toISOString()}).then(function(res){
      $('#recMsg').textContent=res.error?res.error.message:L('Saved.','Gespeichert.');if(!res.error){$('#rem').value='';recLoad();}});};
  DD.sb.rpc('my_friend_code').then(function(res){$('#fcode').textContent=res.data||'–';});
  $('#fcopy').onclick=function(){var c=$('#fcode').textContent;if(navigator.clipboard)navigator.clipboard.writeText(c).then(function(){DD.toast(L('Code copied','Code kopiert'));});};
  $('#ff').onsubmit=function(e){e.preventDefault();var c=$('#fin').value.trim();if(!c)return;$('#fmsg').textContent=L('Adding…','Wird hinzugefügt…');
    DD.sb.rpc('add_friend',{p_code:c}).then(function(res){
      if(res.error){$('#fmsg').textContent=dbMsg(res.error.message);return;}
      $('#fmsg').textContent=L('Added ','Hinzugefügt: ')+(res.data&&res.data.display_name||L('friend','Freund'))+'.';$('#fin').value='';loadFriends();});};
  loadFriends();
  if(location.hash==='#friends')$('#friends').scrollIntoView();
  $('#del').onclick=function(){
    if(!sure(this,L('Really delete account and all data?','Konto mit allen Daten wirklich löschen?')))return;
    DD.sb.rpc('delete_my_account').then(function(res){
      if(res.error){DD.toast(dbMsg(res.error.message));return;}
      DD.signOut();
    });
  };
}
function loadFriends(){
  var el=$('#flist');if(!el)return;
  DD.sb.from('friends').select('friend_id').then(function(res){
    var ids=(res.data||[]).map(function(x){return x.friend_id;});
    if(!ids.length){el.innerHTML='<p class="muted">'+L('No friends yet.','Noch keine Freunde.')+'</p>';return;}
    DD.sb.from('profiles').select('id,display_name,university').in('id',ids).order('display_name').then(function(p){
      el.innerHTML='<table>'+(p.data||[]).map(function(x){return '<tr><td>'+esc(x.display_name)+'</td><td class="muted">'+esc(x.university||'')+'</td><td class="n"><button class="btn ghost small" data-rm="'+x.id+'">'+L('Remove','Entfernen')+'</button></td></tr>';}).join('')+'</table>';
      $$('[data-rm]',el).forEach(function(b){b.onclick=function(){if(!sure(b,L('Really remove?','Wirklich entfernen?')))return;
        DD.sb.rpc('remove_friend',{p_friend:b.dataset.rm}).then(loadFriends);};});
    });
  });
}
var PAGE=document.body.getAttribute('data-page');
var R=PAGE==='login'?renderLogin:renderProfile;
if(DD.sb)V.innerHTML='<p class="muted">'+L('Loading…','Lädt…')+'</p>';
DD.ready.then(function(){R();DD.on('auth',R);DD.on('progress',R);});

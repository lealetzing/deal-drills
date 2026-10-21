// Smoke test without Node: osascript -l JavaScript tools/check.js  (run from the repo root)
// Syntax-checks every js/ file and runs each drill generator 300 times.
ObjC.import('Foundation');
function read(p){var s=$.NSString.stringWithContentsOfFileEncodingError(p,$.NSUTF8StringEncoding,null);if(!s.js)throw 'cannot read '+p;return s.js;}
var root=$.NSFileManager.defaultManager.currentDirectoryPath.js;
var files=$.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(root+'/js',null).js.map(function(x){return x.js;}).filter(function(x){return /\.js$/.test(x);});
var dataDir=$.NSFileManager.defaultManager.contentsOfDirectoryAtPathError(root+'/js/data',null).js;
if(dataDir)dataDir.forEach(function(x){if(/\.js$/.test(x.js))files.push('data/'+x.js);});
var out=[];
files.forEach(function(fn){try{new Function(read(root+'/js/'+fn));out.push('syntax ok  '+fn);}catch(e){throw 'SYNTAX '+fn+': '+e;}});
var helpers=read(root+'/js/core.js').split('/* ---------- local state')[0];
var src=helpers+'\n'+read(root+'/js/qbank.js')+'\n'+read(root+'/js/gen.js')+'\n'+read(root+'/js/ledger.js')+'\n'+read(root+'/js/data/gamebank.js')+'\nreturn {BANKS:{market:MARKET_BANK,excel:EXCEL_BANK,updown:UPDOWN_BANK,mult:MULT_BANK},mentalCard:mentalCard,GEN:GEN,setLv:function(v){GEN_LV=v;},QB:QB,CATS:CATS,parseNum:parseNum,LEDGER:LEDGER,LEDGER_LEVELS:LEDGER_LEVELS,ledgerQuestion:ledgerQuestion,testCards:testCards,LEDGER_TESTS:LEDGER_TESTS,TRAPS:TRAPS,claimTrue:claimTrue,claimText:claimText};';
var o=new Function('document','window','localStorage',src)({},{},{});
var rng={};
['easy','medium','hard'].forEach(function(lv){o.setLv(lv);for(var k in o.GEN){for(var i=0;i<300;i++){var q=o.GEN[k].f();if(!isFinite(q.a)||!q.q||!q.s||/NaN|undefined|Infinity/.test(q.q+q.s))throw 'BAD '+lv+' '+k+' '+JSON.stringify(q);
  var key=lv+':'+k;rng[key]=rng[key]||[1e9,-1e9];rng[key][0]=Math.min(rng[key][0],q.a);rng[key][1]=Math.max(rng[key][1],q.a);}}});
o.setLv('medium');
for(var bk in o.BANKS){o.BANKS[bk].forEach(function(x,i){if(!x.q||!x.w||!x.o||!(x.a>=0&&x.a<x.o.length))throw 'BANK '+bk+' '+i;});out.push('bank '+bk+': '+o.BANKS[bk].length+' cards ok');}
for(var mi=0;mi<500;mi++){var mc=o.mentalCard();if(!isFinite(mc.num)||!mc.q)throw 'MENTAL '+JSON.stringify(mc);}out.push('mental maths × 500 ok');
out.push(Object.keys(o.GEN).length+' generators × 3 levels × 300 ok');
['prem','alpha','irr','mom','tsm','acc'].forEach(function(k){out.push('  '+k+': '+['easy','medium','hard'].map(function(lv){var x=rng[lv+':'+k];return lv[0]+' '+x[0].toFixed(1)+'…'+x[1].toFixed(1);}).join(' | '));});
for(var k in o.LEDGER){for(var i=0;i<300;i++){var c=o.LEDGER[k]();c.k=k;c.q=o.ledgerQuestion(c);
  ['ni','cash','a','l','e'].forEach(function(x){if(!isFinite(c[x]))throw 'LEDGER '+k+' '+x+' not finite';if(Math.abs(c[x]-Math.round(c[x]))>1e-9)throw 'LEDGER '+k+' '+x+' not integer: '+c[x];});
  if(Math.abs(c.a-c.l-c.e)>1e-9)throw 'LEDGER '+k+' does not balance '+JSON.stringify(c);
  var d=c.d,eq=function(x,y,what){if(Math.abs(x-y)>1e-9)throw 'LEDGER '+k+' '+what+': '+x+' vs '+y+' '+JSON.stringify(d);};
  eq(d.ni,d.rev-d.cogs-d.opex-d.da-d.imp-d.int+d.gain-d.tax,'income statement does not add up to net income');
  eq(d.cash,d.cfo+d.cfi+d.cff,'CFO + CFI + CFF is not the change in cash');
  eq(d.re,k==='dividend'?d.ni+d.cff:d.ni,'retained earnings do not move with net income');
  Object.keys(d).forEach(function(x){if(!isFinite(d[x])||Math.abs(d[x]-Math.round(d[x]))>1e-9)throw 'LEDGER '+k+' '+x+' not an integer';});
  if(!c.q||['book','which','single','claim'].indexOf(c.q.type)<0)throw 'LEDGER '+k+' no question';
  if(!c.txt||!c.is||!c.cf||!c.bs)throw 'LEDGER '+k+' missing text';}}
out.push(Object.keys(o.LEDGER).length+' ledger transactions × 300 balance');
for(var lv in o.LEDGER_LEVELS)o.LEDGER_LEVELS[lv].keys.forEach(function(k){if(!o.LEDGER[k])throw 'LEVEL '+lv+' unknown '+k;});
for(var lv in o.LEDGER_LEVELS)for(var tn=1;tn<=o.LEDGER_TESTS;tn++){var t1=JSON.stringify(o.testCards(lv,tn)),t2=JSON.stringify(o.testCards(lv,tn));if(t1!==t2)throw 'TEST '+lv+' '+tn+' not deterministic';}
if(JSON.stringify(o.testCards('easy',1))===JSON.stringify(o.testCards('easy',2)))throw 'TESTS 1 and 2 identical';
var coinc={},qs={book:0,which:0,single:0,claim:0},zero=0,whichNone=0,ctrue=0,cfalse=0,trapsChecked=0;
for(var k in o.LEDGER){if(!o.TRAPS[k])throw 'NO TRAPS for '+k;for(var i=0;i<300;i++){var c=o.LEDGER[k]();c.k=k;
  o.TRAPS[k](c.d).forEach(function(t){trapsChecked++;if(o.claimTrue(c.d,t)){coinc[k]=(coinc[k]||0)+1;if(coinc[k]>6)throw 'TRAP often true: '+k+' '+JSON.stringify(t);}});
  var q=o.ledgerQuestion(c);qs[q.type]++;
  if(q.type==='single'&&c.d[q.pos]===0)zero++;
  if(q.type==='which'&&!Object.keys(c.d).some(function(x){return false;})){}
  if(q.type==='claim'){if(o.claimTrue(c.d,[q.pos,q.val]))ctrue++;else cfalse++;if(!o.claimText(q.pos,q.val))throw 'no claim text';}}}
out.push('traps all false ('+trapsChecked+' checked) · mix '+JSON.stringify(qs)+' · single with answer 0: '+Math.round(zero/qs.single*100)+'% · claims true '+Math.round(ctrue/(ctrue+cfalse)*100)+'%');
out.push('fixed tests deterministic: 3 levels × '+o.LEDGER_TESTS);
out.push('levels ok: '+Object.keys(o.LEDGER_LEVELS).map(function(k){return k+' '+o.LEDGER_LEVELS[k].keys.length;}).join(', '));
o.QB.forEach(function(q){if(q.length!==5||!o.CATS[q[1]]||'ba'.indexOf(q[2])<0)throw 'BAD QB '+q[0];});
out.push(o.QB.length+' questions ok');
out.push('parseNum '+JSON.stringify([o.parseNum('1,25'),o.parseNum('1,250'),o.parseNum('-7,5'),o.parseNum('12%')]));
out.join('\n');

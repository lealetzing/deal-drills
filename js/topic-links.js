/* Topics page: under each section heading, buttons to the matching drills, technical questions, games and cases. */
(function(){
  var T={
    m1:{d:['dep'],q:'acc',g:[['games.html?g=ledger','Balance the Books']],c:['bilanz']},
    m2:{d:['ev','tsm','ps'],q:'ev',g:[['games.html?g=bs','Bridge Sort']]},
    m3:{d:['ps'],q:'val'},
    m4:{d:['pv','tv','wacc','fcf'],q:'dcf'},
    m5:{d:['prem','alpha']},
    m6:{d:['acc','bes'],q:'mm',g:[['games.html?g=ad',L('Accretive or Dilutive','Accretive oder Dilutive')]],c:['muster']},
    m7:{d:['exr','prem'],q:'pay'},
    m8:{q:'proc',g:[['games.html?g=proc_sell',L('Process: sell-side','Prozess: Sell-side')],['games.html?g=proc_buy',L('Process: buy-side','Prozess: Buy-side')]],c:['falke']},
    m9:{d:['alpha'],q:'law',g:[['games.html?g=proc_wpug',L('Process: WpÜG','Prozess: WpÜG')]],c:['muster']},
    m10:{d:['mom','irr'],q:'lbo',g:[['games.html?g=lbo','Paper LBO Sprint']]}
  };
  var CASE_NAME={muster:L('Case: Project Orion','Fall: Projekt Muster'),falke:L('Case: Project Falcon','Fall: Projekt Falke'),bilanz:L('Case: balance sheet marathon','Fall: Bilanz-Marathon')};
  Object.keys(T).forEach(function(id){
    var sec=document.getElementById(id),t=T[id];if(!sec)return;
    var head=sec.querySelector('.mhead');if(!head)return;
    var n=t.q&&typeof QB!=='undefined'?QB.filter(function(q){return q[1]===t.q;}).length:0,b=[];
    if(n)b.push('<a class="btn small" href="technicals.html#'+t.q+'">'+L('Interview questions','Interviewfragen')+' ('+n+')</a>');
    if(t.d)b.push('<a class="btn ghost small" href="drills.html?t='+t.d.join(',')+'&mode=practice">'+L('Practice drills','Rechenaufgaben üben')+'</a>');
    (t.g||[]).forEach(function(g){b.push('<a class="btn ghost small" href="'+g[0]+'">'+L('Game: ','Spiel: ')+g[1]+'</a>');});
    (t.c||[]).forEach(function(c){b.push('<a class="btn ghost small" href="cases.html?c='+c+'">'+CASE_NAME[c]+'</a>');});
    var div=document.createElement('div');div.className='row tlinks';div.innerHTML=b.join('');
    head.insertAdjacentElement('afterend',div);
  });
})();

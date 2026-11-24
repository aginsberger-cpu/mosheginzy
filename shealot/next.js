/* "לשאלה הבאה": כפתור שעובר לשאלה הגדולה הבאה, לפי הסדר ברשימת כל השאלות */
(function(){try{
  var file=(location.pathname.split('/').pop()||'');if(!file||file==='index.html'||file==='en-all.html')return;
  var en=(document.documentElement.lang||'').indexOf('en')===0;
  var list=en?'/shealot/en-all.html':'/shealot/index.html';
  fetch(list).then(function(r){return r.text()}).then(function(h){
    var re=/class="qc" href="([^"]+)"[\s\S]*?class="qt">([^<]+)</g,m,items=[];
    while((m=re.exec(h)))items.push({f:m[1],t:m[2]});
    var i=-1;items.forEach(function(x,k){if(x.f===file)i=k});if(i<0||!items.length)return;
    var nx=items[(i+1)%items.length];
    var a=document.createElement('a');a.className='mg-next';a.href='/shealot/'+nx.f+location.search;
    a.innerHTML='<span class="mg-next-l">'+(en?'Next question':'לשאלה הבאה')+'</span><span class="mg-next-t">'+nx.t+'</span><span class="mg-next-ar">'+(en?'→':'←')+'</span>';
    var st=document.createElement('style');st.textContent='.mg-next{display:flex;align-items:center;gap:12px;margin:26px 0 0;padding:14px 18px;border-radius:16px;text-decoration:none;border:1.5px solid rgba(212,175,94,.6);background:linear-gradient(135deg,rgba(212,175,94,.14),rgba(212,175,94,.04));box-shadow:0 0 18px rgba(232,192,64,.12)}.mg-next-l{flex:none;font-size:.82rem;font-weight:700;color:#C9A24C}.mg-next-t{flex:1;font-weight:700;color:#F0D894;font-size:1rem;line-height:1.35}.mg-next-ar{flex:none;font-size:1.3rem;color:#E8C468}.mg-all{display:block;text-align:center;margin:12px 0 0;padding:10px;border-radius:999px;border:1px solid rgba(212,175,94,.35);color:#E8C468;text-decoration:none;font-weight:700;font-size:.92rem}';
    document.head.appendChild(st);
    var b=document.createElement('a');b.className='mg-all';b.href=(en?'/shealot/en-all.html':'/shealot/')+location.search;b.textContent=en?'← All Big Questions':'→ לכל השאלות הגדולות';
    var v=document.querySelector('.art')||document.querySelector('.video');if(v){v.parentNode.insertBefore(b,v.nextSibling);v.parentNode.insertBefore(a,v.nextSibling);}
  }).catch(function(){});
}catch(e){}})();

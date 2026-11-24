/* תמונות שער לסרטונים באתר: תמונת שער נקייה אם יש; אחרת התמונה האנכית של יוטיוב (oardefault, ואם אין, frame0) */
(function(){
  var SEL='.mgs-img img, .qi img, .pc .pqi img';
  var RX=/^https?:\/\/(?:i|img)\.ytimg\.com\/vi\/([A-Za-z0-9_-]{11})\/(?:hqdefault|mqdefault|maxresdefault)\.jpg/;
  function up(img){
    if(img.dataset.vt)return;var src=img.getAttribute('src')||'';var m=src.match(RX);if(!m)return;var id=m[1];img.dataset.vt='1';
    if((window.MG_COVERS||[]).indexOf(id)>-1){img.src='/img/covers/'+id+'.jpg';return;}
    img.addEventListener('load',function h(){var s=img.src;
      if(s.indexOf('oardefault')>-1&&img.naturalWidth<200){img.src='https://i.ytimg.com/vi/'+id+'/frame0.jpg';}
      else if(s.indexOf('frame0')>-1&&img.naturalWidth>img.naturalHeight){img.style.objectFit='contain';img.src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';img.removeEventListener('load',h);}
    });
    img.addEventListener('error',function(){if(img.src.indexOf('hqdefault')<0)img.src='https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';});
    img.src='https://i.ytimg.com/vi/'+id+'/oardefault.jpg';
  }
  function scan(r){[].forEach.call((r||document).querySelectorAll(SEL),up);}
  function go(){scan();new MutationObserver(function(ms){ms.forEach(function(m){[].forEach.call(m.addedNodes,function(n){if(n.nodeType!==1)return;if(n.tagName==='IMG'&&n.matches(SEL))up(n);else if(n.querySelectorAll)scan(n);});});}).observe(document.body,{childList:true,subtree:true});
    /* הפרשה: הדף מחליף את התמונות לפי שפה; לסרוק שוב אחרי זה */
    setTimeout(function(){[].forEach.call(document.querySelectorAll(SEL),function(i){if(RX.test(i.getAttribute('src')||'')){delete i.dataset.vt;up(i);}});},400);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();

// Receives a visitor's saved settings when they arrive from the old address (mosheginzy.com).
// The redirect page there puts them in the URL as #mgmig=<data>&h=<original hash>.
// Must load before any other script on the page, so the app sees the user's name, id, language, history.
(function(){
  try{
    var h=location.hash||'';
    if(h.indexOf('#mgmig=')!==0)return;
    var parts=h.slice(1).split('&h=');
    var data=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(parts[0].slice(6))))));
    for(var k in data){
      if(Object.prototype.hasOwnProperty.call(data,k)&&localStorage.getItem(k)===null){
        localStorage.setItem(k,data[k]);
      }
    }
    var orig=parts[1]?decodeURIComponent(parts[1]):'';
    history.replaceState(null,'',location.pathname+location.search+orig);
    if(orig&&orig.length>1){
      window.addEventListener('load',function(){
        var el=document.getElementById(orig.slice(1));
        if(el)el.scrollIntoView();
      });
    }
  }catch(e){}
})();

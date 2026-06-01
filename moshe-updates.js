// moshe-updates.js — שיפוצים לאתר משה גינזי
(function () {

  var EL_API_KEY = 'sk_0a386a44903ba282d03e112390d1e87774ce751bf08a4749';
  var EL_VOICE_ID = 'jSyAO1W1N4S7u904a6Z3';

  // ─── CSS ───────────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    @keyframes mgbounce {
      0%,60%,100%{transform:translateY(0);opacity:1}
      30%{transform:translateY(-7px);opacity:.7}
    }
    @keyframes mgpulse {
      0%,100%{box-shadow:0 0 0 0 rgba(201,149,42,.4)}
      50%{box-shadow:0 0 0 8px rgba(201,149,42,0)}
    }
    .hero { min-height:80vh !important; }
    .hero-img img {
      object-position: top center !important;
      transform: translateY(-60px) !important;
    }
    #mg-mic-btn {
      width:42px;height:42px;border-radius:50%;
      background:transparent;border:1px solid rgba(201,149,42,.5);
      cursor:pointer;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;transition:all .2s;
    }
    #mg-mic-btn:hover{background:rgba(201,149,42,.15)}
    #mg-mic-btn.listening{background:rgba(201,149,42,.25);border-color:#c9952a;animation:mgpulse 1s infinite}
    .mg-lang-btn {
      background:transparent;border:1px solid rgba(201,149,42,.4);
      color:#c9952a;padding:3px 10px;border-radius:12px;
      font-size:11px;cursor:pointer;font-family:inherit;transition:all .2s;
    }
    .mg-lang-btn.active{background:#c9952a;color:#1a1209}
    .mg-bot-wrapper {
      background:#09090b;
      padding:0;
    }
    .mg-bot-title {
      text-align:center;
      padding:3rem 5vw 1.5rem;
      font-size:1.8rem;
      font-weight:400;
      color:#f0ece0;
      line-height:1.4;
    }
    .mg-bot-title em { color:#e8c870; font-style:italic; }
    .mg-intro-box {
      max-width:700px;
      margin:0 auto;
      padding:0 5vw 2.5rem;
      text-align:center;
      color:#b0a898;
      font-size:.95rem;
      line-height:2;
    }
    .mg-intro-box strong { color:#e8c56a; }
    .btn-teal {
      background:transparent;
      color:#4ecdc4;
      padding:.9rem 2.2rem;
      font-size:.82rem;
      letter-spacing:.14em;
      text-transform:uppercase;
      text-decoration:none;
      border:1px solid rgba(78,205,196,.5);
      display:inline-block;
      cursor:pointer;
      transition: all .2s;
    }
    .btn-teal:hover { background:rgba(78,205,196,.1); }
  `;
  document.head.appendChild(style);

  // ─── PHOTO HELPERS ─────────────────────────────────────────────────────────
  function getMoshePhotoSrc(){
    var h=document.getElementById('moshe-photo');
    return h?h.src:'';
  }
  function makePhotoCircle(w,h,border){
    var src=getMoshePhotoSrc(); if(!src)return null;
    var img=document.createElement('img');
    img.src=src;
    img.style.cssText='width:'+w+'px;height:'+h+'px;border-radius:50%;'+
      'object-fit:cover;object-position:top center;flex-shrink:0;'+
      'border:'+(border||'1px')+' solid #e8b84b;';
    return img;
  }
  function replaceAvatarWithPhoto(el,w,h,border){
    if(!el)return;
    var p=makePhotoCircle(w,h,border);
    if(p&&el.parentNode)el.parentNode.replaceChild(p,el);
  }

  // ─── ELEVENLABS TTS ────────────────────────────────────────────────────────
  var currentAudio=null;
  function speakText(text){
    if(currentAudio){currentAudio.pause();currentAudio=null;}
    fetch('https://api.elevenlabs.io/v1/text-to-speech/'+EL_VOICE_ID,{
      method:'POST',
      headers:{'xi-api-key':EL_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        text:text,
        model_id:'eleven_multilingual_v2',
        voice_settings:{stability:.5,similarity_boost:.75}
      })
    })
    .then(function(r){return r.blob();})
    .then(function(blob){
      var url=URL.createObjectURL(blob);
      currentAudio=new Audio(url);
      currentAudio.play();
    }).catch(function(){});
  }

  // ─── DOM READY ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function(){

    // 1. שנה טקסט Hero
    var heroDesc=document.querySelector('.hero-desc');
    if(heroDesc){
      heroDesc.innerHTML='מחפשים תשובות עמוקות לשאלות של החיים? <strong>הגעתם הביתה.</strong> המקום שלכם להתחבר לשורשים, לשאול הכל ולמצוא שקט בתוך השגרה.';
    }

    // 2. שנה כפתור "צפה בשיעורים" לשמור, הוסף "שאלות / שיח" בצבע טורקיז
    var heroBtns=document.querySelector('.hero-btns');
    if(heroBtns && !heroBtns.querySelector('.btn-teal')){
      var newBtn=document.createElement('a');
      newBtn.href='#mg-bot-section';
      newBtn.className='btn-teal';
      newBtn.textContent='שאלות / שיח';
      heroBtns.appendChild(newBtn);
    }

    // 3. הזז את סקשן הבוט אחרי ה-Hero
    var hero=document.querySelector('.hero');
    var botSectionOld=document.querySelector('#mg-bot') ?
      document.querySelector('#mg-bot').closest('section') : null;
    var aboutSection=document.querySelector('.about');

    if(hero && botSectionOld){
      // צור wrapper חדש לבוט
      var botWrapper=document.createElement('div');
      botWrapper.id='mg-bot-section';
      botWrapper.className='mg-bot-wrapper';

      // כותרת
      var botTitle=document.createElement('div');
      botTitle.className='mg-bot-title';
      botTitle.innerHTML='לכל שאלה שיש לכם בלב –<br><em>משה כאן בשבילכם</em> 👇';
      botWrapper.appendChild(botTitle);

      // קטע הסבר
      var introBox=document.createElement('div');
      introBox.className='mg-intro-box';
      introBox.innerHTML='<p>מרגישים לפעמים שמשהו חסר? יש לכם שאלה עמוקה על החיים, על המסורת שלנו, או על משמעות היותנו יהודים בעולם המודרני? <strong>אתם לא לבד.</strong> כאן אתם יכולים לשאול כל שאלה שיושבת לכם על הלב בענייני יהדות, ולקבל תשובה חמה, מחברת ובגובה העיניים. בואו נתחיל לדבר..</p>';
      botWrapper.appendChild(introBox);

      // הבוט עצמו
      var botEl=document.querySelector('#mg-bot');
      botWrapper.appendChild(botSectionOld);

      // divider
      var gd1=document.createElement('div');
      gd1.className='gd';

      // הכנס אחרי hero
      var heroNext=hero.nextElementSibling;
      hero.parentNode.insertBefore(botWrapper, heroNext);
      hero.parentNode.insertBefore(gd1, heroNext);
    }

    // 4. שנה פתיחת הבוט
    var openingTitle=document.querySelector('#mg-msgs > div > div[style*="font-family:serif"]');
    if(openingTitle) openingTitle.textContent='אין שאלה קטנה מדי, ואין שאלה גדולה מדי.';
    var openingSub=document.querySelector('#mg-msgs > div > div[style*="color:rgba(26,18,9,0.78)"]');
    if(openingSub) openingSub.innerHTML='תרגישו חופשי לשאול אותי הכל –<br>על יהדות, חיים, משמעות, ועוד.';

    // 5. החלף אווטארים בתמונת משה
    document.querySelectorAll('#mg-bot div').forEach(function(el){
      if(el.textContent.trim()==='MG'&&el.style.width==='52px'){
        replaceAvatarWithPhoto(el,52,52,'2px');
      }
    });

    // 6. הוסף כפתורי שפה
    addLangToggle();

    // 7. הוסף מיקרופון
    addMicButton();

  });

  // ─── MUTATION OBSERVER ─────────────────────────────────────────────────────
  function patchNewAvatar(node){
    if(!node||node.nodeType!==1)return;
    if(node.textContent&&node.textContent.trim()==='MG'){
      var s=node.style;
      if(s&&s.borderRadius==='50%'){
        var p=makePhotoCircle(34,34,'1px');
        if(p&&node.parentNode)node.parentNode.replaceChild(p,node);
        return;
      }
    }
    node.querySelectorAll&&node.querySelectorAll('div').forEach(function(child){
      if(child.textContent.trim()==='MG'&&child.style.borderRadius==='50%'&&child.style.width==='34px'){
        var p=makePhotoCircle(34,34,'1px');
        if(p&&child.parentNode)child.parentNode.replaceChild(p,child);
      }
    });
  }

  var chatContainer=document.getElementById('mg-msgs');
  if(chatContainer){
    var obs=new MutationObserver(function(mutations){
      mutations.forEach(function(m){
        m.addedNodes.forEach(function(n){patchNewAvatar(n);});
      });
    });
    obs.observe(chatContainer,{childList:true,subtree:true});
  }

  // ─── כפתורי שפה ────────────────────────────────────────────────────────────
  function addLangToggle(){
    var header=document.querySelector('#mg-bot > div > div:first-child');
    if(!header||document.querySelector('.mg-lang-toggle'))return;
    var toggle=document.createElement('div');
    toggle.className='mg-lang-toggle';
    toggle.style.cssText='display:flex;gap:6px;align-items:center;';
    toggle.innerHTML=
      '<button class="mg-lang-btn active" onclick="mgSetLang(\'he\')">🇮🇱 עברית</button>'+
      '<button class="mg-lang-btn" onclick="mgSetLang(\'en\')">🇺🇸 English</button>';
    header.appendChild(toggle);
  }

  window.mgSetLang=function(lang){
    document.querySelectorAll('.mg-lang-btn').forEach(function(b){b.classList.remove('active');});
    event.target.classList.add('active');
    var inp=document.getElementById('mg-inp');
    if(inp) inp.placeholder=lang==='he'?'כתוב שאלה...':'Type your question...';
    localStorage.setItem('mg-lang',lang);
  };

  // ─── מיקרופון ───────────────────────────────────────────────────────────────
  function addMicButton(){
    var SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition)return;
    var inp=document.getElementById('mg-inp');
    if(!inp||document.getElementById('mg-mic-btn'))return;
    var inputRow=inp.parentNode; if(!inputRow)return;

    var micBtn=document.createElement('button');
    micBtn.id='mg-mic-btn';
    micBtn.title='דבר במקום לכתוב';
    micBtn.innerHTML='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>';
    inputRow.insertBefore(micBtn,inp);

    var recognition=new SpeechRecognition();
    recognition.continuous=false;
    recognition.interimResults=true;
    var isListening=false;

    recognition.onresult=function(e){
      var t='';
      for(var i=e.resultIndex;i<e.results.length;i++) t+=e.results[i][0].transcript;
      inp.value=t;
    };
    recognition.onend=function(){
      isListening=false;
      micBtn.classList.remove('listening');
      inp.placeholder=localStorage.getItem('mg-lang')==='en'?'Type your question...':'כתוב שאלה...';
      if(inp.value.trim()&&window.mgSend) window.mgSend();
    };
    recognition.onerror=function(e){
      isListening=false;
      micBtn.classList.remove('listening');
    };
    micBtn.addEventListener('click',function(){
      if(isListening){recognition.stop();}
      else{
        isListening=true;
        micBtn.classList.add('listening');
        inp.value='';
        inp.placeholder='🎤 מקשיב...';
        recognition.lang=localStorage.getItem('mg-lang')==='en'?'en-US':'he-IL';
        recognition.start();
      }
    });
  }

  // ─── עטוף mgSend לקול ──────────────────────────────────────────────────────
  function wrapMgSend(){
    if(!window.mgSend||window.mgSend._wrapped)return;
    var orig=window.mgSend;
    window.mgSend=function(){
      orig.apply(this,arguments);
      var tries=0;
      var timer=setInterval(function(){
        tries++;
        var typing=document.getElementById('mg-typ');
        if(!typing||tries>40){
          clearInterval(timer);
          if(!typing){
            var msgs=document.querySelectorAll('#mg-msgs > div');
            for(var i=msgs.length-1;i>=0;i--){
              var divs=msgs[i].querySelectorAll('div');
             var allText='';
for(var j=0;j<divs.length;j++){
  if(divs[j].style&&divs[j].style.borderBottomRightRadius==='4px'&&divs[j].textContent.trim()){
    allText+=divs[j].textContent.trim()+' ';
  }
}
if(allText){speakText(allText.trim());return;}
            }
          }
        }
      },300);
    };
    window.mgSend._wrapped=true;
  }

  if(window.mgSend){wrapMgSend();}
  else{
    var t=setInterval(function(){
      if(window.mgSend){clearInterval(t);wrapMgSend();}
    },300);
  }

})();

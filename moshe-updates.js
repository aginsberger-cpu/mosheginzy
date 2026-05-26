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
    .hero-img img { object-position: top center !important; }
    #mg-mic-btn {
      width:42px;height:42px;border-radius:50%;
      background:transparent;border:1px solid rgba(201,149,42,.5);
      cursor:pointer;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;transition:all .2s;
    }
    #mg-mic-btn:hover{background:rgba(201,149,42,.15)}
    #mg-mic-btn.listening{background:rgba(201,149,42,.25);border-color:#c9952a;animation:mgpulse 1s infinite}
    #mg-speak-btn {
      background:transparent;border:none;cursor:pointer;
      padding:4px 8px;color:#c9952a;font-size:18px;
      opacity:.7;transition:opacity .2s;flex-shrink:0;
    }
    #mg-speak-btn:hover{opacity:1}
    .mg-lang-toggle {
      display:flex;gap:6px;align-items:center;
      font-size:12px;color:#c9952a;cursor:pointer;
    }
    .mg-lang-btn {
      background:transparent;border:1px solid rgba(201,149,42,.4);
      color:#c9952a;padding:3px 10px;border-radius:12px;
      font-size:11px;cursor:pointer;font-family:inherit;transition:all .2s;
    }
    .mg-lang-btn.active{background:#c9952a;color:#1a1209}
    .mg-intro-box {
      background:#1a1209;padding:28px 5vw;text-align:center;
      border-top:1px solid rgba(201,149,42,.2);
      border-bottom:1px solid rgba(201,149,42,.2);
    }
    .mg-intro-box p {
      max-width:680px;margin:0 auto;color:#b0a898;
      font-size:.97rem;line-height:2;
    }
    .mg-intro-box p strong{color:#e8c56a}
  `;
  document.head.appendChild(style);

  // ─── MOSHE PHOTO HELPERS ───────────────────────────────────────────────────
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
  var currentAudio = null;
  function speakText(text){
    if(currentAudio){currentAudio.pause();currentAudio=null;}
    fetch('https://api.elevenlabs.io/v1/text-to-speech/'+EL_VOICE_ID,{
      method:'POST',
      headers:{
        'xi-api-key': EL_API_KEY,
        'Content-Type':'application/json'
      },
      body:JSON.stringify({
        text: text,
        model_id:'eleven_multilingual_v2',
        voice_settings:{stability:.5,similarity_boost:.75}
      })
    })
    .then(function(r){return r.blob();})
    .then(function(blob){
      var url=URL.createObjectURL(blob);
      currentAudio=new Audio(url);
      currentAudio.play();
    })
    .catch(function(){});
  }

  // ─── DOM READY ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function(){

    // 1. שנה טקסט Hero
    var heroDesc = document.querySelector('.hero-desc');
    if(heroDesc){
      heroDesc.innerHTML = 'מחפשים תשובות עמוקות לשאלות של החיים? <strong>הגעתם הביתה.</strong> המקום שלכם להתחבר לשורשים, לשאול הכל ולמצוא שקט בתוך השגרה.';
    }

    // 2. הוסף כפתור "שאלות / שיח"
    var heroBtns = document.querySelector('.hero-btns');
    if(heroBtns){
      var newBtn = document.createElement('a');
      newBtn.href = '#mg-bot';
      newBtn.className = 'btn-out';
      newBtn.textContent = 'שאלות / שיח';
      heroBtns.appendChild(newBtn);
    }

    // 3. הזז About אחרי הבוט
    var botSection = document.querySelector('#mg-bot');
    var aboutSection = document.querySelector('.about');
    var goldDividers = document.querySelectorAll('.gd');
    if(botSection && aboutSection){
      // מצא את ה-parent ואת הסדר
      var parent = aboutSection.parentNode;
      var botParent = botSection.closest('section') || botSection.parentNode;
      // מצא divider לפני about
      var aboutDivBefore = aboutSection.previousElementSibling;
      var aboutDivAfter = aboutSection.nextElementSibling;

      // הזז about אחרי הבוט
      var botSectionEl = botSection.closest('section');
      if(botSectionEl){
        var botDivAfter = botSectionEl.nextElementSibling;
        if(botDivAfter && botDivAfter.classList.contains('gd')){
          botDivAfter.after(aboutDivBefore&&aboutDivBefore.classList.contains('gd')?aboutDivBefore.cloneNode():document.createElement('div'));
          botDivAfter.after(aboutSection);
        }
      }
    }

    // 4. הוסף תיבת מבוא לפני הבוט
    var botSectionEl = document.querySelector('#mg-bot') ?
      document.querySelector('#mg-bot').closest('section') : null;
    if(botSectionEl && !document.querySelector('.mg-intro-box')){
      var introBox = document.createElement('div');
      introBox.className = 'mg-intro-box';
      introBox.innerHTML = '<p>מרגישים לפעמים שמשהו חסר? יש לכם שאלה עמוקה על החיים, על המסורת שלנו, או על משמעות היותנו יהודים בעולם המודרני? <strong>אתם לא לבד.</strong> כאן אתם יכולים לשאול כל שאלה שיושבת לכם על הלב בענייני יהדות, ולקבל תשובה חמה, מחברת ובגובה העיניים. בואו נתחיל לדבר..</p>';
      botSectionEl.parentNode.insertBefore(introBox, botSectionEl);
    }

    // 5. שנה כותרת הבוט
    var botTitle = document.querySelector('#mg-bot h2');
    if(botTitle){
      var titleSpanEl = botTitle.querySelector('span');
      botTitle.innerHTML = '';
      if(titleSpanEl) botTitle.appendChild(titleSpanEl);
      var titleText = document.createTextNode('לכל שאלה שיש לכם בלב – משה כאן בשבילכם');
      botTitle.appendChild(titleText);
    }

    // 6. שנה הודעת פתיחה בבוט
    var centerDiv = document.querySelector('#mg-msgs > div');
    if(centerDiv){
      var titleEl = centerDiv.querySelector('div[style*="font-family:serif"]');
      if(titleEl) titleEl.textContent = 'אין שאלה קטנה מדי, ואין שאלה גדולה מדי.';
      var subEl = centerDiv.querySelector('div[style*="color:rgba(26,18,9,0.78)"]');
      if(subEl) subEl.innerHTML = 'תרגישו חופשי לשאול אותי הכל –<br>על יהדות, חיים, משמעות, ועוד.';
    }

    // 7. החלף אווטארים בתמונת משה
    var titleSpan = document.querySelector('#mg-bot h2 span');
    if(titleSpan && titleSpan.textContent.trim()==='MG'){
      replaceAvatarWithPhoto(titleSpan,44,44,'2px');
    }
    document.querySelectorAll('#mg-bot div').forEach(function(el){
      if(el.textContent.trim()==='MG' && el.style.width==='52px'){
        replaceAvatarWithPhoto(el,52,52,'2px');
      }
    });

    // 8. הוסף כפתורי שפה + מיקרופון
    addLangToggle();
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
    // הוסף כפתור קול על הודעות בוט חדשות
    addSpeakBtnToNode(node);
  }

  function addSpeakBtnToNode(node){
    if(!node||node.nodeType!==1)return;
    // חפש bubble של בוט
    node.querySelectorAll&&node.querySelectorAll('div').forEach(function(el){
      if(el.style&&el.style.borderBottomRightRadius==='4px'&&!el.dataset.hasSpeakBtn){
        el.dataset.hasSpeakBtn='1';
        var btn=document.createElement('button');
        btn.innerHTML='🔊';
        btn.title='האזן לתשובה';
        btn.id='mg-speak-btn';
        btn.style.cssText='background:transparent;border:none;cursor:pointer;font-size:16px;opacity:.7;margin-top:6px;display:block;';
        btn.onclick=function(){speakText(el.textContent);};
        el.after(btn);
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
    toggle.innerHTML=
      '<button class="mg-lang-btn active" id="btn-he" onclick="mgSetLang(\'he\')">עברית</button>'+
      '<button class="mg-lang-btn" id="btn-en" onclick="mgSetLang(\'en\')">English</button>';
    header.appendChild(toggle);
  }

  window.mgSetLang=function(lang){
    document.getElementById('btn-he').classList.toggle('active',lang==='he');
    document.getElementById('btn-en').classList.toggle('active',lang==='en');
    var inp=document.getElementById('mg-inp');
    if(inp) inp.placeholder=lang==='he'?'כתוב שאלה...':'Type your question...';
    localStorage.setItem('mg-lang',lang);
  };

  // ─── כפתור מיקרופון ────────────────────────────────────────────────────────
  function addMicButton(){
    var SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SpeechRecognition)return;
    var inp=document.getElementById('mg-inp');
    if(!inp||document.getElementById('mg-mic-btn'))return;
    var inputRow=inp.parentNode; if(!inputRow)return;

    var micBtn=document.createElement('button');
    micBtn.id='mg-mic-btn';
    micBtn.title='דבר במקום לכתוב';
    micBtn.innerHTML=
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>'+
      '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>'+
      '<line x1="12" y1="19" x2="12" y2="23"/>'+
      '<line x1="8" y1="23" x2="16" y2="23"/>'+
      '</svg>';
    inputRow.insertBefore(micBtn,inp);

    var recognition=new SpeechRecognition();
    var lang=localStorage.getItem('mg-lang')||'he';
    recognition.lang=lang==='he'?'he-IL':'en-US';
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
      inp.placeholder=lang==='he'?'כתוב שאלה...':'Type your question...';
      if(inp.value.trim()&&window.mgSend) window.mgSend();
    };
    recognition.onerror=function(e){
      isListening=false;
      micBtn.classList.remove('listening');
      if(e.error==='not-allowed') alert('יש לאשר גישה למיקרופון בדפדפן');
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

  // ─── עטוף את mgSend המקורי כדי להוסיף קול ─────────────────────────────────
  var _origSend = window.mgSend;
  function wrapMgSend(){
    if(window.mgSend && window.mgSend !== wrappedSend){
      _origSend = window.mgSend;
      window.mgSend = wrappedSend;
    }
  }
  function wrappedSend(){
    // קרא לפונקציה המקורית
    _origSend && _origSend.apply(this, arguments);
    // המתן לתשובה ונגן אותה
    var checkInterval = setInterval(function(){
      var typing = document.getElementById('mg-typ');
      if(!typing){
        clearInterval(checkInterval);
        // מצא את ההודעה האחרונה של הבוט
        var msgs = document.querySelectorAll('#mg-msgs > div');
        for(var i=msgs.length-1;i>=0;i--){
          var bubbles = msgs[i].querySelectorAll('div');
          for(var j=0;j<bubbles.length;j++){
            if(bubbles[j].style && bubbles[j].style.borderBottomRightRadius==='4px'){
              speakText(bubbles[j].textContent);
              return;
            }
          }
        }
      }
    }, 300);
  }

  // נסה לעטוף מיד ואם לא — נחכה
  if(window.mgSend){ wrapMgSend(); }
  else {
    var wrapAttempts = 0;
    var wrapTimer = setInterval(function(){
      if(window.mgSend || wrapAttempts > 20){
        clearInterval(wrapTimer);
        wrapMgSend();
      }
      wrapAttempts++;
    }, 300);
  }

})();

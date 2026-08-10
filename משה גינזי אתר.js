// ═══════════════════════════════════════════════════════
// mosheginzy.com — Complete JavaScript (restored)
// Replace the broken <script> block in index.html with:
//   <script src="mosheginzy-fix.js"></script>
// ═══════════════════════════════════════════════════════

(function(){

// ── CONFIG ──
var DIFY_API = 'https://api.dify.ai/v1/chat-messages';
var DIFY_KEY = 'app-VFD9vOFBd83JQC3BvLwuX5Q4';
var EL_KEY   = 'sk_0a386a44903ba282d03e112390d1e87774ce751bf08a4749';
var EL_VOICE = 'jSyAO1W1N4S7u904a6Z3';
var SHEET_URL = 'https://script.google.com/macros/s/AKfycbzExample/exec'; // Update if needed

// ── STATE ──
var userName = '';
var userGender = '';
var conversationId = '';
var isBotBusy = false;
var currentLang = 'he';

// ── GENDER ──
window.mgSetGender = function(g){
  userGender = g;
  document.querySelectorAll('.mg-gender-btn').forEach(function(b){ b.classList.remove('selected'); });
  if(g === 'נקבה') document.getElementById('btn-female').classList.add('selected');
  else document.getElementById('btn-male').classList.add('selected');
};

// ── SAVE NAME & START CHAT ──
window.mgSaveName = function(){
  var inp = document.getElementById('mg-name-input');
  userName = (inp.value || '').trim();
  if(!userName){ inp.style.borderColor='#e74c3c'; return; }
  
  // Hide name screen
  var ns = document.getElementById('mg-name-screen');
  if(ns) ns.style.display = 'none';
  
  // Show welcome message from bot
  addBotMsg('שלום ' + userName + '! 👋\nשמח שהגעת. אני משה גינזי.\nאפשר לשאול אותי כל שאלה — על יהדות, חיים, משמעות, או כל דבר שמעניין אותך.');
};

// ── ADD BOT MESSAGE ──
function addBotMsg(text){
  var msgs = document.getElementById('mg-msgs');
  var row = document.createElement('div');
  row.className = 'mg-msg-row';
  row.innerHTML = '<div class="mg-avatar-sm"><img src="תמונה מצוינת משה גינזי.png" alt="משה"></div>' +
    '<div class="mg-bubble bot">' + text.replace(/\n/g,'<br>') + '</div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── ADD USER MESSAGE ──
function addUserMsg(text){
  var msgs = document.getElementById('mg-msgs');
  var row = document.createElement('div');
  row.className = 'mg-msg-row user';
  var initial = userName ? userName.charAt(0) : '?';
  row.innerHTML = '<div class="mg-avatar-user">' + initial + '</div>' +
    '<div class="mg-bubble user">' + text.replace(/\n/g,'<br>') + '</div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── SHOW TYPING ──
function showTyping(){
  var msgs = document.getElementById('mg-msgs');
  var t = document.createElement('div');
  t.className = 'mg-msg-row';
  t.id = 'mg-typing-row';
  t.innerHTML = '<div class="mg-avatar-sm"><img src="תמונה מצוינת משה גינזי.png" alt="משה"></div>' +
    '<div class="mg-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(t);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping(){
  var t = document.getElementById('mg-typing-row');
  if(t) t.remove();
}

// ── SEND MESSAGE ──
window.mgSend = function(){
  if(isBotBusy) return;
  var inp = document.getElementById('mg-inp');
  var q = (inp.value || '').trim();
  if(!q) return;
  
  inp.value = '';
  inp.style.height = 'auto';
  addUserMsg(q);
  isBotBusy = true;
  showTyping();
  
  // Build request body
  var body = {
    inputs: {},
    query: q,
    response_mode: 'blocking',
    user: userName || 'anonymous'
  };
  if(conversationId) body.conversation_id = conversationId;
  
  fetch(DIFY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + DIFY_KEY
    },
    body: JSON.stringify(body)
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    hideTyping();
    isBotBusy = false;
    if(data.conversation_id) conversationId = data.conversation_id;
    var answer = data.answer || 'סליחה, לא הצלחתי לענות. נסה שוב.';
    addBotMsg(answer);
    
    // Try to sync to Google Sheets
    try {
      syncToSheet(userName, userGender, q, answer, conversationId);
    } catch(e){}
  })
  .catch(function(err){
    hideTyping();
    isBotBusy = false;
    console.error('Dify error:', err);
    addBotMsg('מצטער, יש בעיה טכנית. נסה שוב בעוד רגע.');
  });
};

// ── SYNC TO GOOGLE SHEETS ──
function syncToSheet(name, gender, question, answer, convId){
  try {
    var payload = {
      timestamp: new Date().toISOString(),
      name: name,
      gender: gender,
      question: question,
      answer: answer,
      conversation_id: convId
    };
    fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch(e){ console.log('Sheet sync skipped'); }
}

// ── SPEECH RECOGNITION (MIC BUTTON) ──
var recognition = null;
var micBtn = document.getElementById('mg-mic-btn');
if(micBtn){
  micBtn.addEventListener('click', function(){
    if(!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)){
      alert('הדפדפן שלך לא תומך בזיהוי קולי. נסה Chrome.');
      return;
    }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!recognition){
      recognition = new SR();
      recognition.lang = 'he-IL';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      recognition.onresult = function(e){
        var text = e.results[0][0].transcript;
        document.getElementById('mg-inp').value = text;
        micBtn.classList.remove('listening');
      };
      recognition.onend = function(){
        micBtn.classList.remove('listening');
      };
      recognition.onerror = function(){
        micBtn.classList.remove('listening');
      };
    }
    
    if(micBtn.classList.contains('listening')){
      recognition.stop();
      micBtn.classList.remove('listening');
    } else {
      recognition.start();
      micBtn.classList.add('listening');
    }
  });
}

// ── VIDEO PLAYER ──
window.openVideoLocal = function(el, filename){
  var popup = document.getElementById('video-popup');
  var iframe = document.getElementById('vpop-iframe');
  // Use a video tag instead of iframe for local mp4
  var frame = document.querySelector('.vpop-frame');
  
  // Remove old video element if exists
  var oldVid = document.getElementById('vpop-video');
  if(oldVid) oldVid.remove();
  
  // Hide iframe, create video element
  iframe.style.display = 'none';
  
  var video = document.createElement('video');
  video.id = 'vpop-video';
  video.src = filename;
  video.controls = true;
  video.autoplay = true;
  video.playsInline = true;
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;background:#000;';
  frame.appendChild(video);
  
  popup.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeVideo = function(e){
  if(e && e.target !== document.getElementById('video-popup') && !e.target.classList.contains('vpop-close')) return;
  
  var popup = document.getElementById('video-popup');
  popup.classList.remove('open');
  document.body.style.overflow = '';
  
  // Stop video
  var vid = document.getElementById('vpop-video');
  if(vid){ vid.pause(); vid.remove(); }
  
  // Clear iframe
  var iframe = document.getElementById('vpop-iframe');
  if(iframe){ iframe.src = ''; iframe.style.display = 'block'; }
};

// Close on Escape key
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeVideo();
});

// ── EXTRA VIDEOS TOGGLE ──
window.toggleExtraVideos = function(){
  var extra = document.getElementById('extra-videos');
  var btn = document.getElementById('more-videos-btn');
  if(extra.style.display === 'none' || !extra.style.display){
    extra.style.display = 'block';
    btn.textContent = 'הסתר שיעורים ←';
  } else {
    extra.style.display = 'none';
    btn.textContent = 'לעוד שיעורים ←';
  }
};

// ── LANGUAGE SWITCHING ──
var translations = {
  en: {
    'mg-hello': 'Hello! 👋',
    'mg-askname': 'Before we begin — what\'s your name?',
    'about-p1': 'Moshe Ginzy is not a rabbi, not a preacher, and not here to make you religious. He believes every person deserves a life of meaning — and that the wisdom of thousands of years of Judaism belongs to you, just as you are.',
    'about-p2': 'He has met thousands of people searching: What am I doing here? Why does life feel empty? How do you find inner peace in a world that never stops? And for all of them, he created a space to ask.',
    'about-p3': 'No pressure, no judgment, no "do this and be religious" — just a real, warm conversation that meets you exactly where you are.',
    'about-quote': 'Not to become someone else — but to better understand who you are.',
    'verse-text': 'Wisdom is not what you have — it\'s what you do with what you have.',
    'verse-src': 'Jewish Wisdom',
    'verse-q': 'Every person is a whole world',
    'verse-by': '— Mishnah Sanhedrin'
  },
  he: {
    'mg-hello': 'שלום! 👋',
    'mg-askname': 'לפני שמתחילים — מה שמך?',
    'about-p1': 'משה גינזי הוא לא רב, לא מטיף, ולא כאן כדי להחזיר אותך בתשובה. הוא אדם שמאמין שלכל אחד מגיע לחיות חיים עם משמעות — ושחכמת אלפי שנות יהדות שייכת גם לך, בדיוק כמו שאתה.',
    'about-p2': 'הוא פגש אלפי אנשים שחיפשו: <strong>מה אני עושה פה? למה החיים מרגישים ריקים? איך מוצאים שקט פנימי בעולם שלא מפסיק?</strong> ולכולם הוא נתן מקום לשאול.',
    'about-p3': 'בלי כפייה, בלי שיפוט, בלי "תעשה כך ותהיה דתי" — רק שיחה אמיתית, חמה, שפוגשת אותך בדיוק איפה שאתה.',
    'about-quote': 'לא כדי להיות מישהו אחר — אלא כדי להבין טוב יותר מי אתה.',
    'verse-text': 'חכמה היא לא מה שיש לך — היא מה שאתה עושה עם מה שיש לך.',
    'verse-src': 'חכמת ישראל',
    'verse-q': 'כל אדם הוא עולם שלם',
    'verse-by': '— משנה סנהדרין'
  }
};

window.setLang = function(lang){
  currentLang = lang;
  var t = translations[lang];
  if(!t) return;
  
  // Update text elements
  Object.keys(t).forEach(function(id){
    var el = document.getElementById(id);
    if(el) el.innerHTML = t[id];
  });
  
  // Update lang buttons
  document.getElementById('btn-lang-he').classList.toggle('active', lang === 'he');
  document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
  
  // Update direction
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
  
  // Show/hide Hebrew vs English videos
  document.querySelectorAll('.vid-he').forEach(function(v){ v.style.display = lang === 'he' ? '' : 'none'; });
  document.querySelectorAll('.vid-en').forEach(function(v){ v.style.display = lang === 'en' ? '' : 'none'; });
};

})();

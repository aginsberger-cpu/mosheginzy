// =============================================
// MOSHE GINZY BOT - mosheginzy-fix.js
// =============================================

var DIFY_KEY = 'app-VFD9vOFBd83JQC3BvLwuX5Q4';
var DIFY_URL = 'https://api.dify.ai/v1/chat-messages';
var mgCid = '';
var mgSending = false;
var mgUserName = '';
var mgUserGender = '';

// Gender selection
function mgSetGender(g) {
  mgUserGender = g;
  var bf = document.getElementById('btn-female');
  var bm = document.getElementById('btn-male');
  if (bf) bf.classList.toggle('active', g === 'נקבה');
  if (bm) bm.classList.toggle('active', g === 'זכר');
}

// Save name and start chat
function mgSaveName() {
  var inp = document.getElementById('mg-name-input');
  var n = inp ? inp.value.trim() : '';
  if (!n) { if (inp) inp.focus(); return; }
  mgUserName = n;
  localStorage.setItem('mg-user-name', n);
  localStorage.setItem('mg-user-gender', mgUserGender);
  
  // Hide name screen
  var ns = document.getElementById('mg-name-screen');
  if (ns) ns.style.display = 'none';
  
  // Load saved conversation id
  mgCid = localStorage.getItem('mg-cid-' + n) || '';
  
  // Show greeting
  var greeting;
  if (mgUserGender === 'נקבה') {
    greeting = 'שלום ' + n + '! 👋 אני משה. מה שאת שואלת בלב — אפשר לשאול אותו בקול.';
  } else {
    greeting = 'שלום ' + n + '! 👋 אני משה. מה שאתה שואל בלב — אפשר לשאול אותו בקול.';
  }
  mgAddMsg(greeting, 'bot');
}

// Add message to chat
function mgAddMsg(txt, who) {
  var w = document.getElementById('mg-msgs');
  if (!w) return;
  
  var row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:10px;margin-bottom:14px;padding:0 8px;direction:rtl;' + (who === 'user' ? 'flex-direction:row-reverse;' : '');
  
  if (who === 'bot') {
    var av = document.createElement('div');
    av.style.cssText = 'width:36px;height:36px;border-radius:50%;flex-shrink:0;overflow:hidden;border:1.5px solid rgba(212,175,55,0.3);';
    av.innerHTML = '<img src="תמונה מצוינת משה גינזי.png" style="width:100%;height:100%;object-fit:cover;object-position:top" onerror="this.parentElement.innerHTML=\'<div style=color:#d4af37;text-align:center;line-height:36px;font-weight:bold>מ</div>\'">';
    row.appendChild(av);
  }
  
  var b = document.createElement('div');
  b.style.cssText = 'padding:12px 16px;border-radius:16px;max-width:80%;font-size:.92rem;line-height:1.8;white-space:pre-wrap;' +
    (who === 'bot' 
      ? 'background:rgba(212,175,55,0.08);color:#e8e0d0;border:1px solid rgba(212,175,55,0.12);border-top-right-radius:4px;' 
      : 'background:rgba(212,175,55,0.18);color:#e8e0d0;border-top-left-radius:4px;');
  b.textContent = txt;
  row.appendChild(b);
  w.appendChild(row);
  w.scrollTop = w.scrollHeight;
}

// Show typing indicator
function mgShowTyping() {
  var w = document.getElementById('mg-msgs');
  if (!w) return;
  var row = document.createElement('div');
  row.id = 'mg-typing';
  row.style.cssText = 'display:flex;gap:10px;padding:0 8px;direction:rtl;margin-bottom:14px;';
  row.innerHTML = '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;border:1.5px solid rgba(212,175,55,0.3);flex-shrink:0"><img src="תמונה מצוינת משה גינזי.png" style="width:100%;height:100%;object-fit:cover;object-position:top"></div><div style="padding:12px 16px;color:rgba(212,175,55,0.5);font-size:.85rem">...משה חושב</div>';
  w.appendChild(row);
  w.scrollTop = w.scrollHeight;
}

function mgRemoveTyping() {
  var t = document.getElementById('mg-typing');
  if (t) t.remove();
}

// Send message
function mgSend() {
  var inp = document.getElementById('mg-inp');
  var txt = inp ? inp.value.trim() : '';
  if (!txt || mgSending) return;
  if (!mgUserName) { mgSaveName(); return; }
  
  inp.value = '';
  inp.style.height = 'auto';
  mgSending = true;
  mgAddMsg(txt, 'user');
  mgShowTyping();
  
  var today = new Date().toLocaleDateString('he-IL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  
  fetch(DIFY_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + DIFY_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      inputs: {
        name: mgUserName,
        gender: mgUserGender,
        today: today,
        history: (localStorage.getItem('mg-history-' + mgUserName) || '').slice(-500)
      },
      query: txt,
      response_mode: 'blocking',
      conversation_id: mgCid || undefined,
      user: mgUserName
    })
  })
  .then(function(r) {
    if (!r.ok) throw new Error('status ' + r.status);
    return r.json();
  })
  .then(function(d) {
    mgRemoveTyping();
    mgSending = false;
    if (d.answer) {
      mgCid = d.conversation_id || mgCid;
      localStorage.setItem('mg-cid-' + mgUserName, mgCid);
      // Save history
      var h = localStorage.getItem('mg-history-' + mgUserName) || '';
      var newH = h + (h ? '\n' : '') + d.answer.substring(0, 200);
      localStorage.setItem('mg-history-' + mgUserName, newH);
      mgAddMsg(d.answer, 'bot');
    } else {
      mgAddMsg('משה לא הצליח לענות — נסו שוב 🙏', 'bot');
    }
  })
  .catch(function(e) {
    mgRemoveTyping();
    mgSending = false;
    // If conversation_id expired, clear and ask to retry
    if (mgCid) {
      mgCid = '';
      localStorage.removeItem('mg-cid-' + mgUserName);
      mgAddMsg('מתחבר מחדש... שלחו שוב 🔄', 'bot');
    } else {
      mgAddMsg('משה לא הצליח לענות — נסו שוב 🙏', 'bot');
    }
  });
}

// Load saved user on page load
(function() {
  var savedName = localStorage.getItem('mg-user-name');
  if (savedName) {
    mgUserName = savedName;
    mgUserGender = localStorage.getItem('mg-user-gender') || '';
    var inp = document.getElementById('mg-name-input');
    if (inp) inp.value = savedName;
    // Auto-start if name exists
    setTimeout(function() { mgSaveName(); }, 500);
  }
})();

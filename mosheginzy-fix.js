// =============================================
// MOSHE GINZY BOT - mosheginzy-fix.js
// =============================================
// מקרב: הצ'אט המוטמע בדף הנחיתה עצמו (index.html) - נפרד לגמרי מהצ'אט
// שב-app.html, אבל אותו תיקון בדיוק: הוחלף Dify בשרת של מקרב (hirabbi.com),
// עם הזרמה (streaming) כדי שהתשובה תיכתב בזמן אמת, ובלי לגעת בעיצוב.
// getMekarevUserId() משתמש באותו מפתח localStorage בדיוק כמו ב-app.html
// (mekarev-user-id) - כך שאם אותו משתמש/ת מדבר/ת גם כאן וגם ב-app.html
// (אותו origin, mosheginzy.com), זו אותה זהות/היסטוריה אצל מקרב.
var MEKAREV_API = 'https://hirabbi.com';
function getMekarevUserId() {
  var id = localStorage.getItem('mekarev-user-id');
  if (!id) { id = 'mg-' + Date.now() + '-' + Math.random().toString(36).slice(2); localStorage.setItem('mekarev-user-id', id); }
  return id;
}
// מקרב (update): שני מספרי וואטסאפ נפרדים מוגדרים בשרת של מקרב עצמו
// (/api/config) - moshePhone (כללי) ו-halachaPhone (קו הלכה ייעודי).
// שולפים פעם אחת מוקדם ומטמינים - ראה mgAddReferralSuggestion למטה.
var mgCachedMoshePhone = '';
var mgCachedHalachaPhone = '';
fetch(MEKAREV_API + '/api/config').then(function (r) { return r.json(); }).then(function (data) {
  mgCachedMoshePhone = data.moshePhone || '';
  mgCachedHalachaPhone = data.halachaPhone || '';
}).catch(function () {});
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

  // מקרב: רישום השם והמגדר אצל מקרב (בדיוק כמו ב-app.html) - לא חוסם
  // את הצגת ברכת הפתיחה, נשלח ברקע.
  var mUid = getMekarevUserId();
  fetch(MEKAREV_API + '/api/identify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: mUid, replyText: n }) }).catch(function () {});
  if (mgUserGender === 'זכר' || mgUserGender === 'נקבה') {
    fetch(MEKAREV_API + '/api/gender', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: mUid, replyText: mgUserGender }) }).catch(function () {});
  }

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
  if (!w) return null;

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
  return b;
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

// מקרב: תיבת הצעה שמופיעה אחרי תשובה שהמנוע סימן שלא כיסתה את השאלה
// במדויק - מקבילה בדיוק לזו שנוספה ב-app.html ובאתר מקרב עצמו, כולל
// ההבחנה בין שאלת הלכה (פונה לקו ההלכה, mgCachedHalachaPhone) לשאלה
// כללית (פונה למשה, mgCachedMoshePhone) - ראה ההסבר המלא ליד
// mgCachedMoshePhone/mgCachedHalachaPhone למעלה.
function mgAddReferralSuggestion(question, isHalacha) {
  var useHalacha = Boolean(isHalacha && mgCachedHalachaPhone);
  var w = document.getElementById('mg-msgs');
  if (!w) return;
  var isEn = typeof currentLang !== 'undefined' && currentLang === 'en';
  var div = document.createElement('div');
  div.style.cssText = 'margin:0 8px 14px 8px;padding:12px 16px;border-radius:14px;font-size:.85rem;line-height:1.6;color:#e8e0d0;background:rgba(212,175,55,0.08);border:1px solid rgba(212,175,55,0.18);';
  var p = document.createElement('div');
  if (useHalacha) {
    p.textContent = isEn ? 'This question deserves a precise halachic answer for your specific situation.' : 'זו שאלה שמגיעה לה מענה הלכתי מדויק למקרה הספציפי שלך.';
  } else {
    p.textContent = isEn ? "I couldn't find a precise answer to this in the sources I have." : 'לא מצאתי לזה תשובה מדויקת מהמקורות שיש לי.';
  }
  div.appendChild(p);

  var actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;';

  var waBtn = document.createElement('button');
  waBtn.type = 'button';
  waBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;border:none;border-radius:16px;padding:7px 12px;font-size:.8rem;cursor:pointer;color:#fff;background:#25D366;';
  if (useHalacha) {
    waBtn.textContent = isEn ? '📞 Contact the halacha line on WhatsApp' : '📞 פנה לקו ההלכה בוואטסאפ';
    waBtn.onclick = function () { window.open('https://wa.me/' + mgCachedHalachaPhone + '?text=' + encodeURIComponent(question), '_blank'); };
  } else {
    waBtn.textContent = isEn ? '💬 Send to Moshe on WhatsApp' : '💬 שלח למשה בוואטסאפ';
    waBtn.onclick = function () {
      var phone = mgCachedMoshePhone || '972584094045';
      window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(question), '_blank');
    };
  }
  actions.appendChild(waBtn);

  var followupBtn = document.createElement('button');
  followupBtn.type = 'button';
  var idleText = isEn ? '🔔 We will notify you when we have an answer' : '🔔 נשלח לך מענה בהתראה כשיש לנו תשובה';
  followupBtn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;border:none;border-radius:16px;padding:7px 12px;font-size:.8rem;cursor:pointer;color:#1a1408;background:#d4af37;';
  followupBtn.textContent = idleText;
  followupBtn.onclick = function () {
    followupBtn.disabled = true;
    followupBtn.style.opacity = '0.6';
    followupBtn.textContent = isEn ? 'Please wait…' : 'רגע…';
    fetch(MEKAREV_API + '/api/followup/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: getMekarevUserId(), question: question }) }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).then(function () {
      followupBtn.textContent = isEn ? '✓ Got it - we will notify you' : '✓ קיבלנו - נשלח לך התראה כשיש לנו תשובה';
    }).catch(function () {
      followupBtn.disabled = false; followupBtn.style.opacity = '1'; followupBtn.textContent = idleText;
    });
  };
  actions.appendChild(followupBtn);

  div.appendChild(actions);
  w.appendChild(div);
  w.scrollTop = w.scrollHeight;
}

// Send message
// מקרב: השאלה נשלחת עכשיו לשרת של מקרב, בהזרמה (streaming, /api/chat) -
// כדי שהתשובה תיכתב בזמן אמת. שאר הזרימה (הודעת "משה חושב...", שמירת
// היסטוריה מקומית) נשארה בדיוק אותו דבר, רק בסוף ההזרמה במקום מיד.
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

  var fullText = '';
  var bubbleEl = null;
  var finalNoAnswer = false;
  var finalIsHalacha = false;
  fetch(MEKAREV_API + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: getMekarevUserId(), message: txt, lang: (typeof currentLang !== 'undefined' && currentLang === 'en') ? 'en' : 'he' }) }).then(function (res) {
    if (!res.ok || !res.body) throw new Error('http ' + res.status);
    var reader = res.body.getReader();
    var decoder = new TextDecoder('utf-8');
    var buffer = '';
    function pump() {
      return reader.read().then(function (chunk) {
        if (chunk.done) return;
        buffer += decoder.decode(chunk.value, { stream: true });
        var idx;
        while ((idx = buffer.indexOf('\n\n')) !== -1) {
          var frame = buffer.slice(0, idx); buffer = buffer.slice(idx + 2);
          var line = frame.split('\n').filter(function (l) { return l.indexOf('data: ') === 0; })[0];
          if (!line) continue;
          var payload; try { payload = JSON.parse(line.slice(6)); } catch (e) { continue; }
          if (payload.type === 'delta') {
            fullText += payload.text;
            if (!bubbleEl) { mgRemoveTyping(); bubbleEl = mgAddMsg('', 'bot'); }
            bubbleEl.textContent = fullText;
            var w = document.getElementById('mg-msgs'); if (w) w.scrollTop = w.scrollHeight;
          } else if (payload.type === 'done') {
            finalNoAnswer = Boolean(payload.noAnswer);
            finalIsHalacha = Boolean(payload.isHalacha);
          }
        }
        return pump();
      });
    }
    return pump();
  }).then(function () {
    mgSending = false;
    if (fullText) {
      var h = localStorage.getItem('mg-history-' + mgUserName) || '';
      var newH = h + (h ? '\n' : '') + fullText.substring(0, 200);
      localStorage.setItem('mg-history-' + mgUserName, newH);
      if (finalNoAnswer) mgAddReferralSuggestion(txt, finalIsHalacha);
    } else {
      mgAddMsg('משה לא הצליח לענות — נסו שוב 🙏', 'bot');
    }
  }).catch(function () {
    mgRemoveTyping();
    mgSending = false;
    mgAddMsg('משה לא הצליח לענות — נסו שוב 🙏', 'bot');
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

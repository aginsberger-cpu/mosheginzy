// moshe-updates.js — שיפוצים לאתר משה גינזי
(function () {

  // 1. אנימציית נקודות (typing) + עיצוב כפתור מיקרופון
  var style = document.createElement('style');
  style.textContent = `
    @keyframes mgbounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 1; }
      30%            { transform: translateY(-7px); opacity: 0.7; }
    }
    .hero { min-height: 80vh !important; }
    #mg-mic-btn {
      width: 42px; height: 42px; border-radius: 50%;
      background: transparent; border: 1px solid rgba(201,149,42,0.5);
      cursor: pointer; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; transition: all 0.2s;
    }
    #mg-mic-btn:hover { background: rgba(201,149,42,0.15); }
    #mg-mic-btn.listening {
      background: rgba(201,149,42,0.25);
      border-color: #c9952a;
      animation: mgpulse 1s infinite;
    }
    @keyframes mgpulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(201,149,42,0.4); }
      50%       { box-shadow: 0 0 0 8px rgba(201,149,42,0); }
    }
  `;
  document.head.appendChild(style);

  // 2. תמונה עגולה של משה
  function getMoshePhotoSrc() {
    var hero = document.getElementById('moshe-photo');
    return hero ? hero.src : '';
  }

  function makePhotoCircle(w, h, border) {
    var src = getMoshePhotoSrc();
    if (!src) return null;
    var img = document.createElement('img');
    img.src = src;
    img.style.cssText =
      'width:' + w + 'px;height:' + h + 'px;border-radius:50%;' +
      'object-fit:cover;object-position:top center;flex-shrink:0;' +
      'border:' + (border || '1px') + ' solid #e8b84b;';
    return img;
  }

  function replaceTextAvatarWithPhoto(el, w, h, border) {
    if (!el) return;
    var photo = makePhotoCircle(w, h, border);
    if (photo && el.parentNode) el.parentNode.replaceChild(photo, el);
  }

  // 3. מחליף אווטארים סטטיים אחרי טעינת הדף
  document.addEventListener('DOMContentLoaded', function () {

    // כותרת הסקשן
    var titleSpan = document.querySelector('#mg-bot h2 span');
    if (titleSpan && titleSpan.textContent.trim() === 'MG') {
      replaceTextAvatarWithPhoto(titleSpan, 44, 44, '2px');
    }

    // הדר הבוט
    document.querySelectorAll('#mg-bot div').forEach(function (el) {
      if (el.textContent.trim() === 'MG' && el.style.width === '52px') {
        replaceTextAvatarWithPhoto(el, 52, 52, '2px');
      }
    });

    // 4. הוסף כפתור מיקרופון לצד כפתור השליחה
    addMicButton();
  });

  // 4. MutationObserver — החלפת אווטאר בהודעות חדשות
  function patchNewAvatar(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.textContent && node.textContent.trim() === 'MG') {
      var s = node.style;
      if (s && s.borderRadius === '50%') {
        var photo = makePhotoCircle(34, 34, '1px');
        if (photo && node.parentNode) node.parentNode.replaceChild(photo, node);
        return;
      }
    }
    node.querySelectorAll &&
      node.querySelectorAll('div').forEach(function (child) {
        if (
          child.textContent.trim() === 'MG' &&
          child.style.borderRadius === '50%' &&
          child.style.width === '34px'
        ) {
          var photo = makePhotoCircle(34, 34, '1px');
          if (photo && child.parentNode)
            child.parentNode.replaceChild(photo, child);
        }
      });
  }

  var chatContainer = document.getElementById('mg-msgs');
  if (chatContainer) {
    var obs = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (n) { patchNewAvatar(n); });
      });
    });
    obs.observe(chatContainer, { childList: true, subtree: true });
  }

  // 5. כפתור מיקרופון — Web Speech API
  function addMicButton() {
    var SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return; // דפדפן לא תומך

    var inp = document.getElementById('mg-inp');
    if (!inp) return;

    // מצא את הקונטיינר של שורת הקלט
    var inputRow = inp.parentNode;
    if (!inputRow) return;

    // צור כפתור מיקרופון
    var micBtn = document.createElement('button');
    micBtn.id = 'mg-mic-btn';
    micBtn.title = 'דבר במקום לכתוב';
    micBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9952a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>' +
      '<path d="M19 10v2a7 7 0 0 1-14 0v-2"/>' +
      '<line x1="12" y1="19" x2="12" y2="23"/>' +
      '<line x1="8" y1="23" x2="16" y2="23"/>' +
      '</svg>';

    // הכנס את המיקרופון לפני שדה הקלט
    inputRow.insertBefore(micBtn, inp);

    // הגדרת זיהוי קול
    var recognition = new SpeechRecognition();
    recognition.lang = 'he-IL'; // עברית
    recognition.continuous = false;
    recognition.interimResults = true;

    var isListening = false;

    recognition.onresult = function (event) {
      var transcript = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      inp.value = transcript;
    };

    recognition.onend = function () {
      isListening = false;
      micBtn.classList.remove('listening');
      // אם יש טקסט — שלח אוטומטית
      if (inp.value.trim() && window.mgSend) {
        window.mgSend();
      }
    };

    recognition.onerror = function (e) {
      isListening = false;
      micBtn.classList.remove('listening');
      if (e.error === 'not-allowed') {
        alert('יש לאשר גישה למיקרופון בדפדפן');
      }
    };

    micBtn.addEventListener('click', function () {
      if (isListening) {
        recognition.stop();
      } else {
        isListening = true;
        micBtn.classList.add('listening');
        inp.value = '';
        inp.placeholder = '🎤 מקשיב...';
        recognition.start();
      }
    });

    recognition.onstart = function () {
      inp.placeholder = '🎤 מקשיב...';
    };

    recognition.onspeechend = function () {
      inp.placeholder = 'כתוב שאלה...';
      recognition.stop();
    };
  }

})();

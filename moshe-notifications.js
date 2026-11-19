/**
 * Moshe Ginzy - Notifications & Dynamic Videos
 * This script loads new videos and shows notifications in the app
 * Add to app.html: <script src="moshe-notifications.js"></script>
 */

(function(){
  // Apps Script proxy URL - same as dashboard
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx1IJHkaBhhmqmPIvyPEY8Xr_-OYRZf3KNrRRezqeDUgkJP3IkTLPGUt_y1Hx811avx/exec';

  // ============ NOTIFICATIONS ============
  
  function getLastSeenTimestamp() {
    return Number(localStorage.getItem('mg-notif-last-seen') || '0');
  }
  
  function setLastSeenTimestamp(ts) {
    localStorage.setItem('mg-notif-last-seen', String(ts));
  }

  function checkNotifications() {
    var since = getLastSeenTimestamp();
    fetch(SCRIPT_URL + '?action=getNotifications&since=' + since)
      .then(function(r){ return r.json(); })
      .then(function(data){
        var ml=(localStorage.getItem('mg-app-lang')||'he');var mine=(data&&data.notifications||[]).filter(function(n){return !n.language||n.language==='all'||n.language===ml;});
        if (data.success && mine.length > 0) {
          showNotificationBadge(mine.length);
          window._mgNotifications = data.notifications;
        }
      })
      .catch(function(err){ console.log('Notif check error:', err); });
  }

  function showNotificationBadge(count) {
    var db=document.getElementById('dr-notif-badge');if(db){db.textContent=count>9?'9+':count;db.style.display='inline-flex';}
    // Find or create bell icon
    var bell = document.getElementById('mg-notif-bell');
    if (!bell) {
      // Create notification bell in header
      var header = document.querySelector('.app-header') || document.querySelector('header') || document.querySelector('.ah');
      if (!header) return;
      
      bell = document.createElement('div');
      bell.id = 'mg-notif-bell';
      bell.style.cssText = 'position:relative;cursor:pointer;font-size:22px;padding:6px;margin:0 8px;';
      bell.innerHTML = '🔔';
      bell.onclick = openNotificationPanel;
      header.appendChild(bell);
    }
    
    // Add/update badge
    var badge = document.getElementById('mg-notif-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'mg-notif-badge';
      badge.style.cssText = 'position:absolute;top:0;right:0;background:#D9534F;color:#fff;border-radius:50%;width:18px;height:18px;font-size:11px;display:flex;align-items:center;justify-content:center;font-weight:bold;';
      bell.appendChild(badge);
    }
    badge.textContent = count > 9 ? '9+' : count;
    badge.style.display = 'flex';
  }

  function openNotificationPanel() {
    var notifications = window._mgNotifications || [];
    if (notifications.length === 0) return;

    // Mark as seen
    var maxTs = 0;
    notifications.forEach(function(n){ if(n.timestamp > maxTs) maxTs = n.timestamp; });
    setLastSeenTimestamp(maxTs);
    
    // Hide badge
    var badge = document.getElementById('mg-notif-badge');
    if (badge) badge.style.display = 'none';

    // Create popup
    var overlay = document.createElement('div');
    overlay.id = 'mg-notif-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9998;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = function(e){ if(e.target===overlay){ overlay.remove(); } };
    
    var lang = (localStorage.getItem('mg-app-lang') || localStorage.getItem('mg-site-lang') || 'he');
    var isHe = (lang === 'he');
    
    var panel = document.createElement('div');
    panel.style.cssText = 'background:#141414;border:1px solid #C9A84C;border-radius:16px;max-width:380px;width:90%;max-height:80vh;overflow-y:auto;padding:20px;direction:' + (isHe?'rtl':'ltr') + ';';
    
    var title = document.createElement('h3');
    title.style.cssText = 'color:#C9A84C;margin:0 0 16px 0;font-size:18px;';
    title.textContent = isHe ? '🔔 התראות חדשות' : '🔔 New Notifications';
    panel.appendChild(title);
    
    // Show notifications (newest first)
    notifications.reverse().forEach(function(n){
      var item = document.createElement('div');
      item.style.cssText = 'background:#1A1A1A;border-radius:10px;padding:12px;margin-bottom:10px;border:1px solid #252525;cursor:pointer;';
      
      var itemTitle = document.createElement('div');
      itemTitle.style.cssText = 'color:#F0EDE6;font-weight:bold;margin-bottom:4px;font-size:14px;';
      itemTitle.textContent = n.title;
      item.appendChild(itemTitle);
      
      var itemMsg = document.createElement('div');
      itemMsg.style.cssText = 'color:#8A8A8A;font-size:13px;margin-bottom:6px;';
      itemMsg.textContent = n.message;
      item.appendChild(itemMsg);
      
      var itemDate = document.createElement('div');
      itemDate.style.cssText = 'color:#555;font-size:11px;';
      itemDate.textContent = n.date;
      item.appendChild(itemDate);
      
      // If video notification, clicking opens the video
      if (n.type === 'video' && n.videoId) {
        item.onclick = function(){
          overlay.remove();
          if (typeof openVideo === 'function') {
            openVideo(n.videoId);
          } else {
            window.open('https://www.youtube.com/watch?v=' + n.videoId, '_blank');
          }
        };
        item.style.cursor = 'pointer';
        var playHint = document.createElement('div');
        playHint.style.cssText = 'color:#C9A84C;font-size:12px;margin-top:6px;';
        playHint.textContent = isHe ? '▶ לחץ לצפייה' : '▶ Tap to watch';
        item.appendChild(playHint);
      }
      
      panel.appendChild(item);
    });
    
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'width:100%;padding:10px;background:#252525;color:#F0EDE6;border:none;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px;';
    closeBtn.textContent = isHe ? 'סגור' : 'Close';
    closeBtn.onclick = function(){ overlay.remove(); };
    panel.appendChild(closeBtn);
    
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
  }

  // ============ DYNAMIC VIDEO LOADING ============

  function loadDynamicVideos() {
    fetch(SCRIPT_URL + '?action=getVideos')
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (data.success && data.videos && data.videos.length > 0) {
          window._mgDynamicVideos = data.videos.filter(function(v){ return v.active === 'yes'; });
          injectDynamicVideos();
        }
      })
      .catch(function(err){ console.log('Videos load error:', err); });
  }

  function injectDynamicVideos() {
    var videos = window._mgDynamicVideos || [];
    if (videos.length === 0) return;

    var lang = (localStorage.getItem('mg-app-lang') || localStorage.getItem('mg-site-lang') || 'he');
    var filtered = videos.filter(function(v){ return v.language === lang; });
    if (filtered.length === 0) return;

    // Find the lessons grid in the app
    var grid = document.getElementById('lessons-grid');
    if (!grid) return;

    // Add dynamic videos at the top of the grid
    filtered.reverse().forEach(function(v){
      // Check if already added
      if (document.getElementById('dyn-' + v.id)) return;
      // the app's own Video Library already shows the full list (app.html renderLessons)
      if (grid.querySelector('[data-yt="' + v.youtubeId + '"]')) return;
      
      var thumb = 'https://img.youtube.com/vi/' + v.youtubeId + '/hqdefault.jpg';
      var card = document.createElement('div');
      card.className = 'lesson-card';
      card.id = 'dyn-' + v.id;
      card.onclick = function(){ 
        if (typeof openVideo === 'function') openVideo(v.youtubeId);
      };
      card.innerHTML = '<div class="lesson-thumb"><img src="'+thumb+'" alt="" onerror="this.style.background=\'#1a1a1a\'"><div class="lesson-play"><div class="lesson-play-btn"><svg viewBox="0 0 24 24" fill="#0f0f0f"><polygon points="5 3 19 12 5 21 5 3"/></svg></div></div></div>'
        + '<div class="lesson-meta"><div class="lesson-tag" style="background:rgba(201,168,76,0.3);color:#C9A84C;">🆕 ' + (v.tag||'חדש') + '</div><div class="lesson-title">' + v.title + '</div></div>';
      
      grid.insertBefore(card, grid.firstChild);
    });
  }

  // ============ INIT ============
  
  // Wait for page to load then check
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function(){ checkNotifications(); loadDynamicVideos(); }, 2000);
  } else {
    window.addEventListener('load', function(){
      setTimeout(function(){ checkNotifications(); loadDynamicVideos(); }, 2000);
    });
  }

  // Re-check every 5 minutes
  setInterval(checkNotifications, 5 * 60 * 1000);

  // Expose for manual use

  // ============ ALL NOTIFICATIONS (side menu) ============
  function openAllNotifications() {
    var lang = (localStorage.getItem('mg-app-lang') || 'he'), isHe = lang !== 'en';
    var overlay = document.createElement('div');
    overlay.id = 'mg-notif-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,8,18,.72);z-index:9998;display:flex;align-items:center;justify-content:center;';
    overlay.onclick = function(e){ if(e.target===overlay){ overlay.remove(); } };
    var panel = document.createElement('div');
    panel.style.cssText = 'background:linear-gradient(160deg,#13263F,#0B1A2C);border:1px solid rgba(212,175,94,.55);border-radius:18px;max-width:400px;width:92%;max-height:80vh;overflow-y:auto;padding:20px;box-shadow:0 20px 60px rgba(0,0,0,.5);direction:' + (isHe?'rtl':'ltr') + ';font-family:inherit;';
    var title = document.createElement('h3');
    title.style.cssText = 'color:#E8C468;margin:0 0 14px 0;font-size:19px;';
    title.textContent = isHe ? '🔔 התראות' : '🔔 Notifications';
    panel.appendChild(title);
    var list = document.createElement('div');
    list.textContent = isHe ? 'טוען...' : 'Loading...';
    list.style.cssText = 'color:#AFBAD0;font-size:14px;';
    panel.appendChild(list);
    var closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'width:100%;padding:11px;background:transparent;color:#E8C468;border:1px solid rgba(212,175,94,.5);border-radius:10px;font-size:14px;cursor:pointer;margin-top:10px;font-family:inherit;';
    closeBtn.textContent = isHe ? 'סגירה' : 'Close';
    closeBtn.onclick = function(){ overlay.remove(); };
    panel.appendChild(closeBtn);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    var b1=document.getElementById('mg-notif-badge');if(b1)b1.style.display='none';
    var b2=document.getElementById('dr-notif-badge');if(b2)b2.style.display='none';
    fetch(SCRIPT_URL + '?action=getNotifications&since=0')
      .then(function(r){ return r.json(); })
      .then(function(data){
        var arr = (data && data.notifications) || [];
        arr = arr.filter(function(n){ return !n.language || n.language === 'all' || n.language === lang; });
        if (!arr.length) { list.textContent = isHe ? 'אין התראות כרגע.' : 'No notifications yet.'; return; }
        var maxTs = 0; arr.forEach(function(n){ if (n.timestamp > maxTs) maxTs = n.timestamp; });
        if (maxTs) setLastSeenTimestamp(maxTs);
        list.textContent = ''; list.style.cssText = '';
        arr.slice().sort(function(x,y){return (y.timestamp||0)-(x.timestamp||0);}).slice(0, 30).forEach(function(n){
          var item = document.createElement('div');
          item.style.cssText = 'background:rgba(255,255,255,.04);border-radius:12px;padding:12px 14px;margin-bottom:10px;border:1px solid rgba(212,175,94,.2);';
          var t = document.createElement('div'); t.style.cssText = 'color:#F4F1EA;font-weight:700;margin-bottom:4px;font-size:15px;'; t.textContent = n.title || ''; item.appendChild(t);
          var m = document.createElement('div'); m.style.cssText = 'color:#AFBAD0;font-size:14px;line-height:1.5;margin-bottom:6px;'; m.textContent = n.message || ''; item.appendChild(m);
          var d = document.createElement('div'); d.style.cssText = 'color:#7E8AA3;font-size:12px;'; d.textContent = n.date || ''; item.appendChild(d);
          if (n.type === 'video' && n.videoId) {
            item.style.cursor = 'pointer';
            var h = document.createElement('div'); h.style.cssText = 'color:#E8C468;font-size:13px;margin-top:6px;font-weight:700;'; h.textContent = isHe ? '▶ לצפייה' : '▶ Watch'; item.appendChild(h);
            item.onclick = function(){ overlay.remove(); if (typeof openVideo === 'function') openVideo(n.videoId, n.title); else window.open('https://www.youtube.com/watch?v=' + n.videoId, '_blank'); };
          }
          list.appendChild(item);
        });
      })
      .catch(function(){ list.textContent = isHe ? 'לא הצלחנו לטעון התראות. נסו שוב מאוחר יותר.' : 'Could not load notifications. Please try again later.'; });
  }
  window.mgOpenNotifications = openAllNotifications;
  window.mgCheckNotifications = checkNotifications;
  window.mgLoadVideos = loadDynamicVideos;
})();

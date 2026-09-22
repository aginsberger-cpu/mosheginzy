// Service Worker לאפליקציית משה גינזי (mosheginzy.com) - מטפל בקבלת
// התראות Push מהשרת של מקרב (Netivot, hirabbi.com) ובלחיצה עליהן.
// קובץ נפרד מה-sw.js שבשרת של מקרב עצמו (hirabbi.com/sw.js, ששם
// משמש בעיקר לאישור כניסה של המנהל) - זה חייב לרוץ באותו origin כמו
// האתר/אפליקציה עצמם (mosheginzy.com), אחרת הדפדפן לא מרשה להירשם
// אליו מתוך app.html.

self.addEventListener('push', function (event) {
  var data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {};
  }
  var title = data.title || 'משה גינזי';
  var options = {
    body: data.body || 'יש לך עדכון חדש',
    icon: '/moshe-icon-180.png',
    badge: '/moshe-icon-180.png',
    dir: 'rtl',
    lang: 'he',
    data: { url: data.url || '/app.html' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  var targetUrl = (event.notification.data && event.notification.data.url) || '/app.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) return client.navigate(targetUrl);
          return;
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

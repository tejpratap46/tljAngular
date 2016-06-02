importScripts('node_modules/sw-toolbox/sw-toolbox.js');
console.log('Hello from service worker');

// toolbox.options.debug = true;

// toolbox.cache.name = "1";

toolbox.precache([
  '/',
  '/index.html',
  '/js/app.js',
  '/js/config.js',
  '/js/script.js',
  '/js/libs/jquery.min.js',
  '/js/libs/angular.min.js',
  '/js/libs/angular-route.min.js',
  '/js/libs/loading-bar.min.js',
  '/js/libs/bootstrap.min.js',
  '/js/libs/moment.min.js',
  '/js/libs/emodal.min.js',
  '/js/libs/ng-infinite-scroll.min.js',
  '/js/libs/angular-animate.min.js',
  '/js/controllers/navigationController.js',
  /* CSS */
  '/favicon.png',
  '/css/style.css',
  '/css/signin.css',
  '/css/fonts/fontawesome-webfont.eot',
  '/css/fonts/fontawesome-webfont.svg',
  '/css/fonts/fontawesome-webfont.ttf',
  '/css/fonts/fontawesome-webfont.woff',
  '/css/fonts/fontawesome-webfont.woff2',
  '/css/fonts/FontAwesome.otf',
  '/css/fonts/glyphicons-halflings-regular.eot',
  '/css/fonts/glyphicons-halflings-regular.svg',
  '/css/fonts/glyphicons-halflings-regular.ttf',
  '/css/fonts/glyphicons-halflings-regular.woff',
  '/css/fonts/glyphicons-halflings-regular.woff2',
  '/css/libs/bootstrap.min.css',
  '/css/libs/font-awesome.min.css',
  '/css/libs/loading-bar.min.css',
]);


toolbox.router.get('/(.*)', toolbox.fastest);
toolbox.router.get('/css/fonts/(.*)', toolbox.cacheFirst);
toolbox.router.get('/.png$|.jpg$|.jpeg$|.swf$/', toolbox.cacheFirst);
toolbox.router.post('/(.*)', toolbox.fastest, {origin: 'http://localhost:3000'});
toolbox.router.default = toolbox.fastest;

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});


self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

// Push Things
self.addEventListener('push', function (event) {
  debugger;
  console.log('Received a push message', event);

  var title = 'Notification';
  var body = 'There is newly updated content available on the site. Click to see more.';
  var icon = 'https://raw.githubusercontent.com/deanhume/typography/gh-pages/icons/typography.png';
  var tag = 'simple-push-demo-notification-tag';

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
      tag: tag
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('On notification click: ', event.notification.tag);
  // Android doesn't close the notification when you click on it  
  // See: http://crbug.com/463146  
  event.notification.close();

  // This looks to see if the current is already open and  
  // focuses if it is  
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == '/' && 'focus' in client)
            return client.focus();
        }
        if (clients.openWindow) {
          return clients.openWindow('https://deanhume.github.io/typography');
        }
      })
  );
});
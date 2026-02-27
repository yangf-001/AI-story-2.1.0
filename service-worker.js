const CACHE_NAME = 'ai-story-generator-v2';
const ASSETS_TO_CACHE = [
  // 主要HTML文件
  './main/index.html',
  './features/api-config/index.html',
  './features/world-management/index.html',
  './features/world-management/create.html',
  './features/story/index.html',
  './features/story/edit.html',
  './features/assistants/index.html',
  './features/character/index.html',
  './features/time-system/index.html',
  './features/analytics/index.html',
  './features/platform/index.html',
  './features/story-archive/index.html',
  
  // CSS文件
  './main/style.css',
  './features/story/styles/message.css',
  
  // JavaScript文件
  './main/main.js',
  './main/storage.js',
  './main/helpers.js',
  './main/api.js',
  './features/api-config/config.js',
  './features/world-management/world.js',
  './features/world-management/create.js',
  './features/story/story.js',
  './features/story/edit.js',
  './features/story/analyzers/SceneAnalyzer.js',
  './features/story/managers/NarrationManager.js',
  './features/story/managers/TimeManager.js',
  './features/story/renderers/MessageRenderer.js',
  './features/story/utils/PromptBuilder.js',
  './features/assistants/assistants.js',
  './features/assistants/erotic-assistant/index.js',
  './features/assistants/erotic-assistant/settings.js',
  './features/assistants/profile-assistant/index.js',
  './features/assistants/time-assistant/index.js',
  './features/assistants/character-generator-assistant/index.js',
  './features/assistants/story-assistant/index.js',
  './features/assistants/scene-assistant/index.js',
  './features/character/index.js',
  './features/character/card.js',
  './features/character/profile.js',
  './features/time-system/main.js',
  './features/analytics/main.js',
  './features/platform/main.js',
  './features/story-archive/index.js',
  
  // 其他资源
  './manifest.json'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // 逐个添加资源，避免一个失败导致全部失败
        return Promise.all(
          ASSETS_TO_CACHE.map(url => {
            return fetch(url)
              .then(response => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                console.warn('Failed to cache:', url);
              })
              .catch(error => {
                console.warn('Error caching:', url, error);
              });
          })
        );
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Install failed:', error);
        self.skipWaiting();
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
      .then(() => self.clients.claim())
  );
});

// 处理网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // 开发环境：总是从网络获取最新资源
    // 生产环境：优先从缓存获取，失败后从网络获取
    fetch(event.request)
      .then((response) => {
        // 检查响应是否有效
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // 克隆响应
        const responseToCache = response.clone();

        // 将响应添加到缓存
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // 如果网络请求失败，尝试从缓存获取
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果缓存中也没有，返回一个基本的离线页面
            if (event.request.mode === 'navigate') {
              return caches.match('./main/index.html');
            }
          });
      })
  );
});

// 后台同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-stories') {
    event.waitUntil(syncStories());
  }
});

// 推送通知
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20story%20generator%20icon%20with%20book%20and%20robot%20illustration%2C%20modern%20flat%20design%2C%20blue%20and%20purple%20colors&image_size=square',
    badge: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20story%20generator%20icon%20with%20book%20and%20robot%20illustration%2C%20modern%20flat%20design%2C%20blue%20and%20purple%20colors&image_size=square',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || './main/index.html'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// 同步故事数据
async function syncStories() {
  try {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({ type: 'SYNC_COMPLETED' });
    });
  } catch (error) {
    console.error('Sync failed:', error);
  }
}
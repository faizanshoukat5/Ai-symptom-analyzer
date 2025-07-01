// Service Worker for SymptomAI PWA
const CACHE_NAME = 'symptomai-v1.0.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline symptom reports
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-symptom') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline symptom reports when connection is restored
  try {
    const offlineReports = await getOfflineReports();
    
    for (const report of offlineReports) {
      try {
        await fetch('/api/analyze-symptoms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(report)
        });
        
        // Remove successful report from offline storage
        await removeOfflineReport(report.id);
      } catch (error) {
        console.error('Failed to sync report:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function getOfflineReports() {
  // Get offline reports from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('SymptomAI', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineReports'], 'readonly');
      const store = transaction.objectStore('offlineReports');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
    };
  });
}

async function removeOfflineReport(reportId) {
  // Remove synced report from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('SymptomAI', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['offlineReports'], 'readwrite');
      const store = transaction.objectStore('offlineReports');
      const deleteRequest = store.delete(reportId);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
    };
  });
}

// Push notifications for health reminders
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'You have a health reminder',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open SymptomAI',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Dismiss',
        icon: '/icons/action-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SymptomAI Health Reminder', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// App update available notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Periodic background sync for health check reminders
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'health-reminder') {
    event.waitUntil(sendHealthReminder());
  }
});

async function sendHealthReminder() {
  // Check if user needs health reminder
  try {
    const lastCheckDate = await getLastHealthCheckDate();
    const daysSinceLastCheck = Math.floor((Date.now() - lastCheckDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastCheck >= 7) {
      await self.registration.showNotification('Health Check Reminder', {
        body: 'It\'s been a week since your last health check. How are you feeling?',
        icon: '/icons/icon-192x192.png',
        tag: 'health-reminder',
        actions: [
          {
            action: 'check-symptoms',
            title: 'Check Symptoms'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Health reminder failed:', error);
  }
}

async function getLastHealthCheckDate() {
  // Get last health check date from IndexedDB
  return new Promise((resolve) => {
    const request = indexedDB.open('SymptomAI', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const getRequest = store.get('lastHealthCheckDate');
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result?.value || Date.now() - (7 * 24 * 60 * 60 * 1000));
      };
    };
  });
}

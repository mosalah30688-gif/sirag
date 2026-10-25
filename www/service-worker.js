// سراج — Service Worker للتحديث التلقائي
const CACHE_NAME = 'sirag-v1.4';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './icon-192.png',
  './icon-512.png',
  './data/quran-uthmani.json',
  './data/surah_info.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE)).then(()=> self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=> self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // لا تكاش version.json — دائما شبكة أولا
  if(url.pathname.endsWith('version.json') || url.pathname.endsWith('service-worker.js')){
    e.respondWith(fetch(e.request, {cache:'no-store'}).catch(()=> caches.match(e.request)));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res=>{
    // خزن نسخة للمرات القادمة
    if(e.request.method==='GET' && res.ok && url.origin===location.origin){
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
    }
    return res;
  })));
});

const CACHE_NAME = "nelsen-v1";
const URLS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./kamus_dayak.json"
];

self.addEventListener("install", (e)=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(URLS_TO_CACHE))));
self.addEventListener("activate", (e)=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(key=>key !== CACHE_NAME?caches.delete(key): null)))));
self.addEventListener("fetch", (e)=> {
    e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
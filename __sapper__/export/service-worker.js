!function(){"use strict";const e=1611654879766,t=`cache${e}`,n=["/client/client.914e7c04.js","/client/inject_styles.5607aec6.js","/client/index.8bc03c10.js","/client/lib.d4f0a987.js","/client/lostpassword.a0b0db26.js","/client/Bottom.c5e7eec9.js","/client/Problem.dcbbd233.js","/client/ConnectDoc.d4ae2f0c.js","/client/universes.d1d4398e.js","/client/mailsent.fb96e458.js","/client/sendmail.17a982c2.js","/client/connect.489fd072.js","/client/ConnectDoc.04c0d0e5.js","/client/enroll.1ec4c980.js","/client/[token].a580600c.js","/client/signua.c618ffc2.js","/client/UA.1be1be77.js","/client/whoami.1baf031a.js","/client/login.f519b6a4.js","/client/ua.c661bed9.js"].concat(["/service-worker-index.html","/_digits/0.png","/_digits/1.png","/_digits/2.png","/_digits/3.png","/_digits/4.png","/_digits/5.png","/_digits/6.png","/_digits/7.png","/_digits/8.png","/_digits/9.png","/_digits/bad.png","/_digits/white.png","/favicon.ico","/favicon.png","/fw4ex-120x120.png","/fw4ex-152x152.png","/fw4ex-16x16.png","/fw4ex-281x282.png","/fw4ex-32x32.png","/fw4ex-57x57.png","/fw4ex-76x76.png","/global.css","/manifest.json","/moocjs.png","/moocprogrec.png"]),c=new Set(n);self.addEventListener("install",(e=>{e.waitUntil(caches.open(t).then((e=>e.addAll(n))).then((()=>{self.skipWaiting()})))})),self.addEventListener("activate",(e=>{e.waitUntil(caches.keys().then((async e=>{for(const n of e)n!==t&&await caches.delete(n);self.clients.claim()})))})),self.addEventListener("fetch",(t=>{if("GET"!==t.request.method||t.request.headers.has("range"))return;const n=new URL(t.request.url),s=n.protocol.startsWith("http"),i=n.hostname===self.location.hostname&&n.port!==self.location.port,a=n.host===self.location.host&&c.has(n.pathname),o="only-if-cached"===t.request.cache&&!a;!s||i||o||t.respondWith((async()=>a&&await caches.match(t.request)||async function(t){const n=await caches.open(`offline${e}`);try{const e=await fetch(t);return n.put(t,e.clone()),e}catch(e){const c=await n.match(t);if(c)return c;throw e}}(t.request))())}))}();

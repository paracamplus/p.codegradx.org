import { files, shell } from '@sapper/service-worker';
import { version } from './client/TS.mjs';
import { extraURLS } from './client/URL2cache.mjs';
const dev = (process.env.NODE_ENV === 'development');

function logFact () {
    if ( dev ) {
        console.log.apply(this, arguments);
    }
}

// See https://sapper.svelte.dev/docs#Deploying_service_workers
function getTimeStamp () {
    try {
        if ( dev ) {
            return Date.now().toString();
        } else {
            return version;
        }
    } catch (exc) {
        return process.env.SAPPER_TIMESTAMP;
    }
}
const timestamp = getTimeStamp();

const ASSETS = `cache${timestamp}`;
const OFFLINE = `offline${timestamp}`;

// `shell` is an array of all the files generated by the bundler,
// `files` is an array of everything in the `static` directory
const files_to_cache = shell.concat(files);
const staticAssets = new Set(files_to_cache);

self.addEventListener('install', event => {
    logFact(`SW: installing ${ASSETS} ...`); // DEBUG
	event.waitUntil(
		caches
			.open(ASSETS)
            .then(cache => {
                return cache.addAll(files_to_cache);
            })
			.then(() => {
                logFact(`SW: cache ${ASSETS} filled`); // DEBUG
				self.skipWaiting();
                logFact(`SW: skip waited`); // DEBUG
                /* no await */ cacheExtraURLS(extraURLS);
			})
	);
});

function cacheExtraURLS (extraURLS) {
    logFact(`SW: filling cache with extraURLS`)
    return Promise.allSettled(
        extraURLS.map(url => {
            logFact(`SW: about to fetchAndCache ${url}`);
            return fetchAndCache(url)
                .then(() => {
                    logFact(`SW: about to add to staticAssets ${url}`);
                    staticAssets.add(url);
                }).catch(exc => {
                    logFact(`SW: problem ${url}`, exc);
                });
        }))
        .then(() => {
            logFact(`SW: cache now filled with extraURLS`);
        }).catch(exc => {
            logFact(`SW: problem cacheExtraURLS`, exc);
        });
}

self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(async keys => {
			// delete old caches
			for (const key of keys) {
				if (key !== ASSETS) await caches.delete(key);
			}
			self.clients.claim();
		}).catch(exc => {
            logFact(`SW: problem activate`, exc);
        })
	);
});

/**
 * Fetch the asset from the network and store it in the ofline cache. 
 * Fall back to the cache if the user is offline.
 */
async function fetchAndCache(request) {
	const cache = await caches.open(OFFLINE)
	try {
		const response = await fetch(request);
		cache.put(request, response.clone());
        let url = (typeof request === 'string') ? request : request.url;
        logFact(`SW now cached ${url}`);
		return response;
	} catch (err) {
		const response = await cache.match(request);
		if (response) return response;
		throw err;
	}
}

function isCodeGradXRequest (url) {
    // We already know that it is an https? GET request:
    if ( url.hostname.match(/^[xes]\d*[.]codegradx[.]org/ ) ) {
        return true;
    }
    return false;
}

function shouldCacheCodeGradXRequest (url) {
    if ( url.hostname.match(/^x\d*[.]/ ) ) {
        if ( url.pathname.match(/^\/exercisesset\/path\//) ) {
            return true;
        }
        if ( url.pathname.match(/^\/fromp\/getua/) &&
             url.search.match(/lang=fr/) ) {
            return true;
        }
    }
    if ( url.hostname.match(/^e\d*[.]/ ) ) {
        if ( url.pathname.match(/^\/exercisecontent\/U.{80,}\/content/) ) {
            return true;
        }
    }
    if ( url.hostname.match(/^s\d*[.]/ ) ) {
        if ( url.pathname.match(/\/^s\/.*[.]xml/) ) {
            return true;
        }
    }
    return false;
}

self.addEventListener('fetch', async event => {
	if (event.request.method !== 'GET' ||
        event.request.headers.has('range')) return;

	const url = new URL(event.request.url);

    if ( dev ) { // DEBUG DEBUG DEBUG DEBUG
        await sendToPage(event, {
            kind: 'FETCHING',
            url
        });
    }
    
	// don't try to handle e.g. data: URIs
	const isHttp = url.protocol.startsWith('http');
	const isDevServerRequest = url.hostname === self.location.hostname &&
          url.port !== self.location.port;
	const isStaticAsset = url.host === self.location.host &&
          staticAssets.has(url.pathname);
	const skipBecauseUncached = event.request.cache === 'only-if-cached' &&
          !isStaticAsset;

	if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
		event.respondWith(
			(async () => {
				// always serve static files and bundler-generated
				// assets from cache.
                if ( isStaticAsset ) {
				    const cachedAsset = await caches.match(event.request);
                    return cachedAsset || fetchAndCache(event.request);
                }

                if ( isCodeGradXRequest(url) ) {
                    logFact(`ConstellationCache? ${url.href}`); //DEBUG
                    if ( shouldCacheCodeGradXRequest(url) ) {
                        logFact(`ConstellationCacheYes! ${url.href}`); //DEBUG
                        const cachedResponse =
                              await caches.match(event.request);
                        if ( cachedResponse ) {
                            logFact(`ConstellationCacheUsed ${url.href}`); //DEBUG
                        }
                        return cachedResponse || fetchAndCache(event.request);
                    } else {
                        return fetch(event.request);
                    }
                }

				return fetchAndCache(event.request);
			})()
		);
	}
});

async function sendToPage (event, o) {
    // Exit early if we don't have access to the client.
    // Eg, if it's cross-origin.
    if ( event.clientId ) {
        // Get the client.
        const client = await clients.get(event.clientId);
        // Exit early if we don't get the client.
        // Eg, if it closed.
        if ( client ) {
            // Send a message to the client.
            client.postMessage(o);
        }
    }
}


self.addEventListener('message', async (event) => {
    event.waitUntil(async () => {
        // event is an ExtendableMessageEvent
        try {
            
            logFact(`SW receiving`, event.data);
            if ( event.data ) {
                if ( event.data.kind ) {
                    if ( event.data.kind === 'CACHE_CONTENT_REQUEST' ) {
                        const cacheLines = await getCacheContent();
                        await sendToPage(event, {
                            kind: 'CACHE_CONTENT',
                            cacheLines
                        });
                    } else {
                        logFact(`SW Message unknown kind`, event.data.kind);
                    }
                } else {
                    logFact(`SW Message without kind`, event.data);
                }
            } else {
                logFact(`SW message without data`, event);
            }
        } catch (exc) {
            logFact('SW message', {exc});
        }
    });
});

async function getCacheContent () {
    return new Promise.all([
        self.caches
            .open(ASSETS)
            .then(cache => cache.keys()),
        self.caches
            .open(OFFLINE)
            .then(cache => cache.keys())
    ]).then((a, o) => ({
        [ASSETS]: a,
        [OFFLINE]: o
    }));
}

logFact(`SW code end`);

// end of service-worker.js

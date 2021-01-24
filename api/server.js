'use strict';

var sirv = require('sirv');
var polka = require('polka');
var compression = require('compression');
var fs$2 = require('fs');
var path$1 = require('path');
var codegradx = require('codegradx');
var Stream = require('stream');
var http = require('http');
var Url = require('url');
var https = require('https');
var zlib = require('zlib');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var sirv__default = /*#__PURE__*/_interopDefaultLegacy(sirv);
var polka__default = /*#__PURE__*/_interopDefaultLegacy(polka);
var compression__default = /*#__PURE__*/_interopDefaultLegacy(compression);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$2);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path$1);
var Stream__default = /*#__PURE__*/_interopDefaultLegacy(Stream);
var http__default = /*#__PURE__*/_interopDefaultLegacy(http);
var Url__default = /*#__PURE__*/_interopDefaultLegacy(Url);
var https__default = /*#__PURE__*/_interopDefaultLegacy(https);
var zlib__default = /*#__PURE__*/_interopDefaultLegacy(zlib);

// Crypt utilities to hide from browsers the content of some cookies.
// These are used on server-side.


const chunksize = 80;

const defaultfkeyfilenames = {
    public:  '/run/secrets/fkeyPublic',
    private: '/run/secrets/fkeyPrivate'
};

function preparePublicKey (fkeyfilename = defaultfkeyfilenames.public) {
    const fs = require('fs');
    const crypto = require('crypto');
    if ( fs.existsSync(fkeyfilename) ) {
        try {
            const pubkeycontent = fs.readFileSync(fkeyfilename);
            const pubkey = crypto.createPublicKey({
                key: pubkeycontent,
                format: 'pem'
            });
            //console.log(`public key`, pubkey); // DEBUG
            return pubkey;
        } catch (exc) {
            throw exc;
        }
    } else {
        throw new Error(`Missing public key file ${fkeyfilename}`);
    }
}

function preparePrivateKey (fkeyfilename = defaultfkeyfilenames.private) {
    const fs = require('fs');
    const crypto = require('crypto');
    if ( fs.existsSync(fkeyfilename) ) {
        try {
            const keycontent = fs.readFileSync(fkeyfilename);
            const key = crypto.createPrivateKey({
                key: keycontent,
                format: 'pem'
            });
            //console.log(`private key`, key); // DEBUG
            return key;
        } catch (exc) {
            throw exc;
        }
    } else {
        throw new Error(`Missing private key file ${fkeyfilename}`);
    }
}

function decrypt (s) {
    const crypto = require('crypto');
    const privatekey = preparePrivateKey();
    let results = [];
    const blocks = s.split(',');
    function decrypt1block (block) {
        let result = decodeURIComponent(block);
        result = Buffer.from(result, 'base64');
        result = crypto.privateDecrypt(privatekey, result);
        results.push(result.toString());
    }
    for ( let block of blocks ) {
        decrypt1block(block);
    }
    return results.join('');
}

function crypt (s) {
    const crypto = require('crypto');
    let blocks = [];
    const pubkey = preparePublicKey();
    function crypt1block (s) {
        //console.log('crypt1block', s);//DEBUG
        let result = crypto.publicEncrypt(pubkey, Buffer.from(s));
        result = result.toString('base64');
        result = encodeURIComponent(result);
        blocks.push(result);
    }
    while ( s.length > 0 ) {
        let bs = s.slice(0, chunksize);
        crypt1block(bs);
        s = s.slice(chunksize);
    }
    return blocks.join(',');
}

function shuffle (array) {
    // Fisher-Yates
    for ( let i=(array.length - 1) ; i>0 ; i-- ) {
        const j = Math.floor(Math.random() * (i+1));
        const aj = array[j];
        array[j] = array[i];
        array[i] = aj;
    }
    return array;
}

// Serve digit image as /digit/[slug].js

const fs = require('fs');

async function get(req, res, next) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js
	let { slug } = req.params;
    slug = slug.replace(/[.]png$/, '');

    let images = [];
    const cookies = req.headers.cookie.split(';');
    //console.log('cookies', cookies);
    for ( const cookie of cookies ) {
        const nameValue = cookie.trim().split('=');
        //console.log(nameValue);
        const content = decrypt(nameValue[1]);
        if ( nameValue[0] === 'MV' ) {
            const fields = content.split(',');
            images = fields.slice(2);
            break;
        }
    }
    //console.log('images', images, slug);

    let pngfile = 'static/_digits/bad.png';
    if ( images.length > 0 ) {
        // There was an MV cookie (therefore not expired!):
        for ( let i=0 ; i<images.length ; i++ ) {
            if ( images[i] === slug ) {
                pngfile = `static/_digits/${i}.png`;
                break;
            }
        }
    }
    //console.log('pngfile', pngfile); //DEBUG

    // TODO add noise to image ???

    res.setHeader('Content-Type', 'image/png');
    res.end(fs.readFileSync(pngfile));
}

// end of digit/[slug].js

var route_0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get: get
});

// Serve information for the movecaptcha
const fetch$1 = require('node-fetch');

const prefixurl = '/digit';

async function get$1 (req, res, next) {

    const state = new codegradx.CodeGradX.State();
    // Initialize that server-side CodeGradX instance:
    state.servers = state.defaultservers;
    state.fetch = fetch$1;
    
    state.sendAXServer('x', {
        path: '/movecaptchainfo',
        method: 'GET',
        headers: {
            Accept: 'application/json'
        }
    }).then((response) => {
        if ( response.entityKind !== 'JSON' ) {
            throw "bad answer";
        }
        //console.log(response);//DEBUG
        //console.log(response.entity);//DEBUG
        const nonce = response.entity.nonce;
        const wanted = response.entity.wanted;
        const expires = codegradx.CodeGradX._str2Date(response.entity.expires)
              .toUTCString();
        const images = response.entity.images;
        const urls = shuffle(images.map((s) => `${prefixurl}/${s}.png`));
        //console.log(nonce, wanted, urls); //DEBUG

        let content = `${nonce},${wanted.join('')},${images.join(',')}`;
        content = crypt(content);
        let cookie = `MV=${content}; path=/digit/; expires=${expires};`;
        res.setHeader('Set-Cookie', cookie);
		res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({nonce, wanted, urls, expires}));
        
    }).catch((exc) => {
        console.log('signupinit PB', state.log);
        console.log('signupinit PB', exc);
        let content = `Problem
exception: ${exc.toString()}
state.log is
${state.log.items.join('\n')}
`;
        res.statusCode = 500;
        res.statusMessage = "Erroneous movecaptchainfo";
        res.setHeader('Content-Type', 'text/plain');
        res.end(content);
    });
}

// end of signupinit.js

var route_1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get: get$1
});

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function set_store_value(store, ret, value = ret) {
    store.set(value);
    return ret;
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { title: '', head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.title + result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

/* src/components/ParacamplusLogo.svelte generated by Svelte v3.31.2 */

let originalWidth = 332.73508;
let originalHeight = 341.99368;

const ParacamplusLogo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { size = "1em" } = $$props;
	let { fgcolor = "#ffffff" } = $$props;
	let { bgcolor = "#20295b" } = $$props;
	let width = size;
	let height = size;
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	if ($$props.fgcolor === void 0 && $$bindings.fgcolor && fgcolor !== void 0) $$bindings.fgcolor(fgcolor);
	if ($$props.bgcolor === void 0 && $$bindings.bgcolor && bgcolor !== void 0) $$bindings.bgcolor(bgcolor);

	return `



<svg xmlns="${"http://www.w3.org/2000/svg"}"${add_attribute("width", width, 0)}${add_attribute("height", height, 0)} viewBox="${"0 0 " + escape(originalWidth) + " " + escape(originalHeight)}"><g transform="${"translate(0,-1)"}"><g transform="${"matrix(1.25,0,0,-1.25,0,336.25)"}"><path d="${"M 226.41738,-88.491041 A 114.15444,116.22555 0 0 1 106.28808,5.0668218 114.15444,116.22555 0 0 1 0.39503011,-104.88137 114.15444,116.22555 0 0 1 94.622217,-225.33326"}" transform="${"scale(1,-1)"}" id="${"outercircle"}" style="${"opacity:1;fill:" + escape(fgcolor) + ";fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:3.20000005;stroke-dasharray:none;stroke-dashoffset:2.72127938;stroke-opacity:1"}"></path><path transform="${"scale(1,-1)"}" d="${"M 191.7794,-94.153239 A 79.189468,85.609978 0 0 1 108.44514,-25.239935 79.189468,85.609978 0 0 1 34.986639,-106.2261 79.189468,85.609978 0 0 1 100.35248,-194.94915"}" id="${"innercircle"}" style="${"opacity:1;fill:" + escape(bgcolor) + ";fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:3.20000005;stroke-dasharray:none;stroke-dashoffset:2.72127938;stroke-opacity:1"}"></path></g><rect style="${"opacity:1;fill:" + escape(bgcolor) + ";fill-opacity:1;fill-rule:nonzero;stroke:none;stroke-width:1;stroke-linecap:round;stroke-linejoin:miter;stroke-miterlimit:3.20000005;stroke-dasharray:none;stroke-dashoffset:2.72127938;stroke-opacity:1"}" width="${"134.25633"}" height="${"147.17029"}" x="${"94.783516"}" y="${"-235.13135"}" transform="${"matrix(1.25,0,0,1.25,0,336.25)"}"></rect></g><g id="${"layer2top"}" style="${"display:inline"}" transform="${"translate(0,-1)"}"><path style="${"fill:none;fill-rule:evenodd;stroke:" + escape(fgcolor) + ";stroke-width:50;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1"}" d="${"m 86.619135,150.58535 c 79.918635,0.36549 149.603795,-0.73096 221.116355,0.36549 0,0 -9.03181,-61.277337 -39.43166,-85.562193 C 237.90398,41.103791 185.29916,25.956138 185.29916,25.956138 l 0.36549,230.253392"}"></path></g></svg>`;
});

/* src/components/SplashImage.svelte generated by Svelte v3.31.2 */

const SplashImage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { size = "1em" } = $$props;
	if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `



<div class="${"w3-container w3-center"}">${validate_component(ParacamplusLogo, "ParacamplusLogo").$$render(
			$$result,
			{ size },
			{
				size: $$value => {
					size = $$value;
					$$settled = false;
				}
			},
			{}
		)}
</div>`;
	} while (!$$settled);

	return $$rendered;
});

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

/* src/routes/_layout.svelte generated by Svelte v3.31.2 */

const css = {
	code: "main.svelte-1vk44dp{position:relative;top:0px;min-height:100vh;background-color:white;margin:0 auto;display:grid;grid-template-rows:auto 1fr auto}",
	map: "{\"version\":3,\"file\":\"_layout.svelte\",\"sources\":[\"_layout.svelte\"],\"sourcesContent\":[\"<script>\\n</script>\\n\\n<style>\\n main {\\n   position: relative;\\n   top: 0px;\\n   min-height: 100vh;\\n   background-color: white;\\n   margin: 0 auto;\\n   /* box-sizing: border-box; */\\n   display: grid;\\n   grid-template-rows: auto 1fr auto;\\n }\\n</style>\\n\\n<main>\\n\\t<slot></slot>\\n</main>\\n\"],\"names\":[],\"mappings\":\"AAIC,IAAI,eAAC,CAAC,AACJ,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,UAAU,CAAE,KAAK,CACjB,gBAAgB,CAAE,KAAK,CACvB,MAAM,CAAE,CAAC,CAAC,IAAI,CAEd,OAAO,CAAE,IAAI,CACb,kBAAkB,CAAE,IAAI,CAAC,GAAG,CAAC,IAAI,AACnC,CAAC\"}"
};

const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css);
	return `<main class="${"svelte-1vk44dp"}">${slots.default ? slots.default({}) : ``}</main>`;
});

var root_comp = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Layout
});

/* src/routes/_error.svelte generated by Svelte v3.31.2 */

const css$1 = {
	code: "h1.svelte-8od9u6,p.svelte-8od9u6{margin:0 auto}h1.svelte-8od9u6{font-size:2.8em;font-weight:700;margin:0 0 0.5em 0}p.svelte-8od9u6{margin:1em auto}@media(min-width: 480px){h1.svelte-8od9u6{font-size:4em}}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let status;\\n\\texport let error;\\n\\n\\tconst dev = undefined === 'development';\\n</script>\\n\\n<style>\\n\\th1, p {\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th1 {\\n\\t\\tfont-size: 2.8em;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t}\\n\\n\\tp {\\n\\t\\tmargin: 1em auto;\\n\\t}\\n\\n\\t@media (min-width: 480px) {\\n\\t\\th1 {\\n\\t\\t\\tfont-size: 4em;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>{status}</title>\\n</svelte:head>\\n\\n<h1>{status}</h1>\\n\\n<p>{error.message}</p>\\n\\n{#if dev && error.stack}\\n\\t<pre>{error.stack}</pre>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAQC,gBAAE,CAAE,CAAC,cAAC,CAAC,AACN,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,GAAG,CAAC,IAAI,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { status } = $$props;
	let { error } = $$props;
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	$$result.css.add(css$1);

	return `${($$result.head += `${($$result.title = `<title>${escape(status)}</title>`, "")}`, "")}

<h1 class="${"svelte-8od9u6"}">${escape(status)}</h1>

<p class="${"svelte-8od9u6"}">${escape(error.message)}</p>

${ ``}`;
});

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.31.2 */

const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);
	if ($$props.notify === void 0 && $$bindings.notify && notify !== void 0) $$bindings.notify(notify);

	return `


${validate_component(Layout, "Layout").$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `${error
		? `${validate_component(Error$1, "Error").$$render($$result, { error, status }, {}, {})}`
		: `${validate_component(level1.component || missing_component, "svelte:component").$$render($$result, Object.assign(level1.props), {}, {})}`}`
	})}`;
});

// This file is generated by Sapper — do not edit it!

const ignore = [/^\/digit\/([^/]+?)\/?$/, /^\/api\/signupinit\.json$/];

const routes = (d => [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			{ i: 0 }
		]
	},

	{
		// lostpassword.svelte
		pattern: /^\/lostpassword\/?$/,
		parts: [
			{ i: 1 }
		]
	},

	{
		// universes.svelte
		pattern: /^\/universes\/?$/,
		parts: [
			{ i: 2 }
		]
	},

	{
		// mailsent.svelte
		pattern: /^\/mailsent\/?$/,
		parts: [
			{ i: 3 }
		]
	},

	{
		// sendmail.svelte
		pattern: /^\/sendmail\/?$/,
		parts: [
			{ i: 4 }
		]
	},

	{
		// connect.svelte
		pattern: /^\/connect\/?$/,
		parts: [
			{ i: 5 }
		]
	},

	{
		// enroll.svelte
		pattern: /^\/enroll\/?$/,
		parts: [
			{ i: 6 }
		]
	},

	{
		// resume/[token].svelte
		pattern: /^\/resume\/([^/]+?)\/?$/,
		parts: [
			null,
			{ i: 7, params: match => ({ token: d(match[1]) }) }
		]
	},

	{
		// signua.svelte
		pattern: /^\/signua\/?$/,
		parts: [
			{ i: 8 }
		]
	},

	{
		// whoami.svelte
		pattern: /^\/whoami\/?$/,
		parts: [
			{ i: 9 }
		]
	},

	{
		// login.svelte
		pattern: /^\/login\/?$/,
		parts: [
			{ i: 10 }
		]
	},

	{
		// ua.svelte
		pattern: /^\/ua\/?$/,
		parts: [
			{ i: 11 }
		]
	}
])(decodeURIComponent);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

let uid = 1;
let cid;
const _history = typeof history !== 'undefined' ? history : {
    pushState: () => { },
    replaceState: () => { },
    scrollRestoration: 'auto'
};
const scroll_history = {};
let base_url;
let handle_target;
function extract_query(search) {
    const query = Object.create(null);
    if (search.length > 0) {
        search.slice(1).split('&').forEach(searchParam => {
            const [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
            if (typeof query[key] === 'string')
                query[key] = [query[key]];
            if (typeof query[key] === 'object')
                query[key].push(value);
            else
                query[key] = value;
        });
    }
    return query;
}
function select_target(url) {
    if (url.origin !== location.origin)
        return null;
    if (!url.pathname.startsWith(base_url))
        return null;
    let path = url.pathname.slice(base_url.length);
    if (path === '') {
        path = '/';
    }
    // avoid accidental clashes between server routes and page routes
    if (ignore.some(pattern => pattern.test(path)))
        return;
    for (let i = 0; i < routes.length; i += 1) {
        const route = routes[i];
        const match = route.pattern.exec(path);
        if (match) {
            const query = extract_query(url.search);
            const part = route.parts[route.parts.length - 1];
            const params = part.params ? part.params(match) : {};
            const page = { host: location.host, path, query, params };
            return { href: url.href, route, match, page };
        }
    }
}
function scroll_state() {
    return {
        x: pageXOffset,
        y: pageYOffset
    };
}
function navigate(dest, id, noscroll, hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const popstate = !!id;
        if (popstate) {
            cid = id;
        }
        else {
            const current_scroll = scroll_state();
            // clicked on a link. preserve scroll state
            scroll_history[cid] = current_scroll;
            cid = id = ++uid;
            scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
        }
        yield handle_target();
        if (document.activeElement && (document.activeElement instanceof HTMLElement))
            document.activeElement.blur();
        if (!noscroll) {
            let scroll = scroll_history[id];
            let deep_linked;
            if (hash) {
                // scroll is an element id (from a hash), we need to compute y.
                deep_linked = document.getElementById(hash.slice(1));
                if (deep_linked) {
                    scroll = {
                        x: 0,
                        y: deep_linked.getBoundingClientRect().top + scrollY
                    };
                }
            }
            scroll_history[cid] = scroll;
            if (popstate || deep_linked) {
                scrollTo(scroll.x, scroll.y);
            }
            else {
                scrollTo(0, 0);
            }
        }
    });
}

function get_base_uri(window_document) {
    let baseURI = window_document.baseURI;
    if (!baseURI) {
        const baseTags = window_document.getElementsByTagName('base');
        baseURI = baseTags.length ? baseTags[0].href : window_document.URL;
    }
    return baseURI;
}

function goto(href, opts = { noscroll: false, replaceState: false }) {
    const target = select_target(new URL(href, get_base_uri(document)));
    if (target) {
        _history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
        return navigate(target, null, opts.noscroll);
    }
    location.href = href;
    return new Promise(() => {
        /* never resolves */
    });
}

function page_store(value) {
    const store = writable(value);
    let ready = true;
    function notify() {
        ready = true;
        store.update(val => val);
    }
    function set(new_value) {
        ready = false;
        store.set(new_value);
    }
    function subscribe(run) {
        let old_value;
        return store.subscribe((new_value) => {
            if (old_value === undefined || (ready && new_value !== old_value)) {
                run(old_value = new_value);
            }
        });
    }
    return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;
const stores = {
    page: page_store({}),
    preloading: writable(null),
    session: writable(initial_data && initial_data.session)
};
stores.session.subscribe((value) => __awaiter(void 0, void 0, void 0, function* () {
    return;
}));

// -*- coding: utf-8 -*-
const person = writable(undefined);

// end of stores.mjs

// Client library

const config = {
    x: {
        url: 'https://x.codegradx.org'
    }
};

function getConfig () {
    return config;
}

/**
   Sleep for n seconds
*/

async function sleep (seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), 1000 * seconds);
    });
}

/**
   Determine what the user has to complete.

   json is a User or a PartialUser. They both have the
   confirmedemail and confirmedua and uaversion fields.
*/

async function determineNextUserState (json) {
    if ( json ) {
        if ( ! json.confirmedemail ) {
            return '/sendmail';
        }
        if ( json.confirmedua < json.uaversion ) {
            return '/signua';
        }
        // Make sure $person holds a User, not a PartiaUser
        if ( ! isUser(json) ) {
            $person = await codegradx.CodeGradX.getCurrentUser();
        }
        return '/universes';
    } else {
        return undefined;
    }
}

/**
   When accessing a page in the sequence (connect, sendmail, mailsent, 
   signua, universes) try to determine the status of the user and
   redirect it to the appropriate step.

   @return {Promise<User>}
*/

async function initializePerson () {
    let $person = get_store_value(person);
    if ( ! $person ) {
        $person = await codegradx.CodeGradX.getCurrentUser();
        person.set($person);
    }
    if ( $person ) {
        const href = await determineNextUserState($person);
        const where = document.location.pathname.replace(/^.*(\/\w+)/, '$1');
        if ( href && href !== where ) {
            console.log(`From ${where}: goto ${href}`);
            return goto(href);
        }
    }
    return Promise.resolve($person);
}

/**
   $person might be undefined or an instance of CodeGradX.User or
   an object (a PartialUser). One constant difference between User
   and PartialUser is the presence of the 'pseudo' field.

 */

function isUser (o) {
    return o && o instanceof codegradx.CodeGradX.User && o.pseudo;
} 

// end of client/lib.mjs

/* src/routes/index.svelte generated by Svelte v3.31.2 */

const css$2 = {
	code: "div.background.svelte-1ic78iv{background-color:#20295b;min-height:100vh}p.text.svelte-1ic78iv,div.text.svelte-1ic78iv{color:white;font-size:200%}",
	map: "{\"version\":3,\"file\":\"index.svelte\",\"sources\":[\"index.svelte\"],\"sourcesContent\":[\"<style>\\n div.background {\\n   background-color: #20295b;\\n   min-height: 100vh;\\n }\\n p.text, div.text {\\n   color: white;\\n   font-size: 200%;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX</title>\\n</svelte:head>\\n\\n<div class='w3-container background'\\n     on:click={go} >\\n  <center>\\n    <div class='text' style='padding-top: 10vh;'>\\n      CodeGradX\\n    </div>\\n\\n    <div style='margin-top: 10vh;'>\\n      <SplashImage size='25%'/>\\n    </div>\\n\\n    {#if isUser($person)}\\n    <p class='text'>\\n      Bonjour {$person.pseudo},\\n    </p>\\n    {/if}\\n    \\n    <p class='text'>\\n      Découvrez ses exercices de programmation à notation\\n      automatique...\\n    </p>\\n  </center>\\n</div>\\n\\n<script>\\n import SplashImage from '../components/SplashImage.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { isUser, sleep, initializePerson } from '../client/lib.mjs';\\n\\n function go (event) {\\n   sapper.goto('/universes');\\n }\\n\\n onMount(async () => {\\n   return initializePerson()\\n   .then(async () => {\\n     return sapper.goto('/universes');\\n   });\\n });\\n\\n \\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,GAAG,WAAW,eAAC,CAAC,AACd,gBAAgB,CAAE,OAAO,CACzB,UAAU,CAAE,KAAK,AACnB,CAAC,AACD,CAAC,oBAAK,CAAE,GAAG,KAAK,eAAC,CAAC,AAChB,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,IAAI,AACjB,CAAC\"}"
};

const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);

	onMount(async () => {
		return initializePerson().then(async () => {
			return goto("/universes");
		});
	});

	$$result.css.add(css$2);
	$$unsubscribe_person();

	return `${($$result.head += `${($$result.title = `<title>CodeGradX</title>`, "")}`, "")}

<div class="${"w3-container background svelte-1ic78iv"}"><center><div class="${"text svelte-1ic78iv"}" style="${"padding-top: 10vh;"}">CodeGradX
    </div>

    <div style="${"margin-top: 10vh;"}">${validate_component(SplashImage, "SplashImage").$$render($$result, { size: "25%" }, {}, {})}</div>

    ${isUser($person)
	? `<p class="${"text svelte-1ic78iv"}">Bonjour ${escape($person.pseudo)},
    </p>`
	: ``}
    
    <p class="${"text svelte-1ic78iv"}">Découvrez ses exercices de programmation à notation
      automatique...
    </p></center>
</div>`;
});

var component_0 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Routes
});

/* src/components/Header.svelte generated by Svelte v3.31.2 */

const css$3 = {
	code: "header.svelte-1r24ydt{max-height:2rem}",
	map: "{\"version\":3,\"file\":\"Header.svelte\",\"sources\":[\"Header.svelte\"],\"sourcesContent\":[\"<style>\\n header {\\n   max-height: 2rem;\\n }\\n</style>\\n\\n<header class='w3-container w3-theme-d2'>\\n  <div class='w3-dropdown-hover w3-theme-d2'>\\n    <span class=''>CodeGradX</span>\\n    {#if isUser($person) }\\n    <span class='w3-margin-left'>{$person.pseudo}</span>\\n    {/if}\\n    <div class='w3-dropdown-content w3-bar-block w3-card-4'>\\n      <div class='w3-bar-item w3-button'\\n           on:click={universes} >voir les univers</div>\\n      {#if isUser($person) }\\n      <div class='w3-bar-item w3-button'\\n           on:click={whoami} >qui suis-je ?</div>\\n      <div class='w3-bar-item w3-button'\\n           on:click={logout} >me déconnecter</div>\\n      {:else}\\n      <div class='w3-bar-item w3-button'\\n           on:click={login} >m'identifier</div>\\n      {/if}\\n    </div>\\n  </div>\\n</header>\\n\\n<script>\\n import * as sapper from '@sapper/app';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { isUser } from '../client/lib.mjs';\\n\\n async function logout (event) {\\n   const json = $person;\\n   $person = undefined;\\n   if ( isUser(json) ) {\\n     await CodeGradX.getCurrentState().userDisconnect();\\n   }\\n   sapper.goto('/universes');\\n }\\n\\n async function login (event) {\\n   sapper.goto('/connect');\\n }\\n\\n async function universes (event) {\\n   sapper.goto('/universes');\\n }\\n\\n async function whoami (event) {\\n   sapper.goto('/whoami');\\n }\\n \\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,eAAC,CAAC,AACN,UAAU,CAAE,IAAI,AAClB,CAAC\"}"
};

const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);

	$$result.css.add(css$3);
	$$unsubscribe_person();

	return `<header class="${"w3-container w3-theme-d2 svelte-1r24ydt"}"><div class="${"w3-dropdown-hover w3-theme-d2"}"><span class="${""}">CodeGradX</span>
    ${isUser($person)
	? `<span class="${"w3-margin-left"}">${escape($person.pseudo)}</span>`
	: ``}
    <div class="${"w3-dropdown-content w3-bar-block w3-card-4"}"><div class="${"w3-bar-item w3-button"}">voir les univers</div>
      ${isUser($person)
	? `<div class="${"w3-bar-item w3-button"}">qui suis-je ?</div>
      <div class="${"w3-bar-item w3-button"}">me déconnecter</div>`
	: `<div class="${"w3-bar-item w3-button"}">m&#39;identifier</div>`}</div></div>
</header>`;
});

/* src/components/Problem.svelte generated by Svelte v3.31.2 */

const Problem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let { error = undefined } = $$props;
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);

	return `${error
	? `<div class="${"w3-panel w3-red"}">${escape(error)}</div>`
	: ``}`;
});

/* src/components/Bottom.svelte generated by Svelte v3.31.2 */

const css$4 = {
	code: "footer.svelte-y8sbul{max-height:2rem}a.svelte-y8sbul{text-decoration:none}",
	map: "{\"version\":3,\"file\":\"Bottom.svelte\",\"sources\":[\"Bottom.svelte\"],\"sourcesContent\":[\"<style>\\n footer {\\n   max-height: 2rem;\\n }\\n a {\\n   text-decoration : none;\\n }\\n</style>\\n\\n<footer class=\\\"w3-bar w3-small w3-theme-d2\\\">\\n  <div class=\\\"w3-bar-item w3-left\\\">\\n    <a href='https://codegradx.org/spip.php?article22'\\n       title=\\\"Mentions légales\\\"\\n       rel=\\\"noopener\\\" target='_blank'>Mentions légales</a>\\n  </div>\\n  <div class=\\\"w3-bar-item w3-right\\\">\\n    Une technologie de\\n    <a href=\\\"https://paracamplus.com/\\\" \\n       target='_blank' rel=\\\"noopener\\\"\\n       title=\\\"En savoir plus sur la SARL Paracamplus!\\\">Paracamplus\\n      <ParacamplusLogo size='1em' /></a>\\n  </div>\\n</footer>\\n\\n<script>\\n import ParacamplusLogo from '../components/ParacamplusLogo.svelte';\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,cAAC,CAAC,AACN,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,CAAC,cAAC,CAAC,AACD,eAAe,CAAG,IAAI,AACxB,CAAC\"}"
};

const Bottom = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	$$result.css.add(css$4);

	return `<footer class="${"w3-bar w3-small w3-theme-d2 svelte-y8sbul"}"><div class="${"w3-bar-item w3-left"}"><a href="${"https://codegradx.org/spip.php?article22"}" title="${"Mentions légales"}" rel="${"noopener"}" target="${"_blank"}" class="${"svelte-y8sbul"}">Mentions légales</a></div>
  <div class="${"w3-bar-item w3-right"}">Une technologie de
    <a href="${"https://paracamplus.com/"}" target="${"_blank"}" rel="${"noopener"}" title="${"En savoir plus sur la SARL Paracamplus!"}" class="${"svelte-y8sbul"}">Paracamplus
      ${validate_component(ParacamplusLogo, "ParacamplusLogo").$$render($$result, { size: "1em" }, {}, {})}</a></div>
</footer>`;
});

/* src/routes/lostpassword.svelte generated by Svelte v3.31.2 */

const css$5 = {
	code: "header.bold.svelte-1t9r4a0{font-weight:bold}input.error.svelte-1t9r4a0{background-color:pink}",
	map: "{\"version\":3,\"file\":\"lostpassword.svelte\",\"sources\":[\"lostpassword.svelte\"],\"sourcesContent\":[\"<style>\\n header.bold {\\n   font-weight: bold;\\n }\\n input.error {\\n   background-color: pink;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Mot de passe perdu</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <div class='w3-margin-top w3-padding'>\\n    <header class='w3-center w3-large bold'>\\n      Mot de passe perdu\\n      <span class='w3-right w3-margin-left w3-xlarge'\\n            on:click={showHelp}>&#x1f6c8;</span>\\n    </header>\\n    \\n    <p class='smallHint'>\\n      \\n    </p>\\n    <div class=\\\"w3-margin-top\\\">\\n      <label for=\\\"login\\\">Votre courriel:</label>\\n      <input type=\\\"text\\\" bind:value={login} name='login'\\n             class:error={errorLogin} class=\\\"w3-input\\\"\\n             on:keyup={hideproblem}\\n             on:click={hideproblem}\\n             placeholder=\\\"{defaultlogin}\\\" />\\n    </div>\\n  </div>\\n\\n  {#if error}<Problem bind:error={error} />{/if}\\n\\n  <div class=\\\"w3-center w3-margin-top\\\">\\n    <button class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n            name=\\\"lostpassword\\\"\\n            on:click={lostpassword}>\\n      J'ai perdu mon mot de passe!\\n    </button>\\n  </div>\\n\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import ConnectDoc from '../components/ConnectDoc.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { getConfig, initializePerson } from '../client/lib.mjs';\\n\\n let login = undefined;\\n let defaultlogin = 'mon.email@a.moi';\\n let error = undefined;\\n let errorLogin = false;\\n let helpshown = false;\\n\\n function hideproblem (event) {\\n   error = errorLogin = undefined;\\n }\\n\\n onMount(async () => {\\n   return initializePerson();\\n });\\n \\n async function lostpassword (event) {\\n   hideproblem();\\n   if ( ! login || login === '' ) {\\n     errorLogin = error = \\\"Quel est votre courriel ?\\\";\\n     return;\\n   }\\n   try {\\n     $person = await CodeGradX\\n           .getCurrentState()\\n           .userGetLink(login);\\n     // mailsent will have to handle $person and its specific state\\n     // that is, emailConfirmed or not, UAsigned or not. The token\\n     // $person.token may be a *-mailconfirm or *-reconnect.\\n     sapper.goto('/mailsent');\\n   } catch (exc) {\\n     error = \\\"Je ne vois pas qui vous êtes !\\\";\\n   }\\n }\\n\\n function showHelp (event) {\\n   helpshown = true;\\n }\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,KAAK,eAAC,CAAC,AACX,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,KAAK,MAAM,eAAC,CAAC,AACX,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

let defaultlogin = "mon.email@a.moi";

const Lostpassword = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => value);
	person.subscribe($$value => $$value);
	let login = undefined;

	onMount(async () => {
		return initializePerson();
	});

	$$result.css.add(css$5);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/Mot de passe perdu</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><div class="${"w3-margin-top w3-padding"}"><header class="${"w3-center w3-large bold svelte-1t9r4a0"}">Mot de passe perdu
      <span class="${"w3-right w3-margin-left w3-xlarge"}">🛈</span></header>
    
    <p class="${"smallHint"}"></p>
    <div class="${"w3-margin-top"}"><label for="${"login"}">Votre courriel:</label>
      <input type="${"text"}" name="${"login"}" class="${["w3-input svelte-1t9r4a0",  ""].join(" ").trim()}"${add_attribute("placeholder", defaultlogin, 0)}${add_attribute("value", login, 1)}></div></div>

  ${ ``}

  <div class="${"w3-center w3-margin-top"}"><button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}" name="${"lostpassword"}">J&#39;ai perdu mon mot de passe!
    </button></div></section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Lostpassword
});

/* src/routes/universes.svelte generated by Svelte v3.31.2 */

const css$6 = {
	code: "p.smallHint.svelte-7owgve.svelte-7owgve{color:#aaa}.personName.svelte-7owgve.svelte-7owgve{color:#334191;padding:0.1em 0.5em 0.1em 0.5em;border-radius:0.5em;border:solid 1px #334191}li.svelte-7owgve span.va.svelte-7owgve{vertical-align:0px}.videoWrapper.svelte-7owgve.svelte-7owgve{height:100px}.videoWrapper.svelte-7owgve iframe.svelte-7owgve,.videoWrapper.svelte-7owgve img.svelte-7owgve{top:0;left:0;width:20%;height:auto !important}",
	map: "{\"version\":3,\"file\":\"universes.svelte\",\"sources\":[\"universes.svelte\"],\"sourcesContent\":[\"<style>\\n p.smallHint {\\n   color: #aaa;\\n }\\n .personName {\\n   color: #334191;\\n   padding: 0.1em 0.5em 0.1em 0.5em;\\n   border-radius: 0.5em;\\n   border: solid 1px #334191;\\n }\\n li span.va {\\n   vertical-align: 0px;\\n }\\n .videoWrapper {\\n   height: 100px;\\n }\\n .videoWrapper iframe, .videoWrapper img {\\n   top: 0;\\n   left: 0;\\n   width: 20%;\\n   height: auto !important;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Univers</title>\\n</svelte:head>\\n\\n<Header />\\n<div class='w3-container' on:click={hideProblem}>\\n  <header class='w3-container w3-margin'>\\n    {#if $person}\\n    <p>Bonjour <span class='personName'>{$person.pseudo}</span>,\\n      sélectionnez l'univers d'exercices que vous souhaitez.\\n      </p>\\n    {:else}\\n      <p> Sélectionnez, après vous être identifié, l'univers d'exercices que\\n        vous souhaitez. <br />\\n    {/if}\\n    <p class='smallHint'>\\n      Le titre indique s'il est en anglais ou en français.\\n    </p>\\n  </header>\\n\\n  {#if ! $person}\\n  <div class='w3-container'>\\n    <div class='w3-center w3-animate-zoom'>\\n      <span class='w3-btn w3-center w3-round-xlarge w3-theme-d4'\\n            on:click={connect} >\\n        Je m'identifie...\\n      </span>\\n    </div>\\n  </div>\\n  {/if}\\n  \\n  {#if error}<Problem bind:error={error} />{/if}\\n  \\n  <div class='w3-container w3-margin'>\\n    <ul class='w3-ul'>\\n      <li lang='fr'>\\n        <span class='va'>\\n          <a href='https://scm.codegradx.org/doc/exercises'\\n             on:click={go}\\n             class='w3-btn w3-round-xlarge w3-theme-l4' >Scheme</a> \\n          du <a href='https://programmation-recursive.net/'\\n                class='w3-btn w3-round-xlarge w3-theme-l4' >\\n            MOOC « Programmation récursive »</a>\\n        </span>\\n        <span on:click={() => {showmoocprogrec = ! showmoocprogrec}}\\n              class='videoWrapper'>\\n          {#if showmoocprogrec}\\n          <iframe width='560' height='315'\\n                  title=\\\"Bande annonce du MOOC programmation récursive\\\"\\n                  src=\\\"https://www.youtube.com/embed/nu9_3ZZ1k2M\\\"\\n                  frameborder='0'\\n                  allowfullscreen ></iframe>\\n          {:else}\\n          <img src='/moocprogrec.png' \\n               alt='Video du MOOC Programmation récursive' />\\n          {/if}\\n          </span>\\n        </li>\\n      <li lang='fr'>\\n        <span class='va'>\\n          <a href=\\\"https://unx.codegradx.org/\\\"\\n             on:click={go}\\n           class='w3-btn w3-round-xlarge w3-theme-l4' > \\n          <tt>sh</tt> et autres utilitaires Unix (sed, tr, head, tail, cut,\\n          grep, sh, etc.)\\n          </a></span></li>\\n      <li lang='en'>\\n        <span class='va'>\\n          <a href=\\\"https://js.codegradx.org/\\\"\\n             on:click={go}\\n             class='w3-btn w3-round-xlarge w3-theme-l4' >\\n            Javascript </a>\\n          from the <a href='https://diffusejavascript.codegradx.org/'\\n                      class='w3-btn w3-round-large w3-theme-l4'>\\n            MOOC « Diffuse JavaScript »</a>\\n        </span>\\n        <span on:click={() => {showmoocjs = ! showmoocjs}}\\n              class='videoWrapper'>\\n          {#if showmoocjs}\\n          <iframe width='560' height='315'\\n                  title=\\\"Teaser for the Diffuse JavaScript MOOC\\\"\\n                  src=\\\"https://www.youtube.com/embed/6Ka2NoPcWck\\\" \\n                  frameborder='0'\\n                  allowfullscreen ></iframe>\\n          {:else}\\n          <img src='/moocjs.png' \\n               alt='Video of the MOOC Diffuse JavaScript' />\\n          {/if}\\n          </span>\\n        </li>\\n      <li lang='fr'>\\n        <span class='va'>\\n          <a href=\\\"https://cc.codegradx.org/\\\"\\n             on:click={go}\\n             class='w3-btn w3-round-xlarge w3-theme-l4' >\\n            C\\n          </a></span></li>\\n      <li lang='fr'>\\n        <span class='va'>\\n          <a href=\\\"https://python.codegradx.org/\\\"\\n             on:click={go}\\n             class='w3-btn w3-round-xlarge w3-theme-l4' >\\n            Python\\n          </a></span></li>\\n      <li lang='fr'>\\n        <span class='va'>\\n          <a href=\\\"https://jfp.codegradx.org/\\\"\\n             on:click={go}\\n             class='w3-btn w3-round-xlarge w3-theme-l4' >\\n            Journées Franciliennes de Programmation (langage libre) \\n          </a></span></li>\\n    </ul>\\n  </div>\\n</div>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { fade } from 'svelte/transition';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { initializePerson } from '../client/lib.mjs';\\n\\n let error = undefined;\\n let showmoocjs = false;\\n let showmoocprogrec = false;\\n \\n onMount(initializePerson);\\n \\n function go (event) {\\n   hideProblem();\\n   if ( ! $person ) {\\n     event.preventDefault();\\n     event.stopPropagation();\\n     error = \\\"Vous devez d'abord vous identifier!\\\";\\n   }\\n }\\n\\n function hideProblem (event) {\\n   error = undefined;\\n }\\n\\n function connect (event) {\\n   sapper.goto('/connect');\\n }\\n \\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,CAAC,UAAU,4BAAC,CAAC,AACX,KAAK,CAAE,IAAI,AACb,CAAC,AACD,WAAW,4BAAC,CAAC,AACX,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,CAChC,aAAa,CAAE,KAAK,CACpB,MAAM,CAAE,KAAK,CAAC,GAAG,CAAC,OAAO,AAC3B,CAAC,AACD,gBAAE,CAAC,IAAI,GAAG,cAAC,CAAC,AACV,cAAc,CAAE,GAAG,AACrB,CAAC,AACD,aAAa,4BAAC,CAAC,AACb,MAAM,CAAE,KAAK,AACf,CAAC,AACD,2BAAa,CAAC,oBAAM,CAAE,2BAAa,CAAC,GAAG,cAAC,CAAC,AACvC,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CAAC,UAAU,AACzB,CAAC\"}"
};

const Universes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);
	onMount(initializePerson);

	$$result.css.add(css$6);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/Univers</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
<div class="${"w3-container"}"><header class="${"w3-container w3-margin"}">${$person
		? `<p>Bonjour <span class="${"personName svelte-7owgve"}">${escape($person.pseudo)}</span>,
      sélectionnez l&#39;univers d&#39;exercices que vous souhaitez.
      </p>`
		: `<p>Sélectionnez, après vous être identifié, l&#39;univers d&#39;exercices que
        vous souhaitez. <br></p>`}
    <p class="${"smallHint svelte-7owgve"}">Le titre indique s&#39;il est en anglais ou en français.
    </p></header>

  ${!$person
		? `<div class="${"w3-container"}"><div class="${"w3-center w3-animate-zoom"}"><span class="${"w3-btn w3-center w3-round-xlarge w3-theme-d4"}">Je m&#39;identifie...
      </span></div></div>`
		: ``}
  
  ${ ``}
  
  <div class="${"w3-container w3-margin"}"><ul class="${"w3-ul"}"><li lang="${"fr"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://scm.codegradx.org/doc/exercises"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">Scheme</a> 
          du <a href="${"https://programmation-recursive.net/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">MOOC « Programmation récursive »</a></span>
        <span class="${"videoWrapper svelte-7owgve"}">${ `<img src="${"/moocprogrec.png"}" alt="${"Video du MOOC Programmation récursive"}" class="${"svelte-7owgve"}">`}</span></li>
      <li lang="${"fr"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://unx.codegradx.org/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}"><tt>sh</tt> et autres utilitaires Unix (sed, tr, head, tail, cut,
          grep, sh, etc.)
          </a></span></li>
      <li lang="${"en"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://js.codegradx.org/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">Javascript </a>
          from the <a href="${"https://diffusejavascript.codegradx.org/"}" class="${"w3-btn w3-round-large w3-theme-l4"}">MOOC « Diffuse JavaScript »</a></span>
        <span class="${"videoWrapper svelte-7owgve"}">${ `<img src="${"/moocjs.png"}" alt="${"Video of the MOOC Diffuse JavaScript"}" class="${"svelte-7owgve"}">`}</span></li>
      <li lang="${"fr"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://cc.codegradx.org/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">C
          </a></span></li>
      <li lang="${"fr"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://python.codegradx.org/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">Python
          </a></span></li>
      <li lang="${"fr"}" class="${"svelte-7owgve"}"><span class="${"va svelte-7owgve"}"><a href="${"https://jfp.codegradx.org/"}" class="${"w3-btn w3-round-xlarge w3-theme-l4"}">Journées Franciliennes de Programmation (langage libre) 
          </a></span></li></ul></div></div>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Universes
});

/* src/routes/mailsent.svelte generated by Svelte v3.31.2 */

const css$7 = {
	code: ".personName.svelte-i8s1l7{color:#334191;padding:0.1em 0.5em 0.1em 0.5em;border-radius:0.5em;border:solid 1px #334191}",
	map: "{\"version\":3,\"file\":\"mailsent.svelte\",\"sources\":[\"mailsent.svelte\"],\"sourcesContent\":[\"<style>\\n .personName {\\n   color: #334191;\\n   padding: 0.1em 0.5em 0.1em 0.5em;\\n   border-radius: 0.5em;\\n   border: solid 1px #334191;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/ConfirmationCourriel</title>\\n</svelte:head>\\n\\n<Header />\\n\\n{#if $person}\\n<section class='w3-container'>\\n  <p>\\n    Si <code class='personName'>{$person.login}</code> est connu\\n    de CodeGradX, alors un courriel vient de lui être adressé.\\n    {#if ! $person.confirmedemail}\\n    Ce courriel contient un lien vous permettant de confirmer\\n    votre adresse électronique.\\n    {:else}\\n    Ce courriel contient un lien vous permettant de vous connecter\\n    à nouveau à CodeGradX.\\n    {/if}\\n    Pensez éventuellement à vérifier votre spam!\\n  </p>\\n\\n  <p> Pour rappel </p>\\n  <ul>\\n    {#if $person.confirmedemail}\\n    <li> Vous avez déjà confirmé votre adresse électronique. </li>\\n    {:else}\\n    <li> Vous n'avez pas encore confirmé votre adresse électronique. </li>\\n    {/if}\\n    \\n    {#if $person.confirmedua === $person.uaversion}\\n    <li> Vous avez déjà signé les conditions d'usage. </li>\\n    {:else}\\n    <li> Vous n'avez pas encore signé les conditions d'usage. </li>\\n    {/if}\\n  </ul>\\n</section>\\n\\n{:else}\\n<section class='w3-container'>\\n  <p> Je ne sais qui vous êtes aussi vous redirige-je vers la\\n    page appropriée...\\n  </p>\\n</section>\\n{/if}\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import ShowStore from '../components/ShowStore.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { getConfig, sleep } from '../client/lib.mjs';\\n import { isUser, initializePerson } from '../client/lib.mjs';\\n\\n let path = undefined;\\n\\n async function XXXreconnect (event) {\\n   // Redirect to the /universes page with renewed credentials:\\n   try {\\n     await CodeGradX.getCurrentState().sendAXServer('x', {\\n       path: path,\\n       method: 'GET',\\n       headers: {\\n         'Accept': 'application/json',\\n         'Content-Type': 'application/x-www-form-urlencoded'\\n       }\\n     });\\n   } catch (exc) {\\n     console.log({exc});//DEBUG\\n   }\\n }\\n\\n onMount(async () => {\\n   if ( ! $person ) {\\n     // In case the User has already completed its enrollment and has\\n     // a valid safeCookie:\\n     $person = await CodeGradX.getCurrentUser();\\n     // assert(isUser($person))\\n   }\\n   // If coming from /connect, then $person is a partial user:\\n   if ( ! $person ) {\\n     await sleep(1);\\n     sapper.goto('/connect');\\n   }\\n });\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,WAAW,cAAC,CAAC,AACX,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,CAChC,aAAa,CAAE,KAAK,CACpB,MAAM,CAAE,KAAK,CAAC,GAAG,CAAC,OAAO,AAC3B,CAAC\"}"
};

const Mailsent = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);

	onMount(async () => {
		if (!$person) {
			// In case the User has already completed its enrollment and has
			// a valid safeCookie:
			set_store_value(person, $person = await codegradx.CodeGradX.getCurrentUser(), $person);
		} // assert(isUser($person))

		// If coming from /connect, then $person is a partial user:
		if (!$person) {
			await sleep(1);
			goto("/connect");
		}
	});

	$$result.css.add(css$7);
	$$unsubscribe_person();

	return `${($$result.head += `${($$result.title = `<title>CodeGradX/ConfirmationCourriel</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${$person
	? `<section class="${"w3-container"}"><p>Si <code class="${"personName svelte-i8s1l7"}">${escape($person.login)}</code> est connu
    de CodeGradX, alors un courriel vient de lui être adressé.
    ${!$person.confirmedemail
		? `Ce courriel contient un lien vous permettant de confirmer
    votre adresse électronique.`
		: `Ce courriel contient un lien vous permettant de vous connecter
    à nouveau à CodeGradX.`}
    Pensez éventuellement à vérifier votre spam!
  </p>

  <p>Pour rappel </p>
  <ul>${$person.confirmedemail
		? `<li>Vous avez déjà confirmé votre adresse électronique. </li>`
		: `<li>Vous n&#39;avez pas encore confirmé votre adresse électronique. </li>`}
    
    ${$person.confirmedua === $person.uaversion
		? `<li>Vous avez déjà signé les conditions d&#39;usage. </li>`
		: `<li>Vous n&#39;avez pas encore signé les conditions d&#39;usage. </li>`}</ul></section>`
	: `<section class="${"w3-container"}"><p>Je ne sais qui vous êtes aussi vous redirige-je vers la
    page appropriée...
  </p></section>`}

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
});

var component_3 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Mailsent
});

/* src/routes/sendmail.svelte generated by Svelte v3.31.2 */

const Sendmail = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);

	onMount(async () => {
		return initializePerson().then(async () => {
			
		}); //return sapper.goto('/connect');
	});

	$$unsubscribe_person();

	return `${($$result.head += `${($$result.title = `<title>CodeGradX/ConfirmationCourriel</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

${$person
	? `<section class="${"w3-container"}">${ `<p>Vous n&#39;avez pas encore confirmé votre adresse électronique:
    Cliquez sur le bouton ci-dessous pour que vous soit envoyé
    un courriel adressé à <code>${escape($person.login)}</code>.
    Ce courriel contiendra un lien vous permettant de progresser dans
    votre inscription à CodeGradX. 
  </p>
  <div class="${"w3-center"}"><button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">M&#39;envoyer un courriel
    </button></div>`
		}</section>`
	: ``}

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
});

var component_4 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Sendmail
});

/* src/routes/connect.svelte generated by Svelte v3.31.2 */

const css$8 = {
	code: "header.bold.svelte-lbq2h3{font-weight:bold}",
	map: "{\"version\":3,\"file\":\"connect.svelte\",\"sources\":[\"connect.svelte\"],\"sourcesContent\":[\"<style>\\n header.bold {\\n   font-weight: bold;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Identification</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <div class='w3-margin-top w3-padding'>\\n    <header class='w3-center w3-large bold'>\\n      Qui êtes vous ?\\n      <span class='w3-right w3-margin-left w3-xlarge'\\n            on:click={showHelp}>&#x1f6c8;</span>\\n    </header>\\n\\n    {#if helpshown}<ConnectDoc />{/if}\\n    \\n    <p>\\n      Si vous n'avez pas encore créé de compte sur CodeGradX, vous pouvez\\n      cliquer sur le bouton « Je m'inscris » ou sur « via Google ». Dans\\n      ce dernier cas, c'est votre courriel connu par Google qui deviendra\\n      votre identifiant.\\n    </p>\\n\\n    <div class=\\\"w3-center w3-margin-top\\\">\\n      <button class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n              name=\\\"enroll\\\"\\n              on:click={enroll}>\\n        Je m'inscris!\\n      </button>\\n      <a href={oauth2url} name=\\\"viaGoogle\\\"\\n         class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n         >via Google</a>\\n    </div>\\n    \\n    <p>\\n      Si vous avez déjà un compte, utilisez l'un des boutons suivants:\\n    </p>\\n\\n    <div class=\\\"w3-center w3-margin-top\\\">\\n      <button type=\\\"submit\\\" name=\\\"signin\\\" \\n              class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n              on:click={authenticate}>\\n        Je m'identifie!\\n      </button>\\n      <a href={oauth2url} name=\\\"viaGoogle\\\"\\n         class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n         >via Google</a>\\n      <button class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n              name=\\\"lostpassword\\\"\\n              on:click={lostpassword}>\\n        J'ai perdu mon mot de passe!\\n      </button>\\n    </div>\\n  </div>\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import ConnectDoc from '../components/ConnectDoc.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { getConfig, initializePerson } from '../client/lib.mjs';\\n\\n let oauth2url = '/to/be/filled';\\n let helpshown = false;\\n\\n onMount(async () => {\\n   return initializePerson()\\n     .then(async () => {\\n     // compute the url \\\"via Google\\\":\\n     oauth2url = getConfig().x.url;\\n     oauth2url += `/googleopenid`;\\n     oauth2url += `?homeUrl=${origin}`;\\n     oauth2url += `&nofinalredir=1`;\\n     oauth2url += `&origin=${origin}`;\\n   });\\n });\\n\\n function enroll (event) {\\n   sapper.goto('/enroll');\\n }\\n function authenticate (event) {\\n   sapper.goto('/login');\\n }\\n function lostpassword (event) {\\n   sapper.goto('/lostpassword');\\n }\\n\\n function showHelp (event) {\\n   helpshown = true;\\n }\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,KAAK,cAAC,CAAC,AACX,WAAW,CAAE,IAAI,AACnB,CAAC\"}"
};

const Connect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let oauth2url = "/to/be/filled";

	onMount(async () => {
		return initializePerson().then(async () => {
			// compute the url "via Google":
			oauth2url = getConfig().x.url;

			oauth2url += `/googleopenid`;
			oauth2url += `?homeUrl=${origin}`;
			oauth2url += `&nofinalredir=1`;
			oauth2url += `&origin=${origin}`;
		});
	});

	$$result.css.add(css$8);

	return `${($$result.head += `${($$result.title = `<title>CodeGradX/Identification</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><div class="${"w3-margin-top w3-padding"}"><header class="${"w3-center w3-large bold svelte-lbq2h3"}">Qui êtes vous ?
      <span class="${"w3-right w3-margin-left w3-xlarge"}">🛈</span></header>

    ${ ``}
    
    <p>Si vous n&#39;avez pas encore créé de compte sur CodeGradX, vous pouvez
      cliquer sur le bouton « Je m&#39;inscris » ou sur « via Google ». Dans
      ce dernier cas, c&#39;est votre courriel connu par Google qui deviendra
      votre identifiant.
    </p>

    <div class="${"w3-center w3-margin-top"}"><button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}" name="${"enroll"}">Je m&#39;inscris!
      </button>
      <a${add_attribute("href", oauth2url, 0)} name="${"viaGoogle"}" class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">via Google</a></div>
    
    <p>Si vous avez déjà un compte, utilisez l&#39;un des boutons suivants:
    </p>

    <div class="${"w3-center w3-margin-top"}"><button type="${"submit"}" name="${"signin"}" class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">Je m&#39;identifie!
      </button>
      <a${add_attribute("href", oauth2url, 0)} name="${"viaGoogle"}" class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">via Google</a>
      <button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}" name="${"lostpassword"}">J&#39;ai perdu mon mot de passe!
      </button></div></div></section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
});

var component_5 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Connect
});

/* src/components/MoveCaptcha.svelte generated by Svelte v3.31.2 */

const css$9 = {
	code: "div.targets.svelte-ju4jbp.svelte-ju4jbp{margin-top:4em;display:grid;grid-template-columns:auto 3em 3em 3em 3em auto;justify-items:center;grid-column-gap:1em}div.targets.svelte-ju4jbp div.target.svelte-ju4jbp{width:3em;background-color:#eee}div.targets.svelte-ju4jbp div.target img.svelte-ju4jbp{width:3em;height:3em}div.images.svelte-ju4jbp.svelte-ju4jbp{margin-top:1em;display:grid;grid-template-columns:auto 3em 3em 3em 3em 3em auto;grid-template-rows:3em 3em;justify-items:center;grid-column-gap:1em;grid-row-gap:1em}div.images.svelte-ju4jbp div.image.svelte-ju4jbp{width:3em;background-color:white}div.images.svelte-ju4jbp div.image img.svelte-ju4jbp{width:3em;height:3em} img.targeted {border:solid #334191 4px}",
	map: "{\"version\":3,\"file\":\"MoveCaptcha.svelte\",\"sources\":[\"MoveCaptcha.svelte\"],\"sourcesContent\":[\"<!-- -*- coding: utf-8 -*- -->\\n\\n{#if urls.length === 0 }\\n<div></div>\\n\\n{:else}\\n\\n<div id='movecaptcha' class='w3-container w3-center'>\\n  { installHooks(), '' }\\n  <p> Déplacez les chiffres dans les cases vides afin de former la\\n    suite {#each wanted as w}{w} {/each}.\\n  </p>\\n  \\n  {#if progress}<div class='w3-green'>{progress}</div>{/if}\\n  \\n  <div class='images'>\\n    <!-- first row- -->\\n    <div></div>\\n    <div class='image'><img alt='11' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='12' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='13' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='14' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='15' src='/_digits/white.png' /></div>\\n    <div></div>\\n    \\n    <div></div>\\n    <div class='image'><img alt='21' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='22' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='23' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='24' src='/_digits/white.png' /></div>\\n    <div class='image'><img alt='25' src='/_digits/white.png' /></div>\\n    <div></div>\\n  </div>\\n\\n  <div class='targets'>\\n    <div></div>\\n    <div class='target'><img alt='a1' src='/_digits/white.png'/></div>\\n    <div class='target'><img alt='a2' src='/_digits/white.png'/></div>\\n    <div class='target'><img alt='a3' src='/_digits/white.png'/></div>\\n    <div class='target'><img alt='a4' src='/_digits/white.png'/></div>\\n    <div></div>\\n  </div>\\n</div>\\n\\n{/if}\\n\\n{#if error}<Problem bind:error={error} />{/if}\\n  \\n\\n<style>\\n div.targets {\\n   margin-top: 4em;\\n   display: grid;\\n   grid-template-columns: auto 3em 3em 3em 3em auto;\\n   justify-items: center;\\n   grid-column-gap: 1em;\\n }\\n div.targets div.target {\\n   width: 3em;\\n   background-color: #eee;\\n }\\n div.targets div.target img {\\n   width: 3em;\\n   height: 3em;\\n }\\n \\n div.images {\\n   margin-top: 1em;\\n   display: grid;\\n   grid-template-columns: auto 3em 3em 3em 3em 3em auto;\\n   grid-template-rows: 3em 3em;\\n   justify-items: center;\\n   grid-column-gap: 1em;\\n   grid-row-gap: 1em;\\n }\\n div.images div.image {\\n   width: 3em;\\n   background-color: white;\\n }\\n div.images div.image img {\\n   width: 3em;\\n   height: 3em;\\n }\\n :global( img.targeted ) {\\n   border: solid #334191 4px;\\n }\\n</style>\\n\\n<script>\\n import Problem from '../components/Problem.svelte';\\n \\n import { onMount, createEventDispatcher, afterUpdate } from 'svelte';\\n const dispatch = createEventDispatcher();\\n import { CodeGradX } from 'codegradx';\\n import { finalcrypt } from '../cryptlib.mjs';\\n\\n const message = {\\n   building: \\\"Construction d'une Captcha...\\\",\\n   finished: `Navré mais les 2 minutes pendant lesquelles \\nvous pouviez résoudre la captcha sont écoulées.`,\\n   badcaptcha: \\\"Je n'arrive pas à construire la Captcha\\\"\\n };\\n\\n let captcha = undefined;\\n let nonce = undefined;\\n let wanted = [];\\n let urls = [];\\n let expires = undefined;\\n\\n const prefixurl = '/digit';\\n const whiteImage = '/_digits/white.png';\\n let targetsArray = [];\\n let error = undefined;\\n let progress = message.building;\\n $: end = computeEnd(expires);\\n\\n onMount(() => {\\n   error = undefined;\\n   getInfo(true);\\n });\\n\\n async function getInfo (bool) {\\n   if ( bool ) {\\n     try {\\n       const response = await fetch('/api/signupinit.json');\\n       //console.log(response);//DEBUG\\n       if ( response.ok ) {\\n         response.entity = await response.json();\\n         //console.log('signup', response.entity);//DEBUG\\n         nonce = response.entity.nonce;\\n         wanted = response.entity.wanted;\\n         urls = response.entity.urls;\\n         expires = response.entity.expires;\\n       } else {\\n         throw response;\\n       }\\n     } catch(exc) {\\n       console.log('signup', 'getInfo', exc);\\n       error = message.badcaptcha;\\n       progress = undefined;\\n     }\\n   }\\n }\\n\\n function computeEnd (expires) {\\n   if ( typeof document !== 'undefined' ) {\\n     installHooks();\\n     return Date.parse(expires);\\n   }\\n }\\n \\n async function refreshCaptcha (event) {\\n   error = undefined;\\n   await getInfo(true);\\n }\\n\\n function installHooks () {\\n   error = undefined;\\n   // Leave time to #movecaptcha to be created:\\n   setTimeout(doInstallHooks, 1000);\\n   end = Date.parse(expires);\\n }\\n\\n function doInstallHooks () {\\n   const movecaptcha = document.getElementById('movecaptcha');\\n   const images = movecaptcha.getElementsByClassName('image');\\n   for ( let i=0 ; i<images.length ; i++) {\\n     const divimage = images.item(i);\\n     const image = divimage.firstElementChild;\\n     image.setAttribute('src', urls[i]);\\n     image.addEventListener('dragstart', (event) => {\\n       error = undefined;\\n       event.dataTransfer.setData(\\\"text/plain\\\", event.target.src);\\n       event.dataTransfer.effectAllowed = 'copy';\\n       return true;\\n     });\\n   }\\n   \\n   const targets = movecaptcha.getElementsByClassName('target');\\n   targetsArray = [];\\n   for ( let i=0 ; i<targets.length ; i++ ) {\\n     const target = targets.item(i);\\n     const targetImage = target.firstElementChild;\\n     targetsArray.push(targetImage);\\n     targetImage.setAttribute('src', whiteImage);\\n     target.addEventListener(\\\"dragenter\\\", illuminate);\\n     target.addEventListener(\\\"dragover\\\", (event) => {\\n       event.preventDefault();\\n     });\\n     target.addEventListener(\\\"dragleave\\\", tarnish);\\n     target.addEventListener(\\\"drop\\\", drop);\\n   }\\n   captcha = captcha || {\\n     getResponse,\\n     refresh: refreshCaptcha,\\n     getCount: filledBoxes\\n   };\\n   progress = undefined;\\n   dispatch('ready', captcha);\\n }\\n\\n function illuminate (event) {\\n   event.preventDefault();\\n   if ( Date.now() < end ) {\\n     const target = event.target;\\n     const classes = target.getAttribute('class') + ' targeted';\\n     target.setAttribute('class', classes);\\n   } else {\\n     error = message.finished;\\n     event.preventDefault();\\n     event.stopPropagation();\\n     dispatch('timeout', {\\n       captcha,\\n     });\\n   }\\n }\\n function tarnish (event) {\\n   event.preventDefault();\\n   const target = event.target;\\n   const classes = target.getAttribute('class').replace(/ targeted/, '');\\n   target.setAttribute('class', classes);\\n }\\n function drop (event) {\\n   if ( Date.now() < end ) {\\n     tarnish(event);\\n     event.target.setAttribute('src', event.dataTransfer.getData(\\\"text/plain\\\"));\\n     dispatch('change', {\\n       captcha,\\n       count: filledBoxes()\\n     });\\n     if ( isComplete() ) {\\n       dispatch('complete', {\\n         captcha,\\n         complete: true\\n       });\\n     }\\n   } else {\\n     error = message.finished;\\n     event.preventDefault();\\n     event.stopPropagation();\\n     dispatch('timeout', {\\n       captcha,\\n     });\\n   }\\n }\\n\\n // Return the number of filled boxes:\\n function filledBoxes () {\\n   let count = 0;\\n   targetsArray.forEach(target => {\\n     const src = target.getAttribute('src');\\n     if ( ! target.getAttribute('src').match(/white[.]png/) ) {\\n       count++;\\n     }\\n   });\\n   return count;\\n }\\n\\n // semi-predicate returning the set of images filling boxes:\\n function isComplete () {\\n   let results = [];\\n   if ( targetsArray.some(target => {\\n     const src = target.getAttribute('src');\\n     results.push(src.replace(/^.*\\\\/(\\\\w+)[.]png$/, '$1'));\\n     return target.getAttribute('src').match(/white[.]png/);\\n   }) ) {\\n     return false;\\n   } else {\\n     return results;\\n   }\\n }\\n\\n // Return the result of the solved captcha:\\n function getResponse () {\\n   if ( Date.now() < end ) {\\n     let results = isComplete();\\n     //console.log('results', results);//DEBUG\\n     if ( results ) {\\n       let content = btoa(`${nonce},${results.join(',')}`);\\n       return `movecaptcha,${content}`;\\n     } else {\\n       return false;\\n     }\\n   } else {\\n     error = message.finished;\\n     dispatch('timeout', {\\n       captcha,\\n     });\\n     return false;\\n   }\\n }\\n\\n</script>\\n\\n\"],\"names\":[],\"mappings\":\"AAkDC,GAAG,QAAQ,4BAAC,CAAC,AACX,UAAU,CAAE,GAAG,CACf,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CAChD,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,GAAG,AACtB,CAAC,AACD,GAAG,sBAAQ,CAAC,GAAG,OAAO,cAAC,CAAC,AACtB,KAAK,CAAE,GAAG,CACV,gBAAgB,CAAE,IAAI,AACxB,CAAC,AACD,GAAG,sBAAQ,CAAC,GAAG,OAAO,CAAC,GAAG,cAAC,CAAC,AAC1B,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC,AAED,GAAG,OAAO,4BAAC,CAAC,AACV,UAAU,CAAE,GAAG,CACf,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,IAAI,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,GAAG,CAAC,IAAI,CACpD,kBAAkB,CAAE,GAAG,CAAC,GAAG,CAC3B,aAAa,CAAE,MAAM,CACrB,eAAe,CAAE,GAAG,CACpB,YAAY,CAAE,GAAG,AACnB,CAAC,AACD,GAAG,qBAAO,CAAC,GAAG,MAAM,cAAC,CAAC,AACpB,KAAK,CAAE,GAAG,CACV,gBAAgB,CAAE,KAAK,AACzB,CAAC,AACD,GAAG,qBAAO,CAAC,GAAG,MAAM,CAAC,GAAG,cAAC,CAAC,AACxB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACb,CAAC,AACO,cAAc,AAAE,CAAC,AACvB,MAAM,CAAE,KAAK,CAAC,OAAO,CAAC,GAAG,AAC3B,CAAC\"}"
};
const whiteImage = "/_digits/white.png";

function tarnish(event) {
	event.preventDefault();
	const target = event.target;
	const classes = target.getAttribute("class").replace(/ targeted/, "");
	target.setAttribute("class", classes);
}

const MoveCaptcha = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let end;
	const dispatch = createEventDispatcher();

	const message = {
		building: "Construction d'une Captcha...",
		finished: `Navré mais les 2 minutes pendant lesquelles 
vous pouviez résoudre la captcha sont écoulées.`,
		badcaptcha: "Je n'arrive pas à construire la Captcha"
	};

	let captcha = undefined;
	let nonce = undefined;
	let wanted = [];
	let urls = [];
	let expires = undefined;
	let targetsArray = [];
	let error = undefined;
	let progress = message.building;

	onMount(() => {
		error = undefined;
		getInfo(true);
	});

	async function getInfo(bool) {
		if (bool) {
			try {
				const response = await fetch("/api/signupinit.json");

				//console.log(response);//DEBUG
				if (response.ok) {
					response.entity = await response.json();

					//console.log('signup', response.entity);//DEBUG
					nonce = response.entity.nonce;

					wanted = response.entity.wanted;
					urls = response.entity.urls;
					expires = response.entity.expires;
				} else {
					throw response;
				}
			} catch(exc) {
				console.log("signup", "getInfo", exc);
				error = message.badcaptcha;
				progress = undefined;
			}
		}
	}

	function computeEnd(expires) {
		if (typeof document !== "undefined") {
			installHooks();
			return Date.parse(expires);
		}
	}

	async function refreshCaptcha(event) {
		error = undefined;
		await getInfo(true);
	}

	function installHooks() {
		error = undefined;

		// Leave time to #movecaptcha to be created:
		setTimeout(doInstallHooks, 1000);

		end = Date.parse(expires);
	}

	function doInstallHooks() {
		const movecaptcha = document.getElementById("movecaptcha");
		const images = movecaptcha.getElementsByClassName("image");

		for (let i = 0; i < images.length; i++) {
			const divimage = images.item(i);
			const image = divimage.firstElementChild;
			image.setAttribute("src", urls[i]);

			image.addEventListener("dragstart", event => {
				error = undefined;
				event.dataTransfer.setData("text/plain", event.target.src);
				event.dataTransfer.effectAllowed = "copy";
				return true;
			});
		}

		const targets = movecaptcha.getElementsByClassName("target");
		targetsArray = [];

		for (let i = 0; i < targets.length; i++) {
			const target = targets.item(i);
			const targetImage = target.firstElementChild;
			targetsArray.push(targetImage);
			targetImage.setAttribute("src", whiteImage);
			target.addEventListener("dragenter", illuminate);

			target.addEventListener("dragover", event => {
				event.preventDefault();
			});

			target.addEventListener("dragleave", tarnish);
			target.addEventListener("drop", drop);
		}

		captcha = captcha || {
			getResponse,
			refresh: refreshCaptcha,
			getCount: filledBoxes
		};

		progress = undefined;
		dispatch("ready", captcha);
	}

	function illuminate(event) {
		event.preventDefault();

		if (Date.now() < end) {
			const target = event.target;
			const classes = target.getAttribute("class") + " targeted";
			target.setAttribute("class", classes);
		} else {
			error = message.finished;
			event.preventDefault();
			event.stopPropagation();
			dispatch("timeout", { captcha });
		}
	}

	function drop(event) {
		if (Date.now() < end) {
			tarnish(event);
			event.target.setAttribute("src", event.dataTransfer.getData("text/plain"));
			dispatch("change", { captcha, count: filledBoxes() });

			if (isComplete()) {
				dispatch("complete", { captcha, complete: true });
			}
		} else {
			error = message.finished;
			event.preventDefault();
			event.stopPropagation();
			dispatch("timeout", { captcha });
		}
	}

	// Return the number of filled boxes:
	function filledBoxes() {
		let count = 0;

		targetsArray.forEach(target => {
			const src = target.getAttribute("src");

			if (!target.getAttribute("src").match(/white[.]png/)) {
				count++;
			}
		});

		return count;
	}

	// semi-predicate returning the set of images filling boxes:
	function isComplete() {
		let results = [];

		if (targetsArray.some(target => {
			const src = target.getAttribute("src");
			results.push(src.replace(/^.*\/(\w+)[.]png$/, "$1"));
			return target.getAttribute("src").match(/white[.]png/);
		})) {
			return false;
		} else {
			return results;
		}
	}

	// Return the result of the solved captcha:
	function getResponse() {
		if (Date.now() < end) {
			let results = isComplete();

			//console.log('results', results);//DEBUG
			if (results) {
				let content = btoa(`${nonce},${results.join(",")}`);
				return `movecaptcha,${content}`;
			} else {
				return false;
			}
		} else {
			error = message.finished;
			dispatch("timeout", { captcha });
			return false;
		}
	}

	$$result.css.add(css$9);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;
		end = computeEnd(expires);

		$$rendered = `

${urls.length === 0
		? `<div></div>`
		: `<div id="${"movecaptcha"}" class="${"w3-container w3-center"}">${escape((installHooks(), ""))}
  <p>Déplacez les chiffres dans les cases vides afin de former la
    suite ${each(wanted, w => `${escape(w)} `)}.
  </p>
  
  ${progress
			? `<div class="${"w3-green"}">${escape(progress)}</div>`
			: ``}
  
  <div class="${"images svelte-ju4jbp"}">
    <div></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"11"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"12"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"13"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"14"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"15"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div></div>
    
    <div></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"21"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"22"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"23"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"24"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"image svelte-ju4jbp"}"><img alt="${"25"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div></div></div>

  <div class="${"targets svelte-ju4jbp"}"><div></div>
    <div class="${"target svelte-ju4jbp"}"><img alt="${"a1"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"target svelte-ju4jbp"}"><img alt="${"a2"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"target svelte-ju4jbp"}"><img alt="${"a3"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div class="${"target svelte-ju4jbp"}"><img alt="${"a4"}" src="${"/_digits/white.png"}" class="${"svelte-ju4jbp"}"></div>
    <div></div></div></div>`}

${error
		? `${validate_component(Problem, "Problem").$$render(
				$$result,
				{ error },
				{
					error: $$value => {
						error = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: ``}`;
	} while (!$$settled);

	return $$rendered;
});

/* src/routes/enroll.svelte generated by Svelte v3.31.2 */

const css$a = {
	code: "header.bold.svelte-q6rd9e{font-weight:bold}input.error.svelte-q6rd9e{background-color:pink}p.smallHint.svelte-q6rd9e{color:#aaa}",
	map: "{\"version\":3,\"file\":\"enroll.svelte\",\"sources\":[\"enroll.svelte\"],\"sourcesContent\":[\"<style>\\n header.bold {\\n   font-weight: bold;\\n }\\n input.error {\\n   background-color: pink;\\n }\\n p.smallHint {\\n   color: #aaa;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Inscription</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <div class='w3-margin-top w3-padding'>\\n    <header class='w3-center w3-large bold'>\\n      Inscription à CodeGradX\\n      <span class='w3-right w3-margin-left w3-xlarge'\\n            on:click={showHelp}>&#x1f6c8;</span>\\n    </header>\\n\\n    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}\\n\\n    <p class='smallHint'>\\n      Indiquez votre courriel (qui deviendra votre nom de connexion\\n      définitif et immuable) puis résolvez la Captcha.\\n    </p>\\n\\n    <div class=\\\"w3-margin-top\\\">\\n      <label for=\\\"login\\\">Votre courriel:</label>\\n      <input type=\\\"text\\\" bind:value={login} name='login'\\n             class:error={errorLogin} class=\\\"w3-input\\\"\\n             on:keyup={hideproblem}\\n             on:click={hideproblem}\\n             placeholder=\\\"{defaultlogin}\\\" />\\n    </div>\\n  </div>\\n\\n  <MoveCaptcha on:ready={setCaptcha}\\n               on:change={captchaChanged}\\n               on:timeout={captchaTimeout}\\n               on:complete={setCaptchaComplete} />\\n\\n  <div class=\\\"w3-center w3-margin-top\\\">\\n    <button class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n            name=\\\"enroll\\\"\\n            on:click={enroll}>\\n      Je m'inscris!\\n    </button>\\n    {#if showRefresh}\\n    <button class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n            title=\\\"Rafraîchir la captcha...\\\"\\n            on:click={captchaRefresh} >\\n      <RefreshSign color='white' size='2em' />\\n    </button>\\n    {/if}\\n  </div>\\n\\n  {#if error}<Problem bind:error={error} />{/if}\\n\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import MoveCaptcha from '../components/MoveCaptcha.svelte';\\n import RefreshSign from '../components/RefreshSign.svelte';\\n import ConnectDoc from '../components/ConnectDoc.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { getConfig, initializePerson } from '../client/lib.mjs';\\n\\n let login = undefined;\\n let defaultlogin = 'mon.email@a.moi';\\n let error = undefined;\\n let errorLogin = false;\\n let helpshown = false;\\n let captcha = null;\\n let captchaComplete = false;\\n let filledBoxes = 0;\\n let showRefresh = false;\\n\\n function hideproblem (event) {\\n   error = errorLogin = undefined;\\n }\\n\\n onMount(async () => {\\n   return initializePerson();\\n });\\n\\n async function enroll (event) {\\n   hideproblem();\\n   if ( ! login || login === '' ) {\\n     errorLogin = error = \\\"Quel est votre courriel ?\\\";\\n     return;\\n   }\\n   // A real email is required to enroll someone!\\n   if ( ! checkEmail(login) ) {\\n     errorLogin = error = \\\"Votre courriel a l'air mal formé!\\\";\\n     return;\\n   }\\n   let state = CodeGradX.getCurrentState();\\n   try {\\n     if ( captchaComplete ) {\\n       let captchaResponse = captcha.getResponse();\\n       if ( captchaResponse ) {\\n         //console.log(captchaResponse);//DEBUG\\n         try {\\n           $person = await state.userEnroll(login, captchaResponse);\\n           sapper.goto(`/resume/${$person.token}`);\\n         } catch (exc) {\\n           error = \\\"Mauvaise réponse!\\\";\\n         }\\n       } else {\\n         throw new Error(\\\"void captchaResponse\\\");\\n       }\\n     } else {\\n       error = \\\"Vous n'avez pas fini de résoudre la Captcha!\\\";\\n     }\\n   } catch (exc) {\\n     console.log({exc});\\n     console.log(state.log);\\n     throw exc;\\n   }\\n }\\n\\n function captchaChanged (event) {\\n   // A change occurred in the captcha\\n   let o = event.detail;\\n   captcha = o.captcha;\\n   filledBoxes = o.count;\\n   hideproblem();\\n   if ( ! checkEmail(login) ) {\\n     errorLogin = error = \\\"Votre courriel a l'air mal formé!\\\";\\n   }\\n }\\n \\n function setCaptcha (event) {\\n   // Means that the captcha is visible although, perhaps, not yet solved.\\n   // event.detail is a captcha object with a getResponse method.\\n   captcha = event.detail;\\n   filledBoxes = 0;\\n   captchaComplete = false;\\n   showRefresh = false;\\n }\\n\\n function setCaptchaComplete (event) {\\n   // Means that the captcha was filled (and perhaps solved):\\n   // event.detail is a boolean.\\n   let o = event.detail;\\n   captcha = o.captcha;\\n   captchaComplete = o.complete;\\n }\\n\\n function captchaTimeout (event) {\\n   let o = event.detail;\\n   captcha = o.captcha;\\n   showRefresh = true;\\n   if ( ! checkEmail(login) ) {\\n     errorLogin = error = \\\"Votre courriel a l'air mal formé!\\\";\\n   }\\n }\\n\\n function captchaRefresh (event) {\\n   if ( captcha ) {\\n     captcha.refresh();\\n   }\\n   showRefresh = false;\\n }\\n\\n function showHelp (event) {\\n   helpshown = true;\\n }\\n\\n const emailregexp = /^(([^<>()\\\\[\\\\]\\\\\\\\.,;:\\\\s@\\\"]+(\\\\.[^<>()\\\\[\\\\]\\\\\\\\.,;:\\\\s@\\\"]+)*)|(\\\".+\\\"))@(([a-zA-Z\\\\-0-9]+\\\\.)+[a-zA-Z]{2,})$/;\\n\\n function checkEmail (s) {\\n   s = s || '';\\n   s = s.replace(/[^a-z@._]/g, '');\\n   return s.match(emailregexp);\\n }\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,KAAK,cAAC,CAAC,AACX,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,KAAK,MAAM,cAAC,CAAC,AACX,gBAAgB,CAAE,IAAI,AACxB,CAAC,AACD,CAAC,UAAU,cAAC,CAAC,AACX,KAAK,CAAE,IAAI,AACb,CAAC\"}"
};

let defaultlogin$1 = "mon.email@a.moi";

const Enroll = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => value);
	person.subscribe($$value => $$value);
	let login = undefined;

	onMount(async () => {
		return initializePerson();
	});

	$$result.css.add(css$a);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/Inscription</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><div class="${"w3-margin-top w3-padding"}"><header class="${"w3-center w3-large bold svelte-q6rd9e"}">Inscription à CodeGradX
      <span class="${"w3-right w3-margin-left w3-xlarge"}">🛈</span></header>

    ${ ``}

    <p class="${"smallHint svelte-q6rd9e"}">Indiquez votre courriel (qui deviendra votre nom de connexion
      définitif et immuable) puis résolvez la Captcha.
    </p>

    <div class="${"w3-margin-top"}"><label for="${"login"}">Votre courriel:</label>
      <input type="${"text"}" name="${"login"}" class="${["w3-input svelte-q6rd9e",  ""].join(" ").trim()}"${add_attribute("placeholder", defaultlogin$1, 0)}${add_attribute("value", login, 1)}></div></div>

  ${validate_component(MoveCaptcha, "MoveCaptcha").$$render($$result, {}, {}, {})}

  <div class="${"w3-center w3-margin-top"}"><button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}" name="${"enroll"}">Je m&#39;inscris!
    </button>
    ${ ``}</div>

  ${ ``}</section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_6 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Enroll
});

/* src/routes/resume/[token].svelte generated by Svelte v3.31.2 */

const css$b = {
	code: ".personName.svelte-i8s1l7{color:#334191;padding:0.1em 0.5em 0.1em 0.5em;border-radius:0.5em;border:solid 1px #334191}",
	map: "{\"version\":3,\"file\":\"[token].svelte\",\"sources\":[\"[token].svelte\"],\"sourcesContent\":[\"<style>\\n .personName {\\n   color: #334191;\\n   padding: 0.1em 0.5em 0.1em 0.5em;\\n   border-radius: 0.5em;\\n   border: solid 1px #334191;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/CourrielConfirmé</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <p> Bonjour {#if $person}<span class='personName'>{$person.email}</span>\\n    {/if}</p>\\n  <p> J'attends donc que vous cliquiez sur le lien qui vient de vous être\\n    envoyé par courriel. </p>\\n\\n  {#if error}<Problem bind:error={error} />{/if}\\n  \\n  {#if $person}\\n    {#if $person.confirmedua === $person.uaversion}\\n    <p> Vous avez déjà signé les conditions d'usage. </p>\\n    {:else}\\n    <p> Vous n'avez pas encore signé les conditions d'usage. </p>\\n    {/if}\\n  {/if}\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../../components/Header.svelte';\\n import Problem from '../../components/Problem.svelte';\\n import ShowStore from '../../components/ShowStore.svelte';\\n import Bottom from '../../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { determineNextUserState } from '../../client/lib.mjs';\\n\\n let error = undefined;\\n\\n onMount(async () => {\\n   try {\\n     const response = await CodeGradX.getCurrentState().sendAXServer('x', {\\n       path: `/fromp${location.pathname}`,\\n       method: 'GET',\\n       headers: {\\n         'Accept': 'application/json',\\n         'Content-Type': 'application/x-www-form-urlencoded'\\n       }\\n     });\\n     if ( response.ok ) {\\n       $person = new CodeGradX.User(response.entity);\\n       const href = await determineNextUserState($person);\\n       const where = document.location.pathname.replace(/^.*(\\\\/\\\\w+)/, '$1');\\n       if ( href && href !== where ) {\\n         console.log(`From ${where}: goto ${href}`);\\n         return sapper.goto(href);\\n       }\\n     } else {\\n       error = \\\"probleme\\\";\\n     }\\n   } catch (exc) {\\n     console.log({exc});//DEBUG\\n   }\\n });\\n \\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,WAAW,cAAC,CAAC,AACX,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,CAChC,aAAa,CAAE,KAAK,CACpB,MAAM,CAAE,KAAK,CAAC,GAAG,CAAC,OAAO,AAC3B,CAAC\"}"
};

const U5Btokenu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);
	let error = undefined;

	onMount(async () => {
		try {
			const response = await codegradx.CodeGradX.getCurrentState().sendAXServer("x", {
				path: `/fromp${location.pathname}`,
				method: "GET",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});

			if (response.ok) {
				set_store_value(person, $person = new codegradx.CodeGradX.User(response.entity), $person);
				const href = await determineNextUserState($person);
				const where = document.location.pathname.replace(/^.*(\/\w+)/, "$1");

				if (href && href !== where) {
					console.log(`From ${where}: goto ${href}`);
					return goto(href);
				}
			} else {
				error = "probleme";
			}
		} catch(exc) {
			console.log({ exc }); //DEBUG
		}
	});

	$$result.css.add(css$b);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/CourrielConfirmé</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><p>Bonjour ${$person
		? `<span class="${"personName svelte-i8s1l7"}">${escape($person.email)}</span>
    `
		: ``}</p>
  <p>J&#39;attends donc que vous cliquiez sur le lien qui vient de vous être
    envoyé par courriel. </p>

  ${error
		? `${validate_component(Problem, "Problem").$$render(
				$$result,
				{ error },
				{
					error: $$value => {
						error = $$value;
						$$settled = false;
					}
				},
				{}
			)}`
		: ``}
  
  ${$person
		? `${$person.confirmedua === $person.uaversion
			? `<p>Vous avez déjà signé les conditions d&#39;usage. </p>`
			: `<p>Vous n&#39;avez pas encore signé les conditions d&#39;usage. </p>`}`
		: ``}</section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_7 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': U5Btokenu5D
});

/* src/components/UA.svelte generated by Svelte v3.31.2 */

const UA = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let ua = undefined;

	onMount(async () => {
		return initializePerson().then(async () => {
			ua = await getUA();
		});
	});

	async function getUA() {
		try {
			const response = await codegradx.CodeGradX.getCurrentState().sendAXServer("x", {
				path: "/fromp/getua?lang=fr",
				method: "GET",
				headers: {
					"Accept": "text/html",
					"Content-Type": "application/x-www-form-urlencoded"
				}
			});

			if (response.ok) {
				return response.entity;
			} else {
				return "Problème d'accès au serveur!";
			}
		} catch(exc) {
			console.log({ exc }); //DEBUG
		}
	}

	return `${ua
	? `<section class="${"w3-card-4 w3-margin"}"><header class="${"w3-xlarge w3-center w3-theme-d2"}">Conditions d&#39;utilisation
  </header>
  <div class="${"w3-margin w3-padding-bottom"}">${ua}</div></section>`
	: ``}`;
});

/* src/routes/signua.svelte generated by Svelte v3.31.2 */

const Signua = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => value);
	person.subscribe($$value => $$value);

	onMount(async () => {
		return initializePerson();
	});

	$$unsubscribe_person();

	return `${($$result.head += `${($$result.title = `<title>CodeGradX/ConditionsUsage</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><p>Votre adresse électronique est maintenant confirmée. </p>
  <p>Vous pouvez maintenant finaliser votre inscription en prenant
    connaissance des dispositions légales quant à votre usage de
    l&#39;infrastructure CodeGradX. Si vous êtes d&#39;accord avec ces conditions
    d&#39;usage, n&#39;oubliez pas de les accepter en bas de page.
  </p>
  <p>Accepter ces conditions d&#39;usage c&#39;est, en très gros, accepter de
    donner ses programmes à la science afin d&#39;aider les auteurs
    à améliorer leurs exercices.
  </p></section>

${validate_component(UA, "UA").$$render($$result, {}, {}, {})}

<div class="${"w3-container w3-center w3-margin-bottom"}"><button class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">J&#39;accepte ces conditions!
  </button></div>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
});

var component_8 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Signua
});

/* src/routes/whoami.svelte generated by Svelte v3.31.2 */

const css$c = {
	code: ".personName.svelte-3wk50w{color:#334191;padding:0.1em 0.5em 0.1em 0.5em;margin:0em 0.1em 0em 0.1em;border-radius:0.5em;border:solid 1px #334191}.bold.svelte-3wk50w{font-weight:bolder}tr.inactive.svelte-3wk50w{background-color:#eee}",
	map: "{\"version\":3,\"file\":\"whoami.svelte\",\"sources\":[\"whoami.svelte\"],\"sourcesContent\":[\"<style>\\n .personName {\\n   color: #334191;\\n   padding: 0.1em 0.5em 0.1em 0.5em;\\n   margin: 0em 0.1em 0em 0.1em;\\n   border-radius: 0.5em;\\n   border: solid 1px #334191;\\n }\\n .bold {\\n   font-weight: bolder;\\n }\\n tr.inactive {\\n   background-color: #eee;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Profil</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <div class='w3-margin-top w3-padding'>\\n    <header class='w3-center w3-large bold'>\\n      Mes informations\\n    </header>\\n\\n    {#if $person}\\n    <div class='w3-container w3-padding'>\\n      <p> Votre adresse électronique est\\n        <span class='personName'>{$person.email}</span>\\n        {#if $person.confirmedemail}(vous l'avez confirmée){/if}</p>\\n      {#if $person.confirmedua === $person.uaversion}\\n      <p> Vous avez signé les conditions d'usage (v{$person.confirmedua})</p>\\n      {:else}\\n      <p> Vous n'avez pas encore signé les conditions d'usage </p>\\n      {/if}\\n      <p> Votre nom est \\n        <span class=\\\"personName\\\">{$person.lastname}</span>\\n        votre prénom est\\n        <span class=\\\"personName\\\">{$person.firstname}</span>\\n        et votre pseudo est\\n        <span class=\\\"personName\\\">{$person.pseudo}</span></p>\\n      <p> Votre nom de connexion est\\n        <span class=\\\"personName\\\">{$person.login}</span></p>\\n      {#if $person.logins.length > 1}\\n      <p> Vos autres noms de connexions sont:</p>\\n      <ul>\\n        {#each $person.logins as login}\\n        <li><span class='personName'>{login}</span></li>\\n        {/each}\\n      </ul>\\n      {/if}\\n      {#if $person.admin}<p> Vous êtes administrateur </p>{/if}\\n      {#if $person.isauthor}\\n      <p> Vous êtes auteur et vos préfixes possibles sont:</p>\\n      <ul>\\n        {#each $person.authorprefixes as prefix}\\n        <li><span class='personName'>{prefix}</span></li>\\n        {/each}\\n      </ul>\\n      {/if}\\n      {#if $person.campaigns.length > 0 }\\n      <p> Vous êtes déjà inscrit dans les univers suivants:</p>\\n      <table class='w3-table w3-border w3-hoverable'>\\n        <tr class='w3-theme-d2'><th>Univers</th><th></th>\\n          <th class='w3-hide-small'>Début</th>\\n          <th class='w3-hide-small'>Fin</th></tr>\\n        {#each $person.campaigns as campaign}\\n        <tr class:inactive={! campaign.active}>\\n          <td><a href='{campaign.home_url}' title={campaign.title}>\\n            {campaign.name}</a>\\n            <span class='w3-right'>{#if campaign.isTeacher}\\n              <span title=\\\"Vous êtes enseignant\\\">🎓</span>{/if}</span></td>\\n          <td>{campaign.title}</td>\\n          <td class='w3-hide-small'>\\n            {campaign.starttime.replace(/T.*$/, '')}</td>\\n          <td class='w3-hide-small'>\\n            {campaign.endtime.replace(/T.*$/, '')}</td></tr>\\n        {/each}\\n      </table>\\n      {/if}\\n        \\n      \\n    </div>\\n        \\n    {:else}\\n    {#if error}<Problem bind:error={error} />{/if}\\n    {/if}\\n\\n  </div>\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import ConnectDoc from '../components/ConnectDoc.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { initializePerson } from '../client/lib.mjs';\\n\\n let error = undefined;\\n\\n onMount(async () => {\\n   if ( ! $person ) {\\n     $person = await CodeGradX.getCurrentUser();\\n   }\\n   if ( ! $person ) {\\n     error = \\\"Désolé, je ne vous connais pas!\\\";\\n   }\\n });\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,WAAW,cAAC,CAAC,AACX,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,KAAK,CAAC,KAAK,CAAC,KAAK,CAAC,KAAK,CAChC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,GAAG,CAAC,KAAK,CAC3B,aAAa,CAAE,KAAK,CACpB,MAAM,CAAE,KAAK,CAAC,GAAG,CAAC,OAAO,AAC3B,CAAC,AACD,KAAK,cAAC,CAAC,AACL,WAAW,CAAE,MAAM,AACrB,CAAC,AACD,EAAE,SAAS,cAAC,CAAC,AACX,gBAAgB,CAAE,IAAI,AACxB,CAAC\"}"
};

const Whoami = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $person, $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => $person = value);
	person.subscribe($$value => $person = $$value);
	let error = undefined;

	onMount(async () => {
		if (!$person) {
			set_store_value(person, $person = await codegradx.CodeGradX.getCurrentUser(), $person);
		}

		if (!$person) {
			error = "Désolé, je ne vous connais pas!";
		}
	});

	$$result.css.add(css$c);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/Profil</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><div class="${"w3-margin-top w3-padding"}"><header class="${"w3-center w3-large bold svelte-3wk50w"}">Mes informations
    </header>

    ${$person
		? `<div class="${"w3-container w3-padding"}"><p>Votre adresse électronique est
        <span class="${"personName svelte-3wk50w"}">${escape($person.email)}</span>
        ${$person.confirmedemail
			? `(vous l&#39;avez confirmée)`
			: ``}</p>
      ${$person.confirmedua === $person.uaversion
			? `<p>Vous avez signé les conditions d&#39;usage (v${escape($person.confirmedua)})</p>`
			: `<p>Vous n&#39;avez pas encore signé les conditions d&#39;usage </p>`}
      <p>Votre nom est 
        <span class="${"personName svelte-3wk50w"}">${escape($person.lastname)}</span>
        votre prénom est
        <span class="${"personName svelte-3wk50w"}">${escape($person.firstname)}</span>
        et votre pseudo est
        <span class="${"personName svelte-3wk50w"}">${escape($person.pseudo)}</span></p>
      <p>Votre nom de connexion est
        <span class="${"personName svelte-3wk50w"}">${escape($person.login)}</span></p>
      ${$person.logins.length > 1
			? `<p>Vos autres noms de connexions sont:</p>
      <ul>${each($person.logins, login => `<li><span class="${"personName svelte-3wk50w"}">${escape(login)}</span></li>`)}</ul>`
			: ``}
      ${$person.admin ? `<p>Vous êtes administrateur </p>` : ``}
      ${$person.isauthor
			? `<p>Vous êtes auteur et vos préfixes possibles sont:</p>
      <ul>${each($person.authorprefixes, prefix => `<li><span class="${"personName svelte-3wk50w"}">${escape(prefix)}</span></li>`)}</ul>`
			: ``}
      ${$person.campaigns.length > 0
			? `<p>Vous êtes déjà inscrit dans les univers suivants:</p>
      <table class="${"w3-table w3-border w3-hoverable"}"><tr class="${"w3-theme-d2"}"><th>Univers</th><th></th>
          <th class="${"w3-hide-small"}">Début</th>
          <th class="${"w3-hide-small"}">Fin</th></tr>
        ${each($person.campaigns, campaign => `<tr class="${["svelte-3wk50w", !campaign.active ? "inactive" : ""].join(" ").trim()}"><td><a${add_attribute("href", campaign.home_url, 0)}${add_attribute("title", campaign.title, 0)}>${escape(campaign.name)}</a>
            <span class="${"w3-right"}">${campaign.isTeacher
				? `
              <span title="${"Vous êtes enseignant"}">🎓</span>`
				: ``}</span></td>
          <td>${escape(campaign.title)}</td>
          <td class="${"w3-hide-small"}">${escape(campaign.starttime.replace(/T.*$/, ""))}</td>
          <td class="${"w3-hide-small"}">${escape(campaign.endtime.replace(/T.*$/, ""))}</td></tr>`)}</table>`
			: ``}</div>`
		: `${error
			? `${validate_component(Problem, "Problem").$$render(
					$$result,
					{ error },
					{
						error: $$value => {
							error = $$value;
							$$settled = false;
						}
					},
					{}
				)}`
			: ``}`}</div></section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_9 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Whoami
});

/* src/routes/login.svelte generated by Svelte v3.31.2 */

const css$d = {
	code: "header.bold.svelte-q6rd9e{font-weight:bold}input.error.svelte-q6rd9e{background-color:pink}p.smallHint.svelte-q6rd9e{color:#aaa}",
	map: "{\"version\":3,\"file\":\"login.svelte\",\"sources\":[\"login.svelte\"],\"sourcesContent\":[\"<style>\\n header.bold {\\n   font-weight: bold;\\n }\\n input.error {\\n   background-color: pink;\\n }\\n p.smallHint {\\n   color: #aaa;\\n }\\n</style>\\n\\n<svelte:head>\\n  <title>CodeGradX/Identification</title>\\n</svelte:head>\\n\\n<Header />\\n\\n<section class='w3-container'>\\n  <div class='w3-card-4 w3-margin-top w3-padding'>\\n    <header class='w3-center w3-large bold'>\\n      Qui êtes vous ?\\n      <span class='w3-right w3-margin-left w3-xlarge'\\n            on:click={showHelp}>&#x1f6c8;</span>\\n    </header>\\n\\n    {#if helpshown}<ConnectDoc bind:helpshown={helpshown} />{/if}\\n    \\n    <p class='smallHint'>\\n      Renseignez votre nom de connexion et votre mot de passe:\\n    </p>\\n    <div class=\\\"w3-margin-top\\\">\\n      <label for=\\\"login\\\">Votre courriel:</label>\\n      <input type=\\\"text\\\" bind:value={login} name='login'\\n             class:error={errorLogin} class=\\\"w3-input\\\"\\n             on:keyup={hideproblem}\\n             on:click={hideproblem}\\n             placeholder=\\\"{defaultlogin}\\\" />\\n    </div>\\n    <div class=\\\"w3-margin-top\\\" >\\n      <label for=\\\"password\\\">Votre mot de passe:</label>\\n      <input type=\\\"password\\\" bind:value={password} name='password'\\n             class:error={errorPassword} class=\\\"w3-input\\\"\\n             on:keyup={hideproblem}\\n             on:click={hideproblem}\\n             placeholder=\\\"{defaultpassword}\\\" />\\n    </div>\\n  </div>\\n\\n  {#if error}<Problem bind:error={error} />{/if}\\n\\n  <div class=\\\"w3-center w3-margin-top\\\">\\n    <button type=\\\"submit\\\" name=\\\"signin\\\" \\n            class=\\\"w3-btn w3-theme-d1 w3-round-xxlarge\\\"\\n            on:click={authenticate}>\\n      Je m'identifie!\\n    </button>\\n  </div>\\n</section>\\n\\n<Bottom />\\n\\n<script>\\n import Header from '../components/Header.svelte';\\n import Problem from '../components/Problem.svelte';\\n import ConnectDoc from '../components/ConnectDoc.svelte';\\n import Bottom from '../components/Bottom.svelte';\\n\\n import * as sapper from '@sapper/app';\\n import { onMount } from 'svelte';\\n import { person } from '../stores.mjs';\\n import { CodeGradX } from 'codegradx';\\n import { getConfig, initializePerson } from '../client/lib.mjs';\\n\\n let login = undefined;\\n let password = undefined;\\n let defaultlogin = 'mon.email@a.moi';\\n let defaultpassword = '***';\\n let error = undefined;\\n let errorLogin = false;\\n let errorPassword = false;\\n let helpshown = false;\\n\\n function hideproblem (event) {\\n   error = errorLogin = errorPassword = undefined;\\n }\\n\\n onMount(async () => {\\n   return initializePerson();\\n });\\n\\n async function authenticate (event) {\\n   hideproblem();\\n   let showError = ''\\n   if ( ! login || login === '' ) {\\n     errorLogin = error = \\\"Quel est votre courriel ?\\\";\\n     showError += error;\\n   }\\n   if ( ! password || password === '' ) {\\n     errorPassword = error = \\\"Quel est votre mot de passe ?\\\";\\n     showError += ' ' + error;\\n   }\\n   if ( showError ) {\\n     error = showError;\\n     return;\\n   }\\n   try {\\n     $person = await CodeGradX\\n           .getCurrentState()\\n           .getAuthenticatedUser(login, password);\\n     if ( $person ) {\\n       sapper.goto('/universes');\\n     }\\n   } catch (exc) {\\n     error = 'Courriel ou mot de passe incorrect!';\\n   }\\n }\\n\\n function showHelp (event) {\\n   helpshown = true;\\n }\\n\\n</script>\\n\"],\"names\":[],\"mappings\":\"AACC,MAAM,KAAK,cAAC,CAAC,AACX,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,KAAK,MAAM,cAAC,CAAC,AACX,gBAAgB,CAAE,IAAI,AACxB,CAAC,AACD,CAAC,UAAU,cAAC,CAAC,AACX,KAAK,CAAE,IAAI,AACb,CAAC\"}"
};

let defaultlogin$2 = "mon.email@a.moi";
let defaultpassword = "***";

const Login = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	let $$unsubscribe_person;
	$$unsubscribe_person = subscribe(person, value => value);
	person.subscribe($$value => $$value);
	let login = undefined;
	let password = undefined;

	onMount(async () => {
		return initializePerson();
	});

	$$result.css.add(css$d);
	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `${($$result.title = `<title>CodeGradX/Identification</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><div class="${"w3-card-4 w3-margin-top w3-padding"}"><header class="${"w3-center w3-large bold svelte-q6rd9e"}">Qui êtes vous ?
      <span class="${"w3-right w3-margin-left w3-xlarge"}">🛈</span></header>

    ${ ``}
    
    <p class="${"smallHint svelte-q6rd9e"}">Renseignez votre nom de connexion et votre mot de passe:
    </p>
    <div class="${"w3-margin-top"}"><label for="${"login"}">Votre courriel:</label>
      <input type="${"text"}" name="${"login"}" class="${["w3-input svelte-q6rd9e",  ""].join(" ").trim()}"${add_attribute("placeholder", defaultlogin$2, 0)}${add_attribute("value", login, 1)}></div>
    <div class="${"w3-margin-top"}"><label for="${"password"}">Votre mot de passe:</label>
      <input type="${"password"}" name="${"password"}" class="${["w3-input svelte-q6rd9e",  ""].join(" ").trim()}"${add_attribute("placeholder", defaultpassword, 0)}${add_attribute("value", password, 1)}></div></div>

  ${ ``}

  <div class="${"w3-center w3-margin-top"}"><button type="${"submit"}" name="${"signin"}" class="${"w3-btn w3-theme-d1 w3-round-xxlarge"}">Je m&#39;identifie!
    </button></div></section>

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
	} while (!$$settled);

	$$unsubscribe_person();
	return $$rendered;
});

var component_10 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Login
});

/* src/routes/ua.svelte generated by Svelte v3.31.2 */

const Ua = create_ssr_component(($$result, $$props, $$bindings, slots) => {
	return `${($$result.head += `${($$result.title = `<title>CodeGradX/ConditionsUsage</title>`, "")}`, "")}

${validate_component(Header, "Header").$$render($$result, {}, {}, {})}

<section class="${"w3-container"}"><p>Vous pouvez maintenant finaliser votre inscription en prenant
    connaissance des dispositions légales quant à votre usage de
    l&#39;infrastructure CodeGradX. Si vous êtes d&#39;accord avec ces conditions
    d&#39;usage, n&#39;oubliez pas de les accepter en bas de page.
  </p>
  <p>Accepter ces conditions d&#39;usage c&#39;est, en très gros, accepter de
    donner ses programmes à la science afin d&#39;aider les auteurs
    à améliorer leurs exercices.
  </p></section>

${validate_component(UA, "UA").$$render($$result, {}, {}, {})}

${validate_component(Bottom, "Bottom").$$render($$result, {}, {}, {})}`;
});

var component_11 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': Ua
});

// This file is generated by Sapper — do not edit it!

const d = decodeURIComponent;

const manifest = {
	server_routes: [
		{
			// digit/[slug].js
			pattern: /^\/digit\/([^/]+?)\/?$/,
			handlers: route_0,
			params: match => ({ slug: d(match[1]) })
		},

		{
			// api/signupinit.json.js
			pattern: /^\/api\/signupinit\.json$/,
			handlers: route_1,
			params: () => ({})
		}
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: component_0 }
			]
		},

		{
			// lostpassword.svelte
			pattern: /^\/lostpassword\/?$/,
			parts: [
				{ name: "lostpassword", file: "lostpassword.svelte", component: component_1 }
			]
		},

		{
			// universes.svelte
			pattern: /^\/universes\/?$/,
			parts: [
				{ name: "universes", file: "universes.svelte", component: component_2 }
			]
		},

		{
			// mailsent.svelte
			pattern: /^\/mailsent\/?$/,
			parts: [
				{ name: "mailsent", file: "mailsent.svelte", component: component_3 }
			]
		},

		{
			// sendmail.svelte
			pattern: /^\/sendmail\/?$/,
			parts: [
				{ name: "sendmail", file: "sendmail.svelte", component: component_4 }
			]
		},

		{
			// connect.svelte
			pattern: /^\/connect\/?$/,
			parts: [
				{ name: "connect", file: "connect.svelte", component: component_5 }
			]
		},

		{
			// enroll.svelte
			pattern: /^\/enroll\/?$/,
			parts: [
				{ name: "enroll", file: "enroll.svelte", component: component_6 }
			]
		},

		{
			// resume/[token].svelte
			pattern: /^\/resume\/([^/]+?)\/?$/,
			parts: [
				null,
				{ name: "resume_$token", file: "resume/[token].svelte", component: component_7, params: match => ({ token: d(match[1]) }) }
			]
		},

		{
			// signua.svelte
			pattern: /^\/signua\/?$/,
			parts: [
				{ name: "signua", file: "signua.svelte", component: component_8 }
			]
		},

		{
			// whoami.svelte
			pattern: /^\/whoami\/?$/,
			parts: [
				{ name: "whoami", file: "whoami.svelte", component: component_9 }
			]
		},

		{
			// login.svelte
			pattern: /^\/login\/?$/,
			parts: [
				{ name: "login", file: "login.svelte", component: component_10 }
			]
		},

		{
			// ua.svelte
			pattern: /^\/ua\/?$/,
			parts: [
				{ name: "ua", file: "ua.svelte", component: component_11 }
			]
		}
	],

	root_comp,
	error: Error$1
};

const build_dir = "./__sapper__/build";

/**
 * @param typeMap [Object] Map of MIME type -> Array[extensions]
 * @param ...
 */
function Mime() {
  this._types = Object.create(null);
  this._extensions = Object.create(null);

  for (var i = 0; i < arguments.length; i++) {
    this.define(arguments[i]);
  }

  this.define = this.define.bind(this);
  this.getType = this.getType.bind(this);
  this.getExtension = this.getExtension.bind(this);
}

/**
 * Define mimetype -> extension mappings.  Each key is a mime-type that maps
 * to an array of extensions associated with the type.  The first extension is
 * used as the default extension for the type.
 *
 * e.g. mime.define({'audio/ogg', ['oga', 'ogg', 'spx']});
 *
 * If a type declares an extension that has already been defined, an error will
 * be thrown.  To suppress this error and force the extension to be associated
 * with the new type, pass `force`=true.  Alternatively, you may prefix the
 * extension with "*" to map the type to extension, without mapping the
 * extension to the type.
 *
 * e.g. mime.define({'audio/wav', ['wav']}, {'audio/x-wav', ['*wav']});
 *
 *
 * @param map (Object) type definitions
 * @param force (Boolean) if true, force overriding of existing definitions
 */
Mime.prototype.define = function(typeMap, force) {
  for (var type in typeMap) {
    var extensions = typeMap[type].map(function(t) {return t.toLowerCase()});
    type = type.toLowerCase();

    for (var i = 0; i < extensions.length; i++) {
      var ext = extensions[i];

      // '*' prefix = not the preferred type for this extension.  So fixup the
      // extension, and skip it.
      if (ext[0] == '*') {
        continue;
      }

      if (!force && (ext in this._types)) {
        throw new Error(
          'Attempt to change mapping for "' + ext +
          '" extension from "' + this._types[ext] + '" to "' + type +
          '". Pass `force=true` to allow this, otherwise remove "' + ext +
          '" from the list of extensions for "' + type + '".'
        );
      }

      this._types[ext] = type;
    }

    // Use first extension as default
    if (force || !this._extensions[type]) {
      var ext = extensions[0];
      this._extensions[type] = (ext[0] != '*') ? ext : ext.substr(1);
    }
  }
};

/**
 * Lookup a mime type based on extension
 */
Mime.prototype.getType = function(path) {
  path = String(path);
  var last = path.replace(/^.*[/\\]/, '').toLowerCase();
  var ext = last.replace(/^.*\./, '').toLowerCase();

  var hasPath = last.length < path.length;
  var hasDot = ext.length < last.length - 1;

  return (hasDot || !hasPath) && this._types[ext] || null;
};

/**
 * Return file extension associated with a mime type
 */
Mime.prototype.getExtension = function(type) {
  type = /^\s*([^;\s]*)/.test(type) && RegExp.$1;
  return type && this._extensions[type.toLowerCase()] || null;
};

var Mime_1 = Mime;

var standard = {"application/andrew-inset":["ez"],"application/applixware":["aw"],"application/atom+xml":["atom"],"application/atomcat+xml":["atomcat"],"application/atomdeleted+xml":["atomdeleted"],"application/atomsvc+xml":["atomsvc"],"application/atsc-dwd+xml":["dwd"],"application/atsc-held+xml":["held"],"application/atsc-rsat+xml":["rsat"],"application/bdoc":["bdoc"],"application/calendar+xml":["xcs"],"application/ccxml+xml":["ccxml"],"application/cdfx+xml":["cdfx"],"application/cdmi-capability":["cdmia"],"application/cdmi-container":["cdmic"],"application/cdmi-domain":["cdmid"],"application/cdmi-object":["cdmio"],"application/cdmi-queue":["cdmiq"],"application/cu-seeme":["cu"],"application/dash+xml":["mpd"],"application/davmount+xml":["davmount"],"application/docbook+xml":["dbk"],"application/dssc+der":["dssc"],"application/dssc+xml":["xdssc"],"application/ecmascript":["ecma","es"],"application/emma+xml":["emma"],"application/emotionml+xml":["emotionml"],"application/epub+zip":["epub"],"application/exi":["exi"],"application/fdt+xml":["fdt"],"application/font-tdpfr":["pfr"],"application/geo+json":["geojson"],"application/gml+xml":["gml"],"application/gpx+xml":["gpx"],"application/gxf":["gxf"],"application/gzip":["gz"],"application/hjson":["hjson"],"application/hyperstudio":["stk"],"application/inkml+xml":["ink","inkml"],"application/ipfix":["ipfix"],"application/its+xml":["its"],"application/java-archive":["jar","war","ear"],"application/java-serialized-object":["ser"],"application/java-vm":["class"],"application/javascript":["js","mjs"],"application/json":["json","map"],"application/json5":["json5"],"application/jsonml+json":["jsonml"],"application/ld+json":["jsonld"],"application/lgr+xml":["lgr"],"application/lost+xml":["lostxml"],"application/mac-binhex40":["hqx"],"application/mac-compactpro":["cpt"],"application/mads+xml":["mads"],"application/manifest+json":["webmanifest"],"application/marc":["mrc"],"application/marcxml+xml":["mrcx"],"application/mathematica":["ma","nb","mb"],"application/mathml+xml":["mathml"],"application/mbox":["mbox"],"application/mediaservercontrol+xml":["mscml"],"application/metalink+xml":["metalink"],"application/metalink4+xml":["meta4"],"application/mets+xml":["mets"],"application/mmt-aei+xml":["maei"],"application/mmt-usd+xml":["musd"],"application/mods+xml":["mods"],"application/mp21":["m21","mp21"],"application/mp4":["mp4s","m4p"],"application/mrb-consumer+xml":["*xdf"],"application/mrb-publish+xml":["*xdf"],"application/msword":["doc","dot"],"application/mxf":["mxf"],"application/n-quads":["nq"],"application/n-triples":["nt"],"application/node":["cjs"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/oda":["oda"],"application/oebps-package+xml":["opf"],"application/ogg":["ogx"],"application/omdoc+xml":["omdoc"],"application/onenote":["onetoc","onetoc2","onetmp","onepkg"],"application/oxps":["oxps"],"application/p2p-overlay+xml":["relo"],"application/patch-ops-error+xml":["*xer"],"application/pdf":["pdf"],"application/pgp-encrypted":["pgp"],"application/pgp-signature":["asc","sig"],"application/pics-rules":["prf"],"application/pkcs10":["p10"],"application/pkcs7-mime":["p7m","p7c"],"application/pkcs7-signature":["p7s"],"application/pkcs8":["p8"],"application/pkix-attr-cert":["ac"],"application/pkix-cert":["cer"],"application/pkix-crl":["crl"],"application/pkix-pkipath":["pkipath"],"application/pkixcmp":["pki"],"application/pls+xml":["pls"],"application/postscript":["ai","eps","ps"],"application/provenance+xml":["provx"],"application/pskc+xml":["pskcxml"],"application/raml+yaml":["raml"],"application/rdf+xml":["rdf","owl"],"application/reginfo+xml":["rif"],"application/relax-ng-compact-syntax":["rnc"],"application/resource-lists+xml":["rl"],"application/resource-lists-diff+xml":["rld"],"application/rls-services+xml":["rs"],"application/route-apd+xml":["rapd"],"application/route-s-tsid+xml":["sls"],"application/route-usd+xml":["rusd"],"application/rpki-ghostbusters":["gbr"],"application/rpki-manifest":["mft"],"application/rpki-roa":["roa"],"application/rsd+xml":["rsd"],"application/rss+xml":["rss"],"application/rtf":["rtf"],"application/sbml+xml":["sbml"],"application/scvp-cv-request":["scq"],"application/scvp-cv-response":["scs"],"application/scvp-vp-request":["spq"],"application/scvp-vp-response":["spp"],"application/sdp":["sdp"],"application/senml+xml":["senmlx"],"application/sensml+xml":["sensmlx"],"application/set-payment-initiation":["setpay"],"application/set-registration-initiation":["setreg"],"application/shf+xml":["shf"],"application/sieve":["siv","sieve"],"application/smil+xml":["smi","smil"],"application/sparql-query":["rq"],"application/sparql-results+xml":["srx"],"application/srgs":["gram"],"application/srgs+xml":["grxml"],"application/sru+xml":["sru"],"application/ssdl+xml":["ssdl"],"application/ssml+xml":["ssml"],"application/swid+xml":["swidtag"],"application/tei+xml":["tei","teicorpus"],"application/thraud+xml":["tfi"],"application/timestamped-data":["tsd"],"application/toml":["toml"],"application/ttml+xml":["ttml"],"application/urc-ressheet+xml":["rsheet"],"application/voicexml+xml":["vxml"],"application/wasm":["wasm"],"application/widget":["wgt"],"application/winhlp":["hlp"],"application/wsdl+xml":["wsdl"],"application/wspolicy+xml":["wspolicy"],"application/xaml+xml":["xaml"],"application/xcap-att+xml":["xav"],"application/xcap-caps+xml":["xca"],"application/xcap-diff+xml":["xdf"],"application/xcap-el+xml":["xel"],"application/xcap-error+xml":["xer"],"application/xcap-ns+xml":["xns"],"application/xenc+xml":["xenc"],"application/xhtml+xml":["xhtml","xht"],"application/xliff+xml":["xlf"],"application/xml":["xml","xsl","xsd","rng"],"application/xml-dtd":["dtd"],"application/xop+xml":["xop"],"application/xproc+xml":["xpl"],"application/xslt+xml":["xslt"],"application/xspf+xml":["xspf"],"application/xv+xml":["mxml","xhvml","xvml","xvm"],"application/yang":["yang"],"application/yin+xml":["yin"],"application/zip":["zip"],"audio/3gpp":["*3gpp"],"audio/adpcm":["adp"],"audio/basic":["au","snd"],"audio/midi":["mid","midi","kar","rmi"],"audio/mobile-xmf":["mxmf"],"audio/mp3":["*mp3"],"audio/mp4":["m4a","mp4a"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx"],"audio/s3m":["s3m"],"audio/silk":["sil"],"audio/wav":["wav"],"audio/wave":["*wav"],"audio/webm":["weba"],"audio/xm":["xm"],"font/collection":["ttc"],"font/otf":["otf"],"font/ttf":["ttf"],"font/woff":["woff"],"font/woff2":["woff2"],"image/aces":["exr"],"image/apng":["apng"],"image/bmp":["bmp"],"image/cgm":["cgm"],"image/dicom-rle":["drle"],"image/emf":["emf"],"image/fits":["fits"],"image/g3fax":["g3"],"image/gif":["gif"],"image/heic":["heic"],"image/heic-sequence":["heics"],"image/heif":["heif"],"image/heif-sequence":["heifs"],"image/hej2k":["hej2"],"image/hsj2":["hsj2"],"image/ief":["ief"],"image/jls":["jls"],"image/jp2":["jp2","jpg2"],"image/jpeg":["jpeg","jpg","jpe"],"image/jph":["jph"],"image/jphc":["jhc"],"image/jpm":["jpm"],"image/jpx":["jpx","jpf"],"image/jxr":["jxr"],"image/jxra":["jxra"],"image/jxrs":["jxrs"],"image/jxs":["jxs"],"image/jxsc":["jxsc"],"image/jxsi":["jxsi"],"image/jxss":["jxss"],"image/ktx":["ktx"],"image/png":["png"],"image/sgi":["sgi"],"image/svg+xml":["svg","svgz"],"image/t38":["t38"],"image/tiff":["tif","tiff"],"image/tiff-fx":["tfx"],"image/webp":["webp"],"image/wmf":["wmf"],"message/disposition-notification":["disposition-notification"],"message/global":["u8msg"],"message/global-delivery-status":["u8dsn"],"message/global-disposition-notification":["u8mdn"],"message/global-headers":["u8hdr"],"message/rfc822":["eml","mime"],"model/3mf":["3mf"],"model/gltf+json":["gltf"],"model/gltf-binary":["glb"],"model/iges":["igs","iges"],"model/mesh":["msh","mesh","silo"],"model/mtl":["mtl"],"model/obj":["obj"],"model/stl":["stl"],"model/vrml":["wrl","vrml"],"model/x3d+binary":["*x3db","x3dbz"],"model/x3d+fastinfoset":["x3db"],"model/x3d+vrml":["*x3dv","x3dvz"],"model/x3d+xml":["x3d","x3dz"],"model/x3d-vrml":["x3dv"],"text/cache-manifest":["appcache","manifest"],"text/calendar":["ics","ifb"],"text/coffeescript":["coffee","litcoffee"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/jade":["jade"],"text/jsx":["jsx"],"text/less":["less"],"text/markdown":["markdown","md"],"text/mathml":["mml"],"text/mdx":["mdx"],"text/n3":["n3"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"text/richtext":["rtx"],"text/rtf":["*rtf"],"text/sgml":["sgml","sgm"],"text/shex":["shex"],"text/slim":["slim","slm"],"text/stylus":["stylus","styl"],"text/tab-separated-values":["tsv"],"text/troff":["t","tr","roff","man","me","ms"],"text/turtle":["ttl"],"text/uri-list":["uri","uris","urls"],"text/vcard":["vcard"],"text/vtt":["vtt"],"text/xml":["*xml"],"text/yaml":["yaml","yml"],"video/3gpp":["3gp","3gpp"],"video/3gpp2":["3g2"],"video/h261":["h261"],"video/h263":["h263"],"video/h264":["h264"],"video/jpeg":["jpgv"],"video/jpm":["*jpm","jpgm"],"video/mj2":["mj2","mjp2"],"video/mp2t":["ts"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};

var lite = new Mime_1(standard);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter$1(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function get_server_route_handler(routes) {
    function handle_route(route, req, res, next) {
        return __awaiter$1(this, void 0, void 0, function* () {
            req.params = route.params(route.pattern.exec(req.path));
            const method = req.method.toLowerCase();
            // 'delete' cannot be exported from a module because it is a keyword,
            // so check for 'del' instead
            const method_export = method === 'delete' ? 'del' : method;
            const handle_method = route.handlers[method_export];
            if (handle_method) {
                if (process.env.SAPPER_EXPORT) {
                    const { write, end, setHeader } = res;
                    const chunks = [];
                    const headers = {};
                    // intercept data so that it can be exported
                    res.write = function (chunk) {
                        chunks.push(Buffer.from(chunk));
                        return write.apply(res, [chunk]);
                    };
                    res.setHeader = function (name, value) {
                        headers[name.toLowerCase()] = value;
                        setHeader.apply(res, [name, value]);
                    };
                    res.end = function (chunk) {
                        if (chunk)
                            chunks.push(Buffer.from(chunk));
                        end.apply(res, [chunk]);
                        process.send({
                            __sapper__: true,
                            event: 'file',
                            url: req.url,
                            method: req.method,
                            status: res.statusCode,
                            type: headers['content-type'],
                            body: Buffer.concat(chunks)
                        });
                    };
                }
                const handle_next = (err) => {
                    if (err) {
                        res.statusCode = 500;
                        res.end(err.message);
                    }
                    else {
                        process.nextTick(next);
                    }
                };
                try {
                    yield handle_method(req, res, handle_next);
                }
                catch (err) {
                    console.error(err);
                    handle_next(err);
                }
            }
            else {
                // no matching handler for method
                process.nextTick(next);
            }
        });
    }
    return function find_route(req, res, next) {
        for (const route of routes) {
            if (route.pattern.test(req.path)) {
                handle_route(route, req, res, next);
                return;
            }
        }
        next();
    };
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;

/**
 * Module variables.
 * @private
 */

var decode = decodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return "new RegExp(" + stringifyString(thing.source) + ", \"" + thing.flags + "\")";
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream__default['default'].Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream__default['default'].PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream__default['default']) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream__default['default']) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream__default['default'])) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);
		if (!res) {
			res = /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
			if (res) {
				res.pop(); // drop last quote
			}
		}

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream__default['default'] && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream__default['default']) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http__default['default'].STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url__default['default'].parse;
const format_url = Url__default['default'].format;

const streamDestructionSupported = 'destroy' in Stream__default['default'].Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream__default['default'].Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream__default['default'].PassThrough;
const resolve_url = Url__default['default'].resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch$2(url, opts) {

	// allow custom promise
	if (!fetch$2.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch$2.Promise;

	// wrap http.request into fetch
	return new fetch$2.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https__default['default'] : http__default['default']).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream__default['default'].Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch$2.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch$2(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib__default['default'].Z_SYNC_FLUSH,
				finishFlush: zlib__default['default'].Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib__default['default'].createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib__default['default'].createInflate());
					} else {
						body = body.pipe(zlib__default['default'].createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib__default['default'].createBrotliDecompress === 'function') {
				body = body.pipe(zlib__default['default'].createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch$2.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch$2.Promise = global.Promise;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode$1 = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode,
	decode: decode$1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$1 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$2 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$1,
	decode: decode$2
};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var util = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$1 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$1.fromArray(names.map(String), true);
  this._sources = ArraySet$1.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$1.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$1.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;

function get_sourcemap_url(contents) {
    const reversed = contents
        .split('\n')
        .reverse()
        .join('\n');
    const match = /\/[/*]#[ \t]+sourceMappingURL=([^\s'"]+?)(?:[ \t]+|$)/gm.exec(reversed);
    if (match)
        return match[1];
    return undefined;
}
const file_cache = new Map();
function get_file_contents(file_path) {
    if (file_cache.has(file_path)) {
        return file_cache.get(file_path);
    }
    try {
        const data = fs__default['default'].readFileSync(file_path, 'utf8');
        file_cache.set(file_path, data);
        return data;
    }
    catch (_a) {
        return undefined;
    }
}
function sourcemap_stacktrace(stack) {
    const replace = (line) => line.replace(/^ {4}at (?:(.+?)\s+\()?(?:(.+?):(\d+)(?::(\d+))?)\)?/, (input, var_name, file_path, line_num, column) => {
        if (!file_path)
            return input;
        const contents = get_file_contents(file_path);
        if (!contents)
            return input;
        const sourcemap_url = get_sourcemap_url(contents);
        if (!sourcemap_url)
            return input;
        let dir = path__default['default'].dirname(file_path);
        let sourcemap_data;
        if (/^data:application\/json[^,]+base64,/.test(sourcemap_url)) {
            const raw_data = sourcemap_url.slice(sourcemap_url.indexOf(',') + 1);
            try {
                sourcemap_data = Buffer.from(raw_data, 'base64').toString();
            }
            catch (_a) {
                return input;
            }
        }
        else {
            const sourcemap_path = path__default['default'].resolve(dir, sourcemap_url);
            const data = get_file_contents(sourcemap_path);
            if (!data)
                return input;
            sourcemap_data = data;
            dir = path__default['default'].dirname(sourcemap_path);
        }
        let raw_sourcemap;
        try {
            raw_sourcemap = JSON.parse(sourcemap_data);
        }
        catch (_b) {
            return input;
        }
        const consumer = new SourceMapConsumer$1(raw_sourcemap);
        const pos = consumer.originalPositionFor({
            line: Number(line_num),
            column: Number(column),
            bias: SourceMapConsumer$1.LEAST_UPPER_BOUND
        });
        if (!pos.source)
            return input;
        const source_path = path__default['default'].resolve(dir, pos.source);
        const source = `${source_path}:${pos.line || 0}:${pos.column || 0}`;
        if (!var_name)
            return `    at ${source}`;
        return `    at ${var_name} (${source})`;
    });
    file_cache.clear();
    return stack
        .split('\n')
        .map(replace)
        .join('\n');
}

function get_page_handler(manifest, session_getter) {
    const get_build_info =  (assets => () => assets)(JSON.parse(fs__default['default'].readFileSync(path__default['default'].join(build_dir, 'build.json'), 'utf-8')));
    const template =  (str => () => str)(read_template(build_dir));
    const has_service_worker = fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js'));
    const { pages, error: error_route } = manifest;
    function bail(res, err) {
        console.error(err);
        const message =  'Internal server error';
        res.statusCode = 500;
        res.end(`<pre>${message}</pre>`);
    }
    function handle_error(req, res, statusCode, error) {
        handle_page({
            pattern: null,
            parts: [
                { name: null, component: { default: error_route } }
            ]
        }, req, res, statusCode, error || 'Unknown error');
    }
    function handle_page(page, req, res, status = 200, error = null) {
        var _a, _b;
        return __awaiter$1(this, void 0, void 0, function* () {
            const is_service_worker_index = req.path === '/service-worker-index.html';
            const build_info = get_build_info();
            res.setHeader('Content-Type', 'text/html');
            // preload main js and css
            // TODO detect other stuff we can preload like fonts?
            let preload_files = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
            if ((_a = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _a === void 0 ? void 0 : _a.main) {
                preload_files = preload_files.concat((_b = build_info === null || build_info === void 0 ? void 0 : build_info.css) === null || _b === void 0 ? void 0 : _b.main);
            }
            let es6_preload = false;
            if (build_info.bundler === 'rollup') {
                es6_preload = true;
                const route = page.parts[page.parts.length - 1].file;
                const deps = build_info.dependencies[route];
                if (deps) {
                    preload_files = preload_files.concat(deps);
                }
            }
            else if (!error && !is_service_worker_index) {
                page.parts.forEach(part => {
                    if (!part)
                        return;
                    // using concat because it could be a string or an array. thanks webpack!
                    preload_files = preload_files.concat(build_info.assets[part.name]);
                });
            }
            const link = preload_files
                .filter((v, i, a) => a.indexOf(v) === i) // remove any duplicates
                .filter(file => file && !file.match(/\.map$/)) // exclude source maps
                .map((file) => {
                const as = /\.css$/.test(file) ? 'style' : 'script';
                const rel = es6_preload && as === 'script' ? 'modulepreload' : 'preload';
                return `<${req.baseUrl}/client/${file}>;rel="${rel}";as="${as}"`;
            })
                .join(', ');
            res.setHeader('Link', link);
            let session;
            try {
                session = yield session_getter(req, res);
            }
            catch (err) {
                return bail(res, err);
            }
            let redirect;
            let preload_error;
            const preload_context = {
                redirect: (statusCode, location) => {
                    if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
                        throw new Error('Conflicting redirects');
                    }
                    location = location.replace(/^\//g, ''); // leading slash (only)
                    redirect = { statusCode, location };
                },
                error: (statusCode, message) => {
                    preload_error = { statusCode, message };
                },
                fetch: (url, opts) => {
                    const protocol = req.socket.encrypted ? 'https' : 'http';
                    const parsed = new Url__default['default'].URL(url, `${protocol}://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' : ''}`);
                    opts = Object.assign({}, opts);
                    const include_credentials = (opts.credentials === 'include' ||
                        opts.credentials !== 'omit' && parsed.origin === `${protocol}://127.0.0.1:${process.env.PORT}`);
                    if (include_credentials) {
                        opts.headers = Object.assign({}, opts.headers);
                        const cookies = Object.assign({}, parse_1(req.headers.cookie || ''), parse_1(opts.headers.cookie || ''));
                        const set_cookie = res.getHeader('Set-Cookie');
                        (Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach((s) => {
                            const m = /([^=]+)=([^;]+)/.exec(s);
                            if (m)
                                cookies[m[1]] = m[2];
                        });
                        const str = Object.keys(cookies)
                            .map(key => `${key}=${cookies[key]}`)
                            .join('; ');
                        opts.headers.cookie = str;
                        if (!opts.headers.authorization && req.headers.authorization) {
                            opts.headers.authorization = req.headers.authorization;
                        }
                    }
                    return fetch$2(parsed.href, opts);
                }
            };
            let preloaded;
            let match;
            let params;
            try {
                const root_preload = manifest.root_comp.preload || (() => { });
                const root_preloaded = root_preload.call(preload_context, {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params: {}
                }, session);
                match = error ? null : page.pattern.exec(req.path);
                let toPreload = [root_preloaded];
                if (!is_service_worker_index) {
                    toPreload = toPreload.concat(page.parts.map(part => {
                        if (!part)
                            return null;
                        // the deepest level is used below, to initialise the store
                        params = part.params ? part.params(match) : {};
                        return part.component.preload
                            ? part.component.preload.call(preload_context, {
                                host: req.headers.host,
                                path: req.path,
                                query: req.query,
                                params
                            }, session)
                            : {};
                    }));
                }
                preloaded = yield Promise.all(toPreload);
            }
            catch (err) {
                if (error) {
                    return bail(res, err);
                }
                preload_error = { statusCode: 500, message: err };
                preloaded = []; // appease TypeScript
            }
            try {
                if (redirect) {
                    const location = Url__default['default'].resolve((req.baseUrl || '') + '/', redirect.location);
                    res.statusCode = redirect.statusCode;
                    res.setHeader('Location', location);
                    res.end();
                    return;
                }
                if (preload_error) {
                    if (!error) {
                        handle_error(req, res, preload_error.statusCode, preload_error.message);
                    }
                    else {
                        bail(res, preload_error.message);
                    }
                    return;
                }
                const segments = req.path.split('/').filter(Boolean);
                // TODO make this less confusing
                const layout_segments = [segments[0]];
                let l = 1;
                page.parts.forEach((part, i) => {
                    layout_segments[l] = segments[i + 1];
                    if (!part)
                        return null;
                    l++;
                });
                if (error instanceof Error && error.stack) {
                    error.stack = sourcemap_stacktrace(error.stack);
                }
                const pageContext = {
                    host: req.headers.host,
                    path: req.path,
                    query: req.query,
                    params,
                    error: error
                        ? error instanceof Error
                            ? error
                            : { message: error, name: 'PreloadError' }
                        : null
                };
                const props = {
                    stores: {
                        page: {
                            subscribe: writable(pageContext).subscribe
                        },
                        preloading: {
                            subscribe: writable(null).subscribe
                        },
                        session: writable(session)
                    },
                    segments: layout_segments,
                    status: error ? status : 200,
                    error: pageContext.error,
                    level0: {
                        props: preloaded[0]
                    },
                    level1: {
                        segment: segments[0],
                        props: {}
                    }
                };
                if (!is_service_worker_index) {
                    let level_index = 1;
                    for (let i = 0; i < page.parts.length; i += 1) {
                        const part = page.parts[i];
                        if (!part)
                            continue;
                        props[`level${level_index++}`] = {
                            component: part.component.default,
                            props: preloaded[i + 1] || {},
                            segment: segments[i]
                        };
                    }
                }
                const { html, head, css } = App.render(props);
                const serialized = {
                    preloaded: `[${preloaded.map(data => try_serialize(data, err => {
                        console.error(`Failed to serialize preloaded data to transmit to the client at the /${segments.join('/')} route: ${err.message}`);
                        console.warn('The client will re-render over the server-rendered page fresh instead of continuing where it left off. See https://sapper.svelte.dev/docs#Return_value for more information');
                    })).join(',')}]`,
                    session: session && try_serialize(session, err => {
                        throw new Error(`Failed to serialize session data: ${err.message}`);
                    }),
                    error: error && serialize_error(props.error)
                };
                let script = `__SAPPER__={${[
                    error && `error:${serialized.error},status:${status}`,
                    `baseUrl:"${req.baseUrl}"`,
                    serialized.preloaded && `preloaded:${serialized.preloaded}`,
                    serialized.session && `session:${serialized.session}`
                ].filter(Boolean).join(',')}};`;
                if (has_service_worker) {
                    script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
                }
                const file = [].concat(build_info.assets.main).filter(f => f && /\.js$/.test(f))[0];
                const main = `${req.baseUrl}/client/${file}`;
                // users can set a CSP nonce using res.locals.nonce
                const nonce_value = (res.locals && res.locals.nonce) ? res.locals.nonce : '';
                const nonce_attr = nonce_value ? ` nonce="${nonce_value}"` : '';
                if (build_info.bundler === 'rollup') {
                    if (build_info.legacy_assets) {
                        const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
                        script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
                    }
                    else {
                        script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
                    }
                }
                else {
                    script += `</script><script${nonce_attr} src="${main}" defer>`;
                }
                let styles;
                // TODO make this consistent across apps
                // TODO embed build_info in placeholder.ts
                if (build_info.css && build_info.css.main) {
                    const css_chunks = new Set(build_info.css.main);
                    page.parts.forEach(part => {
                        if (!part || !build_info.dependencies)
                            return;
                        const deps_for_part = build_info.dependencies[part.file];
                        if (deps_for_part) {
                            deps_for_part.filter(d => d.endsWith('.css')).forEach(chunk => {
                                css_chunks.add(chunk);
                            });
                        }
                    });
                    styles = Array.from(css_chunks)
                        .map(href => `<link rel="stylesheet" href="client/${href}">`)
                        .join('');
                }
                else {
                    styles = (css && css.code ? `<style${nonce_attr}>${css.code}</style>` : '');
                }
                const body = template()
                    .replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
                    .replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
                    .replace('%sapper.html%', () => html)
                    .replace('%sapper.head%', () => head)
                    .replace('%sapper.styles%', () => styles)
                    .replace(/%sapper\.cspnonce%/g, () => nonce_value);
                res.statusCode = status;
                res.end(body);
            }
            catch (err) {
                if (error) {
                    bail(res, err);
                }
                else {
                    handle_error(req, res, 500, err);
                }
            }
        });
    }
    return function find_route(req, res, next) {
        const path = req.path === '/service-worker-index.html' ? '/' : req.path;
        const page = pages.find(page => page.pattern.test(path));
        if (page) {
            handle_page(page, req, res);
        }
        else {
            handle_error(req, res, 404, 'Not found');
        }
    };
}
function read_template(dir = build_dir) {
    return fs__default['default'].readFileSync(`${dir}/template.html`, 'utf-8');
}
function try_serialize(data, fail) {
    try {
        return devalue(data);
    }
    catch (err) {
        if (fail)
            fail(err);
        return null;
    }
}
// Ensure we return something truthy so the client will not re-render the page over the error
function serialize_error(error) {
    if (!error)
        return null;
    let serialized = try_serialize(error);
    if (!serialized) {
        const { name, message, stack } = error;
        serialized = try_serialize({ name, message, stack });
    }
    if (!serialized) {
        serialized = '{}';
    }
    return serialized;
}

function middleware(opts = {}) {
    const { session, ignore } = opts;
    let emitted_basepath = false;
    return compose_handlers(ignore, [
        (req, res, next) => {
            if (req.baseUrl === undefined) {
                let originalUrl = req.originalUrl || req.url;
                if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
                    originalUrl += '/';
                }
                req.baseUrl = originalUrl
                    ? originalUrl.slice(0, -req.url.length)
                    : '';
            }
            if (!emitted_basepath && process.send) {
                process.send({
                    __sapper__: true,
                    event: 'basepath',
                    basepath: req.baseUrl
                });
                emitted_basepath = true;
            }
            if (req.path === undefined) {
                req.path = req.url.replace(/\?.*/, '');
            }
            next();
        },
        fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js')) && serve({
            pathname: '/service-worker.js',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        fs__default['default'].existsSync(path__default['default'].join(build_dir, 'service-worker.js.map')) && serve({
            pathname: '/service-worker.js.map',
            cache_control: 'no-cache, no-store, must-revalidate'
        }),
        serve({
            prefix: '/client/',
            cache_control:  'max-age=31536000, immutable'
        }),
        get_server_route_handler(manifest.server_routes),
        get_page_handler(manifest, session || noop$1)
    ].filter(Boolean));
}
function compose_handlers(ignore, handlers) {
    const total = handlers.length;
    function nth_handler(n, req, res, next) {
        if (n >= total) {
            return next();
        }
        handlers[n](req, res, () => nth_handler(n + 1, req, res, next));
    }
    return !ignore
        ? (req, res, next) => nth_handler(0, req, res, next)
        : (req, res, next) => {
            if (should_ignore(req.path, ignore)) {
                next();
            }
            else {
                nth_handler(0, req, res, next);
            }
        };
}
function should_ignore(uri, val) {
    if (Array.isArray(val))
        return val.some(x => should_ignore(uri, x));
    if (val instanceof RegExp)
        return val.test(uri);
    if (typeof val === 'function')
        return val(uri);
    return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}
function serve({ prefix, pathname, cache_control }) {
    const filter = pathname
        ? (req) => req.path === pathname
        : (req) => req.path.startsWith(prefix);
    const cache = new Map();
    const read =  (file) => (cache.has(file) ? cache : cache.set(file, fs__default['default'].readFileSync(path__default['default'].join(build_dir, file)))).get(file);
    return (req, res, next) => {
        if (filter(req)) {
            const type = lite.getType(req.path);
            try {
                const file = path__default['default'].posix.normalize(decodeURIComponent(req.path));
                const data = read(file);
                res.setHeader('Content-Type', type);
                res.setHeader('Cache-Control', cache_control);
                res.end(data);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    next();
                }
                else {
                    console.error(err);
                    res.statusCode = 500;
                    res.end('an error occurred while reading a static file from disk');
                }
            }
        }
        else {
            next();
        }
    };
}
function noop$1() { }

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const fs$1 = require('fs');
const path = require('path');
//fs.mkdirSync(path.join(process.cwd(), 'static'));

const serverless = require('serverless-http');
const server = polka__default['default']() // You can also use Express
        .use(
                compression__default['default']({ threshold: 0 }),
                sirv__default['default']('static', { dev }),
                middleware()
        );
const handler = serverless(server);

module.exports.handler = async function (event, context) {
   console.log('entering handler...');
   const result = await handler(event, context);
   console.log('exiting handler');
   return result;
};

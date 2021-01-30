// Wrapper classes
// convert Vercel req, res into Nodejs IncomingMessage and ServerResponse

/**
   Map a Vercel Request into an IncomingMessage {
      query:         // query string or {}
      cookies:       // cookies or {}
      body:          // body or null
   }

   Some fields are added to IncomingMessage:
     query    Object(name => value)
     url      string
     cookies  Array[string] where string is name=value

   See https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects

   Contenu de /var/task/:
      /var/task/node_modules/
      /var/task/src/routes/api/

*/

export class Request {
    constructor (req) {
        this.request = req;
        this.url = req.url;
        this.query = req.query;
        this.cookies = [];
        let cookiesString = '';
        Object.keys(req.cookies).forEach((key) => {
            const kv = `${key}=${encodeURIComponent(req.cookies[key])}`;
            cookiesString += `${kv};`;
            this.cookies.push(kv);
        });
        this.headers = {
            cookie: cookiesString
        };
    }
}

/**
   Map a Vercel Response into a ServerResponse {
      status(code)   // set status code
      send(body)     // send string, object or buffer
      json(obj)      // send json object
      redirect(url)  // 
      redirect(status, url)
   }
*/

export class Response {
    constructor (res) {
        this.statusCode = 500;
        this.response = res;
        this.statusMessage = "Server problem";
        this.body = '';
        this['Content-Type'] = 'application/json';
    }
    setHeader (key, value) {
        this.response.setHeader(key, value);
    }
    statusMessage (msg) {
        //this.reponse.statusMessage = msg;
        console.log(`ignore statusMessage(${msg})`);
    }
    statusCode (code) {
        this.response.status(code);
    }
    end (s) {
        this.response.send(s);
    }
}

/**
   Forward a GET request with limited duration towards another GET method.
   Use this when wrapping svelte methods to become vercel compatible.

   @param {fn} async function 
   @return async function
*/

export function wrapLimited (fn, duration=5000) {
    return async function (req, res, next) {
        try {
            const Req = new Request(req);
            const Res = new Response(res);
            return new Promise((resolve, reject) => {
                setTimeout(() => reject('timeout'), duration);
                resolve(fn(Req, Res));
            });
        } catch (exc) {
            return {
                statusCode: 500,
                headers: {},
                body: res.body + exc.toString()
            };
        }
    }
}

// end of api/vercelclasses.js

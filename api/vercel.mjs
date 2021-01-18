// Wrapper classes

/**
   Vercel Request is {
      query:         // query string or {}
      cookies:       // cookies or {}
      body:          // body or null
   }

   See https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-request-and-response-objects

   Contenu de /var/task/:
      /var/task/node_modules/
      /var/task/src/routes/api/

*/

export class VercelRequest {
    constructor (req) {
        this.request = req;
    }
}

/**
   Vercel Response is {
      status(code)   // set status code
      send(body)     // send string, object or buffer
      json(obj)      // send json object
      redirect(url)  // 
      redirect(status, url)
   }
*/

export class VercelResponse {
    constructor (res) {
        this.statusCode = 500;
        this.response = res;
        this.statusMessage = "Server problem";
        this.body = JSON.stringify({error: 'problem'});
        this['Content-Type'] = 'application/json';
    }
    setHeader (key, value) {
        //this.response[key] = value;
        console.log(`ignore setHeader(${key}, ${value})`);
    }
    statusMessage (msg) {
        //this.reponse.statusMessage = msg;
        console.log(`ignore statusMessage(${msg)`);
    }
    statusCode (code) {
        this.response.status(code);
    }
    end (s) {
        this.response.send(s);
    }
}

// end of src/server/vercelapi/vercel.mjs

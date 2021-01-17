// Netlify converter

/**

   Event is {
    "path": "Path parameter",
    "httpMethod": "Incoming request’s method name"
    "headers": {Incoming request headers}
    "queryStringParameters": {query string parameters }
    "body": "A JSON string of the request payload."
    "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
  }

  The handler should return an object {
    statusCode: 200,
    headers: { 
        X: "value"
    },
    body: JSON.stringify({message: "Hello World"})
  }

*/

import { get } from '../src/routes/api/signupinit.json.js';

class Response {
    constructor () {
        this.statusCode = 500;
        this.statusMessage = "Server problem";
        this.body = JSON.stringify({error: 'problem'});
        this['Content-Type'] = 'application/json';
    }
    setHeader (key, value) {
        this[key] = value;
    }
    statusMessage (msg) {
        this.statusMessage = msg;
    }
    end (s) {
        this.body = s;
    }
}

exports.handler = async function (event, context) {
    console.log(`entering handler digit.js`, event, context);
    let response = new Response();
    response = await get(event, response);
    console.log(`exiting handler digit.js`, response);
    return response;
}

// end of digit.js

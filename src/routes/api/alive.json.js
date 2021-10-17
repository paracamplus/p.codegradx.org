// Respond with a JSON answer meaning that the server is responding

export async function get(req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
        kind: 'alive',
        epoch: Date.now(),
        now: new Date().toUTCString()
    }));
}

// end of alive.json.js

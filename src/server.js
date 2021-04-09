import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '@sapper/server';
import { CodeGradX } from 'codegradx';

const { PORT, NODE_ENV } = process.env;
const dev = (NODE_ENV === 'development');

const debug = require('debug')('pserver');
function logger (req, res, next) {
  debug(`~> Received ${req.method} on ${req.url}`);
  next(); // move on
}

polka()
	.use(
        logger,
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		sapper.middleware({
            // cf. https://sapper.svelte.dev/docs#Seeding_session_data
            session: (req, res) => {
                let result = { dev };
                return result;
            }
        })
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});

// end of server.js

import * as sapper from '@sapper/app';

// Weird but makes bundler happy:
import { CodeGradX } from 'codegradx';
//console.log(CodeGradX);// DEBUG
import { configureConfig } from './client/lib.mjs';

window.CodeGradX = CodeGradX; // Make CodeGradX global!
CodeGradX.initialize(true)
    .then(async () => {
        await configureConfig();
        sapper.start({
            target: document.querySelector('#sapper')
        });
    });

// end of client.js

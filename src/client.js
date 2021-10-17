import * as sapper from '@sapper/app';

// Weird but makes bundler happy:
import { CodeGradX } from 'codegradx/src/cache';
//console.log(CodeGradX);// DEBUG
import { configureConfig } from './client/lib.mjs';

window.CodeGradX = CodeGradX; // Make CodeGradX global!

const cacherType = 'LocalStorageCache';
const caches = [ 'Exercise', 'Job', 'ExercisesSet', 'Campaign' ];

function customizer (state) {
    // Cache is performed in service-worker:
    //state.cacher = plugCache(CodeGradX, 'NoCache', state);
    //state.cacher = plugCache(CodeGradX, 'InlineCache', state);
    state.plugCache(cacherType);
    caches.forEach((name) => state.mkCacheFor(name));
    if ( state.cacherType === 'LocalStorageCache' ) {
        caches.forEach((name) => {
            // Only Jobs are immutable!
            // Exercise are immutable (except mine!)
            if ( name !== 'Job' && name !== 'Exercise' ) {
                state.caches[name].clear();
            }
        });
    }
    return state;
}

CodeGradX.initialize(true, customizer)
    .then(async () => {
        //await configureConfig();
        sapper.start({
            target: document.querySelector('#sapper')
        });
    });

// end of client.js

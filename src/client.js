import * as sapper from '@sapper/app';

// Weird but makes bundler happy:
import { CodeGradX } from 'codegradx';
//console.log(CodeGradX);// DEBUG
import { plugCache } from 'codegradx/cache';
import { configureConfig } from './client/lib.mjs';

window.CodeGradX = CodeGradX; // Make CodeGradX global!

function customizer (state) {
    // Cache is performed in service-worker:
    //state.cacher = plugCache(CodeGradX, 'NoCache', state);
    //state.cacher = plugCache(CodeGradX, 'InlineCache', state);
    state.cacher = plugCache(CodeGradX, 'LocalStorageCache', state);
    state.mkCacheFor('Exercise');
    state.mkCacheFor('Job');
    state.mkCacheFor('ExercisesSet');
    state.mkCacheFor('Campaign');
    return state;
}

CodeGradX.initialize(true, customizer)
    .then(async () => {
        await configureConfig();
        sapper.start({
            target: document.querySelector('#sapper')
        });
    });

// end of client.js

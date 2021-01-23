// Increment version of package.json

const fs = require('fs');
const semver = require('semver');
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([
    { name: 'source', alias: 's', type: String },
    { name: 'target', alias: 't', type: String }
]);
const pjsonfile = options.source || '../package.json';
const targetpjsonfile = options.target || pjsonfile;

const pjson = require(pjsonfile);
//console.log(JSON.stringify(pjson));

const newversion = semver.inc(pjson.version, 'patch');
console.log({newversion});
pjson.version = newversion;
//console.log(JSON.stringify(pjson));
try {
    fs.writeFileSync(targetpjsonfile, JSON.stringify(pjson, null, 4), {
        mode: 644, encoding: 'utf8' });
} catch (exc) {
    console.log({exc});
}

// end of incr.js

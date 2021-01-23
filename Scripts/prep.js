// Customize package.json

const fs = require('fs');
const commandLineArgs = require('command-line-args');
const options = commandLineArgs([
    { name: 'source', alias: 's', type: String },
    { name: 'target', alias: 't', type: String },
    { name: 'kind', alias: 'k', type: String }
]);
const pjsonfile = options.source || '../package.json';
const targetpjsonfile = options.target ||
      '../GITHUB/p.codegradx.org/package.json';

function usage () {
    console.error(`
Usage: node .../prep.js <target>
Prepare package.json for a specific deployment such as netlify or vercel.
Possible options:
   -s --source  package.json to process
   -t --target  package.json to update
   -k --kind    netlify | vercel
`);
    process.exit(1);
}

function saveNewPackageJson (pjson, targetpjsonfile) {
    try {
        fs.writeFileSync(targetpjsonfile, JSON.stringify(pjson, null, 4), {
            mode: 0o644, encoding: 'utf8' });
    } catch (exc) {
        console.log({exc});
        process.exit(2);
    }
}

function commonProcess (pjson) {
    delete pjson.devDependencies.cypress;
    delete pjson.devDependencies.semver;
    delete pjson.devDependencies['command-line-args'];
    pjson.license = "MIT";
    pjson.repository = {
        type: 'git',
        url: 'git@github.com:paracamplus/p.codegradx.org.git'
    };
}

const processor = {};
processor.netlify = function process4netlify (pjson) {
    delete pjson.scripts.vercel;
    commonProcess(pjson);
    delete pjson.devDependencies['vercel'];
    delete pjson.devDependencies['vercel-sapper'];
}

processor.vercel = function process4vercel (pjson) {
    delete pjson.scripts.netlify;
    commonProcess(pjson);
    delete pjson.devDependencies['netlify-cli'];
}

processor['vercel-serverless'] = function process4vercelserverless (pjson) {
    delete pjson.scripts.netlify;
    commonProcess(pjson);
    delete pjson.devDependencies['netlify-cli'];
    delete pjson.vercel;
    pjson.name = 'p';
    pjson.main = './__sapper__/build/server/server.js';
}

const pjson = require(pjsonfile);
const f = processor[options.kind] || usage;
f(pjson);

saveNewPackageJson(pjson, targetpjsonfile);

// end of prep.js



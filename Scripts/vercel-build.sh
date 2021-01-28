#! /bin/bash
# Time-stamp: "2021-01-28 09:43:18 queinnec"

# Build the P server on Vercel.
# api/p.js should already exist to be taken into account.

# On Vercel, project settings are:
#    build command:     npm run vercel
#    output directory:  export
#    install command:   npm ci
# no development command (default is sapper dev --port $PORT)
# no root directory (default /)

# Tab Source Output shows a thorough reorganization of the files:
#   + _digits/*.png
#   + api/p.js
#   + client/*.{js,css}
#   favicon.{ico,png}
#   fw4ex-*.png
#   global.css
#   index.html
#   manifest.json
#   service-worker-index.html
#   service-worker.js
# So, static/ is exported
#     __sapper__/export is moved into static/client
#     api/ is moved into static/

DEBUG=false

showls () {
    if $DEBUG
    then
        echo "*** ls -tal $1"
        ls -tal $1
    fi
}

# Tab 'source source' is only filled with manual deployment.
# However the build command is still npm run vercel so to differentiate
# a manual deployment from a GIT deployment, the WOGIT (read without git)
# environment variable is set.

if ${WOGIT:-false}
then
    echo "*** Manual deployment"
    # The webapp and its serverless functions are completely built on
    # the dev machine.
    exec /bin/true
fi

# The webapp and its serverless functions are completely built on the
# dev machine so nothing else to be done on Vercel.
if [ -d export ]
then
   echo "*** The entire webapp and its serverless functions are ready"
   exec /bin/true
fi

# Inquire context:
if ${SHOW_CONTEXT:-false}
then
    echo "*** ls -al shows"
    ls -al
    echo "*** whoami -> $(whoami)"   # vercel
    echo "*** pwd    -> $(pwd)"      # /vercel/workpath0/
    echo "*** node --version -> $(node --version)"
    echo "*** npm --version  -> $(npm --version)"
    echo "*** printenv is"
    printenv
fi

echo "*** Building the p.codegradx.org static server..."
# export needs the original server.js with a listen method in order to
# crawl the site after generation.
cp -pf src/nativeserver.js src/server.js

npm run export
showls `pwd`/
showls __sapper__/
showls __sapper__/export/

if [ ! -f __sapper__/export/index.html ]
then
    echo "!!!!! Crawling phase probably missing!" >&2
    exit 1
fi
# Make sure that ./export is the 'output directory' in the project settings:
mv __sapper__/export .
rm -rf __sapper__/build

echo "*** Building the p.codegradx.org dynamic server..."
# Update src/server.js in order to be invoked as a serverless function.
cp -pf src/pserver.js src/server.js
npm run build
tr -d '\r' < __sapper__/build/server/server.js > api/p.js
showls api/

# Restaure back the original file:
mv -f src/nativeserver.js src/server.js

echo "*** end of vercel-build.sh"

# end of vercel-build.sh

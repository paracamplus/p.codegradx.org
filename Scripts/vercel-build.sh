#! /bin/bash
# Time-stamp: "2021-01-30 14:33:02 queinnec"

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
# So, the final ./export/ directory is filled with:
#     the content of static/
#     __sapper__/export is moved into export/client
#     and the api/ directory is moved into export/api

DEBUG=false
DEBUG=true

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

BUILD_EXPORT=${BUILD_EXPORT:-true}
BUILD_SERVER=${BUILD_SERVER:-true}

# The webapp and its serverless functions are completely built on the
# dev machine so nothing else to be done on Vercel.
if $BUILD_EXPORT && [ -d export ]
then
    BUILD_EXPORT=false
fi

if $BUILD_SERVER && [ -f api/p.js -a "$(wc -l < api/p.js)" -gt 1000 ]
then
    BUILD_SERVER=false
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

if $BUILD_EXPORT
then
    echo "*** Building the p.codegradx.org static server..."
    # export needs the original server.js with a listen method in
    # order to crawl the site after generation.
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
    # Remove that directory in order to be able to build the dynamic server:
    rm -rf __sapper__/build
else
    echo "*** Don't rebuild the ./export/ directory!"
fi

if $BUILD_SERVER
then
    echo "*** Building the p.codegradx.org dynamic server..."
    # Update src/server.js in order to be invoked as a serverless function.
    cp -pf src/pserver.js src/server.js
    npm run build
    tr -d '\r' < __sapper__/build/server/server.js > api/p.js
    showls api/

    # Restaure back the original file:
    mv -f src/nativeserver.js src/server.js
else
    echo "*** Don't rebuild the api/p.js dynamic server!"
fi

echo "*** end of vercel-build.sh"

# end of vercel-build.sh

#! /bin/bash
# Time-stamp: "2021-01-31 16:28:39 queinnec"

# Finish to build the P server to be run on Vercel.

DEBUG=${DEBUG:-false}
BUILD_EXPORT=${BUILD_EXPORT:-false}
BUILD_SERVER=${BUILD_SERVER:-false}

while getopts "dlrv:" option
do
    case "$option" in
        d)
            DEBUG=true
            ;;
        l)
            echo "Build locally the static and dynamic servers"
            BUILD_EXPORT=true
            BUILD_SERVER=true
            ;;
        r)
            echo "Build static and dynamic servers on Vercel"
            BUILD_EXPORT=false
            BUILD_SERVER=false            
            ;;
        v)
            VERCEL_WAY=$OPTARG
            case "$VERCEL_WAY" in
                remote)
                    echo "Build static and dynamic servers on Vercel"
                    BUILD_EXPORT=false
                    BUILD_SERVER=false            
                    ;;
                local)
                    echo "Build locally the static and dynamic servers"
                    BUILD_EXPORT=true
                    BUILD_SERVER=true
                    ;;
                *)
                    echo "!!!!! Unrecognizable option $VERCEL_WAY" >&2
                    exit 3
                    ;;
            esac
            ;;
        *)
            echo "!!!!! Unknown option $option" >&2
            exit 2
            ;;
    esac
done
cat <<EOF 
*** Configuration is
  DEBUG=${DEBUG} 
  BUILD_EXPORT=${BUILD_EXPORT}
  BUILD_SERVER=${BUILD_SERVER}
EOF

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

showls () {
    if $DEBUG
    then
        echo "*** ls -tal $1"
        ls -tal $1
    fi
}

# Tab 'source > source' is only filled with manual deployment.
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
if $BUILD_EXPORT && [ -d export ]
then
    BUILD_EXPORT=false
fi

if $BUILD_SERVER && [ -f api/p.js -a "$(wc -l < api/p.js)" -gt 1000 ]
then
    BUILD_SERVER=false
fi

# Inquire context:
if ${DEBUG:-false}
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
    # Remove that useless directory in order to be able to build the
    # dynamic server.
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

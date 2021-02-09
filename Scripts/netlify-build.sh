#! /bin/bash
# Time-stamp: "2021-02-07 14:52:16 queinnec"

# Build the P server on Netlify:

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
            echo "Build static and dynamic servers on Netlify:"
            BUILD_EXPORT=false
            BUILD_SERVER=false            
            ;;
        v)
            NETLIFY_WAY=$OPTARG
            case "$NETLIFY_WAY" in
                remote)
                    echo "Build static and dynamic servers on Netlify"
                    BUILD_EXPORT=false
                    BUILD_SERVER=false            
                    ;;
                local)
                    echo "Build locally the static and dynamic servers"
                    BUILD_EXPORT=true
                    BUILD_SERVER=true
                    ;;
                *)
                    echo "!!!!! Unrecognizable option $NETLIFY_WAY" >&2
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

# Impose nodejs 12 and npm 7
export CONTEXT=production
export NODE_ENV=$CONTEXT
export NODE_VERSION=12.x
export NPM_VERSION=7.3.0

cat <<EOF 
*** Configuration is
  DEBUG=${DEBUG} 
  BUILD_EXPORT=${BUILD_EXPORT}
  BUILD_SERVER=${BUILD_SERVER}
  CONTEXT=${CONTEXT}
EOF

showls () {
    if $DEBUG
    then
        echo "*** ls -tal $1"
        ls -tal $1
    fi
}

# The webapp and its serverless functions are completely built on the
# dev machine so nothing else to be done on Netlify:
if $BUILD_EXPORT && [ -d export ]
then
    BUILD_EXPORT=false
fi

if $BUILD_SERVER && \
   [ -f functions/p.js -a "$(wc -l < functions/p.js)" -gt 1000 ]
then
    BUILD_SERVER=false
fi

# Inquire context:
if ${DEBUG:-false}
then
    echo "*** ls -al shows"
    ls -al
    echo "*** whoami -> $(whoami)"   # 
    echo "*** pwd    -> $(pwd)"      # /opt/build/repo/
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
    tr -d '\r' < __sapper__/build/server/server.js > functions/p.js
    showls functions/

    # Restaure back the original file:
    cp -pf src/nativeserver.js src/server.js
else
    echo "*** Don't rebuild the functions/p.js dynamic server!"
fi

echo "*** end of netlify-build.sh"

# end of netlify-build.sh

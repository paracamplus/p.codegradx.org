#! /bin/bash
# Time-stamp: "2021-01-13 14:53:09 queinnec"

# Build the P server on Netlify:

# Impose nodejs 12 and npm 7
export CONTEXT=production
export NODE_ENV=$CONTEXT
export NODE_VERSION=12.x
export NPM_VERSION=7.3.0

# Erase some previous cached files:
rm -rf __sapper__

# Inquire context:
if ${SHOW_CONTEXT:-false}
then
    echo "*** ls -al shows"
    ls -al
    echo "*** whoami -> $(whoami)"   # buildbot
    echo "*** pwd    -> $(pwd)"      # /opt/build/repo/
    echo "*** node --version -> $(node --version)"
    echo "*** npm --version  -> $(npm --version)"
    echo "*** printenv is"
    printenv
fi

# Building pair of keys:
mkdir -p secrets/
( cd secrets/
  if [ ! -f ./fkeyPrivate ]
  then 
      ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
      openssl rsa -in ./fkeyPrivate -pubout -out ./fkeyPublic
  fi
  ls -l ../secrets/
)

npm install && \
npm run build

# end of netlify-build.sh

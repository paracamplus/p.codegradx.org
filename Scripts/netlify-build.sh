#! /bin/bash
# Time-stamp: "2021-01-11 10:28:00 queinnec"

# Build the server on Netlify
export CONTEXT=production
export NODE_ENV=$CONTEXT
export NODE_VERSION=12.x

#ls -Ral
echo "*** whoami -> $(whoami)"
echo "*** pwd    -> $(pwd)"
echo "*** printenv is"
printenv

mkdir -p secrets/

( cd secrets/
  if [ ! -f ./fkeyPrivate ]
  then 
      ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
      openssl rsa -in ./fkeyPrivate -pubout -out ./fkeyPublic
  fi
)

# Erase some previous cached files:
rm -rf __sapper__

npm install && \
npm run export

# end of netlify-build.sh

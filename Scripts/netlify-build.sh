#! /bin/bash
# Time-stamp: "2021-01-11 09:55:20 queinnec"

# Build the server on Netlify
export CONTEXT=production
export NODE_ENV=$CONTEXT
export NODE_VERSION=12.x

#ls -Ral
whoami
pwd
printenv

mkdir -p secrets/

( cd secrets
  if [ ! -f fkeyPrivate ]
  then 
      ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
      openssl rsa -in fkeyPrivate -pubout -out fkeyPublic
  fi
)

# Erase some previous cached files:
rm -rf __sapper__

npm install && \
npm run export

# end of netlify-build.sh

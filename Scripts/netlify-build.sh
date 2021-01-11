#! /bin/bash
# Time-stamp: "2021-01-11 09:47:15 queinnec"

# Build the server on Netlify
export CONTEXT=production
export NODE_ENV=$CONTEXT
export NODE_VERSION=12.x

ls -Ral
whoami
pwd

mkdir -p secrets/

( cd secrets
  rm -f fkeyPublic fkeyPrivate
  ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
  openssl rsa -in fkeyPrivate -pubout -out fkeyPublic
)

# Erase some previous cached files:
rm -rf __sapper__

npm install && \
npm run export

# end of netlify-build.sh

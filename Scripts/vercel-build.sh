#! /bin/bash
# Time-stamp: "2021-01-18 18:45:16 queinnec"

# Build the P server on Vercel:

# Erase some previous cached files:
if [ -d __sapper__ -o -d api/__sapper__ ]
then
    rm -rf __sapper__ api/__sapper__
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

echo "*** Building pair of keys:"
mkdir -p secrets/
( cd secrets/
  if [ ! -f ./fkeyPrivate ]
  then 
      ssh-keygen -t rsa -N '' -b 1024 -C "fkey@f.codegradx.org" -f ./fkeyPrivate
      openssl rsa -in ./fkeyPrivate -pubout -out ./fkeyPublic
  fi
  ls -l ../secrets/
)
cp -rp secrets api/

echo "*** Building the p.codegradx.org server..."
npm run export

echo "*** Building the API functions..."
cp -rp src static api/
(cd api/ && npm install && npm run build)

# end of vercel-build.sh

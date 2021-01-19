#! /bin/bash
# Time-stamp: "2021-01-19 09:46:21 queinnec"

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

if [ -z "$FKEY_PUBLIC" ]
then if [ -z "$FKEY_PRIVATE" ]
     then
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
     else
         unset FKEY_PUBLIC
     fi
else
    unset FKEY_PRIVATE
fi

echo "*** Building the p.codegradx.org server..."
npm run export

echo "*** Building the API functions..."
cp -rp src static api/
#sed -i.bak api/src/server.js -e 's/polka/export default polka/'
#rm -f api/src/server.js.bak
(cd api/ && npm ci && npm run build)

# end of vercel-build.sh

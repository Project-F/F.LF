nodejs ../../../../F/dr.js/dr.js docs.json
nodejs ../../../../F/dr.js/dr.js network_docs.json
if cmp ../network.js ../../../F.Lobby/public/network.js
then
cp network_docs.html ../../../F.Lobby/docs/
echo "copied docs to F.Lobby"
fi

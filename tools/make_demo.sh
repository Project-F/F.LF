cd ../
mkdir release
nodejs third_party/r.js -o demo/game-build.config
cp demo/game.html release
cp demo/game-built.js release/game.js
rm demo/game-built.js

nodejs third_party/r.js -o demo/background-build.config
cp demo/background.html release
cp demo/background-built.js release/background.js
rm demo/background-built.js

echo "built on "`date "+%T, %d %B %Y"`
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > release/buildinfo.js

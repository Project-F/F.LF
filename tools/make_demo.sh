cd ../

node third_party/r.js -o demo/demo4-build.config
cp demo/demo4.html ../LFrelease/demo
cp demo/demo4-built.js ../LFrelease/demo/demo4.js
rm demo/demo4-built.js

node third_party/r.js -o demo/background-build.config
cp demo/background.html ../LFrelease/demo
cp demo/background-built.js ../LFrelease/demo/background.js
rm demo/background-built.js

echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > ../LFrelease/demo/buildinfo.js
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })"
cp demo/index.html ../LFrelease/demo

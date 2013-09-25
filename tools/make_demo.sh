cd ../
node third_party/r.js -o demo/demo3-build.config
cp demo/demo3.html ../LFrelease/demo
cp demo/index.html ../LFrelease/demo
cp demo/demo3-built.js ../LFrelease/demo/demo3.js
rm demo/demo3-built.js
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > ../LFrelease/demo/buildinfo.js

node third_party/r.js -o demo/demo4-build.config
cp demo/demo4.html ../LFrelease/demo
cp demo/index.html ../LFrelease/demo
cp demo/demo4-built.js ../LFrelease/demo/demo4.js
rm demo/demo4-built.js
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > ../LFrelease/demo/buildinfo.js

cp demo/index.html ../LFrelease/demo

cd ../
node third_party/r.js -o demo/demo3-build.config
cp demo/demo3.html ../LFrelease/demo
cp demo/index.html ../LFrelease/demo
cp demo/demo3-built.js ../LFrelease/demo/demo3.js
rm demo/demo3-built.js
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > ../LFrelease/demo/buildinfo.js

cd ../

nodejs third_party/r.js -o demo/demo5-build.config
cp demo/demo5.html ../LFrelease/demo
cp demo/demo5-built.js ../LFrelease/demo/demo5.js
rm demo/demo5-built.js

nodejs third_party/r.js -o demo/background-build.config
cp demo/background.html ../LFrelease/demo
cp demo/background-built.js ../LFrelease/demo/background.js
rm demo/background-built.js

echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })" > ../LFrelease/demo/buildinfo.js
echo "define({ timestamp: \""`date "+%T, %d %B %Y"`"\" })"
cp demo/index.html ../LFrelease/demo

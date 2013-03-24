cd ../
node third_party/r.js -o demo/demo3-build.config
cp demo/demo3.html ../LFrelease/demo
cp demo/demo3-built.js ../LFrelease/demo/demo3.js
echo "<body>build on" `date "+%T, %d %B %Y"` "</body>" > ../LFrelease/demo/time.html

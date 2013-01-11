tools:
	mkdir tools
	node third_party/r.js -o tools/frame_transition_sequence-build.config
	cp tools/frame_transition_sequence.html ../LFrelease/tools
	cp tools/frame_transition_sequence-built.js ../LFrelease/tools/frame_transition_sequence.js
	cp tools/data_file_converter.html ../LFrelease/tools

demo:
	node third_party/r.js -o demo/demo3-build.config
	cp demo/demo3.html ../LFrelease/demo
	cp demo/demo3-built.js ../LFrelease/demo/demo3.js
	echo "<body>build on" `date "+%T, %d %B %Y"` "</body>" > ../LFrelease/demo/time.html

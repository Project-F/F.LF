cd ../
node third_party/r.js -o tools/frame_transition_sequence-build.config
cp tools/frame_transition_sequence.html ../LFrelease/tools
cp tools/frame_transition_sequence-built.js ../LFrelease/tools/frame_transition_sequence.js
rm frame_transition_sequence-built.js
cp tools/data_file_converter.html ../LFrelease/tools

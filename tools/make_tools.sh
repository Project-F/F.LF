cd ../
node third_party/r.js -o tools/unit_test_suite_build.config
cp tools/unit_test_suite*.html ../LFrelease/tools
cp tools/unit_test_suite_built.js ../LFrelease/tools/unit_test_suite.js
rm tools/unit_test_suite_built.js
cp tools/data_file_converter.* ../LFrelease/tools
cp tools/moving_object_detector.html ../LFrelease/tools
cp tools/AIscript_parser.html ../LFrelease/tools
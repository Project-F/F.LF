/**	plugin builder for requirejs optimization
 */

define(function() {

	fs = require.nodeRequire('fs');

	loadfile = function (url, callback) {
		var file = fs.readFileSync(url, 'utf8');
		//Remove BOM (Byte Mark Order) from utf8 files if it is there.
		if (file.indexOf('\uFEFF') === 0) {
			file = file.substring(1);
		}
		callback(file);
	};

	strip= function (content) {
		return content.replace(/[\n]/g," ")
					.replace(/[\t]/g," ");
	}

	var filecontent='';
	var written=false;

	var loader =
	{
		load: function (name, require, load, config) {
			//console.log('css-build: load: '+name);
			load(true);
			loadfile(name,function(F){
				filecontent+=strip(F);
			});
		},

		write: function (pluginName, moduleName, write, config) {
			if( !written)
			{
				//console.log('css-build: write');
				write('define("cssout", { content:\n"'+filecontent+'"});\n');
				written=true;
			}
		},

		writeFile: function (pluginName, moduleName, write)
		{
			//console.log('css-build: writeFile');
		},

		onLayerEnd: function (write, data)
		{
			//console.log('css-build: onLayerEnd');
		}
	};

	return loader;
});

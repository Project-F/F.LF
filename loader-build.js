/**	plugin builder for requirejs optimization
 */

define(['loader_depend'],function(datalist){

	var fs = require.nodeRequire('fs');
	var written=false;
	var datadump='';

	function loadfile (url, callback) {
		var file = fs.readFileSync(url, 'utf8');
		//Remove BOM (Byte Mark Order) from utf8 files if it is there.
		if (file.indexOf('\uFEFF') === 0) {
			file = file.substring(1);
		}
		//strip define() enclosure
		var a=file.indexOf('{');
		var b=file.lastIndexOf('}');
		file=file.substring(a,b+1);
		return file;
	};

	return {

		load: function (name, require, load, config)
		{
			var datafile={ object:{} };

			//objects
			datadump+='\nobject:\n{\n';
			for( var i=0; i<datalist.object.length; i++)
			{
				if( !datafile.object[datalist.object[i].type])
					 datafile.object[datalist.object[i].type]=[];
				datafile.object[datalist.object[i].type].push(datalist.object[i]);
			}
			var datafile_object_first=true;
			for( var j in datafile.object)
			{	//for each object type
				if( !datafile_object_first)
					datadump+=',\n';
				datafile_object_first=false;

				datadump+="'"+j+"':\n[\n";
				for( var k in datafile.object[j])
				{	//for each object
					var path=datafile.object[j][k].file;
					path=path.replace('data',config.paths.data)+'.js';
					var content = loadfile(path);
					datadump += '{ id: '+datafile.object[j][k].id+', '+
								"type: '"+datafile.object[j][k].type+"', "+
								'data: '+content+
								'}';
					if( k != datafile.object[j].length-1)
						datadump+=',\n';
					else
						datadump+='\n';
				}
				datadump+="]";
			}
			datadump+='\n}\n';
			load();
		},

		write: function (pluginName, moduleName, write, config)
		{
			if( !written)
			{
				console.log('loader-build: write');
				write('define("loader_gamedata", {'+datadump+'});\n');
				written=true;
			}
		}
	}
});


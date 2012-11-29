/** loader is a requirejs plugin
		that loads all the data files as defined by data.js,
		and create a gamedata object in the following structure:
	var gamedata =
	{
		object:
		{
			'0': //type 0
			[ //array
				{ id, type, data},,,
			],,,
		},

		background:
		[
		]
	}
	be aware that game data is loaded once only, and loader will have
		error if you try to load more than once.
 */

define(function(){

	var gamedata={};
	var written=false;

	return {

		load: function (name, require, load, config)
		{
			if( config.isBuild)
			{
				load();
				return;
			}

			require( [name], function (datalist)
			{
				var datafile_depend=[];

				for( var i=0; i<datalist.object.length; i++)
				{
					datafile_depend.push(datalist.object[i].file);
				}

				require( datafile_depend, function ()
				{
					gamedata.object={};
					for( var i=0; i<datalist.object.length; i++)
					{
						var O = datalist.object[i];
						var obj=
						{
							id: O.id,
							type: O.type,
							data: arguments[i]
						};

						if(!gamedata.object[O.type])
							gamedata.object[O.type]=[];
						gamedata.object[O.type].push(obj);
					}

					load(gamedata);
				});
			});
		},

		write: function (pluginName, moduleName, write, config)
		{
			if( !written)
			{
				console.log('loader-build: write');
				written=true;
				var dump='gamedatadump!';
				write('define("gamedatadump", {'+dump+'});\n');
			}
		}
	}
});

/*\
 * loader.js
 * 
 * loader is a requirejs plugin that reads a list of content packages,
 * and selects one of them if there are more than one, and loads it.
\*/

define(['LF/packages'],function(packages){

	return {
		load: function (name, require, load, config)
		{
			var path='';
			var content={};
			var manifest={};

			if( config.isBuild)
			{
				load();
				return ;
			}

			var first,count=0;
			for( var i in packages)
			{
				if( count===0)
					first=i;
				count++;
			}
			if( count===1)
			{
				load_package(packages[first]);
			}

			function load_package(pack)
			{
				path=normalize(pack.path);
				content.location = normalize(config.baseUrl)+path;
				require( [path+'manifest'], function(mani)
				{
					require( [path+mani.data], load_data);
					manifest=mani;
					load_something('properties');
					load_something('resourcemap');
				});
			}
			function normalize(ppp)
			{	//normalize a file path section
				if( ppp==='')
					return ppp;
				ppp=ppp.replace(/\\/g,'/');
				if( ppp.charAt(ppp.length-1)!=='/')
					ppp+='/';
				if( ppp.charAt(0)==='/')
					ppp=ppp.slice(1);
				return ppp;
			}
			function load_data(datalist)
			{
				var datafile_depend=[];
				for( var i=0; i<datalist.object.length; i++)
				{
					datafile_depend.push(path+datalist.object[i].file);
				}
				require( datafile_depend, function()
				{
					var gamedata={};
					for ( var i in datalist)
					{
						if( i==='object')
							gamedata[i]=[];
						else
							gamedata[i]=datalist[i];
					}
					for( var i=0; i<datalist.object.length; i++)
					{
						var O = datalist.object[i];
						var obj=
						{
							id: O.id,
							type: O.type,
							data: arguments[i]
						};

						gamedata.object.push(obj);
					}
					content.data=gamedata;
					load_ready();
				});
			}
			function load_something(thing)
			{
				require( [path+manifest[thing]], function(it){
					content[thing] = it;
					load_ready();
				});
			}
			function load_ready()
			{
				var content_schema=
				{
					data:'object',
					properties:'object',
					resourcemap:'object!optional',
					location:'string'
				}
				if( validate(content_schema,content))
					load(content); //make the require loader return
			}
			/** a simple JSON schema validator*/
			function validate(schema,object)
			{
				var good=false;
				if( object)
				{
					good=true;
					for( var I in schema)
					{
						var sss = schema[I].split('!'),
							type = sss[0],
							option = sss[1] || '';
						if( typeof object[I]===type) {
							//good
						}
						else if (typeof object[I]==='undefined' && 
									option && option==='optional') {
							//still good
						}
						else {
							good=false;
							break;
						}
					}
				}
				return good;
			}
		},
		normalize: function (name, normalize)
		{
			return name;
		}
	}
});

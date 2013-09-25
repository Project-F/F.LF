/*\
 * loader.js
 * 
 * loader is a requirejs plugin that loads content packages
\*/

define(['LF/packages','LF/global'],function(packages,global){

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
				path=normalize_path(pack.path);
				content.location = normalize_path(config.baseUrl)+path;
				require( [path+'manifest'], function(mani)
				{
					manifest=mani;
					var manifest_schema=
					{
						"data":"string",
						"properties":"string",
						"resourcemap":"string!optional"
					}
					if( !validate(manifest_schema,manifest))
					{
						console.log('loader: error: manifest.js of '+path+' is not correct.');
					}
					require( [path+normalize_file(manifest.data)], load_data);
					load_something('properties');
					load_something('resourcemap');
				});
			}
			function normalize_path(ppp)
			{	//normalize a file path section
				if( !ppp)
					return '';
				ppp=ppp.replace(/\\/g,'/');
				if( ppp.charAt(ppp.length-1)!=='/')
					ppp+='/';
				if( ppp.charAt(0)==='/')
					ppp=ppp.slice(1);
				return ppp;
			}
			function normalize_file(ppp)
			{
				if( !ppp)
					return '';
				if( ppp.lastIndexOf('.js')===ppp.length-3)
					ppp = ppp.slice(0,ppp.length-3);
				return ppp;
			}
			function load_data(datalist)
			{
				function allow_load(OO)
				{
					if( typeof global.lazyload==='function')
					{
						if( !global.lazyload(OO))
							return true;
					}
					else
						return true;
				}

				var datafile_depend=[];
				for( var i=0; i<datalist.object.length; i++)
					if( allow_load(datalist.object[i]))
						datafile_depend.push(path+normalize_file(datalist.object[i].file));
				for( var i=0; i<datalist.background.length; i++)
					if( allow_load(datalist.background[i]))
						datafile_depend.push(path+normalize_file(datalist.background[i].file));

				require( datafile_depend, function()
				{
					var gamedata={};
					for ( var i in datalist)
					{
						if( i==='object')
							gamedata[i]=[];
						else if( i==='background')
							gamedata[i]=[];
						else
							gamedata[i]=datalist[i];
					}
					for( var i=0, j=0; i<datalist.object.length; i++)
					{
						var O = datalist.object[i];
						var obj=
						{
							id: O.id,
							type: O.type
						};
						if( allow_load(O))
						{
							obj.data = arguments[j];
							j++
						}
						else
						{
							obj.data = 'lazy';
							obj.file = path+normalize_file(O.file);
						}

						gamedata.object.push(obj);
					}
					for( var i=0; i<datalist.background.length; i++,j++)
					{
						var O = datalist.background[i];
						gamedata.background.push({
							id: O.id,
							data: arguments[j]
						});
					}
					content.data=gamedata;
					module_lazyload();
					load_ready();
				});
			}
			function load_something(thing)
			{
				require( [path+normalize_file(manifest[thing])], function(it){
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
			function module_lazyload()
			{	//embed the lazyload module
				if( typeof global.lazyload==='function')
				{
					content.data.object.load=function(ID,ready)
					{
						var objects=content.data.object;
						var load_list=[];
						var res_list=[];
						for( var i=0; i<ID.length; i++)
						{
							var O; //search for the object
							for( var j=0; j<objects.length; j++)
								if( objects[j].id===ID[i])
								{
									O=objects[j];
									break;
								}
							if( O && O.data==='lazy')
							{
								load_list.push(O);
								res_list .push(O.file);
							}
						}
						requirejs(res_list,function()
						{
							for( var i=0; i<arguments.length; i++)
								load_list[i].data = arguments[i];
							ready();
						});
					}
				}
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

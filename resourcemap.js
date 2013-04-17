/*\
 * resourcemap
 * 
 * a resourcemap allows mapping from a canonical resource name (shorter and understandable) to the actual url (long and ugly)
\*/
define(['F.core/util'],function(Futil){

	/*\
	 * resourcemap
	 [ class ]
	 - map (object)
	 * or
	 - map (array) of maps
	 * schema
	 * 
	 * {
	 - condition (function) return true to enable this map. this is only evaluated once in constructor. you can force re-evaluate by calling `update_condition`. if this property is undefined, it is assumed to be __true__.
	 - resource (object) of name-url pairs. this is optional if a `get()` method is specified.
	 - get (function) given the resource name, return the url. this is optional if a `resource` object is specified.
	 * }
	 * 
	 * example
	 | map =
	 | {
	 |	condition: function()
	 |	{
	 |		if( window.location.href.indexOf('http://')===0)
	 |			return true;
	 |	},
	 |	resource:
	 |	{
	 |		'squirrel.png':'http://imagehost.com/FtvJG6rAG2mdB8aHrEa8qXj8GtbYRpqrQs9F8X8.png'
	 |	},
	 |	get: function(res)
	 |	{
	 |		var url='http://imagehost.com/'+res;
	 |		return url;
	 |	}
	 | }
	\*/
	function mapper(map)
	{
		this.map = Futil.make_array(map);
		for( var i=0; i<this.map.length; i++)
			this.map[i] = new submap(this.map[i]);
	}
	/*\
	 * resourcemap.update_condition
	 [ method ]
	 * update the mapping condition. takes effect in subsequent `get` calls.
	 * the mapping function will be disabled if neither `map.resource` nor `map.get` if defined
	\*/
	mapper.prototype.update_condition=function()
	{
		Futil.call_each(this.map,'update_condition');
	}
	/*\
	 * resourcemap.get
	 [ method ]
	 - res (string) resource name
	 = (string) resource url
	 * 
	 * if there are multiple maps, it will go through them one by one in array order,
	 * and returns the result of the first enabled map. if there is no enabled map,
	 * or all maps return null, return `res` as is.
	 * 
	 * for each enabled map, `get()` will first look into `map.resource` for a match,
	 * and fall back to `map.get()` otherwise. if none of them gives truthy result, return null.
	\*/
	mapper.prototype.get=function(res)
	{
		var url;
		for( var i=0; i<this.map.length; i++)
		{
			url = this.map[i].get(res);
			if( url)
				break;
		}
		return url || res;
	}

	/** individual map instances
	 */
	function submap(map)
	{
		this.map = map;
		this.update_condition();
	}
	submap.prototype.update_condition=function()
	{
		if( this.map.condition)
			this.enable = this.map.condition() || false;
		else
			this.enable = true;
		if( typeof this.map.resource !== 'object' &&
			typeof this.map.get      !== 'function')
			this.enable = false;
	}
	submap.prototype.get=function(res)
	{
		if( this.enable)
		{
			if( this.map.resource && this.map.resource[res])
				return this.map.resource[res];
			else
			{
				var url = this.map.get && this.map.get(res);
				if( url) return url;
			}
		}
		return null;
	}
	//
	return mapper;
});

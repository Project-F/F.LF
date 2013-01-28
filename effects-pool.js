/*\
 * effect_pool
 * an effects pool manages a pool of effect instances using a circular array.
 * - each `effect` instance have the same life time, starting by `born` and end upon `die`.
 * - effect that born earlier should always die earlier
 * - when the pool is full, it can optionally expands
 * 
 * this is particularly useful in creating game effects.
 * say, you have an explosion visual effect that would be created 30 times per second
 * , that frequent object constructions create an overhead.
 * 
 * - effect class should have methods `born` and `die`
 * - each effect instance will be injected a `parent` property
 *  which is a reference to the containing effects pool,
 *  so that an instance can die spontaneously
\*/

define(function()
{
/*\
 * effect_pool
 [ class ]
 - config (object)
 * {
 -  init_size (number)
 -  batch_size (number)
 -  max_size (number)
 -  construct (function) should return newly created instances of effect
 * }
 | var ef_config=
 | {
 | 	init_size: 5,
 | 	batch_size: 5,
 | 	max_size: 100,
 | 	construct: function()
 | 	{
 | 		return new box_effect(1);
 | 	}
 | };
 | var effects = new Effects_pool(ef_config);
 * [example](../sample/effects-pool.html)
 # <iframe src="../sample/effects-pool.html" width="800" height="100"></iframe>
\*/
function efpool(config)
{
	this.pool=[]; //let it be a circular pool
	this.S=0; //start pivot
	this.E=0; //end pivot
	this.full=false;
	this.config=config;
	this.livecount=0;

	if( config.new_arg)
	{
		if( config.new_arg instanceof Array)
			this.new_arg = config.new_arg;
		else
			this.new_arg = [config.new_arg];
	}
	else
		this.new_arg = [];

	for( var i=0; i<config.init_size; i++)
	{
		this.pool[i] = config.construct();
		this.pool[i].parent = this;
	}
}

/*\
 * effect_pool.create
 [ method ]
 * activate an effect by calling `born`
 - arg (any) args will be passed through to `born`
 = (boolean) false if not okay
 = (object) reference to the new born effect if okay
 > Details
 * if the pool is full (all instances of effects are active) and __after__ expanding
 * the size is still smaller than or equal to `config.max_size`,
 * will expand the pool by size `config.batch_size`
 * 
 * if the pool is full and not allowed to expand, return false immediately
\*/
efpool.prototype.create=function(/*arg*/) //arguments will be passed through
{
	if( this.full)
	{
		if( this.pool.length + this.config.batch_size <= this.config.max_size)
		{	//expand the pool
			//console.log('expanding the pool');
			var args=[ this.E, 0];
			for( var i=0; i<this.config.batch_size; i++)
			{
				args[i+2] = this.config.construct();
				args[i+2].parent = this;
			}
			this.pool.splice.apply( this.pool, args);
			if( this.S!==0)
				this.S += this.config.batch_size;
			this.full=false;
		}
		else
			return false;
	}

	if( this.E < this.pool.length)
		this.E++;
	else
		this.E=1;

	if( this.E === this.S || (this.S===0 && this.E===this.pool.length))
	{
		//console.log('effects pool full');
		this.full=true;
	}

	if( this.pool[this.E-1].born)
		this.pool[this.E-1].born.apply ( this.pool[this.E-1], arguments);

	this.livecount++;
	return this.pool[this.E-1];
}

/*\
 * effect_pool.die
 [ method ]
 * deactivate the oldest effect instance by calling `die`
 - arg (any) args will be passed through to `die`
 = (object) a reference to the instance that died
 = (undefined) if there is actually no active effect
\*/
efpool.prototype.die=function(/*arg*/) //arguments will be passed through
{
	if( this.livecount > 0)
	{
		var oldS=this.S;
		if( this.pool[this.S].die)
			this.pool[this.S].die.apply ( this.pool[this.S], arguments);

		if( this.S < this.pool.length-1)
			this.S++;
		else
			this.S=0;

		this.full = false;
		this.livecount--;
		return this.pool[oldS];
	}
	else
		console.log('die too much!');
}

/*\
 * effect_pool.for_each
 [ method ]
 * iterate through all active instances, in the order of oldest to youngest
 - fun (function)
| efpool.for_each(function(e)
| {
|		e.hi();
| })
\*/
efpool.prototype.for_each=function(fun)
{
	if( !this.full && this.S === this.E)
	{
		//completely empty
	}
	else if( this.S < this.E)
	{
		//  _ _S_ _E_
		// |_|_|*|*|_|
		for ( var i=this.S; i<this.E; i++)
			fun( this.pool[i]);
	}
	else
	{
		//  _ _E_ _S_
		// |*|*|_|_|*|
		for ( var j=this.S; j<this.pool.length; j++)
			fun( this.pool[j]);
		for ( var i=0; i<this.E; i++)
			fun( this.pool[i]);
	}
}

/*\
 * effect_pool.call_each
 [ method ]
 * call a method of each active instance, in the order of oldest to youngest
 - fun_name (string) method name
 - arg (any) extra args will be passed through
\*/
efpool.prototype.call_each=function(fun_name /*, arg*/) //arguments will be passed through
{
	if( this.pool[0][fun_name])
	{
		var arg= Array.prototype.slice.call(arguments,1);
		this.for_each(function(ef)
		{
			ef[fun_name].apply(ef, arg);
		});
	}
}

return efpool;
});

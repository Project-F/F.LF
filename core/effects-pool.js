/*\
 * effects_pool
 * an effects pool manages a pool of effect instances, which is particularly useful in creating game effects.
 * say, you have an explosion visual effect that would be created 30 times per second
 * , that frequent object constructions create an overhead.
 * 
 * - effect class should have methods `born` and `die`
 * - each effect instance will be injected a `parent` property
 *  which is a reference to the containing effects pool,
 *  so that an instance can die spontaneously
 * - when the pool is full, it can optionally expands
 * 
 * there are two flavors:
 * 
 * __circular=true__
 * - all `effect` instances have the same life time, starting by `born` and end upon `die`
 * - effect that born earlier should always die earlier
 * - the most efficient object management
 * 
 * __circular=false__
 * - each `effect` instance has different life span
 * - must specify target when `die` is called
 * - less efficient object management
\*/

define(function()
{
/*\
 * effects_pool
 [ class ]
 - config (object)
 * {
 -  circular (bool)
 -  init_size (number)
 -  batch_size (number)
 -  max_size (number)
 -  construct (function) should return newly created instances of effect
 * }
 | var ef_config=
 | {
 |  circular: true,
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
function effects_pool(config)
{
	if( config.circular)
		return new crpool(config);
	else
		return new lnpool(config);
}

//circular effects pool
function crpool(config)
{
	this.pool=[]; //let it be a circular pool
	this.S=0; //start pivot
	this.E=0; //end pivot
	this.full=false;
	this.config=config;
	this.livecount=0;

	for( var i=0; i<config.init_size; i++)
	{
		this.pool[i] = config.construct();
		this.pool[i].parent = this;
	}
}

/*\
 * effects_pool.create
 [ method ]
 * activate an effect by calling `born`
 - arg (any) args will be passed through to `born`
 = (boolean) false if not okay
 = (object) reference to the new born effect if okay
 > Details
 * if the pool is full (all instances of effects are active) and __after__ expanding the size is still smaller than or equal to `config.max_size`, will expand the pool by size `config.batch_size`
 * 
 * if the pool is full and not allowed to expand, return false immediately
\*/
crpool.prototype.create=function(/*arg*/) //arguments will be passed through
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
		this.full=true;
	}

	if( this.pool[this.E-1].born)
		this.pool[this.E-1].born.apply ( this.pool[this.E-1], arguments);

	this.livecount++;
	return this.pool[this.E-1];
}

/*\
 * effects_pool.die
 [ method ]
 * killing an effect instance
 - target (object) if pool is circular, this parameter is ignored, and the oldest effect instance will be killed
 - arg (any) extra args will be passed through to `die`
 = (object) a reference to the instance that died
 = (undefined) if there is actually no active effect
\*/
crpool.prototype.die=function(target /*,arg*/)
{
	if( this.livecount > 0)
	{
		var oldS=this.S;
		if( this.pool[this.S].die)
			this.pool[this.S].die.apply( this.pool[this.S], Array.prototype.slice.call(arguments,1));

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
 * effects_pool.for_each
 [ method ]
 * iterate through all active instances.
 * 
 * (if the pool is circular, in the order of oldest to youngest)
 - fun (function) iterator function, if return value is 'break', will break the loop
| crpool.for_each(function(e)
| {
|		e.hi();
| })
\*/
crpool.prototype.for_each=function(fun)
{
	if( this.livecount===0)
	{
		//completely empty
	}
	else if( this.S < this.E)
	{
		//  _ _S_ _E_
		// |_|_|*|*|_|
		for ( var i=this.S; i<this.E; i++)
			if( fun( this.pool[i])==='break')
				break;
	}
	else
	{
		//  _ _E_ _S_
		// |*|*|_|_|*|
		for ( var j=this.S; j<this.pool.length; j++)
			if( fun( this.pool[j])==='break')
				return ;
		for ( var i=0; i<this.E; i++)
			if( fun( this.pool[i])==='break')
				return ;
	}
}

/*\
 * effects_pool.call_each
 [ method ]
 * call a method of each active instance
 * 
 * (if the pool is circular, in the order of oldest to youngest)
 - fun_name (string) method name
 - arg (any) extra args will be passed through
\*/
crpool.prototype.call_each=function(fun_name /*, arg*/)
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

//linear effects pool
function lnpool(config)
{
	this.pool=[];
	this.alive=[];//state array
	this.config=config;
	this.livecount=0;
	
	for( var i=0; i<config.init_size; i++)
	{
		this.pool[i] = config.construct();
		this.pool[i].parent = this;
		this.alive[i] = false;
	}
}

lnpool.prototype.create=function(/*arg*/)
{
	var freeslot = this.alive.indexOf(false);
	if( freeslot===-1)
	{	//pool is full
		if( this.pool.length + this.config.batch_size <= this.config.max_size)
		{	//expand the pool
			var args1=[ this.pool.length, 0],
				args2=[ this.pool.length, 0];
			for( var i=0; i<this.config.batch_size; i++)
			{
				args1[i+2] = this.config.construct();
				args1[i+2].parent = this;
				args2[i+2] = false;
			}
			this.pool.splice.apply( this.pool, args1);
			this.alive.splice.apply( this.alive, args2);
			if( this.S!==0)
				this.S += this.config.batch_size;
		}
		else
			return false;
	}
	
	freeslot = this.alive.indexOf(false);
	var baby = this.pool[freeslot];
	this.alive[freeslot] = true;
	this.livecount++;
	baby.born.apply( baby, arguments);
	return baby;
}

lnpool.prototype.die=function(target /*,arg*/)
{
	var e = this.pool.indexOf(target);
	if( e===-1 || !this.alive[e])
	{
		console.log('wrong target');
		return false;
	}
	target.die.apply( target, Array.prototype.slice.call(arguments,1));
	this.alive[e] = false;
	this.livecount--;
	return target;
}

lnpool.prototype.for_each=function(fun)
{
	if( this.livecount===0)
	{
		//completely empty
	}
	else
	{
		for( var i=0; i<this.pool.length; i++)
		{
			if( this.alive[i])
				if( fun( this.pool[i])==='break')
					break;
		}
	}
}

lnpool.prototype.call_each=function(fun_name /*,arg*/)
{
	if( this.livecount===0)
	{
		//completely empty
	}
	else
	{
		for( var i=0; i<this.pool.length; i++)
		{
			if( this.alive[i])
				if( this.pool[i][fun_name])
					this.pool[i][fun_name].apply(this.pool[i], Array.prototype.slice.call(arguments,1));
		}
	}
}

return effects_pool;
});

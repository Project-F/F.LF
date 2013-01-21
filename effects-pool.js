/** an effects pool manages a pool of effect instances using a circular array.
	- each `effect` instance have the same life time, starting by `born` and end upon `die`.
	- effect that born earlier should always die earlier
	- when the pool is full, it can optionally expands

	this is particularly useful in creating game effects.
	say, you have an explosion visual effect that would be created 30 times per second
	 , that frequent object constructions create an overhead.

	- effect class should have methods `born` and `die`
	- each effect instance will be injected a `parent` property
	  which is a reference to the containing effects pool,
	  so that an instance can die spontaneously
 */

define(function()
{

/** config=
{
	init_size,
	batch_size,
	max_size,
	construct //constructs a new instance
} */
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

/**	create new effect instance
 */
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
			return ;
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
}

// the oldest effect instance dies
efpool.prototype.die=function(/*arg*/) //arguments will be passed through
{
	if( this.livecount > 0)
	{
		if( this.pool[this.S].die)
			this.pool[this.S].die.apply ( this.pool[this.S], arguments);

		if( this.S < this.pool.length-1)
			this.S++;
		else
			this.S=0;

		this.full = false;
		this.livecount--;
	}
	else
		console.log('die too much!');
}

// for each active instance
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
		for ( var i=0; i<this.E; i++)
			fun( this.pool[i]);
		for ( var j=this.S; j<this.pool.length; j++)
			fun( this.pool[j])
	}
}

// call a function for each instance
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

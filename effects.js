/** handle visual effects
	like blood, fire, etc
 */

define(['LF/global','LF/sprite','F.core/effects-pool'],
function ( Global, Sprite, Feffects_pool)
{

/** effect_set is the set of all kinds of effects
	this is a big manager. there is only 1 instance of effect_set in a match.
 */
function effect_set(config,DATA,ID) //DATA and ID are arrays
{
	this.efs={};
	for( var i=0; i<DATA.length; i++)
	{
		var ef_config=
		{
			init_size: 5,
			batch_size: 5,
			max_size: 30,
			construct: function()
			{
				return new effect(config,DATA[i],ID[i]);
			}
		}
		var efpool = this.efs[ID[i]] = new Feffects_pool(ef_config);
	}
}

/**	@param param
	@param id object id of the desired effect
	@param subnum specify the variant of an effect
 */
effect_set.prototype.create=function(param,id,subnum)
{
	if( !subnum) subnum=0;
	if( this.efs[id])
		this.efs[id].create(param,subnum);
}

effect_set.prototype.TU=function()
{
	for ( var i in this.efs)
	{
		this.efs[i].TU();
	}
}

effect_set.prototype.transit=function()
{
}

/** extends Feffects_pool with custom method
 */
Feffects_pool.prototype.TU=function()
{
	this.for_each(function(E){
		E.TU();
	});
}

/*
function effects(config,data,id)
{
	this.pool=[]; //let it be a circular pool
	this.S=0; //start pivot
	this.E=0; //end pivot
	this.type=data.effect_list;
	this.full=false;
	this.config=config;
	this.data=data;
	this.id=id;

	if( !this.type)
		this.type={};

	for( var i=0; i<config.init_size; i++)
	{
		this.pool[i] = new effect(config,data,id, this);
	}
}

effects.prototype.create=function(P,N)
{
	if( this.full)
	{
		if( this.pool.length + this.config.batch_size <= this.config.max_size)
		{	//expand the pool
			var args=[ this.E, 0];
			for( var i=0; i<this.config.batch_size; i++)
			{
				args.push( new effect(this.config,this.data,this.id, this));
			}
			this.pool.splice.apply( this.pool, args);
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
		console.log('effects pool satuated');
		this.full=true;
	}

	var sf;
	if( this.type[N] && this.type[N].frame)
		sf = this.type[N].frame;
	else
		sf = 0;
	this.pool[this.E-1].born(P,sf);
}

effects.prototype.finish=function() //let effects die themselves! do not invoke this
{
	if( this.S < this.pool.length-1)
		this.S++;
	else
		this.S=0;

	this.full = false;
}

effects.prototype.TU=function()
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
			this.pool[i].TU();
	}
	else
	{
		//  _ _E_ _S_
		// |*|*|_|_|*|
		for ( var i=0; i<this.E; i++)
			this.pool[i].TU();
		for ( var j=this.S; j<this.pool.length; j++)
			this.pool[j].TU();
	}
} */

/**	individual effect
	they are like other living objects but much simplier.
	they are short-lived, `born` as triggered by `effects-pool` and `die` spontaneously
 */
function effect(config,data,id)
{
	this.dat=data;
	this.type=data.effect_list;
	this.id=id;
	this.sp = new Sprite(this.dat.bmp, config.stage);
	this.sp.hide();
	this.frame;
	this.frameD;
	this.wait=-1;
	this.next;
}

effect.prototype.TU=function()
{
	this.sp.show_pic(this.frameD.pic);
	this.wait=this.frameD.wait;
	this.next=this.frameD.next;

	if( this.wait===0)
	{
		if( this.next===999)
			this.next=0;
		else if( this.next===1000)
		{
			this.sp.hide();
			this.parent.die();
			return ;
		}

		this.frame=this.next;
		this.frameD=this.dat.frame[this.frame];
	}
	else
		this.wait--;
}

effect.prototype.transit=function()
{
}

effect.prototype.set_pos=function(x,y,z)
{
}

effect.prototype.born=function(P,N)
{
	var sf;
	if( this.type[N] && this.type[N].frame)
		sf = this.type[N].frame;
	else
		sf = 0;
	this.frame=sf;
	this.frameD=this.dat.frame[this.frame];

	var x=P.x - this.frameD.centerx;
	var y=P.y - this.frameD.centery;
	var z=P.z;
	this.sp.set_xy({x:x, y:y+z});
	this.sp.set_z(z+1);
	this.sp.show_pic(this.frameD.pic);
	this.sp.show();
}

return effect_set;
});

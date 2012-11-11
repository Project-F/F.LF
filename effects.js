/** handle visual effects
	like blood, fire, etc
 */

define(['LF/global','LF/sprite'],
function ( Global, Sprite)
{

function effect_set(config,DATA,ID) //DATA and ID are arrays
{
	this.efs={};
	for( var i=0; i<DATA.length; i++)
	{
		this.efs[ID[i]] = new effects(config,DATA[i],ID[i]);
	}
}

/**	@param param
	@param num effect number, note that object id is 300+num
	@param subnum specify the variants of an effect
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

/** effects is a single object managing a pool of effect instances
	the pool is circular and is built upon the assumption that each effect
	instance has the same life time, such that effects that born earlier
	will always die earlier.
 */
/** config=
	{
		init_size,
		stage
	}
 */
function effects(config,data,id)
{
	this.pool=[]; //let it be a circular pool
	this.S=0; //start pivot
	this.E=0; //end pivot
	this.type=data.effect_list;
	this.full=false;

	if( !this.type)
		this.type={};

	for( var i=0; i<config.init_size; i++)
	{
		this.pool[i] = new effect(config,data,id, this);
	}
}

/**	create new effect instance
	@param P position in {x,y,z}
	@param N effect sub- number (as defined in effect_list)
 */
effects.prototype.create=function(P,N)
{
	if( this.full)
		return ; // TODO: expand the pool instead of ignoring

	if( this.E < this.pool.length)
		this.E++;
	else
		this.E=1;

	if( this.E === this.S)
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
}

/**	individual effect instances
	they are like `standard` living objects but much simplier
	but with special interface to be controlled explicitly by effects.
	they are short-lived, `born` as triggered by `effects` and `die` spontaneously
 */
function effect(config,data,id, parent)
{
	this.parent=parent;
	this.dat=data;
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
			this.die();
			return ;
		}

		this.frame=this.next;
		this.frameD=this.dat.frame[this.frame];
	}
	else
		this.wait--;
}

effect.prototype.trans=function()
{
}

effect.prototype.set_pos=function(x,y,z)
{
}

effect.prototype.born=function(P,N)
{
	this.frame=N;
	this.frameD=this.dat.frame[this.frame];

	var x=P.x - this.frameD.centerx;
	var y=P.y - this.frameD.centery;
	var z=P.z;
	this.sp.set_xy({x:x, y:y+z});
	this.sp.set_z(z+1);
	this.sp.show_pic(this.frameD.pic);
	this.sp.show();
}

effect.prototype.die=function()
{
	this.sp.hide();
	this.parent.finish();
}

return effect_set;
});

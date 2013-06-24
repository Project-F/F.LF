/*\
 * effect
 * 
 * handle visual effects
 * like blood, fire, etc
\*/

define(['LF/global','LF/sprite','F.core/effects-pool'],
function ( Global, Sprite, Feffects_pool)
{

/*\
 * effect_set
 [ class ]
 * effect_set is the set for all kinds of effects
 * this is a big manager. there is only 1 instance of effect_set in a match.
 - config (object)
 - DATA (array) of data (object)
 - ID (array) of ID (number)
\*/
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

effect_set.prototype.destroy=function()
{
	for( var i in this.efs)
		this.efs[i].destroy();
}

/*\
 * effect_set.create
 [ method ]
 - param (object) `{x,y,z}` position to create the effect
 - id (number) id of the desired effect
 - subnum (number) specify the variant of an effect
\*/
effect_set.prototype.create=function(param,id,subnum)
{
	if( !subnum) subnum=0;
	if( this.efs[id])
		this.efs[id].create(param,subnum);
}

effect_set.prototype.TU=function()
{
	for( var i in this.efs)
		this.efs[i].TU();
}

effect_set.prototype.transit=function()
{
}

/** extends Feffects_pool with custom method
 note: this have side effect, affecting Feffects_pool globally
 */
Feffects_pool.prototype.TU=function()
{
	this.for_each(function(E){
		E.TU();
	});
}
Feffects_pool.prototype.destroy=function()
{
	//destroy all, no matter active or not
	for( var i=0; i<this.pool.length; i++)
	{
		this.pool[i].destroy();
	}
}

/*\
 * effect_unit
 [ class ]
 * individual effect
 * 
 * they are like other living objects but much simplier.
 * they are short-lived, `born` as triggered by `effects-pool` and `die` spontaneously
\*/
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

effect.prototype.destroy=function()
{
	this.sp.destroy();
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
	this.sp.set_x_y(x, y+z);
	this.sp.set_z(z+1);
	this.sp.show_pic(this.frameD.pic);
	this.sp.show();
}

return effect_set;
});

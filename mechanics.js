/*\
 * mechanics
 * 
 * mechanical properties that all living objects should have
\*/

define(['LF/global','data/specification'],
function(Global, Spec){

var GC=Global.gameplay;

/*\
 * mech
 [ class ]
 * mech is a state-less helper class that processes most of the mechanics of living objects
\*/
function mech(parent)
{
	if( Spec[parent.id] && Spec[parent.id].mass)
		this.mass=Spec[parent.id].mass;
	else
		this.mass=Global.gameplay.default.machanics.mass;

	this.ps;
	this.sp=parent.sp;
	this.frame=parent.frame;
	this.parent=parent;
}

//return the array of volume of the current frame, that volume can be bdy,itr or other
mech.prototype.body= function(obj,filter,offset)
{
	var ps=this.ps;
	var sp=this.sp;
	var off=offset;
	if(!obj)
		obj=this.frame.D.bdy;

	if( obj instanceof Array)
	{ //many bdy
		if( !filter && obj.length === 2)
		{ //unroll the loop
			return ([this.volume(obj[0],off),
				this.volume(obj[1],off)
			]);
		}
		else if( !filter && obj.length === 3)
		{ //unroll the loop
			return ([this.volume(obj[0],off),
				this.volume(obj[1],off),
				this.volume(obj[2],off)
			]);
		}
		else
		{
			var B=[];
			for( var i in obj)
			{
				if( !filter || filter(obj[i]))
					B.push( this.volume(obj[i],off) );
			}
			return B;
		}
	}
	else
	{ //1 bdy only
		if( !filter || filter(obj))
			return [this.volume(obj,off)];
		else
			return [];
	}
}

/** make a `volume` that is compatible with `scene` query
	param O volume in data
	param V offset
 */
mech.prototype.volume= function(O,V)
{
	var ps=this.ps;
	var sp=this.sp;

	if( !O)
	{
		if( !V)
			return {
				x:ps.sx, y:ps.sy, z:ps.sz,
				vx:0, vy:0, w:0, h:0, zwidth:0,
				data: {}
			}
		else
			return {
				x:V.x, y:V.y, z:V.z,
				vx:0, vy:0, w:0, h:0, zwidth:0,
				data: {}
			}
	}

	var vx=O.x;
	if( ps.dir==='left')
		vx=sp.w-O.x-O.w;

	if( !V)
		return {
			x:ps.sx, y:ps.sy, z:ps.sz,
			vx: vx,
			vy: O.y,
			w : O.w,
			h : O.h,
			zwidth: O.zwidth? O.zwidth : GC.default.itr.zwidth,
			data: O
		}
	else
		return {
			x:ps.sx+V.x, y:ps.sy+V.y, z:ps.sz+V.z,
			vx: vx,
			vy: O.y,
			w : O.w,
			h : O.h,
			zwidth: O.zwidth? O.zwidth : GC.default.itr.zwidth,
			data: O
		}
}

mech.prototype.make_point= function(a)
{
	var ps=this.ps;
	var sp=this.sp;

	if( a)
	{
		if( ps.dir==='right')
			return {x:ps.sx+a.x, y:ps.sy+a.y, z:ps.sz+a.y};
		else
			return {x:ps.sx+sp.w-a.x, y:ps.sy+a.y, z:ps.sz+a.y};
	}
	else
	{
		alert('make point failed');
		return {x:ps.sx, y:ps.sy, z:ps.sz};
	}
}

//move myself *along xz* to coincide point a with point b such that point b is a point of myself
mech.prototype.coincideXZ= function(a,b)
{
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;

	var vx=a.x-b.x;
	var vz=a.z-b.z;
	ps.x+=vx;
	ps.z+=vz;
	ps.sx = ps.dir==='right'? (ps.x-fD.centerx):(ps.x+fD.centerx-sp.w);
}

//move myself *along xy* to coincide point a with point b such that point b is a point of myself
mech.prototype.coincideXY= function(a,b)
{
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;

	var vx=a.x-b.x;
	var vy=a.y-b.y;
	ps.x+=vx;
	ps.y+=vy;
	ps.sx = ps.dir==='right'? (ps.x-fD.centerx):(ps.x+fD.centerx-sp.w);
	ps.sy = ps.y - fD.centery;
}

mech.prototype.create_metric= function()
{
	this.ps = {
		sx:0,sy:0,sz:0, //sprite origin, read-only
		x:0, y:0, z:0, //feet position as in centerx,centery
		vx:0,vy:0,vz:0, //velocity
		zz:0,  //z order deviation
		dir:'right'  //direction
	}
	return this.ps;
}

mech.prototype.reset= function()
{
	//frame,ps,sp
	ps.x=0; ps.y=0; ps.z=0;
	ps.sx=0; ps.sy=0; ps.sz=0;
	ps.vx=0; ps.vy=0; ps.vz=0;
	ps.zz=0;
	ps.dir='right';
}

//place the feet position of the object at x,y,z
mech.prototype.set_pos= function(x,y,z)
{
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;

	ps.x=x; ps.y=y; ps.z=z;
	ps.sx = ps.dir==='right'? (ps.x-fD.centerx):(ps.x+fD.centerx-sp.w);
	ps.sy = y - fD.centery;
	ps.sz = z;
}

mech.prototype.dynamics= function()
{
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;
	var fmob=this.frame.mobility;
	var GC=Global.gameplay;

	if( !this.blocking_xz())
	{
		ps.x += ps.vx * fmob;
		ps.z += ps.vz * fmob;
	}
	ps.y += ps.vy * fmob;

	ps.sx = ps.dir==='right'? (ps.x-fD.centerx):(ps.x+fD.centerx-sp.w);
	ps.sy = ps.y - fD.centery;
	ps.sz = ps.z;

	if( ps.y>0)
	{	//never below the ground
		ps.y=0;
		ps.sy = ps.y - fD.centery;
	}

	sp.set_xy({x:ps.sx, y:ps.sy+ps.sz}); //projection onto screen
	sp.set_z(ps.sz+ps.zz);  //z ordering

	if( ps.y===0) //only when on the ground
	{	//viscous friction
		ps.vx -= GC.friction.factor.degree1*ps.vx + GC.friction.factor.degree2*ps.vx*ps.vx*(ps.vx>=0?1:-1);
		ps.vz -= GC.friction.factor.degree1*ps.vz + GC.friction.factor.degree2*ps.vz*ps.vz*(ps.vz>=0?1:-1);
		if( ps.vx!==0 && ps.vx>-GC.min_speed && ps.vx<GC.min_speed) ps.vx=0; //defined minimum speed
		if( ps.vz!==0 && ps.vz>-GC.min_speed && ps.vz<GC.min_speed) ps.vz=0;
	}

	if( ps.y<0)
		ps.vy+= this.mass * GC.gravity;
}

//return true if there is a blocking itr:kind:14 ahead
mech.prototype.blocking_xz=function()
{
	var offset = {
		x: this.ps.vx * this.frame.mobility,
		y: 0,
		z: this.ps.vz * this.frame.mobility
	}

	var body = this.body(null,null,offset);
	for( var i in body)
	{
		body[i].zwidth=0;
		var result = this.parent.scene.query( body[i], this.parent, {tag:'itr:14'});
		if( result.length > 0)
			return true;
	}
}

mech.prototype.project= function()
{
	var ps=this.ps;
	var sp=this.sp;
	sp.set_xy({x:ps.sx, y:ps.sy+ps.sz}); //projection onto screen
	sp.set_z(ps.sz+ps.zz);  //z ordering
}

mech.prototype.speed=function()
{
	var ps=this.ps;
	return Math.sqrt(ps.vx*ps.vx + ps.vy*ps.vy);
}

return mech;
});

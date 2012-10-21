/**	mechanics
	mechanical properties that all living objects should have
 */

define(function(){

function mech(frame,sp)
{
	this.frame=frame;
	this.sp=sp;
}

mech.prototype.body= function() //return the array of bdy volume of the current frame
{
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;

	if( fD.bdy instanceof Array)
	{ //many bdy
		if( fD.bdy.length === 2)
		{ //unroll the loop
			return ([this.volume(fD.bdy[0]),
				this.volume(fD.bdy[1])
			]);
		}
		else if( fD.bdy.length === 3)
		{ //unroll the loop
			return ([this.volume(fD.bdy[0]),
				this.volume(fD.bdy[1]),
				this.volume(fD.bdy[2])
			]);
		}
		else
		{
			var B=[];
			for( var i in fD.bdy)
			{
				B.push( this.volume(fD.bdy[i]) );
			}
			return B;
		}
	}
	else
	{ //1 bdy only
		return ([this.volume(fD.bdy)]);
	}
}

mech.prototype.volume= function(O)
{
	var ps=this.ps;
	var sp=this.sp;

	if( !O)
		return {
			x:ps.sx, y:ps.sy, z:ps.sz,
			vx:0, vy:0, w:0, h:0, zwidth:0
		};

	var vx=O.x;
	if( ps.dir==='left')
		vx=sp.w-O.x-O.w;

	return {x:ps.sx, y:ps.sy, z:ps.sz,
		vx: vx,
		vy: O.y,
		w : O.w,
		h : O.h,
		zwidth: O.zwidth? O.zwidth:0
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

mech.prototype.coincideXZ= function(a,b)
{	//move myself *along xz* to coincide point a with point b
	//  such that point b is a point of myself
	var ps=this.ps;
	var sp=this.sp;
	var fD=this.frame.D;

	var vx=a.x-b.x;
	var vz=a.z-b.z;
	ps.x+=vx;
	ps.z+=vz;
	ps.sx = ps.dir==='right'? (ps.x-fD.centerx):(ps.x+fD.centerx-sp.w);
}

mech.prototype.coincideXY= function(a,b)
{	//move myself *along xy* to coincide point a with point b
	//  such that point b is a point of myself
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
		x:0, y:0, z:0, //center of mass as in centerx,centery
		vx:0,vy:0,vz:0, //velocity
		zz:0,  //z order deviation
		dir:'right'  //direction
	}
	return this.ps;
}

mech.prototype.set_pos= function(x,y,z)
{	//place the center of mass of the object at x,y,z
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

	ps.x += ps.vx * fmob;
	ps.y += ps.vy * fmob;
	ps.z += ps.vz * fmob;

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
		ps.vx *= 0.74; //defined coefficient of friction
		ps.vz *= 0.74;
		if( ps.vx>-1 && ps.vx<1) ps.vx=0; //defined minimum speed
		if( ps.vz>-1 && ps.vz<1) ps.vz=0;
	}

	if( ps.y<0) //gravity
		ps.vy+= 1.7; //defined gravity
}

mech.prototype.project= function()
{
	var ps=this.ps;
	var sp=this.sp;
	sp.set_xy({x:ps.sx, y:ps.sy+ps.sz}); //projection onto screen
	sp.set_z(ps.sz+ps.zz);  //z ordering
}

return mech;
});
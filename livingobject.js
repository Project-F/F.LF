define(function(){

function body (frameD, ps, sp, dir) //return the array of bdy volume of the current frame
{
	if( frameD.bdy instanceof Array)
	{ //many bdy
		if( frameD.bdy.length === 2)
		{ //unroll the loop
			return ([volume(frameD.bdy[0], ps,sp,dir),
				volume(frameD.bdy[1], ps,sp,dir)
			]);
		}
		else if( frameD.bdy.length === 3)
		{ //unroll the loop
			return ([volume(frameD.bdy[0], ps,sp,dir),
				volume(frameD.bdy[1], ps,sp,dir),
				volume(frameD.bdy[2], ps,sp,dir)
			]);
		}
		else
		{
			var B=[];
			for( var i in frameD.bdy)
			{
				B.push( volume(frameD.bdy[i], ps,sp,dir) );
			}
			return B;
		}
	}
	else
	{ //1 bdy only
		return ([volume(frameD.bdy, ps,sp,dir)]);
	}
}

function volume (O, ps, sp, dir)
{
	if( !O)
		return {
			x:ps.x, y:ps.y, z:ps.z,
			vx:0, vy:0, w:0, h:0, zwidth:0
		};

	var vx=O.x;
	if( dir==='left')
		vx=sp.w-O.x-O.w;

	return {x:ps.x, y:ps.y, z:ps.z,
		vx: vx,
		vy: O.y,
		w : O.w,
		h : O.h,
		zwidth: O.zwidth? O.zwidth:0
	};
}

function make_point(a, ps, sp, dir)
{
	if( a)
	{
		if( dir==='right')
			return {x:ps.x+a.x, y:ps.y+a.y, z:ps.z+a.y};
		else
			return {x:ps.x+sp.w-a.x, y:ps.y+a.y, z:ps.z+a.y};
	}
	else
	{
		alert('make point failed');
		return {x:ps.x, z:ps.z};
	}
}

function coincideXZ(a,b, ps)
{	//move myself *along xz* to coincide point a with point b
	//  such that point b is a point of myself
	var vx=a.x-b.x;
	var vz=a.z-b.z;
	ps.x+=vx;
	ps.z+=vz;
}

function coincideXY(a,b, ps)
{	//move myself *along xy* to coincide point a with point b
	//  such that point b is a point of myself
	var vx=a.x-b.x;
	var vy=a.y-b.y;
	ps.x+=vx;
	ps.y+=vy;
}

return {
	body:body,
	volume:volume,
	make_point:make_point,
	coincideXZ:coincideXZ,
	coincideXY:coincideXY
};

});
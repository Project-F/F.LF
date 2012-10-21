//scene in F.LF
//	keeps a list a characters and items
//	scrolling across the background
/*	vol= //the volume format
	{
		x, y, z, //the reference point
		vx, vy, vw, vh, //the volume defined with reference to (x,y,z)
		zwidth	//zwidth spans into the +ve and -ve direction
	}
 */

define(['core/collision'], function (Fcollision)
{
var UID=0;

function scene (config)
{
	this.obj = new Array(); //all objects
}

scene.prototype.add = function(C)
{
	this.obj.push(C);
	C.uid = UID++;
}

scene.prototype.query = function(volume, This, filter) //return the all the objects whose `bdy` intersect with `volume`
		//except `This`
		//what to intersect with. {body:0} to intersect with body and {itr:2} to intersect with itr kind:2
{
	var result=[];
	var tag, type;
	for ( var kk in filter)
	{
		tag=kk;
		type=filter[kk];
		break;
	}

	for ( var i in this.obj)
	{
		if( this.obj[i] === This)
			continue;

		if( tag==='itr')
		{
			if( this.obj[i].itr) //not every object has itr
			{
				var itr = this.obj[i].itr(type);
				for( var j in itr)
				{
					if( itr[j].kind===type)
					{
						if( this.intersect( volume, itr[j]))
						{
							result.push( this.obj[i] );
							break;
						}
					}
				}
			}
		}
		else
		{
			var bdy = this.obj[i].bdy();
			for( var j in bdy)
			{
				if( this.intersect( volume, bdy[j] ))
				{
					result.push( this.obj[i] );
					break;
				}
			}
		}
	}
	return result;
}

scene.prototype.intersect = function(A,B) //return true if volume A and B intersect
{
	var AV={ left:A.x+A.vx, top:A.y+A.vy, right:A.x+A.vx+A.w, bottom:A.y+A.vy+A.h };
	var BV={ left:B.x+B.vx, top:B.y+B.vy, right:B.x+B.vx+B.w, bottom:B.y+B.vy+B.h };

	return ( Fcollision.rect( AV, BV ) && Fcollision.rect(
	{ left:A.z-A.zwidth, top:0, right:A.z+A.zwidth, bottom:1 },
	{ left:B.z-B.zwidth, top:0, right:B.z+B.zwidth, bottom:1 }
	));
}

scene.prototype.distance=function(A,B) //return the distance between object A and B, as measured at center points
{
	var dx= (A.x+A.centerx) - (B.x+B.centerx);
	var dy= A.y - B.y;
	var dz= (A.z+A.centery) - (B.z+B.centery);

	return Math.sqrt(dx*dx+dy*dy+dz*dz);
}

return scene;
});

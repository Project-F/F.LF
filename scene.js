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

define(['core/util','core/collision'], function (Futil,Fcollision)
{
var UID=0;

function scene (config)
{
	this.live = {}; //list of living objects
}

scene.prototype.add = function(C)
{
	C.uid = UID++;
	this.live[C.uid]=C;
}

scene.prototype.remove = function(C)
{
	delete this.live[C.uid];
}

/**	@function
	@return the all the objects whose volume intersect with a specified volume
	@param exclude [single Object] or [array]
	@param where [Object] what to intersect with
	[default] {body:0} intersect with body
			{itr:2} intersect with itr kind:2
			{type:'character'} with character only
*/
scene.prototype.query = function(volume, exclude, where)
{
	var result=[];
	var tag='body';
	var tagvalue;
	var type;
	exclude=Futil.make_array(exclude);
	if( where)
	for ( var kk in where)
	{
		if( kk==='body' || kk==='itr')
		{
			tag=kk;
			tagvalue=where[kk];
		}
		else if( kk==='type')
		{
			type=where[kk];
		}
	}

	for ( var i in this.live)
	{
		var excluded=false;
		for( var ex in exclude)
		{
			if( this.live[i] === exclude[ex])
			{
				excluded=true;
				break;
			}
		}
		if( excluded)
			continue;

		if( type && this.live[i].type !== type)
			continue;

		if( tag==='itr')
		{
			if( this.live[i].itr) //not every object has itr
			{
				var itr = this.live[i].itr(tagvalue);
				for( var j in itr)
				{
					if( itr[j].kind===tagvalue)
					{
						if( this.intersect( volume, itr[j]))
						{
							result.push( this.live[i] );
							break;
						}
					}
				}
			}
		}
		else if( tag==='body')
		{
			var bdy = this.live[i].bdy();
			for( var j in bdy)
			{
				if( this.intersect( volume, bdy[j] ))
				{
					result.push( this.live[i] );
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

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
//require: F.core/collision.js

if( typeof F=='undefined') F=new Object();
if( typeof F.LF=='undefined') F.LF=new Object();
if( typeof F.LF.scene=='undefined') //#ifndef
{

F.LF.scene = function(config)
{
	this.obj = new Array(); //all objects
}

F.LF.scene.prototype.add = function(C)
{
	this.obj.push(C);
}

F.LF.scene.prototype.query = function(volume, This) //return the all the objects whose `bdy` intersect with `volume`
							//except `This`
{
	var result=[];
	for ( var i in this.obj)
	{
		if( this.obj[i] === This)
			continue;
		
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
	return result;
}

F.LF.scene.prototype.intersect = function(A,B) //return true if volume A and B intersect
{
	var AV={ left:A.x+A.vx, top:A.y+A.vy, right:A.x+A.vx+A.w, bottom:A.y+A.vy+A.h };
	var BV={ left:B.x+B.vx, top:B.y+B.vy, right:B.x+B.vx+B.w, bottom:B.y+B.vy+B.h };
	
	return ( F.collision.rect( AV, BV ) && F.collision.rect(
	{ left:A.z-A.zwidth, top:0, right:A.z+A.zwidth, bottom:1 },
	{ left:B.z-B.zwidth, top:0, right:B.z+B.zwidth, bottom:1 }
	));
}

} //#endif

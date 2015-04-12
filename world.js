/*\
 * world
 [ class ]
 * the world coordinate system
| z              y              O-------x
| |  y           |              |
| | /       =>   |          =>  |
| |/             |              |
| O-------x      O-------x      y
|   world        projected        screen
 * [example](../sample/world.html)
 # <iframe src="../sample/world.html?static" width="750" height="550"></iframe>
\*/

define(['F.core/math'],function(math){

function world ()
{
	/*\
	 * world.P
	 * points in 3d space
	 [ property ]
	 - (array) of points in `{x,y,z}`
	\*/
	this.P = new Array();
	/*\
	 * world.pp
	 * points projected onto 2d space
	 [ property ]
	 - (array) of points in `{x,y}`
	\*/
	this.pp= new Array();
	/*\
	 * world.area
	 * width and height of canvas
	 [ property ]
	 - (object) in `{x,y}`
	\*/
	this.area={x:800,y:600};
	/*\
	 * world.tho
	 [ property ]
	 - (number) view angle o in degree (rotate using z axis)
	\*/
	this.tho=270;
	/*\
	 * world.thp
	 [ property ]
	 - (number) view angle p in degree (rotate using x axis)
	\*/
	this.thp=90;
	/*\
	 * world.pan
	 * pan in view space
	 [ property ]
	 - (object) in `{x,y}`
	\*/
	this.pan={x:this.area.x/2, y:this.area.y/2};
	/*\
	 * world.zoom
	 [ property ]
	 - (number) zoom factor in view space
	\*/
	this.zoom=40;
}

/*\
 * world.project
 * project a single point
 [ method ]
 * it will be faster (saves many computations) by using project_all to project whole batch
 - P (object) in `{x,y,z}`
 = (object) in `{x,y}`
\*/
world.prototype.project=function(P)
{
	var T=this;
	sintho=Math.sin(T.tho/180*Math.PI);
	sinthp=Math.sin(T.thp/180*Math.PI);
	costho=Math.cos(T.tho/180*Math.PI);
	costhp=Math.cos(T.thp/180*Math.PI);

	var x = P.x;
	var y = P.y;
	var z = P.z;
	//projection
	var px = -1*x*sintho+y*costho;
	var py = -1*x*costho*costhp-y*sintho*costhp+z*sinthp;
	var pz = -1*x*costho*sinthp-y*sintho*sinthp-z*costhp+100;
	//perspective
	px = px*100/pz;
	py = py*100/pz;

	return {x:px, y:py};
}

/*\
 * world.project_all
 * project from 3d world space to 2d space.
 - [A,B] (number) range of points to project, if upspecified assume 0 and world.P.length
 | for (var i=A; i<B; i++) //project world.P[i] to world.pp[i]
 * points in @world.P are projected and result is stored in @world.pp
 [ method ]
\*/
world.prototype.project_all=function(A,B)
{
	var T=this;
	if( !A) A=0;
	if( !B) B=T.P.length;
	var sintho,sinthp,costho,costhp;
	if ( T.tho>360) {T.tho -= 360;}
	if ( T.thp>360) {T.thp -= 360;}
	if ( T.tho<-360) {T.tho += 360;}
	if ( T.thp<-360) {T.thp += 360;}
	sintho=Math.sin(T.tho/180*Math.PI);
	sinthp=Math.sin(T.thp/180*Math.PI);
	costho=Math.cos(T.tho/180*Math.PI);
	costhp=Math.cos(T.thp/180*Math.PI);

	for (var i=A; i<B; i++)
	{
		var x = T.P[i].x;
		var y = T.P[i].y;
		var z = T.P[i].z;
		//projection
		var px = -1*x*sintho+y*costho;
		var py = -1*x*costho*costhp-y*sintho*costhp+z*sinthp;
		var pz = -1*x*costho*sinthp-y*sintho*sinthp-z*costhp+100;
		//perspective
		px = px*100/pz;
		py = py*100/pz;

		T.pp[i]={x:px, y:py};
	}
}

/*\
 * world.view
 * convert a single point from projected 2d space to view space
 [ method ]
 * apply pan and zoom to calculate final coordinate on screen
 - pp (object) in `{x,y}`
 = (object) in `{x,y}`
\*/
world.prototype.view=function(pp)
{
	//round off in effect to reduce number of decimals in SVG, not sure if it helps?
	return {x:math.round_d2(pp.x*this.zoom+this.pan.x),
	        y:math.round_d2(pp.y*-this.zoom+this.pan.y) };
}

/*\
 * world.view_all
 * convert from projected 2d space to view space
 - [A,B] (number) range of points to project, if upspecified assume 0 and world.pp.length
 * points in @world.pp are transformed and result is stored back in @world.pp
 [ method ]
\*/
world.prototype.view_all=function(A,B)
{
	if( !A) A=0;
	if( !B) B=this.pp.length;
	for (var i=A; i<B; i++)
	{
		this.pp[i] = this.view(this.pp[i]);
	}
}

return world;
});

//the world coordinate system
/*
 z              O-------x
 |  y           |
 | /       =>   |
 |/             |
 O-------x      y
   World           View
*/

if(typeof F=='undefined') F=new Object();
if( typeof F.world=='undefined') //#ifndef
{

F.world = function ()
{
	this.P = new Array(); //points in 3d space
	this.pp= new Array(); //points in 2d space
	
	this.areax=800;  //width
	this.areay=600;  //   and height of canvas area
	this.tho=270;    //view angle o (rotate using z axis)
	this.thp=90;     //   and p (rotate using x axis)
	this.panx=this.areax/2;  //panned x
	this.pany=this.areay/2;  //   and y
	this.zoom=40;
	
	this.project=function() //project from 3d world space to 2d space
	{
		var T=this;
		var sintho,sinthp,costho,costhp;
		if ( T.tho>360) {T.tho -= 360;}
		if ( T.thp>360) {T.thp -= 360;}
		if ( T.tho<-360) {T.tho += 360;}
		if ( T.thp<-360) {T.thp += 360;}
		sintho=Math.sin(T.tho/180*Math.PI);
		sinthp=Math.sin(T.thp/180*Math.PI);
		costho=Math.cos(T.tho/180*Math.PI);
		costhp=Math.cos(T.thp/180*Math.PI);
		
		for (var i=0; i<T.P.length; i++)
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

	this.view=function(pp) //convert from projected 2d space to view space
	{
		//round off in effect to reduce number of decimals in SVG, not sure if it helps?
		return {x:F.round_d2(pp.x*this.zoom+this.panx),
		        y:F.round_d2(pp.y*-this.zoom+this.pany) };
	}
}

} //#endif

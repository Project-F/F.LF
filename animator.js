define(function() //exports a class `animator`
{

/**	@class
	@description
	animate sprites
	samle config @example
	config=
	{
		x:0,y:0,     //top left margin of the frames
		w:100, h:100,//width, height of a frame
		gx:4,gy:4,   //define a gx*gy grid of frames
		tar:         //target F.sprite
		ani:         //animation sequence:
		   null,     //if undefined or null, loop through top left to lower right, row by row
		   [0,1,2,1,0],//use custom frame sequence
		graph:       //graph:
		   [[0,1],   //	a 2d array gx*gy sized
		    [2,3]],  //		to store custom data for each frame
		borderright: 1, //trim the right edge pixels away
		borderbottom: 1,
		borderleft: 1
		bordertop: 1,
	}
 */
/**	@constructor
	no private member
	@param config multiple animator reference to the same config
*/
function animator (config)
{
	this.config=config;
	this.target=config.tar;
	this.I=0;//current frame
	this.horimirror=false;//horizontal mirror
	if( !config.borderright)  config.borderright=0;
	if( !config.borderbottom) config.borderbottom=0;
	if( !config.borderleft)  config.borderleft=0;
	if( !config.bordertop)   config.bordertop=0;
}
/**	@function
	@description
	turn to the next frame, return the index of the frame just shown
*/
animator.prototype.next_frame=function()
{
	var c=this.config;
	this.I++;
	if (!c.ani)
	{
		if ( this.I==c.gx*c.gy)
		{
			this.I=0;
		}
		this.show_frame(this.I);
	}
	else
	{
		var fi=c.ani[this.I];
		if ( this.I>=c.ani.length || this.I<0)
		{	//repeat sequence
			this.I=0; fi=c.ani[0];
		}
		this.show_frame(fi);
	}
	return this.I;
}
/**	@function
	@description
	set to a particular frame
	@param i
*/
animator.prototype.set_frame=function(i)
{
	this.I=i;
	this.show_frame(i);
}
/**	@function
	@description
	set the horizontal mirror mode
	@param val true: mirrored, false: normal
*/
animator.prototype.hmirror=function(val)
{
	this.horimirror = val;
}
animator.prototype.show_frame=function(i)
{
	var c=this.config;
	var left,top;
	if( !this.horimirror)
	{
		left= -((i%c.gx)*c.w+c.x+c.borderleft);
		top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	}
	else
	{
		left= -((c.gx-1)*c.w-(i%c.gx)*c.w+c.borderright);
		top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	}
	this.target.set_wh({
		x:  c.w-c.borderleft-c.borderright,
		y:  c.h-c.bordertop-c.borderbottom
	});
	this.target.img[this.target.cur_img].style.left= left+'px';
	this.target.img[this.target.cur_img].style.top = top+'px';
	//may also need to set_xy to compensate the border
}
animator.prototype.get_at=function(i) //get the content of the graph at frame i
{	//by default at the current frame
	if( !i) i=this.I;
	var c=this.config;
	return c.graph[(i%c.gx)][(Math.floor(i/c.gx))];
}

/**	@function
	@description
	a helper function to constructor a set of animators
	animator set is not a class. do NOT <code>var ani = new animator_set()</code>,
	instead do <code>var ani = animator_set()</code>
	@example
	set_config=
	{
		'base': //default parameters, must be specified as base when calling animator_set(set_config,*base*)
		{
			x:0,y:0,     //top left margin of the frames
			w:L, h:L,    //width, height of a frame
			gx:4,gy:1,   //define a gx*gy grid of frames
			tar:null,    //target sprite
		},

		'standing':
		{	//change only values you want to
			x:0,y:0,     //top left margin of the frames
			gx:4,gy:1,   //define a gx*gy grid of frames
		},,,
	}
 */
animator.set=function(set_config, base)
{
	if(!set_config)
		return null;
	var A=new Object();

	for( var I in set_config)
	{
		if( base) if( I==base)
			continue;

		if( base) if( set_config[base])
		{
			for( var J in set_config[base])
				set_config[I][J] = set_config[base][J];
		}

		A[I]=new animator(set_config[I]);
	}
	return A;
}

return animator;

});

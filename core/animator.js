define(function()
{

/*\
 * animator
 [ class ]
 * - animate sprites
 * - support multiple animation sequence on the same image
 - config (object)
| {
|		x:0,y:0,     //top left margin of the frames
|		w:100, h:100,//width, height of a frame
|		gx:4,gy:4,   //define a gx*gy grid of frames
|		tar:         //target @sprite
|		ani:         //[optional] animation sequence:
|			null,    //if undefined, loop through top left to lower right, row by row
|			[0,1,2,1,0],//use custom animation sequence
|		borderright: 1, //[optionals] trim the right edge pixels away
|		borderbottom: 1,
|		borderleft: 1,
|		bordertop: 1
| }
 * multiple animators reference to the same config, so dont play with it in runtime
 *
 * [example](../sample/sprite1.html)
\*/
function animator (config)
{
	this.config=config;
	this.target=config.tar;
	/*\
	 * animator.I
	 * current frame
	 [ property ]
	 * if `config.ani` exists, `I` is the index to this array. otherwise it is the frame number
	\*/
	this.I=0;
	/*\
	 * animator.flip_x
	 [ property ]
	 - (boolean) true: mirrored, false: normal
	 * usually a sprite character is drawn to face right and mirrored to face left. hmirror mode works with sprites that is flipped horizontally __as a whole image__.
	\*/
	this.flip_x=false; //horizontal mirror
	if( !config.borderright)  config.borderright=0;
	if( !config.borderbottom) config.borderbottom=0;
	if( !config.borderleft)  config.borderleft=0;
	if( !config.bordertop)   config.bordertop=0;
}
/*\
 * animator.next_frame
 * turn to the next frame
 [ method ]
 * if `config.ani` exists, will go to the next frame of animation sequence
 *
 * otherwise, loop through top left to lower right, row by row
 = (number) the frame just shown
 * remarks: if you want to check whether the animation is __ended__, test it against 0. when `animator.I` equals 'max frame index', the last frame is _just_ being shown. when `animator.I` equals 0, the last frame had finished the whole duration of a frame and is _just_ ended.
\*/
animator.prototype.next_frame=function()
{
	var c=this.config;
	this.I++;
	if (!c.ani)
	{
		if ( this.I==c.gx*c.gy)
		{
			this.I=0; //repeat sequence
		}
		this.show_frame(this.I);
	}
	else
	{
		var fi=c.ani[this.I];
		if ( this.I>=c.ani.length || this.I<0)
		{
			this.I=0; fi=c.ani[0]; //repeat sequence
		}
		this.show_frame(fi);
	}
	return this.I;
}
/*\
 * animator.seek
 * seek to a particular index on animation sequence
 [ method ]
 - I (number) sequence index
\*/
animator.prototype.seek=function(I)
{
	var c=this.config;
	if( c.ani)
	if( I>=0 && I<c.ani.length)
	{
		this.I=I;
		var fi=c.ani[this.I];
		this.show_frame(fi);
	}
}
/*\
 * animator.rewind
 [ method ]
 * return to the first frame of animation sequence
\*/
animator.prototype.rewind=function()
{
	this.I=-1;
	this.next_frame();
}
/*\
 * animator.set_frame
 [ method ]
 * set to a particular frame
 - i (number) frame number on image
 * the top-left frame is 0
\*/
animator.prototype.set_frame=function(i)
{
	this.I=i;
	this.show_frame(i);
}
animator.prototype.show_frame=function(i)
{
	var c=this.config;
	var left,top;
	left= -((i%c.gx)*c.w+c.x+c.borderleft);
	top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	if( this.flip_x)
		left= -this.target.img[this.target.cur_img].naturalWidth-left+c.w-c.borderleft-c.borderright;
	this.target.set_w_h(
		c.w-c.borderleft-c.borderright,
		c.h-c.bordertop-c.borderbottom
	);
	this.target.set_img_x_y(left,top);
	//may also need to set_x_y to compensate the border
}
animator.prototype.get_at=function(i) //get the content of the graph at frame i
{	//by default at the current frame
	if( !i) i=this.I;
	var c=this.config;
	return c.graph[(i%c.gx)][(Math.floor(i/c.gx))];
}

/*\
 * animator.set
 [ method ]
 * a helper function to constructor a set of animators
 *
 * animator set is a method. do **not** `var ani = new animator_set(..)`
 - set_config (object)
 - [base] (string)
 *
| set_config=
| {
|	'base': //default parameters, must be specified as base when calling animator_set
|	{
|		x:0,y:0,     //top left margin of the frames
|		w:L, h:L,    //width, height of a frame
|		gx:4,gy:1,   //define a gx*gy grid of frames
|		tar:null,    //target sprite
|	},
|
|	'standing':
|	{	//change only values you want to
|		x:0,y:0,     //top left margin of the frames
|		gx:4,gy:1    //define a gx*gy grid of frames
|	} //,,,
| }
| var set = animator.set(set_config,'base')
 = (object) animator set
\*/
animator.set=function(set_config, base)
{
	if(!set_config)
		return null;
	if(!base)
		base = 'base';
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

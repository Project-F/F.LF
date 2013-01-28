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
|		ani:         //animation sequence:
|			null,    //if undefined, loop through top left to lower right, row by row
|			[0,1,2,1,0],//use custom frame sequence
|		borderright: 1, //[optionals] trim the right edge pixels away
|		borderbottom: 1,
|		borderleft: 1,
|		bordertop: 1
| }
 * multiple animators reference to the same config, so dont play with it in runtime
 *
 * [example](../sample/sprite.html)
 # <iframe src="../sample/sprite.html" width="400" height="250"></iframe>
 # <img src="../sample/test_sprite.png" width="300">
\*/

/**	@constructor
	no private member
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
 * animator.next_frame
 [ method ]
 * turn to the next frame
 *
 * if `config.ani` exists, will go to the next frame of animation sequence
 *
 * otherwise, loop through top left to lower right, row by row
 = (number) index of the frame just shown
\*/
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
/*\
 * animator.set_frame
 [ method ]
 * set to a particular frame
 - i (number) frame index
\*/
animator.prototype.set_frame=function(i)
{
	this.I=i;
	this.show_frame(i);
}
/*\
 * animator.hmirror
 [ method ]
 * set the horizontal mirror mode
 - val (boolean) true: mirrored, false: normal
\*/
animator.prototype.hmirror=function(val)
{
	this.horimirror = val;
}
animator.prototype.show_frame=function(i)
{
	var c=this.config;
	var left,top;
	left= -((i%c.gx)*c.w+c.x+c.borderleft);
	top = -((Math.floor(i/c.gx))*c.h+c.y+c.bordertop);
	if( this.horimirror)
		left= -this.target.img[this.target.cur_img].naturalWidth-left+c.w-c.borderleft-c.borderright;
	this.target.set_wh({
		x: c.w-c.borderleft-c.borderright,
		y: c.h-c.bordertop-c.borderbottom
	});
	this.target.set_img_xy({x:left,y:top});
	//may also need to set_xy to compensate the border
}
animator.prototype.get_at=function(i) //get the content of the graph at frame i
{	//by default at the current frame
	if( !i) i=this.I;
	var c=this.config;
	return c.graph[(i%c.gx)][(Math.floor(i/c.gx))];
}

/*\
 * animator.prototype.set
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
| var set = animator_set(set_config,'base')
\*/
animator.prototype.set=function(set_config, base)
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

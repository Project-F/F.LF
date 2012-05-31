//sprite system
/*	display and control sprites on page using <div> tag
 */
/*	sample config for F_sprite
	{
		canvas: canvas,   //canvas *object*
		wh: {x:100,y:100},// width and height
		img:              //image list
		{
			'tag name':'image path',,,  //the first image is visible
		},
	}
 */
/*	require: style.css
 */

if( typeof F=='undefined') F=new Object;
if( typeof F.sprite=='undefined') //#ifndef
{

F.sp_count=0; //sprite count
F.sprite = function (config)
{
	//[--constructor
	//	no private member
	//	config is one time only and should be dumped after constructor returns
	this.ID=F.sp_count;
	F.sp_count++;
	
	this.el = document.createElement('div');
	this.el.setAttribute('class','F_sprite');
	this.el.id='sp'+this.ID;
	config.canvas.appendChild(this.el);
	
	this.img={};
	this.cur_img=null;
	
	this.set_wh(config.wh);
	for ( var I in config.img)
	{
		this.add_img(config.img[I], I);
	}
	//--]
}
F.sprite.prototype.set_wh=function(P)
{	//performance: does setting the style every frame affect?
	this.el.style.width=P.x;
	this.el.style.height=P.y;
}
F.sprite.prototype.set_xy=function(P)
{
	this.el.style.left=P.x;
	this.el.style.top=P.y;
}
F.sprite.prototype.add_img=function(imgpath,name)
{
	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.src=imgpath;
	this.el.appendChild(im);
	
	this.img[name]=im;
	this.switch_img(name);
	return im;
}
F.sprite.prototype.switch_img=function(name)
{
	var left,top;
	for ( var I in this.img)
	{
		if( this.img[I].style.visibility=='visible')
		{
			left=this.img[I].style.left;
			top =this.img[I].style.top;
			break;
		}
	}
	for ( var I in this.img)
	{
		if( I==name)
		{
			this.img[I].style.left=left;
			this.img[I].style.top=top;
			this.img[I].style.visibility='visible';
		}
		else
		{
			this.img[I].style.visibility='hidden';
		}
	}
	this.cur_img=name;
}
F.sprite.prototype.delete=function()
{
	this.el.parentNode.removeChild(this.el);
}

//sprite animator
/*	animate sprites
 */
/*	sample config for F_animator
	{
	x:0,y:0,     //top left margin of the frames
	w:100, h:100,//width, height of a frame
	gx:4,gy:4,   //define a gx*gy grid of frames
	tar:         //target F_sprite
	ani:         //animation sequence.
	   null      //if undefined or null, loop through top left to lower right, row by row
	   [0,1,2,1,0]//custom frame sequence
	}
 */
F.animator = function (config)
{
	//[--constructor
	//	no private member
	//	this.config can be altered dynamically
	this.config=config;
	this.I=0;//current frame
	//--]
}
F.animator.prototype.next_frame=function() //turn to the next frame, return the index of the frame just shown
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
		if ( this.I==c.ani.length)
		{
			this.I=0; fi=c.ani[0];
		}
		this.show_frame(fi);
	}
	return this.I;
}
F.animator.prototype.set_frame=function(i)
{
	this.I=i;
	this.show_frame(i);
}
F.animator.prototype.show_frame=function(i)
{
	var c=this.config;
	c.tar.set_wh({x:c.w, y:c.h});
	c.tar.img[c.tar.cur_img].style.left= -((i%c.gx)*c.w+c.x) +'px';
	c.tar.img[c.tar.cur_img].style.top = -((Math.floor(i/c.gx))*c.h+c.y) +'px';
}
F.animator.prototype.cur_frame_pos=function()
{
	var i=this.I;
	return {x:-((i%c.gx)*c.w+c.x), y:-((Math.floor(i/c.gx))*c.h+c.y)};
}

//animator set
/*	a helper function to constructor a set of animators
	animator set is not a class. do NOT `var ani = new F.animator_set()` instead `var ani = F.animator_set()`
 */
/*	example set_config
	{
		'base': //default parameters, must be specified as base when calling F.animator_set(set_config,*base*)
		{
			x:0,y:0,     //top left margin of the frames
			w:L, h:L,    //width, height of a frame
			gx:4,gy:1,   //define a gx*gy grid of frames
			tar:null,    //target F.sprite
		},
		
		'standing':
		{	//change only values you want to
			x:0,y:0,     //top left margin of the frames
			gx:4,gy:1,   //define a gx*gy grid of frames
		},,,
	}
 */
F.animator_set = function(set_config, base)
{
	if(!set_config)
		return null;
	var A=new Object;
	
	for( var I in set_config)
	{
		if( base) if( I==base)
			continue;
		
		if( base) if( set_config[base])
		{
			for( var J in set_config[base])
				set_config[I][J] = set_config[base][J];
		}
		
		A[I]=new F.animator(set_config[I]);
	}
	return A;
}

} //#endif

//sprite system
/*	display and control sprites on page using <div> tag
 */
/*	sample config for F_sprite
	{
		canvas: canvas,   //canvas *object*
		wh: {x:100,y:100},// width and height
		img:              //[optional] image list, can call `add_img()` later
		{
			'tag name':'image path',,,  //the first image is visible
		},
	}
 */
/*	require: style.css
 */

if( typeof F=='undefined') var F=new Object();
if( typeof F.sprite=='undefined') //#ifndef
{

F.sp_count=0; //sprite count
F.sprite = function (config)
{
	//constructor
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
	if( config.img)
	for ( var I in config.img)
	{
		this.add_img(config.img[I], I);
	}
}
F.sprite.prototype.set_wh=function(P)
{
	this.el.style.width=P.x+'px';
	this.el.style.height=P.y+'px';
}
F.sprite.prototype.set_xy=function(P)
{
	this.el.style.left=P.x+'px';
	this.el.style.top=P.y+'px';
}
F.sprite.prototype.set_z=function(z)
{
	this.el.style.zIndex=Math.round(z);
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
F.sprite.prototype.remove=function()
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
	ani:         //animation sequence:
	   null,     //if undefined or null, loop through top left to lower right, row by row
	   [0,1,2,1,0],//use custom frame sequence
	graph:       //graph:
	   [[0,1],   //	a 2d array gx*gy sized
	    [2,3]]   //		to store custom data for each frame
	}
 */
F.animator=function (config)
{
	//constructor
	//	no private member
	//	multiple animator reference to the same config, except tar
	this.config=config;
	this.target=config.tar;
	this.I=0;//current frame
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
	this.target.set_wh({x:c.w, y:c.h});
	this.target.img[this.target.cur_img].style.left= -((i%c.gx)*c.w+c.x) +'px';
	this.target.img[this.target.cur_img].style.top = -((Math.floor(i/c.gx))*c.h+c.y) +'px';
}
F.animator.prototype.get_at=function(i) //get the content of the graph at frame i
{	//by default at the current frame
	if( !i) i=this.I;
	var c=this.config;
	return c.graph[(i%c.gx)][(Math.floor(i/c.gx))];
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
		
		A[I]=new F.animator(set_config[I]);
	}
	return A;
}

} //#endif

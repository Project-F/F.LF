/*\
 * sprite
 * 
 * sprite-animator for LF2
\*/
define(['F.core/sprite','F.core/animator'], function (Fsprite, Fanimator)
{

/*\
 * sprite
 [ class ]
 - bmp (object) data structure as defined in data files
 - parent (DOM node) where to append the new sprite
\*/
function sprite (bmp, parent)
{
	/*\
	 * sprite.num_of_images
	 [ property ]
	\*/
	var num_of_images = this.num_of_images = bmp.file.length;
	/*\
	 * sprite.w
	 [ property ]
	 * width
	\*/
	/*\
	 * sprite.h
	 [ property ]
	 * height
	\*/
	var w = this.w = bmp.file[0].w+1;
	var h = this.h = bmp.file[0].h+1;
	/*\
	 * sprite.ani
	 [ property ]
	 - Fanimator (object)
	\*/
	var ani = this.ani = {length:0};
	/*\
	 * sprite.dir
	 [ property ]
	 * `'left'` or `'right'`
	\*/
	this.dir = 'right';
	/*\
	 * sprite.cur_img
	 [ property ]
	 * current image index
	\*/
	this.cur_img = 0;

	var sp_con=
	{
		canvas: parent,
		wh: {x:w,y:h},
		img:{}
	}
	/*\
	 * sprite.sp
	 [ property ]
	 - Fsprite (object)
	\*/
	var sp = this.sp = new Fsprite(sp_con);

	for( var i=0; i<bmp.file.length; i++)
	{
		var imgpath='';
		for( var j in bmp.file[i])
		{
			if( typeof bmp.file[i][j] === 'string' &&
			    j.indexOf('file')===0 )
				imgpath = bmp.file[i][j];
		}
		if( imgpath==='')
			console.log( 'cannot find img path in data:\n'+JSON.stringify(bmp.file[i]) );
		sp.add_img( imgpath, i+'r');
		if( bmp.file[i]['mirror']) //extended standard
		{
			if( bmp.file[i]['mirror'] !== 'none')
				sp.add_img( bmp.file[i]['mirror'], i+'l');
		}
		else
		{
			var ext=imgpath.lastIndexOf('.');
			sp.add_img( imgpath.slice(0,ext)+'_mirror'+imgpath.slice(ext), i+'l');
		}

		var ani_con=
		{
			x:0,  y:0,   //top left margin of the frames
			w:bmp.file[i].w+1, h:bmp.file[i].h+1,    //width, height of a frame
			gx:bmp.file[i].row, gy:bmp.file[i].col,//define a gx*gy grid of frames
			tar:sp,     //target sprite
			borderright: 1,
			borderbottom: 1
		};
		/* var ani_mirror_con=
		{
			x:(bmp.file[i].row-1)*(bmp.file[i].w+1),  y:0,
			w:-bmp.file[i].w-1, h:bmp.file[i].h+1,
			gx:bmp.file[i].row, gy:bmp.file[i].col,
			tar:sp,
			borderleft: 1,
			borderbottom: 1
		}; */
		ani.length++;
		ani[i] = new Fanimator(ani_con);
	}
}
/*\
 * sprite.show_pic
 [ method ]
 - I (number) picture index to show
\*/
sprite.prototype.show_pic = function(I)
{
	var slot=0;
	for( var k=0; k<this.ani.length; k++)
	{
		var i = I - this.ani[k].config.gx * this.ani[k].config.gy;
		if( i >= 0)
		{
			I = i;
			slot++;
		}
		else
			break;
	}
	this.cur_img = slot;
	this.sp.switch_img(this.cur_img + (this.dir==='right' ? 'r':'l'));
	this.ani[this.cur_img].hmirror(this.dir==='left');
	this.ani[this.cur_img].set_frame(I);
	this.w = this.ani[this.cur_img].config.w;
	this.h = this.ani[this.cur_img].config.h;
}
/*\
 * sprite.switch_lr
 [ method ]
 * switch sprite direction
 - dir (string) `'left'` or `'right'`
\*/
sprite.prototype.switch_lr = function(dir) //switch to `dir`
{
	var I = this.ani[this.cur_img].I;
	this.dir=dir;
	this.sp.switch_img(this.cur_img + (this.dir==='right' ? 'r':'l'));
	this.ani[this.cur_img].hmirror(this.dir==='left');
	this.ani[this.cur_img].set_frame(I);
}
/*\
 * sprite.set_xy
 [ method ]
 - P (object) `{x,y}`
\*/
sprite.prototype.set_xy = function(P)
{
	this.sp.set_xy(P);
}
/*\
 * sprite.set_z
 [ method ]
 - Z (number)
\*/
sprite.prototype.set_z = function(Z)
{
	this.sp.set_z(Z);
}
/*\
 * sprite.show
 [ method ]
\*/
sprite.prototype.show = function()
{
	this.sp.show();
}
/*\
 * sprite.hide
 [ method ]
\*/
sprite.prototype.hide = function()
{
	this.sp.hide();
}

return sprite;
});

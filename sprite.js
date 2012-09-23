//sprite-animator for LF2
//	accept a bmp object (defined in data file) as config
//	support switching frames between multiple image files
//require: F.core/sprite.js

if( typeof F=='undefined') F=new Object();
if( typeof F.LF=='undefined') F.LF=new Object();
if( typeof F.LF.sprite=='undefined') //#ifndef
{

F.LF.sprite=function(bmp, parent)
{
	var num_of_images = this.num_of_images = bmp.file.length;
	var w = this.w = bmp.file[0].w+1;
	var h = this.h = bmp.file[0].h+1;
	var ani = this.ani = new Array();
	this.dir = 'right';
	this.cur_img = '0r';
	
	var sp_con=
	{
		canvas: parent,
		wh: {x:w,y:h},
		img:{}
	}
	var sp = this.sp = new F.sprite(sp_con);
	
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
			alert( 'cannot find img path in data:\n'+JSON.stringify(bmp.file[i]) );
		sp.add_img( imgpath, i+'r');
		if( bmp.file[i]['mirror'])
		{
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
			tar:sp     //target F.sprite
		};
		var ani_mirror_con=
		{
			x:(bmp.file[i].row-1)*(bmp.file[i].w+1),  y:0,
			w:-bmp.file[i].w-1, h:bmp.file[i].h+1,
			gx:bmp.file[i].row, gy:bmp.file[i].col,
			tar:sp
		};
		ani[i+'r'] = new F.animator(ani_con);
		ani[i+'l'] = new F.animator(ani_mirror_con);
	}
}

F.LF.sprite.prototype.show_pic = function(I)
{
	var slot=0;
	for( var k in this.ani)
	{
		var i = I - this.ani[k].config.gx * this.ani[k].config.gy;
		if( i >= 0)
		{
			I = i;
			slot++;
		}
	}
	this.cur_img = slot + (this.dir==='right' ? 'r':'l');
	this.ani[this.cur_img].set_frame(I);
	this.sp.switch_img(this.cur_img);
	this.w = this.ani[this.cur_img].config.w;
	this.w = this.w > 0 ? this.w:-this.w;
	this.h = this.ani[this.cur_img].config.h;
}

F.LF.sprite.prototype.switch_lr = function(dir) //switch to `dir`
{
	var I = this.ani[this.cur_img].I;
	this.dir=dir;
	this.cur_img = this.cur_img.slice(0,-1) + (this.dir==='right' ? 'r':'l');
	this.sp.switch_img(this.cur_img);
	this.ani[this.cur_img].set_frame(I);
}

F.LF.sprite.prototype.set_xy = function(P)
{
	this.sp.set_xy(P);
}
F.LF.sprite.prototype.set_z = function(Z)
{
	this.sp.set_z(Z);
}

} //#endif

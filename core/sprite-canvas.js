/*\
 * sprite-canvas
 * - use canvas to render sprites
 * - (mostly) compatible with sprite-dom
\*/
define(['F.LF/core/resourcemap','module'],
function(resourcemap,module)
{

sprite._masterconfig = module.config() || {};
sprite._count = 0;
sprite._loading = 0;
sprite.renderer = 'canvas';
sprite.masterconfig=
function(c)
{
	if( c)
	{
		sprite._masterconfig=c;
		sprite.masterconfig_update();
	}
	else
		return sprite._masterconfig;
}
sprite.masterconfig_set=
function(key,value)
{
	if( key && value)
	{
		sprite._masterconfig[key] = value;
		sprite.masterconfig_update();
	}
}
sprite.masterconfig_update=function()
{
	if( sprite._masterconfig.resourcemap)
		if( !(sprite._masterconfig.resourcemap instanceof resourcemap))
			sprite._masterconfig.resourcemap = new resourcemap(sprite._masterconfig.resourcemap);
}
sprite.resolve_resource=function(res,level)
{
	if( sprite._masterconfig.resourcemap)
	{
		if( !level)
			return sprite._masterconfig.resourcemap.get(res);
		else
			return sprite._masterconfig.resourcemap.fallback(res,level);
	}
	if( sprite._masterconfig.baseUrl)
		return sprite._masterconfig.baseUrl + res;
	return res;
}
sprite.preload_image=function(imgname)
{
	var img = new Image();
	img.src = sprite.resolve_resource(imgname);
}

function sprite (config)
{
	sprite._count++;
	
	if( config.canvas instanceof HTMLElement && config.canvas.tagName.toLowerCase()==='canvas')
		return new sprite_group(config);
	if( config.type==='group')
		return new sprite_group(config);
	
	this.img={};
	this.cur_img=null;
	this.x=0; this.y=0; this.z=0;
	this.w=0; this.h=0;
	this.img_x=0; this.img_y=0;
	
	if( config.wh==='fit')
		this.fit_to_img=true;
	else if( typeof config.wh==='object')
		this.set_wh(config.wh);
	if( config.xy)
		this.set_xy(config.xy);
	if( config.xywh)
	{
		this.set_xy(config.xywh);
		this.set_wh(config.xywh);
	}
	if( config.img)
	{	//add the images in config list
		if( typeof config.img==='object')
			for ( var I in config.img)
				this.add_img(config.img[I], I);
		else
			this.add_img(config.img, '0');
	}
	if( config.text)
	{
		this.text = config.text;
		this.textcolor = '#000000';
		this.font = '10px monospace';
	}
	if( config.textcolor)
		this.textcolor = config.textcolor;
	if( config.font)
		this.font = config.font;
	if( config.bgcolor)
		this.set_bgcolor(config.bgcolor);
	if( config.canvas)
	{
		config.canvas.attach(this);
		this.parent = config.canvas;
	}
}

sprite.prototype.set_wh=function(P)
{
	this.set_w_h(P.w,P.h);
}
sprite.prototype.set_w_h=function(w,h)
{
	this.w = this.ow = w;
	this.h = this.oh = h;
}
sprite.prototype.set_w=function(w)
{
	this.w = this.ow = w;
}
sprite.prototype.set_h=function(h)
{
	this.h = this.oh = h;
}
sprite.prototype.clip_to_cur_img=function()
{
	this.w = Math.min(this.ow, this.img[this.cur_img].naturalWidth);
	this.h = Math.min(this.oh, this.img[this.cur_img].naturalHeight);
}
sprite.prototype.set_xy=function(P)
{
	this.x = P.x;
	this.y = P.y;
}
sprite.prototype.set_x_y=function(x,y)
{
	this.x = x;
	this.y = y;
}
sprite.prototype.set_flipx=function(flip)
{
	this.x_flipped=flip;
}
sprite.prototype.set_flipy=function(flip)
{
	this.y_flipped=flip;
}
sprite.prototype.set_z=function(z)
{
	z = Math.round(z);
	this.z = z;
}
sprite.prototype.set_bgcolor=function(color)
{
	this.bgcolor = color;
}
sprite.prototype.set_alpha=function(a)
{
	this.opacity = a;
}
sprite.prototype.set_text=function(text,textcolor,font)
{
	if( text) this.text = text;
	if( textcolor) this.textcolor = textcolor;
	if( font) this.font = font;
}

sprite.prototype.add_img=function(imgpath,name)
{
	var This=this;
	var img = new Image();
	var retry=0;
	sprite._loading++;
	img.onload = function()
	{
		if( This.fit_to_img)
			This.set_w_h(this.naturalWidth,this.naturalHeight);
		img.onload = null;
		img.onerror = null;
		delete This.fit_to_img;
		sprite._loading--;
		if( sprite._loading===0)
			if( sprite._masterconfig.onready)
				sprite._masterconfig.onready();
	}
	if( sprite._masterconfig.resourcemap)
	img.onerror = function()
	{
		retry++;
		var src = sprite.resolve_resource(imgpath, retry); //fallback
		if( !src)
			img.onerror = null;
		else
			img.src = src;
	}
	img.src = sprite.resolve_resource(imgpath);

	this.img[name]=img;
	this.switch_img(name);
	return img;
}
sprite.prototype.remove_img=function(name)
{
	if( this.img[name])
		this.img[name]=undefined;
	if( this.cur_img===name)
		this.cur_img = null;
}
sprite.prototype.switch_img=function(name)
{
	this.cur_img = name;
	this.clip_to_cur_img();
}
sprite.prototype.set_img_xy=function(P)
{
	this.img_x = P.x;
	this.img_y = P.y;
}
sprite.prototype.set_img_x_y=function(x,y)
{
	this.img_x = x;
	this.img_y = y;
}

sprite.prototype.render=function(ctx)
{
	if( this.hidden) return;
	if( !ctx) return;
	if( this.bgcolor)
	{
		ctx.fillStyle = this.bgcolor;
		ctx.fillRect(this.x,this.y,this.w,this.h);
	}
	if( this.opacity!==null && this.opacity!==undefined)
	{
		var globalAlpha = ctx.globalAlpha;
		ctx.globalAlpha *= this.opacity;
	}
	if( this.img[this.cur_img] && this.w && this.h)
	{
		ctx.drawImage(this.img[this.cur_img],
			/*source*/ -this.img_x, -this.img_y, this.w, this.h,
			/* dest */ this.x_flipped?-this.x-this.w:this.x, this.y_flipped?-this.y-this.h:this.y, this.w, this.h);
	}
	if( this.text)
	{
		ctx.font = this.font;
		ctx.fillStyle = this.textcolor;
		ctx.fillText(this.text, this.x, this.y);
	}
	if( this.opacity!==null && this.opacity!==undefined)
		ctx.globalAlpha = globalAlpha;
}
sprite.prototype.hide=function()
{
	this.hidden = true;
}
sprite.prototype.show=function()
{
	this.hidden = false;
}
sprite.prototype.remove=function()
{
	if( !this.removed && this.parent)
	{
		this.removed = true;
		this.parent.remove(this);
	}
}
sprite.prototype.attach=function()
{
	if( this.removed)
	{
		this.parent.attach(this);
		this.removed = false;
	}
}

function sprite_group(config)
{
	var parent = config.canvas;
	if( parent instanceof HTMLElement && parent.tagName.toLowerCase()==='canvas')
	{
		this.ctx = parent.getContext('2d');
		this.width = parent.width;
		this.height = parent.height;
	}
	else if( parent instanceof sprite_group)
		parent.attach(this);
	this.children = [];
	this.x=0; this.y=0; this.z=0;
	this.w=0; this.h=0;
	if( config.bgcolor)
		this.set_bgcolor(config.bgcolor);
	if( typeof config.wh==='object')
		this.set_wh(config.wh);
	if( config.xywh)
	{
		var xywh = config.xywh;
		if( config.xywh instanceof Array)
		{
			var A = config.xywh;
			xywh = {x:A[0],y:A[1],w:A[2],h:A[3]};
		}
		this.set_xy(xywh);
		this.set_wh(xywh);
	}
}
sprite_group.prototype.set_wh=function(P)
{
	this.set_w_h(P.w,P.h);
}
sprite_group.prototype.set_w_h=function(w,h)
{
	this.w = w;
	this.h = h;
}
sprite_group.prototype.set_w=function(w)
{
	this.w = w;
}
sprite_group.prototype.set_h=function(h)
{
	this.h = h;
}
sprite_group.prototype.set_xy=function(P)
{
	this.x = P.x;
	this.y = P.y;
}
sprite_group.prototype.set_x_y=function(x,y)
{
	this.x = x;
	this.y = y;
}
sprite_group.prototype.set_flipx=function(flip)
{
}
sprite_group.prototype.set_flipy=function(flip)
{
}
sprite_group.prototype.set_z=function(z)
{
	z = Math.round(z);
	this.z = z;
}
sprite_group.prototype.set_bgcolor=function(color)
{
	this.bgcolor = color;
}
sprite_group.prototype.set_alpha=function(a)
{
	this.opacity = a;
}
sprite_group.prototype.hide=function()
{
	this.hidden = true;
}
sprite_group.prototype.show=function()
{
	this.hidden = false;
}
sprite_group.prototype.attach=function(sp)
{
	this.children.push(sp);
	sp.set_z(this.children.length);
}
sprite_group.prototype.remove=function(sp)
{
	var ii = this.children.indexOf(sp);
	if( ii!==-1)
		this.children.splice(ii,1);
}
sprite_group.prototype.remove_all=function()
{
	this.children.length = 0;
}
sprite_group.prototype.render=function(ctx)
{
	if( this.ctx)
	{
		ctx = this.ctx;
		ctx.clearRect(0,0,this.width,this.height);
	}
	if( !ctx && !this.ctx) return;
	if( this.hidden) return;
	
	if( this.opacity!==null && this.opacity!==undefined)
	{
		var globalAlpha = ctx.globalAlpha;
		ctx.globalAlpha *= this.opacity;
	}
	if( this.bgcolor)
	{
		ctx.fillStyle = this.bgcolor;
		ctx.fillRect(this.x,this.y,this.w,this.h);
	}
	
	this.children.sort(function(A,B){return A.z-B.z}); //z ordering
	ctx.translate(this.x,this.y);
	var fx=0,fy=0;
	for( var i=0; i<this.children.length; i++)
	{
		var sp = this.children[i];
		if( !sp.x_flipped && !sp.y_flipped)
			flip_to(0,0);
		else if( sp.x_flipped && !sp.y_flipped)
			flip_to(1,0);
		else if( !sp.x_flipped && sp.y_flipped)
			flip_to(0,1);
		else if( sp.x_flipped && sp.y_flipped)
			flip_to(1,1);
		sp.render(ctx);
	}
	flip_to(0,0);
	ctx.translate(-this.x,-this.y);
	if( this.opacity!==null && this.opacity!==undefined)
		ctx.globalAlpha = globalAlpha;
	
	function flip_to(ffx,ffy)
	{
		if( fx!==ffx && fy!==ffy)
			ctx.scale(-1,-1);
		else if( fx===ffx && fy!==ffy)
			ctx.scale(1,-1);
		else if( fx!==ffx && fy===ffy)
			ctx.scale(-1,1);
		fx=ffx;
		fy=ffy;
	}
}

return sprite;
});

/**	@fileOverview
	@description
	sprite system
	display and control sprites on page using <div> tag
		support style left/top and CSS transform

	@example
	config=
	{
		canvas: canvas,   // canvas *DOM node*
		wh: {x:100,y:100},// width and height
		img:              // image list
		{
			'tag name':'image path',,,  //the first image is visible
		}
	}
	@example
	masterconfig
	{
		baseUrl: '../sprites' //base url prepended to all image paths
	}
 */

define(['core/css!core/style.css','core/support'],function(css,support) //exports a class `sprite`
{

var sp_count=0; //sprite count
/**	@class
*/
/**	no private member
	@constructor
	@param config config is one time only and should be dumped after constructor returns
*/
function sprite (config)
{
	this.ID=sp_count;
	sp_count++;

	this.el = document.createElement('div');
	this.el.setAttribute('class','F_sprite');
	//this.el.id='sp'+this.ID;
	config.canvas.appendChild(this.el);

	this.img={};
	this.cur_img=null;

	this.set_wh(config.wh);
	if( config.img)
	for ( var I in config.img)
	{
		this.add_img(config.img[I], I);
	}

	if( support.css2dtransform)
	{
		this.el.style.left=0+'px';
		this.el.style.top=0+'px';
	}
}
/**	@function master config
	getter: call with no parameter
	setter: call with 1 config object as parameter
*/
sprite.prototype._config = {};
sprite.prototype.config=function(masterconfig)
{
	if( masterconfig)
		sprite.prototype._config = masterconfig;
	else
		return sprite.prototype._config;
}
/**	@function
*/
sprite.prototype.set_wh=function(P)
{
	this.el.style.width=P.x+'px';
	this.el.style.height=P.y+'px';
}

if( support.css2dtransform)
{
	/**	@function
	*/
	sprite.prototype.set_xy=function(P)
	{
		this.el.style[support.css2dtransform]= 'translate('+P.x+'px,'+P.y+'px) ';
	}
}
else
{
	/**	@function
	*/
	sprite.prototype.set_xy=function(P)
	{
		this.el.style.left=P.x+'px';
		this.el.style.top=P.y+'px';
	}
}

/**	set the css zIndex.
	@function
*/
sprite.prototype.set_z=function(z)
{
	this.el.style.zIndex=Math.round(z);
}
/**	@function
	@param imgpath
	@param name
*/
sprite.prototype.add_img=function(imgpath,Name)
{
	var pre='';
	if( sprite.prototype._config.baseUrl)
	pre=sprite.prototype._config.baseUrl;

	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.src = pre+imgpath;
	im.onload=function()
	{
		if( !this.naturalWidth) this.naturalWidth=this.width;
		if( !this.naturalHeight) this.naturalHeight=this.height;
		this.onload=null;
	}
	this.el.appendChild(im);

	this.img[Name]=im;
	this.switch_img(Name);
	return im;
}
/**	@function
	@param name
*/
sprite.prototype.switch_img=function(name)
{
	var left,top; //store the left, top of the current displayed image
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
/**	@function
*/
sprite.prototype.set_img_xy=function(P)
{
	this.img[this.cur_img].style.left= P.x+'px';
	this.img[this.cur_img].style.top= P.y+'px';
}

/**	remove from DOM
	@function
*/
sprite.prototype.remove=function()
{
	this.el.parentNode.removeChild(this.el);
	this.removed=true;
}
/**	if previously removed, attach back to DOM
	@function
*/
sprite.prototype.attach=function()
{
	if( this.removed)
		config.canvas.appendChild(this.el);
}
/**	hide (set display to none) without removing off DOM
	@function
*/
sprite.prototype.hide=function()
{
	this.el.style.display='none';
}
/**	show (set display to default)
	@function
*/
sprite.prototype.show=function()
{
	this.el.style.display='';
}

return sprite;

});

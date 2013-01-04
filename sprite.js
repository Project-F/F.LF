/**	@fileOverview
	@description
	sprite system
	display and control sprites on page using <div> tag

	basically what set_xy does is the HTML4 way (set left, top)
	we actually have much room for performance enhancement here
	-use CSS transition (the HTML5 way) instead
	http://paulirish.com/2011/dom-html5-css3-performance/
	@example
	config=
	{
		canvas: canvas,   //canvas *DOM node*
		wh: {x:100,y:100},// width and height
		img:              //[optional] image list, can call `add_img()` later
		{
			'tag name':'image path',,,  //the first image is visible
		},
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
		this.el.style[support.css2dtransform]= 'translate('+P.x+'px,'+P.y+'px)';
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

/**	set the css zIndex. Great! we do not need to do z-sorting manually
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
sprite.prototype.add_img=function(imgpath,name)
{
	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.src=imgpath;
	im.onload=function()
	{
		if( !this.naturalWidth) this.naturalWidth=this.width;
		if( !this.naturalHeight) this.naturalHeight=this.height;
		this.onload=null;
	}
	this.el.appendChild(im);

	this.img[name]=im;
	this.switch_img(name);
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

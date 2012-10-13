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
/*	basically what set_xy does is the HTML4 way (set left, top)
	we actually have much room for performance enhancement here
	-use CSS transition (the HTML5 way) instead
	http://paulirish.com/2011/dom-html5-css3-performance/
 */

define(function() //exports a class `sprite`
{

var sp_count=0; //sprite count
function sprite (config)
{
	//constructor
	//	no private member
	//	config is one time only and should be dumped after constructor returns
	this.ID=sp_count;
	sp_count++;

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
sprite.prototype.set_wh=function(P)
{
	this.el.style.width=P.x+'px';
	this.el.style.height=P.y+'px';
}
sprite.prototype.set_xy=function(P)
{
	this.el.style.left=P.x+'px';
	this.el.style.top=P.y+'px';
}
sprite.prototype.set_z=function(z)
{
	this.el.style.zIndex=Math.round(z);
}
sprite.prototype.add_img=function(imgpath,name)
{
	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.src=imgpath;
	this.el.appendChild(im);

	this.img[name]=im;
	this.switch_img(name);
	return im;
}
sprite.prototype.switch_img=function(name)
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
sprite.prototype.remove=function()
{
	this.el.parentNode.removeChild(this.el);
}

return sprite;

});
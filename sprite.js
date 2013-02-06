/*\
 * sprite
 * features:
 * - display and control sprites on page using `<div>` and `<img>` tag
 * - multiple images for one sprite
 * - **not** using canvas for sprite animations
 * - support style left/top and CSS transform, depending on browser support
\*/
define(['F.core/css!F.core/style.css','F.core/support','module'],
function(css,support,module)
{

var sp_count = 0; //sprite count
var sp_masterconfig = module.config();
/*\
 * sprite
 [ class ]
 - config (object)
 * {
 - canvas (object) `div` DOM node to create and append sprites to
 - div    (object) `div` DOM node, if specified, will use this `div` as sprite instead of creating a new one
 * you only choose between `canvas` or `div` option
 - wh     (object) width and height
 - img    (object) image list
 *      {
 -      name (string) image path
 *      }
 * or
 - img    (string) if you have only one image
 * }
 * config is one time only and will be dumped, without keeping a reference, after constructor returns
|	var sp_config=
|	{
|		canvas: canvas,    // create and append a div to this node
|		wh: {x:100,y:100}, // width and height
|		img: 'test_sprite.png' // image path
|	}
|	var sp1 = new sprite(sp_config);
 * optionally, you can configure globally some options via requirejs
|	requirejs.config(
|	{
|		baseUrl: "../", //be sure to put all requirejs config in one place
|
|		config:
|		{
|			'F.core/sprite':
|			{
|				baseUrl: '../sprites/', //base url prepended to all image paths
|				disable_css2dtransform: false //[optional], null by default
|			}
|		}
|	});
 * however, note that requirejs configuration must be done __before__ any module loading,
 * and if you want to change some of the global options in runtime, you can do so by calling @sprite.masterconfig
 *
 * more on `config.div` option. if it is specified, will `adopt` this `div` instead of creating a new one. and if that `div` contains `img` elements, will also adopt them if they have a `name` attribute. frankly speaking, `<div><img name="0" src="sprite.png"/></div>` is equivalent to `img: { '0':'sprite.png' }` in a `config` object.
\*/
function sprite (config)
{
	this.ID=sp_count;
	sp_count++;

	if( config.div)
	{
		this.el = config.div;
		/* if( this.el.hasAttribute('class'))
			this.el.setAttribute('class', this.el.getAttribute('class')+' F_sprite_inline');
		else
			this.el.setAttribute('class','F_sprite_inline'); */
		if( this.el.className)
			this.el.className += ' F_sprite_inline';
		else
			this.el.className = 'F_sprite_inline';
		if( window.getComputedStyle(this.el).getPropertyValue('position')==='static')
			this.el.style.position='relative';
	}
	else
	{
		this.el = document.createElement('div');
		//this.el.setAttribute('class','F_sprite');
		this.el.className = 'F_sprite';
		config.canvas.appendChild(this.el);
	}

	this.img={};
	this.cur_img=null;

	this.set_wh(config.wh);
	if( config.img)
	{	//add the images in config list
		if( typeof config.img==='object')
			for ( var I in config.img)
				this.add_img(config.img[I], I);
		else
			this.add_img(config.img, '0');
	}
	if( config.div)
	{	//adopt images in `div`
		var img = config.div.getElementsByTagName('img');
		for( var i=0; i<img.length; i++)
		{
			var Name=img[i].getAttribute('name');
			if( Name)
				this.adopt_img(img[i]);
		}
	}

	if( support.css2dtransform && !config.div)
	{
		this.el.style.left=0+'px';
		this.el.style.top=0+'px';
	}
}

/*\
 * sprite.masterconfig
 [ method ]
 * it depends whether these config will take effect, specifically, `baseUrl` will take effect on the next `add_img`,
 * and `disable_css2dtransform` will not take effect at all because css2dtransform support is built into prototype of sprite during module definition.
\*/
sprite.masterconfig=
sprite.prototype.masterconfig=
function(c)
{
	sp_masterconfig=c;
}

/*\
 * sprite.set_wh
 [ method ]
 * set width and height
 - P (object) `{x,y}`
\*/
sprite.prototype.set_wh=function(P)
{
	this.el.style.width=P.x+'px';
	this.el.style.height=P.y+'px';
}

/*\
 * sprite.set_xy
 [ method ]
 * set x and y
 - P (object) `{x,y}`
\*/
if( support.css2dtransform && !sp_masterconfig.disable_css2dtransform)
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
/*\
 * sprite.set_z
 [ method ]
 * set z index
 - z (number) larger index will show on top
\*/
sprite.prototype.set_z=function(z)
{
	this.el.style.zIndex=Math.round(z);
}
/*\
 * sprite.add_img
 [ method ]
 * add new image
 - imgpath (string)
 - name (string)
 = (object) newly created `img` element
 * note that adding images can and should better be done in constructor `config`
\*/
sprite.prototype.add_img=function(imgpath,Name)
{
	var pre='';
	if( sp_masterconfig.baseUrl)
	pre=sp_masterconfig.baseUrl;

	var im = document.createElement('img');
	im.setAttribute('class','F_sprite_img');
	im.onload=function()
	{
		if( !this.naturalWidth) this.naturalWidth=this.width;
		if( !this.naturalHeight) this.naturalHeight=this.height;
		this.onload=null;
	}
	im.src = pre+imgpath;
	this.el.appendChild(im);

	this.img[Name]=im;
	this.switch_img(Name);
	return im;
}
/**
 * sprite.adopt_img
 * adopt an `img` element that already exists
 [ method ]
 - im (object) `img` element
 */
sprite.prototype.adopt_img=function(im)
{
	var Name=im.getAttribute('name');
	if( im.hasAttribute('class'))
		im.setAttribute('class', im.getAttribute('class')+' F_sprite_img');
	else
		im.setAttribute('class','F_sprite_img');
	if( !im.naturalWidth) im.naturalWidth=im.width;
	if( !im.naturalHeight) im.naturalHeight=im.height;
	if( !im.naturalWidth && !im.naturalHeight)
		im.onload=function()
		{
			if( !this.naturalWidth) this.naturalWidth=this.width;
			if( !this.naturalHeight) this.naturalHeight=this.height;
			this.onload=null;
		}
	this.img[Name]=im;
	this.switch_img(Name);
}
/*\
 * sprite.switch_img
 [ method ]
 - name (string) the key you specified in key-value-pair object `config.img`
\*/
sprite.prototype.switch_img=function(name)
{
	var left,top; //store the left, top of the current displayed image
	for ( var I in this.img)
	{
		if( this.img[I].style.display=='')
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
			this.img[I].style.display='';
		}
		else
		{
			this.img[I].style.display='none';
		}
	}
	this.cur_img=name;
}
/*\
 * sprite.set_img_xy
 * set the position of the image, note that coordinates should be negative to show something
 [ method ]
 - P (object) `{x,y}`
\*/
sprite.prototype.set_img_xy=function(P)
{
	this.img[this.cur_img].style.left= P.x+'px';
	this.img[this.cur_img].style.top= P.y+'px';
}

/*\
 * sprite.remove
 * remove from scene graph
 [ method ]
 * the remove/attach pair means a 'strong removal'.
 * under current implementation, it means remove from DOM
\*/
sprite.prototype.remove=function()
{
	this.el.parentNode.removeChild(this.el);
	this.removed=true;
}
/*\
 * sprite.attach
 * if previously removed, attach back to scene graph
 [ method ]
 * an antagonist pair with @sprite.remove
\*/
sprite.prototype.attach=function()
{
	if( this.removed)
		config.canvas.appendChild(this.el);
}
/*\
 * sprite.hide
 * temporary being hidden in rendering
 [ method ]
 * the hide/show pair is conceptually 'weaker' than remove/attach pair
\*/
sprite.prototype.hide=function()
{
	this.el.style.display='none';
}
/*\
 * sprite.show
 * an antagonist pair with @sprite.hide
 [ method ]
\*/
sprite.prototype.show=function()
{
	this.el.style.display='';
}

return sprite;

});

/*\
 * sprite
 [ class ]
 * - DOM and canvas implementation
 * - a sprite can have multiple sprite sheets
 * - supports horizontal and vertical mirroring
\*/

// interface specification

// static methods

/*\
 * sprite.renderer
 [ property ]
 o static property
 * `DOM` or `canvas`
\*/
/*\
 * sprite.masterconfig
 [ method ]
 * set or get masterconfig. this is entirely optional
 o static method
 - config (object) if set
 - no parameter (undefined) if get
 = config (object) if get
 * the schema is:
 * {
 - baseUrl (string) base url prepended to all image paths; __or__
 - resourcemap (object) a @resourcemap definition
 * choose only one of `baseUrl` or `resourcemap`, they are two schemes of resource url resolution. `baseUrl` simply prepend a string before every url, while `resourcemap` is a general solution. if set, this option will take effect on the next `add_img` or `sprite` creation.
 - disable_css2dtransform (bool) (DOM implementation only)
 - disable_css3dtransform (bool) (DOM implementation only)
 * }
 * 
 * because css transform support is built into prototype of `sprite` during module definition, `disable_css2dtransform` can only be set using requirejs.config __before any__ module loading
 * 
 * example:
|	requirejs.config(
|	{
|		baseUrl: "../", //be sure to put all requirejs config in one place
|
|		config:
|		{
|			'core/sprite':
|			{
|				baseUrl: '../sprites/',
|				resourcemap: {...}, //OR use a resource map
|				disable_css2dtransform: false, //false by default
|				disable_css3dtransform: false  //false by default
|			}
|		}
|	});
\*/
/*\
 * sprite.masterconfig_set
 [ method ]
 o static method
 * sets a key-value pair to masterconfig
 - key (string)
 - value (any)
\*/
/*\
 * sprite.resolve_resource
 [ method ]
 o static method
 * convert a resource name to a full url
 - res (string) resource name
 = (string) full url
\*/
/*\
 * sprite.preload_image
 [ method ]
 o static method
 * preload a given resource
 - imgname (string)
\*/

//constructor

/*\
 * sprite
 [ class ]
 - config (object)
 * {
 - canvas (object) DOM node for sprites rendering. depending on the implementation, must be a `div` or `canvas` element; __or__ it can be a sprite group
 * properties below are optional
 - wh     (object) `{w,h}` width and height, __or__
 - wh     (string) 'fit' fit to image size, __or__
 - xy     (object) `{x,y}` position, __or__
 - xywh   (object) `{x,y,w,h}` position and size
 - img    (object) image list
 - { name (string) image path }; __or__
 - img    (string) if you have only one image. in this case the image will be named '0'
 - type   (string) `'group'`: create as sprite group
 * }
 * 
 * config is one time only and will be dumped, without keeping a reference, after constructor returns. that means it is okay to reuse config objects, in loops or other contexts.
|	var sp_config=
|	{
|		canvas: canvas,    // create and append a div to this node
|		wh: {w:100,h:100}, // width and height
|		wh: 'fit',         // OR fit to image size
|		bgcolor: '#000',   // background color
|		img: 'test_sprite.png' // image path
|	}
|	var sp1 = new sprite(sp_config);
 * 
 * extra `config.div` option (DOM implementation only). if specified, will use this `div` as sprite instead of creating a new one. and if that `div` contains `img` elements, will also adopt them if they have a `name` attribute. frankly speaking, `<div><img name="0" src="sprite.png"/></div>` is equivalent to `img: { '0':'sprite.png' }` in a `config` object.
 * 
 * example of using a sprite group
|	var sp_group = new sprite({canvas:canvas, type:'group'});
|	var sp1 = new sprite({canvas:sp_group, ...});
 * 
 * translating a sprite group will affect all its children. sprite groups can be nested
\*/

// properties

/*\
 * sprite.img
 [ property ]
 * the img list
\*/
/*\
 * sprite.cur_img
 [ property ]
 * name of current image
\*/
/*\
 * sprite.x
 [ property ]
 * position
\*/
/*\
 * sprite.y
 [ property ]
 * position
\*/
/*\
 * sprite.w
 [ property ]
 * size
\*/
/*\
 * sprite.h
 [ property ]
 * size
\*/
/*\
 * sprite.z
 [ property ]
 * z index
\*/
/*\
 * sprite.x_flipped
 [ property ]
 * true if horizontally flipped
\*/
/*\
 * sprite.y_flipped
 [ property ]
 * true if vertically flipped
\*/

// methods

/*\
 * sprite.set_wh
 [ method ]
 * set width and height
 - P (object) `{w,h}`
\*/
/*\
 * sprite.set_w_h
 [ method ]
 * set width and height
 - w (number)
 - h (number)
\*/
/*\
 * sprite.set_w
 [ method ]
 * set width
 - w (number)
\*/
/*\
 * sprite.set_h
 [ method ]
 * set height
 - h (number)
\*/
/*\
 * sprite.set_xy
 [ method ]
 * set x and y
 - P (object) `{x,y}`
\*/
/*\
 * sprite.set_x_y
 [ method ]
 * set x and y
 - x (number)
 - y (number)
\*/
/*\
 * sprite.set_flipx
 [ method ]
 * if set true, render the sprite in horizontal mirror
 - flip (bool)
\*/
/*\
 * sprite.set_flipy
 [ method ]
 * if set true, render the sprite in vertical mirror
 - flip (bool)
\*/
/*\
 * sprite.set_z
 [ method ]
 * set z index
 - z (number) larger index will show on top
\*/
/*\
 * sprite.set_bgcolor
 [ method ]
 * set background color of sprite
 - color (string)
\*/
/*\
 * sprite.set_alpha
 [ method ]
 * set sprite transparency 0.0=transparent, 1.0=opaque
 - alpha (number)
\*/
/*\
 * sprite.add_img
 [ method ]
 - imgpath (string) image path (will be transformed by baseUrl or resourcemap)
 - name (string) key
\*/
/*\
 * sprite.remove_img
 [ method ]
 - name (string) key
\*/
/*\
 * sprite.switch_img
 [ method ]
 - name (string) the key you specified in key-value-pair object `config.img`
\*/
/*\
 * sprite.set_img_xy
 * set the position of the image, note that coordinates should be negative to show something
 [ method ]
 - P (object) `{x,y}`
\*/
/*\
 * sprite.set_img_x_y
 [ method ]
 - x (number)
 - y (number)
\*/

/*\
 * sprite.render
 [ method ]
 * render this sprite or sprite group
\*/

/*\
 * sprite.remove
 [ method ]
 o without parameter
 * remove myself from parent sprite group
 * 
 * the remove/attach pair means a 'strong removal'
 o OR if I am a sprite group
 - sp (object) sprite to be removed from me
\*/
/*\
 * sprite.attach
 [ method ]
 o without parameter
 * if previously removed, attach back to previous sprite group
 * 
 * an antagonist pair with @sprite.remove
 o if I am a sprite group
 - sp (object) sprite to be attached to me
\*/

/*\
 * sprite.hide
 * temporarily being hidden in rendering
 [ method ]
 * the hide/show pair is conceptually 'weaker' than remove/attach pair
\*/
/*\
 * sprite.show
 * an antagonist pair with @sprite.hide
 [ method ]
\*/

/*\
 * sprite.remove_all
 * remove all children from sprite group
 [ method ]
\*/

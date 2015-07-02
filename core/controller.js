define(function()
{

//block F1 key in IE
if( 'onhelp' in window)
{
	window.onhelp = function(){
		return false;
	}
}

document.addEventListener("keydown", keydown, true);
document.addEventListener("keyup", keyup, true);
function keydown(e) { return master_controller.key(e,1); }
function keyup(e) { return master_controller.key(e,0); }

var master_controller = {};
master_controller.block=true;
master_controller.child = [];
master_controller.key = function(e,down)
{
	if (!e) e = window.event;
	for (var I in this.child)
	{
		if ( this.child[I].key(e.keyCode,down))
			break;//if one controller catches a key, the next controller will never receive an event
	}
	if( master_controller.block)
	{
		//block browser-native key events, including ctrl+f and F1~F12
		e.preventDefault();
		return false;
	}
}

/*\
 * controller
 * keyboard controller
 * - controllers for multiple players on the same keyboard
 * - maintains a table of key states
 * - generate key events for child controllers
 * - buffered mode: buffer inputs and fetch only once a loop
 * - never drops keys
 * see [http://project--f.blogspot.hk/2012/11/keyboard-controller.html](http://project--f.blogspot.hk/2012/11/keyboard-controller.html) for technical explaination
 [ class ]
 - config (object)
|	var con_config=
|	{
|		up:'h',down:'n',left:'b',right:'m',def:'v',jump:'f',att:'d'
|		//,'control name':'control key',,,
|	}
|	var con = new controller(con_config);
\*/
function controller (config)
{
	/*\
	 * controller.state
	 [ property ]
	 - (object)
	 * table of key states
	 * 
	 * note that keys are indexed by their names, i.e. `up`,`down` rather than `w`,`s`
	 | con.state.down //check if the `down` key is pressed down
	\*/
	this.state={};
	/*\
	 * controller.config
	 [ property ]
	 - (object)
	 * note that controller still keeps a reference to the config object
	\*/
	this.config=config;
	/*\
	 * controller.keycode
	 [ property ]
	 - (object)
	 * the keycode for each key
	\*/
	this.keycode={};
	/*\
	 * controller.child
	 [ property ]
	 * child systems that has the method `key(name,down)`
	 *
	 * push a child into this array to listen to key events
	 *
	 * see @combodec.key
	\*/
	this.child=new Array();
	/*\
	 * controller.sync
	 [ property ]
	 * shall always be true
	 * 
	 * all key events are buffered, and must be `fetch` manually
	\*/
	this.sync=true;
	/*\
	 * controller.buf
	 [ property ]
	 - (array)
	 * the array of keyname of buffered key input
	\*/
	this.buf=new Array();

	//[--constructor
	master_controller.child.push(this);
	this.clear_states();
	for(var I in this.config)
	{
		this.keycode[I] = controller.keyname_to_keycode(this.config[I]);
	}
	//--]

	/*\
	 * controller.zppendix
	 * on the other hand, there can be other controllers with compatible definition and behavior,
	 * (e.g. touch controller, AI controller, network player controller, record playback controller)
	 * - has the properties `state`, `config`, `child`
	 * - behavior: call the `key` method of every member of `child` when keys arrive
	 * - has the method `clear_states`, `fetch` and `flush`
	 * - behavior: the controller should buffer key inputs, and only dispatch to child when `fetch` is called, and flush the buffer when `flush` is called
	\*/
}

/*\
 * controller.block
 o static function
 [ method ]
 - block (bool) if true, will block all other keydown/up event listeners
\*/
controller.block = function(bool)
{
	master_controller.block = bool;
}

/*\
 * controller.destroy
 [ method ]
 * destroy a controller; do not listen to key events any more
\*/
controller.prototype.destroy = function()
{
	var ii = master_controller.child.indexOf(this);
	if( ii!==-1)
		master_controller.child.splice(ii,1);
}

/*\
 * controller.type
 [ property ]
 - (string)
 * value=`'keyboard'`
\*/
controller.prototype.type = 'keyboard';

/*\
 * controller.key
 [ method ]
 * supply events to controller
 * 
 * master controller will do this automatically
 - e (object) keycode
 - down (boolean)
\*/
controller.prototype.key=function(e,down) //interface to master_controller
{
	var caught=0;
	for(var I in this.config)
	{
		if ( this.keycode[I]==e)
		{
			if( this.sync===false)
			{
				if( this.child)
					for(var J in this.child)
						this.child[J].key(I,down);
				this.state[I]=down;
			}
			else
			{
				this.buf.push([I,down]);
			}
			caught=1;
			break;
		}
	}
	return caught;
}

/*\
 * controller.clear_states
 * clear the key state table
 [ method ]
\*/
controller.prototype.clear_states=function()
{
	for(var I in this.config)
		this.state[I]=0;
}
/*\
 * controller.fetch
 * fetch for inputs received since the last fetch, will flush buffer afterwards
 [ method ]
\*/
controller.prototype.fetch=function()
{
	for( var i=0; i<this.buf.length; i++)
	{
		var I=this.buf[i][0];
		var down=this.buf[i][1];
		if( this.child)
			for(var j=0; j<this.child.length; j++)
				this.child[j].key(I,down);
		this.state[I]=down;
	}
	this.buf.length=0;
}
/*\
 * controller.flush
 * flush the buffer manually
 [ method ]
\*/
controller.prototype.flush=function()
{
	this.buf=[];
}

/*\
 * controller.keyname_to_keycode
 * convert keyname to keycode
 [ method ]
 - keyname (string) 
 = (number) keycode 
 * note that some keycode is not the same across all browsers, 
 * for details consult [http://www.quirksmode.org/js/keys.html](http://www.quirksmode.org/js/keys.html)
\*/
controller.keyname_to_keycode=
controller.prototype.keyname_to_keycode=
function(A)
{
	if( typeof A==='number')
		return A;
	var code;
	if( A.length==1)
	{
		var a=A.charCodeAt(0);
		if ( (a>='a'.charCodeAt(0) && a<='z'.charCodeAt(0)) || (a>='A'.charCodeAt(0) && a<='Z'.charCodeAt(0)) )
		{
			A=A.toUpperCase();
			code=A.charCodeAt(0);
		}
		else if (a>='0'.charCodeAt(0) && a<='9'.charCodeAt(0))
		{
			code=A.charCodeAt(0);
		}
		else
		{	//different browsers on different platforms are different for symbols
			switch(A)
			{
				case '`': code=192; break;
				case '-': code=189; break;
				case '=': code=187; break;
				case '[': code=219; break;
				case ']': code=221; break;
				case '\\': code=220; break;
				case ';': code=186; break;
				case "'": code=222; break;
				case ',': code=188; break;
				case '.': code=190; break;
				case '/': code=191; break;
				case ' ': code=32; break;
			}
		}
	}
	else
	{
		switch(A)
		{
			case 'ctrl': code=17; break;
			case 'up': code=38; break; //arrow keys
			case 'down': code=40; break;
			case 'left': code=37; break;
			case 'right': code=39; break;
			case 'space': code=32; break;
			case 'esc': code=27; break;
		}
	}
	if( A.length==2)
	{
		if( A.charAt(0)==='F')
		{
			code=111+parseInt(A.slice(1));
		}
	}
	return code;
}

/*\
 * controller.keycode_to_keyname
 * convert keycode back to keyname
 [ method ]
 - keycode (number) 
 = (string) keyname
\*/
controller.keycode_to_keyname=
controller.prototype.keycode_to_keyname=
function(code)
{
	if( (code>='A'.charCodeAt(0) && code<='Z'.charCodeAt(0)) ||
	    (code>='0'.charCodeAt(0) && code<='9'.charCodeAt(0)) )
	{
		return String.fromCharCode(code).toLowerCase();
	}
	else if( code>=112 && code<=123)
	{
		return 'F'+(code-111);
	}
	else
	{
		var nam = code;
		switch(code)
		{
			case 38: nam='up'; break;
			case 40: nam='down'; break;
			case 37: nam='left'; break;
			case 39: nam='right'; break;
			case 32: nam='space'; break;
			case 27: nam='esc'; break;
		}
		return nam;
	}
}

return controller;

// http://unixpapa.com/js/key.html
});

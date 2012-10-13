/**	@fileOverview
	@description
	keyboard controller system
	maintains a table of key states
 */

define(['core/F'],function(F) //exports a class `controller`
{

function keydown(e)
{
	return master_controller.key(e,1);
}

function keyup(e)
{
	return master_controller.key(e,0);
}

var master_controller = (function()
{
	window.onkeydown = F.double_delegate(window.onkeydown, keydown);
	window.onkeyup   = F.double_delegate(window.onkeydown, keyup);

	var mas = new Object();
	mas.child = [];
	mas.key = function(e,down)
	{
		if (!e) e = window.event;
		for (var I in this.child)
		{
			if ( this.child[I].key(e,down))
				break;//if one controller catches a key, the next controller will never receive an event
		}
	}
	return mas;
}());

/**	@class
	keyboard controller
	@example
	config=
	{
		up:'h', down:'n', left:'b', 'control name':'control key',,,
	}
	@description
	on the other hand, there can be other controllers with compatible definition and behavior,
	(e.g. AI controller, network player controller, record playback controller)
	-has the member variables `state`, `config`, `child`, `sync`
	-behavior: call the `key` method of every member of `child` when keys arrive
	-has the method `clear_states`, `fetch` and `flush`
	-behavior: if `sync` is true, the controller should buffer key inputs,
	           and only dispatch to child when `fetch` is called,
	           and flush the buffer when `flush` is called
 */
function controller (config)
{
	this.state={};
	this.config=config;
	this.keycode={};
	/**	@property controller.child child system that has the method key('control name',down)
		push a child into this array to listen to key events
	*/
	this.child=new Array();
	/**	@property controller.sync controllers can work in 2 modes, sync and async.
		if sync===false, a key up-down event will be distributed to all child **immediately**.
		if sync===true, a key up-down event will be buffered, and must be fetch manually.
	*/
	this.sync=false;
	this.buf=new Array();

	/**	supply events to controller
		(master controller will do this automatically)
		@function
		@param e event
		@param down
	*/
	this.key=function(e,down) //interface to master_controller------
	{
		var caught=0;
		for(var I in this.config)
		{
			if ( this.keycode[I]==e.keyCode)
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

	//interface to application--------------------------------------
	/**	clear the key state table
		@function
	*/
	this.clear_states=function()
	{
		for(var I in this.config)
			this.state[I]=0;
	}
	/**	fetch for inputs received since the last fetch
		will flush buffer afterwards
		@function
	*/
	this.fetch=function()
	{
		for( var i in this.buf)
		{
			var I=this.buf[i][0];
			var down=this.buf[i][1];
			if( this.child)
				for(var J in this.child)
					this.child[J].key(I,down);
			this.state[I]=down;
		}
		this.buf=[];
	}
	/**	flush the buffer manually
		@function
	*/
	this.flush=function()
	{
		this.buf=[];
	}

	//[--constructor
	master_controller.child.push(this);
	this.clear_states();
	for(var I in this.config)
	{
		this.keycode[I] = controller.keyname_to_keycode(this.config[I]);
	}
	//--]
}

/**	convert keyname to keycode
	@function
*/
controller.keyname_to_keycode=function(A)
{
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
	return code;
}

/**	convert keycode back to keyname
	@function
*/
controller.keycode_to_keyname=function(code)
{
	if( (code>='A'.charCodeAt(0) && code<='Z'.charCodeAt(0)) ||
	    (code>='0'.charCodeAt(0) && code<='9'.charCodeAt(0)) )
	{
		return String.fromCharCode(code).toLowerCase();
	}
	else
	{
		return ''+code;
	}
}

return controller;

// http://www.quirksmode.org/js/keys.html
// http://unixpapa.com/js/key.html
});

//keyboard controller system
/*	maintains a table of key states
 */
/*	require: F.js
 */

if( typeof F=='undefined') F=new Object;
if( typeof F.master_controller=='undefined') //#ifndef
{

F.keydown = function(e)
{
	return F.master_controller.key(e,1);
}
F.keyup = function(e)
{
	return F.master_controller.key(e,0);
}

F.master_controller = (function()
{
	window.onkeydown = F.double_delegate(window.onkeydown, F.keydown);
	window.onkeyup   = F.double_delegate(window.onkeydown, F.keyup);
	
	var mas = new Object;
	mas.child = new Array();
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

//keyboard controller
/*	sample config for F.controller (control keys)
	{
		up:'h', down:'n', left:'b', 'control name':'control key',,, 
	}
	-each control key must be an alphabet
	-F.controller doesnt care the name of each control
*/
/*	on the other hand, there can be other controllers with compatible definition and behavior,
	(e.g. AI controller, network player controller, record playback controller)
	-has the member variables `state`, `config`, `child`
	-has the method `clear_states`
	-behavior: call the `key` method of every member of `child` when keys arrive
 */
F.controller = function (config)
{
	this.state={};
	this.config=config;
	this.child=new Array(); //child system that has the method key('control name',down)
	
	this.key=function(e,down)
	{
		var caught=0;
		for(var I in this.config)
		{
			if ( F.keyname_to_keycode(this.config[I])==e.keyCode)
			{
				if( this.child)
					for(var J in this.child)
						this.child[J].key(I,down);
				
				this.state[I]=down;
				caught=1;
			}
		}
		return caught;
	}
	
	this.clear_states=function()
	{
		for(var I in this.config)
			this.state[I]=0;
	}
	
	//[--constructor
	F.master_controller.child.push(this);
	this.clear_states();
	//--]
}

F.keyname_to_keycode=function(A)
{
	if( A.length==1)
	{
		//a-z only
		var a=A.charCodeAt(0);
		if ( (a>='a'.charCodeAt(0) && a<='z'.charCodeAt(0)) || (a>='A'.charCodeAt(0) && a<='Z'.charCodeAt(0)) )
		{
			A=A.toLowerCase();
			return code = A.charCodeAt(0) - 'a'.charCodeAt(0) + 65;
		}
		
		if (a>='0'.charCodeAt(0) && a<='9'.charCodeAt(0))
		{
			return code = A.charCodeAt(0) - '0'.charCodeAt(0) + 48;
		}
	}
	
	//TODO: other keys not supported
	//	for a good list, see controller1.html
}

// http://www.quirksmode.org/js/keys.html
// http://unixpapa.com/js/key.html
} //endif

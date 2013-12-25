/*\
 * touchcontroller
 * 
 * touch controller for LF2
\*/
define(['LF/util'],function(util)
{
	var controllers=[];
	var touches=[];
	var locked=false;
	function touch_fun(event)
	{
		touches = event.touches;
		if( locked)
			event.preventDefault();
	}
	setTimeout(function()
	{
		locked=true;
	},5000);
	document.addEventListener('touchstart', touch_fun, false);
	document.addEventListener('touchmove', touch_fun, false);
	document.addEventListener('touchenter', touch_fun, false);
	document.addEventListener('touchend', touch_fun, false);
	document.addEventListener('touchleave', touch_fun, false);
	document.addEventListener('touchcancel', touch_fun, false);
	window.addEventListener('resize', function()
	{
		for( var i=0; i<controllers.length; i++)
			controllers[i].resize();
	}, false);

	function TC()
	{
		var $=this;
		$.state={ up:0,down:0,left:0,right:0,def:0,jump:0,att:0 };
		$.button={
			up:{label:'&uarr;'},down:{label:'&darr;'},left:{label:'&larr;'},right:{label:'&rarr;'},
			def:{label:'D'},jump:{label:'J'},att:{label:'A'}
		};
		$.config=null;
		$.child=[];
		$.sync=true; //only sync===true is supported
		controllers.push(this);
		for( var key in $.button)
		{
			var el = document.createElement('div');
			document.getElementsByClassName('LFtouchControlHolder')[0].appendChild(el);
			el.className = 'touchControllerButton';
			el.innerHTML= '<span>'+$.button[key].label+'</span>';
			$.button[key].el = el;
		}
		$.resize();
	}
	TC.prototype.resize=function()
	{
		var $=this;
		var w = window.innerWidth,
			h = window.innerHeight;
		var sizeA = 0.3,
			sizeB = 0.25,
			padL = 0.1,
			padR = 0.2,
			offy = 0,
			R = 0.75;
		if( h>w)
		{
			offy = h/2;
			h = w/16*9;
		}
		sizeA = sizeA*h;
		sizeB = sizeB*h;
		$.button['up'].left = sizeA*padL;
		$.button['up'].top = h/2-sizeA+offy;
		$.button['up'].right = $.button['up'].left+sizeA*2;
		$.button['up'].bottom = $.button['up'].top+sizeA*R;
		$.button['down'].left = sizeA*padL;
		$.button['down'].top = h/2+sizeA*(1-R)+offy;
		$.button['down'].right = $.button['down'].left+sizeA*2;
		$.button['down'].bottom = $.button['down'].top+sizeA*R;
		$.button['left'].left = sizeA*padL;
		$.button['left'].top = h/2-sizeA+offy;
		$.button['left'].right = $.button['left'].left+sizeA*R;
		$.button['left'].bottom = $.button['left'].top+sizeA*2;
		$.button['right'].left = sizeA*(2-R+padL);
		$.button['right'].top = h/2-sizeA+offy;
		$.button['right'].right = $.button['right'].left+sizeA*R;
		$.button['right'].bottom = $.button['right'].top+sizeA*2;
		$.button['def'].left = w-sizeB*(1.5+padR);
		$.button['def'].top = h/2+offy;
		$.button['def'].right = $.button['def'].left+sizeB;
		$.button['def'].bottom = $.button['def'].top+sizeB;
		$.button['jump'].left = w-sizeB*(2+padR);
		$.button['jump'].top = h/2-sizeB+offy;
		$.button['jump'].right = $.button['jump'].left+sizeB;
		$.button['jump'].bottom = $.button['jump'].top+sizeB;
		$.button['att'].left = w-sizeB*(1+padR);
		$.button['att'].top = h/2-sizeB+offy;
		$.button['att'].right = $.button['att'].left+sizeB;
		$.button['att'].bottom = $.button['att'].top+sizeB;
		set_xy_wh($.button['up']);
		set_xy_wh($.button['down']);
		set_xy_wh($.button['left']);
		set_xy_wh($.button['right']);
		set_xy_wh($.button['def']);
		set_xy_wh($.button['jump']);
		set_xy_wh($.button['att']);
	}
	function set_xy_wh(B)
	{
		B.el.style.left = B.left+'px';
		B.el.style.top = B.top+'px';
		B.el.style.width = (B.right-B.left)+'px';
		B.el.style.height = (B.bottom-B.top)+'px';
	}
	function inbetween(x,L,R)
	{
		var l,r;
		if ( L<=R)
		{	l=L;
			r=R;
		}
		else
		{	l=R;
			r=L;
		}
		return x>=l && x<=r;
	}
	function point_in_rect(Px,Py,R)
	{
		return (inbetween(Px,R.left,R.right) && inbetween(Py,R.top,R.bottom));
	}
	TC.prototype.clear_states=function()
	{
		for(var I in this.state)
			this.state[I]=0;
	}
	TC.prototype.fetch=function()
	{
		var $=this;
		for( var key in $.button)
		{
			var down=false;
			for (i=0; i<touches.length; i++)
			{
				var T=touches[i];
				if( point_in_rect(T.clientX,T.clientY,$.button[key]))
				{
					down=true;
					break;
				}
			}
			if (down && !$.state[key])
			{
				for( var i=0; i<$.child.length; i++)
					$.child[i].key(key,1);
				$.state[key]=1;
			}
			else if (!down && $.state[key])
			{
				//key up event omitted because combodec does not need
				$.state[key]=0;
			}
		}
	}
	TC.prototype.flush=function()
	{
	}

	return TC;
});
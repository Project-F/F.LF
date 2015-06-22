/*\
 * touchcontroller
 * 
 * touch controller for LF2
\*/
define(['LF/util'],function(util)
{
	var controllers=[];
	var touches=[], eventtype;
	function touch_fun(event)
	{
		if( !TC.enabled) return;
		eventtype = event.type;
		touches = event.touches;
		for( var i in controllers)
			if( !controllers[i].sync)
				controllers[i].fetch();
		if( TC.preventDefault)
			event.preventDefault();
	}
	for( var event in {'touchstart':0,'touchmove':0,'touchenter':0,'touchend':0,'touchleave':0,'touchcancel':0})
	{
		document.addEventListener(event, touch_fun, false);
	}
	window.addEventListener('resize', function()
	{
		for( var i=0; i<controllers.length; i++)
			controllers[i].resize();
	}, false);

	function TC(config)
	{
		var $=this;
		$.config=config;
		if( $.config.layout==='gamepad')
		{
			$.state={ up:0,down:0,left:0,right:0,def:0,jump:0,att:0 };
			$.button={
				up:{label:'&uarr;'},down:{label:'&darr;'},left:{label:'&larr;'},right:{label:'&rarr;'},
				def:{label:'D'},jump:{label:'J'},att:{label:'A'}
			};
		}
		else if( $.config.layout==='functionkey')
		{
			$.state={ F1:0,F2:0,F4:0,F7:0};
			$.button={
				F1:{label:'F1'},F2:{label:'F2'},F4:{label:'F4'},F7:{label:'F7'}
			};
		}
		$.child=[];
		$.sync=true;
		$.pause_state=false;
		controllers.push(this);
		for( var key in $.button)
		{
			var el = document.createElement('div');
			util.div('touch_control_holder').appendChild(el);
			el.className = 'touch_controller_button';
			el.innerHTML = '<span>'+$.button[key].label+'</span>';
			$.button[key].el = el;
		}
		$.resize();
	}
	TC.enabled=false;
	TC.preventDefault=false;
	TC.enable=function(en)
	{
		TC.enabled = en;
	}
	TC.prototype.type = 'touch';
	TC.prototype.resize=function()
	{
		var $=this;
		var w = window.innerWidth,
			h = window.innerHeight;
		if( $.config.layout==='gamepad')
		{
			var sizeA = 0.20,
				sizeB = 0.20,
				sizeC = 0.25,
				padL = 0.1,
				padR = 0.2,
				offy = 0,
				R = 0.65;
			if( h>w)
			{
				offy = h/2;
				h = w/16*9*1.5;
			}
			else
			{
				offy = h/5;
			}
			sizeA*=h;
			sizeB*=h;
			sizeC*=h;
			this.set_button_pos({
				//'name':[ left, top, width, height ],
				'up':   [ sizeA*padL, h/2-sizeA+offy, sizeA*2, sizeA*R ],
				'down': [ sizeA*padL, h/2+sizeA*(1-R)+offy, sizeA*2, sizeA*R],
				'left': [ sizeA*padL, h/2-sizeA+offy, sizeA*R, sizeA*2],
				'right':[ sizeA*(2-R+padL), h/2-sizeA+offy, sizeA*R, sizeA*2],
				'def':  [ w-sizeB*(1.5+padR), h/2+offy, sizeB, sizeB],
				'jump': [ w-sizeB-sizeC*(1+padR), h/2-sizeB+offy, sizeB, sizeB],
				'att':  [ w-sizeC*(1+padR), h/2-sizeC+offy, sizeC, sizeC]
			});
		}
		else if( $.config.layout==='functionkey')
		{
			$.paused($.pause_state);
		}
	}
	TC.prototype.set_button_pos=function(sett)
	{
		var $=this;
		for( var I in sett)
		{
			var B = $.button[I];
			B.left = sett[I][0];
			B.top = sett[I][1];
			B.right = sett[I][0]+sett[I][2];
			B.bottom = sett[I][1]+sett[I][3];
			B.el.style.left = B.left+'px';
			B.el.style.top = B.top+'px';
			B.el.style.width = (B.right-B.left)+'px';
			B.el.style.height = (B.bottom-B.top)+'px';
		}
	}
	TC.prototype.paused=function(pause)
	{
		var $=this;
		var w = window.innerWidth,
			h = window.innerHeight;
		this.pause_state=pause;
		TC.preventDefault=!pause;
		if( $.config.layout==='functionkey')
		{
			var size = 0.08*(h<w?h:w),
				offy = 0,
				offx = 0;
			if( h>w)
			{
				offx = -w/10;
				offy = h/2.5;
			}
			if( pause)
			{	//expand the collection
				var Fleft = h/10-size/2+offx,
					Ftop = h/10-size/2+offy;
				this.set_button_pos({
					'F1':[ Fleft,            Ftop, size, size],
					'F2':[ Fleft+size*1.5,   Ftop, size, size],
					'F4':[ Fleft+size*1.5*3, Ftop, size, size],
					'F7':[ Fleft+size*1.5*6, Ftop, size, size]
				});
				for( var i in {F1:0,F2:0,F4:0,F7:0})
				{
					if( !$.hidden)
						show($.button[i]);
					$.button[i].disabled=10; //disable for 10 frames
				}
			}
			else
			{	//collapse
				this.set_button_pos({
					'F1': [ h/10-size/2, h/10-size/2+offy, size, size],
					'F2': [ h/10-size/2, h/10-size/2+offy, size, size],
					'F4': [ h/10-size/2, h/10-size/2+offy, size, size],
					'F7': [ h/10-size/2, h/10-size/2+offy, size, size]
				});
				if( !$.hidden)
					show($.button['F1']);
				$.button['F1'].disabled=false;
				for( var i in {F2:0,F4:0,F7:0})
				{
					hide($.button[i]);
					$.button[i].disabled=true;
				}
			}
		}
	}
	TC.prototype.hide=function()
	{
		var $=this;
		for( var i in $.button)
		{
			hide($.button[i]);
			$.button[i].disabled=true;
		}
		$.hidden=true;
	}
	TC.prototype.show=function()
	{
		var $=this;
		$.hidden=false;
		for( var i in $.button)
		{
			show($.button[i]);
			$.button[i].disabled=false;
		}
	}
	TC.prototype.restart=function()
	{
		var $=this;
		if( $.config.layout==='functionkey')
		{
			this.paused(false);
		}
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
			if( $.button[key].disabled)
			{
				if( typeof $.button[key].disabled==='number')
					$.button[key].disabled--;
				continue;
			}
			var down=false;
			for (var i=0; i<touches.length; i++)
			{
				var T=touches[i];
				if( point_in_rect(T.clientX,T.clientY,$.button[key]))
				{
					down=true;
					break;
				}
			}
			if ((down && !$.state[key]) || (!down && $.state[key]))
			{
				for( var i=0; i<$.child.length; i++)
					$.child[i].key(key,down);
				$.state[key]=down;
				if( down)
					$.button[key].el.style.border = '2px solid rgb(255, 170, 170)';
				else
					$.button[key].el.style.border = '2px solid rgb(170, 255, 255)';
			}
		}
	}
	TC.prototype.flush=function()
	{
	}

	return TC;

	//util
	function show(B)
	{
		B.el.style.visibility='visible';
	}
	function hide(B)
	{
		B.el.style.visibility='hidden';
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
});

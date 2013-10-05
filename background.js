define(['F.core/util','F.core/sprite','F.core/support','LF/global'],function(Futil,Fsprite,Fsupport,global)
{
	var GA = global.application;

	function background(config,data,id)
	{
		var $=this;
		if( !config)
		{	//create an empty background
			$.id = -1;
			$.name = 'empty background';
			$.width = 1500;
			$.zboundary = [0,300];
			$.height=$.zboundary[1]-$.zboundary[0];
			$.shadow={x:0,y:0,img:''}
			return;
		}
		$.layers;
		$.floor = config.floor;
		$.data = data;
		$.name = data.name.replace(/_/g,' ');
		$.id = id;

		$.zboundary=data.zboundary;
		$.width=data.width;
		$.height=$.zboundary[1]-$.zboundary[0];
		$.shadow={
			x:0,y:0, //offset x,y
			img:data.shadow
		};
		if( Fsupport.css3dtransform)
			$.dropframe = 0;
		else
			$.dropframe = 1;
		(function(){
			var sp = new Fsprite({img:data.shadow});
			sp.img[0].addEventListener('load', onload, true);
			function onload()
			{
				$.shadow.x = (this.naturalWidth||this.width)/2;
				$.shadow.y = (this.naturalHeight||this.height)/2;
				sp.img[0].removeEventListener('load', onload, true);
			}
		}());

		$.floor.style.width=$.width+'px';

		if( config.scrollbar)
		{
			var sc = document.createElement('div');
			$.scrollbar=sc;
			sc.className = 'LFbackgroundScroll';
			var child = document.createElement('div');
			child.style.width=$.width+'px';
			child.className = 'LFbackgroundScrollChild';
			sc.appendChild(child);
			$.floor.parentNode.parentNode.appendChild(sc);
			sc.onscroll=function()
			{
				if( $.camera_locked)
				{
					$.camerax=sc.scrollLeft;
					$.scroll(sc.scrollLeft);
				}
			}
			sc.onmousedown=function()
			{
				$.camera_locked=true;
				$.scrolling=true;
			}
			sc.onmouseup=function()
			{
				$.camera_locked=false;
			}
			if(!('__proto__' in {}))
			{	//IE 9,10 quirk
				sc.onmousemove=function()
				{
					$.scrolling=false;
					$.camera_locked=false;
				}
			}
		}

		if( config.camerachase)
		{
			$.char = config.camerachase.character;
			$.camerax = $.width/2;
			$.cami = 0;
		}

		$.layers=[];
		$.layers.push({
			div:$.floor,
			ratio:1
		});
		var LAY = Futil.group_elements(data.layer,'width');
		for( var i in LAY)
		{
			var lay=
			{
				div: document.createElement('div'),
				ratio: (parseInt(i)-GA.window.width)/($.width-GA.window.width)
			};
			for( var j=0; j<LAY[i].length; j++)
			{
				var sp_config=
				{
					canvas: lay.div,
					wh: 'fit',
					img: LAY[i][j].pic
				}
				var sp = new Fsprite(sp_config);
				sp.set_x_y( LAY[i][j].x, LAY[i][j].y);
			}
			lay.div.className='LFbackgroundLayer';
			lay.div.style.zIndex=-1000+parseInt(i);
			config.layers.appendChild(lay.div);
			$.layers.push(lay);
		}

		if( config.viewer_only)
		{
		}
	}

	//return true if the moving object is leaving the scene
	background.prototype.leaving=function(ps)
	{
		var $=this;
		var nx=ps.x+ps.vx,
			ny=ps.y+ps.vy;
		return (nx<0 || nx>$.width || ny<-600 || ny>100);
	}

	//get an absolute position using a ratio, e.g. get_pos(0.5,0.5) is exactly the mid point
	background.prototype.get_pos=function(rx,rz)
	{
		var $=this;
		return { x:$.width*rx, y:0, z:$.zboundary[0]+$.height*rz};
	}

	if( Fsupport.css3dtransform)
	{
		background.prototype.scroll=function(X)
		{
			var $=this;
			for( var i=0; i<$.layers.length; i++)
				$.layers[i].div.style[Fsupport.css3dtransform]= 'translate3d('+-Math.floor(X*$.layers[i].ratio)+'px,0px,0px) ';
		}
	}
	else if( Fsupport.css2dtransform)
	{
		background.prototype.scroll=function(X)
		{
			var $=this;
			for( var i=0; i<$.layers.length; i++)
				$.layers[i].div.style[Fsupport.css2dtransform]= 'translate('+-Math.floor(X*$.layers[i].ratio)+'px,0px) ';
		}
	}
	else
	{
		background.prototype.scroll=function(X)
		{
			var $=this;
			for( var i=0; i<$.layers.length; i++)
				$.layers[i].div.style.left=-Math.floor(X)*$.layers[i].ratio+'px';
		}
	}

	var screenW=GA.window.width,
		halfW  =GA.window.width/2;
	background.prototype.TU=function()
	{
		var $=this;
		if( $.camera_locked)
			return;
		if( $.cami++%($.dropframe+1)!==0)
			return;
		/** algorithm by Azriel
			http://www.lf-empire.de/forum/archive/index.php/thread-4597.html
		 */
		var avgX=0,
			facing=0,
			numPlayers=0;
		for( var i in $.char)
		{
			avgX+= $.char[i].ps.x;
			facing+= $.char[i].dirh();
			numPlayers++;
		}
		if( numPlayers>0)
			avgX/=numPlayers;
		//var xLimit= (facing*screenW)/(numPlayers*6) - (halfW + avgX);
		//  his original equation has one error, it should be 24 regardless of number of players
		var xLimit= (facing*screenW/24)+(avgX-halfW);
		if( xLimit < 0) xLimit=0;
		if( xLimit > $.width-screenW) xLimit = $.width-screenW;
		var spdX = (xLimit - $.camerax) * GA.camera.speed_factor * ($.dropframe+1);
		if( spdX!==0)
		{
			if( -0.05<spdX && spdX<0.05)
				$.camerax = xLimit;
			else
				$.camerax = $.camerax + spdX;
			$.scroll($.camerax);
			if( $.scrollbar)
				$.scrollbar.scrollLeft = Math.round($.camerax);
		}
	}

	return background;
});

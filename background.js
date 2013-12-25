define(['F.core/util','F.core/sprite','F.core/support','LF/global'],function(Futil,Fsprite,Fsupport,global)
{
	var GA = global.application;

	var global_timer, global_timer_children=[];
	function standalone(child)
	{
		global_timer_children.push(child);
		if( !global_timer)
			global_timer = setInterval(function()
			{
				for( var i=0; i<global_timer_children.length; i++)
				{
					global_timer_children[i].TU();
				}
			}, 1000/30); //30 fps
	}

	/* config=
	{
		layers:, //DOM node, layers holder, append bg layers here
		floor:,  //DOM node, livingobjects holder, scroll this to move camera
		scrollbar:,
		camerachase:{character:} //camera only chase these characters
		standalone:,	//no match, background viewer only
	}*/
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
		$.layers=[];
		$.timed_layers=[];
		$.timer=0;
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

		if( $.floor)
			$.floor.style.width=$.width+'px';

		if( config.scrollbar)
		{
			var sc = document.createElement('div');
			$.scrollbar=sc;
			sc.className = 'backgroundScroll';
			var child = document.createElement('div');
			child.style.width=$.width+'px';
			child.className = 'backgroundScrollChild';
			sc.appendChild(child);
			config.layers.parentNode.appendChild(sc);
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
			}
			sc.onmouseup=function()
			{
				$.camera_locked=false;
			}
			if(!('__proto__' in {}))
			{	//IE 9,10 quirk
				sc.onmousemove=function()
				{
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
		else
			$.camera_locked = true;

		//create layers
		if( $.floor)
		$.layers.push({
			sp: new Fsprite({div:$.floor,type:'group'}),
			ratio:1
		});
		var LAY = Futil.group_elements(data.layer,'width');
		for( var i in LAY)
		{
			var lay=
			{
				sp: new Fsprite({canvas:config.layers,type:'group'}),
				ratio: (parseInt(i)-GA.window.width)/($.width-GA.window.width)
			};
			lay.sp.set_z(-1000+parseInt(i));
			$.layers.push(lay);
			for( var j=0; j<LAY[i].length; j++)
			{
				var dlay = LAY[i][j]; //layer data
				var sp_config;
				if( dlay.rect)
				{
					//if `rect` is defined, `pic` will only be a dummy
					sp_config=
					{
						canvas: lay.sp.el,
						wh: {x:dlay.width, y:dlay.height}
					}
				}
				else if( dlay.pic)	
				{
					sp_config=
					{
						canvas: lay.sp.el,
						wh: 'fit',
						img: dlay.pic
					}
				}
				var sp;
				if( !dlay.loop)
				{
					sp = new Fsprite(sp_config);
					sp.set_x_y( dlay.x, correct_y(dlay));
					if( dlay.rect)
						sp.el.style.background=color_conversion(dlay.rect);
				}
				else
				{
					sp = new Fsprite({canvas:lay.sp.el,type:'group'}); //holder
					sp_config.canvas = sp.el;
					sp.set_x_y(0,0);
					for( var xx=dlay.x; xx<dlay.width; xx += dlay.loop)
					{
						var spi = new Fsprite(sp_config);
						spi.set_x_y( xx, dlay.y);
						if( dlay.rect)
							spi.el.style.background=color_conversion(dlay.rect);
					}
				}
				if( dlay.cc)
					$.timed_layers.push({
						sp:sp,
						cc:dlay.cc,
						c1:dlay.c1,
						c2:dlay.c2
					});
			}
		}

		if( config.standalone)
		{
			standalone(this);
			$.carousel = {
				type: config.standalone.carousel,
				dir: 1,
				speed: 1
			};
			$.camera_locked = false;
		}

		//a very strange bug for the scene 'HK Coliseum' must be solved by hard coding
		function correct_y(dlay)
		{
			if( data.name==='HK Coliseum')
			{
				if( dlay.pic.indexOf('back1')===-1)
					return dlay.y-8;
				else
					return dlay.y;
			}
			else
				return dlay.y;
		}
	}

	function color_conversion(rect)
	{
		if( typeof rect==='string')
			return rect; //extended standard: CSS color format allowed
		else if( typeof rect==='number')
		{
			var lookup, computed;
			switch (rect)
			{
				case 4706: lookup='rgb(16,79,16)'; break; //lion forest
				case 40179: lookup='rgb(159,163,159)'; break; //HK Coliseum
				case 29582: lookup='rgb(119,119,119)'; break;
				case 37773: lookup='rgb(151,119,111)'; break;
				case 33580: lookup='rgb(135,107,103)'; break;
				case 25356: lookup='rgb(103,103,103)'; break;
				case 21096: lookup='rgb(90,78,75)'; break; //Stanley Prison
				case 37770: lookup='rgb(154,110,90)'; break; //The Great Wall
				case 16835: lookup='rgb(66,56,24)'; break; //Queen's Island
				case 34816: lookup='rgb(143,7,7)'; break; //Forbidden Tower
			}
			var r = (rect>>11<<3),
				g = (rect>>6&31)<<3,
				b = ((rect&31)<<3);
			computed = 'rgb('+
				(r+(r>64||r===0?7:0))+','+
				(g+(g>64||g===0?7:0)+((rect>>5&1)&&g>80?4:0))+','+
				(b+(b>64||b===0?7:0))+
				')';
			if( lookup && computed!==lookup)
				console.log('computed:'+computed,'correct:'+lookup);
			if( lookup)
				return lookup;
			else
				return computed;
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

	background.prototype.scroll=function(X)
	{
		var $=this;
		for( var i=0; i<$.layers.length; i++)
			$.layers[i].sp.set_x_y(-(X*$.layers[i].ratio),0);
	}

	var screenW=GA.window.width,
		halfW  =GA.window.width/2;
	background.prototype.TU=function()
	{
		var $=this;
		//camera movement
		if( !$.camera_locked)
		{
			if( !$.carousel)
			{	//camera chase
				if( $.cami++%($.dropframe+1)!==0)
					return;
				/// algorithm by Azriel
				/// http://www.lf-empire.de/forum/archive/index.php/thread-4597.html
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
			else if( $.carousel.type==='linear')
			{
				var lastscroll = $.scrollbar.scrollLeft;
				$.scrollbar.scrollLeft += $.width/200*$.carousel.speed*$.carousel.dir;
				if( lastscroll === $.scrollbar.scrollLeft)
					$.carousel.dir *= -1;
				$.scroll($.scrollbar.scrollLeft);
			}
		}
		//layers animation
		for( var i=0; i<$.timed_layers.length; i++)
		{
			var lay = $.timed_layers[i];
			var frame = $.timer%lay.cc;
			if( frame>=lay.c1 && frame<=lay.c2)
				lay.sp.show();
			else
				lay.sp.hide();
		}
		$.timer++;
	}

	return background;
});

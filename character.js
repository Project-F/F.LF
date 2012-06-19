//character in F.LF
if( typeof F=='undefined') F=new Object;
if( typeof F.LF=='undefined') F.LF=new Object;
if( typeof F.LF.character=='undefined') //#ifndef
{

F.LF.character = function(con)
{
	//data file
	var dat = bandit;
	this.name=dat.bmp.name;
	
	//---hack-------------------------------------------------------
	//some hacking over the original data to make compatible bahavior
	
	//---status-----------------------------------------------------
	this.hp=100;
	this.mp=100;
	this.bdefend=70;
	this.fall=70;
	
	//the state variable
	var state=0;
	var wait=1; //when wait decreases to zero, a frame transition happens
	var next=999; //next frame
	
	//frame
	var framePN=0; //previous frame number
	var frameN=0; //current frame number
	var frame=dat.frame[0]; //current frame object
	
	var log=document.getElementById('log');
	
	//---configurations---------------------------------------------
	
	var W=dat.bmp.file0.w+1; //width, height of a frame
	var H=dat.bmp.file0.h+1;
	
	//sprite config
	var sp_con= 
	{
		canvas: document.getElementById('canvas'),
		wh: {x:W,y:H},
		img:
		{
			'l':'bandit_l.png',
			'r':'bandit_r.png'
		}
	}
	
	//animator config
	var ani_con=
	{
		x:0,  y:0,   //top left margin of the frames
		w:W, h:H,    //width, height of a frame
		gx:10, gy:14,//define a gx*gy grid of frames
		tar:null     //target F.sprite, object not exist yet, specify later
	};
	
	//combo list
	var combo_con = [
		{ name:'left', seq:['left']},
		{ name:'right', seq:['right']},
		{ name:'def', seq:['def']},
		{ name:'jump', seq:['jump']},
		{ name:'att', seq:['att']},
		{ name:'run', seq:['right','right']},
		{ name:'run', seq:['left','left']},
		{ name:'hit_Da', seq:['def','down','att']},
		{ name:'hit_Fa', seq:['def','left','att']},
		{ name:'hit_Fa', seq:['def','right','att']},
		{ name:'hit_Ua', seq:['def','up','att']},
		{ name:'hit_Dj', seq:['def','down','jump']},
		{ name:'hit_Fj', seq:['def','left','jump']},
		{ name:'hit_Fj', seq:['def','right','jump']},
		{ name:'hit_Uj', seq:['def','up','jump']},
		{ name:'hit_ja', seq:['def','jump','att']}
	];
	//combo detector config
	var dec_con =
	{
		rp: {up:99,down:99,left:99,right:99,def:99,jump:99,att:99}, //the same key must repeat no more than X times
		timeout:30, //time to clear buffer (approx. 1s in 30fps)
		comboout:8, //the max time interval(in frames) between keys to make a combo
		callback: combo_event, //callback function when combo detected
		no_repeat_key: true //eliminate repeated key strokes by browser
	}
	
	function switch_dir_fun(e)
	{
		if( dir==='left' && e==='right')
		{
			dir='right';
			sp.switch_img('r');
		}
		else if( dir==='right' && e==='left')
		{
			dir='left';
			sp.switch_img('l');
		}
	}
	var switch_dir=true;
	
	function dirh()
	{
		return (dir==='left'?-1:1);
	}
	
	function dirv()
	{
		var d=0;
		if( con.state.up)   d-=1;
		if( con.state.down) d+=1;
		return d;
	}
	
	//---set up-----------------------------------------------------
	//sprite
	var sp = new F.sprite(sp_con);
	sp.x=0; sp.y=0; sp.z=0;
	sp.vx=0; sp.vy=0; sp.vz=0;
	
	//animator
	ani_con.tar=sp; //specify the target F.sprite
	var ani = new F.animator(ani_con,'base');
	
	//direction switcher
	var dir='right';
	
	//controller
	// con is a parameter
	var pri_con = new F.controller({log:'d'});
	
	//combodec
	var dec = new F.combodec(con, dec_con, combo_con);
	
	//---internal functions-----------------------------------------
	
	function frame_update() //generic update done at every frame
	{
		logg('|fu:'+frame.name.slice(0,3)+'| ');
		
		//show frame
		ani.set_frame(frame.pic);
		
		//velocity
		sp.vx+= dirh() * frame.dvx;
		sp.vz+= dirv() * frame.dvz;
		sp.vy+= frame.dvy;
		
		//wait for next frame
		wait=frame.wait;
		next=frame.next;
		
		//set state
		if(state !== frame.state)
			state = frame.state;
		
		//special update
		var tar=fu[frame.state];
		if( tar) tar();
	}
	
	function state_update() //generic update done at every TU (30fps)
	{
		logg('|su:'+frame.name.slice(0,3)+'| ');
		
		//special update
		var tar=su[frame.state];
		if( tar) tar();
		
		//position
		sp.x += sp.vx;
		sp.z += sp.vz;
		sp.y += sp.vy;
		if( sp.y>0) sp.y=0; //never below the ground
		sp.set_xy({x:sp.x, y:sp.y+sp.z}); //projection onto screen
		sp.set_z(sp.z); //z ordering
		
		if( sp.y===0) //only on the ground
		{	//friction proportional to speed
			sp.vx *= 0.73;
			sp.vz *= 0.73;
			if( sp.vx>-1 && sp.vx<1) sp.vx=0;
			if( sp.vz>-1 && sp.vz<1) sp.vz=0;
		}
		
		if( sp.y<0) //gravity
			sp.vy+= 1.9;
		
		if( sp.y===0 && sp.vy>0)
		{//falling onto the ground
			sp.vy=0;
			switch (frameN)
			{
			case 212: //jumping
				frame_trans(215); //crouch
				break;
			case 100: //rowing
				frame_trans(94); //??
				break;
			case 201: //ice
				if( sp.vy>10) //if speed is too great
					frame_trans(202); //broken ice
				else
					wait--;
				break;
			default:
				frame_trans(219); //crouch2
			}
			wait++; //to comply with original LF2
		}
	}
	
	var su= //special state update
	{
		'0':function() //standing
		{
			var dx=0, dz=0; //to resolve key conflicts
			if( con.state.up)   dz -=1;
			if( con.state.down) dz +=1;
			if( con.state.left) dx -=1;
			if( con.state.right)dx +=1;
			if( dx || dz)
				frame_trans(5);
		},
		
		'1':function() //walking
		{
			if(con.state.up)    sp.z-=dat.bmp.walking_speedz;
			if(con.state.down)  sp.z+=dat.bmp.walking_speedz;
			if(con.state.left)  sp.x-=dat.bmp.walking_speed;
			if(con.state.right) sp.x+=dat.bmp.walking_speed;
			
			var dx=0, dz=0; //to resolve key conflicts
			if( con.state.up)   dz -=1;
			if( con.state.down) dz +=1;
			if( con.state.left) dx -=1;
			if( con.state.right)dx +=1;
			if( !dx && !dz)
				frame_trans(999); //go back to standing
		},
		
		'2':function() //running
		{	//to maintain the velocity against friction
			sp.vx= dirh() * dat.bmp.running_speed;
			sp.vz= dirv() * dat.bmp.running_speedz;
		},
		
		'3':function() //punch, jump_attack, ...
		{
			if( wait===0) //leaving the current frame
			{
				if( next===999) //going back to standing
				{
					if( switch_dir===false)
						switch_dir=true;
				}
				else if( next===212) //going back to jump
				{
					switch_dir=true;
					if(con.state.left) switch_dir_fun('left');
					if(con.state.right) switch_dir_fun('right');
				}
			}
		},
		
		'4':function() //jump
		{
			if( frameN===212) //is jumping
			{
				if( con.state.att)
				{
					switch_dir=false;
					frame_trans(80);
				}
			}
		},
		
		'15':function() //stop_running, crouch, crouch2, dash_attack
		{
			if( next===999 && wait===0) //leaving the current frame
			{	//and going back to standing
				if( switch_dir===false)
				{
					switch_dir=true; //re-enable switch dir
					if(con.state.left) switch_dir_fun('left');
					if(con.state.right) switch_dir_fun('right');
				}
			}
		}
	}
	
	var fu= //special frame update
	{
		da:{}, //data area
		'1':function() //walking
		{
			fu.oscillate(5,8);
			wait=dat.bmp.walking_frame_rate;
		},
		'2':function() //running
		{
			fu.oscillate(9,11);
			wait=dat.bmp.running_frame_rate;
		},
		'3':function() //punch, jump_attack, run_attack, ...
		{
			if( frameN===81) //jump_attack
				next=212; //back to jump
			if( frameN===85) //run_attack
				;
		},
		'4':function() //jump
		{
			if( frameN===212 && framePN===211)
			{	//start jumping
				var dx = 0;
				if( con.state.left)  dx-= 1;
				if( con.state.right) dx+= 1;
				sp.vx= dx * dat.bmp.jump_distance;
				sp.vz= dirv() * dat.bmp.jump_distancez;
				sp.vy= dat.bmp.jump_height; //upward force
			}
		},
		// '6':function() //rowing
		//'15':function() //stop_running, crouch2, dash_attack
		oscillate:function(a,b) //oscillate between frame a and b
		{
			if( typeof fu.da.i==='undefined' || fu.da.i<a || fu.da.i>b)
			{
				fu.da.up=true;
				fu.da.i=a+1;
			}
			if( fu.da.i<b && fu.da.up)
				next=fu.da.i++;
			else if( fu.da.i>a && !fu.da.up)
				next=fu.da.i--;
			if( fu.da.i==b) fu.da.up=false;
			if( fu.da.i==a) fu.da.up=true;
		}
	}
	
	var ce= //combo event
	{
		'0':function(K) //standing
		{
			switch(K)
			{
			case 'run':
				switch_dir=false;
				frame_trans(9);
			break;
			case 'def':
				frame_trans(110);
			break;
			case 'jump':
				frame_trans(210);
			break;
			case 'att':
				frame_trans(Math.random()<0.5? 60:65);
			break;
			}
		},
		'1':function(K) //walking
		{	//walking same as standing
			return ce['0'](K);
		},
		'2':function(K) //running
		{
			switch(K)
			{
			case 'left': case 'right':
				if(K!=dir)
				{
					frame_trans(218);
				}
			break;
			case 'def':
				switch_dir=false;
				frame_trans(102);
			break;
			case 'jump':
				switch_dir=true;
				ce.goto_dash();
			break;
			case 'att':
				frame_trans(85);
			break;
			}
		},
		'5':function(K) //dash
		{
			if( K==='att')
			{
				if( dirh()==(sp.vx>0?1:-1)) //only if not turning back
				{
					switch_dir=false;
					frame_trans(90);
				}
			}
			if( K==='left' || K==='right')
			{
				if( K!=dir)
				{
					if( dirh()==(sp.vx>0?1:-1))
					{//turn back
						if( frameN===213) frame_trans(214);
						if( frameN===216) frame_trans(217);
					}
					else
					{//turn to front
						if( frameN===214) frame_trans(213);
						if( frameN===217) frame_trans(216);
					}
				}
			}
		},
		'15':function(K) //stop_running, crouch2, dash attack
		{
			if( frameN===215)
			{
				if( K==='def')
					frame_trans(102);
				if( K==='jump')
					if( con.state.left || con.state.right)
						ce.goto_dash();
					else
					{
						wait+=2;
						next=210;
					}
			}
		},
		'goto_dash':function()
		{
			frame_trans(213);
			sp.vx= dirh() * dat.bmp.dash_distance;
			sp.vz= dirv() * dat.bmp.dash_distancez;
			sp.vy= dat.bmp.dash_height;
		}
	}
	
	function combo_event(kobj)
	{
		logg('|ce:'+kobj.name+'| ');
		
		var K=kobj.name;
		
		var tar=ce[frame.state];
		if( tar) tar(K);
		
		if( K=='left' || K=='right')
			if( switch_dir)
				switch_dir_fun(K);
	}
	
	function frame_trans(F)
	{
		if( F===0)
		{
			//do nothing
		}
		else
		{
			if( F===999)
				F=0;
			framePN=frameN;
			frameN=F;
			frame=dat.frame[F];
			frame_update();
			wait--; //to comply with original LF2
		}
	}
	
	function logg(X)
	{
		/*if( pri_con.state.log)
		{
			log.value+= X;
			if( log.value.length>10000) log.value='';
			log.scrollTop+=20;
		}*/
	}
	
	//---external functions-----------------------------------------
	this.frame=function()
	{
		state_update();
		dec.frame();
		
		if( wait===0)
		{
			frame_trans(next);
			wait++; //to compensate the wait--
		}
		else
			wait--;
		
		logg('\n');
	}
	this.set_pos=function(x,y,z)
	{
		sp.x=x, sp.y=y, sp.z=z;
	}
}

} //#endif

/** a template for making a living object
 */

define(['LF/global','LF/sprite','LF/mechanics','core/util','core/states'],
function ( Global, Sprite, Mech, Futil, Fstates)
{

/**	config=
	{
		stage,
		scene,
		data
	}
 */
function lightweapon(config)
{
	//must have these for identity
	var dat = config.data; //alias to data
	this.name='baseball bat';
	this.type='light weapon';
	this.uid=-1; //unique id, will be assigned by scene
	var This=this;
	var GC=Global.gameplay;

	function frame_transistor()
	{
		var wait=1; //when wait decreases to zero, a frame transition happens
		var next=999; //next frame

		//cause a transition
		this.frame=function(F)
		{
			this.set_next(F);
			this.set_wait(0);
		}

		this.set_wait=function(value)
		{
			wait=value;
		}

		this.set_next=function(value)
		{
			next=value;
		}

		//when frame transition happens
		this.trans=function()
		{
			if( wait===0 && next!==0)
			{
				if( next===999)
					next=0;
				frame.PN=frame.N;
				frame.N=next;
				frame.D=dat.frame[next];
				frame_update();
			}
			else
				wait--;
		}
	}

	//create a sprite as specified by dat.bmp and append to stage
	var sp = new Sprite(dat.bmp, stage);

	//reasonably to have health
	var health=
	{
		hp: 100
	};

	//for frame transition
	var frame=
	{
		PN: 0, //previous frame number
		N: 0, //current frame number
		D: dat.frame[0], //current frame's data object
		mobility: 1 //ignor it
	};

	var effect=
	{
		freeze: 0 //duration to freeze
	};

	var itr=
	{
		vrest: 0
	};

	//the mechanics backend
	var mech = new Mech(frame,sp);
	var ps = mech.create_metric(); //position, velocity, and other physical properties

	//you will need a simple frame transistor
	var trans = new frame_transistor();

	//direction switcher
	function switch_dir_fun(e)
	{
		if( ps.dir==='left' && e==='right')
		{
			ps.dir='right';
			sp.switch_lr('right');
		}
		else if( ps.dir==='right' && e==='left')
		{
			ps.dir='left';
			sp.switch_lr('left');
		}
	}
	function dirh()
	{
		return (ps.dir==='left'?-1:1);
	}

	//generic update done at every frame
	function frame_update()
	{
		//show frame
		sp.show_pic(frame.D.pic);

		//velocity
		ps.vx+= dirh() * frame.D.dvx;
		ps.vz+= frame.D.dvz;
		ps.vy+= frame.D.dvy;

		//wait for next frame
		trans.set_wait(frame.D.wait);
		trans.set_next(frame.D.next);
	}

	//generic update done at every TU (30fps)
	function state_update()
	{
		if( effect.freeze===0)
		{
			interaction();

			if( frame.D.state===1001)
			{	//I am passive! so I dont need to care states of myself
			}
			else
			{	//dynamics: position, friction, gravity
				mech.dynamics();
			}
			if( frame.D.state===1002)
			{	//being thrown
				ps.vy -= 1.1; //compensate some gravity
			}

			if( ps.y===0 && ps.vy>0) //fell onto ground
			{
				ps.vy=0; //set to zero
				trans.frame(70);
			}
		}
		else
			effect.freeze--;

		if( itr.vrest>0)
			itr.vrest--;
	}

	function interaction()
	{
		var ITR=Futil.make_array(frame.D.itr);

		if( itr.vrest===0)
		for( var j in ITR)
		{	//for each itr tag
			if( ITR[j].kind===0) //kind 0 only
			{
				var vol=mech.volume(ITR[j]);
				if( vol.zwidth===0) vol.zwidth = GC.default_itr_zwidth;
				var hit= config.scene.query(vol, This, {body:0});
				for( var k in hit)
				{	//for each being hit
					hit[k].hit(ITR[j],This,{x:ps.x,y:ps.y,z:ps.z}); //hit you!
					ps.vx = dirh() * GC.weapon_hit_vx;
					ps.vy = GC.weapon_hit_vy;
					effect.freeze = 2;
					itr.vrest = GC.default_weapon_vrest;
				}
			}
			//kind 5 is handled in `act()`
		}
	}

	//---external interface---

	this.TU=function()
	{
		state_update();
	}
	this.trans=function()
	{
		if( effect.freeze===0)
			trans.trans();
	}
	this.set_pos=function(x,y,z)
	{
		mech.set_pos(x,y,z);
	}
	this.bdy=function()
	{
		return mech.body();
	}
	this.disappear=function()
	{
		mech.disappear();
	}

	//---inter living objects protocal---

	this.dirh=dirh;
	this.hit=function(ITR, att, attps)
	{
		ITR; //the itr object
		att; //the attacker!
		attps; //position of attacker
		if( (att.dirh()>0)!==(ps.vx>0))
			ps.vx *= GC.weapon_reverse_factor_vx;
		ps.vy *= GC.weapon_reverse_factor_vy;
		ps.vz *= GC.weapon_reverse_factor_vz;
	}
	this.act=function(wpoint,holdpoint,attps,attitr,att) //I act according to the character who is holding me
	{
		var fD = frame.D;
		var thrown = false;

		trans.frame(wpoint.weaponact);
		trans.trans();

		if( fD.wpoint && fD.wpoint.kind===2)
		{
			if( wpoint.dvx) ps.vx = att.dirh() * wpoint.dvx;
			if( wpoint.dvz) ps.vz = att.dirv() * wpoint.dvz;
			if( wpoint.dvy) ps.vy = wpoint.dvy;
			if( ps.vx || ps.vy || ps.vz)
			{
				mech.set_pos( //impulse
					attps.x + att.dirh() * 73,
					attps.y - 23,
					attps.z + ps.vz );
				ps.zz=0;
				trans.frame(40);
				trans.trans();
				thrown=true;
			}

			if( wpoint.cover && wpoint.cover===1)
				ps.zz = -1;
			else
				ps.zz = GC.default_cover;

			if( !thrown)
			{
				switch_dir_fun(attps.dir);
				ps.sz = ps.z = attps.z;
				mech.coincideXY(holdpoint,mech.make_point(fD.wpoint));
				mech.project();
			}

			if( itr.vrest===0)
			if( wpoint.attacking)
			{
				var ITR=Futil.make_array(fD.itr);

				for( var j in ITR)
				{	//for each itr tag
					if( ITR[j].kind===5) //kind 5 only
					{
						var vol=mech.volume(ITR[j]);
						if( vol.zwidth===0) vol.zwidth = GC.default_itr_zwidth;
						var hit= config.scene.query(vol, [att,This], {body:0});
						console.log(hit);
						for( var k in hit)
						{	//for each being hit
							if( !attitr.vrest[ hit[k].uid ])
							{
								var citr;
								if( dat.weapon_strength_list[wpoint.attacking])
									citr = dat.weapon_strength_list[wpoint.attacking];
								else
									citr = ITR[j];
								hit[k].hit(citr,att,{x:attps.x,y:attps.y,z:attps.z}); //hit you!
								attitr.vrest[ hit[k].uid ] = GC.default_weapon_vrest;
								itr.vrest = GC.default_weapon_vrest;
							}
						}
					}
				}
			}
		}
		if (thrown) return 'thrown';
	}
	this.drop=function(dvx,dvy)
	{
		if( dvx) ps.vx=dvx * 0.5;
		if( dvy) ps.vy=dvy * 0.2;
		ps.zz=0;
		trans.frame(999);
	}
}

return lightweapon; //return your class to get it defined
});

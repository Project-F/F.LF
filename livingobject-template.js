/** a template for making a living object
 */

define(['LF/sprite','LF/mechanics','core/states'],
function ( Sprite, Mech, Fstates)
{

/**	@constructor
	@param config here you accept configurations
 */
/**	config=
	{
		stage, //the div where I append myself into
		scene, //to interact with other living objects in the scene
		data //should accept a data structure
	}
 */
function livingobject(config)
{
	//must have these for identity
	var dat = config.data; //alias to data
	this.name='some object';
	this.type='object';
	this.uid; //unique id, will be assigned by scene

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
		//dynamics: position, friction, gravity
		mech.dynamics();
	}

	//---external interface---

	this.TU=function()
	{
		state_update();
	}
	this.trans=function()
	{
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

	//---inter living objects protocal---

	this.hit=function(ITR, att, attps)
	{
		ITR; //the itr object
		att; //the attacker!
		attps; //position of attacker
	}
}

return livingobject; //return your class to get it defined
});
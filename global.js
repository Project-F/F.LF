/** global constants of a game
*/
define(function()
{

var G={};

/** id properties-----------------------------------------------------*/
G.id={};

/** 0: default*/
G.id['0']={};
G.id['30']={}; //bandit

/**	Light Weapons		id from 100~149
 */
G.id['100']= //stick (baseball bat)
{
	mass: 0.35,
	attackable: true, //can hold this to attack
	run_throw: true, //can throw while running by forward-attack
	jump_throw: true, //can throw while jumping by forward-attack
	dash_throw: false, //can throw while dashing
	stand_throw: false, //can throw while standing by forward-attack
	just_throw: false //can throw while standing by just pressing attack
	//TODO: 039.wav when hitting id: 121
};

G.id['101']= //hoe
{
	mass: 0.65,
	attackable: true,
	run_throw: true,
	jump_throw: true
};

/**	Effects				id from 300~349 (extended standard)
 */
G.id['300']=
{
	oscillate: 4, //oscillation amplitude
	cant_move: true,
	drop_weapon: true
};
G.id['301']= //blood
{
	cant_move: true,
	drop_weapon: true
};

/** controller config-------------------------------------------------*/

G.combo_list = [
	{ name:'left', seq:['left']},
	{ name:'right', seq:['right']},
	{ name:'def', seq:['def']},
	{ name:'jump', seq:['jump']},
	{ name:'att', seq:['att']},
	{ name:'run', seq:['right','right']},
	{ name:'run', seq:['left','left']},
	{ name:'DvA', seq:['def','down','att']},
	{ name:'D<A', seq:['def','left','att']},
	{ name:'D>A', seq:['def','right','att']},
	{ name:'D^A', seq:['def','up','att']},
	{ name:'DvJ', seq:['def','down','jump']},
	{ name:'D<J', seq:['def','left','jump']},
	{ name:'D>J', seq:['def','right','jump']},
	{ name:'D^J', seq:['def','up','jump']},
	{ name:'DJA', seq:['def','jump','att']}
];
G.detector_config = //combo detector config
{
	timeout:30, //time to clear buffer (approx. 1s in 30fps)
	comboout:8, //the max time interval(in frames) between keys to make a combo
	no_repeat_key: true //eliminate repeated key strokes by browser
};


/** gameplay constants------------------------------------------------*/
G.gameplay={};
var GC = G.gameplay;
/** What are the defaults?
default means `otherwise specified`. all defaults get overrided, and
  (mostly) you can set the specific property in data files.
  so it might not be meaningful to change default values
 */
GC.default={};

GC.default.itr={};
GC.default.itr.zwidth= 12; //default itr zwidth
GC.default.itr.hit_stall= 3; //default stall when hit somebody

GC.default.cpoint={};
GC.default.cpoint.hurtable= 0; //default cpoint hurtable
GC.default.cpoint.cover= 0; //[not modifiable] default cpoint cover

GC.default.wpoint={};
GC.default.wpoint.cover= 0;

GC.default.effect={};
GC.default.effect.num= 0; //default effect num
GC.default.effect.duration= 3; //default effect lasting duration

GC.default.fall={};
GC.default.fall.value= 20; //default fall
GC.default.fall.dvy= -6.9; //default dvy when falling

GC.default.throw={};
GC.default.throw.frame= 135; //default frame being thrown

GC.default.weapon={};
GC.default.weapon.vrest= 9; //default weapon vrest

GC.default.character={};
GC.default.character.arest= 7; //default character arest

GC.default.machanics={};
GC.default.machanics.mass= 1; //default mass; weight = mass * gravity

/**  Below are defined constants over the game,
  it might introduce bugs if these values are tweaked too much (like 1->10)
 */
GC.recover={};
GC.recover.fall= -1; //fall recover constant
GC.recover.bdefend= -0.5; //bdefend recover constant

GC.effect={};
GC.effect.num_to_id= 300; //convert effect num to id

GC.bounceup={};
GC.bounceup.limit= 200; //defined square of speed to bounce up again
GC.bounceup.factor={};
GC.bounceup.factor.x= 0.6; //defined bounce up factor(s)
GC.bounceup.factor.y= -0.4;
GC.bounceup.factor.z= 0.6;

GC.defend={};
GC.defend.injury={};
GC.defend.injury.factor= 0.1; //defined defend injury factor
GC.defend.break= 40; //defined defend break

GC.fall={};
GC.fall.KO= 60; //defined KO

GC.friction={};
GC.friction.factor= 0.74; //defined factor of friction when on the ground
GC.friction.fell={};
GC.friction.fell.factor= 0.34; //defined friction at the moment of falling onto ground

GC.min_speed= 1; //defined minimum speed

GC.gravity= 1.7; //defined gravity

GC.weapon={};
GC.weapon.reverse={};
GC.weapon.reverse.factor={};
GC.weapon.reverse.factor.vx= -0.4; //defined speed factor when a weapon being hit
GC.weapon.reverse.factor.vy= -2;
GC.weapon.reverse.factor.vz= -0.4;
GC.weapon.hit={};
GC.weapon.hit.vx= -3; //defined speed when a weapon hit others
GC.weapon.hit.vy= 0;

GC.unspecified= -842150451; //0xCDCDCDCD, one kind of HEX label

return G;
});

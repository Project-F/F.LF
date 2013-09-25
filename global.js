/*\
 * global.js
 * 
 * global constants of a game
 * 
 * note to data changers: tweak entries in this file very carefully. do not add or delete entries.
\*/
define(function()
{

var G={};

G.application={};
G.application.window={};
G.application.window.width=794;
G.application.window.height=550;
G.application.viewer={};
G.application.viewer.height=400;
G.application.camera={};
G.application.camera.speed_factor=1/18;

/*\
 * global.combo_list
 [ property ]
 * list of combos
 | { name:'DvA', seq:['def','down','att']} //example
\*/
G.combo_list = [
	{ name:'hit_Fa', seq:['def','left','att']},
	{ name:'hit_Fa', seq:['def','right','att']},
	{ name:'hit_Da', seq:['def','down','att']},
	{ name:'hit_Ua', seq:['def','up','att']},
	{ name:'hit_Dj', seq:['def','down','jump']},
	{ name:'hit_Uj', seq:['def','up','jump']},
	{ name:'hit_Fj', seq:['def','left','jump']},
	{ name:'hit_Fj', seq:['def','right','jump']},
	{ name:'hit_ja', seq:['def','jump','att']}
];

G.lazyload = function(O)
{
	//return true to delay loading of data files of specific type
	if( O.type==='character')
		return true;
}

G.gameplay={};
var GC = G.gameplay;

/*\
 * global.gameplay.default
 [ property ]
 * What are the defaults?
 * 
 * default means `otherwise specified`. all defaults get overridden, and (mostly) you can set the specific property in data files. so it might not be meaningful to change default values.
 * if any of them cannot be overridden, please move them out of default.
\*/
GC.default={};

GC.default.itr={};
GC.default.itr.zwidth= 12; //default itr zwidth
GC.default.itr.hit_stall= 3; //default stall when hit somebody

GC.default.cpoint={};
GC.default.cpoint.hurtable= 0; //default cpoint hurtable
GC.default.cpoint.cover= 0; //default cpoint cover
GC.default.cpoint.vaction= 135; //default frame being thrown

GC.default.wpoint={};
GC.default.wpoint.cover= 0;

GC.default.effect={};
GC.default.effect.num= 0; //default effect num

GC.default.fall={};
GC.default.fall.value= 20; //default fall
GC.default.fall.dvy= -6.9; //default dvy when falling

GC.default.weapon={};
GC.default.weapon.vrest= 9; //default weapon vrest

GC.default.character={};
GC.default.character.arest= 7; //default character arest

GC.default.machanics={};
GC.default.machanics.mass= 1; //default mass; weight = mass * gravity

/*\
 * global.gameplay
 [ property ]
 * gameplay constants
 * 
 * these are defined constants over the game, tweak them carefully otherwise it might introduce bugs
\*/

GC.recover={};
GC.recover.fall= -0.5; //fall recover constant
GC.recover.bdefend= -0.5; //bdefend recover constant

GC.effect={};
GC.effect.num_to_id= 300; //convert effect num to id
GC.effect.duration= 3; //default effect lasting duration

GC.character={};
GC.character.bounceup={}; //bounce up during fall
GC.character.bounceup.limit={};
GC.character.bounceup.limit.xy= 13.4; //defined speed threshold to bounce up again
GC.character.bounceup.limit.y= 11; //y threshold; will bounce if any one of xy,y is overed
GC.character.bounceup.y= 4.25; //defined bounce up speed
GC.character.bounceup.absorb= //how much dvx to absorb when bounce up
{
	9:1,
	14:4,
	20:10,
	40:20
}

GC.defend={};
GC.defend.injury={};
GC.defend.injury.factor= 0.1; //defined defend injury factor
GC.defend.break_limit= 40; //defined defend break
GC.defend.absorb= //how much dvx to absorb when defence is broken
{	//look up table
	5:0,
	15:5
}

GC.fall={};
GC.fall.KO= 60; //defined KO
GC.fall.wait180= //the wait of 180 depends on effect.dvy
{	//lookup
	//dvy:wait
	7:1,
	9:2,
	11:3,
	13:4,
	15:5,
	17:6
}

GC.friction={};
GC.friction.fell=    //defined friction at the moment of fell onto ground
{	//a lookup table
	//speed:friction
	2:0,
	3:1,
	5:2,
	6:4, //smaller or equal to 6, value is 4
	9:5,
	13:7,
	15:9
}

GC.min_speed= 1; //defined minimum speed

GC.gravity= 1.7; //defined gravity

GC.weapon={};
GC.weapon.bounceup={}; //when a weapon falls onto ground
GC.weapon.bounceup.limit= 8; //defined limit to bounce up again
GC.weapon.bounceup.speed={};
GC.weapon.bounceup.speed.y= -3.7; //defined bounce up speed
GC.weapon.bounceup.speed.x= 6;
GC.weapon.bounceup.speed.z= 3;
GC.weapon.soft_bounceup={}; //when heavy weapon being hit by character punch
GC.weapon.soft_bounceup.speed={};
GC.weapon.soft_bounceup.speed.y= -2;

GC.weapon.hit={}; //when a weapon hit others
GC.weapon.hit.vx= -3; //absolute speed
GC.weapon.hit.vy= 0;

GC.weapon.gain={}; //when a weapon is being hit at rest
GC.weapon.gain.factor={}; //gain factor
GC.weapon.gain.factor.x= 1.1;
GC.weapon.gain.factor.y= 1.8;

GC.weapon.reverse={}; //when a weapon is being hit while travelling in air
GC.weapon.reverse.factor={};
GC.weapon.reverse.factor.vx= -0.4;
GC.weapon.reverse.factor.vy= -2;
GC.weapon.reverse.factor.vz= -0.4;

GC.unspecified= -842150451; //0xCDCDCDCD, one kind of HEX label

return G;
});

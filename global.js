/** global constants of a game
*/
define(function()
{
return {
	gameplay: { //game constants
		fall_recover: -1, //fall recover constant
		bdefend_recover: -0.5, //bdefend recover constant
		default_itr_zwidth: 12, //default itr zwidth
		default_cpoint_cover: 0, //[not fully modifiable] default cpoint cover
		default_effect_duration: 3, //default effect lasting duration
		default_effect_type: 0, //default effect type
		default_fall: 20, //default fall
		default_fall_dvy: -6.9, //default dvy when falling
		default_hurtable: 0, //default hurtable
		default_frame_thrown: 135, //default frame being thrown
		default_cover: 1, //default cover
		default_weapon_vrest: 14, //default weapon vrest
		default_arest: 7, //default character arest

		effect0_amplitude: 4, //defined oscillation amplitude for effect 0
		friction_fell_factor: 0.34, //defined friction at the moment of falling onto ground
		bounceup_limit: 200, //defined square of speed to bounce up again
		bounceup_factor_x: 0.6, //defined bounce up factor(s)
		bounceup_factor_y: -0.4,
		bounceup_factor_z: 0.6,
		defend_injury_factor: 0.1, //defined defend injury factor
		defend_break: 40, //defined defend break
		KO: 60, //defined KO
		friction_factor: 0.74, //defined factor of friction
		min_speed: 1, //defined minimum speed
		gravity: 1.7, //defined gravity
		weapon_reverse_factor_vx: -0.4, //defined speed factor when a weapon being hit
		weapon_reverse_factor_vy: -2,
		weapon_reverse_factor_vz: -0.4,
		weapon_hit_vx: -3, //defined speed when a weapon hit others
		weapon_hit_vy: 0,

		unspecified: -842150451 //0xCDCDCDCD, one kind of HEX label
	}
};
});
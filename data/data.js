/** serves the same as data.txt or (deep_chop.dat in earlier versions)
 */
/**
type:
character				id from 0~99
lightweapon				id from 100~149
heavyweapon				id from 150~199
specialattack			id from 200~299
baseball
miscell (Criminal, etc, broken_weapon)
drinks (Milk and beer)
effects (blood,fire)	id from 300~349 (extended standard)
 */
//adapted standard

define({

	object:
	[
		{id:30, type:'character', file:'data/bandit'},
		{id:100, type:'lightweapon', file:'data/weapon0'}, //stick
		{id:101, type:'lightweapon', file:'data/weapon2'}, //hoe
		{id:300, type:'effects', file:'data/effect0'},
		{id:301, type:'effects', file:'data/effect1'} //blood
	],

	file_editing: {},

	background:
	[
	],

	id: '100~199 drop weapon'
});

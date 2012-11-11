/** serves the same as data.txt or (deep_chop.dat in earlier versions)
 */
/**
type:
0 Characters			id from 0~99
1 Light Weapons			id from 100~149
2 Heavy Weapons			id from 150~199
3 Special Attacks		id from 200~299
4 Baseball
5 Criminal, etc, broken_weapon
6 Milk and beer
7 Effects (blood,fire)	id from 300~349 (extended standard)
 */

define({

	object:
	[
		{id:30, type:0, file:'data/bandit'},
		{id:100, type:1, file:'data/weapon0'}, //stick
		{id:300, type:7, file:'data/effect0'},
		{id:301, type:7, file:'data/effect1'}, //blood
	],

	file_editing: {},

	background:
	[
	],

	id: '100~199 drop weapon'
});

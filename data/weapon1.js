define({
	"bmp": {
		"file": [
			{
				"file(0-99)": "sprite\\sys\\weapon1.bmp",
				"w": 58,
				"h": 58,
				"row": 10,
				"col": 10
			}
		],
		"weapon_hp": 800,
		"weapon_drop_hurt": 200,
		"weapon_hit_sound": "data\\010.wav",
		"weapon_drop_sound": "data\\010.wav",
		"weapon_broken_sound": "data\\021.wav"
	},
	"frame": {
		"0": {
			"name": "in_the_sky",
			"pic": 0,
			"state": 2000,
			"wait": 3,
			"next": 1,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"1": {
			"name": "in_the_sky",
			"pic": 1,
			"state": 2000,
			"wait": 2,
			"next": 2,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"2": {
			"name": "in_the_sky",
			"pic": 2,
			"state": 2000,
			"wait": 3,
			"next": 3,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"3": {
			"name": "in_the_sky",
			"pic": 3,
			"state": 2000,
			"wait": 2,
			"next": 4,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"4": {
			"name": "in_the_sky",
			"pic": 4,
			"state": 2000,
			"wait": 3,
			"next": 5,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"5": {
			"name": "in_the_sky",
			"pic": 5,
			"state": 2000,
			"wait": 2,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			},
			"bdy": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46
			}
		},
		"10": {
			"name": "on_hand",
			"pic": 5,
			"state": 2001,
			"wait": 0,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"wpoint": {
				"kind": 2,
				"x": 29,
				"y": 56,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0
			}
		},
		"20": {
			"name": "on_ground",
			"pic": 5,
			"state": 2004,
			"wait": 0,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 14,
				"x": 21,
				"y": 37,
				"w": 16,
				"h": 18,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 11,
				"y": 15,
				"w": 36,
				"h": 40
			}
		},
		"21": {
			"name": "just_on_ground",
			"pic": 3,
			"state": 2000,
			"wait": 1,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"itr": {
				"kind": 0,
				"x": 6,
				"y": 9,
				"w": 44,
				"h": 46,
				"dvx": 5,
				"dvy": -7,
				"fall": 70,
				"vrest": 17,
				"bdefend": 30,
				"injury": 60
			}
		},
		"399": {
			"name": "dummy",
			"pic": 5,
			"state": 0,
			"wait": 2,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"centerx": 29,
			"centery": 56,
			"bdy": {
				"kind": 0,
				"x": 1,
				"y": 19,
				"w": 46,
				"h": 15
			}
		}
	}
});
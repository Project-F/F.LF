bandit={
	"bmp": {
		"name": "Bandit",
		"head": "sprite\\sys\\bandit_f.bmp",
		"small": "sprite\\sys\\bandit_s.bmp",
		"file0": {
			"file(0-69)": "sprite\\sys\\bandit_0.bmp",
			"w": 79,
			"h": 79,
			"row": 10,
			"col": 7
		},
		"file1": {
			"file(70-139)": "sprite\\sys\\bandit_1.bmp",
			"w": 79,
			"h": 79,
			"row": 10,
			"col": 7
		},
		"file2": {
			"file(140-209)": "sprite\\sys\\bandit_0b.bmp",
			"w": 79,
			"h": 79,
			"row": 10,
			"col": 7
		},
		"file3": {
			"file(210-279)": "sprite\\sys\\bandit_1b.bmp",
			"w": 79,
			"h": 79,
			"row": 10,
			"col": 7
		},
		"walking_frame_rate": 3,
		"walking_speed": 4,
		"walking_speedz": 2,
		"running_frame_rate": 3,
		"running_speed": 8,
		"running_speedz": 1.3,
		"heavy_walking_speed": 3,
		"heavy_walking_speedz": 1.5,
		"heavy_running_speed": 5,
		"heavy_running_speedz": 0.8,
		"jump_height": -16.299999,
		"jump_distance": 8,
		"jump_distancez": 3,
		"dash_height": -11,
		"dash_distance": 15,
		"dash_distancez": 3.75,
		"rowing_height": -2,
		"rowing_distance": 5
	},
	"frame": {
		"0": {
			"name": "standing",
			"pic": 0,
			"state": 0,
			"wait": 5,
			"next": 1,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 23,
				"y": 46,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 21,
				"y": 18,
				"w": 43,
				"h": 62
			}
		},
		"1": {
			"name": "standing",
			"pic": 1,
			"state": 0,
			"wait": 5,
			"next": 2,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 47,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 21,
				"y": 18,
				"w": 43,
				"h": 62
			}
		},
		"2": {
			"name": "standing",
			"pic": 2,
			"state": 0,
			"wait": 5,
			"next": 3,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 47,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 21,
				"y": 18,
				"w": 43,
				"h": 62
			}
		},
		"3": {
			"name": "standing",
			"pic": 3,
			"state": 0,
			"wait": 5,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 40
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 48,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 21,
				"y": 18,
				"w": 43,
				"h": 62
			}
		},
		"5": {
			"name": "walking",
			"pic": 4,
			"state": 1,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 37
			},
			"wpoint": {
				"kind": 1,
				"x": 25,
				"y": 48,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 1,
				"x": 40,
				"y": 16,
				"w": 25,
				"h": 65,
				"catchingact": "120 120",
				"caughtact": "130 130"
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 15,
				"w": 27,
				"h": 65
			}
		},
		"6": {
			"name": "walking",
			"pic": 5,
			"state": 1,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 38,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 42,
				"y": 37
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 46,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 1,
				"x": 40,
				"y": 16,
				"w": 25,
				"h": 65,
				"catchingact": "120 120",
				"caughtact": "130 130"
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 15,
				"w": 27,
				"h": 65
			}
		},
		"7": {
			"name": "walking",
			"pic": 6,
			"state": 1,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 42,
				"y": 37
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 45,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 1,
				"x": 40,
				"y": 16,
				"w": 25,
				"h": 65,
				"catchingact": "120 120",
				"caughtact": "130 130"
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 15,
				"w": 27,
				"h": 65
			}
		},
		"8": {
			"name": "walking",
			"pic": 7,
			"state": 1,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 42,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 45,
				"y": 37
			},
			"wpoint": {
				"kind": 1,
				"x": 24,
				"y": 44,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 1,
				"x": 40,
				"y": 16,
				"w": 25,
				"h": 65,
				"catchingact": "120 120",
				"caughtact": "130 130"
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 15,
				"w": 27,
				"h": 65
			}
		},
		"9": {
			"name": "running",
			"pic": 20,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\003.wav",
			"bpoint": {
				"x": 47,
				"y": 40
			},
			"wpoint": {
				"kind": 1,
				"x": 25,
				"y": 41,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 19,
				"w": 38,
				"h": 60
			}
		},
		"10": {
			"name": "running",
			"pic": 21,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 49,
				"y": 40
			},
			"wpoint": {
				"kind": 1,
				"x": 46,
				"y": 51,
				"weaponact": 22,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 19,
				"w": 38,
				"h": 60
			}
		},
		"11": {
			"name": "running",
			"pic": 22,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\004.wav",
			"bpoint": {
				"x": 49,
				"y": 40
			},
			"wpoint": {
				"kind": 1,
				"x": 60,
				"y": 44,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 19,
				"w": 38,
				"h": 60
			}
		},
		"12": {
			"name": "heavy_obj_walk",
			"pic": 23,
			"state": 1,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 23,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"13": {
			"name": "heavy_obj_walk",
			"pic": 24,
			"state": 1,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 38,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 42,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 41,
				"y": 22,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"14": {
			"name": "heavy_obj_walk",
			"pic": 25,
			"state": 1,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 22,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"15": {
			"name": "heavy_obj_walk",
			"pic": 26,
			"state": 1,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 41,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 45,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 45,
				"y": 22,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"16": {
			"name": "heavy_obj_run",
			"pic": 125,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\003.wav",
			"bpoint": {
				"x": 41,
				"y": 36
			},
			"wpoint": {
				"kind": 1,
				"x": 40,
				"y": 22,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"17": {
			"name": "heavy_obj_run",
			"pic": 126,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 40,
				"y": 36
			},
			"wpoint": {
				"kind": 1,
				"x": 39,
				"y": 21,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"18": {
			"name": "heavy_obj_run",
			"pic": 127,
			"state": 2,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\004.wav",
			"bpoint": {
				"x": 41,
				"y": 36
			},
			"wpoint": {
				"kind": 1,
				"x": 40,
				"y": 21,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"19": {
			"name": "heavy_stop_run",
			"pic": 128,
			"state": 15,
			"wait": 7,
			"next": 999,
			"dvx": 2,
			"dvy": 0,
			"dvz": 0,
			"centerx": 34,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\009.wav",
			"bpoint": {
				"x": 30,
				"y": 42
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 25,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 15,
				"w": 28,
				"h": 64
			}
		},
		"20": {
			"name": "normal_weapon_atck",
			"pic": 70,
			"state": 3,
			"wait": 1,
			"next": 21,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 25,
				"y": 42,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 27,
				"y": 20,
				"w": 32,
				"h": 60
			}
		},
		"21": {
			"name": "normal_weapon_atck",
			"pic": 71,
			"state": 3,
			"wait": 1,
			"next": 22,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 28,
				"y": 22,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 30,
				"y": 19,
				"w": 28,
				"h": 61
			}
		},
		"22": {
			"name": "normal_weapon_atck",
			"pic": 72,
			"state": 3,
			"wait": 1,
			"next": 23,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 16,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 50,
				"y": 53,
				"weaponact": 23,
				"attacking": 1,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				[
					{
						"kind": 0,
						"x": 17,
						"y": 21,
						"w": 23,
						"h": 59
					},
					{
						"kind": 0,
						"x": 4,
						"y": 64,
						"w": 14,
						"h": 15
					}
				],
				{
					"kind": 0,
					"x": 36,
					"y": 46,
					"w": 20,
					"h": 14
				}
			]
		},
		"23": {
			"name": "normal_weapon_atck",
			"pic": 73,
			"state": 3,
			"wait": 1,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 40,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 73,
				"y": 58,
				"weaponact": 24,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 41,
					"y": 19,
					"w": 29,
					"h": 61
				},
				{
					"kind": 0,
					"x": 25,
					"y": 61,
					"w": 17,
					"h": 18
				}
			]
		},
		"25": {
			"name": "normal_weapon_atck",
			"pic": 74,
			"state": 3,
			"wait": 1,
			"next": 26,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 51,
				"y": 45,
				"weaponact": 34,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 16,
				"w": 29,
				"h": 63
			}
		},
		"26": {
			"name": "normal_weapon_atck",
			"pic": 75,
			"state": 3,
			"wait": 1,
			"next": 27,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 44,
				"y": 42,
				"weaponact": 32,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 16,
				"w": 29,
				"h": 63
			}
		},
		"27": {
			"name": "normal_weapon_atck",
			"pic": 76,
			"state": 3,
			"wait": 1,
			"next": 28,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 36,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 78,
				"y": 55,
				"weaponact": 24,
				"attacking": 1,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 41,
					"y": 21,
					"w": 26,
					"h": 58
				},
				{
					"kind": 0,
					"x": 27,
					"y": 61,
					"w": 18,
					"h": 17
				}
			]
		},
		"28": {
			"name": "normal_weapon_atck",
			"pic": 77,
			"state": 3,
			"wait": 1,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 22,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 10,
				"y": 52,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 10,
				"y": 23,
				"w": 31,
				"h": 55
			}
		},
		"30": {
			"name": "jump_weapon_atck",
			"pic": 80,
			"state": 3,
			"wait": 1,
			"next": 31,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 25,
				"y": 19,
				"weaponact": 30,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 27,
				"y": 17,
				"w": 39,
				"h": 56
			}
		},
		"31": {
			"name": "jump_weapon_atck",
			"pic": 81,
			"state": 3,
			"wait": 1,
			"next": 32,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 19,
			"centery": 91,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 44,
				"y": 12,
				"weaponact": 33,
				"attacking": 2,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 11,
				"y": 32,
				"w": 33,
				"h": 43
			}
		},
		"32": {
			"name": "jump_weapon_atck",
			"pic": 82,
			"state": 3,
			"wait": 1,
			"next": 33,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 19,
			"centery": 91,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 58,
				"y": 49,
				"weaponact": 24,
				"attacking": 2,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 11,
				"y": 32,
				"w": 33,
				"h": 43
			}
		},
		"33": {
			"name": "jump_weapon_atck",
			"pic": 83,
			"state": 3,
			"wait": 4,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 19,
			"centery": 91,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 52,
				"y": 57,
				"weaponact": 25,
				"attacking": 2,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 11,
				"y": 32,
				"w": 33,
				"h": 43
			}
		},
		"35": {
			"name": "run_weapon_atck",
			"pic": 84,
			"state": 3,
			"wait": 1,
			"next": 36,
			"dvx": 6,
			"dvy": 0,
			"dvz": 0,
			"centerx": 40,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 31,
				"y": 14,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 16,
				"w": 34,
				"h": 64
			}
		},
		"36": {
			"name": "run_weapon_atck",
			"pic": 85,
			"state": 3,
			"wait": 1,
			"next": 37,
			"dvx": 4,
			"dvy": 0,
			"dvz": 0,
			"centerx": 26,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 70,
				"y": 41,
				"weaponact": 22,
				"attacking": 3,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 29,
					"y": 38,
					"w": 51,
					"h": 20
				},
				{
					"kind": 0,
					"x": 9,
					"y": 54,
					"w": 45,
					"h": 26
				}
			]
		},
		"37": {
			"name": "run_weapon_atck",
			"pic": 86,
			"state": 3,
			"wait": 6,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 21,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 69,
				"y": 59,
				"weaponact": 24,
				"attacking": 3,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 16,
				"w": 34,
				"h": 64
			}
		},
		"40": {
			"name": "dash_weapon_atck",
			"pic": 90,
			"state": 3,
			"wait": 1,
			"next": 41,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 24,
				"y": 14,
				"weaponact": 30,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 15,
				"w": 40,
				"h": 53
			}
		},
		"41": {
			"name": "dash_weapon_atck",
			"pic": 91,
			"state": 3,
			"wait": 1,
			"next": 42,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 21,
			"centery": 89,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 45,
				"y": 12,
				"weaponact": 33,
				"attacking": 4,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 8,
				"y": 32,
				"w": 33,
				"h": 45
			}
		},
		"42": {
			"name": "dash_weapon_atck",
			"pic": 92,
			"state": 3,
			"wait": 1,
			"next": 43,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 21,
			"centery": 89,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 59,
				"y": 50,
				"weaponact": 24,
				"attacking": 4,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 8,
				"y": 32,
				"w": 33,
				"h": 45
			}
		},
		"43": {
			"name": "dash_weapon_atck",
			"pic": 93,
			"state": 3,
			"wait": 8,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 21,
			"centery": 89,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 50,
				"y": 55,
				"weaponact": 25,
				"attacking": 4,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 8,
				"y": 32,
				"w": 33,
				"h": 45
			}
		},
		"45": {
			"name": "light_weapon_thw",
			"pic": 94,
			"state": 15,
			"wait": 6,
			"next": 46,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 11,
				"y": 42,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 25,
					"y": 22,
					"w": 35,
					"h": 57
				},
				{
					"kind": 0,
					"x": 10,
					"y": 40,
					"w": 20,
					"h": 13
				}
			]
		},
		"46": {
			"name": "light_weapon_thw",
			"pic": 95,
			"state": 15,
			"wait": 1,
			"next": 47,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 37,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 44,
				"y": 24,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 24,
				"y": 22,
				"w": 32,
				"h": 57
			}
		},
		"47": {
			"name": "light_weapon_thw",
			"pic": 96,
			"state": 15,
			"wait": 9,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 25,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 102,
				"y": 60,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 14,
				"dvy": -4,
				"dvz": 3
			},
			"bdy": [
				{
					"kind": 0,
					"x": 10,
					"y": 38,
					"w": 54,
					"h": 21
				},
				{
					"kind": 0,
					"x": 26,
					"y": 55,
					"w": 32,
					"h": 26
				}
			]
		},
		"50": {
			"name": "heavy_weapon_thw",
			"pic": 27,
			"state": 15,
			"wait": 6,
			"next": 51,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 16,
				"y": 32,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 19,
				"w": 30,
				"h": 62
			}
		},
		"51": {
			"name": "heavy_weapon_thw",
			"pic": 28,
			"state": 15,
			"wait": 10,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 34,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"wpoint": {
				"kind": 1,
				"x": 93,
				"y": 37,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 8,
				"dvy": -4,
				"dvz": 2
			},
			"bdy": [
				{
					"kind": 0,
					"x": 8,
					"y": 39,
					"w": 61,
					"h": 23
				},
				{
					"kind": 0,
					"x": 19,
					"y": 56,
					"w": 30,
					"h": 24
				}
			]
		},
		"52": {
			"name": "sky_lgt_wp_thw",
			"pic": 97,
			"state": 15,
			"wait": 6,
			"next": 53,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 41,
			"centery": 68,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 16,
				"y": 30,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 10,
				"w": 40,
				"h": 52
			}
		},
		"53": {
			"name": "sky_lgt_wp_thw",
			"pic": 98,
			"state": 15,
			"wait": 1,
			"next": 54,
			"dvx": 0,
			"dvy": -2,
			"dvz": 0,
			"centerx": 35,
			"centery": 63,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\008.wav",
			"wpoint": {
				"kind": 1,
				"x": 50,
				"y": 12,
				"weaponact": 34,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 35,
					"y": 10,
					"w": 36,
					"h": 23
				},
				{
					"kind": 0,
					"x": 15,
					"y": 18,
					"w": 30,
					"h": 43
				}
			]
		},
		"54": {
			"name": "sky_lgt_wp_thw",
			"pic": 99,
			"state": 15,
			"wait": 9,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 21,
			"centery": 62,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 75,
				"y": 65,
				"weaponact": 23,
				"attacking": 0,
				"cover": 0,
				"dvx": 12,
				"dvy": 8,
				"dvz": 3
			},
			"bdy": [
				{
					"kind": 0,
					"x": 22,
					"y": 15,
					"w": 38,
					"h": 38
				},
				{
					"kind": 0,
					"x": 3,
					"y": 37,
					"w": 34,
					"h": 26
				}
			]
		},
		"55": {
			"name": "weapon_drink",
			"pic": 132,
			"state": 17,
			"wait": 3,
			"next": 56,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 999,
			"hit_j": 0,
			"sound": "data\\042.wav",
			"wpoint": {
				"kind": 1,
				"x": 53,
				"y": 21,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 26,
				"w": 37,
				"h": 53
			}
		},
		"56": {
			"name": "weapon_drink",
			"pic": 133,
			"state": 17,
			"wait": 3,
			"next": 57,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 999,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 52,
				"y": 21,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 26,
				"w": 37,
				"h": 53
			}
		},
		"57": {
			"name": "weapon_drink",
			"pic": 134,
			"state": 17,
			"wait": 3,
			"next": 58,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 999,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 51,
				"y": 21,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 26,
				"w": 37,
				"h": 53
			}
		},
		"58": {
			"name": "weapon_drink",
			"pic": 133,
			"state": 17,
			"wait": 3,
			"next": 55,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 999,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 52,
				"y": 21,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 26,
				"w": 37,
				"h": 53
			}
		},
		"60": {
			"name": "punch",
			"pic": 10,
			"state": 3,
			"wait": 2,
			"next": 61,
			"dvx": 1,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"itr": {
				"kind": 2,
				"x": 26,
				"y": 58,
				"w": 37,
				"h": 23,
				"vrest": 1
			},
			"bdy": [
				{
					"kind": 0,
					"x": 30,
					"y": 18,
					"w": 28,
					"h": 60
				},
				{
					"kind": 0,
					"x": 23,
					"y": 35,
					"w": 37,
					"h": 24
				}
			]
		},
		"61": {
			"name": "punch",
			"pic": 11,
			"state": 3,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"itr": {
				"kind": 0,
				"x": 49,
				"y": 33,
				"w": 30,
				"h": 16,
				"dvx": 2,
				"bdefend": 16,
				"injury": 20
			},
			"bdy": [
				{
					"kind": 0,
					"x": 39,
					"y": 19,
					"w": 21,
					"h": 61
				},
				{
					"kind": 0,
					"x": 51,
					"y": 34,
					"w": 26,
					"h": 16
				}
			]
		},
		"65": {
			"name": "punch",
			"pic": 12,
			"state": 3,
			"wait": 2,
			"next": 66,
			"dvx": 1,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"itr": {
				"kind": 2,
				"x": 26,
				"y": 58,
				"w": 37,
				"h": 23,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 27,
				"y": 17,
				"w": 31,
				"h": 63
			}
		},
		"66": {
			"name": "punch",
			"pic": 13,
			"state": 3,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"itr": {
				"kind": 0,
				"x": 45,
				"y": 34,
				"w": 33,
				"h": 14,
				"dvx": 2,
				"bdefend": 16,
				"injury": 20
			},
			"bdy": [
				{
					"kind": 0,
					"x": 28,
					"y": 17,
					"w": 29,
					"h": 63
				},
				{
					"kind": 0,
					"x": 45,
					"y": 37,
					"w": 32,
					"h": 11
				}
			]
		},
		"70": {
			"name": "super_punch",
			"pic": 37,
			"state": 3,
			"wait": 2,
			"next": 71,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 48,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 14,
				"w": 30,
				"h": 65
			}
		},
		"71": {
			"name": "super_punch",
			"pic": 38,
			"state": 3,
			"wait": 2,
			"next": 72,
			"dvx": 4,
			"dvy": 0,
			"dvz": 0,
			"centerx": 41,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": {
				"kind": 0,
				"x": 17,
				"y": 13,
				"w": 31,
				"h": 66
			}
		},
		"72": {
			"name": "super_punch",
			"pic": 39,
			"state": 3,
			"wait": 2,
			"next": 73,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 30,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"itr": {
				"kind": 0,
				"x": 35,
				"y": 26,
				"w": 44,
				"h": 17,
				"dvx": 13,
				"dvy": -6,
				"fall": 70,
				"arest": 15,
				"bdefend": 60,
				"injury": 50
			},
			"bdy": [
				{
					"kind": 0,
					"x": 17,
					"y": 31,
					"w": 32,
					"h": 48
				},
				{
					"kind": 0,
					"x": 43,
					"y": 35,
					"w": 28,
					"h": 18
				}
			]
		},
		"73": {
			"name": "super_punch",
			"pic": 104,
			"state": 3,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 30,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": [
				{
					"kind": 0,
					"x": 17,
					"y": 31,
					"w": 32,
					"h": 48
				},
				{
					"kind": 0,
					"x": 43,
					"y": 35,
					"w": 28,
					"h": 18
				}
			]
		},
		"80": {
			"name": "jump_attack",
			"pic": 14,
			"state": 3,
			"wait": 2,
			"next": 81,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 70,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"bdy": {
				"kind": 0,
				"x": 20,
				"y": 18,
				"w": 34,
				"h": 61
			}
		},
		"81": {
			"name": "jump_attack",
			"pic": 15,
			"state": 3,
			"wait": 6,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 70,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"itr": {
				"kind": 0,
				"x": 37,
				"y": 30,
				"w": 36,
				"h": 20,
				"dvx": 2,
				"arest": 15,
				"bdefend": 16,
				"injury": 35
			},
			"bdy": [
				{
					"kind": 0,
					"x": 22,
					"y": 19,
					"w": 32,
					"h": 60
				},
				{
					"kind": 0,
					"x": 45,
					"y": 20,
					"w": 28,
					"h": 27
				}
			]
		},
		"85": {
			"name": "run_attack",
			"pic": 102,
			"state": 3,
			"wait": 4,
			"next": 86,
			"dvx": 6,
			"dvy": 0,
			"dvz": 0,
			"centerx": 31,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": [
				{
					"kind": 0,
					"x": 19,
					"y": 24,
					"w": 35,
					"h": 54
				},
				{
					"kind": 0,
					"x": 10,
					"y": 36,
					"w": 27,
					"h": 15
				}
			]
		},
		"86": {
			"name": "run_attack",
			"pic": 103,
			"state": 3,
			"wait": 2,
			"next": 87,
			"dvx": 4,
			"dvy": 0,
			"dvz": 0,
			"centerx": 19,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"itr": {
				"kind": 0,
				"x": 19,
				"y": 37,
				"w": 61,
				"h": 17,
				"dvx": 10,
				"fall": 70,
				"arest": 15,
				"bdefend": 16,
				"injury": 50
			},
			"bdy": [
				{
					"kind": 0,
					"x": 24,
					"y": 36,
					"w": 55,
					"h": 19
				},
				{
					"kind": 0,
					"x": 8,
					"y": 51,
					"w": 38,
					"h": 27
				}
			]
		},
		"87": {
			"name": "run_attack",
			"pic": 104,
			"state": 3,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 14,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": [
				{
					"kind": 0,
					"x": 18,
					"y": 36,
					"w": 39,
					"h": 24
				},
				{
					"kind": 0,
					"x": 2,
					"y": 57,
					"w": 41,
					"h": 22
				}
			]
		},
		"90": {
			"name": "dash_attack",
			"pic": 106,
			"state": 15,
			"wait": 3,
			"next": 91,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 38,
			"centery": 73,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": [
				{
					"kind": 0,
					"x": 24,
					"y": 18,
					"w": 25,
					"h": 55
				},
				{
					"kind": 0,
					"x": 13,
					"y": 36,
					"w": 52,
					"h": 18
				}
			]
		},
		"91": {
			"name": "dash_attack",
			"pic": 107,
			"state": 15,
			"wait": 20,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 31,
			"centery": 68,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"itr": {
				"kind": 0,
				"x": 27,
				"y": 38,
				"w": 53,
				"h": 23,
				"dvx": 12,
				"fall": 70,
				"arest": 20,
				"bdefend": 60,
				"injury": 70
			},
			"bdy": [
				{
					"kind": 0,
					"x": 7,
					"y": 19,
					"w": 37,
					"h": 45
				},
				{
					"kind": 0,
					"x": 22,
					"y": 36,
					"w": 50,
					"h": 18
				}
			]
		},
		"95": {
			"name": "dash_defend",
			"pic": 111,
			"state": 7,
			"wait": 2,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 21,
				"y": 27,
				"weaponact": 30,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 14,
					"y": 19,
					"w": 28,
					"h": 36
				},
				{
					"kind": 0,
					"x": 28,
					"y": 37,
					"w": 24,
					"h": 34
				}
			]
		},
		"100": {
			"name": "rowing",
			"pic": 66,
			"state": 6,
			"wait": 2,
			"next": 101,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\017.wav",
			"wpoint": {
				"kind": 1,
				"x": 21,
				"y": 44,
				"weaponact": 22,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"101": {
			"name": "rowing",
			"pic": 65,
			"state": 6,
			"wait": 6,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 18,
				"y": 70,
				"weaponact": 24,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"102": {
			"name": "rowing",
			"pic": 58,
			"state": 6,
			"wait": 2,
			"next": 103,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 75,
				"weaponact": 22,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"103": {
			"name": "rowing",
			"pic": 59,
			"state": 6,
			"wait": 2,
			"next": 104,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 45,
				"weaponact": 31,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"104": {
			"name": "rowing",
			"pic": 49,
			"state": 6,
			"wait": 2,
			"next": 105,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 59,
				"weaponact": 25,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"105": {
			"name": "rowing",
			"pic": 58,
			"state": 6,
			"wait": 2,
			"next": 219,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 44,
				"y": 74,
				"weaponact": 22,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"106": {
			"name": "rowing",
			"pic": 59,
			"state": 6,
			"wait": 2,
			"next": 219,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 48,
				"weaponact": 30,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"107": {
			"name": "rowing",
			"pic": 49,
			"state": 6,
			"wait": 2,
			"next": 219,
			"dvx": 7,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 32,
				"y": 59,
				"weaponact": 25,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 7,
				"x": 36,
				"y": 54,
				"w": 13,
				"h": 25,
				"vrest": 1
			}
		},
		"108": {
			"name": "rowing",
			"pic": 117,
			"state": 6,
			"wait": 3,
			"next": 109,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 45,
			"centery": 62,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\017.wav",
			"wpoint": {
				"kind": 1,
				"x": 39,
				"y": 37,
				"weaponact": 35,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"109": {
			"name": "rowing",
			"pic": 118,
			"state": 6,
			"wait": 6,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 17,
				"y": 38,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"110": {
			"name": "defend",
			"pic": 56,
			"state": 7,
			"wait": 12,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 39,
				"y": 46,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 20,
				"y": 19,
				"w": 38,
				"h": 60
			}
		},
		"111": {
			"name": "defend",
			"pic": 57,
			"state": 7,
			"wait": 0,
			"next": 110,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 36,
				"y": 46,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 16,
				"y": 19,
				"w": 42,
				"h": 60
			}
		},
		"112": {
			"name": "broken_defend",
			"pic": 46,
			"state": 8,
			"wait": 2,
			"next": 113,
			"dvx": -2,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 8,
				"y": 28,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": -9,
				"y": 16,
				"w": 85,
				"h": 65,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 5,
				"y": 17,
				"w": 64,
				"h": 65
			}
		},
		"113": {
			"name": "broken_defend",
			"pic": 47,
			"state": 8,
			"wait": 2,
			"next": 114,
			"dvx": -2,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 12,
				"y": 45,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": -9,
				"y": 16,
				"w": 85,
				"h": 65,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 5,
				"y": 17,
				"w": 64,
				"h": 65
			}
		},
		"114": {
			"name": "broken_defend",
			"pic": 48,
			"state": 8,
			"wait": 2,
			"next": 999,
			"dvx": -2,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 52,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": -9,
				"y": 16,
				"w": 85,
				"h": 65,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 5,
				"y": 17,
				"w": 64,
				"h": 65
			}
		},
		"115": {
			"name": "picking_light",
			"pic": 36,
			"state": 15,
			"wait": 5,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\009.wav",
			"wpoint": {
				"kind": 1,
				"x": 38,
				"y": 76,
				"weaponact": 24,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 24,
				"y": 43,
				"w": 33,
				"h": 37
			}
		},
		"116": {
			"name": "picking_heavy",
			"pic": 36,
			"state": 15,
			"wait": 5,
			"next": 117,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\009.wav",
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 79,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 24,
				"y": 43,
				"w": 33,
				"h": 37
			}
		},
		"117": {
			"name": "picking_heavy",
			"pic": 36,
			"state": 15,
			"wait": 5,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 75,
				"weaponact": 10,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 24,
				"y": 43,
				"w": 33,
				"h": 37
			}
		},
		"120": {
			"name": "catching",
			"pic": 51,
			"state": 9,
			"wait": 5,
			"next": 121,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 36,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\015.wav",
			"cpoint": {
				"kind": 1,
				"x": 67,
				"y": 39,
				"vaction": 131,
				"throwvz": -842150451,
				"hurtable": 1,
				"throwinjury": -842150451,
				"decrease": 7
			},
			"wpoint": {
				"kind": 1,
				"x": 54,
				"y": 50,
				"weaponact": 20,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 19,
				"y": 15,
				"w": 28,
				"h": 65
			}
		},
		"121": {
			"name": "catching",
			"pic": 50,
			"state": 9,
			"wait": 0,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 1,
				"x": 61,
				"y": 39,
				"vaction": 130,
				"aaction": 122,
				"taction": -232,
				"throwvz": -842150451,
				"hurtable": 1,
				"throwinjury": -842150451,
				"decrease": -7
			},
			"wpoint": {
				"kind": 1,
				"x": 60,
				"y": 42,
				"weaponact": 35,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 19,
				"y": 15,
				"w": 28,
				"h": 65
			}
		},
		"122": {
			"name": "catching",
			"pic": 51,
			"state": 9,
			"wait": 5,
			"next": 123,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 38,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 1,
				"x": 61,
				"y": 39,
				"vaction": 130,
				"throwvz": -842150451,
				"hurtable": 1,
				"throwinjury": -842150451,
				"decrease": 7
			},
			"wpoint": {
				"kind": 1,
				"x": 54,
				"y": 48,
				"weaponact": 20,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 19,
				"y": 15,
				"w": 28,
				"h": 65
			}
		},
		"123": {
			"name": "catching",
			"pic": 52,
			"state": 9,
			"wait": 3,
			"next": 121,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\014.wav",
			"cpoint": {
				"kind": 1,
				"x": 58,
				"y": 38,
				"injury": 15,
				"vaction": 132,
				"throwvz": -842150451,
				"hurtable": 1,
				"throwinjury": -842150451,
				"decrease": 3
			},
			"wpoint": {
				"kind": 1,
				"x": 57,
				"y": 46,
				"weaponact": 35,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 19,
				"y": 15,
				"w": 28,
				"h": 65
			}
		},
		"130": {
			"name": "picked_caught",
			"pic": 53,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 41,
				"y": 39,
				"fronthurtact": 132,
				"backhurtact": 131
			},
			"wpoint": {
				"kind": 1,
				"x": 31,
				"y": 56,
				"weaponact": 30,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 26,
				"y": 14,
				"w": 28,
				"h": 66
			}
		},
		"131": {
			"name": "picked_caught",
			"pic": 54,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 41,
				"y": 39,
				"fronthurtact": 132,
				"backhurtact": 132
			},
			"wpoint": {
				"kind": 1,
				"x": 26,
				"y": 54,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 26,
				"y": 14,
				"w": 28,
				"h": 66
			}
		},
		"132": {
			"name": "picked_caught",
			"pic": 55,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 41,
				"y": 39,
				"fronthurtact": 131,
				"backhurtact": 131
			},
			"wpoint": {
				"kind": 1,
				"x": 39,
				"y": 51,
				"weaponact": 30,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 26,
				"y": 14,
				"w": 28,
				"h": 66
			}
		},
		"133": {
			"name": "picked_caught",
			"pic": 30,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 33,
				"y": 36
			},
			"wpoint": {
				"kind": 1,
				"x": 35,
				"y": 46,
				"weaponact": 22,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"134": {
			"name": "picked_caught",
			"pic": 31,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 37,
				"y": 28
			},
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 32,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"135": {
			"name": "picked_caught",
			"pic": 32,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 31,
				"y": 22
			},
			"wpoint": {
				"kind": 1,
				"x": 37,
				"y": 43,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"136": {
			"name": "picked_caught",
			"pic": 33,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 27,
				"y": 46
			},
			"wpoint": {
				"kind": 1,
				"x": 38,
				"y": 39,
				"weaponact": 33,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"137": {
			"name": "picked_caught",
			"pic": 34,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 71,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 33,
				"y": 68
			},
			"wpoint": {
				"kind": 1,
				"x": 33,
				"y": 75,
				"weaponact": 32,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"138": {
			"name": "picked_caught",
			"pic": 35,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 34,
				"y": 54
			},
			"wpoint": {
				"kind": 1,
				"x": 38,
				"y": 64,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"139": {
			"name": "picked_caught",
			"pic": 40,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 40,
				"y": 36
			},
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 47,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"140": {
			"name": "picked_caught",
			"pic": 41,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 36,
				"y": 38
			},
			"wpoint": {
				"kind": 1,
				"x": 26,
				"y": 40,
				"weaponact": 20,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"141": {
			"name": "picked_caught",
			"pic": 42,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 44,
				"y": 41
			},
			"wpoint": {
				"kind": 1,
				"x": 27,
				"y": 37,
				"weaponact": 23,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"142": {
			"name": "picked_caught",
			"pic": 43,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 46,
				"y": 51
			},
			"wpoint": {
				"kind": 1,
				"x": 32,
				"y": 50,
				"weaponact": 26,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"143": {
			"name": "picked_caught",
			"pic": 44,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 74,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 45,
				"y": 66
			},
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 74,
				"weaponact": 24,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"144": {
			"name": "picked_caught",
			"pic": 45,
			"state": 10,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 2,
				"x": 42,
				"y": 55
			},
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 67,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"180": {
			"name": "falling",
			"pic": 30,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 39,
				"y": 46,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 4,
				"x": 21,
				"y": 14,
				"w": 29,
				"h": 44,
				"dvx": 2,
				"fall": 70,
				"vrest": 20,
				"bdefend": 10,
				"injury": 30
			},
			"bdy": {
				"kind": 0,
				"x": 25,
				"y": 25,
				"w": 21,
				"h": 20
			}
		},
		"181": {
			"name": "falling",
			"pic": 31,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 43,
				"y": 30,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": [
				{
					"kind": 4,
					"x": 15,
					"y": 11,
					"w": 42,
					"h": 26,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				},
				{
					"kind": 4,
					"x": 35,
					"y": 30,
					"w": 27,
					"h": 29,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				}
			],
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 20,
				"w": 24,
				"h": 23
			}
		},
		"182": {
			"name": "falling",
			"pic": 32,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 38,
				"y": 43,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 4,
				"x": 13,
				"y": 18,
				"w": 46,
				"h": 26,
				"dvx": 2,
				"fall": 70,
				"vrest": 20,
				"bdefend": 10,
				"injury": 30
			},
			"bdy": {
				"kind": 0,
				"x": 27,
				"y": 22,
				"w": 20,
				"h": 18
			}
		},
		"183": {
			"name": "falling",
			"pic": 33,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 40,
				"y": 40,
				"weaponact": 33,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": [
				{
					"kind": 4,
					"x": 32,
					"y": 18,
					"w": 33,
					"h": 27,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				},
				{
					"kind": 4,
					"x": 10,
					"y": 38,
					"w": 38,
					"h": 21,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				}
			],
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 30,
				"w": 27,
				"h": 21
			}
		},
		"184": {
			"name": "falling",
			"pic": 34,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 72,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 36,
				"y": 74,
				"weaponact": 32,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"185": {
			"name": "falling",
			"pic": 35,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 37,
				"y": 64,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"186": {
			"name": "falling",
			"pic": 40,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 21,
				"y": 45,
				"weaponact": 34,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 4,
				"x": 22,
				"y": 12,
				"w": 36,
				"h": 50,
				"dvx": 2,
				"fall": 70,
				"vrest": 20,
				"bdefend": 10,
				"injury": 30
			},
			"bdy": {
				"kind": 0,
				"x": 31,
				"y": 24,
				"w": 25,
				"h": 23
			}
		},
		"187": {
			"name": "falling",
			"pic": 41,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 27,
				"y": 42,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": [
				{
					"kind": 4,
					"x": 33,
					"y": 6,
					"w": 26,
					"h": 46,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				},
				{
					"kind": 4,
					"x": 26,
					"y": 43,
					"w": 21,
					"h": 29,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				}
			],
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 27,
				"w": 24,
				"h": 26
			}
		},
		"188": {
			"name": "falling",
			"pic": 42,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 29,
				"y": 35,
				"weaponact": 22,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 4,
				"x": 14,
				"y": 29,
				"w": 58,
				"h": 23,
				"dvx": 2,
				"fall": 70,
				"vrest": 20,
				"bdefend": 10,
				"injury": 30
			},
			"bdy": {
				"kind": 0,
				"x": 30,
				"y": 31,
				"w": 24,
				"h": 21
			}
		},
		"189": {
			"name": "falling",
			"pic": 43,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 31,
				"y": 50,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": [
				{
					"kind": 4,
					"x": 24,
					"y": 27,
					"w": 26,
					"h": 28,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				},
				{
					"kind": 4,
					"x": 37,
					"y": 45,
					"w": 31,
					"h": 28,
					"dvx": 2,
					"fall": 70,
					"vrest": 20,
					"bdefend": 10,
					"injury": 30
				}
			],
			"bdy": {
				"kind": 0,
				"x": 30,
				"y": 39,
				"w": 23,
				"h": 21
			}
		},
		"190": {
			"name": "falling",
			"pic": 44,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 75,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 31,
				"y": 74,
				"weaponact": 24,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"191": {
			"name": "falling",
			"pic": 45,
			"state": 12,
			"wait": 3,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 29,
				"y": 67,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"200": {
			"name": "ice",
			"pic": 105,
			"state": 15,
			"wait": 2,
			"next": 201,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 18,
				"y": 45,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 10,
				"y": 9,
				"w": 55,
				"h": 68
			}
		},
		"201": {
			"name": "ice",
			"pic": 115,
			"state": 13,
			"wait": 90,
			"next": 202,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 20,
				"y": 55,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 14,
				"x": 8,
				"y": 6,
				"w": 67,
				"h": 73,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 8,
				"y": 6,
				"w": 67,
				"h": 73
			}
		},
		"202": {
			"name": "ice",
			"pic": 105,
			"state": 15,
			"wait": 1,
			"next": 182,
			"dvx": -4,
			"dvy": -3,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 18,
				"y": 44,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 8,
				"y": 6,
				"w": 67,
				"h": 73
			}
		},
		"203": {
			"name": "fire",
			"pic": 100,
			"state": 18,
			"wait": 1,
			"next": 204,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 46,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19,
				"dvx": -6,
				"dvy": -6,
				"fall": 70,
				"vrest": 10,
				"bdefend": 16,
				"injury": 30,
				"effect": 20
			},
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19
			}
		},
		"204": {
			"name": "fire",
			"pic": 101,
			"state": 18,
			"wait": 1,
			"next": 203,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 46,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19,
				"dvx": -6,
				"dvy": -6,
				"fall": 70,
				"vrest": 10,
				"bdefend": 16,
				"injury": 30,
				"effect": 20
			},
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19
			}
		},
		"205": {
			"name": "fire",
			"pic": 110,
			"state": 18,
			"wait": 1,
			"next": 206,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 33,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19,
				"dvx": -6,
				"dvy": -6,
				"fall": 70,
				"vrest": 10,
				"bdefend": 16,
				"injury": 30,
				"effect": 20
			},
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19
			}
		},
		"206": {
			"name": "fire",
			"pic": 111,
			"state": 18,
			"wait": 1,
			"next": 205,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 33,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19,
				"dvx": -6,
				"dvy": -6,
				"fall": 70,
				"vrest": 10,
				"bdefend": 16,
				"injury": 30,
				"effect": 20
			},
			"bdy": {
				"kind": 0,
				"x": 22,
				"y": 35,
				"w": 26,
				"h": 19
			}
		},
		"207": {
			"name": "tired",
			"pic": 69,
			"state": 15,
			"wait": 2,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 42,
				"y": 64,
				"weaponact": 22,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 44,
					"y": 28,
					"w": 22,
					"h": 37
				},
				{
					"kind": 0,
					"x": 28,
					"y": 47,
					"w": 28,
					"h": 35
				}
			]
		},
		"210": {
			"name": "jump",
			"pic": 60,
			"state": 4,
			"wait": 1,
			"next": 211,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 24,
				"y": 53,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 33,
					"y": 33,
					"w": 20,
					"h": 48
				},
				{
					"kind": 0,
					"x": 25,
					"y": 50,
					"w": 15,
					"h": 29
				}
			]
		},
		"211": {
			"name": "jump",
			"pic": 61,
			"state": 4,
			"wait": 1,
			"next": 212,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\017.wav",
			"wpoint": {
				"kind": 1,
				"x": 23,
				"y": 54,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 15,
					"y": 41,
					"w": 48,
					"h": 20
				},
				{
					"kind": 0,
					"x": 25,
					"y": 55,
					"w": 30,
					"h": 27
				}
			]
		},
		"212": {
			"name": "jump",
			"pic": 62,
			"state": 4,
			"wait": 1,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 43,
				"y": 27
			},
			"wpoint": {
				"kind": 1,
				"x": 25,
				"y": 37,
				"weaponact": 34,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 31,
					"y": 15,
					"w": 21,
					"h": 64
				},
				{
					"kind": 0,
					"x": 18,
					"y": 29,
					"w": 48,
					"h": 17
				}
			]
		},
		"213": {
			"name": "dash",
			"pic": 63,
			"state": 5,
			"wait": 8,
			"next": 216,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 58,
				"y": 32
			},
			"wpoint": {
				"kind": 1,
				"x": 30,
				"y": 39,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				[
					{
						"kind": 0,
						"x": 46,
						"y": 18,
						"w": 22,
						"h": 25
					},
					{
						"kind": 0,
						"x": 28,
						"y": 29,
						"w": 21,
						"h": 33
					}
				],
				{
					"kind": 0,
					"x": 13,
					"y": 54,
					"w": 18,
					"h": 17
				}
			]
		},
		"214": {
			"name": "dash",
			"pic": 64,
			"state": 5,
			"wait": 8,
			"next": 217,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 27,
				"y": 29
			},
			"wpoint": {
				"kind": 1,
				"x": 34,
				"y": 41,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 18,
				"y": 14,
				"w": 19,
				"h": 27
			}
		},
		"215": {
			"name": "crouch",
			"pic": 60,
			"state": 15,
			"wait": 2,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\012.wav",
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 54,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 26,
				"y": 40,
				"w": 29,
				"h": 38
			}
		},
		"216": {
			"name": "dash",
			"pic": 112,
			"state": 5,
			"wait": 2,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 56,
				"y": 35
			},
			"wpoint": {
				"kind": 1,
				"x": 24,
				"y": 37,
				"weaponact": 25,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 42,
					"y": 15,
					"w": 24,
					"h": 21
				},
				{
					"kind": 0,
					"x": 16,
					"y": 30,
					"w": 39,
					"h": 37
				}
			]
		},
		"217": {
			"name": "dash",
			"pic": 113,
			"state": 5,
			"wait": 2,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bpoint": {
				"x": 25,
				"y": 32
			},
			"wpoint": {
				"kind": 1,
				"x": 31,
				"y": 50,
				"weaponact": 21,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 18,
				"y": 13,
				"w": 29,
				"h": 51
			}
		},
		"218": {
			"name": "stop_running",
			"pic": 114,
			"state": 15,
			"wait": 5,
			"next": 999,
			"dvx": 1,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\009.wav",
			"bpoint": {
				"x": 35,
				"y": 40
			},
			"wpoint": {
				"kind": 1,
				"x": 14,
				"y": 50,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 17,
					"y": 25,
					"w": 30,
					"h": 55
				},
				{
					"kind": 0,
					"x": 45,
					"y": 47,
					"w": 16,
					"h": 32
				}
			]
		},
		"219": {
			"name": "crouch2",
			"pic": 60,
			"state": 15,
			"wait": 2,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\012.wav",
			"wpoint": {
				"kind": 1,
				"x": 23,
				"y": 53,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 26,
				"y": 36,
				"w": 29,
				"h": 44
			}
		},
		"220": {
			"name": "injured",
			"pic": 120,
			"state": 11,
			"wait": 2,
			"next": 221,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 47,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 57,
				"y": 48,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 47,
					"y": 23,
					"w": 23,
					"h": 54
				},
				{
					"kind": 0,
					"x": 29,
					"y": 41,
					"w": 20,
					"h": 37
				}
			]
		},
		"221": {
			"name": "injured",
			"pic": 121,
			"state": 11,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 44,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 56,
				"y": 51,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 46,
					"y": 23,
					"w": 21,
					"h": 56
				},
				{
					"kind": 0,
					"x": 30,
					"y": 40,
					"w": 17,
					"h": 41
				}
			]
		},
		"222": {
			"name": "injured",
			"pic": 123,
			"state": 11,
			"wait": 2,
			"next": 223,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 22,
				"y": 56,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 11,
					"y": 24,
					"w": 39,
					"h": 31
				},
				{
					"kind": 0,
					"x": 25,
					"y": 53,
					"w": 40,
					"h": 27
				}
			]
		},
		"223": {
			"name": "injured",
			"pic": 124,
			"state": 11,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 21,
				"y": 50,
				"weaponact": 20,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 12,
					"y": 23,
					"w": 40,
					"h": 37
				},
				{
					"kind": 0,
					"x": 27,
					"y": 56,
					"w": 36,
					"h": 24
				}
			]
		},
		"224": {
			"name": "injured",
			"pic": 130,
			"state": 11,
			"wait": 2,
			"next": 225,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 48,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 32,
				"y": 53,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 32,
					"y": 18,
					"w": 28,
					"h": 60
				},
				{
					"kind": 0,
					"x": 52,
					"y": 38,
					"w": 20,
					"h": 19
				}
			]
		},
		"225": {
			"name": "injured",
			"pic": 131,
			"state": 11,
			"wait": 3,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 27,
				"y": 51,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 24,
				"y": 18,
				"w": 35,
				"h": 63
			}
		},
		"226": {
			"name": "injured",
			"pic": 120,
			"state": 16,
			"wait": 6,
			"next": 227,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 58,
				"y": 49,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": 6,
				"y": 12,
				"w": 85,
				"h": 68,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 27,
				"y": 22,
				"w": 42,
				"h": 58
			}
		},
		"227": {
			"name": "injured",
			"pic": 122,
			"state": 16,
			"wait": 6,
			"next": 228,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 37,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 56,
				"y": 51,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": 6,
				"y": 12,
				"w": 85,
				"h": 68,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 24,
				"w": 39,
				"h": 57
			}
		},
		"228": {
			"name": "injured",
			"pic": 121,
			"state": 16,
			"wait": 6,
			"next": 229,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 56,
				"y": 51,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": 6,
				"y": 12,
				"w": 85,
				"h": 68,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 23,
				"w": 37,
				"h": 58
			}
		},
		"229": {
			"name": "injured",
			"pic": 122,
			"state": 16,
			"wait": 6,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 37,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 55,
				"y": 51,
				"weaponact": 35,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"itr": {
				"kind": 6,
				"x": 6,
				"y": 12,
				"w": 85,
				"h": 68,
				"vrest": 1
			},
			"bdy": {
				"kind": 0,
				"x": 29,
				"y": 26,
				"w": 37,
				"h": 53
			}
		},
		"230": {
			"name": "lying",
			"pic": 34,
			"state": 14,
			"wait": 30,
			"next": 219,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 72,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 35,
				"y": 74,
				"weaponact": 32,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"231": {
			"name": "lying",
			"pic": 44,
			"state": 14,
			"wait": 30,
			"next": 219,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 75,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 32,
				"y": 74,
				"weaponact": 24,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			}
		},
		"232": {
			"name": "throw_lying_man",
			"pic": 27,
			"state": 9,
			"wait": 7,
			"next": 233,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"cpoint": {
				"kind": 1,
				"x": 28,
				"y": 9,
				"vaction": 135,
				"throwvz": -842150451,
				"throwinjury": -842150451,
				"dircontrol": 1
			},
			"wpoint": {
				"kind": 1,
				"x": 20,
				"y": 26,
				"weaponact": 31,
				"attacking": 0,
				"cover": 0,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": {
				"kind": 0,
				"x": 28,
				"y": 19,
				"w": 30,
				"h": 62
			}
		},
		"233": {
			"name": "throw_lying_man",
			"pic": 28,
			"state": 9,
			"wait": 1,
			"next": 234,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 45,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"sound": "data\\007.wav",
			"cpoint": {
				"kind": 1,
				"x": 72,
				"y": 53,
				"vaction": 181,
				"throwvx": 13,
				"throwvy": -7,
				"throwvz": 3,
				"throwinjury": 30
			},
			"wpoint": {
				"kind": 1,
				"x": 41,
				"y": 49,
				"weaponact": 25,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 8,
					"y": 39,
					"w": 61,
					"h": 23
				},
				{
					"kind": 0,
					"x": 19,
					"y": 56,
					"w": 30,
					"h": 24
				}
			]
		},
		"234": {
			"name": "throw_lying_man",
			"pic": 28,
			"state": 9,
			"wait": 10,
			"next": 999,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 45,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"wpoint": {
				"kind": 1,
				"x": 41,
				"y": 49,
				"weaponact": 25,
				"attacking": 0,
				"cover": 1,
				"dvx": 0,
				"dvy": 0,
				"dvz": 0
			},
			"bdy": [
				{
					"kind": 0,
					"x": 8,
					"y": 39,
					"w": 61,
					"h": 23
				},
				{
					"kind": 0,
					"x": 19,
					"y": 56,
					"w": 30,
					"h": 24
				}
			]
		},
		"399": {
			"name": "dummy",
			"pic": 0,
			"state": 0,
			"wait": 0,
			"next": 0,
			"dvx": 0,
			"dvy": 0,
			"dvz": 0,
			"centerx": 39,
			"centery": 79,
			"hit_a": 0,
			"hit_d": 0,
			"hit_j": 0,
			"bdy": {
				"kind": 0,
				"x": 21,
				"y": 18,
				"w": 43,
				"h": 62
			}
		}
	}
}

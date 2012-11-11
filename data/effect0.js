define({
	"bmp": {
		"file": [
			{
				"file": "../sprite/effect0.png",
				"w": 100,
				"h": 75,
				"row": 10,
				"col": 1
			},
			{
				"file": "../sprite/effect0.png",
				"w": 60,
				"h": 70,
				"row": 10,
				"col": 3
			}
		]
	},

	"effect_list": {
		"1": {
			"name": "small",
			"frame": 10
		},
		"2": {
			"name": "big",
			"frame": 0
		},
	},

	"frame": {
		"0": {
			"name": "big",
			"pic": 0,
			"wait": 0,
			"next": 1,
			"centerx": 51,
			"centery": 40
		},
		"1": {
			"pic": 1,
			"wait": 0,
			"next": 2
		},
		"2": {
			"pic": 2,
			"wait": 0,
			"next": 3
		},
		"3": {
			"pic": 3,
			"wait": 0,
			"next": 4
		},
		"4": {
			"pic": 4,
			"wait": 0,
			"next": 1000
		},


		"10": {
			"name": "small",
			"pic": 20,
			"wait": 0,
			"next": 11,
			"centerx": 30,
			"centery": 34
		},
		"11": {
			"pic": 21,
			"wait": 0,
			"next": 12
		},
		"12": {
			"pic": 22,
			"wait": 0,
			"next": 13
		},
		"13": {
			"pic": 23,
			"wait": 0,
			"next": 14
		},
		"14": {
			"pic": 24,
			"wait": 0,
			"next": 1000
		}
	}
});

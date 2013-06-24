define({
test_cases:[
	{	//S1
		scenario:
		{	//single player actions
			player: [
				{ id: 30, team: 1}
			]
		},
		cases: [
		{	//C1
			name: 'walk',
			player: [[ //array of array, so 2 braces
				{f:[0,1,2,3],k:'longhold right'}, //hold the 'right' key until a release operation
				{f:[5,6,7,8],dx:4}, //f:[5,6,7,8] means either of them is okay
				{f:[5,6,7,8],dx:4,k:'release right'}, //release the 'right' key
				{f:[5,6,7,8],dx:3}, //dx is the x movement compared with the previous frame
				{f:[5,6,7,8],dx:2},
				{f:[0,1,2,3],dx:1},
				{f:[0,1,2,3],dx:0},
				{f:[0,1,2,3],dx:0},
				{f:[0,1,2,3],dx:0}
			]]
		},
		{	name: 'stop_running',
			player: [[ //array of array, so 2 braces
				{f:[0,1,2,3],k:['right','right']}, //press 2 'right' keys quickly
				{f:9,dx:8}, //starts running
				{f:9,dx:8,k:'left'}, //press left
				{f:218,dx:8}, //stops running
				{f:218,dx:7},
				{f:218,dx:6},
				{f:218,dx:5},
				{f:218,dx:4},
				{f:0,dx:3}, //returns to standing, but still sliding
				{f:0,dx:2},
				{f:0,dx:1},
				{f:0,dx:0}
			]]
		},
		{	name: 'rowing',
			player: [[
				{f:[0,1,2,3],k:['right','right']},
				{f:9,dx:8}, //run
				{f:9,dx:8,k:'def'}, //press def
				{f:102,dx:7},{f:102,dx:7},
				{f:103,dx:7},{f:103,dx:7},{f:103,dx:7},
				{f:104,dx:7},{f:104,dx:7},{f:104,dx:7},
				{f:105,dx:7},{f:105,dx:7},{f:105,dx:7},
				{f:219,dx:6},{f:219,dx:5},{f:219,dx:4},
				{f:0,dx:3},{f:0,dx:2},{f:0,dx:1},{f:0,dx:0}
			]]
		},
		{	name: 'jump',
			player: [[
				{f:[0,1,2,3],k:'jump'},
				{f:210},{f:211},{f:211},{f:212,dy:0},
				{f:212,dy:-15},{f:212,dy:-14},{f:212,dy:-13},{f:212,dy:-11},{f:212,dy:-10},
				{f:212,dy:-8},{f:212,dy:-6},{f:212,dy:-4},{f:212,dy:-3},{f:212,dy:-1},
				{f:212,dy:1},{f:212,dy:2},{f:212,dy:4},{f:212,dy:6},{f:212,dy:7},
				{f:212,dy:10},{f:212,dy:11},{f:212,dy:12},{f:212,dy:14},{f:212,dy:16},
				{f:215,dy:2},{f:215},
				{f:0}
			]]
		},
		{	name: 'jump with vx',
			player: [[
				{f:[0,1,2,3],k:['longhold right','jump']},
				{f:210,dx:4,dy:0},{f:211,dx:3,dy:0},{f:211,dx:2,dy:0},{f:212,dx:1,dy:0,k:'release right'},
				{f:212,dx:8,dy:-15},{f:212,dx:7,dy:-14},{f:212,dx:7,dy:-13},{f:212,dx:7,dy:-11},{f:212,dx:7,dy:-10},
				{f:212,dx:7,dy:-8}, {f:212,dx:7,dy:-6}, {f:212,dx:7,dy:-4}, {f:212,dx:7,dy:-3}, {f:212,dx:7,dy:-1},
				{f:212,dx:7,dy:1},  {f:212,dx:7,dy:2},  {f:212,dx:7,dy:4},  {f:212,dx:7,dy:6},  {f:212,dx:7,dy:7},
				{f:212,dx:7,dy:10}, {f:212,dx:7,dy:11}, {f:212,dx:7,dy:12}, {f:212,dx:7,dy:14}, {f:212,dx:7,dy:16},
				{f:215,dx:7,dy:2},{f:215,dx:2,dy:0},
				{f:0,dx:2,dy:0},{f:0,dx:0,dy:0}
			]]
		},
		{	name: 'jump_attack',
			player: [[
				{f:[0,1,2,3],k:'jump'},
				{f:210},{f:211},{f:211},{f:212},{f:212,k:'att'},
				{f:80},{f:80},
				{f:81},{f:81},{f:81},{f:81},{f:81},{f:81},{f:81},
				{f:212},{f:212},
				{},{},{},{},{},{},{},{} //dont care
			]]
		},
		{	name: 'dash',
			player: [[
				{f:[0,1,2,3],k:['right','right']},
				{f:9,dx:8},{f:9,dx:8,k:'jump'},
				{f:213,dx:15,dy:-12},{f:213,dx:14,dy:-9},
				{f:213,dx:14,dy:-7},{f:213,dx:14,dy:-6},
				{f:213,dx:14,dy:-5},{f:213,dx:14,dy:-1},
				{f:213,dx:14,dy:-1},{f:213,dx:14,dy:1},
				{f:216,dx:14,dy:3},{f:216,dx:14,dy:3},
				{f:216,dx:14,dy:6},{f:216,dx:14,dy:8},
				{f:216,dx:14,dy:9},
				{f:219,dx:14,dy:11},{f:219,dx:5,dy:0},
				{f:0,dx:3,dy:0},{f:0,dx:2,dy:0},
				{f:0,dx:1,dy:0},{f:0,dx:0,dy:0}
			]]
		},
		{	name: 'dash attack',
			player: [[
				{f:[0,1,2,3],k:['right','right']},
				{f:9},{f:9,k:'jump'},
				{f:213},{f:213},{f:213,k:'att'},
				{f:90},{f:90},{f:90},{f:91},{f:91},
				{f:91},{f:91},{f:91},{f:91},{f:91},
				{f:219},{f:219},
				{f:0},{f:0},{f:0},{f:0}
			]]
		},
		{	name: 'run attack',
			player: [[
				{f:[0,1,2,3],k:['right','right']},
				{f:9,dx:8},{f:9,dx:8,k:'att'},
				{f:85,dx:8},{f:85,dx:7},{f:85,dx:6},{f:85,dx:6},
				{f:86,dx:6},{f:86,dx:5},{f:86,dx:4},
				{f:87,dx:4},{f:87,dx:3},{f:87,dx:2},{f:87,dx:1},
				{f:0,dx:0}
			]]
		}
		]
	},
	{	//S2
		scenario:
		{	//2 players interactions
			player: [
				{ id: 30, team: 1},
				{ id: 30, team: 2}
			]
		},
		cases: [
		{	name: 'run attack',
			setup: function(match)
			{
				match.character[0].set_pos(300,0,200);
				match.character[1].set_pos(440,0,200);
			},
			player: [
			[	//player 1
				{f:[0,1,2,3],k:['right','right']},
				{f:9,dx:8},{f:9,dx:8,k:'att'},
				{f:85,dx:8},{f:85,dx:7},{f:85,dx:6},{f:85,dx:6},
				{f:86,dx:6},{f:86,dx:5},
				{f:86,dx:0},{f:86,dx:0},{f:86,dx:0},
				{f:86,dx:4},
				{f:87,dx:4},{f:87,dx:3},{f:87,dx:2},{f:87,dx:1},
				{f:0,dx:0},
				{},{},{},{},{},{},{},{} //dont care
			],
			[	//player 2
				{f:[0,1,2,3],k:'longhold left'}, //hold the 'left' key until a release operation
				{f:[5,6,7,8],dx:-4}, //f:[5,6,7,8] means either of them is okay
				{f:[5,6,7,8],dx:-4,k:'release left'}, //release the 'left' key
				{f:[5,6,7,8],dx:-3}, //dx is the x movement compared with the previous frame
				{f:[5,6,7,8],dx:-2},
				{f:[0,1,2,3],dx:-1},
				{f:[0,1,2,3],dx:0},
				{f:[0,1,2,3],dx:0}, //moment being hit
				{f:180,dx:0},{f:180,dx:0},{f:180,dx:0},{f:180,dx:0},
				{f:181,dx:10,dy:-8},{f:181,dx:9,dy:-5},{f:181,dx:9,dy:-3},{f:181,dx:9,dy:-2},
				{f:182,dx:9,dy:0},{f:182,dx:9,dy:2},{f:182,dx:9,dy:3},{f:182,dx:9,dy:5},
				{f:183,dx:9,dy:8},
				{f:230,dx:9,dy:0},{f:230,dx:3,dy:0},{f:230,dx:2,dy:0},{f:230,dx:1,dy:0},{f:230,dx:0,dy:0}
			]]
		}
		]
	}
]
});

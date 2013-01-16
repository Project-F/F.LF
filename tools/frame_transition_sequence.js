requirejs.config({
	baseUrl: '../../'
});
requirejs(['LF/sprite','LFrelease/data/bandit'],
function(sprite,bandit)
{
	define();
	main(document.getElementsByTagName('body')[0]);

	function define()
	{
		//the complete definition of frame transition sequences

		//bandit
		bandit.bmp.file[0]["file(0-69)"] = "../../LFrelease/sprite/bandit_0.png";
		bandit.bmp.file[1]["file(70-139)"] = "../../LFrelease/sprite/bandit_1.png";

		list=
		[
		{
			data: bandit,
			seq:[
			{	name: 'stop_running',
				frame: [10,218,218,218,218,218,0],
				remark:[]
			},
			{	name: 'rowing',
				frame: [10,102,102,103,103,103,104,104,104,105,105,105,219,219,219,0,0,0,0],
				remark:[]
			},
			{	name: 'attack (punch)',
				frame: [60,60,61,61,61,61,0],
				remark:['','','when really hit some body',', will stall for 3 extra TU',', i.e. totally 7 TU of frame 61']
			},
			{	name: 'jump',
				frame: [0,210,211,211,212,212,215,215,0],
				remark:['','','','','still on the ground','20 TU in air']
			},
			{	name: 'jump_attack',
				frame: [0,210,211,211,212,212,80,80,81,81,81,81,81,81,81,212,212],
				remark:['','','','','still on the ground','','']
			},
			{	name: 'dash',
				frame: [10,213,216,219,219,0],
				remark:['','8 TU in air','5 TU in air']
			},
			{	name: 'dash attack',
				frame: [10,213,90,90,90,91,219,219,0],
				remark:['','','depends on when `att` is pressed','','','until fall on the ground']
			},
			{	name: 'run_attack',
				frame: [10,85,85,85,85,86,86,86,87,87,87,87,0],
				remark:[]
			},
			{	name: 'being hit by run attack',
				frame: [0,180,180,180,180,181,181,181,181,182,182,182,182,183,230],
				remark:['the TU being hit, nothing','affected by effect type 0, oscillates','','','effect vanishes','starts moving, according to dvx,dvy']
			},
			{	name: 'super punch (punch others to fall)',
				frame: [0,70,70,71,71,71,72,72,72,72,72,72,73,73,73,73,0],
				remark:[]
			},
			{	name: 'being hit',
				frame: [0,220,221,222,223,226,227,228,229,0],
				remark:['being hit','5 TU. oscillates. effect lasts for 3 TU','4 TU','5 TU. oscillates. effect lasts for 3 TU','4 TU','9 TU. oscillates. effect lasts for 3 TU','7 TU','7 TU','7 TU']
			},
			{	name: 'hit by super punch AND hit by dash attack (at the front)',
				frame: [0,180,180,180,180,181,181,181,181,182,182,182,182,183,185,185,185,185,185,185,230],
				remark:['being hit','stays and oscillates','','','effect vanishes','starts moving','','','','','','','','only if hit by dash attack','bounce up, never actually touching the ground','','','','','']
			},
			{	name: 'pick up light weapon',
				frame: [115,115,115,115,115,0],
				remark:[]
			},
			{	name: 'throw light weapon (standing or running)',
				frame: [45,46,47,0],
				remark:['6 TU','2 TU','10 TU']
			},
			{	name: 'pick up heavy weapon',
				frame: [116,117,117,0,12],
				remark:['5 TU','1 TU','5 TU. the stone moved up a little bit','stone disappears in old version, stays in new versions','stone is on top of fighter']
			},
			{	name: 'throw heavy weapon',
				frame: [50,51,0],
				remark:['6 TU','11 TU']
			},
			{	name: 'light weapon attack',
				frame: [25,26,26,27,27,28,28,0],
				remark:[]
			},
			{	name: 'light weapon attack (varient)',
				frame: [20,21,21,22,22,23,23,0],
				remark:[]
			},
			{	name: 'defence',
				frame: [0,110,111,110],
				remark:['','12 TU. if being hit <b>at front</b>, next frame will be 111','5 TU. being hit. oscillates. effect vanishes at last TU','12 TU. whenever back from frame 111']
			},
			{	name: 'broken defence',
				frame: [112,112,113,113,113,114,114,114],
				remark:['5 TU. oscillates.','2 TU. effect vanishes']
			},
			{	name: 'catching',
				frame: [5,120,121,121,122,123,123,123,123,123,121],
				remark:['move and catch','caught. 5 TU','','att pressed','5 TU']
			},
			{	name: 'caught',
				frame: [226,131,130,130,130,130,132,132,132,132,132,130],
				remark:['in dance of pain','being caught. 6 TU','','','','being hit','effect type 0','','','effect vanished']
			},
			{	name: 'throw lying man',
				frame: [121,232,233,234,0],
				remark:['','7 TU','the man left my hand at 2nd TU','233,234: total 11 TU']
			},
			{	name: 'being thrown',
				frame: [130,135,181,182,183,185,230],
				remark:['','8 TU',"5 TU. already left catcher's hand",'4 TU','3 TU','6 TU. bounced up on the 3rd TU','from leaving hand to touching ground: 19 TU']
			}
			]
		}
		];
	}

	function create_at(parent, tag, id)
	{
		var E = document.createElement(tag);
		parent.appendChild(E);
		if( id)
			E.id = id;
		return E;
	}

	function add_cell(row, content)
	{
		var td = create_at(row, 'td')
		td.innerHTML= content;
		return td;
	}

	function main(append_at)
	{
		var view = create_at(append_at, 'div', 'view');
		view.style.width='2000px';

		for( var j=0; j<list.length; j++)
		{
			var data = list[j].data;
			var view_div = create_at(view, 'div', data.bmp.name);
			create_at(view_div, 'span').innerHTML = data.bmp.name;

			var seq = list[j].seq;
			for( var i=0; i<seq.length; i++)
			{
				var table = create_at(view_div, 'table');
				var rname  = create_at(table, 'tr');
				var rframe = create_at(table, 'tr');
				var rpic   = create_at(table, 'tr');
				var rstate = create_at(table, 'tr');
				var rremark= create_at(table, 'tr');

				add_cell(rname, 'name:');
				var cell_name = add_cell(rname, seq[i].name);
				cell_name.colSpan='99';
				add_cell(rframe, 'frame:');
				add_cell(rpic, 'pic:');
				add_cell(rstate, 'state:');
				add_cell(rremark, 'remarks:');

				var frame = seq[i].frame;
				for( var k=0; k<frame.length; k++)
				{
					add_cell(rframe, frame[k]);
					var cur_frame = data.frame[frame[k]];
					add_cell(rstate, cur_frame.state);
					var pic = add_cell(rpic, '');
					pic.style.position = 'relative';
					pic.style.width = data.bmp.file[0].w+1;
					pic.style.height = data.bmp.file[0].h+1;

					var sp = new sprite(data.bmp, pic);
					sp.show_pic(cur_frame.pic);
					sp.set_xy({x:0, y:0});
				}

				var remark = seq[i].remark;
				for( var k=0; k<remark.length; k++)
				{
					add_cell(rremark, remark[k]?remark[k]:'');
				}
			}
		}
	}
});

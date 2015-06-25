(function (){

var flf_config = {"root":"../","package":"../LF2_19"};
requirejs.config(
{
	baseUrl: flf_config.root,
	paths:
	{
		'LF/sprite-select': 'core/sprite-dom'
	}
});

requirejs(['LF/sprite-select','core/util','core/math','core/resourcemap',
'LF/sprite','LF/match','LF/soundpack','LF/loader!'+flf_config.package,'LF/global','LF/util',
'test_cases',
'core/css!tools/tools.css'],
function(Fsprite,Futil,Fmath,Fresourcemap,
Sprite,Match,Soundpack,package,global,util,
test_cases){

	(function(){
	//prepare HTML
	var DOC=
	"<div class='Fbar'>F.LF/unit test suite <a href='https://docs.google.com/spreadsheet/lv?key=0AqAWO3FZ2ZFrdGZBa2xDNzdDeVdhNU9UQVMtaklpQXc&type=view&gid=0&f=false&sortcolid=20&sortasc=false&rowsperpage=250'>log</a><a href='../docs/unit_test_suite.html'>Help</a></div>"+
	"<div id='overall'></div>"+
	"<div class='LFroot'>"+
	"	<div class='container'>"+
	"		<div id='window' class='window'>"+
	"			<div class='gameplay'>"+
	"				<canvas class='canvas' width='0' height='0'></canvas>"+
	"			</div>"+
	"		</div>"+
	"	</div>"+
	"</div>"+
	"<div id='data'></div>";
	var doc = document.createElement('div');
	doc.innerHTML=DOC;
	var body = document.getElementsByTagName('body')[0];
	body.insertBefore(doc,body.firstChild);
	}());
	
	//setup resource map
	package.path = util.normalize_path(flf_config.package);
	package.location = util.normalize_path(flf_config.root+flf_config.package);
	util.organize_package(package);
	var resourcemap = new Fresourcemap(util.setup_resourcemap(package));
	Fsprite.masterconfig_set('resourcemap',resourcemap);
	
	var test_cases=test_cases.test_cases;
	var cur_scenario=test_cases.length;
	var d_data = document.getElementById('data'),
		d_overall = document.getElementById('overall');
	var manager =
	{
		canvas:get_canvas(),
		sound:new Soundpack(null),
		random:function(){return 1}
	};
	var passing_delta = 10;
	var case_start_delay = 30;
	var overall =
	{
		passed:0,
		finished:0,
		delta:0
	};

	function get_canvas()
	{
		if( Fsprite.renderer==='DOM')
		{
			return new Fsprite({
				div:util.div('gameplay'),
				type:'group',
				wh:{w:global.application.window.width,h:global.application.window.height}
			});
		}
		else if( Fsprite.renderer==='canvas')
		{
			var canvas_node = util.div('gameplay').getElementsByClassName('canvas')[0];
			canvas_node.width = global.application.window.width;
			canvas_node.height = global.application.window.height;
			return new Fsprite({
				canvas:canvas_node,
				type:'group',
				wh:{w:global.application.window.width,h:global.application.window.height}
			})
		}
	}
	
	//RTcontroller is a F.core compatible controller to simulate keyboard input from pre-defined data
	function RTcontroller()
	{
		var $=this;
		$.state={ up:0,down:0,left:0,right:0,def:0,jump:0,att:0 };
		$.config=null;
		$.child=[];
		$.sync=true;
		$.seq=null;
		$.t=0;
	}
	RTcontroller.prototype.clear_states=function()
	{
	}
	RTcontroller.prototype.fetch=function()
	{
		var $=this;
		if( !$.seq) return ;
		if( $.t>=$.seq.length) return ;
		if( $.t>0 && $.seq[$.t-1].k)
		{
			var keys=Futil.make_array($.seq[$.t-1].k);
			for( var i=0; i<keys.length; i++)
			for( var j=0; j<$.child.length; j++)
			{
				if( keys[i].indexOf('hold ')===0)
				{	//release the key
					var key=keys[i].slice(5);
					$.state[key]=0;
					$.child[j].key(key,0);
				}
			}
		}
		if( $.t>=0 && $.seq[$.t].k)
		{
			var keys=Futil.make_array($.seq[$.t].k);
			for( var i=0; i<keys.length; i++)
			for( var j=0; j<$.child.length; j++)
			{
				if( keys[i].indexOf('hold ')===0)
				{	//hold the key for 1 frame
					var key=keys[i].slice(5);
					$.child[j].key(key,1);
					$.state[key]=1;
				}
				else if( keys[i].indexOf('longhold ')===0)
				{	//hold the key until a release command
					var key=keys[i].slice(9);
					$.child[j].key(key,1);
					$.state[key]=1;
				}
				else if( keys[i].indexOf('release ')===0)
				{	//release a key
					var key=keys[i].slice(8);
					$.child[j].key(key,0);
					$.state[key]=0;
				}
				else
				{
					$.child[j].key(keys[i],1);
					$.state[keys[i]]=1;
					$.child[j].key(keys[i],0);
					$.state[keys[i]]=0;
				}
			}
		}
	}
	RTcontroller.prototype.flush=function()
	{
	}
	RTcontroller.prototype.frame=function()
	{
		var $=this;
		$.t++;
	}
	RTcontroller.prototype.assign=function(seq)
	{
		var $=this;
		$.seq=seq;
		$.t=-case_start_delay;
	}
	RTcontroller.prototype.type = 'keyboard'; //fake

	function Testcase(config)
	{
		var $=this;
		$.control = [];
		var players = [];
		$.num_player=config.scenario.player.length;
		for( var i=0; i<$.num_player; i++)
		{
			$.control[i] = new RTcontroller();
			players[i] = {
				controller: $.control[i],
				id: config.scenario.player[i].id,
				team: config.scenario.player[i].team
			}
		}

		$.match = new Match
		({
			manager: manager,
			state:
			{
				event:function(E){ $.event(E) }
			},
			package: package
		});
		$.match.create
		({
			player: players,
			control: null,
			set:
			{
				weapon: null
			}
		});

		$.cases=config.cases;
		$.cur_case=$.cases.length;
		$.next_case();
	}
	Testcase.prototype.next_case=function()
	{
		var $=this;
		$.cur_case--;
		if( $.cur_case<0)
		{
			//all cases finished
			$.match.destroy();
			next_scenario();
		}
		else
		{	//next case
			$.ccase = $.cases[$.cur_case];
			$.duration = $.ccase.duration;
			$.result = [];
			$.mem = [];
			for( var i=0; i<$.num_player; i++)
			{
				$.control[i].assign($.ccase.player[i]);
				$.result[i] = [];
				$.mem[i] = {};
			}
			$.t=-case_start_delay;
			$.match.F7();
		}
	}
	Testcase.prototype.event=function(E)
	{
		var $=this;
		if( E==='TU')
		{
			if( $.t===-case_start_delay)
			if( typeof $.ccase.setup==='function')
				$.ccase.setup($.match);
			$.t++;
			for( var i=0; i<$.num_player; i++)
				$.control[i].frame();
		}
		else if( E==='transit')
		{
			if( $.t>=0 && $.t<$.duration)
				for( var i=0; i<$.num_player; i++)
				{
					$.result[i][$.t]={};
					if( $.ccase.player[i] && $.ccase.player[i][$.t])
						$.test($.match.character[i+1], $.ccase.player[i][$.t], $.result[i][$.t], $.mem[i]);
				}
			if( $.t===$.duration)
			{
				$.show_result();
				$.next_case();
			}
		}
		else if( E==='start')
		{
			for( var i=0; i<$.num_player; i++)
			{
				(function (i){
					$.match.character[i+1].log=function(mess)
					{
						if( $.ccase.result_table[i] && 
							$.ccase.result_table[i][$.t])
							$.ccase.result_table[i][$.t].log.innerHTML+= mess+'<br>';
					}
				}(i));
			}
		}
	}
	Testcase.prototype.test=function(char,spec,result,mem)
	{
		var $=this;
		//test for frame error
		function is_in(x,A) //return true if element x is in set A
		{
			if( A instanceof Array)
				return Futil.search_array(A,function(e){return e===x;}) !== -1;
			else
				return x===A;
		}
		if( char.frame.N===230)
			var y;
		if( spec.f===undefined)
		{}
		else if( is_in(char.frame.N, spec.f))
		{	//good
			result.f = 'no error';
		}
		else
		{
			result.f = char.frame.N;
		}

		if( $.t===0)
		{
			mem.ps={x:0,y:0};  //expected current position
			mem.psl={x:0,y:0}; //last actual position
			mem.pso={x:char.ps.x, y:char.ps.y}; //initial actual position
		}
		else if( $.t>=1)
		{
			//dx,dy error
			if( spec.dx!==undefined)
			{
				result.dx = (char.ps.x-mem.psl.x) - spec.dx;
				mem.ps.x += spec.dx;
			}
			if( spec.dy!==undefined)
			{
				result.dy = (char.ps.y-mem.psl.y) - spec.dy;
				mem.ps.y += spec.dy;
			}
			//trajectory error
			result.tr = Fmath.distance(Fmath.sub(char.ps,mem.pso), mem.ps);
		}
		//store current position
		mem.psl.x = char.ps.x;
		mem.psl.y = char.ps.y;
	}
	Testcase.prototype.show_result=function()
	{
		var $=this;
		for( var i=0; i<$.num_player; i++)
		{
			var errorsum=0, err_fr=0, err_dx=0, err_dy=0, err_tr=0;
			var has_f, has_dx, has_dy, has_tr=0;
			for( var t=0; t<$.duration; t++)
			{
				var result = $.result[i][t],
					result_col = $.ccase.result_table[i][t];
				if( result.f!==undefined)
				{
					has_f=true;
					if( result.f==='no error')
						;
					else
					{
						show_frameN(result_col.f, result.f);
						err_fr+=1;
					}
				}
				if( result.dx!==undefined)
				{
					has_dx=true;
					err_dx+=result.dx>0?result.dx:-result.dx;
					show_error(result_col.dx, result.dx);
				}
				if( result.dy!==undefined)
				{
					has_dy=true;
					err_dy+=result.dy>0?result.dy:-result.dy;
					show_error(result_col.dy, result.dy);
				}
				if( result.tr!==undefined)
				{
					if( result.tr)
						has_tr++;
					err_tr+=result.tr>0?result.tr:-result.tr;
					show_value(result_col.tr, result.tr);
				}
			}
			//hide unused rows
			if( !has_f) remove($.ccase.result_table[i].r_fr);
			if( !has_dx) remove($.ccase.result_table[i].r_dx);
			if( !has_dy) remove($.ccase.result_table[i].r_dy);
			if( !has_dx && !has_dy) remove($.ccase.result_table[i].r_tr);
			//sum of error
			errorsum = err_fr + err_dx + err_dy;
			show_value($.ccase.result_table[i].errorsum_fr, err_fr, 0, 0);
			show_value($.ccase.result_table[i].errorsum_dx, err_dx);
			show_value($.ccase.result_table[i].errorsum_dy, err_dy);
			show_value($.ccase.result_table[i].errorsum_tr, has_tr?err_tr/has_tr:0);
			set_delta($.ccase.result_table[i].errorsum_all, errorsum);
			if( errorsum<=passing_delta)
				overall.passed++;
			overall.finished++;
			overall.delta+=errorsum;
			d_overall.innerHTML='Overall: Passed('+overall.passed+'/'+overall.finished+')'+' &Delta;='+overall.delta;
		}
		//facilitate garbage collection
		$.ccase.result_table.length=0;
	}

	function remove(E)
	{
		E.parentNode.removeChild(E);
	}
	function show_value(E,e,dif,thres)
	{
		var re=Math.round(e*10)/10;
		E.innerHTML += (re>0 && dif?'+':'')+re;
		if( thres!==undefined)
		{
			if( re>thres)
				E.style.backgroundColor = '#F00';
		}
	}
	function set_delta(E,delta)
	{
		var rdelta=Math.round(delta*10)/10;
		E.innerHTML = '&Delta;='+rdelta;
		E.style.color = '#FFF';
		if( delta<=passing_delta)
			E.style.backgroundColor = '#0D0';
		else
			E.style.backgroundColor = '#F00';
	}
	function show_frameN(E,e)
	{
		E.innerHTML += " <span class='errorlabel'>"+e+"</span>";
	}
	function show_error(E,e)
	{
		var re=Math.round(e*10)/10;
		if( re) E.innerHTML += " <span class='errorlabel'>"+(re>0?'+':'')+re+"</span>";
	}

	function make_table()
	{
		function create_at(parent, tag, id, classname)
		{
			var E = document.createElement(tag);
			parent.appendChild(E);
			if( id)
				E.id = id;
			if( classname)
				E.classname = classname;
			return E;
		}

		function add_cell(row, content)
		{
			var td = create_at(row, 'td')
			if( content!==null && content!==undefined)
				td.innerHTML= (typeof content==='string')? content : JSON.stringify(content);
			return td;
		}

		var prep = 0;
		function finish_prep()
		{
			prep++;
			if( prep===test_cases.length)
				setTimeout(function(){start_test();},10);
		}

		for( var i=0; i<test_cases.length; i++)
		{	//for each test scenario
			(function (i){ //closure

			var players = test_cases[i].scenario.player;
			var num_player = players.length;
			var d_scen = create_at(d_data,'div',null,'scenario');
			//load all data files for this scenario
			var char_list=[];
			for( var h=0; h<num_player; h++)
			{
				char_list.push(players[h].id);
			}
			//note that the `load` function is async
			package.data.load({'object':char_list},function()
			{	//loaded
				for( var h=0; h<num_player; h++)
				{	//store the data file
					players[h].data = util.select_from(package.data.object,{id:players[h].id}).data;
				}
				for( var j=0; j<test_cases[i].cases.length; j++)
				{	//for each test case
					var ccase = test_cases[i].cases[j];
					ccase.result_table = [];
					//find duration
					var duration = ccase.player[0].length;
					for( var k=1; k<num_player; k++)
						if( ccase.player[k].length > duration)
							duration = ccase.player[k].length;
					ccase.duration = duration;
					for( var h=0; h<num_player; h++)
					{	//for each player
						if( !ccase.player[h]) continue;
						var result_table = ccase.result_table[h] = [];
						//create table
						var table = create_at(d_scen,'table'),
							r_head = create_at(table,'tr'),
							r_pic = create_at(table,'tr'),
							r_state = create_at(table,'tr'),
							r_key = create_at(table,'tr'),
							r_subh = create_at(table,'tr'),
							r_fr = create_at(table,'tr'),
							r_dx = create_at(table,'tr'),
							r_dy = create_at(table,'tr'),
							r_tr = create_at(table,'tr'),
							r_foot = create_at(table,'tr'),
							r_log = create_at(table,'tr');
						result_table.r_fr=r_fr;
						result_table.r_dx=r_dx;
						result_table.r_dy=r_dy;
						result_table.r_tr=r_tr;
						//create first column
						var table_name = add_cell(r_head,'S'+(i+1)+'.C'+(j+1)+'.Ch'+(h+1));
						table_name.colSpan=2;
						table_name.style.width='100px';
						add_cell(r_pic,'pic').colSpan=2;
						add_cell(r_state,'state').colSpan=2;
						add_cell(r_key,'key').colSpan=2;
						add_cell(r_subh);
						add_cell(r_fr,'frame');
						add_cell(r_dx,'dx');
						add_cell(r_dy,'dy');
						add_cell(r_tr,'path <i>E&#772;</i>');
						add_cell(r_foot,'total');
						add_cell(r_log,'log').colSpan=2;
						//second column
						add_cell(r_head,h>0?null:ccase.name).colSpan=99;
						add_cell(r_subh,'sum');
						result_table.errorsum_fr = add_cell(r_fr);
						result_table.errorsum_dx = add_cell(r_dx);
						result_table.errorsum_dy = add_cell(r_dy);
						result_table.errorsum_tr = add_cell(r_tr);
						result_table.errorsum_all = add_cell(r_foot);
						//third column
						add_cell(r_subh).colSpan=999;
						add_cell(r_foot).colSpan=999;

						for( var l=0; l<duration; l++)
						{	//for each defined frame
							var frame = ccase.player[h][l];
							if(!frame) continue;
							var data = players[h].data;
							var pic = create_at(add_cell(r_pic),'div');
							if( frame.f!==undefined)
							{
								var data_frame = data.frame[frame.f instanceof Array? frame.f[0]:frame.f];
								pic.style.position = 'relative';
								pic.style.width = data.bmp.file[0].w+1+'px';
								pic.style.height = data.bmp.file[0].h+1+'px';
								var sp = new Sprite(data.bmp, pic);
								sp.show_pic(data_frame.pic);
								sp.set_x_y(0,0);
							}
							add_cell(r_state, frame.f!==undefined?data_frame.state:undefined);
							add_cell(r_key, frame.k);
							result_table[l] = {
								//for showing test results
								f: add_cell(r_fr, frame.f),
								dx: add_cell(r_dx, frame.dx),
								dy: add_cell(r_dy, frame.dy),
								tr: add_cell(r_tr),
								log: add_cell(r_log)
							};
						}
					}
				}
				//finished preparation for one scenario
				finish_prep();
			}); //load
			}(i)); //closure
		}
	}

	function start_test()
	{
		next_scenario();
	}
	function next_scenario()
	{
		cur_scenario--;
		if( cur_scenario<0)
		{	//all scenario finished
			document.getElementById('window').style.display='none';
			if( !window.location.href.match('no_log'))
			submit_log([
					window.location.href.slice(window.location.href.lastIndexOf('/')+1),
					overall.passed,overall.finished,overall.delta,
					browser_info()[0]+','+browser_info()[1]
				]); //*/
		}
		else
			new Testcase(test_cases[cur_scenario]);
	}
	function browser_info()
	{
		var N= navigator.appName, ua= navigator.userAgent, tem;
		var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
		if(M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
		M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
		return M;
	}
	function submit_log(ldata)
	{	//submit log to google form silently
		var form = document.createElement('form');
		var target = document.createElement('iframe');
		target.name = 'hiddenframe';
		target.style.display = 'none';
		var body = document.getElementsByTagName('body')[0];
		form.action = 'https://docs.google.com/forms/d/1p212mOPl37gJ7AA87b_eW1OOwY3h9-zdXnVjDRYPwDY/formResponse';
		form.method = 'POST';
		form.style.display = 'none';
		form.target = 'hiddenframe';
		body.appendChild(target);
		body.appendChild(form);
		var data=[];
		for( var i=0; i<5; i++)
		{
			data[i] = document.createElement('input');
			data[i].type = 'text';
			form.appendChild(data[i]);
		}
		data[0].name = 'entry.543839435';
		data[1].name = 'entry.244956536';
		data[2].name = 'entry.1649007291';
		data[3].name = 'entry.36587793';
		data[4].name = 'entry.962836516';
		data[0].value = ldata[0];
		data[1].value = ldata[1];
		data[2].value = ldata[2];
		data[3].value = ldata[3];
		data[4].value = ldata[4];
		form.submit();
	}

	(function main()
	{
		make_table();
	}());
});

}());

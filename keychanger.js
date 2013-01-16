//a key changer utility for LF2

define(['core/controller'], function (Fcontroller)
{

change_active=false;

function keychanger (append_at, controllers)
{
	append_at.style.textAlign='center';

	for( var i=0; i<controllers.length; i++)
	{
		add_player(controllers[i], i);
	}

	//the ok button
	var rule = create_at(append_at,'div');
	rule.style.clear='both';
	var ok = create_at(append_at,'button');
	ok.innerHTML='close';
	ok.style.width='120px';
	ok.onclick= function()
	{	//when click, the ok button will try to purge everything
		ok.onclick= null;
		append_at.parentNode.removeChild(append_at);
	}

	function add_player(con, num)
	{
		if( num!==0)
		{
			var sep=create_at(append_at, 'div');
			sep.style.float='left';
			sep.innerHTML='&nbsp;&nbsp;&nbsp;&nbsp;';
		}

		var table=create_at(append_at, 'table');
		table.style.float='left';

		var row=[];
		row[0]=create_at(table, 'tr');
		var head= add_cell(row[0],'player '+(num+1));
		head.colSpan='2';

		var i=1;
		for( var I in con.config)
		{
			row[i]=create_at(table, 'tr');
			add_pair(row[i],I);
			i++;
		}

		function add_pair(R,name)
		{
			add_cell(R,name);
			var cell=add_cell(R, con.config[name]);
			cell.style.cursor='pointer';
			cell.onclick=function()
			{
				if( !change_active)
				{
					change_active=true;
					var This=this;
					This.style.backgroundColor= "#FAA";
					var hold=window.onkeydown;
					window.onkeydown=function(e)
					{
						if (!e) e = window.event;
						var value=e.keyCode;
						window.onkeydown=hold;
						cell.innerHTML=Fcontroller.keycode_to_keyname(value);
						con.config[name]=Fcontroller.keycode_to_keyname(value);
						con.keycode[name]=value;
						This.style.backgroundColor= "#EEE";
						change_active=false;
					}
				}
			}
		}
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
		td.style.border="1px solid #AAA";
		td.style.backgroundColor= "#EEE";
		td.style.fontFamily="monospace";
		td.style.width='40px';
		td.style.textAlign='center';
		return td;
	}
}

return keychanger;
});

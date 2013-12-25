function convert_LF2_to_JSON(input)
{
	var O={}; //object
	var p=0;  //parse point
	var V=input;
	var output='';

	//parsing
	if( V.indexOf('<')===-1) //there is no angle brackets in bg data files
	{
		parse_background();
		if( O.name)
			O.name=O.name.replace(/_/g,' '); //replace underscore with space
	}
	else
	for( var prsi=0; prsi<9; prsi++)
	{
		var tag = next_tag();
		if( tag==='bmp_begin')
			parse_bmp();
		else if( tag==='weapon_strength_list')
			parse_weapon_strength_list();
		else if( tag==='frame')
			parse_frames();
	}
	//output=JSON.stringify(O,null,'\t'); //standard JSON format
	output=to_text(O); //LF2 style format
	output='define('+output+');';
	return output;

	function g(S) //go forward
	{
		var oldp=p;
		p=V.indexOf(S,p);
		if( p<oldp)
			prsi=9; //break the parsing loop
		return p;
	}
	function gg(F)
	{
		for( var i=p;i<V.length;i++)
			if( F(V.charAt(i)))
			{
				p=i;
				break;
			}
		return p;
	}
	function alpha(C)
	{
		if( C.charCodeAt(0) >= 'a'.charCodeAt(0) &&
		C.charCodeAt(0) <= 'z'.charCodeAt(0))
			return true;
	}
	function numeric(C)
	{
		if( (C.charCodeAt(0) >= '0'.charCodeAt(0) &&
		C.charCodeAt(0) <= '9'.charCodeAt(0)) ||
		C.charAt(0) === '-')
			return true;
	}
	function non_space_newline(C)
	{
		return (C!==' ' && C!=='\n');
	}
	function is_integer(word)
	{
		for( var i=0;i<word.length;i++)
			if( !numeric(word.charAt(i)))
				return false;
		return true;
	}
	function is_float(word)
	{
		for( var i=0;i<word.length;i++)
			if( !(numeric(word.charAt(i)) || word.charAt(i)==='.'))
				return false;
		return true;
	}
	function trim(word)
	{
		return word.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	function next_tag()
	{
		var oldp=p;
		var a = g('<')+1;
		var b = g('>');
		var tag = V.slice(a,b);
		p=oldp;
		return tag;
	}

	function parse_bmp()
	{
		O.bmp={};
		g('<bmp_begin>');
		var a = g('\n')+1;
		var b = g('\n<bmp_end>');
		p+=1; g('\n');
		var bmp = V.slice(a,b);
		bmp = bmp.split('\n');

		O.bmp.file=[];
		for( var j=0; j<bmp.length; j++)
		{
			if (bmp[j].indexOf('file')!==-1)
			{
				var T={};
				addl(T,bmp[j]);
				if( T.w)
				{
					O.bmp.file.push(T);
				}
			}
			else if (bmp[j].indexOf(': ')!==-1)
			{
				add(O.bmp,bmp[j],': ');
			}
			else
			{
				add(O.bmp,bmp[j],' ');
			}
		}
	}

	function parse_weapon_strength_list()
	{
		var WSL={};
		g('<weapon_strength_list>');
		var a = g('\n')+1;
		var b = g('\n<weapon_strength_list_end>');
		p+=1; g('\n');
		var wsl = V.slice(a,b);
		wsl = wsl.split('\n');
		for( var j=0; j<wsl.length; j+=2)
		{
			var en={};
			wsl[j]=trim(wsl[j]);
			add(en,wsl[j],': ');
			var num=parseInt(en.entry);

			var entry={entry: en.entry.slice(en.entry.indexOf(' ')+1)};
			addl(entry,wsl[j+1]);
			WSL[num]=entry;
		}

		O.weapon_strength_list=WSL;
	}

	function parse_frames()
	{
		O.frame={};
		for( ;;)
		{
			g('<frame>');
			if( p===-1)
				break;
			var a = g(' ')+1;
			var b = g('\n<frame_end>');
			p = a; //rewind the parse point
			var c = g(' ');
			var d = g('\n');
			var I = V.slice(a,c);
			O.frame[I]={};
			O.frame[I].name = V.slice(c+1,d);
			var e = gg(non_space_newline);
			var f = g('\n');
			addl(O.frame[I], V.slice(e,f));
			//finished basic properties
			for( ;;)
			{
				var l = gg(non_space_newline);
				if( l >= b)
					break;
				var m = g(':'); p+=1;//the':'
				var pro = V.slice(l,m);
				var n = gg(non_space_newline);
				var o = g('\n');
				var prop;
				if( O.frame[I][pro]) //object already exist!
				{
					if( O.frame[I][pro].length>=2)
					{
						O.frame[I][pro].push({});
						prop = O.frame[I][pro][O.frame[I][pro].length-1];
					}
					else
					{
						O.frame[I][pro] = [O.frame[I][pro],{}];
						prop = O.frame[I][pro][1];
					}
				}
				else
				{
					O.frame[I][pro]={};
					prop = O.frame[I][pro];
				}
				if( pro!=='sound')
				{
					addl(prop, V.slice(n,o));
					{
						var op=p;
						n = gg(non_space_newline);
						o = g('\n');
						if( V.slice(n,o).indexOf('_end')===-1)
						{
							addl(prop, V.slice(n,o));
						}
						else
							p=op;
					}
					gg(non_space_newline); //the xxx_end tag
					g(':'); p+=1;
				}
				else
				{
					O.frame[I][pro] = trim(V.slice(n,o));
				}
			}
			p = b; //go to the end point
			g('\n');
		}
	}

	function parse_background()
	{
		for( var i=0; i<3; i++)
		{
			var a=p;
			var b=g('\n');
			var line=V.slice(a,b);
			addl(O,line);
			gg(non_space_newline);
		}
		O.layer=[];
		for( ;;)
		{
			if( g('layer:')!==-1)
			{
				g('\n');
				var n1 = gg(non_space_newline);
				var n2 = g('\n');
				var n3 = gg(non_space_newline);
				var n4 = g('\n');
				var lay = {pic:V.slice(n1,n2)};
				addl(lay,V.slice(n3,n4));
				O.layer.push(lay);
			}
			else
				break;
		}
	}

	function add(T,S,s) //target, "property_s_value"
	{
		var A = S.split(s);
		if( A.length > 2) alert(A.join());
		if( A[0]) A[0] = trim(A[0]);
		if( A[1]) A[1] = trim(A[1]);
		if( A[1])
		{
			if( A[0]==='catchingact' ||
			    A[0]==='caughtact' ||
			    A[0]==='zboundary' ||
			    A[0]==='shadowsize' )
			{
				var B = A[1].split(' ');
				var v0 = parseInt(B[0]);
				var v1 = parseInt(B[1]);
				T[A[0]]= [v0,v1];
			}
			else
			{
				var value;
				if( is_integer(A[1]))
					value = parseInt(A[1]);
				else if( is_float(A[1]))
					value = parseFloat(A[1]);
				else
					value = A[1];
				T[A[0]] = value;
			}
		}
	}
	function addl(T,S) //add long: target, "P1_s1_V1_s2_P2_s1_V2..."
	{
		if( S.indexOf('catchingact')===-1 &&
			S.indexOf('caughtact')===-1 &&
			S.indexOf('zboundary')===-1 &&
			S.indexOf('shadowsize')===-1 )
		{
			S=S.replace(/: /g,':');
			S=S.replace(/  /g,' ');
			S=S.replace(/ /g,'  ');
			S=S.replace(/:/g,': '); //normalize S
		}

		var B = S.split('  ');
		for( var i in B)
			add(T,B[i],': ');
	}
	
	/*\
	 * util.to_text
	 * convert an object into JSON text
	 * 
	 * most of the time you should use built-in `JSON.stringify` instead
	 [ method ]
	 - obj (object)
	 - name (string) the object's name
	 - [sep] (string) separator, default as `\n`
	 - [pretext] (string) used in recursion only, set it to null
	 - [filter] (function) a filter `function(p,P)` passing in name p and object P, return 1 to hide the attribute, OR return a string to be shown
	 - [TTL] (number) time-to-live to prevent infinite looping
	\*/
	function to_text(
		obj2, name,
		sep,
		pretext,
		filter,
		TTL
	)
	{
		if( TTL===0) return '';
		if( !TTL) TTL=30;
		if( !sep) sep='\n';
		if( !pretext) pretext='';
		var tab='  '; //or '\t'
		
		var str=pretext;
		
		if( array_no_childobj(obj2))
		{
			sep='';
			pretext='';
			tab='';
		}
		
		var qq='';
		if( name)
			str+=qq+name+qq+':'+' ';//+sep;
		str+= /*pretext+*/(obj2 instanceof Array?'[':'{');
		var cc=0;
		for (var p in obj2)
		{
			if( obj2[p].constructor==Object ||
				obj2[p] instanceof Array )
			{
				var subname = obj2 instanceof Array?null:p;
				var subsep = sep;
				var subpretext = pretext;
				var append = name==='frame'?'':tab;
				if( array_no_childobj(obj2[p]) && p!=='catchingact')
				{
					subsep = '';
					subpretext = '';
					append = ' ';
				}
				str += (cc?',':'')+subsep+arguments.callee(obj2[p],subname,subsep,subpretext+append,filter,TTL-1);
			}
			else
			{
				if( name==='bmp')
					str += (cc?',':'')+sep+pretext+tab;
				else if( p==='pic' || 
					p==='sound' ||
					(!name && p==='name') ||
					(!name && p==='width' && pretext==='') ||
					(!name && p==='shadow') ||
					(!name && p==='transparency') ||
					(!name && p==='rect') )
					str += (cc?',':'')+sep+pretext+tab;
				else if( p==='name')
					str += ' ';
				else
					str += (cc?', ':sep+pretext+tab);
				var qc=p.indexOf('(')===-1?'':'"';
				if( !(obj2 instanceof Array))
					str+=qc+p+qc+': ';
				if( typeof obj2[p]=='string')
					str += '"';
				var content = (obj2[p]+'').replace(/\\/g,'/');
				if( content.indexOf('.bmp')!==-1)
					content = content.replace('/sys/','/').replace('.bmp','.png');
				if( content.indexOf('.wav')!==-1)
					content = content.replace('data/','soundpack/1/').replace('.wav','');
				str += content;
				if( typeof obj2[p]=='string')
					str += '"';
			}
			cc=1;
		}
		str+= sep+pretext+(obj2 instanceof Array?']':'}');
		return str;
	}
	
	function array_no_childobj(obj2)
	{
		var res=false;
		if( obj2 instanceof Array)
		{
			res=true;
			for (var p in obj2)
				if( obj2[p].constructor==Object ||
					obj2[p] instanceof Array )
					res=false;
		}
		return res;
	}
}
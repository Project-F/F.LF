//Project F
/*	generic functions
 */
define({ //exports a set of functions in an object

//
//javascript-----------------
//
/* //deprecated in favour of the use of head.js, now requirejs
js: function (filename)
{
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.src = filename;
	script.type = 'text/javascript';
	head.appendChild(script);
},*/
css: function (filename)
{
	//attach a stylesheed to page
	var head = document.getElementsByTagName('head')[0];
	var link = document.createElement('link');
	link.href = filename;
	link.rel = 'stylesheet';
	link.type = 'text/css';
	head.appendChild(link);
},
double_delegate: function (function1, function2)
{
	// http://roberthahn.ca/articles/2007/02/02/how-to-use-window-onload-the-right-way/
	return function() {
	if (function1)
		function1.apply(this,Array.prototype.slice.call(arguments));
	if (function2)
		function2.apply(this,Array.prototype.slice.call(arguments));
	}
},

//
//data structure------------
//
arr_search: function ( arr,
		fc_criteria,  //function to return true when an accepted element is passed in
		fc_replace,   //[optional] function to return a replacement value when original value is passed in
		search_all)   //[optional] if true, will search through entire array before returning the list of index
				//otherwise, will return immediately at the first accepted element
{
	var found_list=new Array();
	//for ( var i=0; i<arr.length; i++)
	for ( var i in arr)
	{
		if ( fc_criteria(arr[i],i))
		{
			if ( fc_replace) {
				arr[i] = fc_replace(arr[i]);
			}
			if ( !search_all) {
				return i;
			} else {
				found_list.push(i);
			}
		}
	}
	if ( search_all) {
		return found_list;
	} else {
		return -1;
	}
},

push_unique: function ( array, element)
{
	var res = arr_search( array, function(E){return E==element} );
	if (res == -1) array.push(element);
},

extend_object: function (obj1, obj2) //extend obj1 with all members of obj2
{
	for (var p in obj2)
	{
		if ( typeof obj2[p]=='object' )
		{
			obj1[p] = arguments.callee((obj1[p]?obj1[p]:{}), obj2[p]);
		} else
		{
			obj1[p] = obj2[p];
		}
	}
	return obj1;
	// http://stackoverflow.com/questions/122102/what-is-the-most-efficient-way-to-clone-a-javascript-object
},

to_text: function ( //convert a JSON object to into text
			//	usage: F.to_text(obj,'obj');
	obj2, name,	//object and its name
	sep,		//[optional] separator, default as '\n'
	pretext,	//[used in recursion only] set it to null
	filter,		//[optional] a filter function(p,P) passing in name p and object P
			//	return 1 to completely hide the attribute,
			//	OR return a string to be shown
	TTL		//[optional] time-to-live to prevent infinite looping
)
{
	if( TTL===0) return '';
	if( !TTL) TTL=30;
	if( !sep) sep='\n';
	if( !pretext) pretext='';

	var str = pretext+ name +':'+sep;
	str+= pretext+ '{';
	var cc=0;
	for (var p in obj2)
	{
		var fil = filter && filter(p,obj2[p]);
		if( fil==1)
		{
			//do nothing
		}
		else if( typeof fil=='string')
		{
			str += (cc?',':'')+sep+pretext+'\t'+"'"+p+"'"+': '+fil;
		}
		else
		{
			if( obj2[p].constructor==Object )
			{
				str += (cc?',':'')+sep+arguments.callee(obj2[p],p,sep,pretext+'\t',filter,TTL-1);
			} else
			{
				str += (cc?',':'')+sep+pretext+'\t'+"'"+p+"'"+': ';
				if( typeof obj2[p]=='string')
					str += "'";
				str += obj2[p];
				if( typeof obj2[p]=='string')
					str += "'";
			}
		}
		cc=1;
	}
	str+= sep+pretext+ '}';
	return str;
}

});

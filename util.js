/*\
 * util.js
 * utilities for F.LF
\*/

define(function(){

if (typeof console==='undefined')
{	//polyfill for IE, this is just for precaution
	// we should not use console.log in production anyway unless for fatal error
    console={};
    console.log = function(){}
}

var util={};

util.select_from=function(from,where,option)
{
	var res=[];
	for( var i in from)
	{
		var O=from[i];
		var match=true;
		if( typeof where==='function')
		{
			if( !where(O))
				match=false;
		}
		else
			for( var j in where)
			{
				if( O[j]!==where[j])
					match=false;
			}
		if( match)
			res.push(O);
	}
	if( res.length===0)
		return ;
	else if( res.length===1)
		return res[0];
	else
		return res;
}

util.lookup=function(A,x)
{
	for( var i in A)
	{
		if( x<=i)
			return A[i];
	}
}

util.lookup_abs=function(A,x)
{
	if( x<0) x=-x;
	for( var i in A)
	{
		if( x<=i)
			return A[i];
	}
}

util.shallow_copy=function(A)
{
	var B={};
	for( var i in A)
		B[i] = A[i];
	return B;
}

util.div=function(classname)
{
	if( !util.container)
	{
		util.container = document.getElementsByClassName('LFcontainer')[0];
		if( !util.container) return null;
	}
	return util.container.getElementsByClassName('LF'+classname)[0];
}

util.filename=function(file)
{
	if( file.lastIndexOf('/')!==-1)
		file = file.slice(file.lastIndexOf('/')+1);
	if( file.lastIndexOf('.js')!==-1)
		file = file.slice(0,file.lastIndexOf('.js'));
	return file;
}

/**
The resourcemap specified by F.core allows putting a js function as a condition checker.
This is considered insecure in F.LF. thus F.LF only allows simple predefined condition checking.
*/
util.setup_resourcemap=function(package,Fsprite)
{
	var has_resmap=false;
	if( package.resourcemap)
	if( typeof package.resourcemap.condition==='string')
	{
		var cond = package.resourcemap.condition.split(' ');
		if( cond[0]==='location' && cond[1]==='contain' &&
			cond[2] && cond[3]==='at' && cond[4])
		{
			cond[4]=parseInt(cond[4]);
			package.resourcemap.condition = function()
			{
				return window.location.href.indexOf(cond[2])===cond[4];
			}
		}
		else if( cond[0]==='location' && cond[1]==='contain' && cond[2])
		{
			package.resourcemap.condition = function()
			{
				return window.location.href.indexOf(cond[2])!==-1;
			}
		}

		if( typeof package.resourcemap.condition==='function')
		{
			var resmap = [
				package.resourcemap, //package-defined resourcemap
				{	//default resourcemap
					get: function(res)
					{
						return package.location+res;
					}
				}
			];
			Fsprite.masterconfig_set('resourcemap',resmap);
			has_resmap=true;
		}
	}
	if( !has_resmap)
		Fsprite.masterconfig_set('baseUrl',package.location);
}

return util;
});

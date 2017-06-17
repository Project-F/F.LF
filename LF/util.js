/*\
 * util.js
 * utilities for F.LF
\*/

define(function(){

if (typeof console==='undefined')
{	//polyfill for IE, this is just for precaution
	// we should not use console.log in production anyway
    console={};
    console.log = function(){}
}

var util={};

util.selectA_from=function(from,where,option)
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
	return res; //always return an array
}

util.select_from=function(from,where,option)
{
	var res = util.selectA_from(from,where,option);
	if( res.length===0)
		return ;
	else if( res.length===1)
		return res[0]; //return an item
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
	return A[i];
}

util.shallow_copy=function(A)
{
	var B={};
	for( var i in A)
		B[i] = A[i];
	return B;
}

util.div=function(/*classname, child_classname, ...*/)
{
	if( !util.container)
	{
		util.root = document.getElementsByClassName('LFroot')[0];
		util.container = util.root.getElementsByClassName('container')[0];
	}
	classchain = Array.prototype.slice.call(arguments);
	var cur = util.root;
	while( classchain.length)
	{
		cur = cur.getElementsByClassName(classchain.shift())[0];
	}
	return cur;
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
The resourcemap specified by core allows putting a js function as a condition checker.
This is considered insecure in F.LF. thus F.LF only allows simple predefined condition checking.
*/
util.setup_resourcemap=function(package)
{
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
			return resmap;
		}
	}
}

util.normalize_path=function(ppp)
{	//normalize a file path section
	if( !ppp)
		return '';
	ppp=ppp.replace(/\\/g,'/');
	if( ppp.charAt(ppp.length-1)!=='/')
		ppp+='/';
	if( ppp.charAt(0)==='/')
		ppp=ppp.slice(1);
	return ppp;
}

//return the parameters passed by location
util.location_parameters=function()
{
	var param = window.location.href.split('/').pop(),
		query = {};
	if( param.indexOf('?')!==-1)
	{
		var param = param.split('?').pop().split('&');
		for( var i=0; i<param.length; i++)
		{
			pp = param[i].split('=');
			if( pp.length===1)
				query[pp[0]] = 1;
			if( pp.length===2)
				query[pp[0]] = pp[1];
		}
	}
	return query;
}

/* the work to 'organize' the package is to create a 'pack' of dependency for each character.
   because under the current lazy loading scheme, all specialattacks are not loaded initially,
   instead are loaded only when a game starts and such data files are needed.
   however there is no dependency syntax in the current data file structure,
   such that we just guess by naive name matching.
   this is the reason for the quirky henry_louis_rudolf_wind.js
 */
util.organize_package=function(package)
{
	for( var i=0; i<package.data.object.length; i++)
	{
		if( package.data.object[i].type==='character')
		{
			//if `deep.js` is of type character, select all objects which `file` contains `deep`
			var name = util.filename(package.data.object[i].file);
			var objects = util.selectA_from(package.data.object,function(O){
				if( !O.file) return false;
				var file = util.filename(O.file);
				if( file===name) return false;
				return file.indexOf(name)!==-1;
			});
			package.data.object[i].pack = objects; //each character has a specialattack pack
		}
	}
}

return util;
});

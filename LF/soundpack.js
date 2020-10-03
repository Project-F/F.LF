/*\
 * soundpack
 * sound spriting and effects management
\*/

define(['F.LF/core/effects-pool'],function(Feffects)
{
	var basic_support = !!(document.createElement('audio').canPlayType);
	
	function soundmanager(config)
	{
		if( !config || !basic_support)
			return { //dummy object
				play:function(){},
				TU:function(){},
				dummy:true
			}
		this.packs = {};
		this.buffer = {};
		this.time = 0;
		var This = this;
		for( var i=0; i<config.packs.length; i++)
			(function(i){
				This.packs[config.packs[i].id] = new Feffects({
					circular: false,
					init_size: 5,
					batch_size: 5,
					max_size: 15,
					construct: function()
					{
						return new soundsprite(config.packs[i].data,config.resourcemap);
					}
				});
			}(i));
	}
	soundmanager.prototype.play=function(path)
	{
		if( this.buffer[path])
			return; //play each sound once only in one TU
		this.buffer[path] = true;
		var I, id;
		if( path.charAt(1)==='/')
		{
			I = path.charAt(0);
			id = path.slice(2);
		}
		else
		{
			var str = path.split('/');
			I = str[0];
			id = str[1];
		}
		if( this.packs[I])
			this.packs[I].create(id);
	}
	soundmanager.prototype.TU=function()
	{
		this.time++;
		if( this.time%5===0)
			for( var I in this.buffer) //clear buffer
				this.buffer[I] = null;
	}
	soundmanager.support=function(callback)
	{
		if( !basic_support)
			return;
		var src = {
			mp3:'data:audio/mpeg;base64,/+MYxAAAAANIAUAAAASEEB/jwOFM/0MM/90b/+RhST//w4NFwOjf///PZu////9lns5GFDv//l9GlUIEEIAAAgIg8Ir/JGq3/+MYxDsLIj5QMYcoAP0dv9HIjUcH//yYSg+CIbkGP//8w0bLVjUP///3Z0x5QCAv/yLjwtGKTEFNRTMuOTeqqqqqqqqqqqqq/+MYxEkNmdJkUYc4AKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
			ogg:'data:audio/ogg;base64,T2dnUwACAAAAAAAAAADqnjMlAAAAAOyyzPIBHgF2b3JiaXMAAAAAAUAfAABAHwAAQB8AAEAfAACZAU9nZ1MAAAAAAAAAAAAA6p4zJQEAAAANJGeqCj3//////////5ADdm9yYmlzLQAAAFhpcGguT3JnIGxpYlZvcmJpcyBJIDIwMTAxMTAxIChTY2hhdWZlbnVnZ2V0KQAAAAABBXZvcmJpcw9CQ1YBAAABAAxSFCElGVNKYwiVUlIpBR1jUFtHHWPUOUYhZBBTiEkZpXtPKpVYSsgRUlgpRR1TTFNJlVKWKUUdYxRTSCFT1jFloXMUS4ZJCSVsTa50FkvomWOWMUYdY85aSp1j1jFFHWNSUkmhcxg6ZiVkFDpGxehifDA6laJCKL7H3lLpLYWKW4q91xpT6y2EGEtpwQhhc+211dxKasUYY4wxxsXiUyiC0JBVAAABAABABAFCQ1YBAAoAAMJQDEVRgNCQVQBABgCAABRFcRTHcRxHkiTLAkJDVgEAQAAAAgAAKI7hKJIjSZJkWZZlWZameZaouaov+64u667t6roOhIasBACAAAAYRqF1TCqDEEPKQ4QUY9AzoxBDDEzGHGNONKQMMogzxZAyiFssLqgQBKEhKwKAKAAAwBjEGGIMOeekZFIi55iUTkoDnaPUUcoolRRLjBmlEluJMYLOUeooZZRCjKXFjFKJscRUAABAgAMAQICFUGjIigAgCgCAMAYphZRCjCnmFHOIMeUcgwwxxiBkzinoGJNOSuWck85JiRhjzjEHlXNOSuekctBJyaQTAAAQ4AAAEGAhFBqyIgCIEwAwSJKmWZomipamiaJniqrqiaKqWp5nmp5pqqpnmqpqqqrrmqrqypbnmaZnmqrqmaaqiqbquqaquq6nqrZsuqoum65q267s+rZru77uqapsm6or66bqyrrqyrbuurbtS56nqqKquq5nqq6ruq5uq65r25pqyq6purJtuq4tu7Js664s67pmqq5suqotm64s667s2rYqy7ovuq5uq7Ks+6os+75s67ru2rrwi65r66os674qy74x27bwy7ouHJMnqqqnqq7rmarrqq5r26rr2rqmmq5suq4tm6or26os67Yry7aumaosm64r26bryrIqy77vyrJui67r66Ys67oqy8Lu6roxzLat+6Lr6roqy7qvyrKuu7ru+7JuC7umqrpuyrKvm7Ks+7auC8us27oxuq7vq7It/KosC7+u+8Iy6z5jdF1fV21ZGFbZ9n3d95Vj1nVhWW1b+V1bZ7y+bgy7bvzKrQvLstq2scy6rSyvrxvDLux8W/iVmqratum6um7Ksq/Lui60dd1XRtf1fdW2fV+VZd+3hV9pG8OwjK6r+6os68Jry8ov67qw7MIvLKttK7+r68ow27qw3L6wLL/uC8uq277v6rrStXVluX2fsSu38QsAABhwAAAIMKEMFBqyIgCIEwBAEHIOKQahYgpCCKGkEEIqFWNSMuakZM5JKaWUFEpJrWJMSuaclMwxKaGUlkopqYRSWiqlxBRKaS2l1mJKqcVQSmulpNZKSa2llGJMrcUYMSYlc05K5pyUklJrJZXWMucoZQ5K6iCklEoqraTUYuacpA46Kx2E1EoqMZWUYgupxFZKaq2kFGMrMdXUWo4hpRhLSrGVlFptMdXWWqs1YkxK5pyUzDkqJaXWSiqtZc5J6iC01DkoqaTUYiopxco5SR2ElDLIqJSUWiupxBJSia20FGMpqcXUYq4pxRZDSS2WlFosqcTWYoy1tVRTJ6XFklKMJZUYW6y5ttZqDKXEVkqLsaSUW2sx1xZjjqGkFksrsZWUWmy15dhayzW1VGNKrdYWY40x5ZRrrT2n1mJNMdXaWqy51ZZbzLXnTkprpZQWS0oxttZijTHmHEppraQUWykpxtZara3FXEMpsZXSWiypxNhirLXFVmNqrcYWW62ltVprrb3GVlsurdXcYqw9tZRrrLXmWFNtBQAADDgAAASYUAYKDVkJAEQBAADGMMYYhEYpx5yT0ijlnHNSKucghJBS5hyEEFLKnINQSkuZcxBKSSmUklJqrYVSUmqttQIAAAocAAACbNCUWByg0JCVAEAqAIDBcTRNFFXVdX1fsSxRVFXXlW3jVyxNFFVVdm1b+DVRVFXXtW3bFn5NFFVVdmXZtoWiqrqybduybgvDqKqua9uybeuorqvbuq3bui9UXVmWbVu3dR3XtnXd9nVd+Bmzbeu2buu+8CMMR9/4IeTj+3RCCAAAT3AAACqwYXWEk6KxwEJDVgIAGQAAgDFKGYUYM0gxphhjTDHGmAAAgAEHAIAAE8pAoSErAoAoAADAOeecc84555xzzjnnnHPOOeecc44xxhhjjDHGGGOMMcYYY4wxxhhjjDHGGGOMMcYYY0wAwE6EA8BOhIVQaMhKACAcAABACCEpKaWUUkoRU85BSSmllFKqFIOMSkoppZRSpBR1lFJKKaWUIqWgpJJSSimllElJKaWUUkoppYw6SimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaVUSimllFJKKaWUUkoppRQAYPLgAACVYOMMK0lnhaPBhYasBAByAwAAhRiDEEJpraRUUkolVc5BKCWUlEpKKZWUUqqYgxBKKqmlklJKKbXSQSihlFBKKSWUUkooJYQQSgmhlFRCK6mEUkoHoYQSQimhhFRKKSWUzkEoIYUOQkmllNRCSB10VFIpIZVSSiklpZQ6CKGUklJLLZVSWkqpdBJSKamV1FJqqbWSUgmhpFZKSSWl0lpJJbUSSkklpZRSSymFVFJJJYSSUioltZZaSqm11lJIqZWUUkqppdRSSiWlkEpKqZSSUmollZRSaiGVlEpJKaTUSimlpFRCSamlUlpKLbWUSkmptFRSSaWUlEpJKaVSSksppRJKSqmllFpJKYWSUkoplZJSSyW1VEoKJaWUUkmptJRSSymVklIBAEAHDgAAAUZUWoidZlx5BI4oZJiAAgAAQABAgAkgMEBQMApBgDACAQAAAADAAAAfAABHARAR0ZzBAUKCwgJDg8MDAAAAAAAAAAAAAACAT2dnUwAEAAAAAAAAAADqnjMlAgAAADzQPmcBAQA='
		};
		try {
			var audio = document.createElement('audio');
			for( var I in src)
			{
				var source = document.createElement('source');
				source.src = src[I];
				audio.appendChild(source);
			}
			audio.autoplay = true;
			audio.addEventListener('play',function onplay(){
				audio.removeEventListener('play',onplay,true);
				audio.pause();
				callback({autoplay:true});
			},true);
		} catch(e) {
		}
	}
	
	var types=
	{
		'mp3': 'audio/mpeg',
		'ogg': 'audio/ogg',
		'wav': 'audio/wav',
		'aac': 'audio/aac',
		'm4a': 'audio/x-m4a'
	};
	function soundsprite(data,resourcemap)
	{
		var This = this;
		var audio = this.audio = document.createElement('audio');
		this.frame = data.sound;
		audio.preload='auto';
		for( var i=0; i<data.ext.length; i++)
		{
			var source = document.createElement('source');
			var src = data.file+'.'+data.ext[i];
			if( resourcemap)
				src = resourcemap.get(src);
			source.src = src;
			if( types[data.ext[i]])
				source.type = types[data.ext[i]];
			audio.appendChild(source);
		}
		audio.addEventListener('timeupdate',function(){This.timeupdate();},true);
		this.die();
	}
	soundsprite.prototype.born=function(id)
	{
		if( id && this.frame[id])
		{
			this.current = this.frame[id];
			if( this.audio.readyState>=4)
			{
				this.audio.currentTime = this.current.start;
				if( this.audio.currentTime===this.current.start)
				{
					this.audio.play();
					this.dead = false;
					return;
				}
			}
		}
		this.parent.die(this);
	}
	soundsprite.prototype.die=function(id)
	{
		this.dead = true;
	}
	soundsprite.prototype.timeupdate=function()
	{
		if( this.current)
		if( this.audio.currentTime < this.current.start ||
			this.audio.currentTime > this.current.end)
		{
			this.audio.pause();
			if( !this.dead)
				this.parent.die(this);
		}
	}
	
	return soundmanager;
});

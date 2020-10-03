/*\
 * AI.js
 * support AI scripting
\*/

define(['F.LF/core/util'],
function(Futil)
{
	/*\
	 * AIinterface
	 [ class ]
	 * adaptor interface for old-school AI scripting
	 * may be slow and buggy. do not use if you are writing new AI scripts
	\*/
	function AIin(self)
	{
		this.self = self;
	}
	AIin.prototype.facing=function()
	{
		var $=this.self;
		return $.ps.dir==='left';
	}
	AIin.prototype.type=function()
	{
		var $=this.self;
		switch ($.type)
		{
			case 'character':     return 0;
			case 'lightweapon':   return 1;
			case 'heavyweapon':   return 2;
			case 'specialattack': return 3;
			case 'baseball':      return 4;
			case 'criminal':      return 5;
			case 'drink':         return 6;
		}
	}
	AIin.prototype.weapon_type=function()
	{
		var $=this.self;
		if( $.hold.obj)
			switch ($.hold.obj.type)
			{
				case 'lightweapon':
					if( $.proper($.hold.obj.id,'stand_throw'))
						return 101;
					else
						return 1;
				break;
				case 'heavyweapon':
					return 2;
				break;
				case 'character':
					//I am being held
					return -1*$.AI.type();
				break;
			}
		return 0;
	}
	AIin.prototype.weapon_held=function()
	{
		var $=this.self;
		if( $.hold.obj)
			return $.hold.obj.uid;
		return -1;
	}
	AIin.prototype.weapon_holder=function()
	{
		var $=this.self;
		if( $.hold && $.hold.obj)
		switch ($.AI.type())
		{
			case 1: case 2: case 4: case 6:
			return $.hold.obj.uid;
		}
	}
	AIin.prototype.clone=function()
	{
		return -1;
	}
	AIin.prototype.blink=function()
	{
		var $=this.self;
		if( $.effect.blink)
			return Math.round($.effect.timeout/2);
		return 0;
	}
	AIin.prototype.shake=function()
	{
		var $=this.self;
		if( $.effect.oscillate)
			return $.effect.timeout * ($.effect.dvx||$.effect.dvy?1:-1);
		return 0;
	}
	AIin.prototype.ctimer=function()
	{
		var $=this.self;
		if( $.catching && $.state()===9)
			return $.statemem.counter*6;
		return 0;
	}
	AIin.prototype.seqcheck=function(qe)
	{
		var $=this.self;
		if( $.combodec)
		{
			var seq = $.combodec.seq;
			if( seq.length<1 || qe.length<1) return 0;
			var k1 = seq[seq.length-1];
			if( k1===qe[0]) return 1;
			if( seq.length<2 || qe.length<2) return 0;
			var k2 = seq[seq.length-2];
			if( k2===qe[0] && k1===[1]) return 2;
			if( seq.length<3 || qe.length<3) return 0;
			var k3 = seq[seq.length-3];
			if( k3===qe[0] && k2===qe[1] && k1===qe[2]) return 3;
		}
		return 0;
	}
	AIin.prototype.rand=function(i)
	{
		var $=this.self;
		return Math.floor($.match.random()*i);
	}
	AIin.prototype.frame=function(N)
	{
		var $=this.self;
		var tags={'bdy':'make_array','itr':'make_array','wpoint':'object'};
		if( !this.cache)
			this.cache={O:{}};
		if( this.cache.N===N)
			return this.cache.O;
		else
		{
			this.cache.N=N;
			var O = this.cache.O = {};
			if( $.data.frame[N])
			for( var I in $.data.frame[N])
			{
				if( typeof $.data.frame[N][I]==='object')
				{
					if( tags[I]==='make_array')
					{
						var arr = Futil.make_array($.data.frame[N][I]);
						O[I+'_count'] = arr.length;
						O[I+'s'] = arr;
					}
					else if( tags[I]==='object')
					{
						O[I] = $.data.frame[N][I];
					}
				}
				else
					O[I] = $.data.frame[N][I];
			}
			else
			{
				for( var t in tags)
					if( tags[t]==='make_array')
						O[t+'_count'] = 0;
			}
			return O;
		}
	}
	AIin.prototype.frame1=function(N)
	{
		return 0;
	}

	function AIcon()
	{
		this.state={};
		this.child=new Array();
		this.sync=true;
		this.buf=new Array();
	}
	AIcon.prototype.key=function(key,down)
	{
		if( this.sync)
		{
			this.buf.push([key,down]);
		}
		else
		{
			if( this.child)
				for(var J in this.child)
					this.child[J].key(key,down);
			this.state[I]=down;
		}
	}
	AIcon.prototype.keypress=function(key,x,y)
	{
		if( (x===undefined && y===undefined) ||
			(x===1 && y===0))
		{
			if( this.state[key])
				this.key(key,0);
			this.key(key,1);
			this.key(key,0);
		}
		else if(x===1 && y===1)
		{
			if( !this.state[key])
				this.key(key,1);
		}
		else if(x===0 && y===0)
		{
			if( this.state[key])
				this.key(key,0);
		}
	}
	AIcon.prototype.keyseq=function(seq)
	{
		for( var i=0; i<seq.length; i++)
			this.keypress(seq[i]);
	}
	AIcon.prototype.clear_states=function()
	{
		for(var I in this.state)
			this.state[I]=0;
	}
	AIcon.prototype.fetch=function()
	{
		for( var i=0; i<this.buf.length; i++)
		{
			var I=this.buf[i][0];
			var down=this.buf[i][1];
			if( this.child)
				for(var j=0; j<this.child.length; j++)
					this.child[j].key(I,down);
			this.state[I]=down;
		}
		this.buf.length=0;
	}
	AIcon.prototype.flush=function()
	{
		this.buf.length=0;
	}
	AIcon.prototype.type = 'AIcontroller';

	return {
		interface:AIin,
		controller:AIcon
	};
});

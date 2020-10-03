/*\
 * network: p2p networking
 * application layer
\*/

define(['F.LF/core/network'],function(Fnetwork)
{
	//local[i] in peer A will be mapped to remote[i] in peer B
	var local = [],
		remote = [];

	var verify, packet, callback, handler;
	function set_interval(cb, int)
	{
		verify = {};
		packet = {control:[]};
		callback = cb;
		return Fnetwork.setInterval(frame, int);
	}
	function clear_interval(t)
	{
		Fnetwork.clearInterval(t);
		verify = packet = callback = null;
	}
	function frame(time, data, send)
	{
		if( data && data.control)
			for (var i=0; i<remote.length; i++)
				remote[i].supply(data.control[i]);
		for (var i=0; i<local.length; i++)
			packet.control[i] = local[i].pre_fetch();
		packet.verify = verify.last;
		send(packet);
		compare(verify.last_last,data && data.verify);
		verify.last_last = verify.last;
		verify.last = callback();
		for (var i=0; i<local.length; i++)
			local[i].swap_buffer();
		if( packet)
			packet.control.length = 0;
	}
	function compare(A,B)
	{
		if( A===undefined || B===undefined)
			return;
		for( var I in A)
		{
			if( !same(A[I],B[I]))
			{
				if( !verify.error)
				{
					handler.on('sync_error');
					console.log(A,B);
					verify.error = true;
				}
			}
		}
		function same(a,b)
		{
			if( typeof a!==typeof b)
				return false;
			if( typeof a==='object')
			{
				for( var i in a)
					if( a[i]!==b[i])
						return false;
				return true;
			}
			else
				return a===b;
		}
	}
	
	function ncon(role, control)
	{
		this.state={};
		this.child=[];
		this.buf=[];
		this.pre_buf=[];
		this.sync=true;
		this.role=role;
		if( role==='local' || role==='dual')
		{
			local.push(this);
			this.wrap(control);
			control.child.push(this);
			control.sync=true;
			for( var i in control.state)
				this.state[i] = 0;
		}
		if( role==='remote' || role==='dual')
		{
			remote.push(this);
			if( role==='remote')
				for( var i in control)
					this.state[i] = 0;
		}
	}
	ncon.prototype.wrap=function(control)
	{
		this.control = control;
		this.type = control.type;
		this.config = control.config;
		this.keycode = control.keycode;
		var override = {
			'clear_states':1,
			'flush':1,
			'pre_fetch':1,
			'swap_buffer':1,
			'supply':1,
			'fetch':1,
			'key':1
		};
		for( var I in control)
		{	//wrap methods except those in override
			if( typeof control[I]==='function')
			if( !override[I])
			{
				this[I]=(function(I)
				{
					return function()
					{
						control[I].apply(control, arguments);
					}
				}(I));
			}
		}
	}
	ncon.prototype.clear_states=function()
	{
	}
	ncon.prototype.flush=function()
	{
	}
	ncon.prototype.pre_fetch=function()
	{
		//prepare a controller buffer to be sent to a remote peer
		if( this.role==='local' || this.role==='dual')
		{
			this.control.fetch();
			return this.pre_buf;
		}
	}
	ncon.prototype.swap_buffer=function()
	{
		//locally, the controller buffer will be fetched at next frame
		if( this.role==='local' || this.role==='dual')
		{
			var hold = this.pre_buf;
			this.pre_buf = this.buf;
			this.buf = hold;
			this.pre_buf.length=0;
		}
	}
	ncon.prototype.supply=function(buf)
	{
		//received a key sequence buffer from remote peer
		if( this.role==='remote' || this.role==='dual')
		{
			if( buf && buf.length)
				this.buf = this.buf.concat(buf);
		}
	}
	ncon.prototype.fetch=function()
	{
		for( var i=0; i<this.buf.length; i++)
		{
			var I=this.buf[i], K=I[0], D=I[1];
			for( var j=0; j<this.child.length; j++)
				this.child[j].key(K,D);
			this.state[K]=D;
		}
		this.buf.length=0;
	}
	ncon.prototype.key=function(K,down)
	{
		this.pre_buf.push([K,down]);
	}

	function setup(config, _handler)
	{
		handler = _handler;
		network.teardown = teardown;
		network.setInterval = set_interval;
		network.clearInterval = clear_interval;
		network.messenger = Fnetwork.messenger;
		network.transfer = Fnetwork.transfer;
		Fnetwork.setup(config, handler);
	}
	function teardown()
	{
		Fnetwork.teardown();
	}

	var network = {
		setup:setup,
		teardown:function()
		{
			network.clearInterval(network.timer);
		},
		controller:ncon,
		setInterval:function(a,b)
		{
			if( network.timer)
			{
				console.error('only one timer can be active at a time. please `clearInterval` before setting a new one.');
				return;
			}
			network.timer = setInterval(a,b);
			return network.timer;
		},
		clearInterval:function(a)
		{
			if( !network.timer || network.timer !== a)
			{
				console.error('wrong timer id '+a);
				return;
			}
			clearInterval(a);
			network.timer = null;
		}
	}
	return network;

});

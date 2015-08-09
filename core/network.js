/*\
 * network
 * PvP networking library, to be used on top of F.Lobby
\*/

/*\
 * network.setup
 [ method ]
 - config (object) `{server, param}` (accquired from F.Lobby)
 - monitor (object) `{on:function}`
 * 
 * report status events by calling `monitor.on(event, data)`
 > open
 * when connection opens
 > close
 * when connection closes
 > log, mess
 * logging information
 > error, mess
 * connection error
 > sync_error
 * network.js sync error
\*/

/*\
 * network.teardown
 [ method ]
 * teardown
\*/

/*\
 * network.setInterval
 [ method ]
 - frame (function)
 - interval (number) in miliseconds
 = (number) timer_id
 > synchronized frame
 * Each frame call is synchronized across the two peers, with facility provided to maintain two identical game worlds. If network condition permits, the target framerate will be maintained.
 * 
 * `frame` will be called with:
 - time (number) integer
 - data (object) data sent from the other side
 - send (function) send data to the other side
 * example:
| function frame(time, data, send)
| {
| 	if( time===0) {
| 		// start
| 	} else {
| 		// do something with data
| 	}
| 	//send synchronization data
| 	send({..});
| }
\*/

/*\
 * network.clearInterval
 [ method ]
 - timer_id (number)
 *
\*/

/*\
 * network.messenger
 [ property ]
 * in-game messenging
 * 
 * this property is like:
 - send (function)
 | network.messenger.send('hello');
 - receiver (object) you provide this object
 |	network.messenger.receiver = {
 |		onmessage: function(mess) {}
 |	};
\*/

/*\
 * network.transfer
 [ method ]
 * named data exchange. both sides have to call with same name.
 - name (string)
 - sender (function) should return the data to be sent
 - receiver (function) callback when data is received
 * example:
| network.transfer(
| 'game_config',
| function() { return {..} },
| function(data) { apply(data) });
\*/

define(function()
{
	var This;
	(function reset()
	{
		This = {
			already: 0,
			conn: 0,
			time: 0,
			timer: 0,
			timer_callback: 0,
			target_interval: 0,
			lasttime: new Date().getTime(),
			//
			frame: {
				buffer: []
			},
			transfer: {
				obj: {}
			},
			messenger: {}
		};
	}());

	function set_interval(a,b)
	{
		if( This.timer_callback)
		{
			console.error('only one timer can be active at a time. please `clearInterval` before setting a new one.');
			return;
		}
		This.timer_callback = a;
		This.target_interval = b;
		This.timer = setInterval(frame, This.target_interval*0.5);
		return This.timer;
	}
	function clear_interval(a)
	{
		if( !This.timer || This.timer !== a)
		{
			console.error('wrong timer id '+a);
			return;
		}
		clearInterval(This.timer);
		This.timer = null;
		This.timer_callback = null;
	}
	function frame() //timer frame
	{
		if( This.timer_callback)
		if( This.frame.buffer[0])
		{
			var newtime = new Date().getTime(),
				diff = newtime-This.lasttime;
			if( diff > This.target_interval-5) //too slow
			{
				if( This.frame.buffer[0].time !== This.time)
					This.monitor.on('sync_error');
				This.time++;
				var result = This.timer_callback(This.frame.buffer[0].time,This.frame.buffer[0].data,channels.frame.send);
				This.lasttime = newtime;
				This.frame.buffer.shift();
			}
		}
	}
	var channels=
	{
		'frame':
		{
			send: function(data)
			{
				This.conn.send({
					'f': {t:This.time, d:data}
				});
			},
			receive: function(data)
			{
				var time = data.t;
				var data = data.d;
				This.frame.buffer.push({time:time,data:data});
				frame();
			}
		},
		'messenger':
		{
			send: sender('messenger'),
			receive: function(mess)
			{
				if( This.messenger.receiver)
					This.messenger.receiver.onmessage(mess);
				else
					console.warn('dropping message! '+mess);
			}
		},
		'transfer':
		{
			send: sender('transfer'),
			receive: function(data)
			{
				var name = data.name;
				var data = data.data;
				var receive = This.transfer.obj[name];
				if(!receive)
				{
					console.error('no such receiver');
					return;
				}
				receive(data);
				This.transfer.obj[name] = null;
			}
		}
	};
	function transfer(name, send, receive)
	{
		if( This.transfer.obj[name])
		{
			console.error('name '+name+' used already');
			return;
		}
		This.transfer.obj[name] = receive;
		channels.transfer.send({name:name, data:send()});
	}
	function teardown()
	{
		if( !This.already)
		{
			console.error('not yet setup');
			return;
		}
		clear_interval(This.timer);
		reset();
	}
	function sender(name)
	{
		name = name.charAt(0);
		return function(data)
		{
			var obj = {};
			obj[name] = data;
			This.conn.send(obj);
		}
	}
	function setup(config, monitor)
	{
		if( This.already)
		{
			console.error('setup already');
			return;
		}
		This.already = true;
		This.monitor = monitor;
		requirejs([get_host(config.server.address)+config.server.library],function(transport)
		{
			transport.setup(config, handler);
			network.teardown=function()
			{
				transport.teardown();
				teardown();
			};
		});
		
		var id1 = config.param.id1,
			id2 = config.param.id2;
		if(!monitor)
			monitor = {on:function(){}};
		
		var handler = {
			on:function(event, data)
			{
				switch (event)
				{
					case 'open':
						This.conn = data;
						This.messenger.send = channels.messenger.send;
						channels.frame.send();
						monitor.on('open');
					break;
					case 'close':
						monitor.on('close');
					break;
					case 'log':
						monitor.on('log', data);
					break;
					case 'error':
						monitor.on('error', data);
					break;
					case 'data':
						for( var ch in channels)
						{
							var c = ch.charAt(0);
							if( data[c])
								channels[ch].receive(data[c]);
						}
					break;
				}
			}
		};
	}
	function get_host(ppp)
	{
		if( ppp.charAt(ppp.length-1)!=='/')
			ppp+='/';
		return ppp;
	}

	var network = {
		setup:setup,
		teardown:null,
		setInterval:set_interval,
		clearInterval:clear_interval,
		messenger:This.messenger,
		transfer:transfer
	};
	return network;
});

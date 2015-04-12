/*\
 * network
 * network: p2p networking library. supports webSocket and webRTC (via peerjs)
\*/

(function (window) {

if( typeof define !=='undefined')
	define([],define_module);
else
	window.Fcore_network = define_module();

function define_module()
{
	var timer_callback,
		target_interval,
		next_frame,
		messenger = {},
		lasttime = new Date().getTime(),
		buffer = [];
	var monitor = {},
		success_callback;
	monitor.log = monitor.error = function(){};

	function configer(config)
	{
		if( config.monitor)
			monitor = config.monitor;
		if( config.success)
			success_callback = config.success;
	}
	function set_interval(a,b)
	{
		if( !timer_callback)
		{
			timer_callback = a;
			target_interval = b;
			if( target_interval>=30)
				target_interval-=1; //make it slightly faster
			return setInterval(frame,target_interval*0.5);
		}
		else
			console.log('network: error: only one timer can be active at a time. please `clearInterval` before setting a new one.');
	}
	function clear_interval(a)
	{
		clearInterval(a);
		timer_callback = null;
	}
	function frame() //timer frame
	{
		if( timer_callback)
		if( buffer[0])
		{
			var newtime = new Date().getTime(),
				diff = newtime-lasttime;
			if( diff > target_interval-5) //too slow
			{
				var result = timer_callback(buffer[0].time,buffer[0].data,next_frame);
				lasttime = newtime;
				buffer.shift();
				if( result)
					next_frame(result);
			}
		}
	}
	function dataframe(time,data)
	{
		buffer.push({time:time,data:data});
		frame();
	}
	messenger.send=function(mess)
	{
		if( !messenger.send_buffer)
			messenger.send_buffer = [];
		messenger.send_buffer.push(mess);
	}
	function messenger_ready()
	{
		if( messenger.sender)
		{
			messenger.send = messenger.sender;
			delete messenger.sender;
		}
		if( messenger.send_buffer)
		{
			for( var i=0; i<messenger.send_buffer.length; i++)
				messenger.send(messenger.send_buffer[i]);
			delete messenger.send_buffer;
		}
	}
	function onmessage(mess)
	{
		if( messenger.receiver)
			if( messenger.receiver instanceof Array)
				for( var i=0; i<messenger.receiver.length; i++)
					if( messenger.receiver[i].onmessage)
						messenger.receiver[i].onmessage(mess);
	}
	
	function setup_peer(transport,host,key,active,id1,id2)
	{
		if( transport==='peerjs')
			setup_peerjs(host,key,active,id1,id2);
		else if( transport==='websocket')
			setup_websocket(host,key,active,id1,id2);
	}
	
	function setup_websocket(host,key,active,id1,id2)
	{
		host = host.replace(/^http/,'ws')+'/peer';
		if( !id1 || !id2)
		{
			monitor.error('invalid id.');
			return false;
		}
		var time = 0,
			connected,
			ws; //connection
		connectws();
		
		next_frame=function(data)
		{
			ws.send(JSON.stringify({name:id1,target:id2,t:time,d:data}));
		}
		messenger.sender=function(mess)
		{
			ws.send(JSON.stringify({name:id1,target:id2,mm:mess}));
		}
		
		function connectws()
		{
			var retry;
			var num_tried=0;
			ws = new WebSocket(host);
			ws.onopen=function()
			{
				monitor.log('web socket opened');
				ws.send(JSON.stringify({open:'open',name:id1}));
				retry = setInterval(function(){
					monitor.log('initiate handshake...');
					if( retry)
						ws.send(JSON.stringify({name:id1,target:id2,m:'hi'})); //handshake
					if( num_tried++ >=9)
					{
						clearInterval(retry);
						retry = null;
						monitor.error('peer connection failed');
					}
				},1000);
			}
			ws.onclose=function()
			{
				monitor.log('socket closed');
			}
			ws.onmessage=function(mess)
			{
				var data = JSON.parse(mess.data);
				if( data.m==='hi')
				{
					ws.send(JSON.stringify({name:id1,target:id2,m:'hi back'})); //handshake
				}
				else if( data.m==='hi back')
				{
					if( data.name===id2 && !connected) //verify id
					{
						monitor.log('handshake success');
						connected = data.name;
						if( retry)
						{
							clearInterval(retry);
							retry = null;
						}
						dataframe(time,data.d);
						messenger_ready();
						success_callback();
					}
					else
					{
						monitor.error('unknown peer');
					}
				}
				else if( data.mm)
				{
					onmessage(data.mm);
				}
				else if( connected)
				{
					time++;
					dataframe(time,data.d);
				}
			}
		}
	}
	
	function setup_peerjs(host,key,active,id1,id2)
	{
		if( !id1 || !id2)
		{
			monitor.error('invalid id.');
			return false;
		}
		var open_once = false,
			time = 0,
			connected,
			peer = new Peer(id1, {host:host,debug:3,key:key,logFunction:logfun}),
			conn; //connection
		
		function logfun()
		{
			var err = false;
			var copy = Array.prototype.slice.call(arguments);
			copy.unshift('PeerJS: ');
			for (var i = 0, l = copy.length; i < l; i++){
				if (copy[i] instanceof Error) {
				copy[i] = '(' + copy[i].name + ') ' + copy[i].message;
				err = true;
				}
			}
			err ? monitor.error.apply(console, copy) : monitor.log.apply(console, copy);
		}
		
		next_frame=function(data)
		{
			conn.send(JSON.stringify({t:time,d:data}));
		}
		messenger.sender=function(mess)
		{
			conn.send(JSON.stringify({mm:mess}));
		}
		
		peer.on('open', function(id) {
			if( !open_once)
			{
				open_once = true;
				if( active)
					active_connect();
				else
					passive_connect();
			}
		});
		
		function active_connect()
		{
			//initiate a connection
			var retry, num_tried=0, success=false;
			retry = setInterval(function()
			{
				if( success) return;
				conn = peer.connect(id2);
				conn.on('close', function(){
					monitor.log('connection closed');
				});
				conn.on('error', function(e){
					monitor.error(e);
				});
				conn.on('open', function(){
					success = true;
					conn.send(JSON.stringify({m:'hi',id:id1})); //handshake
				});
				conn.on('data', ondata);
				
				if( num_tried++ >=9)
				{
					clearInterval(retry);
					retry = null;
					monitor.error('failed to connect to peer '+id2);
				}
			},2000);
		}
		
		function passive_connect()
		{
			//received a connection
			peer.on('connection', function(connect) {
				conn = connect;
				conn.on('close', function(){
					monitor.log('connection closed');
				});
				conn.on('error', function(e){
					monitor.error(e);
				});
				conn.on('data', ondata);
			});
		}
		
		function ondata(json)
		{
			var data = JSON.parse(json);
			if( data.m==='hi')
			{
				conn.send(JSON.stringify({name:id1,target:id2,m:'hi back'})); //handshake
			}
			else if( data.m==='hi back')
			{
				if( data.name===id2 && !connected) //verify id
				{
					monitor.log('handshake success');
					connected = data.name;
					dataframe(time,data.d);
					messenger_ready();
					success_callback();
				}
				else
				{
					monitor.error('unknown peer');
					conn.close();
				}
			}
			else if( data.mm)
			{
				onmessage(data.mm);
			}
			else if( connected)
			{
				time++;
				dataframe(time,data.d);
			}
		}
	}
	
	return {
		config:configer,
		setup_peer:setup_peer,
		setInterval:set_interval,
		clearInterval:clear_interval,
		messenger:messenger
	}
}

}(window));

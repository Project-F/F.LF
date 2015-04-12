/*\
 * states
 * - nested state transition system, a Hierarchical State Machine ( HSM )
 * - intuitive state machine definition syntax
 * - simple (not UML compatible) yet powerful enough for interactive gaming
 * - reduces logical bugs if used as a programming paradigm
| var state_config =
| {
| 	event:
| 	{
| 		entry: 'state1', //define the init state
| 		entry: function(), // OR use an init function
| 		{
| 			return 'state1';
| 		}
| 	},
| 
| 	state1:
| 	{
| 		event:
| 		{
| 			'event1': 'state2',  //name of target state
| 			//  on  :   to
| 
| 			'event2': function(state, //a reference to the `states` instance
| 							event,p1,p2) //event and its parameters
| 			{
| 				alert(this.name); //gives 'state1'
|				alert(this.data.data_of_state1); //give 'hello'
| 				return 'state2'; //the returned state name will cause a transition to that state, nothing will happen if returned null/undefined
| 			} //,,,
| 
| 			entry: function(state,event,prev_state) //called on enter state, passing in previous state
| 			{
| 				//some init
| 			},
| 
| 			exit: function, //called on leave state, passing in next state
| 
| 			'guard': function(state,event,p1,p2) //if you consult a particular event of a state, you get its return value without causing any state transition
| 			{
| 				return allow_transition(p1,p2);
| 			},
| 		},
| 
| 		data:
| 		{	//memory associated with each state
| 			data_of_state1: 'hello'
| 		},
| 
| 		state1_1:
| 		{
| 			event:
| 			{
| 				'event1':'state1',   //transit to superstate
| 				'event2':'state1_2', //to other state within a superstate
| 				'event3':'state2',   //out of the immediate superstate
| 			},
| 		},
| 
| 		state1_2: 
| 		{ //,,,
| 		},
| 
| 	},
| 
| 	state2:
| 	{
| 		//,,,
| 	} //,,, more states
| };
* 
* The critical feature of hierarchy is:
* - a state machine in a certain state is also in that state's superstate.
* - an event/consult is propagated to the superstate of current state until handled.
* - in a state transition, a machine must entry a state's superstate before entering that state.
* - in a state transition, a machine must exit the current state before exiting the current state's superstate.
 * see [sample](../sample/states.html)
\*/

define(['F.core/util'],function(F)
{

var state_list=[];
/*\
 * states
 [ class ]
 - states (object) state machine definition
 * or
 - config (object)
 * {
 - states (object) state machine definition
 - init (object) initializer object, content will be copied shallowly to `this` states
 * initialization is done before the state machine is setup and running
 * }
\*/
function states (config)
{
	// no private member
	/*\
	 * states.state
	 [ property ]
	 - (object) states tree, can be altered dynamically
	\*/
	if( config.states)
		this.state=config.states;
	else
		this.state=config;

	if( config.init)
		for( var Q in config.init)
			this[Q] = config.init[Q];

	this.state.name='root'; //build an accessible tree
	this.propagate_down(999,function(state,name,superstate){
		state.name=name;
		state.superstate=superstate;
	});

	/*\
	 * states.evlay
	 [ property ]
	 - (array) array of delayed events
	\*/
	this.evlay=new Array(20);
	for( var i=0; i<this.evlay.length; i++)
		this.evlay[i]={i:-1};

	/*\
	 * states.cur
	 * defines the path to current state
	 [ property ]
	 - (array)
	 |        cur=['state1','state1_1','state1_1_1'];
	 | represents   state1-> state1_1-> state1_1_1(cur is here)
	\*/
	this.cur=[];
	/*\
	 * states.cur_name
	 [ property ]
	 - (string) name of current state
	\*/
	this.cur_name='root';
	/*\
	 * states.cur_state
	 [ property ]
	 - (object) reference to the current state
	\*/
	this.cur_state=this.state;
	this.chain_event(true,this.cur,1,'entry',true,null);

	state_list.push(this); //the list of state objects

	/*\
	 * states.log_enable
	 [ property ]
	 - (boolean) not log by default
	\*/
	this.log_enable=false;
	/*\
	 * states.log_filter
	 [ property ]
	 - (function) a function to return true to not log an item
	\*/
	this.log_filter=null;
	/*\
	 * states.log_size
	 [ property ]
	 - (number) 100 lines by default
	\*/
	this.log_size=100;
	/** @property this.log the JSON object
	*/
	/*\
	 * states.log
	 [ property ]
	 - (array)
	 * log state transitions in form of
	 | [
	 |	{type:'t', from:path, to:path}, //transition
	 |	{type:'c', event:event, target:state, return:result}, //call
	 | ]
	\*/
	this.log=[];
}

/*\
 * states.propagate_down
 [ method ]
 * propagate an event from top to down, performing some computation on each node
 - level (number) max. no. of levels to go through
 - fun (function)
 - [node] (object) reference to a state object, like `state_config.state1.state1_1`,
 * if unspecified, assume from `root`
\*/
states.prototype.propagate_down=function(level,fun,node)
{
	if( level<=0)
		return;

	if(!node)
		node=this.state;

	for( var I in node)
	{
		if( this.valid_substate(I))
		{
			fun(node[I],I,node);
			this.propagate_down(level-1,fun,node[I]);
		}
	}
}

/*\
 * states.propagate_up
 [ method ]
 * propagate an event from a node to root, performing some computation on each node
 - level (number) max. no. of levels to go through
 - fun (function)
 - [node] (object) optional; if not specified assume from node of current state
\*/
states.prototype.propagate_up=function(level,fun,node)
{
	if(!node)
		node=this.cur_state;

	while(1)
	{
		if(level-- <= 0)
			break;

		fun(node);

		if(node.superstate)
			node = node.superstate;
		else
			break;
	}
}

states.prototype.chain_event=function(allow_transition,chain,TTL,event,down,sub, arg)
{
	var result={ result:null, absorbed:false};

	if( down)
	{
		var i=0;
		if( sub) i=sub;
		var I = this.state_at(chain.slice(0,i+1));
	}
	else
	{
		var i=chain.length-1;
		var I = this.state_at(chain);
	}
	for(;;)
	{
		result = this.execute_event(event,I,arg);

		if( result.absorbed)
		{
			if( allow_transition && result.result)
				this.to(result.result);
			if( --TTL <= 0)
				break;
		}

		if( down)
		{	//move down along tree
			if( i>=chain.length-1) break;
			if( I[chain[i+1]])
				I=I[chain[i+1]];
			else
				break;
			i++;
		}
		else
		{	//move up
			I=I.superstate;
			if( i<=0) break;
			if( sub && i<=sub) break;
			i--;
		}
	}
	return result; //return the most recent result
}

states.prototype.execute_event=function(event,state,arg)
{
	if( !arg)
		arg=[];
	var res={ result:null, absorbed:false};
	if( state.event)
	{
		var tar = state.event[event];
		if( tar)
		{
			res.absorbed=true;
			if( tar.prototype)
				//tar is a function object
				res.result = tar.apply(state, [this,event].concat(arg)); //call event function
			else    //tar is a string
				res.result = tar;
		}
	}

	if( this.log_enable)
	{	//logging
		var L = {type:'c', event:event, target:state.name, 'return':res};
		if( !this.log_filter || !this.log_filter(L))
		{
			this.log.push(L);
			if( this.log.length >= this.log_size)
				this.log.shift();
		}
	}

	return res;
}

/*\
 * states.event
 [ method ]
 * fire an event
 - event (string)
 - [arg] (any) extra args will be passed through to event handler of a state
\*/
states.prototype.event=function(event/*,arguments,,,*/)
{
	if( this.valid_event(event))
	{
		var chain=this.cur;
		this.chain_event(true,chain,1,event,false,null, Array.prototype.slice.call(arguments,1));
	}

	for( var I=0; I<this.evlay.length; I++)
	{
		if( this.evlay[I].frame == event)
		{
			if( this.evlay[I].i > -1)
				this.evlay[I].i--;
			if( this.evlay[I].i===0)
				this.event.apply(this, this.evlay[I].arg); //fire a delayed event
		}
	}
	/* TODO: return true if state transition happened*/
}

/*\
 * states.event_delay
 [ method ]
 * fire an event `event` after `delay` number of `frame` events
 - event (string)
 - delay (number)
 - frame (string)
 - [arg] (any) extra args will be passed through to event handler of a state
\*/
states.prototype.event_delay=function(event,delay,frame/*,arguments,,,*/)
{
	if( !this.valid_event(event))
		return;
	if( delay===0)
	{
		this.event.apply(this, [event].concat(Array.prototype.slice.call(arguments,3)) );
	}
	else
	{
		var res = F.arr_search( this.evlay, function(E){return E.i<=0;} );
		if( res == -1)
		{	//expand the array if all slots are full
			this.evlay.push();
			res = this.evlay.length-1;
		}
		this.evlay[res].event = event;
		this.evlay[res].i = delay;
		this.evlay[res].frame = frame;
		this.evlay[res].arg = [event].concat(Array.prototype.slice.call(arguments,3)); //preserve arguments
	}
}

/*\
 * states.consult
 * call an event handler and get its return value, without actually causing state transition
 [ method ]
 - consult_event (string) event name
 - [state] (object) optional; if unspecified will assume current state
 - [arg] (any) extra args will be passed through to event handler of a state
\*/
states.prototype.consult=function(consultant, state /*,arguments,,,*/)
{
	if( !this.valid_event(consultant))
		return null;
	var chain;
	if( !state)
		chain=this.cur;
	else
		chain=this.search(state);
	var result = this.chain_event(false,chain,1,consultant,false,null, Array.prototype.slice.call(arguments,2));
	return result.result;
}

/*\
 * states.state_at
 [ method ]
 = (object) state specified by path A
 | sta.state_at(['state1','state1_1','state1_1_1']);
\*/
states.prototype.state_at=function(A)
{
	var obj=this.state;
	for( var i=0; i<A.length; i++)
	{
		obj=obj[A[i]];
	}
	return obj;
}

/*\
 * states.search
 [ method ]
 * search for the path of a state
 - state (object)
 - [node] (object) only search under this node. if unspecified, assume `root`
 = (array) representing path
\*/
states.prototype.search=function(A,node)
{
	var path=new Array();
	if( node)
		path.push(node.name);
	else
	{	//if not specified, search in root
		node=this.state;
	}

	if( A=='root')
	{
		return [];
	}
	else if( node[A])
	{
		path.push(A);
		return path;
	}
	else
	{
		for( var I in node)
		{
			if( this.valid_substate(I))
			{
				var subsearch = this.search(A, node[I], I);
				if( subsearch)
					return path.concat(subsearch);
			}
		}
		return null;
	}
}

states.prototype.valid_substate=function(S)
{
	return !(	S===null   ||
			S=='event' ||
			S=='name'  ||
			S=='data'  ||
			S=='superstate'||
		0);
}

states.prototype.valid_event=function(E)
{
	return !(	E===null   ||
			E=='entry' ||
			E=='exit'  ||
		0);
}

states.prototype.to=function(target_name)
{
	var prev=this.cur_state;
	var A=this.cur;
	var B=this.search(target_name);
	if(!B)
		return;
	var a=0, b=0;
	var target=B;
	var target_state=this.state_at(target);

	for( var ai=0,bi=0; ai<A.length && bi<B.length; ai++, bi++)
	{
		if( A[ai]===B[bi])
		{
			a++; b++;
		}
		else
			break;
	}

	this.chain_event(false,A,999,'exit',false,a, [target_state]);
		if( this.log_enable)
		{	//logging
			var L = {type:'t', from:A, to:B};
			if( !this.log_filter || !this.log_filter(L))
			{
				this.log.push(L);
				if( this.log.length >= this.log_size)
					this.log.shift();
			}
		}
	this.chain_event(false,B,999,'entry',true,b, [prev]);

	this.cur=target;
	this.cur_name=target_name;
	this.cur_state=target_state;
}

/*\
 * states.show_log
 * show the log in human readable text
 [ method ]
 - [filter] (function) optional; return true to hide an item
 * sample log
| (oldest at top)
| call 'consultant' of A_1_1_1, returning hello
| call 'go' of A_1_1_1, returning A_2_1
| call 'exit' of A_1_1_1, returning undefined
| call 'exit' of A_1_1, returning undefined
| call 'exit' of A_1, returning undefined
| transition from A,A_1,A_1_1,A_1_1_1 to A,A_2,A_2_1
| call 'entry' of A_2, returning undefined
| call 'entry' of A_2_1, returning undefined
\*/
states.prototype.show_log=function(filter)
{
	var str='(oldest at top)\n';
	var L=this.log;
	for( var i=0; i<L.length; i++)
	{
		if( filter && filter(L[i]))
				continue;
		if( L[i].type=='t')
			str+= 'transition from '+L[i].from+' to '+L[i].to+'\n';
		else
		{
			str+= "call '"+L[i].event+"' of "+L[i].target+',';
			if( !L[i]['return'].absorbed)
				str+= ' not absorbed\n';
			else
				str+= ' returning '+L[i]['return'].result+'\n';
		}
	}
	return str;
}

return states;

});

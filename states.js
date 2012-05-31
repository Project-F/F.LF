//states: nested state transition system, a Hierarchical State Machine ( HSM )
/*	controls state transitions
 */
/*	require: F.js
 */
/*	sample state_config =
 	{
		event:
		{
			entry: 'state1', //define the init state
			entry: function(), // OR use an init function
			{
				return 'state1';
			}
		},

		state1:
		{
			event:
			{
				'event1': 'state2',  //name of target state
				//  on  :   to
				
				'event2': function(state, //a reference to the `states` instance
								event,p1,p2) //event and its parameters
				{
					alert(this.name); //gives 'state1', because `this` refers to the object in state_config
					return 'state2'; //the returned state name will cause a transition to that state, nothing will happen if returned null
				} ,,,
				
				entry: function(state,event,prev_state) //called on enter state, passing in previous state
				{
					//some init
				},
				
				exit: function, //called on leave state, passing in next state
				
				'consultant': function(p1,p2) //if you consult a particular event of a state, you get its return value without causing any state transition
				{
					return allow_entry(p1,p2);
				},
			},

			data:
			{	//memory associated with each state
				data_of_state1: value
			},

			state1_1:
			{
				event:
				{
					'event1':'state1',   //transit to superstate
					'event2':'state1_2', //to other state within a superstate
					'event3':'state2',   //out of the immediate superstate
				},
			},

			state1_2: { ,,, },
		
		},

		state2:
		{
			,,,
		} ,,, //more states
	};
 */
/*
 The critical feature of hierarchy is:
   -a state machine in a certain state is also in that state's superstate.
   -an event/consult is propagated to the superstate of current state until handled.
   -in a state transition, a machine must entry a state's superstate before entering that state.
   -in a state transition, a machine must exit the current state before exiting the current state's superstate.
 */
/*
 restrictions:
	-each state must have a unique name
 */
if( typeof F=='undefined') F=new Object;
if( typeof F.states=='undefined') //#ifndef
{

F.state_list=[];
F.states = function (state_config)
{
	//[--constructor
	//	no private member
	//	this.state can be altered dynamically
	this.state=F.extend_object({},state_config); //make a deep copy of the state tree

	this.state.name='root'; //build an accessible tree
	this.propagate_down(999,function(state,name,superstate){
		state.name=name;
		state.superstate=superstate;
	});

	this.evlay=new Array(20); //the array of delayed events 
	for( var i=0; i<this.evlay.length; i++)
		this.evlay[i]={i:-1};

	this.cur=['root']; //cur defines the path of current state,
			//e.g.   cur=['state1','state1_1','state1_1_1'];
			//represents   state1-> state1_1-> state1_1_1(cur is here)
	this.cur_name='root';
	this.cur_state=this.state; //a reference to the current state in state_config
	this.chain_event(true,this.cur,1,'entry');
	
	F.state_list.push(this); //the list of state objects
	
	this.log_enable=false;   //not log by default
	this.log_filter=null;	//a function to return true to not log an item
	this.log_size=100;
	this.log=new Array(this.log_size); //log state transitions in form of
		//[
		// {type:'t', from:path, to:path},
		// {type:'c', event:event, target:state, return:result},
		//];
	//--]
}

F.states.prototype.propagate_down=function(level,fun,node)
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

F.states.prototype.propagate_up=function(level,fun,node)
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

F.states.prototype.chain_event=function(allow_transition,chain,TTL,event/*,arguments,,*/)
{
	if( chain.length==0)
		return { result:null, absorbed:false};
	
	var I = this.state_at(this.search(chain[0]));
	var up = false; //up/ down chain
	if( chain[1]) if( I.superstate) if( chain[1]==I.superstate.name)
		up = true;
	
	var result={ result:null, absorbed:false};
	var arg = Array.prototype.slice.call(arguments,4);
	for( var i=0; i<chain.length; i++)
	{
		result = this.execute_event(event,I,arg);
		
		if( result.absorbed)
		{
			if( allow_transition && result.result)
				this.to(result.result);
			if( --TTL <= 0)
				break;
		}
		
		//[--move up or down along tree
		if( up)
			I=I.superstate;
		else
		{
			if( i<chain.length-1)
				if( I[chain[i+1]])
					I=I[chain[i+1]];
				else
					break;
		}//--]
	}
	return result; //return the most recent result
}

F.states.prototype.execute_event=function(event,state,arg)
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
			this.log.shift();
		}
	}

	return res;
}

F.states.prototype.event=function(event/*,arguments,,,*/)
{
	if( this.valid_event(event))
	{
		var chain=this.cur.slice(0);
		chain.reverse();
		this.chain_event.apply(this, [true,chain,1].concat(Array.prototype.slice.call(arguments,0)));
	}
	
	for( var I=0; I<this.evlay.length; I++)
	{
		if( this.evlay[I].frame == event)
		{
			if( this.evlay[I].i > -1)
				this.evlay[I].i--;
			if( this.evlay[I].i == 0)
				this.event.apply(this, this.evlay[I].arg); //fire a delayed event
		}
	}
	/* TODO: return true if state transition happened*/
}

F.states.prototype.event_delay=function(event,delay,frame/*,arguments,,,*/) //fire an event 'event' after 'delay' number of 'frame' events
{
	if( !this.valid_event(event))
		return;

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

F.states.prototype.consult=function(consultant,
			state //[optional] state name
			/*,arguments,,,*/) //[optional]
{
	if( !this.valid_event(consultant))
		return null;
	var chain;
	if( !state)
		chain=this.cur.slice(0);
	else
		chain=this.search(state);
	chain.reverse();
	var result = this.chain_event.apply(this, [false,chain,1,consultant].concat(Array.prototype.slice.call(arguments,2)));
	return result.result;
}

F.states.prototype.state_at=function(A) //return the state object of path array A
{
	var obj=this.state;
	for( var i=0; i<A.length; i++)
	{
		obj=obj[A[i]];
	}
	return obj;
}

F.states.prototype.search=function(A, //search for the path of state A
				node) //[optional] under node
				//return an Array representing path
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

F.states.prototype.valid_substate=function(S)
{
	return !(	S==null    ||
			S=='event' ||
			S=='name'  ||
			S=='data'  ||
			S=='superstate'||
		0);
}

F.states.prototype.valid_event=function(E)
{
	return !(	E==null    ||
			E=='entry' ||
			E=='exit'  ||
		0);
}

F.states.prototype.to=function(target_name)
{
	var prev=this.cur_state;
	var A=this.cur.slice();
	var B=this.search(target_name);
	var target=B.slice();
	if(!B)
		return;

	for( var ai=0,bi=0; ai<A.length && bi<B.length;)
	{
		if( A[ai]==B[bi])
		{
			A.shift(); B.shift();
		}
		else
		{
			ai++, bi++;
		}
	}
	A.reverse();
	
	var target_state=this.state_at(target);
	
	this.chain_event(false,A,999,'exit',target_state);
		if( this.log_enable)
		{	//logging
			var L = {type:'t', from:A, to:B};
			if( !this.log_filter || !this.log_filter(L))
			{
				this.log.push(L);
				this.log.shift();
			}
		}
	this.chain_event(false,B,999,'entry',prev);
	
	this.cur=target;
	this.cur_name=target_name;
	this.cur_state=target_state;
}

F.states.prototype.show_log=function(
	filter //[optional] return true to hide an item
){
	var str='(lastest at top)\n';
	var L=this.log;
	for( var i=L.length-1; i>=0; i--)
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

} //#endif

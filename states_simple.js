//states_simple: non-nested state transition system, a traditional finite state machine ( FSM )
/*	controls state transitions
 */
/*TODO: to maintain compatibility with states.js
 */
/*	sample state_config =
 	{
		event:
		{
			entry: 'state1', //define the init state
			entry: function(This, event), // OR use an init function
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

				'event2': function(This, //current state object
								event,p1,p2) //event and its parameters
				{
					return 'state2'; //the returned state name will cause a transition to that state,
					//nothing will happen if returned null
				} ,,,

				entry: function(This,event,prev_state) //called on enter state, passing in previous state
				{
					//some init
				},

				exit: function, //called on leave state, passing in next state

				'consultant': function(p1,p2) //if you consult a particular event of a state, you get its return value without causing any state transition
				{
					return allow_entry(p1,p2);
				},
			},

		} ,,, //more states
	};
 */
/*	public API: see each function definition for details
	states(state_config)	//constructor
	event(event)		//fire an event
	event_delay(event,delay,frame)	//fire a delayed event
	consult(event,state)	//call a function without causing state transition
 */

define(['F.core/util'],function(F)
{

function states (state_config)
{
	//[--constructor
	//	no private member
	//	this.state can be altered dynamically
	this.state=state_config;
	this.cur='';
	this.evlay=new Array(20);
	for( var i=0; i<this.evlay.length; i++)
		this.evlay[i]={i:-1};

	for ( var I in this.state) //initialize cur with the first state
		{ this.cur=I; break; }

	if( this.state.event)
	{	//call the init function and go to the defined init state
		var nes;
		var tar=this.state.event['entry'];
		if( tar)
		{
			if( tar.prototype)
				nes = tar(this.state,'entry');
			else
				nes = tar;
			if( nes)
			{
				if( this.state[nes])
				{
					this.cur = nes;
					if( this.state[nes].event)
					if( this.state[nes].event.entry)
						this.state[nes].event.entry(this.state[nes],'entry','root');
				}
			}
		}
	}
	//--]
}

states.prototype.event=function(E/*,arguments,,,*/) //supply events with parameters to F_states
//	return true if there is a state transition
{
	if( this.valid_event(event))
	{
		var result=false;
		if( this.state[this.cur].event)
		{
			var nes;
			var tar=this.state[this.cur].event[E];
			if( tar)
			{
				if( tar.prototype)
					//tar is a function object
					nes = tar.apply(this, [this.state[this.cur]].concat(arguments)); //call event function
				else    //tar is a string
					nes = tar;

				if( nes)
				{	//transits to target state
					if( this.state[nes])
					{
						var h_cur=this.cur;
						this.cur = nes;

						if( this.state[h_cur].event.exit)
							this.state[h_cur].event.exit(this.state[h_cur],'exit',nes);

						if( this.state[nes].event)
						if( this.state[nes].event.entry)
							this.state[nes].event.entry(this.state[nes],'entry',h_cur);
						result=true;
					}
				}
			}
		}
	}

	for( var I=0; I<this.evlay.length; I++)
	{
		if( this.evlay[I].frame == E)
		{
			if( this.evlay[I].i > -1)
				this.evlay[I].i--;
			if( this.evlay[I].i===0)
				this.event.apply(this, this.evlay[I].arg); //fire a delayed event
		}
	}
	return result;
}

states.prototype.consult=function(E,state_name/*,arguments,,,*/)
{
	if( !this.valid_event(E))
		return null;
	var target=state_name||this.cur;
	if( this.state[target] && this.state[target].event)
	{
		var nes;
		var tar=this.state[target].event[E];
		if( tar)
		{
			if( tar.prototype)
				//tar is a function object
				nes = tar.apply(this, [this.state[target],E].concat(Array.prototype.slice.call(arguments,2)));
			else    //tar is a string
				nes = tar;
			return nes;
		}
	}
	return null;
}

states.prototype.event_delay=function(event,delay,frame/*,arguments,,,*/) //fire an event 'event' after 'delay' number of 'frame' events
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

states.prototype.valid_event=function(E)
{
	return !(	E=='entry' ||
			E=='exit'  ||
			E===null   ||
		0);
}

return states;
});

define(['F.core/util'],function(F) //exports 2 classes `control_recorder` and `control_player` in an object
{

return {

/*\
 * control_recorder
 [ class ]
 * controller recorder to record activity of a controller
 - target_controller (object) target @controller
\*/
control_recorder: function(target_controller)
{
	this.time=0;
	this.rec= new Array();
	/*\
	 * control_recorder.key
	 * supply keys to control_recorder
	 [ method ]
	 - k (string) key name
	 - down (boolean)
	\*/
	this.key= function(k,down)
	{
		this.rec.push({t:this.time, k:k, d:down});
	}
	/*\
	 * control_recorder.frame
	 * a tick of time
	 [ method ]
	 * the recorder records in discrete time sequence, if your game is not exactly in discrete time,
	 * i.e. changes take effect __immdiately__ upon receiving key inputs rather than delayed until
	 * this next time unit, your game is said to be non-time-deterministic, and theoretically
	 * you cannot record and playback key inputs and receive __exact same__ result,
	 * but generally speaking if the recording fps is high enough the error will be small
	\*/
	this.frame= function()
	{
		this.time+=1;
	}
	/*\
	 * control_recorder.export_str
	 * export to JSON
	 [ method ]
	 = (string) JSON
	\*/
	this.export_str= function()
	{
		var str="";
		str+= '[\n';
		for( var i=0; i<this.rec.length; i++)
		{
			if( i!==0)
				str+= ',';
			str+= JSON.stringify(this.rec[i]);
		}
		str+= '\n]';
		this.rec=[];
		return str;
	}
	target_controller.child.push(this);
},

/*\
 * control_player
 * control player to playback activity of a controller
 [ class ]
 * compatible with @controller and please refer to controller for specification
 - control_config (object) config used for controller
 - record (array)
\*/
control_player: function(control_config, record)
{
	var I=0;
	var time=0;
	var rec=record;
	/*\
	 * control_player.state
	 - (object)
	 [ property ]
	\*/
	this.state= F.extend_object({},control_config);
	for ( var j in this.state)
		this.state[j]=0;
	/*\
	 * control_player.child
	 - (array)
	 [ property ]
	\*/
	this.child=[];
	/*\
	 * control_player.sync
	 - (boolean)
	 [ property ]
	\*/
	this.sync=false;
	/*\
	 * control_player.frame
	 * a tick of time
	 [ method ]
	\*/
	this.frame=function()
	{
		time++;
		if( this.sync===false)
			this.fetch();
	}
	/*\
	 * control_player.fetch
	 [ method ]
	\*/
	this.fetch=function()
	{
		for (; time===rec[I].t; I++)
		{
			for( var i in this.child)
				this.child[i].key(rec[I].k, rec[I].d);
			this.state[rec[I].k] = rec[I].d;

			if( I===rec.length-1)
				I=0;
		}
	}
	/*\
	 * control_player.clear_states
	 [ method ]
	\*/
	this.clear_states=function(){}
	/*\
	 * control_player.flush
	 [ method ]
	\*/
	this.flush=function(){}
}

}});

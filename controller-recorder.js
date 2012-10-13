/**	@fileOverview
	@description
	controller recorder and player
	to record and playback activity of a controller
 */

define(['core/F'],function(F) //exports 2 classes `control_recorder` and `control_player` in an object
{

return {

/**	@class
	control recorder
	@param target_controller
*/
control_recorder: function(target_controller)
{
	this.time=0;
	this.rec= new Array();
	/**	supply keys to control_recorder
		@function
	*/
	this.key= function(k,down)
	{
		this.rec.push({t:this.time, k:k, d:down});
	}
	/**	a tick of time
		@function
	*/
	this.frame= function()
	{
		this.time+=1;
	}
	/**	export to JSON
		@function
	*/
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

/**	@class
	control record playback
	compatible will controller
	@param control_config the config used for controller
	@param record
*/
control_player: function(control_config, record)
{
	var I=0;
	var time=0;
	var rec=record;
	this.state= F.extend_object({},control_config);
	for ( var j in this.state)
		this.state[j]=0;
	/**	@property control_player.child
	*/
	this.child=[];
	/**	@property control_player.sync
	*/
	this.sync=false;

	/**	a tick of time
		@function
	*/
	this.frame=function()
	{
		time++;
		if( this.sync===false)
			this.fetch();
	}
	/**	@function
	*/
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
	/**	@function
	*/
	this.clear_states=function(){}
	/**	@function
	*/
	this.flush=function(){}
}

}});
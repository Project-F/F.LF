/*\
 * combo detector
 * - listen key events and detect combo from a controller
 * - maintains a clean sequence of pressed keys and fire events when combo is detected
 * - LF2, KOF style combos
 * - eliminating auto-repeated keys
\*/

define( function(){

/*\
 * combodec
 [ class ]
 - controller (object) a reference to @controller
 - config (object)
 - combo (array) combo definition
|	var con_config=
|	{
|		up:'h',down:'n',left:'b',right:'m',def:'v',jump:'f',att:'d'
|		//,'control name':'control key',,,
|	}
|	var con = new controller(con_config);
|	var dec_config=
|	{
|		timeout: 30,  //[optional] time before clearing the sequence buffer in terms of frames
|		comboout: 15, //[optional] the max time interval between keys to make a combo,
|			//an interrupt is inserted when comboout expires
|		clear_on_combo: true, //[optional] if true, will clear the sequence buffer when a combo occur
|		callback: dec_callback, //callback function when combo detected
|		rp: {up:1,down:1,left:2,right:2,def:3,jump:1,att:5}
|			//[optional] max repeat count of each key, unlimited if not stated
|	};
|	var combo = [
|	{
|		name: 'blast',	//combo name
|		seq:  ['def','right','att'], //array of key sequence
|		maxtime: 10 //[optional] the max allowed time difference between the first and last key input
|		clear_on_combo: false, //[optional] override generic config
|	} //,,,
|	];
|	var dec = new combodec ( con, dec_config, combo);
|	function dec_callback(combo)
|	{
|		alert(combo);
|	}
 * 
 * [example](../sample/combo.html)
\*/
function combodec (controller, config, combo)
{
	/*\
	 * combodec.time
	 - (number) current time
	 [ property ]
	\*/
	this.time=1;
	/*\
	 * combodec.timeout
	 - (number) when to clear the sequence buffer
	 [ property ]
	\*/
	this.timeout=0;
	/*\
	 * combodec.comboout
	 - (number) when to interrupt the current combo
	 [ property ]
	\*/
	this.comboout=0;
	/*\
	 * combodec.con
	 - (object) parent controller
	 [ property ]
	\*/
	this.con=controller;
	/*\
	 * combodec.seq
	 - (array) the key input sequence. note that combodec logs key names rather than key stroke,
	 * i.e. `up`,`down` rather than `w`,`s`
	 - (object) each is `{k:key,t:time}`
	 * 
	 * will be cleared regularly as defined by `config.timeout` or `config.clear_on_combo`
	 [ property ]
	\*/
	this.seq=new Array();
	/*\
	 * combodec.config
	 - (object)
	 [ property ]
	\*/
	this.config=config;
	/*\
	 * combodec.combo
	 - (array) combo list
	 [ property ]
	\*/
	this.combo=combo;
	this.con.child.push(this);
}

/*\
 * combodec.key
 * supply keys to combodec
 [ method ]
 - k (string) key name
 - down (boolean)
 * note that it receives key name, i.e. `up`,`down` rather than `w`,`s`
\*/
combodec.prototype.key=function(K, down)
{
	if(!down)
		return;

	var seq=this.seq;

	var push=true;
	if( this.config.rp)
	{	//detect repeated keys
		for (var i=seq.length-1, cc=1; i>=0 && seq[i]==K; i--,cc++)
			if( cc>=this.config.rp[K])
				push=false;
	}

	//eliminate repeated key strokes by browser; discard keys that are already pressed down
	if( this.con.state[K])
		push=false;
	//  remarks: opera linux has a strange behavior that repeating keys **do** fire keyup events

	if( this.config.timeout)
		this.timeout=this.time+this.config.timeout;
	if( this.config.comboout)
		this.comboout=this.time+this.config.comboout;

	if( push)
		seq.push({k:K,t:this.time});

	if ( this.combo && push)
	{	//detect combo
		var C = this.combo;
		for (var i in C)
		{
			var detected=true;
			var j=seq.length-C[i].seq.length;
			if( j<0) detected=false;
			else for (var k=0; j<seq.length; j++,k++)
			{
				if( C[i].seq[k] !== seq[j].k ||
					(C[i].maxtime!==null && C[i].maxtime!==undefined && seq[seq.length-1].t-seq[j].t>C[i].maxtime))
				{
					detected=false;
					break;
				}
			}
			if( detected)
			{
				// console.log(C[i])
				this.config.callback(C[i]);
				if( C[i].clear_on_combo || (C[i].clear_on_combo!==false && this.config.clear_on_combo))
					this.clear_seq();
			}
		}
	}
}

/*\
 * combodec.clear_seq
 * clear the key sequence
 [ method ]
 * normally you would not need to call this manually
\*/
combodec.prototype.clear_seq=function()
{
	this.seq.length=0;
	this.timeout=this.time-1;
	this.comboout=this.time-1;
}

/*\
 * combodec.frame
 * a tick of time
 [ method ]
\*/
combodec.prototype.frame=function()
{
	if( this.time===this.timeout)
		this.clear_seq();
	if( this.time===this.comboout)
		this.seq.push({k:'_',t:this.time});
	this.time++;
}

return combodec;
});

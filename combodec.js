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
|		timeout: 30,  //time before clearing the sequence buffer in terms of frames
|		comboout: 15, //the max time interval between keys to make a combo
|		callback: dec_callback //callback function when combo detected
|		rp: {up:1,down:1,left:2,right:2,def:3,jump:1,att:5}
|			//[optional] max repeat count of each key, unlimited if not stated
|	};
|	var combo = [
|	{
|		name: 'blast',	//combo name
|		seq:  ['def','right','att'], //array of key sequence
|		interrupt: true //[optional] if true, will prevent other combo extending the current combo
|	} //,,,
|	];
|	var dec = new combodec ( con, dec_config, combo);
|	function dec_callback(combo)
|	{
|		alert(combo);
|	}
 * [example](../sample/combo.html)
 # <iframe src="../sample/combo.html" width="800" height="500"></iframe>
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
	 * 
	 * will be cleared regularly as defined by `config.timeout`
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

	this.timeout=this.time+this.config.timeout;
	this.comboout=this.time+this.config.comboout;

	if( push)
		seq.push(K);

	if ( this.combo && push)
	{	//detect combo
		var C = this.combo;
		for (var i in C)
		{
			var detected=true;
			for (var j=seq.length-C[i].seq.length, k=0; j<seq.length; j++,k++)
			{
				if( C[i].seq[k] !== seq[j])
				{
					detected=false;
					break;
				}
			}
			if( detected)
			{
				this.config.callback(C[i]);
				if( C[i].interrupt)
					this.seq.push('_');
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
		this.seq.push('_');
	this.time++;
}

return combodec;
});

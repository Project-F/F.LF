/*\
 * combo detector
 * - listen key events and detect combo from a controller
 * - maintains a clean sequence of pressed keys and fire events when combo is detected
 * - King of Fighter style combos
 * - eliminating auto-repeated keys
\*/

define( function(){

/*\
 * combodec
 [ class ]
 - controller (object) a reference to @controller
 - config (object)
 - combo (object) combo definition
|	var con_config=
|	{
|		up:'h',down:'n',left:'b',right:'m',def:'v',jump:'f',att:'d'
|		//,'control name':'control key',,,
|	}
|	var con = new controller(con_config);
|	var dec_config=
|	{
|		rp:     //[optional] max repeat count of each key, unlimited if not stated
|		timeout://time before clearing the sequence buffer in terms of frames
|		comboout: //the max time interval between keys to make a combo
|		callback: //callback function when combo detected
|	};
|	var combo = [
|	{
|		name: 'blast',	//combo name
|		seq:  ['def','right','att'], //array of key sequence
|		interrupt: true //[optional] if true, will prevent other combo extending the current combo
|	} //,,,
|	];
|	var dec = new combodec ( con, dec_config, combo);
 * [example](../sample/combo.html)
 # <iframe src="../sample/combo.html" width="800" height="500"></iframe>
\*/
function combodec (controller, config, combo)
{
	var framec=1;
	var outframe=0;
	var outcombo=0;
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
	 * combodec.callback
	 - (function)
	 [ property ]
	\*/
	this.callback=config.callback;
	/*\
	 * combodec.combo
	 - (array) combo list
	 [ property ]
	\*/
	this.combo=combo;
	this.con.child.push(this);

	/*\
	 * combodec.key
	 * supply keys to combodec
	 [ method ]
	 - k (string) key name
	 - down (boolean)
	 * note that it receives key name, i.e. `up`,`down` rather than `w`,`s`
	\*/
	this.key=function(K, down)
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

		outframe=framec+this.config.timeout;
		outcombo=framec+this.config.comboout;

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
					this.callback(C[i]);
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
	this.clear_seq=function()
	{
		this.seq.length=0;
	}

	/*\
	 * combodec.frame
	 * a tick of time
	 [ method ]
	\*/
	this.frame=function()
	{
		if( framec==outframe)
			this.clear_seq();
		if( framec==outcombo)
			this.seq.push('_');
		framec++;
	}
}

return combodec;
});

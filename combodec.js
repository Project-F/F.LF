/**	@fileOverview
	@description
	combo detection system
	maintains a clean sequence of pressed keys and fire event when combo detected
	@example
	config=
	{
		rp:     //[optional] max repeat count of each key, unlimited if not stated
		timeout://time before clearing the sequence buffer in terms of frames
		comboout: //the max time interval between keys to make a combo
		callback: //callback function when combo detected
		no_repeat_key: true //eliminate repeated key strokes by browser, does not work on Opera Linux
	};
	combo = [
		{
			name: 'blast',	//combo name
			seq:  ['def','right','att'], //array of key sequence
			interrupt: true, //[optional] if true, will prevent other combo extending the current combo
		},,,
	];
*/

define( function(){ //exports a class `combodec`


/**	@class
	no private member
*/
/**
	@constructor
	@param controller the F.controller object
	@param config
	@param combo combo definition
*/
function combodec (controller, config, combo)
{
	var framec=1;
	var outframe=0;
	var outcombo=0;
	this.con=controller;
	this.seq=new Array();
	this.config=config;
	this.callback=config.callback;
	this.combo=combo;
	this.con.child.push(this);

	/**	supply keys to combodec
		@function
		@param K key **name**
		@param down
	*/
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

		if( this.config.no_repeat_key)
		{
			if( this.con.state[K])
				push=false;
		}

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

	/**	clear sequence
		@function
	*/
	this.clear_seq=function()
	{
		this.seq.length=0;
	}

	/**	a tick of time passed
		@function
	*/
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

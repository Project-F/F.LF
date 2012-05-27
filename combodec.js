//require controller.js

//combo detection system
/*	maintains a clean sequence of pressed keys
	  and fire event when combo detected
 */
/*	sample config for F_combodec
	{
		rp:     //[optional] max repeat count of each key, unlimited if not stated
		timeout://time before clearing the sequence buffer in terms of frames
		comboout: //the max time interval between keys to make a combo
		callback: //callback function when combo detected
		no_repeat_key: true //eliminate repeated key strokes by browser, only works in firefox and chrome
	};
	var combo = [
		{
			name: 'blast ball',	//combo name
			seq:  ['def','right','att'], //array of key sequence
			interrupt: true, //[optional] if true, will prevent other combo extending the current combo
		},,,
	];
*/

if( typeof F=='undefined') F=new Object;
if( typeof F.combodec=='undefined') //#ifndef
{

F.combodec = function (controller, config, combo)
{
	var framec=1;
	var outframe=0;
	var outcombo=0;
	this.con=controller;
	this.seq=new Array();
	this.config=config;
	this.combo=combo;
	
	this.con.child.push(this);
	//
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
					if( C[i].seq[k] != seq[j])
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
	
	this.clear_seq=function()
	{
		this.seq.length=0;
	}
	
	this.frame=function()
	{
		if( framec==outframe)
			this.clear_seq();
		if( framec==outcombo)
			this.seq.push('_');
		framec++;
	}
}

} //#endif

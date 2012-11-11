/**	a match hosts a game
	a match is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
 */

define(['LF/factories','LF/scene'],function(factory)
{
	/** config =
	{
		stage, //the DOM element for attaching sprites
		state
	} */
	function match(config)
	{
		this.scene = new Scene();
		this.stage = config.stage;
		this.state = config.state;
	}

	match.prototype.start=function(init)
	{
		//set up players, etc
	}

	match.prototype.create=function(options,batch)
	{
		/** batch =
		[
			{
				num,		//[default=1] how many, will put in an array if more than one
				config,
				obj:{id,type,data}
			},,,
		] */

		var out=[];
		for( var i=0; i<batch.length; i++)
		{
			var B=batch[i];
			if( !B.num || B.num===1)
			{
				out.push(this.subcreate(B.config,B.obj));
			}
			else
			{
				var arr=[];
				for( var j=0; j<B.num; j++)
					arr.push(this.subcreate(B.config,B.obj));
				out.push(arr);
			}
		}
	}

	match.prototype.create_random()
	{
	}

	match.prototype.subcreate=function(config,obj)
	{
		if( !factory[obj.type])  return {};
		return new factory[obj.type]( config, obj.data, obj.id);
	}

	match.prototype.drop_weapons()
	{
		//a convenient wrapper over create_random
	}

	match.prototype.periodic_event(event)
	{
	}

	return match;
});

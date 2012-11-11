/**	object factories
	in data.js, you define a set of data files, they are actually like product designs.
	in here factories.js, you define the factories used to manufacture each type of object,
		living or dead.
	this might seems too much of abstraction in software architecturing,
		but once you grasp the concept, it should be neat and convenient
		to add custom object types.
 */

define(['LF/character','LF/lightweapon','LF/effects'],
function(character,lightweapon,effects)
{
	/** to manufacture an object a factory receives a config,
		which contains at least an `id` and `data`
	*/
	return {
		factory:
		{
			//type: factory
			'0': character,
			'1': lightweapon,
			'7': effects
		}
	}
});

/**	object factories
	in data.js, you define a set of data files, they are actually like product designs.
	in here factories.js, you define the factories used to manufacture each type of object,
		living or dead.
	this abstraction is to allow addition of new object types.
 */

define(['LF/character','LF/weapon','LF/effects'],
function(character,weapon,effects)
{
	/** to manufacture an object a factory receives a config, `id` and `data`
	*/
	return {
		character: character,
		lightweapon: weapon('lightweapon'),
		heavyweapon: weapon('heavyweapon'),
		//specialattack: specialattack,
		//baseball: baseball,
		//miscell: miscell,
		//drinks: drinks,
		effects: effects
	}
});

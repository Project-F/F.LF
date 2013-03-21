This is intended to be a guideline to developers who want to do development on F.LF

# Architecture
Let's have a top-down walk through the modules.
- `global.js` defines the global parameters
- `keychanger.js` is a small utility to change keys of a controller
- `loader.js`, `loader-build.js`, `loader-built.js` is to load data packages as defined by `data.js` using different schemes, one-by-one or in-a-batch.
- `match.js` is a generalization above game modes (e.g. VSmode, stagemode, battlemode)
	the life time of a `match` object represents the course of a match, from start when weapon drops to end all opponents killed.
	- `factories.js` / `match` does not have a direct view to all livingobject classes, and `factories` is responsible to list all available classes.
	- `character.js` is a generalization of all LF2 characters. `LFrelease/data/specification.js` specifies the exact property of a character
	- `weapon.js` is a generalization of `heavyweapon` and `lightweapon`.
		- `livingobject.js` is a template class. `character` and `weapon` each supply a template to `livingobject` and obtain a baked class. properties and methods are then appended to the class to obtain a fully functional `character` or `weapon` class.
			- `sprite.js` is a class to handle sprite animation needs in LF2.
			- `mechanics.js` is a state-less helper class to process all mechanics of `livingobject`.
	- `effects.js` handles all the visual effects.
	- `scene.js` maintains a graph of all livingobjects in the scene. collision detection is done by a scene query where livingobject query for intersection with other objects on the scene.
